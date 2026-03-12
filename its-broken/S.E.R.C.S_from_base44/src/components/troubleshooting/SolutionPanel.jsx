import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Package, ArrowRight } from 'lucide-react';

export default function SolutionPanel({ solution }) {
  if (!solution) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-green-500/5 border border-green-500/20 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        </div>
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Solution
        </h4>
        {solution.estimated_time && (
          <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {solution.estimated_time}
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-300 mb-4">{solution.summary}</p>

      {/* Steps */}
      {solution.steps?.length > 0 && (
        <div className="space-y-2 mb-4">
          {solution.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3"
            >
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-400">{idx + 1}</span>
              </div>
              <p className="text-sm text-slate-300">{step}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Parts Needed */}
      {solution.parts_needed?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500 uppercase">Parts/Materials</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {solution.parts_needed.map((part, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-green-500/10 border border-green-500/20 rounded-md text-green-300"
              >
                {part}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}