const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove MobileBottomNav from before the footer
content = content.replace(
  '      </div>\n      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />\n\n      {/* Footer */}',
  '      </div>\n\n      {/* Footer */}'
);

// 2. Add MobileBottomNav after the scrollable area closing div
content = content.replace(
  '      </div>\n\n      {/* Scorecard Modal */}',
  '      </div>\n      {/* Bottom Nav (Flex None - Pinned to Bottom on Mobile) */}\n      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />\n\n      {/* Scorecard Modal */}'
);

fs.writeFileSync('src/App.tsx', content);
