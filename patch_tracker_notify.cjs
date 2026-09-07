const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const oldToggle = `  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };`;

const newToggle = `  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Agent Co-branding Notification Workflow
    const prop = properties.find(p => p.id === id);
    if (prop && !prop.isFavorite) {
      // It's being favorited
      alert(\`🤖 SYSTEM AUTOMATION: SMS SENT TO CO-BRANDED PARTNER\\n\\nTo: \${agent.name} (\${agent.phone || 'Agent'})\\n\\nMessage: "Hey \${agent.name.split(' ')[0]}, your buyer \${clientName.split(' ')[0]} just Favorited \${prop.title} on their portal. Their LO (Mike) has them pre-approved for up to $\${(Math.round(prop.price * 1.2)).toLocaleString()}. Give them a call to schedule a tour!"\`);
    }

    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };`;

if (c.includes(oldToggle)) {
  c = c.replace(oldToggle, newToggle);
  fs.writeFileSync('src/components/PropertyTracker.tsx', c);
} else {
  console.log("Could not find toggleFavorite");
}
