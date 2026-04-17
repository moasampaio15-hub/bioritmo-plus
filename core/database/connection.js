const sqlite3 = require('sqlite3').verbose();
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
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('[DB] Erro ao conectar:', err.message);
            } else {
                console.log('[DB] Conexão estabelecida:', DB_PATH);
            }
        });
        
        // Habilitar foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
    return db;
}

function closeConnection() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('[DB] Erro ao fechar:', err.message);
            } else {
                console.log('[DB] Conexão fechada');
            }
        });
        db = null;
    }
}

// Helpers para queries (Promise-based)
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        const conn = getConnection();
        conn.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        const conn = getConnection();
        conn.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        const conn = getConnection();
        conn.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({
                lastInsertRowid: this.lastID,
                changes: this.changes
            });
        });
    });
}

function exec(sql) {
    return new Promise((resolve, reject) => {
        const conn = getConnection();
        conn.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Transaction helper
async function transaction(fn) {
    const conn = getConnection();
    await run('BEGIN TRANSACTION');
    try {
        const result = await fn();
        await run('COMMIT');
        return result;
    } catch (err) {
        await run('ROLLBACK');
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
