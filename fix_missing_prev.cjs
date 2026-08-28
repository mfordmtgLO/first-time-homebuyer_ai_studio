const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target1 = `            setNewAgentForm(prev => ({
              
              name: p.name || prev.name,`;

const rep1 = `            setNewAgentForm(prev => ({
              ...prev,
              name: p.name || prev.name,`;
content = content.replace(target1, rep1);

const target2 = `            setNewLoForm(prev => ({
              
              name: p.name || prev.name,`;
const rep2 = `            setNewLoForm(prev => ({
              ...prev,
              name: p.name || prev.name,`;
content = content.replace(target2, rep2);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
