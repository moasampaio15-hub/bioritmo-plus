
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 p-4 rounded-2xl shadow-2xl border border-slate-100/50 backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {entry.value.toLocaleString()}
                  {entry.name.toLowerCase().includes("sono") ? "h" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
    
  };

  const Card = ({ title, children, className, subtitle, icon: Icon, color = "sky" }: any) => {
    const colorMap: Record<string, { bg: string, text: string, glow: string }> = {
      sky: { bg: "bg-sky-50", text: "text-sky-500", glow: "bg-sky-400" },
      blue: { bg: "bg-blue-50", text: "text-blue-500", glow: "bg-blue-400" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-500", glow: "bg-indigo-400" },
      orange: { bg: "bg-orange-50", text: "text-orange-500", glow: "bg-orange-400" },
      amber: { bg: "bg-amber-50", text: "text-amber-500", glow: "bg-amber-400" },
      red: { bg: "bg-red-50", text: "text-red-500", glow: "bg-red-400" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-500", glow: "bg-emerald-400" },
    };

    const colors = colorMap[color] || colorMap.sky;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          "bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100/80 flex flex-col transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 group relative overflow-hidden",
          className
        )}
      >
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">{title}</h3>
            {subtitle && <p className="text-[11px] font-bold text-slate-900/40 uppercase tracking-tight">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={clsx(
              "p-3 rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3",
              colors.bg,
              colors.text
            )}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>
        {/* Subtle background glow */}
        <div className={clsx(
          "absolute -right-4 -bottom-4 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full",
          colors.glow
        )} />
      </motion.div>
    );
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1.5 bg-sky-500 rounded-full" />
            <span className="text-[11px] font-black text-sky-600 uppercase tracking-[0.4em]">Health Intelligence</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Seu <span className="text-sky-600">Equilíbrio</span>
          </h2>
          <p className="text-slate-500 font-medium text-xl max-w-md">Insights profundos baseados nos seus últimos registros de bem-estar.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full border border-slate-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Dados Sincronizados</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-4">Última atualização: Hoje</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Hero Section: Health Score & Vitality Trend */}
        <Card 
          title="Vitalidade Geral" 
          subtitle="Score Consolidado" 
          icon={Heart}
          color="sky"
          className="md:col-span-4 min-h-[320px]"
        >
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{healthScore}</span>
            <span className="text-2xl font-bold text-slate-300">/100</span>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-sky-50 rounded-full">
                <p className="text-[10px] text-sky-600 font-black uppercase tracking-widest">{getHealthStatusLabel(healthScore)}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+2.4% vs ontem</span>
            </div>
            <div className="h-5 w-full bg-slate-50 rounded-full overflow-hidden p-1.5 border border-slate-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                className="h-full premium-gradient rounded-full shadow-lg shadow-sky-500/20" 
              />
            </div>
          </div>
        </Card>

        <Card 
          title="Tendência de Vitalidade" 
          subtitle="Histórico de 7 Dias" 
          className="md:col-span-8"
        >
          <div className="h-full min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={6} fillOpacity={1} fill="url(#colorScore)" name="Vitalidade" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Burnout & Sleep Row */}
        <Card 
          title="Risco de Burnout" 
          subtitle="Nível de Sobrecarga" 
          icon={ShieldAlert}
          color={burnoutScore > 50 ? "orange" : "blue"}
          className="md:col-span-4"
        >
          <div className="flex items-baseline gap-2 mb-6">
            <span className={clsx(
              "text-7xl font-black tracking-tighter leading-none",
              burnoutScore > 50 ? "text-orange-500" : "text-sky-500"
            )}>{burnoutScore}</span>
            <span className="text-xl font-bold text-slate-300">%</span>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{getBurnoutStatusLabel(burnoutScore)}</p>
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${burnoutScore}%` }}
                className={clsx(
                  "h-full rounded-full transition-all duration-1000",
                  burnoutScore > 50 ? "bg-orange-500" : "bg-sky-500"
                )} 
              />
            </div>
          </div>
        </Card>

        <Card 
          title="Análise de Descanso" 
          subtitle="Horas vs Qualidade" 
          icon={Moon}
          color="indigo"
          className="md:col-span-5"
        >
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="sleep" fill="#0ea5e9" radius={[8, 8, 0, 0]} barSize={12} name="Horas de Sono" />
                <Bar dataKey="quality" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={12} name="Qualidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Horas</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Qualidade</span></div>
            </div>
            <p className="text-xs font-black text-slate-900">Média: {(chartData.reduce((acc, d) => acc + d.sleep, 0) / (chartData.length || 1)).toFixed(1)}h</p>
          </div>
        </Card>

        <Card 
          title="Hidratação" 
          subtitle="Meta Diária" 
          icon={Zap}
          color="blue"
          className="md:col-span-3"
        >
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                <motion.circle 
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * (latest?.water || 0) / 12) }}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 leading-none">{latest?.water || 0}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Copos</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">66% da meta</p>
          </div>
        </Card>

        {/* Emotional & Physical Correlation Row */}
        <Card 
          title="Humor & Energia" 
          subtitle="Sincronia Emocional" 
          icon={Activity}
          color="amber"
          className="md:col-span-6"
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={5} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }} name="Energia" />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={5} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} name="Humor" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card 
          title="Estresse & Dor" 
          subtitle="Sinais do Corpo" 
          icon={ShieldAlert}
          color="red"
          className="md:col-span-6"
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={5} dot={{ r: 6, fill: '#ef4444', strokeWidth: 3, stroke: '#fff' }} name="Estresse" />
                <Line type="monotone" dataKey="pain" stroke="#64748b" strokeWidth={5} dot={{ r: 6, fill: '#64748b', strokeWidth: 3, stroke: '#fff' }} name="Dor" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card 
          title="Saúde vs Estresse" 
          subtitle="Correlação de Vitalidade" 
          icon={Activity}
          color="sky"
          className="md:col-span-12"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis yAxisId="left" hide domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" hide domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="left" type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={5} dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff' }} name="Score de Saúde" />
                <Line yAxisId="right" type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={5} dot={{ r: 6, fill: '#ef4444', strokeWidth: 3, stroke: '#fff' }} name="Nível de Estresse" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full bg-sky-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde (0-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full bg-red-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estresse (0-10)</span>
            </div>
          </div>
        </Card>

        {/* Activity Bento Section */}
        <Card 
          title="Movimento" 
          subtitle="Atividade Física" 
          className="md:col-span-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <ReferenceLine y={user?.daily_steps_goal || 10000} stroke="#10b981" strokeDasharray="8 8" label={{ position: 'top', value: 'META DIÁRIA', fill: '#10b981', fontSize: 9, fontWeight: 'black', letterSpacing: '0.2em' }} />
                    <Bar dataKey="steps" fill="#0ea5e9" radius={[16, 16, 0, 0]} name="Passos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Diária</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {(chartData.reduce((acc, d) => acc + d.steps, 0) / (chartData.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight">Acima da média nacional</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total 7d</p>
                  <p className="text-lg font-black text-slate-900">{(chartData.reduce((acc, d) => acc + d.steps, 0) / 1000).toFixed(1)}k</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recorde</p>
                  <p className="text-lg font-black text-slate-900">{Math.max(...chartData.map(d => d.steps)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
