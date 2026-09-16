const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const badBlock = `          }
        return p;
      })
    );
  };`;

// We have duplicate code injected by the patch. Let's find it.
const searchBlock = `    );
  };          }
        return p;
      })
    );
  };`;

if (code.includes(searchBlock)) {
  code = code.replace(searchBlock, `    );\n  };`);
  fs.writeFileSync('src/components/PropertyTracker.tsx', code);
  console.log("Fixed PropertyTracker.tsx duplicate curly brace issue");
} else {
  // alternative cleanup
  const manualFix = code.replace(/  const toggleRateAlert = \([\s\S]*?}\n        return p;\n      \)\n    \);\n  };\s*}\n        return p;\n      \)\n    \);\n  };/gm, 
  `  const toggleRateAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isEnabled = !p.rateAlertEnabled;
          if (isEnabled && onTriggerToast) {
            onTriggerToast("Mortgage Rate Shift alerts enabled for " + p.address + "!");
          }
          return { ...p, rateAlertEnabled: isEnabled };
        }
        return p;
      })
    );
  };`);
  if (manualFix !== code) {
    fs.writeFileSync('src/components/PropertyTracker.tsx', manualFix);
    console.log("Fixed PropertyTracker.tsx via regex manual fix");
  } else {
    console.log("Regex replace failed, try something else");
  }
}
