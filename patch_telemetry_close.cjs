const fs = require('fs');
let code = fs.readFileSync('src/services/telemetryService.ts', 'utf8');

code = code.replace(
  '    };\n  }\n}',
  `    };
    } catch (e) {
      console.warn("Telemetry: Could not intercept window.fetch", e);
    }
  }
}`
);

fs.writeFileSync('src/services/telemetryService.ts', code);
