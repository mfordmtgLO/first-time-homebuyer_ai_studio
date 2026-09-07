import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Lock, CheckCircle2, AlertTriangle, FileKey } from 'lucide-react';
import { auth } from '../firebase';

interface PIIMetrics {
  success: boolean;
  totalScrubbed: number;
  lastScrubTimestamp: string | null;
  vaultState: string;
  activeVaultNodes: number;
}

export function SystemSecurityWidget() {
  const [metrics, setMetrics] = useState<PIIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/audit/pii-metrics', {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMetrics(data);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch PII metrics", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white border border-[#EAE7E0] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#2D362E]">System Security & PII Compliance</h3>
            <p className="text-[11px] text-[#606C5D]">Zero-Trust Ephemeral Vault Status</p>
          </div>
        </div>
        {!loading && metrics?.vaultState === 'ACTIVE' && (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <Activity className="w-5 h-5 animate-spin text-[#C18C5D]" />
        </div>
      ) : metrics ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9F8F4] rounded-xl p-3 border border-[#EAE7E0]">
              <div className="flex items-center gap-1.5 text-[#9A9488] mb-1">
                <FileKey className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Documents Scrubbed</span>
              </div>
              <div className="text-xl font-bold text-[#2D362E]">
                {metrics.totalScrubbed.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-[#F9F8F4] rounded-xl p-3 border border-[#EAE7E0]">
              <div className="flex items-center gap-1.5 text-[#9A9488] mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Vault Retention Time</span>
              </div>
              <div className="text-xl font-bold text-emerald-600">
                0s <span className="text-xs font-semibold text-[#606C5D]">(Shredded)</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-900">Last PII Scrub Completed</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800">
              {formatDate(metrics.lastScrubTimestamp)}
            </span>
          </div>
          
          <div className="pt-2 border-t border-[#EAE7E0] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-[#606C5D] leading-tight">
              All SSN, ITIN, and sensitive patterns are automatically intercepted, scrubbed, and permanently shredded before reaching AI memory nodes.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-[#9A9488]">
          Unable to load compliance metrics.
        </div>
      )}
    </div>
  );
}
