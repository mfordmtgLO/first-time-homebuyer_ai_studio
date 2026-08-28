const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('EmailOutreachModal')) {
  content = content.replace(
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";',
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";\nimport { EmailOutreachModal } from "./EmailOutreachModal";'
  );
}

if (!content.includes('Mail')) {
  content = content.replace(
    'FileDown,\n  FileSpreadsheet,\n  TrendingUp,\n  Clock\n} from "lucide-react";',
    'FileDown,\n  FileSpreadsheet,\n  TrendingUp,\n  Clock,\n  Mail\n} from "lucide-react";'
  );
}

const stateToAdd = `  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);`;

content = content.replace(
  '  const [showCompareModal, setShowCompareModal] = useState(false);',
  stateToAdd
);

const emailButtonUI = `            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#C18C5D] text-[#C18C5D] hover:bg-[#C18C5D] hover:text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Agents</span>
            </button>
            <button
              onClick={handleExportCSV}`;

content = content.replace(
  '            <button\n              onClick={handleExportCSV}',
  emailButtonUI
);

const modalRender = `      {/* Side-by-Side Property Comparison Modal */}`;
const modalUI = `      <EmailOutreachModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        properties={filtered} 
      />\n\n      {/* Side-by-Side Property Comparison Modal */}`;

content = content.replace(modalRender, modalUI);

fs.writeFileSync(file, content);
