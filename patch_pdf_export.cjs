const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { jsPDF } from "jspdf"')) {
  content = content.replace(
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";',
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";\nimport html2canvas from "html2canvas";\nimport { jsPDF } from "jspdf";'
  );
}

if (!content.includes('FileDown')) {
  content = content.replace('ExternalLink\n} from "lucide-react";', 'ExternalLink,\n  FileDown\n} from "lucide-react";');
}

const stateToAdd = `  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("property-report-content");
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Property-Pipeline-Report.pdf");
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };`;

content = content.replace(
  '  const [showCompareModal, setShowCompareModal] = useState(false);',
  stateToAdd
);

const buttonsToAdd = `          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-stone-50 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Export to PDF"}</span>
            </button>`;

content = content.replace(
  '<div className="flex items-center gap-3">',
  buttonsToAdd
);

const reportWrapperStart = `      </div>

      <div id="property-report-content" className="p-4 bg-white/50 rounded-xl">
      {/* Listing Agent Distribution Chart */}`;

content = content.replace(
  `      </div>

      {/* Listing Agent Distribution Chart */}`,
  reportWrapperStart
);

const reportWrapperEnd = `      </div>
      
      {showCompareModal && comparedProperties.length > 0 && (`;

content = content.replace(
  `      </div>

      {showCompareModal && comparedProperties.length > 0 && (`,
  reportWrapperEnd
);

fs.writeFileSync(file, content);
