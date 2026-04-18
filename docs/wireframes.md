# Wireframes BIORITMO+ - Design de Referência

## 🎨 Sistema de Design

### Cores
```
Primária:     #6366F1 (Indigo suave)
Secundária:   #8B5CF6 (Violeta)
Sucesso:      #10B981 (Esmeralda)
Alerta:       #F59E0B (Âmbar)
Perigo:       #EF4444 (Vermelho)
Fundo:        #F8F9FA (Cinza quase branco)
Card:         #FFFFFF (Branco puro)
Texto:        #1F2937 (Cinza escuro)
Texto 2:      #6B7280 (Cinza médio)
Borda:        #E5E7EB (Cinza claro)
```

### Tipografia
```
Fonte:        SF Pro Display / Inter / System UI
Título H1:    28px / Bold
Título H2:    22px / Semibold
Título H3:    18px / Semibold
Corpo:        16px / Regular
Legenda:      14px / Medium
Pequeno:      12px / Medium
```

### Componentes
```
Card:         border-radius: 20px
Botão:        border-radius: 12px
Input:        border-radius: 12px
Ícone:        24px (nav) / 20px (inline)
Espaçamento:  16px base
```

---

## 📱 TELAS

### 1. ONBOARDING - Tela 1: Bem-vindo

```
┌─────────────────────────────┐
│                             │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │   [ANIMAÇÃO]    │      │ ← Ícone pulsing (coração/onda)
│    │   SIMPLES       │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│                             │
│   Seu corpo fala.           │
│   Nós traduzimos.           │
│                             │
│   Transforme seus dados     │
│   em inteligência pessoal   │
│   para uma vida mais        │
│   equilibrada.              │
│                             │
│                             │
│   ● ○ ○                     │ ← Indicadores de página
│                             │
│                             │
│   ┌─────────────────────┐   │
│   │    Continuar        │   │ ← Botão primário
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Especificações:**
- Animação: Ícone com pulse suave (1.5s loop)
- Background: Gradiente sutil (cinza → lavanda)
- Botão: 100% largura, altura 56px
- Transição: Slide da direita

---

### 2. ONBOARDING - Tela 2: Como funciona

```
┌─────────────────────────────┐
│                             │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │   [GRÁFICO      │      │ ← Ilustração simples
│    │    SIMPLES]     │      │    de correlação
│    │                 │      │
│    └─────────────────┘      │
│                             │
│                             │
│   Dados simples.            │
│   Insights poderosos.       │
│                             │
│   Nossa tecnologia          │
│   identifica padrões no     │
│   seu corpo que você        │
│   nunca percebeu.           │
│                             │
│                             │
│   ○ ● ○                     │
│                             │
│   ┌─────────────────────┐   │
│   │    Continuar        │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

### 3. ONBOARDING - Tela 3: Começar

```
┌─────────────────────────────┐
│                             │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │   [CHECKBOX     │      │ ← Ilustração de hábitos
│    │    ANIMADO]     │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│                             │
│   Pequenos hábitos.         │
│   Grandes mudanças.         │
│                             │
│   Descubra como pequenas    │
│   alterações na rotina      │
│   transformam sua saúde.    │
│                             │
│                             │
│   ○ ○ ●                     │
│                             │
│   ┌─────────────────────┐   │
│   │    Começar          │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

### 4. LOGIN / CADASTRO

```
┌─────────────────────────────┐
│                             │
│      ┌─────────────┐        │
│      │   LOGO      │        │ ← Ícone BIORITMO+
│      │  (64x64)    │        │
│      └─────────────┘        │
│                             │
│         BIORITMO+           │
│      by Sampaio Diagnóstico │
│                             │
│   ┌─────────────────────┐   │
│   │  Entrar  │  Criar   │   │ ← Tabs
│   │   conta            │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  Email              │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  Senha              │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │    Entrar           │   │ ← Botão primário
│   └─────────────────────┘   │
│                             │
│   ────────── ou ─────────   │
│                             │
│   ┌─────────────────────┐   │
│   │  Criar nova conta   │   │ ← Botão secundário
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Tabs:**
- Entrar: Form email + senha
- Criar conta: Nome + email + senha + confirmar senha

---

### 5. HOME / DASHBOARD

