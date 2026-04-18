import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Sparkles, Zap, Brain, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';
import { FadeIn, ScaleOnHover } from '../components/PremiumAnimations';

export default function Subscription() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    monthly: {
      price: 29.90,
      period: 'mês',
      discount: 0,
      popular: false
    },
    yearly: {
      price: 19.90,
      period: 'mês',
      discount: 33,
      popular: true
    }
  };

  const features = [
    { icon: Brain, text: 'Insights avançados de IA' },
    { icon: Heart, text: 'Relatórios médicos ilimitados' },
    { icon: Zap, text: 'Análises em tempo real' },
    { icon: Star, text: 'Todas as conquistas e badges' },
    { icon: Sparkles, text: 'Exportação de dados' },
    { icon: Crown, text: 'Suporte prioritário' }
  ];

  const handleSubscribe = async () => {
    if (!user) {
      showToast('Faça login para assinar', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType: selectedPlan,
          email: user.email
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      showToast('Erro ao processar pagamento', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 mb-6 shadow-xl"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">
              BIORITMO+ Premium
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Desbloqueie todo o potencial do seu bem-estar com recursos exclusivos 
              e insights avançados de IA
            </p>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{feature.text}</span>
                </motion.div>
              );
            })}
          </div>
        </FadeIn>

        {/* Plan Selection */}
        <FadeIn delay={0.2}>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <ScaleOnHover>
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-8 rounded-3xl cursor-pointer transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-white shadow-2xl ring-2 ring-sky-500'
                    : 'bg-white/50 shadow-lg hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Mensal</h3>
                  {selectedPlan === 'monthly' && (
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-slate-900">
                    R$ {plans.monthly.price.toFixed(2)}
                  </span>
                  <span className="text-slate-500">/{plans.monthly.period}</span>
                </div>
                <p className="text-sm text-slate-500">Cancele a qualquer momento</p>
              </div>
            </ScaleOnHover>

            {/* Yearly Plan */}
            <ScaleOnHover>
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-8 rounded-3xl cursor-pointer transition-all ${
                  selectedPlan === 'yearly'
                    ? 'bg-white shadow-2xl ring-2 ring-amber-500'
                    : 'bg-white/50 shadow-lg hover:bg-white'
                }`}
              >
                {plans.yearly.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Anual</h3>
                  {selectedPlan === 'yearly' && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-slate-900">
                    R$ {plans.yearly.price.toFixed(2)}
                  </span>
                  <span className="text-slate-500">/{plans.yearly.period}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
                    ECONOMIZE {plans.yearly.discount}%
                  </span>
                  <span className="text-sm text-slate-500">R$ {(plans.monthly.price - plans.yearly.price) * 12} de desconto</span>
                </div>
              </div>
            </ScaleOnHover>
          </div>
        </FadeIn>

        {/* CTA Button */}
        <FadeIn delay={0.3}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-sky-500/25 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Crown className="w-6 h-6" />
                Assinar BIORITMO+ Premium
              </>
            )}
          </motion.button>
        </FadeIn>

        {/* Trust Badges */}
        <FadeIn delay={0.4}>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Pagamento seguro</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
