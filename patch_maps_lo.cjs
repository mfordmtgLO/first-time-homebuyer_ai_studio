const fs = require('fs');
let code = fs.readFileSync('src/components/TaskManagementPanel.tsx', 'utf8');

const target = `<div className="flex items-center gap-2 mt-1.5 bg-white px-2 py-1 rounded-lg border border-[#EAE7E0] w-fit">
                      <Building className="w-3 h-3 text-indigo-500" />
                      <span className="text-xs font-medium text-[#2D362E]">{item.propertyAddress} {item.propertyPrice ? \`- $\${item.propertyPrice.toLocaleString()}\` : ''}</span>
                    </div>`;

const replacement = `<div className="flex items-center gap-2 mt-1.5 bg-white px-2 py-1 rounded-lg border border-[#EAE7E0] w-fit hover:border-indigo-300 transition-colors">
                      <Building className="w-3 h-3 text-indigo-500" />
                      <a 
                        href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(item.propertyAddress + (item.propertyCity ? ', ' + item.propertyCity : ''))}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1.5"
                        title="View Property on Google Maps"
                      >
                        {item.propertyAddress} {item.propertyPrice ? \`- $\${item.propertyPrice.toLocaleString()}\` : ''}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/TaskManagementPanel.tsx', code);
