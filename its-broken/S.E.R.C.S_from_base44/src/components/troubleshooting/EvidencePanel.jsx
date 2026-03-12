import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckSquare, Wrench } from 'lucide-react';

export default function EvidencePanel({ evidence }) {
  if (!evidence) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
          Evidence Required
        </h4>
      </div>

      <div className="space-y-3">
        {/* Diagnostic Check */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Diagnostic Check</p>
              <p className="text-sm text-slate-200">{evidence.check}</p>
            </div>
          </div>
        </div>

        {/* Expected Result */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 uppercase mb-1">Expected Result if Confirmed</p>
          <p className="text-sm text-cyan-300 font-medium">{evidence.expected_result}</p>
        </div>

        {/* Tools Needed */}
        {evidence.tools_needed?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wrench className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase">Tools Required</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {evidence.tools_needed.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}