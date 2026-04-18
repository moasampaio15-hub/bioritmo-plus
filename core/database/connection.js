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

// Helpers para queries (Better-sqlite3 é síncrono)
function query(sql, params = []) {
    try {
        const conn = getConnection();
        const stmt = conn.prepare(sql);
        return stmt.all(...params);
    } catch (err) {
        console.error('[DB] Erro na query:', err.message);
        throw err;
    }
}

function queryOne(sql, params = []) {
    try {
        const conn = getConnection();
        const stmt = conn.prepare(sql);
        return stmt.get(...params);
    } catch (err) {
        console.error('[DB] Erro na queryOne:', err.message);
        throw err;
    }
}

function run(sql, params = []) {
    try {
        const conn = getConnection();
        const stmt = conn.prepare(sql);
        const result = stmt.run(...params);
        return {
            lastInsertRowid: result.lastInsertRowid,
            changes: result.changes
        };
    } catch (err) {
        console.error('[DB] Erro no run:', err.message);
        throw err;
    }
}

function exec(sql) {
    try {
        const conn = getConnection();
        conn.exec(sql);
    } catch (err) {
        console.error('[DB] Erro no exec:', err.message);
        throw err;
    }
}

// Transaction helper (better-sqlite3 tem transactions nativas)
function transaction(fn) {
    const conn = getConnection();
    const transactionFn = conn.transaction(fn);
    return transactionFn();
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
