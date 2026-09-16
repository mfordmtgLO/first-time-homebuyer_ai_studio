const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const badSyntax = `        }
        return p;
      })
    );
  };          }
        return p;
      })
    );
  };`;

const goodSyntax = `        }
        return p;
      })
    );
  };`;

// Also check for a slightly different bad syntax shape that might exist
const alternativeBadSyntax = `  };          }
        return p;
      })
    );
  };`;

if (code.includes(badSyntax)) {
  code = code.replace(badSyntax, goodSyntax);
  fs.writeFileSync('src/components/PropertyTracker.tsx', code);
  console.log("Fixed syntax using exact match");
} else if (code.includes(alternativeBadSyntax)) {
  code = code.replace(alternativeBadSyntax, `  };`);
  fs.writeFileSync('src/components/PropertyTracker.tsx', code);
  console.log("Fixed syntax using alternative match");
} else {
  // Let's do line manipulation
  const lines = code.split('\n');
  let resultLines = [];
  let skipLines = 0;
  for (let i = 0; i < lines.length; i++) {
    if (skipLines > 0) {
      skipLines--;
      continue;
    }
    
    // Check if lines[i] has `};          }`
    if (lines[i].includes('};          }')) {
       resultLines.push(lines[i].replace('};          }', '  };'));
       // skip the next 4 lines
       skipLines = 4;
       console.log("Found line to fix at", i);
    } else {
       resultLines.push(lines[i]);
    }
  }
  fs.writeFileSync('src/components/PropertyTracker.tsx', resultLines.join('\n'));
  console.log("Fixed syntax using line-by-line replacement");
}

