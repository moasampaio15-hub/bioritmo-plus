const express = require('express');
const path = require('path');

// Registry de módulos
const modules = new Map();

function registerModule(name, routes) {
    modules.set(name, routes);
    console.log(`[ROUTER] Módulo registrado: ${name}`);
}

function createRouter() {
    const router = express.Router();
    
    // Health check
    router.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            modules: Array.from(modules.keys())
        });
    });
    
    // Montar rotas de cada módulo
    for (const [name, routes] of modules) {
        router.use(`/${name}`, routes);
    }
    
    return router;
}

module.exports = {
    registerModule,
    createRouter
};
