const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'bioritmo-v2.db');

// Garantir que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Conexão singleton
let db = null;

function getConnection() {
    if (!db) {
        try {
            db = new Database(DB_PATH);
            console.log('[DB] Conexão estabelecida:', DB_PATH);
            
            // Habilitar foreign keys
            db.pragma('foreign_keys = ON');
        } catch (err) {
            console.error('[DB] Erro ao conectar:', err.message);
            throw err;
        }
    }
    return db;
}

function closeConnection() {
    if (db) {
        try {
            db.close();
            console.log('[DB] Conexão fechada');
        } catch (err) {
            console.error('[DB] Erro ao fechar:', err.message);
        }
        db = null;
    }
}

// Helpers para queries (síncronos com better-sqlite3)
function query(sql, params = []) {
    const conn = getConnection();
    return conn.prepare(sql).all(...params);
}

function queryOne(sql, params = []) {
    const conn = getConnection();
    return conn.prepare(sql).get(...params);
}

function run(sql, params = []) {
    const conn = getConnection();
    const result = conn.prepare(sql).run(...params);
    return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes
    };
}

function exec(sql) {
    const conn = getConnection();
    conn.exec(sql);
}

// Transaction helper
function transaction(fn) {
    const conn = getConnection();
    conn.prepare('BEGIN TRANSACTION').run();
    try {
        const result = fn();
        conn.prepare('COMMIT').run();
        return result;
    } catch (err) {
        conn.prepare('ROLLBACK').run();
        throw err;
    }
}

module.exports = {
    getConnection,
    closeConnection,
    query,
    queryOne,
    run,
    exec,
    transaction,
    DB_PATH
};
