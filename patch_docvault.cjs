const fs = require('fs');
const file = 'src/components/DocumentVault.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  'import { GoogleDriveDocImporterModal } from "./GoogleDriveDocImporterModal";',
  `import { GoogleDriveDocImporterModal } from "./GoogleDriveDocImporterModal";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRef } from "react";`
);

// State
content = content.replace(
  'const [previewingDoc, setPreviewingDoc] = useState<DocumentItem | null>(null);',
  `const [previewingDoc, setPreviewingDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const firebaseUploadRef = useRef<HTMLInputElement>(null);

  const handleFirebaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Convert to Base64 for Knowledge Ingest
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          resolve(result.split(",")[1]); // just the base64 part
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // 2. Upload to Firebase Storage
      const storageRef = ref(storage, \`documents/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 3. Ingest into RAG (Vector DB)
      const ingestRes = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64Data,
          mimeType: file.type || "application/octet-stream"
        })
      });
      if (!ingestRes.ok) {
        console.warn("Failed to ingest document into AI Vector DB");
      }

      // 4. Add to DocumentVault list
      const newDoc: DocumentItem = {
        id: \`fb-\${Date.now()}\`,
        title: file.name,
        category: "Property & Contract", // default
        required: false,
        status: "ready",
        description: \`Uploaded via Firebase Storage (\${file.type})\`,
        acceptedFormats: "PDF, TXT",
        fileUrl: downloadUrl,
        importedFrom: "google_drive" // reusing this style for delete button
      };

      setDocuments(prev => [newDoc, ...prev]);

    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (firebaseUploadRef.current) firebaseUploadRef.current.value = "";
    }
  };`
);

// Buttons
const uploadButton = `
            {/* Firebase Upload Trigger */}
            <input
              type="file"
              ref={firebaseUploadRef}
              onChange={handleFirebaseUpload}
              accept=".pdf,.txt,.csv,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => firebaseUploadRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 text-emerald-700" />
              <span>{isUploading ? "Uploading..." : "Upload File & AI Context"}</span>
            </button>
`;
content = content.replace(
  '{/* Import from Google Drive / Docs Trigger */}',
  uploadButton + '\n            {/* Import from Google Drive / Docs Trigger */}'
);

fs.writeFileSync(file, content);
