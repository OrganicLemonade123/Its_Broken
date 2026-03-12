import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, Trash2, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Context-aware voltage prompts per system type + root cause keywords
function suggestReadings(systemType, rootCauses) {
  const base = {
    electrical: [
      { label: 'Line Voltage L1-L2', unit: 'VAC', placeholder: '240' },
      { label: 'Line Voltage L1-N', unit: 'VAC', placeholder: '120' },
      { label: 'Line Voltage L2-N', unit: 'VAC', placeholder: '120' },
      { label: 'Ground Continuity', unit: 'Ω', placeholder: '0.1' },
    ],
    hvac: [
      { label: 'Control Voltage (24VAC)', unit: 'VAC', placeholder: '24' },
      { label: 'Compressor Contactor Coil', unit: 'VAC', placeholder: '24' },
      { label: 'Supply Air Temp Sensor Signal', unit: 'VDC', placeholder: '2.5' },
      { label: 'Economizer Actuator Signal', unit: 'VDC', placeholder: '5' },
    ],
    it: [
      { label: 'PoE Port Voltage', unit: 'VDC', placeholder: '48' },
      { label: 'UPS Output Voltage', unit: 'VAC', placeholder: '120' },
      { label: 'PDU Rail Voltage', unit: 'VAC', placeholder: '208' },
    ],
    bacnet: [
      { label: 'Controller 24VAC Supply', unit: 'VAC', placeholder: '24' },
      { label: 'Analog Input (0-10V)', unit: 'VDC', placeholder: '5' },
      { label: 'Binary Output (Relay)', unit: 'VDC', placeholder: '24' },
      { label: 'MS/TP Bus Voltage', unit: 'VDC', placeholder: '5' },
      { label: 'Sensor Signal (4-20mA equivalent V)', unit: 'VDC', placeholder: '3' },
    ],
  };

  // Look at root cause titles to add relevant readings
  const extras = [];
  const combinedText = (rootCauses || []).map(rc => `${rc.title} ${rc.description}`).join(' ').toLowerCase();

  if (combinedText.includes('transformer')) {
    extras.push({ label: 'Transformer Secondary Output', unit: 'VAC', placeholder: '24' });
  }
  if (combinedText.includes('sensor') || combinedText.includes('thermistor')) {
    extras.push({ label: 'Sensor Reference Voltage', unit: 'VDC', placeholder: '5' });
  }
  if (combinedText.includes('actuator') || combinedText.includes('damper')) {
    extras.push({ label: 'Actuator Drive Signal', unit: 'VDC', placeholder: '10' });
  }
  if (combinedText.includes('breaker') || combinedText.includes('circuit')) {
    extras.push({ label: 'Load-Side Breaker Voltage', unit: 'VAC', placeholder: '120' });
  }
  if (combinedText.includes('controller') || combinedText.includes('delta')) {
    extras.push({ label: 'Delta Controller 24VAC Input', unit: 'VAC', placeholder: '24' });
    extras.push({ label: 'Delta Controller DC Bus', unit: 'VDC', placeholder: '12' });
  }

  const all = [...(base[systemType] || base.bacnet), ...extras];
  // Deduplicate by label
  const seen = new Set();
  return all.filter(r => { if (seen.has(r.label)) return false; seen.add(r.label); return true; });
}

export default function VoltageInputPanel({ systemType, rootCauses, onSubmitReadings }) {
  const suggested = suggestReadings(systemType, rootCauses);

  const [readings, setReadings] = useState(
    suggested.map(s => ({ ...s, value: '', id: Math.random() }))
  );
  const [collapsed, setCollapsed] = useState(false);

  const updateReading = (id, value) => {
    setReadings(prev => prev.map(r => r.id === id ? { ...r, value } : r));
  };

  const addCustom = () => {
    setReadings(prev => [
      ...prev,
      { label: '', unit: 'VAC', placeholder: '0', value: '', id: Math.random(), custom: true }
    ]);
  };

  const removeReading = (id) => {
    setReadings(prev => prev.filter(r => r.id !== id));
  };

  const updateCustomLabel = (id, label) => {
    setReadings(prev => prev.map(r => r.id === id ? { ...r, label } : r));
  };

  const handleSubmit = () => {
    const filled = readings.filter(r => r.value !== '' && r.label !== '');
    if (filled.length === 0) return;
    onSubmitReadings(filled);
  };

  const filledCount = readings.filter(r => r.value !== '').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 relative"
    >
      {/* glow border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-transparent to-cyan-500/10 rounded-xl blur-sm" />

      <div className="relative bg-[#12121a] border border-amber-500/20 rounded-xl overflow-hidden">
        {/* Header bar */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Voltage Readings</p>
            <p className="text-xs text-slate-500">
              {filledCount}/{readings.length} readings entered · context-aware for {systemType.toUpperCase()}
            </p>
          </div>
          {filledCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30">
              {filledCount} ready
            </span>
          )}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-slate-500" />
            : <ChevronUp className="w-4 h-4 text-slate-500" />
          }
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {readings.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        {r.custom ? (
                          <input
                            className="w-full bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600 mb-1"
                            placeholder="Label (e.g. Transformer Output)"
                            value={r.label}
                            onChange={e => updateCustomLabel(r.id, e.target.value)}
                          />
                        ) : (
                          <p className="text-xs text-slate-400 truncate mb-1">{r.label}</p>
                        )}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            className={`w-20 bg-transparent text-sm font-mono outline-none border-b transition-colors ${
                              r.value !== ''
                                ? 'border-amber-500 text-amber-300'
                                : 'border-slate-700 text-slate-300 placeholder:text-slate-700'
                            }`}
                            placeholder={r.placeholder}
                            value={r.value}
                            onChange={e => updateReading(r.id, e.target.value)}
                          />
                          <span className="text-xs text-slate-600 font-mono">{r.unit}</span>
                        </div>
                      </div>
                      {r.custom && (
                        <button onClick={() => removeReading(r.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={addCustom}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5 border border-dashed border-slate-700 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add custom reading
                  </button>
                  <div className="flex-1" />
                  <Button
                    onClick={handleSubmit}
                    disabled={filledCount === 0}
                    className="bg-amber-600 hover:bg-amber-500 text-black font-semibold text-sm gap-2"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Analyze Readings
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}