import React, { useState } from "react";
import { MessageSquare, Plus, Edit2, Trash2, Tag, Clock, ChevronRight, Save, X, MessageCircle } from "lucide-react";
import { SmsTemplate } from "../types";

interface SmsTemplateLibraryProps {
  templates: SmsTemplate[];
  onSaveTemplate: (template: SmsTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const CATEGORIES = [
  { value: 'new_lead', label: 'New Lead Intro' },
  { value: 'geomap_touch', label: '📍 GeoSphere / Map Touch' },
  { value: 'follow_up', label: 'Follow Up / Nurture' },
  { value: 'pre_approved', label: 'Pre-Approved / Home Hunt' },
  { value: 'in_escrow', label: 'In Escrow' },
  { value: 'post_close', label: 'Post-Close / Check-in' },
  { value: 'custom', label: 'Custom' },
];

export const SmsTemplateLibrary: React.FC<SmsTemplateLibraryProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<SmsTemplate>>({});

  const handleOpenEditor = (template?: SmsTemplate) => {
    if (template) {
      setEditingTemplate(template);
    } else {
      setEditingTemplate({
        title: '',
        content: '',
        category: 'new_lead',
        tags: [],
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingTemplate.title || !editingTemplate.content) return;
    
    const now = new Date().toISOString();
    const newTemplate: SmsTemplate = {
      id: editingTemplate.id || `sms-tpl-${Date.now()}`,
      title: editingTemplate.title!,
      content: editingTemplate.content!,
      category: editingTemplate.category as any || 'custom',
      tags: editingTemplate.tags || [],
      createdAt: editingTemplate.createdAt || now,
      updatedAt: now,
      ownerId: 'default'
    };

    onSaveTemplate(newTemplate);
    setIsEditing(false);
    setEditingTemplate({});
  };

  const filteredTemplates = filterCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Nurture Library</span>
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2D362E]">Pre-written SMS Templates</h2>
          <p className="text-xs text-[#5C6F60]">
            Manage, categorize, and deploy TCPA-compliant text message templates for high-speed lead follow-ups.
          </p>
        </div>
        <button
          onClick={() => handleOpenEditor()}
          className="px-4 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>New SMS Template</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            filterCategory === 'all' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white border border-[#EAE7E0] text-[#5C6F60] hover:bg-gray-50'
          }`}
        >
          All Templates
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterCategory === cat.value ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white border border-[#EAE7E0] text-[#5C6F60] hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#EAE7E0] rounded-3xl space-y-3">
          <MessageCircle className="w-12 h-12 text-[#8C9A8E] mx-auto opacity-50" />
          <h3 className="font-bold text-[#2D362E]">No templates found</h3>
          <p className="text-xs text-[#5C6F60]">Create your first pre-written text snippet to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-2xl border border-[#EAE7E0] p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {CATEGORIES.find(c => c.value === template.category)?.label || 'Custom'}
                    </span>
                    <h3 className="font-bold text-[#2D362E]">{template.title}</h3>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEditor(template)} className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteTemplate(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#F0EDF4] relative">
                  <MessageSquare className="w-4 h-4 text-[#D5D0C5] absolute top-3 right-3" />
                  <p className="text-xs text-[#5C6F60] pr-6 whitespace-pre-wrap line-clamp-4">
                    {template.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[#8C9A8E] pt-2 border-t border-[#F0EDF4]">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                <span>{template.content.length} chars</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#EAE7E0] shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0EDF4] pb-3">
              <h3 className="font-bold font-serif text-lg text-[#2D362E] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <span>{editingTemplate.id ? 'Edit' : 'Create'} SMS Template</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D362E]">Template Title</label>
                <input
                  type="text"
                  value={editingTemplate.title || ''}
                  onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                  placeholder="e.g. Initial Welcome & Blueprint Offer"
                  className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E] text-[#2D362E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D362E]">Category Stage</label>
                  <select
                    value={editingTemplate.category || 'new_lead'}
                    onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value as any})}
                    className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E] text-[#2D362E]"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Message Content</span>
                  <span className={`text-[10px] ${(editingTemplate.content?.length || 0) > 160 ? 'text-amber-600' : 'text-[#8C9A8E]'}`}>
                    {editingTemplate.content?.length || 0} / 160 chars (Segment {(Math.floor(((editingTemplate.content?.length || 0) - 1) / 160) || 0) + 1})
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={editingTemplate.content || ''}
                  onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                  placeholder="Hi [Name], this is Mike your local lender. Thanks for requesting the First-Time Buyer Blueprint..."
                  className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E] text-[#2D362E]"
                />
                <p className="text-[10px] text-[#5C6F60]">
                  Available dynamic variables: <code className="bg-gray-100 px-1 rounded">[Name]</code>, <code className="bg-gray-100 px-1 rounded">[AgentName]</code>, <code className="bg-gray-100 px-1 rounded">[City]</code>, <code className="bg-gray-100 px-1 rounded">[Tract]</code>, <code className="bg-gray-100 px-1 rounded">[Program]</code>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0EDF4] flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-gray-600 font-bold text-xs hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingTemplate.title || !editingTemplate.content}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
