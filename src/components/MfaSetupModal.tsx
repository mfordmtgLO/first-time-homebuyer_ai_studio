import React, { useState, useEffect, useRef } from "react";
import { 
  multiFactor, TotpMultiFactorGenerator, PhoneAuthProvider, 
  PhoneMultiFactorGenerator, RecaptchaVerifier 
} from "firebase/auth";
import { auth } from "../firebase";
import { QRCodeSVG } from "qrcode.react";
import { X, Smartphone, ShieldCheck, QrCode } from "lucide-react";

interface MfaSetupModalProps {
  onClose: () => void;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ onClose }) => {
  const [method, setMethod] = useState<"select" | "totp" | "sms">("select");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // TOTP State
  const [totpSecret, setTotpSecret] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // SMS State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [verificationId, setVerificationId] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, []);

  const handleStartTotp = async () => {
    setMethod("totp");
    setLoading(true);
    setError(null);
    try {
      const mfaUser = multiFactor(auth.currentUser!);
      const session = await mfaUser.getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setTotpSecret(secret);
      
      const email = auth.currentUser?.email || "Admin";
      const url = `otpauth://totp/BranchManagement:\${email}?secret=\${secret.secretKey}&issuer=BranchManagement`;
      setQrCodeUrl(url);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to start Authenticator setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, totpCode);
      const mfaUser = multiFactor(auth.currentUser!);
      await mfaUser.enroll(assertion, 'Authenticator App');
      alert("Authenticator App successfully linked!");
      onClose();
    } catch (err: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSms = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    try {
      const mfaUser = multiFactor(auth.currentUser!);
      const session = await mfaUser.getSession();
      
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: session
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        window.recaptchaVerifier
      );
      
      setVerificationId(verId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send SMS code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySms = async () => {
    if (!smsCode || smsCode.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, smsCode);
      const assertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      const mfaUser = multiFactor(auth.currentUser!);
      await mfaUser.enroll(assertion, 'Phone Number');
      alert("Phone Number successfully linked for 2FA!");
      onClose();
    } catch (err: any) {
      setError("Invalid SMS code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7E0] flex items-center justify-between bg-[#FDFBF7]">
          <h3 className="font-bold text-[#2D362E] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Set Up 2-Factor Authentication
          </h3>
          <button onClick={onClose} className="p-2 text-[#9A9488] hover:bg-[#EAE7E0] rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div id="recaptcha-container"></div>
          
          {error && (
            <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          {method === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-[#606C5D] mb-4">
                Secure your admin account by requiring a second step when you sign in. Choose your preferred method below.
              </p>
              
              <button 
                onClick={handleStartTotp}
                className="w-full flex items-center gap-4 p-4 border border-[#EAE7E0] rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
              >
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-[#2D362E]">Authenticator App</div>
                  <div className="text-xs text-[#606C5D]">Google Authenticator, Authy, etc.</div>
                </div>
              </button>

              <button 
                onClick={() => setMethod("sms")}
                className="w-full flex items-center gap-4 p-4 border border-[#EAE7E0] rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-[#2D362E]">Text Message (SMS)</div>
                  <div className="text-xs text-[#606C5D]">Receive a 6-digit code to your phone</div>
                </div>
              </button>
            </div>
          )}

          {method === "totp" && step === 2 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <p className="text-sm text-[#606C5D]">
                Scan this QR code with your Authenticator app.
              </p>
              
              <div className="p-4 bg-white border border-[#EAE7E0] rounded-xl shadow-sm inline-block">
                {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} size={160} />}
              </div>

              <div className="w-full mt-4 space-y-2">
                <label className="text-xs font-bold text-[#2D362E] text-left block">Enter the 6-digit code from the app</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleVerifyTotp}
                disabled={loading || totpCode.length < 6}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 mt-4"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          )}

          {method === "sms" && step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#606C5D]">
                Enter your mobile number including the country code (e.g., +15551234567).
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D362E] block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+15551234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleStartSms}
                disabled={loading || !phoneNumber}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-4"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {method === "sms" && step === 2 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <p className="text-sm text-[#606C5D]">
                We sent a text message to <strong>{phoneNumber}</strong>.
              </p>

              <div className="w-full mt-4 space-y-2">
                <label className="text-xs font-bold text-[#2D362E] text-left block">Enter the 6-digit code</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleVerifySms}
                disabled={loading || smsCode.length < 6}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-4"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
