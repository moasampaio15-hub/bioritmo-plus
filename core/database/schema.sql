-- Bioritmo v2 - Schema Completo
-- Diferenciais: monitoramento contínuo, correlação de hábitos, score clínico, integração médica

-- ============================================
-- MÓDULO: AUTH / USUÁRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('paciente', 'medico', 'gestor', 'admin')),
    telefone TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME,
    ativo INTEGER DEFAULT 1
);

-- ============================================
-- MÓDULO: PACIENTE
-- ============================================

CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    data_nascimento DATE,
    sexo TEXT CHECK (sexo IN ('M', 'F', 'O')),
    cpf TEXT UNIQUE,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    profissao TEXT,
    empresa_id INTEGER,
    medico_responsavel_id INTEGER,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paciente_historico_medico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    condicao TEXT NOT NULL,
    diagnostico_cid TEXT,
    data_diagnostico DATE,
    em_tratamento INTEGER DEFAULT 0,
    medicamentos TEXT,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MÓDULO: MÉDICO
-- ============================================

CREATE TABLE IF NOT EXISTS medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    crm TEXT NOT NULL,
    crm_uf TEXT NOT NULL,
    especialidade TEXT,
    clinica_id INTEGER,
    atende_particular INTEGER DEFAULT 1,
    atende_convenio INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medico_pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    vinculado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo INTEGER DEFAULT 1,
    UNIQUE(medico_id, paciente_id)
);

CREATE TABLE IF NOT EXISTS medico_anotacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medico_id INTEGER NOT NULL REFERENCES medicos(id),
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    anotacao TEXT NOT NULL,
    tipo TEXT DEFAULT 'geral' CHECK (tipo IN ('geral', 'evolucao', 'receita', 'atestado')),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MÓDULO: CHECK-IN (Monitoramento Diário)
-- ============================================

CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    
    -- Métricas principais (1-10)
    humor INTEGER CHECK (humor >= 1 AND humor <= 10),
    energia INTEGER CHECK (energia >= 1 AND energia <= 10),
    sono INTEGER CHECK (sono >= 1 AND sono <= 10),
    
    -- Dados de sono
    horas_sono REAL,
    qualidade_sono INTEGER CHECK (qualidade_sono >= 1 AND qualidade_sono <= 5),
    acordou_descansado INTEGER CHECK (acordou_descansado IN (0, 1)),
    
    -- Sintomas
    sintomas TEXT, -- JSON array
    intensidade_sintomas INTEGER CHECK (intensidade_sintomas >= 1 AND intensidade_sintomas <= 10),
    
    -- Contexto
    local TEXT,
    momento_dia TEXT CHECK (momento_dia IN ('manha', 'tarde', 'noite')),
    
    -- Notas livres
    notas TEXT,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(paciente_id, data, momento_dia)
);

-- ============================================
-- MÓDULO: HÁBITOS (para correlação)
-- ============================================

CREATE TABLE IF NOT EXISTS habitos_registro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    
    -- Alimentação
    refeicoes_regulares INTEGER CHECK (refeicoes_regulares IN (0, 1)),
    alimentacao_saudavel INTEGER CHECK (alimentacao_saudavel >= 1 AND alimentacao_saudavel <= 5),
    
    -- Atividade física
    exercicio INTEGER CHECK (exercicio IN (0, 1)),
    tipo_exercicio TEXT,
    duracao_exercicio INTEGER, -- minutos
    
    -- Hidratação
    agua_litros REAL,
    
    -- Substâncias
    cafe_copos INTEGER,
    bebidas_alcoolicas INTEGER,
    fumou INTEGER CHECK (fumou IN (0, 1)),
    
    -- Medicamentos
    medicamentos_tomados TEXT, -- JSON array
    esqueceu_medicamento INTEGER CHECK (esqueceu_medicamento IN (0, 1)),
    
    -- Trabalho
    horas_trabalho REAL,
    pausas_regulares INTEGER CHECK (pausas_regulares IN (0, 1)),
    estresse_trabalho INTEGER CHECK (estresse_trabalho >= 1 AND estresse_trabalho <= 10),
    
    -- Social
    contato_social INTEGER CHECK (contato_social IN (0, 1)),
    atividades_lazer INTEGER CHECK (atividades_lazer IN (0, 1)),
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(paciente_id, data)
);

-- ============================================
-- MÓDULO: SCORE CLÍNICO (Diferencial)
-- ============================================

CREATE TABLE IF NOT EXISTS score_calculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    
    -- Scores individuais (0-100)
    score_mental INTEGER CHECK (score_mental >= 0 AND score_mental <= 100),
    score_fisico INTEGER CHECK (score_fisico >= 0 AND score_fisico <= 100),
    score_sono INTEGER CHECK (score_sono >= 0 AND score_sono <= 100),
    score_habitos INTEGER CHECK (score_habitos >= 0 AND score_habitos <= 100),
    
    -- Score geral ponderado
    score_geral INTEGER CHECK (score_geral >= 0 AND score_geral <= 100),
    
    -- Tendência (comparado com período anterior)
    tendencia TEXT CHECK (tendencia IN ('melhora', 'estavel', 'piora')),
    variacao INTEGER, -- variação em pontos percentuais
    
    -- Alertas gerados
    alertas TEXT, -- JSON array
    
    -- Metadados do cálculo
    periodo_dias INTEGER DEFAULT 7,
    calculado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS score_alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('critico', 'atencao', 'info')),
    categoria TEXT NOT NULL CHECK (categoria IN ('humor', 'energia', 'sono', 'habitos', 'geral')),
    mensagem TEXT NOT NULL,
    valor_atual INTEGER,
    valor_referencia INTEGER,
    lido INTEGER DEFAULT 0,
    lido_em DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MÓDULO: CORRELAÇÃO (Diferencial)