```
┌─────────────────────────────┐
│  Bom dia,                   │ ← Saudação personalizada
│  Dr. Moacir 👋              │
│                             │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │        78           │    │ ← SCORE GRANDE
│  │    Seu Score        │    │   (fonte 72px, fina)
│  │                     │    │
│  │  🔥 12 dias seguidos│    │ ← Streak badge
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 💡 Quando você dorme│    │ ← Insight card
│  │ 8h, seu humor       │    │   (correlation)
│  │ aumenta 23%         │    │
│  └─────────────────────┘    │
│                             │
│  ─────── Ações ───────      │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   ➕     │ │  📊      │  │
│  │  Novo    │ │  Meu     │  │
│  │ Check-in │ │ Dashboard│  │
│  └──────────┘ └──────────┘  │
│                             │
│  ─────── Resumo ──────      │
│                             │
│  ┌─────────────────────┐    │
│  │ Esta semana    5    │    │
│  │ Check-ins           │    │
│  └─────────────────────┘    │
│                             │
├─────────────────────────────┤
│  🏠    ➕     📊     👤     │ ← Bottom nav
│ Home  Novo  Gráficos Perfil │
└─────────────────────────────┘
```

**Score Card:**
- Background: Gradiente indigo → violeta
- Score: 72px, font-weight 300
- Label: 16px, opacity 0.9
- Streak: Badge amarelo/dourado

**Quick Actions:**
- Ícone 48px em círculo colorido
- Label abaixo
- Touch target: 80x80px mínimo

---

### 6. CHECK-IN

