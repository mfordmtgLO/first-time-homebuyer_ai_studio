const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyReportModal.tsx', 'utf8');

code = code.replace(
  /<img\s*src=\{property\.imageUrl\}\s*alt=\{property\.title\}\s*className="w-full h-full object-cover"/g,
  `<img src={property.images?.length ? property.images[0] : property.imageUrl} alt={property.title} className="w-full h-full object-cover"`
);
code = code.replace(
  /<img\s*src=\{property\.imageUrl\}\s*alt="[^"]*"\s*className="w-full h-full object-cover"/g,
  `<img src={property.images?.length ? property.images[0] : property.imageUrl} alt="Property" className="w-full h-full object-cover"`
);
fs.writeFileSync('src/components/PropertyReportModal.tsx', code);
