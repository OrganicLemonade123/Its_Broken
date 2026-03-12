import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Zap, Thermometer, Wifi, Server, Loader2, Code2 } from 'lucide-react';
import SymptomInput from '@/components/troubleshooting/SymptomInput';
import RootCauseNode from '@/components/troubleshooting/RootCauseNode';
import AnalysisHeader from '@/components/troubleshooting/AnalysisHeader';
import VoltageInputPanel from '@/components/troubleshooting/VoltageInputPanel';
import VoltageVerdict from '@/components/troubleshooting/VoltageVerdict';

export default function Dashboard() {
  const [symptom, setSymptom] = useState('');
  const [systemType, setSystemType] = useState('electrical');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRootCause, setSelectedRootCause] = useState(null);
  const [voltageVerdict, setVoltageVerdict] = useState(null);
  const [isAnalyzingVoltage, setIsAnalyzingVoltage] = useState(false);

  const systemTypes = [
    { id: 'electrical', label: 'Electrical', icon: Zap, color: '#eab308' },
    { id: 'hvac', label: 'HVAC', icon: Thermometer, color: '#06b6d4' },
    { id: 'it', label: 'IT Network', icon: Wifi, color: '#8b5cf6' },
    { id: 'bacnet', label: 'BACnet/BAS', icon: Server, color: '#22c55e' },
    { id: 'gcl', label: 'GCL+', icon: Code2, color: '#f59e0b' },
  ];

  const analyzeSymptom = async () => {
    if (!symptom.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedRootCause(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert troubleshooting engineer for building systems. Analyze this symptom for a ${systemType.toUpperCase()} system:

SYMPTOM: "${symptom}"

Generate exactly 3 likely root causes. For each root cause, provide:
1. A clear, technical root cause description
2. The specific evidence/diagnostic check needed to confirm this root cause
3. The step-by-step solution if this root cause is confirmed
4. A confidence percentage (how likely this is the cause)
5. Severity level (critical, high, medium, low)

Focus on practical, real-world troubleshooting for ${systemType === 'electrical' ? 'electrical systems (circuits, breakers, wiring, transformers, panels)' : 
systemType === 'hvac' ? 'HVAC systems (compressors, refrigerant, airflow, thermostats, dampers, VAV boxes)' :
systemType === 'it' ? 'IT/Network systems (switches, routers, cables, DNS, DHCP, firewalls)' :
systemType === 'gcl' ? 'GCL+ programming logic (Delta Controls syntax, logic errors, variable scope, conditional statements, timing sequences, function blocks)' :
'BACnet/Building Automation Systems (controllers, sensors, actuators, network communication, programming)'}`,
        response_json_schema: {
          type: "object",
          properties: {
            root_causes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" },
                  severity: { type: "string" },
                  evidence: {
                    type: "object",
                    properties: {
                      check: { type: "string" },
                      expected_result: { type: "string" },
                      tools_needed: { type: "array", items: { type: "string" } }
                    }
                  },
                  solution: {
                    type: "object",
                    properties: {
                      summary: { type: "string" },
                      steps: { type: "array", items: { type: "string" } },
                      estimated_time: { type: "string" },
                      parts_needed: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      setVoltageVerdict(null);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeVoltageReadings = async (readings) => {
    if (!analysis?.root_causes) return;
    setIsAnalyzingVoltage(true);
    setVoltageVerdict(null);

    const readingsSummary = readings.map(r => `${r.label}: ${r.value} ${r.unit}`).join('\n');
    const rootCausesSummary = analysis.root_causes.map((rc, i) =>
      `Root Cause #${i + 1} (${rc.confidence}% confidence): ${rc.title} — ${rc.description}`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert troubleshooting engineer for ${systemType.toUpperCase()} building systems.

A technician has entered voltage/measurement readings from the field. Evaluate these readings against the 3 identified root causes and determine if each pathway is confirmed, rejected, or inconclusive.

SYMPTOM: "${symptom}"
SYSTEM TYPE: ${systemType}

ROOT CAUSES UNDER INVESTIGATION:
${rootCausesSummary}

TECHNICIAN VOLTAGE READINGS:
${readingsSummary}

For each root cause pathway, provide:
1. Status: "confirmed", "rejected", or "inconclusive"
2. Reasoning based on the measured values
3. Which readings are relevant/flagged, with measured vs expected values, and whether they are anomalous
4. Updated confidence % after readings (can go up or down from original)
5. Recommended next step for the technician

Also provide an overall summary of what the readings indicate about the most likely root cause.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          pathways: {
            type: "array",
            items: {
              type: "object",
              properties: {
                root_cause_title: { type: "string" },
                status: { type: "string" },
                reasoning: { type: "string" },
                confidence_before: { type: "number" },
                confidence_after: { type: "number" },
                next_step: { type: "string" },
                flagged_readings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      measured: { type: "string" },
                      expected: { type: "string" },
                      anomaly: { type: "boolean" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    setVoltageVerdict(result);
    setIsAnalyzingVoltage(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-4 md:p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-orange-500/30 animate-ping" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">S.E.R.C.S.</h1>
            <p className="text-xs text-slate-500 tracking-widest uppercase">
              Symptom • Evidence • Root Cause • Solution
            </p>
          </div>
        </div>
      </motion.div>

      {/* System Type Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {systemTypes.map((sys) => (
          <motion.button
            key={sys.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSystemType(sys.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              systemType === sys.id 
                ? 'border-slate-600 bg-slate-800/80' 
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
            }`}
            style={{
              boxShadow: systemType === sys.id ? `0 0 20px ${sys.color}20` : 'none'
            }}
          >
            <sys.icon 
              className="w-4 h-4" 
              style={{ color: systemType === sys.id ? sys.color : '#64748b' }} 
            />
            <span className={systemType === sys.id ? 'text-white' : 'text-slate-500'}>
              {sys.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Symptom Input */}
      <SymptomInput 
        symptom={symptom}
        setSymptom={setSymptom}
        onAnalyze={analyzeSymptom}
        isAnalyzing={isAnalyzing}
        systemType={systemType}
      />

      {/* Analysis Loading State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-orange-500/20 animate-ping" />
            </div>
            <p className="mt-4 text-slate-400 text-sm">Analyzing symptom patterns...</p>
            <p className="text-slate-600 text-xs">Generating root cause hypotheses</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AnalysisHeader symptom={symptom} systemType={systemType} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              {analysis.root_causes?.map((rootCause, index) => (
                <RootCauseNode
                  key={rootCause.id || index}
                  rootCause={rootCause}
                  index={index}
                  isSelected={selectedRootCause === index}
                  onSelect={() => setSelectedRootCause(selectedRootCause === index ? null : index)}
                />
              ))}
            </div>

            <VoltageInputPanel
              systemType={systemType}
              rootCauses={analysis.root_causes}
              onSubmitReadings={analyzeVoltageReadings}
            />

            <VoltageVerdict
              verdict={voltageVerdict}
              isLoading={isAnalyzingVoltage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-cyan-500 to-green-500 opacity-50" />
    </div>
  );
}