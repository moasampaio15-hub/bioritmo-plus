import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { CheckIn } from "../types";
import { motion } from "motion/react";
import { 
  Sparkles, Brain, Wind, Heart, ShieldAlert, 
  Zap, Moon, Droplets, Dumbbell, Users, Coffee,
  BookOpen, Compass, Sun, Calendar, Activity, Utensils, Lightbulb, Crown
} from "lucide-react";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import Paywall from "../components/Paywall";

export default function WellnessGuide() {
  const { user } = useAuth();
  const [latestCheckin, setLatestCheckin] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getCheckIns(user.id).then(data => {
        if (data && data.length > 0) {
          setLatestCheckin(data[0]); // api.getCheckIns returns reversed list (latest first)
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  const healthScore = latestCheckin?.health_score || 0;
  const burnoutScore = latestCheckin?.burnout_score || 0;
  const stressLevel = latestCheckin?.stress_level || 0;
  const sleepHours = latestCheckin?.sleep_hours || 8;

  const GuideSection = ({ title, icon: Icon, color, children, isPriority }: any) => (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={clsx(
        "space-y-4 p-1 rounded-[2.5rem] transition-all",
        isPriority && "ring-2 ring-sky-500/20 bg-sky-50/30 p-4 -mx-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx("p-2 rounded-xl", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg tracking-tight">{title}</h3>
        </div>
        {isPriority && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-sky-500 text-white rounded-lg shadow-lg shadow-sky-500/20">
            Prioridade
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {children}
      </div>
    </motion.section>
  );

  const TipCard = ({ title, description, icon: Icon, actionLabel, actionLink }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>
      {actionLabel && actionLink && (
        <Link 
          to={actionLink}
          className="block w-full py-2.5 bg-slate-50 text-slate-900 text-xs font-bold text-center rounded-xl hover:bg-slate-100 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );

  // Define sections with priority logic
  const sections = [
    {
      id: 'burnout',
      title: "Foco em Recuperação",
      icon: ShieldAlert,
      color: "bg-orange-50 text-orange-600",
      priority: burnoutScore > 60 ? 100 : burnoutScore > 40 ? 50 : 0,
      show: burnoutScore > 40,
      content: (
        <>
          <TipCard 
            title="Micro-pausas de 5 minutos"
            description="A cada 90 minutos de trabalho, pare tudo. Olhe para longe, respire fundo ou caminhe um pouco."
            icon={Coffee}
          />
          <TipCard 
            title="Técnica de Respiração Quadrada"
            description="Ideal para baixar o cortisol e acalmar o sistema nervoso em momentos de pico de estresse."
            icon={Wind}
            actionLabel="Praticar Agora"
            actionLink="/breathing"
          />
          <TipCard 
            title="Desconexão Digital"
            description="Tente ficar 1 hora antes de dormir sem telas. Isso ajuda seu cérebro a sinalizar a produção de melatonina."
            icon={Moon}
          />
        </>
      )
    },
    {
      id: 'vitality',
      title: "Vitalidade e Movimento",
      icon: Zap,
      color: "bg-sky-50 text-sky-600",
      priority: healthScore < 50 ? 110 : healthScore < 70 ? 80 : 20,
      show: true,
      content: (
        <>
          <TipCard 
            title="Hidratação Estratégica"
            description="Beba 500ml de água logo ao acordar. Isso ativa seu metabolismo e melhora a clareza mental."
            icon={Droplets}
          />
          <TipCard 
            title="Movimento Leve"
            description="Se não puder treinar hoje, tente uma caminhada de 15 minutos. O movimento é o melhor remédio para a estagnação."
            icon={Dumbbell}
            actionLabel="Ver Exercícios"
            actionLink="/exercises"
          />
          <TipCard 
            title="Check-in de Nutrição"
            description="Tente incluir uma porção extra de vegetais verdes na sua próxima refeição para mais magnésio e energia."
            icon={Sun}
          />
        </>
      )
    },
    {
      id: 'sleep',
      title: "Higiene do Sono",
      icon: Moon,
      color: "bg-blue-50 text-blue-600",
      priority: sleepHours < 7 ? 95 : healthScore < 60 ? 70 : 30,
      show: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Horários Regulares</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Estabeleça uma rotina consistente: tente dormir e acordar no mesmo horário todos os dias, inclusive nos fins de semana. Isso sincroniza seu relógio biológico.
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Ambiente de Santuário</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crie um ambiente propício: mantenha o quarto totalmente escuro, silencioso e com temperatura amena (entre 18°C e 22°C).
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'vitaminD',
      title: "Vitamina D e Sol",
      icon: Sun,
      color: "bg-amber-50 text-amber-600",
      priority: healthScore < 50 ? 85 : 40,
      show: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Humor e Imunidade</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A vitamina D é essencial para a produção de serotonina (humor) e para a ativação das células de defesa do sistema imune.
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                <Utensils className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900">Fontes e Exposição</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A melhor fonte é a exposição solar (15-20 min/dia). Na alimentação, foque em peixes gordos, ovos e cogumelos.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'nutrition',
      title: "Nutrição e Clareza Mental",
      icon: Utensils,
      color: "bg-emerald-50 text-emerald-600",
      priority: healthScore < 60 ? 90 : 40,
      show: true,
      content: (
        <>
          <TipCard 
            title="Hidratação e Foco"
            description="A água é essencial para o transporte de nutrientes ao cérebro. Mesmo uma desidratação leve pode causar névoa mental e fadiga."
            icon={Droplets}
          />
          <TipCard 
            title="Superalimentos para o Cérebro"
            description="Inclua alimentos ricos em antioxidantes e ômega-3, como mirtilos, nozes e sementes de chia."
            icon={Brain}
          />
          <TipCard 
            title="Energia Sustentada"
            description="Evite o 'crash' da tarde priorizando carboidratos de baixo índice glicêmico (aveia, batata doce)."
            icon={Zap}
          />
        </>
      )
    },
    {
      id: 'meditation',
      title: "Meditação e Mindfulness",
      icon: Sparkles,
      color: "bg-purple-50 text-purple-600",
      priority: stressLevel > 7 ? 100 : stressLevel > 5 ? 50 : 20,
      show: true,
      content: (
        <>
          <TipCard 
            title="Foco na Respiração"
            description="Sente-se confortavelmente e foque apenas no ar entrando e saindo. Quando sua mente divagar, gentilmente traga o foco de volta."
            icon={Wind}
          />
          <TipCard 
            title="Escaneamento Corporal"
            description="Feche os olhos e percorra mentalmente cada parte do seu corpo, da cabeça aos pés, relaxando qualquer tensão que encontrar."
            icon={Activity}
          />
        </>
      )
    },
    {
      id: 'mental',
      title: "Saúde Mental",
      icon: Brain,
      color: "bg-indigo-50 text-indigo-600",
      priority: 30,
      show: true,
      content: (
        <>
          <TipCard 
            title="Diário de Gratidão"
            description="Escrever 3 coisas pelas quais você é grato muda a fiação do seu cérebro para focar no positivo."
            icon={BookOpen}
            actionLabel="Fazer Check-in"
            actionLink="/checkin"
          />
          <TipCard 
            title="Conexão Social"
            description="Mande uma mensagem ou ligue para alguém que você gosta hoje. A conexão humana é um pilar da longevidade."
            icon={Users}
          />
        </>
      )
    }
  ].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-600 rounded-full border border-sky-100">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Guia Inteligente</span>
          </div>
          {user?.is_premium && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-lg shadow-lg shadow-slate-900/20">
              <Crown className="w-2.5 h-2.5" />
              Acesso Premium
            </div>
          )}
        </div>
        <h2 className="text-3xl font-black text-display text-slate-900 leading-tight">Bem-estar <span className="text-sky-600">Integrado</span></h2>
        <p className="text-slate-500 font-medium">Priorizamos as dicas mais relevantes para o seu estado atual.</p>
      </header>

      <div className="space-y-12">
        {user?.is_premium ? (
          sections.filter(s => s.show).map((section, idx) => (
            <GuideSection 
              key={section.id}
              title={section.title}
              icon={section.icon}
              color={section.color}
              isPriority={idx === 0 && section.priority >= 70}
            >
              {section.content}
            </GuideSection>
          ))
        ) : (
          <div className="py-10">
            <Paywall 
              title="Guia de Saúde Inteligente"
              description="Acesse recomendações personalizadas baseadas nos seus dados diários e insights de IA."
            />
          </div>
        )}
      </div>

      {/* Specialist Tips */}
      <GuideSection title="Dicas de Especialistas" icon={Lightbulb} color="bg-indigo-50 text-indigo-600">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Mindfulness na Prática Diária</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pequenas pausas conscientes podem transformar sua regulação emocional e reduzir o estresse crônico. Tente focar na sua respiração por apenas 1 minuto entre reuniões ou tarefas importantes.
          </p>
          <div className="pt-2 border-t border-slate-50 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md border border-emerald-100">
              Dica de Saúde
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leitura de 1 min</span>
          </div>
        </div>
      </GuideSection>

      {/* General Exercises */}
      <GuideSection title="Exercícios Recomendados" icon={Compass} color="bg-emerald-50 text-emerald-600">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Wind className="w-5 h-5 text-sky-400" />
            </div>
            <h4 className="font-bold">Exercício de Respiração 4-4-4-4</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inale por 4 segundos, segure por 4, exale por 4 e segure vazio por 4. Repita 5 vezes para resetar seu estado emocional.
          </p>
          <Link 
            to="/breathing"
            className="block w-full py-3 bg-white text-slate-900 text-xs font-black text-center rounded-2xl"
          >
            Iniciar Exercício
          </Link>
        </div>
      </GuideSection>

      <div className="bg-sky-50 p-8 rounded-[2.5rem] border border-sky-100 text-center space-y-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-6 h-6 text-sky-600 fill-sky-600" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sky-900">Lembre-se</h4>
          <p className="text-xs text-sky-700 leading-relaxed">
            Pequenas mudanças consistentes valem mais do que grandes esforços esporádicos. Seu corpo agradece cada escolha consciente.
          </p>
        </div>
      </div>
    </div>
  );
}
