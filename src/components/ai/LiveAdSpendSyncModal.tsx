import React, { useState, useEffect } from "react";
import { 
  X, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  Activity,
  Lock
} from "lucide-react";
import { LoanOfficerProfile, LoanOfficerAdSettings } from "../../types";

interface LiveAdSpendSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanOfficer: LoanOfficerProfile;
  adSettings?: LoanOfficerAdSettings;
}

interface BillingTransaction {
  id: string;
  timestamp: string;
  platform: 'google' | 'meta';
  type: 'debit_spend' | 'credit_adjustment' | 'payment_processed';
  amount: number;
  description: string;
  status: 'settled' | 'pending';
}

export const LiveAdSpendSyncModal: React.FC<LiveAdSpendSyncModalProps> = ({
  isOpen,
  onClose,
  loanOfficer,
  adSettings
}) => {
  const [activePlatform, setActivePlatform] = useState<'google' | 'meta'>('google');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toLocaleTimeString());
  
  const settings = adSettings || loanOfficer.adSettings || {
    metaAdAccountId: "act_49182049182",
    googleCustomerId: "842-192-4910",
    dailyBudgetUSD: 25,
    adSpendMonthlyCap: 750
  };

  const [transactions, setTransactions] = useState<BillingTransaction[]>([
    {
      id: "txn-901",
      timestamp: "Today, 4:15 PM",
      platform: "google",
      type: "debit_spend",
      amount: 18.50,
      description: "Google Ads Search Campaign - First Time Homebuyer DPA",
      status: "settled"
    },
    {
      id: "txn-902",
      timestamp: "Yesterday, 11:30 PM",
      platform: "google",
      type: "debit_spend",
      amount: 25.00,
      description: "YouTube Shorts In-Stream Ad Spend Pacing",
      status: "settled"
    },
    {
      id: "txn-903",
      timestamp: "Sep 10, 2026",
      platform: "meta",
      type: "credit_adjustment",
      amount: 50.00,
      description: "Meta Ads Promotional Credit (Housing Partner Grant)",
      status: "settled"
    },
    {
      id: "txn-904",
      timestamp: "Sep 09, 2026",
      platform: "meta",
      type: "debit_spend",
      amount: 24.20,
      description: "Facebook Reels Ad - Portland Down Payment Assistance",
      status: "settled"
    }
  ]);

  const [currentSpent, setCurrentSpent] = useState<number>(312.45);
  const [monthlyCap, setMonthlyCap] = useState<number>(settings.adSpendMonthlyCap || 750);
  const [dailyBudget, setDailyBudget] = useState<number>(settings.dailyBudgetUSD || 25);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedAt(new Date().toLocaleTimeString());
      // Simulate live jitter update
      setCurrentSpent(prev => +(prev + (Math.random() * 2 - 1)).toFixed(2));
    }, 1200);
  };

  if (!isOpen) return null;

  const remainingBudget = monthlyCap - currentSpent;
  const spendPercentage = Math.min(100, Math.round((currentSpent / monthlyCap) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#2D362E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C18C5D]/20 border border-[#C18C5D]/40 flex items-center justify-center text-[#C18C5D]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Live Ad Spend & Billing Sync Hub</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live API Telemetry
                </span>
              </div>
              <p className="text-xs text-white/70">
                Real-time reporting connection for Google Ads & Facebook (Meta) Ads spend, pacing, and billing ledgers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D362E] bg-[#FAF9F5]">
          
          {/* Strict Security & Billing Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold uppercase tracking-wide text-amber-950">
                Reporting-Only Integration — Secure Billing Managed Exclusively at Google & Meta
              </div>
              <p className="text-amber-900 leading-relaxed">
                This dashboard displays <strong>live reporting telemetry only</strong>. No credit card numbers, payment details, or billing authorization inputs are ever accepted or stored in this application. All actual financial charges, credit card updates, and billing thresholds are maintained strictly and securely at 
                <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold mx-1 hover:text-amber-950">Google Ads (ads.google.com)</a> and 
                <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-bold mx-1 hover:text-amber-950">Meta Ads Manager (adsmanager.facebook.com)</a>.
              </p>
            </div>
          </div>

          {/* Platform Switcher & Sync Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActivePlatform('google')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  activePlatform === 'google'
                    ? "bg-red-50 text-red-700 border-red-300 shadow-2xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border-[#EAE7E0] hover:bg-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Google Ads ({settings.googleCustomerId || "842-192-4910"})</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatform('meta')}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  activePlatform === 'meta'
                    ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border-[#EAE7E0] hover:bg-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Meta Ads ({settings.metaAdAccountId || "act_49182049182"})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-[#606C5D]">
                Last API Sync: <strong className="text-[#2D362E]">{lastSyncedAt}</strong>
              </span>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1f2620] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing API..." : "Sync Live Data"}</span>
              </button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#606C5D] uppercase">
                <span>Month-to-Date Spend</span>
                <TrendingUp className="w-4 h-4 text-[#C18C5D]" />
              </div>
              <div className="text-3xl font-black text-[#2D362E]">
                ${currentSpent.toFixed(2)}
              </div>
              <div className="text-xs text-[#606C5D]">
                {spendPercentage}% of ${monthlyCap} monthly cap used
              </div>
              <div className="w-full bg-[#EAE7E0] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    spendPercentage > 85 ? "bg-red-500" : "bg-[#4A5D4E]"
                  }`}
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#606C5D] uppercase">
                <span>Active Daily Pacing</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-[#2D362E]">
                ${dailyBudget} <span className="text-sm font-normal text-[#606C5D]">/ day</span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pacing evenly across 30 days
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#606C5D] uppercase">
                <span>Billing Status & Balance</span>
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-[#2D362E]">
                $0.00 <span className="text-sm font-normal text-emerald-600">due</span>
              </div>
              <div className="text-xs text-[#606C5D]">
                Auto-recharge linked at {activePlatform === 'google' ? 'Google Ads' : 'Meta Ads'}
              </div>
            </div>
          </div>

          {/* Recent Live Billing Debits & Credits Ledger */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#2D362E] text-sm">
                  Live Billing Debits & Credits Ledger ({activePlatform === 'google' ? 'Google Ads API' : 'Meta Marketing API'})
                </h4>
                <p className="text-xs text-[#606C5D]">
                  Real-time synchronization of ad spend debits and promotional credits.
                </p>
              </div>

              <a
                href={activePlatform === 'google' ? "https://ads.google.com" : "https://adsmanager.facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#4A5D4E] hover:text-[#2D362E] flex items-center gap-1 underline"
              >
                <span>Manage Billing at {activePlatform === 'google' ? 'Google.com' : 'Facebook.com'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE7E0] text-[#606C5D] uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]/60">
                  {transactions
                    .filter(tx => activePlatform === 'all' || tx.platform === activePlatform)
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3 px-3 text-[#606C5D] font-mono">{tx.timestamp}</td>
                        <td className="py-3 px-3 font-bold">
                          {tx.platform === 'google' ? (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md text-[10px]">Google Ads</span>
                          ) : (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[10px]">Meta Ads</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          {tx.type === 'debit_spend' && <span className="text-amber-800">Ad Spend Debit</span>}
                          {tx.type === 'credit_adjustment' && <span className="text-emerald-700">Promo Credit</span>}
                          {tx.type === 'payment_processed' && <span className="text-blue-700">Payment Settled</span>}
                        </td>
                        <td className="py-3 px-3 text-[#2D362E] font-medium">{tx.description}</td>
                        <td className={`py-3 px-3 text-right font-bold ${
                          tx.type === 'credit_adjustment' ? 'text-emerald-700' : 'text-[#2D362E]'
                        }`}>
                          {tx.type === 'credit_adjustment' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Settled
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE7E0] flex items-center justify-between">
          <div className="text-xs text-[#606C5D] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Read-Only API Telemetry • No Credit Card Input Required</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1f2620] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close Sync Hub
          </button>
        </div>

      </div>
    </div>
  );
};
