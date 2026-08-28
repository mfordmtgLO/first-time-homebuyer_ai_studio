const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf8');
if (!types.includes('export interface EmailTemplate')) {
  types += `\n
export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string; // HTML string
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}
`;
  fs.writeFileSync('src/types.ts', types);
}
