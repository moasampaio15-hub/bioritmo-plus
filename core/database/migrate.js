const fs = require('fs');
const path = require('path');
const { getConnection, run, query, exec } = require('./connection');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Tabela de controle de migrações
const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    aplicada_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

function initMigrationsTable() {
    exec(MIGRATIONS_TABLE);
}

function getAppliedMigrations() {
    try {
        const rows = query('SELECT nome FROM _migrations');
        return rows.map(m => m.nome);
    } catch {
        return [];
    }
}

function recordMigration(nome) {
    run('INSERT INTO _migrations (nome) VALUES (?)', [nome]);
}

function applySchema() {
    console.log('[MIGRATE] Aplicando schema principal...');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    exec(schema);
    console.log('[MIGRATE] Schema aplicado com sucesso');
}

function migrate() {
    console.log('[MIGRATE] Iniciando migrações...');

    initMigrationsTable();

    const applied = getAppliedMigrations();

    // Schema principal
    if (!applied.includes('schema_inicial')) {
        applySchema();
        recordMigration('schema_inicial');
    }

    console.log('[MIGRATE] Migrações concluídas');
    console.log('[MIGRATE] Total de migrações aplicadas:', getAppliedMigrations().length);
}

// Executar se chamado diretamente
if (require.main === module) {
    try {
        migrate();
        process.exit(0);
    } catch (err) {
        console.error('[MIGRATE] Erro:', err);
        process.exit(1);
    }
}

module.exports = { migrate };
