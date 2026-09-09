const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const target1 = `  const shareViaSMS = () => {
    const propertyLink = \`\${window.location.origin}\${window.location.pathname}\`;
    const message = \`Check out this property: \${property.address}, \${property.city}.\\n\\nView here: \${propertyLink}?property=\${property.id}\`;
    window.location.href = \`sms:?body=\${encodeURIComponent(message)}\`;
  };`;
  
const replacement1 = `  const shareViaSMS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const propertyLink = \`\${window.location.origin}\${window.location.pathname}\`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const separator = isIOS ? '&' : '?';
    const message = \`Check out this property: \${property.address}, \${property.city}.\\n\\nView here: \${propertyLink}?property=\${property.id}\`;
    window.location.href = \`sms:\${separator}body=\${encodeURIComponent(message)}\`;
  };`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
