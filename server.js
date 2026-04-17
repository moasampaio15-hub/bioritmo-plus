require('dotenv').config();

const express = require('express');
const path = require('path');

const { migrate } = require('./core/database/migrate');
const { createRouter, registerModule } = require('./core/api/router');
const {
    helmet,
    cors,
    apiLimiter,
    devLogger,
    errorHandler,
    notFoundHandler
} = require('./core/api/middleware');

const PORT = process.env.PORT || 3008;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Criar app Express
const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
if (NODE_ENV === 'development') {
    app.use(devLogger);
}

// Registrar módulos
const authRoutes = require('./auth/routes/authRoutes');
const pacienteRoutes = require('./paciente/routes/pacienteRoutes');
const checkinRoutes = require('./checkin/routes/checkinRoutes');
const scoreRoutes = require('./score/routes/scoreRoutes');
const correlacaoRoutes = require('./correlacao/routes/correlacaoRoutes');
const medicoRoutes = require('./medico/routes/medicoRoutes');
const trabalhoRoutes = require('./trabalho/routes/trabalhoRoutes');
const relatorioRoutes = require('./relatorios/routes/relatorioRoutes');

// Auth não precisa de prefixo especial, já é /api/auth
registerModule('auth', authRoutes);
registerModule('pacientes', pacienteRoutes);
registerModule('checkins', checkinRoutes);
registerModule('score', scoreRoutes);
registerModule('correlacao', correlacaoRoutes);
registerModule('medico', medicoRoutes);
registerModule('trabalho', trabalhoRoutes);
registerModule('relatorios', relatorioRoutes);

// Rate limiting em todas as rotas API
app.use('/api', apiLimiter);

// Rotas API
app.use('/api', createRouter());

// Arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback - serve index.html para rotas não-API
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// 404 e Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Inicialização
function start() {
    try {
        // Executar migrações
        migrate();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('========================================');
            console.log('🌊 Bioritmo v2.0');
            console.log('========================================');
            console.log(`Ambiente: ${NODE_ENV}`);
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`API: http://localhost:${PORT}/api`);
            console.log('========================================');
        });
    } catch (err) {
        console.error('[FATAL] Erro ao iniciar servidor:', err);
        process.exit(1);
    }
}

start();
