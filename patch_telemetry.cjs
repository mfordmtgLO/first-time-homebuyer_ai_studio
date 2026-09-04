const fs = require('fs');
let code = fs.readFileSync('src/services/telemetryService.ts', 'utf8');

code = code.replace(
  '  private setupFetchInterceptor() {\n    const originalFetch = window.fetch;\n    window.fetch = async (...args): Promise<Response> => {',
  `  private setupFetchInterceptor() {
    try {
      const originalFetch = window.fetch;
      window.fetch = async (...args): Promise<Response> => {`
);

code = code.replace(
  '      };\n    };\n  }\n}',
  `      };
      };
    } catch (e) {
      console.warn("Telemetry: Could not intercept window.fetch (readonly in this environment)", e);
    }
  }
}`
);

fs.writeFileSync('src/services/telemetryService.ts', code);
