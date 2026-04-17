const { run, query, queryOne } = require('../../core/database/connection');

/**
 * Service de Medicina do Trabalho
 * Gestão de empresas, funcionários, ASO e PPP
 */
class TrabalhoService {
    
    // ============================================
    // EMPRESAS
    // ============================================
    
    async criarEmpresa(dados) {
        const { cnpj, razao_social, nome_fantasia, endereco, cidade, estado, 
                telefone, responsavel_nome, responsavel_email, responsavel_telefone } = dados;
        
        const result = await run(
            `INSERT INTO empresas (cnpj, razao_social, nome_fantasia, endereco, cidade, estado,
             telefone, responsavel_nome, responsavel_email, responsavel_telefone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [cnpj, razao_social, nome_fantasia, endereco, cidade, estado,
             telefone, responsavel_nome, responsavel_email, responsavel_telefone]
        );
        
        return this.buscarEmpresa(result.lastInsertRowid);
    }
    
    async buscarEmpresa(id) {
        return queryOne('SELECT * FROM empresas WHERE id = ?', [id]);
    }
    
    async listarEmpresas(filtros = {}) {
        let sql = 'SELECT * FROM empresas WHERE ativa = 1';
        const params = [];
        
        if (filtros.nome) {
            sql += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ?)';
            params.push(`%${filtros.nome}%`, `%${filtros.nome}%`);
        }
        
        if (filtros.cidade) {
            sql += ' AND cidade = ?';
            params.push(filtros.cidade);
        }
        
        sql += ' ORDER BY razao_social';
        
        return query(sql, params);
    }
    
    async atualizarEmpresa(id, dados) {
        const campos = [];
        const valores = [];
        
        const permitidos = ['razao_social', 'nome_fantasia', 'endereco', 'cidade', 'estado',
                          'telefone', 'responsavel_nome', 'responsavel_email', 'responsavel_telefone'];
        
        for (const [key, value] of Object.entries(dados)) {
            if (permitidos.includes(key)) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        }
        
        if (campos.length === 0) return null;
        
        valores.push(id);
        await run(`UPDATE empresas SET ${campos.join(', ')} WHERE id = ?`, valores);
        
        return this.buscarEmpresa(id);
    }
    
    // ============================================
    // FUNCIONÁRIOS
    // ============================================
    
    async vincularFuncionario(dados) {
        const { paciente_id, empresa_id, matricula, cargo, setor, data_admissao, tipo_contrato } = dados;
        
        // Verificar se já existe vínculo ativo
        const existe = await queryOne(
            'SELECT * FROM funcionarios WHERE paciente_id = ? AND ativo = 1',
            [paciente_id]
        );
        
        if (existe) {
            throw new Error('Paciente já é funcionário de outra empresa');
        }
        
        const result = await run(
            `INSERT INTO funcionarios (paciente_id, empresa_id, matricula, cargo, setor, data_admissao, tipo_contrato)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [paciente_id, empresa_id, matricula, cargo, setor, data_admissao, tipo_contrato]
        );
        
        // Atualizar empresa no paciente
        await run('UPDATE pacientes SET empresa_id = ? WHERE id = ?', [empresa_id, paciente_id]);
        
        return this.buscarFuncionario(result.lastInsertRowid);
    }
    
    async buscarFuncionario(id) {
        return queryOne(`
            SELECT f.*, u.nome, u.email, u.telefone, e.razao_social, e.nome_fantasia
            FROM funcionarios f
            JOIN pacientes p ON f.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.id = ?
        `, [id]);
    }
    
    async listarFuncionariosEmpresa(empresaId, filtros = {}) {
        let sql = `
            SELECT f.*, u.nome, u.email, u.telefone, p.id as paciente_id
            FROM funcionarios f
            JOIN pacientes p ON f.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE f.empresa_id = ? AND f.ativo = 1
        `;
        const params = [empresaId];
        
        if (filtros.setor) {
            sql += ' AND f.setor = ?';
            params.push(filtros.setor);
        }
        
        if (filtros.nome) {
            sql += ' AND u.nome LIKE ?';
            params.push(`%${filtros.nome}%`);
        }
        
        sql += ' ORDER BY u.nome';
        
        return query(sql, params);
    }
    
