# 🌊 Bioritmo v2

Monitoramento contínuo de saúde com correlação de hábitos, score clínico e integração médica.

## Diferenciais vs Concorrentes (Zenklub, Conexa, Vittude)

| Funcionalidade | Bioritmo | Concorrentes |
|----------------|----------|--------------|
| Monitoramento diário contínuo | ✅ | ❌ |
| Correlação de hábitos com saúde | ✅ | ❌ |
| Score clínico objetivo | ✅ | ❌ |
| Integração com médico real | ✅ | ❌ |
| Medicina do trabalho integrada | ✅ | ❌ |

## Arquitetura Modular

```
bioritmo-v2/
├── core/              # Base técnica
│   ├── database/      # SQLite + migrações
│   ├── api/           # Express + router
│   └── auth/          # JWT + bcrypt
├── paciente/          # Gestão de pacientes
├── checkin/           # Monitoramento diário
├── correlacao/        # Correlação de hábitos ⭐
├── score/             # Score clínico ⭐
├── medico/            # Dashboard médico ⭐
├── trabalho/          # Medicina do trabalho ⭐
├── ia/                # Ollama integration
└── relatorios/        # PDF + visualização
```

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
copy .env.example .env
# Edite .env com suas configurações

# 3. Executar migrações
npm run db:migrate

# 4. Iniciar servidor
npm start
```

## Desenvolvimento

```bash
# Modo dev com auto-reload
npm run dev

# Testes
npm test
```

## Ollama (IA Local)

```bash
# Instalar: https://ollama.com

# Iniciar servidor
ollama serve

# Baixar modelo
ollama pull llama3.2:3b
```

## Módulos em Desenvolvimento

- [x] **core** - Base técnica
- [ ] **paciente** - Cadastro e perfil
- [ ] **checkin** - Monitoramento diário
- [ ] **correlacao** - Análise de padrões
- [ ] **score** - Algoritmo clínico
- [ ] **medico** - Dashboard médico
- [ ] **trabalho** - ASO + PPP
- [ ] **ia** - Insights com Ollama
- [ ] **relatorios** - Exportação PDF

---

Desenvolvido para Dr. Moacir Sampaio 🏥
