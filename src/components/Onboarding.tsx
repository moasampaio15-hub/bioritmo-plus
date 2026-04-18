import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, Brain, Moon, ArrowRight, Check, Sparkles } from 'lucide-react';
import { FadeIn, ScaleOnHover } from './PremiumAnimations';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Heart,
    title: 'Bem-vindo ao BIORITMO+',
    description: 'Seu companheiro inteligente para uma vida mais saudável e equilibrada.',
    color: 'from-rose-400 to-pink-500'
  },
  {
    icon: Activity,
    title: 'Acompanhe seus hábitos',
    description: 'Registre sono, humor, energia e atividades físicas diariamente.',
    color: 'from-sky-400 to-blue-500'
  },
  {
    icon: Brain,
    title: 'Insights com IA',
    description: 'Nossa inteligência artificial identifica padrões e sugere melhorias.',
    color: 'from-violet-400 to-purple-500'
  },
  {
    icon: Moon,
    title: 'Durma melhor',
    description: 'Monitore sua qualidade de sono e receba dicas personalizadas.',
    color: 'from-indigo-400 to-blue-600'
  },
  {
    icon: Sparkles,
    title: 'Pronto para começar?',
    description: 'Vamos criar seu primeiro check-in e começar sua jornada!',
    color: 'from-amber-400 to-orange-500'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Progresso */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                index <= currentStep ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Conteúdo */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="text-center"
          >
            {/* Ícone animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-white mb-4"
            >
              {step.title}
            </motion.h2>

            {/* Descrição */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-300 mb-8"
            >
              {step.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Botões */}
        <div className="space-y-4">
          <ScaleOnHover>
            <motion.button
              onClick={nextStep}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Começar Agora
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </ScaleOnHover>

          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="w-full py-3 text-slate-400 font-bold hover:text-white transition-colors"
            >
              Voltar
            </button>
          )}

          {currentStep < steps.length - 1 && (
            <button
              onClick={skipOnboarding}
              className="w-full py-3 text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
