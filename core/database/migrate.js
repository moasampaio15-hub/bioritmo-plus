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

async function initMigrationsTable() {
    await exec(MIGRATIONS_TABLE);
}

async function getAppliedMigrations() {
    try {
        const rows = await query('SELECT nome FROM _migrations');
        return rows.map(m => m.nome);
    } catch {
        return [];
    }
}

async function recordMigration(nome) {
    await run('INSERT INTO _migrations (nome) VALUES (?)', [nome]);
}

async function applySchema() {
    console.log('[MIGRATE] Aplicando schema principal...');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    await exec(schema);
    console.log('[MIGRATE] Schema aplicado com sucesso');
}

async function migrate() {
    console.log('[MIGRATE] Iniciando migrações...');
    
    await initMigrationsTable();
    
    const applied = await getAppliedMigrations();
    
    // Schema principal
    if (!applied.includes('schema_inicial')) {
        await applySchema();
        await recordMigration('schema_inicial');
    }
    
    console.log('[MIGRATE] Migrações concluídas');
    console.log('[MIGRATE] Total de migrações aplicadas:', (await getAppliedMigrations()).length);
}

// Executar se chamado diretamente
if (require.main === module) {
    migrate().then(() => process.exit(0)).catch(err => {
        console.error('[MIGRATE] Erro:', err);
        process.exit(1);
    });
}

module.exports = { migrate };
