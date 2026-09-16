const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const regex = /  };\s*}\s*return p;\s*}\)\s*\);\s*};/g;

if (regex.test(code)) {
    code = code.replace(regex, '  };');
    fs.writeFileSync('src/components/PropertyTracker.tsx', code);
    console.log("Fixed regex 1");
} else {
    // Brute force exact block
    const block = `  };          }
        return p;
      })
    );
  };`;
    if (code.includes(block)) {
        code = code.replace(block, '  };');
        fs.writeFileSync('src/components/PropertyTracker.tsx', code);
        console.log("Fixed exact block");
    } else {
        console.log("Could not find the block to fix");
    }
}
