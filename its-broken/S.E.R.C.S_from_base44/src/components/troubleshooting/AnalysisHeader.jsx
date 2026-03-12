import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Thermometer, Wifi, Server, Activity } from 'lucide-react';

const systemIcons = {
  electrical: Zap,
  hvac: Thermometer,
  it: Wifi,
  bacnet: Server,
};

const systemColors = {
  electrical: '#eab308',
  hvac: '#06b6d4',
  it: '#8b5cf6',
  bacnet: '#22c55e',
};

export default function AnalysisHeader({ symptom, systemType }) {
  const Icon = systemIcons[systemType] || Zap;
  const color = systemColors[systemType] || '#eab308';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#12121a] border border-slate-800 rounded-xl p-4"
    >
      <div className="flex items-start gap-4">
        {/* Status indicator */}
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: color }}
          >
            <Activity className="w-2.5 h-2.5 text-black" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Active Analysis</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
          <p className="text-white font-medium truncate">{symptom}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-400">Symptom captured</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs text-amber-400">3 root causes identified</span>
            </div>
          </div>
        </div>

        {/* SERCS Progress */}
        <div className="hidden md:flex items-center gap-1">
          {['S', 'E', 'R', 'C', 'S'].map((letter, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-orange-500 text-black' :
                idx === 1 ? 'bg-cyan-500 text-black' :
                idx === 2 ? 'bg-amber-500 text-black' :
                idx === 3 ? 'bg-amber-500/50 text-amber-200' :
                'bg-green-500/30 text-green-300'
              }`}
            >
              {letter}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}