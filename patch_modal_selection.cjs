const fs = require('fs');
const file = 'src/components/EmailOutreachModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const effect = `  useEffect(() => {
    if (isOpen) {
      setSelectedAgentEmails(agentProperties.map(a => a.email));
    }
  }, [isOpen, agentProperties]);

  if (!isOpen) return null;`;

content = content.replace(
  '  if (!isOpen) return null;',
  effect
);

fs.writeFileSync(file, content);
