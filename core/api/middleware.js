const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// Rate limiting por tipo de operação
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

// CORS configurável
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Logger simples para desenvolvimento
const devLogger = morgan('dev');

// Logger para produção
const prodLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

// Error handler centralizado
function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        ...(isDev && { stack: err.stack })
    });
}

// 404 handler
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
}

module.exports = {
    helmet,
    cors: cors(corsOptions),
    apiLimiter,
    authLimiter,
    devLogger,
    prodLogger,
    errorHandler,
    notFoundHandler
};
