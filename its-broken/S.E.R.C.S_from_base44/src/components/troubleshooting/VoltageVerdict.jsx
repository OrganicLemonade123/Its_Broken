import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const statusConfig = {
  confirmed: {
    icon: CheckCircle2,
    color: '#22c55e',
    border: 'border-green-500/40',
    bg: 'bg-green-500/8',
    text: 'text-green-400',
    label: 'CONFIRMED',
  },
  rejected: {
    icon: XCircle,
    color: '#ef4444',
    border: 'border-red-500/40',
    bg: 'bg-red-500/8',
    text: 'text-red-400',
    label: 'REJECTED',
  },
  inconclusive: {
    icon: AlertTriangle,
    color: '#eab308',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/8',
    text: 'text-amber-400',
    label: 'INCONCLUSIVE',
  },
};

function ConfidenceDelta({ before, after }) {
  const diff = after - before;
  if (Math.abs(diff) < 2) return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  return diff > 0
    ? <div className="flex items-center gap-0.5 text-green-400 text-xs"><TrendingUp className="w-3.5 h-3.5" />+{diff}%</div>
    : <div className="flex items-center gap-0.5 text-red-400 text-xs"><TrendingDown className="w-3.5 h-3.5" />{diff}%</div>;
}

export default function VoltageVerdict({ verdict, isLoading }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 bg-[#12121a] border border-slate-800 rounded-xl p-6 flex items-center gap-4"
      >
        <div className="relative">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Cross-referencing voltage readings...</p>
          <p className="text-xs text-slate-500">Evaluating against expected ranges for each pathway</p>
        </div>
      </motion.div>
    );
  }

  if (!verdict) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4"
    >
      {/* Summary banner */}
      <div className="bg-[#12121a] border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">Voltage Analysis Complete</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{verdict.summary}</p>
      </div>

      {/* Per root cause verdicts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {verdict.pathways?.map((pathway, idx) => {
          const cfg = statusConfig[pathway.status] || statusConfig.inconclusive;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className={`bg-[#12121a] border ${cfg.border} rounded-xl p-4 relative overflow-hidden`}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${cfg.color} 0%, transparent 70%)` }}
              />

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  <span className={`text-xs font-bold ${cfg.text} tracking-wider`}>{cfg.label}</span>
                </div>
                <ConfidenceDelta before={pathway.confidence_before} after={pathway.confidence_after} />
              </div>

              <p className="text-xs text-slate-400 font-semibold mb-1 truncate">{pathway.root_cause_title}</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{pathway.reasoning}</p>

              {/* Flagged readings */}
              {pathway.flagged_readings?.length > 0 && (
                <div className="space-y-1">
                  {pathway.flagged_readings.map((fr, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/60 rounded-md px-2 py-1.5">
                      <span className="text-xs text-slate-400">{fr.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white">{fr.measured}</span>
                        <span className="text-slate-600 text-xs">vs</span>
                        <span className="font-mono text-xs text-slate-400">{fr.expected}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            fr.anomaly ? 'bg-red-400' : 'bg-green-400'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended next step */}
              {pathway.next_step && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500 uppercase mb-1">Next Step</p>
                  <p className="text-xs text-slate-300">{pathway.next_step}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}