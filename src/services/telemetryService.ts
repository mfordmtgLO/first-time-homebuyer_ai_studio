import * as Sentry from "@sentry/react";

export interface Breadcrumb {
  id: string;
  timestamp: string;
  category: "navigation" | "http" | "user-action" | "console" | "error" | "lifecycle" | "security";
  message: string;
  data?: any;
  level: "info" | "warning" | "error";
}

export interface CapturedErrorEvent {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  type: "react_error" | "unhandled_rejection" | "api_error" | "manual";
  url?: string;
  breadcrumbs: Breadcrumb[];
}

class TelemetryService {
  private breadcrumbs: Breadcrumb[] = [];
  private capturedErrors: CapturedErrorEvent[] = [];
  private maxBreadcrumbs = 100;
  private maxErrors = 50;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Check if Sentry DSN is available in env or local storage
    const sentryDsn = ((import.meta as any).env?.VITE_SENTRY_DSN) || localStorage.getItem("sentry_dsn");
    if (sentryDsn) {
      try {
        Sentry.init({
          dsn: sentryDsn,
          integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        this.addBreadcrumb(
          "lifecycle",
          "Sentry initialized successfully",
          { dsn: sentryDsn.substring(0, 10) + "..." },
          "info"
        );
      } catch (err) {
        console.warn("Failed to initialize Sentry SDK:", err);
      }
    }

    // Intercept window fetch for API request/response breadcrumbs and error tracking
    this.setupFetchInterceptor();

    // Listen for global unhandled rejections
    window.addEventListener("unhandledrejection", (event) => {
      const errorMsg =
        event.reason?.message || String(event.reason || "Unhandled Promise Rejection");
      this.captureException(new Error(errorMsg), "unhandled_rejection");
    });

    // Listen for global errors
    window.addEventListener("error", (event) => {
      this.captureException(
        event.error || new Error(event.message || "Global Window Error"),
        "react_error"
      );
    });

    this.addBreadcrumb(
      "lifecycle",
      "Telemetry & Diagnostic Breadcrumb Engine initialized",
      {},
      "info"
    );
  }

  public addBreadcrumb(
    category: Breadcrumb["category"],
    message: string,
    data?: any,
    level: Breadcrumb["level"] = "info"
  ) {
    const breadcrumb: Breadcrumb = {
      id: "bc_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      level,
    };

    this.breadcrumbs.unshift(breadcrumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(0, this.maxBreadcrumbs);
    }

    // Also send to Sentry if active
    try {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: level === "error" ? "error" : level === "warning" ? "warning" : "info",
      });
    } catch {
      // Sentry inactive
    }
  }

  public captureException(
    error: Error,
    type: CapturedErrorEvent["type"] = "manual",
    componentStack?: string
  ) {
    const errorEvent: CapturedErrorEvent = {
      id: "err_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message: error.message || "Unknown Error",
      stack: error.stack,
      componentStack,
      type,
      url: window.location.href,
      breadcrumbs: [...this.breadcrumbs.slice(0, 30)], // attach last 30 breadcrumbs
    };

    this.capturedErrors.unshift(errorEvent);
    if (this.capturedErrors.length > this.maxErrors) {
      this.capturedErrors = this.capturedErrors.slice(0, this.maxErrors);
    }

    this.addBreadcrumb(
      "error",
      `Exception captured [${type}]: ${error.message}`,
      { stack: error.stack },
      "error"
    );

    // Report to Sentry
    try {
      Sentry.captureException(error);
    } catch {
      // Sentry inactive
    }

    console.error(`[Telemetry Diagnostic Error] (${type}):`, error, {
      breadcrumbs: errorEvent.breadcrumbs,
    });
    return errorEvent;
  }

  public getRecentBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbs;
  }

  public getCapturedErrors(): CapturedErrorEvent[] {
    return this.capturedErrors;
  }

  public clearTelemetry() {
    this.breadcrumbs = [];
    this.capturedErrors = [];
    this.addBreadcrumb("lifecycle", "Telemetry logs cleared by user", {}, "info");
  }

  private setupFetchInterceptor() {
    try {
      const originalFetch = window.fetch;
      window.fetch = async (...args): Promise<Response> => {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof Request
              ? args[0].url
              : String(args[0]);
        const options = args[1] || {};
        const method = options.method || "GET";
        const startTime = performance.now();

        this.addBreadcrumb("http", `API Request: ${method} ${url}`, { method, url }, "info");

        try {
          const response = await originalFetch(...args);
          const duration = Math.round(performance.now() - startTime);

          if (!response.ok) {
            this.addBreadcrumb(
              "http",
              `API Error Response: ${response.status} ${response.statusText} for ${method} ${url} (${duration}ms)`,
              { status: response.status, statusText: response.statusText, url },
              "error"
            );
          } else {
            this.addBreadcrumb(
              "http",
              `API Success: ${response.status} ${method} ${url} (${duration}ms)`,
              { status: response.status, url, duration },
              "info"
            );
          }

          return response;
        } catch (err: any) {
          const duration = Math.round(performance.now() - startTime);
          this.addBreadcrumb(
            "http",
            `API Network Failure: ${method} ${url} - ${err.message} (${duration}ms)`,
            { error: err.message, url },
            "error"
          );
          this.captureException(err, "api_error");
          throw err;
        }
      };
    } catch (e) {
      console.warn("Telemetry: Could not intercept window.fetch", e);
    }
  }
}

export const telemetry = new TelemetryService();