    async desligarFuncionario(id, dataDemissao) {
        await run(
            'UPDATE funcionarios SET ativo = 0, data_demissao = ? WHERE id = ?',
            [dataDemissao, id]
        );
        return { desligado: true };
    }
    
    // ============================================
    // ASO (Atestado de Saúde Ocupacional)
    // ============================================
    
    async criarASO(dados) {
        const { funcionario_id, tipo_aso, data_aso, data_validade, apto, 
                restricoes, observacoes, exames, medico_id } = dados;
        
        const examesJson = Array.isArray(exames) ? JSON.stringify(exames) : exames;
        
        const result = await run(
            `INSERT INTO aso_exames (funcionario_id, tipo_aso, data_aso, data_validade, apto,
             restricoes, observacoes, exames, medico_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [funcionario_id, tipo_aso, data_aso, data_validade, apto ? 1 : 0,
             restricoes, observacoes, examesJson, medico_id]
        );
        
        return this.buscarASO(result.lastInsertRowid);
    }
    
    async buscarASO(id) {
        const aso = await queryOne(`
            SELECT a.*, u.nome as funcionario_nome, m.crm, um.nome as medico_nome
            FROM aso_exames a
            JOIN funcionarios f ON a.funcionario_id = f.id
            JOIN pacientes p ON f.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN medicos m ON a.medico_id = m.id
            LEFT JOIN usuarios um ON m.usuario_id = um.id
            WHERE a.id = ?
        `, [id]);
        
        if (aso && aso.exames) {
            try { aso.exames = JSON.parse(aso.exames); } catch {}
        }
        
        return aso;
    }
    
    async listarASOsFuncionario(funcionarioId) {
        const asos = await query(
            `SELECT a.*, um.nome as medico_nome
             FROM aso_exames a
             LEFT JOIN medicos m ON a.medico_id = m.id
             LEFT JOIN usuarios um ON m.usuario_id = um.id
             WHERE a.funcionario_id = ?
             ORDER BY a.data_aso DESC`,
            [funcionarioId]
        );
        
        return asos.map(a => {
            if (a.exames) {
                try { a.exames = JSON.parse(a.exames); } catch {}
            }
            return a;
        });
    }
    
    async listarASOsVencendo(dias = 30) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + dias);
        
        return query(`
            SELECT a.*, u.nome as funcionario_nome, e.razao_social
            FROM aso_exames a
            JOIN funcionarios f ON a.funcionario_id = f.id
            JOIN pacientes p ON f.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN empresas e ON f.empresa_id = e.id
            WHERE a.data_validade <= ? AND a.data_validade >= date('now')
            ORDER BY a.data_validade
        `, [dataLimite.toISOString().split('T')[0]]);
    }
    
    // ============================================
    // PPP (Perfil Profissiográfico Previdenciário)
    // ============================================
    
    async criarPPP(dados) {
        const { funcionario_id, ano, agentes_fisicos, agentes_quimicos, agentes_biologicos,
                agentes_ergonomicos, epi, epc, exames_monitoramento, medico_responsavel_id } = dados;
        
        const result = await run(
            `INSERT INTO ppp_perfil (funcionario_id, ano, agentes_fisicos, agentes_quimicos,
             agentes_biologicos, agentes_ergonomicos, epi, epc, exames_monitoramento, medico_responsavel_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(funcionario_id, ano) DO UPDATE SET
             agentes_fisicos = excluded.agentes_fisicos,
             agentes_quimicos = excluded.agentes_quimicos,
             agentes_biologicos = excluded.agentes_biologicos,
             agentes_ergonomicos = excluded.agentes_ergonomicos,
             epi = excluded.epi,
             epc = excluded.epc,
             exames_monitoramento = excluded.exames_monitoramento,
             medico_responsavel_id = excluded.medico_responsavel_id`,
            [funcionario_id, ano, 
             JSON.stringify(agentes_fisicos), JSON.stringify(agentes_quimicos),
             JSON.stringify(agentes_biologicos), JSON.stringify(agentes_ergonomicos),
             JSON.stringify(epi), JSON.stringify(epc),
             JSON.stringify(exames_monitoramento), medico_responsavel_id]
        );
        
        return this.buscarPPP(funcionario_id, ano);
    }
    
    async buscarPPP(funcionarioId, ano) {
        const ppp = await queryOne(`
            SELECT p.*, u.nome as funcionario_nome, um.nome as medico_nome
            FROM ppp_perfil p
            JOIN funcionarios f ON p.funcionario_id = f.id
            JOIN pacientes pa ON f.paciente_id = pa.id
            JOIN usuarios u ON pa.usuario_id = u.id
            LEFT JOIN medicos m ON p.medico_responsavel_id = m.id
            LEFT JOIN usuarios um ON m.usuario_id = um.id
            WHERE p.funcionario_id = ? AND p.ano = ?
        `, [funcionarioId, ano]);
        
        if (ppp) {
            ['agentes_fisicos', 'agentes_quimicos', 'agentes_biologicos', 
             'agentes_ergonomicos', 'epi', 'epc', 'exames_monitoramento'].forEach(campo => {
                if (ppp[campo]) {
                    try { ppp[campo] = JSON.parse(ppp[campo]); } catch {}
                }
            });
        }
        
        return ppp;
    }
    
    async listarPPPsFuncionario(funcionarioId) {
        const ppps = await query(
            'SELECT * FROM ppp_perfil WHERE funcionario_id = ? ORDER BY ano DESC',
            [funcionarioId]
        );
        
        return ppps.map(p => {
            ['agentes_fisicos', 'agentes_quimicos', 'agentes_biologicos', 
             'agentes_ergonomicos', 'epi', 'epc', 'exames_monitoramento'].forEach(campo => {
                if (p[campo]) {
                    try { p[campo] = JSON.parse(p[campo]); } catch {}
                }
            });
            return p;
        });
    }
    
    // ============================================
    // DASHBOARD / RELATÓRIOS
    // ============================================
    
    async dashboardEmpresa(empresaId) {
        // Total funcionários
        const funcionarios = await queryOne(
            'SELECT COUNT(*) as total FROM funcionarios WHERE empresa_id = ? AND ativo = 1',
            [empresaId]
        );
        
        // ASOs por tipo
        const asosPorTipo = await query(`
            SELECT tipo_aso, COUNT(*) as quantidade
            FROM aso_exames a
            JOIN funcionarios f ON a.funcionario_id = f.id
            WHERE f.empresa_id = ?
            AND a.data_aso >= date('now', '-1 year')
            GROUP BY tipo_aso
        `, [empresaId]);
        
        // ASOs vencendo em 30 dias
        const vencendo = await this.listarASOsVencendo(30);
        const vencendoEmpresa = vencendo.filter(a => a.empresa_id === empresaId);
        
        // Funcionários por setor
        const porSetor = await query(`
            SELECT setor, COUNT(*) as quantidade
            FROM funcionarios
            WHERE empresa_id = ? AND ativo = 1
            GROUP BY setor
        `, [empresaId]);
        
        return {
            resumo: {
                totalFuncionarios: funcionarios.total,
                asosVencendo30Dias: vencendoEmpresa.length
            },
            asosPorTipo,
            distribuicaoSetores: porSetor,
            alertasVencimento: vencendoEmpresa.slice(0, 10)
        };
    }
}

module.exports = new TrabalhoService();
