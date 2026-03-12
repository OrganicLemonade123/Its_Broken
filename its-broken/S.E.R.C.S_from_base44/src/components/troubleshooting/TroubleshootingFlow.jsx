import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Target, Lightbulb, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TroubleshootingFlow({ rootCause, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [decisions, setDecisions] = useState([]);
  const [finalConclusion, setFinalConclusion] = useState(null);

  const steps = [
    {
      question: rootCause.evidence?.check || 'Perform the diagnostic check',
      expectedResult: rootCause.evidence?.expected_result || 'Verify the condition',
      options: ['Confirmed - matches expected', 'Different result', 'Unable to test']
    },
    ...(rootCause.solution?.steps || []).slice(0, 2).map((step, idx) => ({
      question: `Step ${idx + 1}: ${step}`,
      expectedResult: 'Did this step resolve or narrow down the issue?',
      options: ['Issue resolved', 'Issue persists', 'Partial improvement']
    }))
  ];

  const handleDecision = (decision) => {
    const newDecisions = [...decisions, { step: currentStep, decision, question: steps[currentStep].question }];
    setDecisions(newDecisions);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Reached conclusion
      const wasConfirmed = newDecisions[0].decision === 'Confirmed - matches expected';
      const wasResolved = newDecisions.some(d => d.decision === 'Issue resolved');
      
      setFinalConclusion({
        wasConfirmed,
        wasResolved,
        rootCause: rootCause.title,
        decisions: newDecisions,
        recommendation: wasResolved 
          ? `✓ Issue resolved. Root cause was: ${rootCause.title}`
          : wasConfirmed
            ? `Root cause confirmed but issue persists. Escalate or check for additional factors.`
            : `Root cause not confirmed. Re-evaluate other pathways or gather more evidence.`
      });
      onComplete?.({ wasConfirmed, wasResolved, decisions: newDecisions });
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setDecisions([]);
    setFinalConclusion(null);
  };

  if (finalConclusion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#12121a] border border-green-500/30 rounded-xl p-6 mt-4"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
            <Flag className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">Troubleshooting Complete</h4>
            <p className="text-sm text-slate-400">{finalConclusion.recommendation}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Decision Trail</p>
          {finalConclusion.decisions.map((d, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-900/60 rounded-lg p-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">{d.question}</p>
                <p className="text-xs text-white font-medium">{d.decision}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={resetFlow} variant="outline" className="w-full text-sm">
          Start New Flow
        </Button>
      </motion.div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#12121a] border border-cyan-500/30 rounded-xl p-5 mt-4"
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-all ${
              idx < currentStep ? 'bg-cyan-500' :
              idx === currentStep ? 'bg-cyan-500/50' :
              'bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h4 className="text-white font-semibold text-sm mb-1">{currentStepData.question}</h4>
          <p className="text-xs text-slate-400">{currentStepData.expectedResult}</p>
        </div>
      </div>

      {/* Decision trail so far */}
      {decisions.length > 0 && (
        <div className="mb-4 space-y-1">
          {decisions.map((d, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="truncate">{d.decision}</span>
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {currentStepData.options.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleDecision(option)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-all text-left"
          >
            <span className="text-sm text-white">{option}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </motion.button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Follow the diagnostic path to reach a conclusion</span>
        </div>
      </div>
    </motion.div>
  );
}