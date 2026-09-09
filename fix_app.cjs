const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the sed change
code = code.replace(/return \(\n    <>\n      <SEOSchemaInjector currentCounty="Multnomah County" appName="GrantMatch Homebuyer" \/>/g, 'return (');

// Now properly insert it just at the final return
code = code.replace(
`  return (
    <div className="h-[100dvh] w-full bg-[#F9F8F4]`,
`  return (
    <>
      <SEOSchemaInjector currentCounty="Multnomah County" appName="GrantMatch Homebuyer" />
      <div className="h-[100dvh] w-full bg-[#F9F8F4]`
);

// Close the fragment at the end of the file
code = code.replace(
`    </div>
  );
}

export default App;`,
`    </div>
    </>
  );
}

export default App;`
);

fs.writeFileSync('src/App.tsx', code);