-- ============================================

CREATE TABLE IF NOT EXISTS correlacoes_encontradas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    
    -- O que foi correlacionado
    fator_a TEXT NOT NULL, -- ex: "horas_sono"
    fator_b TEXT NOT NULL, -- ex: "humor"
    
    -- Resultado
    tipo_correlacao TEXT CHECK (tipo_correlacao IN ('positiva', 'negativa', 'neutra')),
    forca REAL CHECK (forca >= -1 AND forca <= 1), -- coeficiente de correlação
    significancia TEXT CHECK (significancia IN ('alta', 'media', 'baixa')),
    
    -- Contexto
    periodo_analise INTEGER, -- dias analisados
    amostras INTEGER, -- quantidade de dados
    
    -- Descrição gerada
    descricao TEXT,
    sugestao_ia TEXT,
    
    -- Status
    confirmada INTEGER DEFAULT 0, -- paciente confirmou que faz sentido
    rejeitada INTEGER DEFAULT 0,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS correlacoes_sugestoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    correlacao_id INTEGER REFERENCES correlacoes_encontradas(id),
    
    sugestao TEXT NOT NULL,
    categoria TEXT CHECK (categoria IN ('sono', 'alimentacao', 'exercicio', 'trabalho', 'social', 'geral')),
    
    -- Acompanhamento
    aceita INTEGER DEFAULT 0,
    implementada INTEGER DEFAULT 0,
    resultado_avaliacao INTEGER CHECK (resultado_avaliacao >= 1 AND resultado_avaliacao <= 5),
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizada_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MÓDULO: MEDICINA DO TRABALHO (Diferencial)
-- ============================================

CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj TEXT UNIQUE,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    telefone TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    responsavel_telefone TEXT,
    ativa INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER UNIQUE REFERENCES pacientes(id),
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    matricula TEXT,
    cargo TEXT,
    setor TEXT,
    data_admissao DATE,
    tipo_contrato TEXT CHECK (tipo_contrato IN ('clt', 'pj', 'estagio', 'temporario')),
    ativo INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aso_exames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    tipo_aso TEXT NOT NULL CHECK (tipo_aso IN ('admissional', 'demissional', 'periodico', 'retorno', 'mudanca_funcao')),
    
    -- Dados do ASO
    data_aso DATE NOT NULL,
    data_validade DATE,
    apto INTEGER CHECK (apto IN (0, 1)),
    restricoes TEXT,
    observacoes TEXT,
    
    -- Exames realizados
    exames TEXT, -- JSON array
    
    -- Médico responsável
    medico_id INTEGER REFERENCES medicos(id),
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ppp_perfil (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL,
    
    -- Fatores de risco
    agentes_fisicos TEXT, -- JSON
    agentes_quimicos TEXT, -- JSON
    agentes_biologicos TEXT, -- JSON
    agentes_ergonomicos TEXT, -- JSON
    
    -- Medidas de controle
    epi TEXT, -- JSON
    epc TEXT, -- JSON
    
    -- Monitoramento
    exames_monitoramento TEXT, -- JSON
    
    medico_responsavel_id INTEGER REFERENCES medicos(id),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(funcionario_id, ano)
);

-- ============================================
-- MÓDULO: RELATÓRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS relatorios_gerados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id INTEGER REFERENCES medicos(id),
    empresa_id INTEGER REFERENCES empresas(id),
    
    tipo TEXT NOT NULL CHECK (tipo IN ('semanal', 'mensal', 'trimestral', 'aso', 'ppp', 'gestao')),
    periodo_inicio DATE,
    periodo_fim DATE,
    
    -- Conteúdo
    dados_json TEXT NOT NULL,
    insights_ia TEXT,
    
    -- Arquivo
    arquivo_path TEXT,
    arquivo_tamanho INTEGER,
    
    -- Status
    gerado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    enviado INTEGER DEFAULT 0,
    enviado_em DATETIME
);

-- ============================================
-- MÓDULO: IA / INSIGHTS
-- ============================================

CREATE TABLE IF NOT EXISTS ia_interacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    
    tipo TEXT NOT NULL CHECK (tipo IN ('chat', 'insight_checkin', 'insight_relatorio', 'sugestao_correlacao')),
    
    -- Entrada e saída
    prompt TEXT,
    contexto TEXT, -- JSON com dados relevantes
    resposta TEXT,
    
    -- Modelo usado
    modelo TEXT,
    tokens_entrada INTEGER,
    tokens_saida INTEGER,
    tempo_resposta_ms INTEGER,
    
    -- Feedback
    util INTEGER CHECK (util IN (0, 1)),
    feedback_texto TEXT,
    
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_checkins_paciente_data ON checkins(paciente_id, data);
CREATE INDEX IF NOT EXISTS idx_habitos_paciente_data ON habitos_registro(paciente_id, data);
CREATE INDEX IF NOT EXISTS idx_score_paciente_data ON score_calculos(paciente_id, data);
CREATE INDEX IF NOT EXISTS idx_correlacoes_paciente ON correlacoes_encontradas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_alertas_paciente ON score_alertas(paciente_id, lido);
CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON funcionarios(empresa_id);
