import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  History, Mail, MessageSquare, ChevronDown, 
  CheckCircle2, Sparkles, X, Copy, Check
} from 'lucide-react';
import { OutreachLog, EmailHistoryItem, CapturedLead, RealEstateAgentProfile, LoanOfficerProfile } from '../types';

export interface UnifiedOutreachItem {
  id: string;
  timestamp: string;
  templateType: string;
  channel: 'gmail' | 'outlook' | 'portal_email' | 'sms' | 'nurture_auto' | 'custom' | 'system';
  subject?: string;
  recipientName?: string;
  recipientEmail?: string;
  notes?: string;
  sentBy?: string;
  flyerNames?: string[];
  status?: 'sent' | 'delivered' | 'opened' | 'drafted';
}

export interface OutreachHistoryBadgeProps {
  logs?: OutreachLog[];
  emailHistory?: EmailHistoryItem[];
  lead?: CapturedLead;
  agent?: RealEstateAgentProfile;
  lo?: LoanOfficerProfile;
  className?: string;
  compact?: boolean;
  showEmptyState?: boolean;
  labelPrefix?: string;
  align?: 'left' | 'center' | 'right';
}

export const OutreachHistoryBadge: React.FC<OutreachHistoryBadgeProps> = ({ 
  logs = [], 
  emailHistory = [],
  lead,
  agent,
  lo,
  className = '',
  compact = false,
  showEmptyState = true,
  labelPrefix,
  align = 'center'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [activeChannelFilter, setActiveChannelFilter] = useState<'all' | 'email' | 'gmail' | 'outlook' | 'sms'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize all history sources into a unified list, prioritizing emailHistory
  const unifiedItems = useMemo<UnifiedOutreachItem[]>(() => {
    const items: UnifiedOutreachItem[] = [];

    // Helper to check for existing close timestamp duplicate
    const hasDuplicate = (timestamp: string, title?: string) => {
      const targetTime = new Date(timestamp).getTime();
      return items.some(existing => {
        const existingTime = new Date(existing.timestamp).getTime();
        const sameTime = Math.abs(existingTime - targetTime) < 3000;
        return sameTime && (!title || existing.templateType === title || existing.subject === title);
      });
    };

    // 1. Lead emailHistory (Highest fidelity)
    if (lead?.emailHistory && Array.isArray(lead.emailHistory)) {
      lead.emailHistory.forEach(eh => {
        items.push({
          id: eh.id || `eh-${eh.timestamp}-${eh.templateType}`,
          timestamp: eh.timestamp,
          templateType: eh.templateType || 'Portal Email Template',
          channel: eh.channel || 'portal_email',
          subject: eh.subject,
          recipientName: eh.recipientName || lead.fullName,
          recipientEmail: eh.recipientEmail || lead.email,
          notes: eh.notes,
          sentBy: eh.sentBy,
          flyerNames: eh.flyerNames,
          status: eh.status || 'sent'
        });
      });
    }

    // 2. Direct emailHistory prop
    if (emailHistory && Array.isArray(emailHistory)) {
      emailHistory.forEach(eh => {
        if (!items.some(existing => existing.id === eh.id) && !hasDuplicate(eh.timestamp, eh.templateType)) {
          items.push({
            id: eh.id || `eh-${eh.timestamp}`,
            timestamp: eh.timestamp,
            templateType: eh.templateType || 'Portal Email Template',
            channel: eh.channel || 'portal_email',
            subject: eh.subject,
            recipientName: eh.recipientName || lead?.fullName || agent?.name,
            recipientEmail: eh.recipientEmail || lead?.email || agent?.email,
            notes: eh.notes,
            sentBy: eh.sentBy,
            flyerNames: eh.flyerNames,
            status: eh.status || 'sent'
          });
        }
      });
    }

    // 3. Lead outreachLogs (deduplicate against existing emailHistory)
    if (lead?.outreachLogs && Array.isArray(lead.outreachLogs)) {
      lead.outreachLogs.forEach(log => {
        if (!items.some(existing => existing.id === log.id) && !hasDuplicate(log.timestamp, log.templateName)) {
          const ch = log.channel === 'sms' ? 'sms' : (log.templateName?.toLowerCase().includes('gmail') ? 'gmail' : (log.templateName?.toLowerCase().includes('outlook') ? 'outlook' : 'portal_email'));
          items.push({
            id: log.id,
            timestamp: log.timestamp,
            templateType: log.templateName,
            channel: ch,
            subject: log.subject,
            recipientName: log.recipientName || lead.fullName,
            recipientEmail: lead.email,
            notes: log.notes,
            status: 'delivered'
          });
        }
      });
    }

    // 4. Lead nurtureSequenceLogs (automated drip steps)
    if (lead?.nurtureSequenceLogs && Array.isArray(lead.nurtureSequenceLogs)) {
      lead.nurtureSequenceLogs.forEach(nLog => {
        if (!items.some(existing => existing.id === nLog.id) && !hasDuplicate(nLog.sentAt, nLog.templateName)) {
          items.push({
            id: nLog.id,
            timestamp: nLog.sentAt,
            templateType: nLog.templateName || nLog.stageName || 'Weekly Nurture Drip',
            channel: 'nurture_auto',
            subject: nLog.emailSubject,
            recipientName: lead.fullName,
            recipientEmail: lead.email,
            status: nLog.status || 'sent'
          });
        }
      });
    }

    // 5. Lead text messaging & text nurture logs
    if (lead?.smsMessages && Array.isArray(lead.smsMessages)) {
      lead.smsMessages
        .filter(m => m.direction === 'outbound')
        .forEach(m => {
          if (!items.some(existing => existing.id === m.id) && !hasDuplicate(m.timestamp)) {
            items.push({
              id: m.id,
              timestamp: m.timestamp,
              templateType: m.attachmentTitle ? `SMS with ${m.attachmentTitle}` : 'Direct SMS Outreach',
              channel: 'sms',
              subject: undefined,
              recipientName: lead.fullName,
              recipientEmail: lead.phone,
              notes: m.text,
              status: m.status || 'delivered'
            });
          }
        });
    }

    if (lead?.textNurtureLogs && Array.isArray(lead.textNurtureLogs)) {
      lead.textNurtureLogs.forEach(tLog => {
        if (!items.some(existing => existing.id === tLog.id) && !hasDuplicate(tLog.sentAt, tLog.templateName)) {
          items.push({
            id: tLog.id,
            timestamp: tLog.sentAt,
            templateType: tLog.templateName || `SMS Nurture Step ${tLog.stepNumber}`,
            channel: 'sms',
            recipientName: lead.fullName,
            notes: tLog.messageText,
            status: tLog.status || 'delivered'
          });
        }
      });
    }

    // 6. Agent outreachLogs & emailHistory
    if (agent?.emailHistory && Array.isArray(agent.emailHistory)) {
      agent.emailHistory.forEach(eh => {
        if (!items.some(existing => existing.id === eh.id)) {
          items.push({
            id: eh.id,
            timestamp: eh.timestamp,
            templateType: eh.templateType,
            channel: eh.channel || 'portal_email',
            subject: eh.subject,
            recipientName: agent.name,
            recipientEmail: agent.email,
            notes: eh.notes,
            sentBy: eh.sentBy,
            flyerNames: eh.flyerNames,
            status: eh.status || 'sent'
          });
        }
      });
    }
    if (agent?.outreachLogs && Array.isArray(agent.outreachLogs)) {
      agent.outreachLogs.forEach(log => {
        if (!items.some(existing => existing.id === log.id) && !hasDuplicate(log.timestamp, log.templateName)) {
          items.push({
            id: log.id,
            timestamp: log.timestamp,
            templateType: log.templateName,
            channel: log.channel === 'sms' ? 'sms' : (log.templateName?.toLowerCase().includes('outlook') ? 'outlook' : (log.templateName?.toLowerCase().includes('gmail') ? 'gmail' : 'portal_email')),
            subject: log.subject,
            recipientName: agent.name,
            recipientEmail: agent.email,
            notes: log.notes,
            status: 'sent'
          });
        }
      });
    }

    // 7. LO outreachHistory & emailHistory
    if (lo?.emailHistory && Array.isArray(lo.emailHistory)) {
      lo.emailHistory.forEach(eh => {
        if (!items.some(existing => existing.id === eh.id)) {
          items.push({
            id: eh.id,
            timestamp: eh.timestamp,
            templateType: eh.templateType,
            channel: eh.channel || 'portal_email',
            subject: eh.subject,
            recipientName: lo.name,
            notes: eh.notes,
            sentBy: eh.sentBy,
            flyerNames: eh.flyerNames,
            status: eh.status || 'sent'
          });
        }
      });
    }
    if (lo?.outreachHistory && Array.isArray(lo.outreachHistory)) {
      lo.outreachHistory.forEach(oh => {
        if (!items.some(existing => existing.id === oh.id) && !hasDuplicate(oh.date, oh.subject)) {
          items.push({
            id: oh.id,
            timestamp: oh.date,
            templateType: oh.subject || (oh.type === 'sms' ? 'Recruiting SMS' : 'Recruiting Email'),
            channel: oh.type === 'sms' ? 'sms' : 'portal_email',
            subject: oh.subject,
            recipientName: lo.name,
            notes: oh.content,
            status: 'sent'
          });
        }
      });
    }

    // 8. Direct logs prop fallback
    if (logs && Array.isArray(logs)) {
      logs.forEach(log => {
        if (!items.some(existing => existing.id === log.id) && !hasDuplicate(log.timestamp, log.templateName)) {
          items.push({
            id: log.id,
            timestamp: log.timestamp,
            templateType: log.templateName,
            channel: log.channel === 'sms' ? 'sms' : 'portal_email',
            subject: log.subject,
            recipientName: log.recipientName,
            notes: log.notes,
            status: 'delivered'
          });
        }
      });
    }

    // Sort descending by timestamp (newest first)
    return items.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
  }, [lead, agent, lo, logs, emailHistory]);

  // Click outside listener when pinned
  useEffect(() => {
    if (!isPinned) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPinned]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 220);
  };

  const togglePinned = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(prev => !prev);
  };

  const handleCopyHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unifiedItems.length === 0) {
      navigator.clipboard.writeText(`No outreach history logged yet for ${recipientName}`);
      setCopiedId('all');
      setTimeout(() => setCopiedId(null), 1800);
      return;
    }
    const text = unifiedItems.map(item => {
      const date = new Date(item.timestamp).toLocaleString();
      const parts = [
        `[${item.channel.toUpperCase()}] ${date}`,
        `Template: ${item.templateType}`,
        item.subject ? `Subject: "${item.subject}"` : null,
        item.sentBy ? `Sent By: ${item.sentBy}` : null,
        item.flyerNames?.length ? `Flyers: ${item.flyerNames.join(', ')}` : null,
        item.notes ? `Notes: ${item.notes}` : null
      ].filter(Boolean);
      return parts.join(' | ');
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const recipientName = lead?.fullName || agent?.name || lo?.name || (unifiedItems[0]?.recipientName) || 'Individual';
  const recipientContact = lead?.email || agent?.email || lo?.email || lead?.phone || '';

  // Counts by channel
  const emailCount = unifiedItems.filter(i => i.channel === 'portal_email' || i.channel === 'nurture_auto' || i.channel === 'custom').length;
  const gmailCount = unifiedItems.filter(i => i.channel === 'gmail').length;
  const outlookCount = unifiedItems.filter(i => i.channel === 'outlook').length;
  const smsCount = unifiedItems.filter(i => i.channel === 'sms').length;

  const filteredItems = unifiedItems.filter(item => {
    if (activeChannelFilter === 'all') return true;
    if (activeChannelFilter === 'email') return item.channel === 'portal_email' || item.channel === 'nurture_auto' || item.channel === 'custom';
    if (activeChannelFilter === 'gmail') return item.channel === 'gmail';
    if (activeChannelFilter === 'outlook') return item.channel === 'outlook';
    if (activeChannelFilter === 'sms') return item.channel === 'sms';
    return true;
  });

  if (unifiedItems.length === 0 && !showEmptyState) {
    return null;
  }

  const latestItem = unifiedItems[0];
  const latestFormatted = latestItem ? new Date(latestItem.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

  const popoverAlignClass = 
    align === 'left' ? 'left-0' : 
    align === 'right' ? 'right-0' : 
    'left-1/2 -translate-x-1/2';

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Compact Badge / Label */}
      <button
        type="button"
        onClick={togglePinned}
        aria-expanded={isPinned || isHovered}
        title={unifiedItems.length > 0 ? "Hover to glance, click to pin open full outreach history log" : "Click or hover to inspect outreach history"}
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-150 cursor-pointer select-none shadow-2xs ${
          isPinned
            ? "bg-[#2D362E] text-white ring-2 ring-[#2D362E]/30"
            : isHovered
            ? "bg-slate-200/90 text-slate-800 border border-slate-300 shadow-xs scale-102"
            : unifiedItems.length === 0
            ? "bg-slate-50 text-slate-500 border border-dashed border-slate-300 hover:bg-slate-100 hover:text-slate-700"
            : "bg-white/95 text-slate-700 border border-slate-200/90 hover:bg-slate-100"
        } ${compact ? "py-0.5 px-2 text-[9px]" : ""}`}
      >
        <span className="flex items-center gap-1">
          {unifiedItems.length === 0 ? (
            <Mail className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
          ) : gmailCount > 0 ? (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-red-300" title="Includes Gmail dispatch" />
          ) : outlookCount > 0 ? (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ring-1 ring-blue-300" title="Includes Outlook dispatch" />
          ) : smsCount > 0 ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-emerald-300" title="Includes SMS touch" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D4E] ring-1 ring-[#4A5D4E]/40" title="Portal email touch" />
          )}
          {unifiedItems.length > 0 && (
            <History className={`w-3 h-3 ${isPinned ? "text-[#E7C19D]" : "text-slate-500 group-hover:text-slate-800"}`} />
          )}
        </span>

        <span>
          {labelPrefix ? `${labelPrefix} ` : ''}
          {unifiedItems.length === 0 ? '0 Touches' : `${unifiedItems.length} ${unifiedItems.length === 1 ? 'Touch' : 'Touches'}`}
        </span>

        {latestFormatted && !compact && unifiedItems.length > 0 && (
          <span className={`text-[9px] font-normal ${isPinned ? "text-slate-300" : "text-slate-400"}`}>
            • {latestFormatted}
          </span>
        )}

        <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-150 ${isPinned ? "rotate-180 text-amber-300" : "text-slate-400 opacity-60"}`} />
      </button>

      {/* Popover / Rollout Card (Displays on Hover OR when Click-Pinned) */}
      {(isHovered || isPinned) && (
        <div 
          className={`absolute top-full ${popoverAlignClass} mt-1.5 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center shrink-0">
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                  {recipientName}
                </h4>
                <p className="text-[9px] text-slate-500 flex items-center gap-1">
                  <span>Outreach Tracking Timeline</span>
                  <span>•</span>
                  <span className="font-semibold text-[#4A5D4E]">{unifiedItems.length} total</span>
                  {recipientContact && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{recipientContact}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyHistory}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Copy entire history log to clipboard"
              >
                {copiedId === 'all' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {isPinned && (
                <button
                  type="button"
                  onClick={() => setIsPinned(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close pinned rollout"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Channel Breakdown Chips (if items exist) */}
          {unifiedItems.length > 0 && (
            <div className="px-3 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-[10px]">
              <button
                type="button"
                onClick={() => setActiveChannelFilter('all')}
                className={`px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeChannelFilter === 'all'
                    ? "bg-[#2D362E] text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All ({unifiedItems.length})
              </button>

              {gmailCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChannelFilter('gmail')}
                  className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeChannelFilter === 'gmail'
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  <span>Gmail</span>
                  <span>({gmailCount})</span>
                </button>
              )}

              {outlookCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChannelFilter('outlook')}
                  className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeChannelFilter === 'outlook'
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <span>Outlook</span>
                  <span>({outlookCount})</span>
                </button>
              )}

              {emailCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChannelFilter('email')}
                  className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeChannelFilter === 'email'
                      ? "bg-[#4A5D4E] text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <span>Portal</span>
                  <span>({emailCount})</span>
                </button>
              )}

              {smsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveChannelFilter('sms')}
                  className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    activeChannelFilter === 'sms'
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <span>SMS</span>
                  <span>({smsCount})</span>
                </button>
              )}
            </div>
          )}

          {/* Body Content */}
          {unifiedItems.length === 0 ? (
            /* Empty State Popover Content */
            <div className="p-4 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                <Mail className="w-5 h-5 opacity-70" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">No Communications Logged Yet</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto mt-0.5">
                  No emails or SMS messages have been recorded for <strong className="text-slate-700">{recipientName}</strong> yet.
                </p>
              </div>
              <div className="text-[10px] bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-200 text-left space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#4A5D4E]" />
                  <span>Real-Time Outreach Logging</span>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-relaxed">
                  When emails (Gmail, Outlook, Portal templates) or SMS text messages are dispatched to this individual, every event, subject line, attached flyer, and timestamp will automatically log here in real-time.
                </p>
              </div>
            </div>
          ) : (
            /* Timeline Scroll List */
            <div className="max-h-80 overflow-y-auto p-2.5 space-y-2 divide-y divide-slate-100">
              {filteredItems.map((item, idx) => {
                const d = new Date(item.timestamp);
                const dateStr = !isNaN(d.getTime()) 
                  ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : item.timestamp;
                const timeStr = !isNaN(d.getTime())
                  ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
                  : '';

                return (
                  <div key={item.id || idx} className="pt-2 first:pt-0">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group/item">
                      {/* Channel Indicator Icon */}
                      <div className="pt-0.5 shrink-0">
                        {item.channel === 'gmail' ? (
                          <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center border border-red-200" title="Google Workspace Gmail API">
                            <Mail className="w-3 h-3" />
                          </div>
                        ) : item.channel === 'outlook' ? (
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200" title="Outlook Default Mailto Link">
                            <Mail className="w-3 h-3" />
                          </div>
                        ) : item.channel === 'sms' ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200" title="SMS Text Messaging">
                            <MessageSquare className="w-3 h-3" />
                          </div>
                        ) : item.channel === 'nurture_auto' ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200" title="Automated Nurture Sequence Drip">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center border border-[#4A5D4E]/30" title="Portal Email Dispatch">
                            <Mail className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[11px] font-bold text-slate-800 leading-snug break-words">
                            {item.templateType}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-semibold text-slate-500 block">
                              {dateStr}
                            </span>
                            {timeStr && (
                              <span className="text-[8px] text-slate-400 block font-mono">
                                {timeStr}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subject Line */}
                        {item.subject && (
                          <div className="text-[10px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            <span className="font-semibold text-slate-700">Subj:</span> {item.subject}
                          </div>
                        )}

                        {/* Dispatched by */}
                        {item.sentBy && (
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            Dispatched by <span className="font-medium text-slate-700">{item.sentBy}</span>
                          </div>
                        )}

                        {/* Attached Flyers */}
                        {item.flyerNames && item.flyerNames.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.flyerNames.map((fn, fIdx) => (
                              <span key={fIdx} className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                                📄 {fn}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes / Preview */}
                        {item.notes && (
                          <div className="text-[9.5px] text-slate-500 mt-1 italic line-clamp-2 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            "{item.notes}"
                          </div>
                        )}

                        {/* Channel & Status Badges */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            item.channel === 'gmail' ? 'bg-red-50 text-red-700 border border-red-200' :
                            item.channel === 'outlook' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            item.channel === 'sms' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            item.channel === 'nurture_auto' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.channel === 'gmail' ? 'Gmail API' :
                             item.channel === 'outlook' ? 'Default Outlook' :
                             item.channel === 'sms' ? 'SMS Text' :
                             item.channel === 'nurture_auto' ? 'Auto Drip' : 'Portal Email'}
                          </span>

                          {item.status && (
                            <span className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                              item.status === 'opened' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span className="capitalize">{item.status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <span>{isPinned ? "Pinned view (Click badge to toggle)" : "Hover to preview • Click to pin open"}</span>
            <span className="font-mono">Unified CRM Log</span>
          </div>
        </div>
      )}
    </div>
  );
};
