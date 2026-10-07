import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isTwilioLiveEnabled,
  checkBuyerSmsConsent,
  attemptTwilioSmsDispatch,
} from "../services/twilioGateService";
import { handleIncomingTwilioWebhook } from "../services/smsSyncService";

describe("Twilio Dormancy & Consent Gate Verification Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.TWILIO_LIVE_SENDS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ---------------------------------------------------------------------------
  // T1: Gate Status Check — Dormant by Default
  // ---------------------------------------------------------------------------
  it("T1: isTwilioLiveEnabled returns false when TWILIO_LIVE_SENDS is unset or non-true", () => {
    delete process.env.TWILIO_LIVE_SENDS;
    expect(isTwilioLiveEnabled()).toBe(false);

    process.env.TWILIO_LIVE_SENDS = "false";
    expect(isTwilioLiveEnabled()).toBe(false);

    process.env.TWILIO_LIVE_SENDS = "0";
    expect(isTwilioLiveEnabled()).toBe(false);

    process.env.TWILIO_LIVE_SENDS = "true";
    expect(isTwilioLiveEnabled()).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // T2: Gate Closed -> ZERO api.twilio.com calls, returns 403 twilio_dormant
  // ---------------------------------------------------------------------------
  it("T2: With Twilio credentials present but gate closed, attemptTwilioSmsDispatch blocks send with 403 and zero fetch calls", async () => {
    delete process.env.TWILIO_LIVE_SENDS;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const auditLogs: any[] = [];
    const auditLogger = async (evt: string, meta: any) => {
      auditLogs.push({ evt, meta });
    };

    const result = await attemptTwilioSmsDispatch({
      to: "+15038493478",
      from: "+15035550199",
      body: "Price drop test message",
      accountSid: "AC_TEST_SID_12345",
      authToken: "AUTH_TOKEN_TEST_67890",
      isBuyer: true,
      auditLogger,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("twilio_dormant");
    expect(result.httpStatus).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    // Check audit log
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].evt).toBe("twilio_dormant_skipped");
  });

  // ---------------------------------------------------------------------------
  // T3: Inbound Webhook handles message but performs ZERO outbound sends
  // ---------------------------------------------------------------------------
  it("T3: Inbound webhook records message into Firestore thread but sends ZERO outbound SMS calls when dormant", async () => {
    delete process.env.TWILIO_LIVE_SENDS;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // Mock Firestore
    const mockMessages: any[] = [];
    const mockPendingItems: any[] = [
      {
        id: "item_1",
        leadName: "Buyer Test",
        status: "pending",
        tcpaSmsOptIn: true,
        tcpaPhoneProvided: "+15415550188",
      },
    ];

    const mockDoc = {
      id: "conv_123",
      data: () => ({
        messages: mockMessages,
        pendingActionItems: mockPendingItems,
      }),
    };

    const mockDocRef = {
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          messages: mockMessages,
          pendingActionItems: mockPendingItems,
        }),
      }),
      update: vi.fn().mockImplementation(async (updates) => {
        if (updates.messages) mockMessages.push(...updates.messages);
      }),
      set: vi.fn(),
    };

    const mockDb = {
      collection: vi.fn().mockImplementation((name: string) => {
        if (name === "loan_officers") {
          return {
            get: vi.fn().mockResolvedValue({
              docs: [
                { data: () => ({ name: "Mike Ford", phone: "503-849-3478" }) },
              ],
            }),
          };
        }
        if (name === "property_conversations") {
          return {
            limit: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ docs: [mockDoc] }),
            }),
            doc: vi.fn().mockReturnValue(mockDocRef),
          };
        }
        if (name === "twilio_vault") {
          return {
            get: vi.fn().mockResolvedValue({ docs: [] }),
          };
        }
        return { get: vi.fn().mockResolvedValue({ docs: [] }) };
      }),
    };

    // Provide mock firestore to adminApp
    const adminApp = { name: "test-admin", firestore: () => mockDb };
    const req = {
      body: {
        From: "+15038493478",
        To: "+15035550199",
        Body: "Yes, pre-approval looks great!",
      },
    };

    const res = {
      type: vi.fn().mockReturnThis(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Execute webhook handler
    await handleIncomingTwilioWebhook(req, res, adminApp, (v: string) => v);

    // Verify response sent as TwiML
    expect(res.type).toHaveBeenCalledWith("text/xml");
    expect(res.send).toHaveBeenCalledWith("<Response></Response>");

    // Verify ZERO outbound Twilio fetch calls were made
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // T4: Consent Contract — TWILIO_LIVE_SENDS=true but NO consent -> blocked (403)
  // ---------------------------------------------------------------------------
  it("T4: When TWILIO_LIVE_SENDS=true, outbound send to buyer with NO consent is blocked with consent_blocked", async () => {
    process.env.TWILIO_LIVE_SENDS = "true";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const auditLogs: any[] = [];
    const auditLogger = async (evt: string, meta: any) => {
      auditLogs.push({ evt, meta });
    };

    // Mock Firestore with no consent
    const mockDb = {
      collection: vi.fn().mockImplementation((name: string) => {
        if (name === "leads") {
          return {
            get: vi.fn().mockResolvedValue({
              docs: [
                {
                  id: "lead_noconsent",
                  data: () => ({
                    phone: "+15415550188",
                    smsConsentAuthorized: false, // NOT authorized
                    createdAt: "2026-08-01T00:00:00Z",
                  }),
                },
              ],
            }),
          };
        }
        return {
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
            }),
          }),
          limit: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
          }),
          get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
        };
      }),
    };

    const consentCheck = await checkBuyerSmsConsent("+15415550188", mockDb);
    expect(consentCheck.hasConsent).toBe(false);

    const dispatchResult = await attemptTwilioSmsDispatch({
      to: "+15415550188",
      from: "+15035550199",
      body: "Hello unconsented lead",
      accountSid: "AC_LIVE_TEST",
      authToken: "TOKEN_LIVE_TEST",
      isBuyer: true,
      dbInstance: mockDb,
      auditLogger,
    });

    expect(dispatchResult.success).toBe(false);
    expect(dispatchResult.error).toBe("consent_blocked");
    expect(dispatchResult.httpStatus).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    expect(auditLogs.some((l) => l.evt === "consent_blocked")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // T5: Consent Contract — TWILIO_LIVE_SENDS=true WITH consent on file -> allowed
  // ---------------------------------------------------------------------------
  it("T5: When TWILIO_LIVE_SENDS=true and valid consent is on file, send proceeds to Twilio API", async () => {
    process.env.TWILIO_LIVE_SENDS = "true";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sid: "SM_TEST_SUCCESS_123",
        status: "queued",
        to: "+15415550188",
        from: "+15035550199",
        date_created: new Date().toISOString(),
      }),
    } as any);

    const mockDb = {
      collection: vi.fn().mockImplementation((name: string) => {
        if (name === "leads") {
          return {
            get: vi.fn().mockResolvedValue({
              docs: [
                {
                  id: "lead_consented",
                  data: () => ({
                    phone: "+15415550188",
                    smsConsentAuthorized: true,
                    smsConsentTimestamp: "2026-08-25T14:20:08Z",
                    smsConsentSource: "Web Intake Form",
                  }),
                },
              ],
            }),
          };
        }
        return {
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
            }),
          }),
          limit: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
          }),
          get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
        };
      }),
    };

    const consentCheck = await checkBuyerSmsConsent("+15415550188", mockDb);
    expect(consentCheck.hasConsent).toBe(true);

    const dispatchResult = await attemptTwilioSmsDispatch({
      to: "+15415550188",
      from: "+15035550199",
      body: "Price drop on your favorited home!",
      accountSid: "AC_LIVE_TEST_VALID",
      authToken: "TOKEN_LIVE_TEST_VALID",
      isBuyer: true,
      dbInstance: mockDb,
    });

    expect(dispatchResult.success).toBe(true);
    expect(dispatchResult.messageSid).toBe("SM_TEST_SUCCESS_123");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain("https://api.twilio.com/2010-04-01/Accounts/AC_LIVE_TEST_VALID/Messages.json");
  });
});
