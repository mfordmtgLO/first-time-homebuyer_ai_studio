import React, { useState } from 'react';
import { Database, FileText, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { DocumentItem } from '../types';

interface RAGDocumentsWidgetProps {
  documents: DocumentItem[];
  setDocuments?: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
}

export const RAGDocumentsWidget: React.FC<RAGDocumentsWidgetProps> = ({ documents, setDocuments }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const firebaseDocs = documents.filter(d => d.importedFrom === 'firebase');
  
  if (firebaseDocs.length === 0) return null;

  const handleDelete = (id: string) => {
    if (setDocuments) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleEditStart = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  const handleEditSave = (id: string) => {
    if (setDocuments && editTitle.trim()) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, title: editTitle.trim() } : d));
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EAE7E0] mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2D362E]">AI Knowledge Base (RAG)</h3>
          <p className="text-xs text-[#606C5D]">Uploaded documents actively processed for Copilot context.</p>
        </div>
      </div>

      <div className="space-y-3">
        {firebaseDocs.map(doc => (
          <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] hover:bg-white transition-colors">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-[#606C5D] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {editingId === doc.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 min-w-0 bg-white border border-[#EAE7E0] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#4A5D4E]"
                      autoFocus
                    />
                    <button onClick={() => handleEditSave(doc.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#2D362E] truncate">{doc.title}</h4>
                    <button onClick={() => handleEditStart(doc)} className="p-1 text-[#9A9488] hover:text-[#4A5D4E] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#606C5D]">{doc.description}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                    <Database className="w-3 h-3" />
                    RAG Indexed
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EAE7E0]">
               {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#4A5D4E] hover:underline px-3 py-1.5 bg-white border border-[#EAE7E0] rounded-lg">
                    View
                  </a>
               )}
               <button onClick={() => handleDelete(doc.id)} className="p-2 text-[#9A9488] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
