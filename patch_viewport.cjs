const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetMainDiv = `<div className="min-h-screen bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased">`;

const replacementMainDiv = `<div className="h-[100dvh] w-full bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased overflow-hidden relative">
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative">`;

content = content.replace(targetMainDiv, replacementMainDiv);

// Now find where the footer ends and insert the closing div for the scroll wrapper before the bottom nav
const targetFooterEnd = `        </footer>
      )}`;

const replacementFooterEnd = `        </footer>
      )}
      </div>`;

content = content.replace(targetFooterEnd, replacementFooterEnd);

fs.writeFileSync('src/App.tsx', content);
