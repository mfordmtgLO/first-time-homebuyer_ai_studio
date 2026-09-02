const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
if (!content.includes('teamStarStatus?:')) {
  content = content.replace(
    /isTeamMember\?: boolean;/,
    `isTeamMember?: boolean;\n  teamStarStatus?: 'red' | 'blue' | 'green';`
  );
  fs.writeFileSync('src/types.ts', content);
  console.log("types.ts updated");
}