```
┌─────────────────────────────┐
│  ← Como você está?          │
│                             │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │ Humor           7   │    │ ← Slider com valor
│  │ 😢      😐      😄  │    │   (ícones Font Awesome)
│  │ ○━━━━━━━━━●━━━━━━━○ │    │   (gradiente vermelho→verde)
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Energia         6   │    │
│  │ ⚡        ⚡        ⚡│    │
│  │ ○━━━━━━━━●━━━━━━━━○ │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Sono            8   │    │
│  │ 😴       😴       ✨│    │
│  │ ○━━━━━━━●━━━━━━━━━○ │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Horas de sono   7.5h│    │
│  │ ○━━━━━━━━●━━━━━━━━○ │    │   (0-12h)
│  └─────────────────────┘    │
│                             │
│  ─── Hábitos de hoje ───    │
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │  💧  │ │  🏃  │ │  🥗  │ │
│  │ Água │ │Exerc.│ │Alim. │ │
│  │      │ │      │ │      │ │
│  └──────┘ └──────┘ └──────┘ │
│                             │
│  ┌─────────────────────┐    │
│  │ Observações         │    │
│  │                     │    │
│  │ Como foi seu dia?   │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   ✓ Salvar Check-in │    │ ← Botão primário fixo
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Sliders:**
- Altura: 8px
- Thumb: 28px círculo branco com borda colorida
- Track: Gradiente suave
- Ícones: Font Awesome, 24px
- Valor: Destacado em cor primária

**Hábitos:**
- Botões toggle: 80x80px
- Estado inativo: Borda cinza, ícone cinza
- Estado ativo: Borda indigo, ícone indigo, bg indigo 5%
- Animação: Scale 0.95 no tap

---

### 7. DASHBOARD / GRÁFICOS

```
┌─────────────────────────────┐
│  ← Sua evolução             │
│                             │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │  [GRÁFICO LINHA]    │    │
│  │                     │    │
│  │    ╱╲    ╱╲         │    │ ← 7 dias
│  │   ╱  ╲  ╱  ╲╱       │    │
│  │  ╱    ╲╱            │    │
│  │                     │    │
│  │ S T Q Q S S D       │    │
│  └─────────────────────┘    │
│                             │
│  ──── Estatísticas ────     │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   78     │ │   12     │  │
│  │ Média    │ │Dias seg. │  │
│  │ 7 dias   │ │          │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   +15%   │ │   8.2h   │  │
│  │ vs mês   │ │Sono médio│  │
│  │ anterior │ │          │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ──── Correlações ────      │
│                             │
│  ┌─────────────────────┐    │
│  │ 💡 Você dorme 23%   │    │
│  │    melhor quando    │    │
│  │    faz exercício    │    │
│  │    [Ver detalhes →] │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 💡 Seu humor é 31%  │    │
│  │    melhor com       │    │
│  │    8h de sono       │    │
│  │    [Ver detalhes →] │    │
│  └─────────────────────┘    │
│                             │
├─────────────────────────────┤
│  🏠    ➕     📊     👤     │
└─────────────────────────────┘
```

**Gráfico:**
- Tipo: Linha suavizada (tension: 0.4)
- Cores: Gradiente indigo
- Pontos: Círculos 6px
- Grid: Linhas horizontais sutis
- Labels: Dias da semana (S T Q Q S S D)

**Correlações:**
- Ícone: Lâmpada 💡
- Background: Índigo 5%
- Border-radius: 16px
- Touch: Expande para detalhes

---

### 8. PERFIL / CONFIGURAÇÕES

```
┌─────────────────────────────┐
│  ← Perfil                   │
│                             │
├─────────────────────────────┤
│                             │
│        ┌─────────┐          │
│        │  👤     │          │ ← Avatar
│        │ (foto)  │          │
│        └─────────┘          │
│                             │
│      Dr. Moacir Sampaio     │
│      moacir@email.com       │
│                             │
│  ┌─────────────────────┐    │
│  │ 👤 Editar perfil    │    │ →
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🔔 Notificações     │    │ →
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🔒 Privacidade      │    │ →
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 📄 Exportar dados   │    │ →
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ ❓ Ajuda e suporte  │    │ →
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🚪 Sair             │    │ →
│  └─────────────────────┘    │
│                             │
│         Versão 1.0.0        │
│                             │
├─────────────────────────────┤
│  🏠    ➕     📊     👤     │
└─────────────────────────────┘
```

**Menu Items:**
- Ícone 24px à esquerda
- Label 16px
- Chevron (→) à direita
- Divider sutil entre items
- Touch target: 56px altura

---

### 9. MODAL - CHECK-IN SALVO

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │      ✓          │      │ ← Check animado
│    │                 │      │
│    │  Check-in       │      │
│    │  salvo!         │      │
│    │                 │      │
│    │  Score: 82      │      │
│    │  (+3 vs ontem)  │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

**Comportamento:**
- Aparece por 2 segundos
- Fade in/out suave
- Haptic feedback no iOS
- Auto-dismiss ou tap para fechar

---

## 🎯 ANIMAÇÕES E INTERAÇÕES

### Transições de Tela
- **Duração:** 300ms
- **Tipo:** Slide horizontal (iOS style)
- **Easing:** ease-out

### Botões
- **Tap:** Scale 0.96
- **Release:** Scale 1.0
- **Duração:** 100ms

### Cards
- **Entrada:** Fade in + slide up 20px
- **Duração:** 400ms
- **Stagger:** 100ms entre cards

### Sliders
- **Thumb:** Scale 1.2 no drag
- **Track:** Cor preenche conforme valor
- **Feedback:** Haptic leve

### Loading
- **Spinner:** Rotating border
- **Skeleton:** Shimmer effect em cards
- **Placeholder:** Cinza claro pulsante

---

## 📐 ESPECIFICAÇÕES TÉCNICAS

### Breakpoints
```
Mobile:  320px - 428px (iPhone 14 Pro Max)
Tablet:  768px+ (iPad)
Desktop: 1024px+ (opcional)
```

### Safe Areas
```
Top:     44px (notch) / 20px (normal)
Bottom:  34px (home indicator)
Sides:   16px padding
```

### Touch Targets
```
Mínimo:     44x44px
Recomendado: 56x56px
Botões:     100% width, 56px height
```

### Performance
```
FPS:        60fps animações
Load time:  < 3s first paint
Bundle:     < 200KB critical CSS
Images:     WebP, lazy loading
```

---

## 🎨 ASSETS NECESSÁRIOS

### Ícones (Font Awesome)
- fa-home, fa-plus-circle, fa-chart-line, fa-user
- fa-smile, fa-meh, fa-frown, fa-dizzy
- fa-bolt, fa-bed, fa-moon
- fa-tint, fa-running, fa-carrot
- fa-fire, fa-lightbulb

### Ilustrações (Lottie/SVG)
- Onboarding 1: Coração pulsando
- Onboarding 2: Gráfico animado
- Onboarding 3: Checklist completando
- Empty state: Personagem relaxado
- Success: Check animado

### Imagens
- Logo Sampaio Diagnóstico (SVG)
- Avatar placeholder
- Padrão de fundo sutil (opcional)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Estrutura
- [ ] Setup projeto (HTML/CSS/JS)
- [ ] Sistema de rotas/navegação
- [ ] Estado global (usuário, token)
- [ ] API client

### Fase 2: Autenticação
- [ ] Tela onboarding (3 slides)
- [ ] Tela login/cadastro
- [ ] Validação de formulários
- [ ] Persistência de sessão

### Fase 3: Core
- [ ] Home com score
- [ ] Check-in com sliders
- [ ] Dashboard com gráficos
- [ ] Perfil/configurações

### Fase 4: Polish
- [ ] Animações
- [ ] Micro-interações
- [ ] Loading states
- [ ] Error handling

### Fase 5: Teste
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Performance audit
- [ ] Acessibilidade

---

*Wireframes criados em Abril 2025*
*Baseado em pesquisa de mercado de 6 líderes de apps de saúde*
