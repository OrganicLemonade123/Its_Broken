import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  Wrench,
  Search,
  Target,
  Layers
} from 'lucide-react';
import EvidencePanel from './EvidencePanel';
import SolutionPanel from './SolutionPanel';
import TroubleshootingFlow from './TroubleshootingFlow';

const severityConfig = {
  critical: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  high: { color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  medium: { color: '#eab308', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  low: { color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
};

export default function RootCauseNode({ rootCause, index, isSelected, onSelect }) {
  const [showFlow, setShowFlow] = React.useState(false);
  const [flowComplete, setFlowComplete] = React.useState(null);
  const severity = severityConfig[rootCause.severity?.toLowerCase()] || severityConfig.medium;
  const confidence = rootCause.confidence || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Pulsing glow effect */}
      <div 
        className="absolute -inset-0.5 rounded-xl opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${severity.color}20 0%, transparent 70%)`,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      
      <motion.div
        layout
        onClick={onSelect}
        className={`relative bg-[#12121a] border rounded-xl cursor-pointer transition-all overflow-hidden ${
          isSelected ? severity.border + ' ' + severity.bg : 'border-slate-800 hover:border-slate-700'
        }`}
        whileHover={{ scale: 1.01 }}
      >
        {/* Confidence bar at top */}
        <div className="h-1 bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            className="h-full"
            style={{ background: severity.color }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="relative w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${severity.color}20` }}
              >
                <Target className="w-4 h-4" style={{ color: severity.color }} />
                {/* Pulse ring */}
                <div 
                  className="absolute inset-0 rounded-lg animate-ping opacity-30"
                  style={{ background: severity.color }}
                />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Root Cause #{index + 1}</span>
                <div className={`text-xs font-medium ${severity.text} uppercase`}>
                  {rootCause.severity}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{confidence}%</div>
              <div className="text-xs text-slate-500">confidence</div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold mb-2">{rootCause.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{rootCause.description}</p>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3 text-cyan-500" />
              <span>Evidence needed</span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="w-3 h-3 text-green-500" />
              <span>{rootCause.solution?.estimated_time || 'Varies'}</span>
            </div>
          </div>

          {/* Expand indicator */}
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-slate-800">
            <motion.div
              animate={{ rotate: isSelected ? 180 : 0 }}
              className="flex items-center gap-1 text-slate-500"
            >
              <span className="text-xs">{isSelected ? 'Collapse' : 'Expand details'}</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                <EvidencePanel evidence={rootCause.evidence} />
                <SolutionPanel solution={rootCause.solution} />
                
                {!showFlow && !flowComplete && (
                  <button
                    onClick={() => setShowFlow(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Start Guided Troubleshooting
                  </button>
                )}

                {showFlow && (
                  <TroubleshootingFlow 
                    rootCause={rootCause}
                    onComplete={(result) => {
                      setFlowComplete(result);
                      setShowFlow(false);
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}