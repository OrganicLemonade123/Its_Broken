import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Thermometer, Wifi, Server, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const systemIcons = {
  electrical: Zap,
  hvac: Thermometer,
  it: Wifi,
  bacnet: Server,
};

const placeholders = {
  electrical: "e.g., Breaker trips repeatedly when AHU-3 starts...",
  hvac: "e.g., VAV box not maintaining setpoint, hunting...",
  it: "e.g., BACnet devices losing communication intermittently...",
  bacnet: "e.g., Controller showing communication fault on MSTP trunk...",
};

export default function SymptomInput({ symptom, setSymptom, onAnalyze, isAnalyzing, systemType }) {
  const Icon = systemIcons[systemType] || Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 via-transparent to-cyan-500/20 rounded-xl blur-sm" />
      
      <div className="relative bg-[#12121a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">SYMPTOM INPUT</h2>
            <p className="text-xs text-slate-500">Describe the observed problem</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
            <Icon className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">{systemType}</span>
          </div>
        </div>

        <Textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder={placeholders[systemType]}
          className="min-h-[100px] bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-600 resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-slate-500">S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500/30" />
              <span className="text-xs text-slate-600">E</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500/30" />
              <span className="text-xs text-slate-600">R</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500/30" />
              <span className="text-xs text-slate-600">S</span>
            </div>
          </div>

          <Button
            onClick={onAnalyze}
            disabled={!symptom.trim() || isAnalyzing}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border-0 gap-2"
          >
            Analyze
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}