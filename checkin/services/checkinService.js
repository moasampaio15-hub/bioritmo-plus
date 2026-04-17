const { run, query, queryOne, transaction } = require('../../core/database/connection');

class CheckinService {
    // Criar check-in diário
    async criar(dados) {
        const {
            paciente_id,
            data,
            hora,
            humor,
            energia,
            sono,
            horas_sono,
            qualidade_sono,
            acordou_descansado,
            sintomas,
            intensidade_sintomas,
            local,
            momento_dia,
            notas
        } = dados;
        
        // Converter sintomas array para JSON se necessário
        const sintomasJson = Array.isArray(sintomas) ? JSON.stringify(sintomas) : sintomas;
        
        const result = await run(
            `INSERT INTO checkins 
             (paciente_id, data, hora, humor, energia, sono, horas_sono, qualidade_sono, 
              acordou_descansado, sintomas, intensidade_sintomas, local, momento_dia, notas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [paciente_id, data, hora, humor, energia, sono, horas_sono, qualidade_sono,
             acordou_descansado ? 1 : 0, sintomasJson, intensidade_sintomas, local, momento_dia, notas]
        );
        
        return this.buscarPorId(result.lastInsertRowid);
    }
    
    // Buscar check-in por ID
    async buscarPorId(id) {
        const checkin = await queryOne('SELECT * FROM checkins WHERE id = ?', [id]);
        if (checkin && checkin.sintomas) {
            try {
                checkin.sintomas = JSON.parse(checkin.sintomas);
            } catch {
                checkin.sintomas = [];
            }
        }
        return checkin;
    }
    
    // Listar check-ins de um paciente
    async listarPorPaciente(pacienteId, filtros = {}) {
        let sql = 'SELECT * FROM checkins WHERE paciente_id = ?';
        const params = [pacienteId];
        
        if (filtros.data_inicio) {
            sql += ' AND data >= ?';
            params.push(filtros.data_inicio);
        }
        
        if (filtros.data_fim) {
            sql += ' AND data <= ?';
            params.push(filtros.data_fim);
        }
        
        if (filtros.momento_dia) {
            sql += ' AND momento_dia = ?';
            params.push(filtros.momento_dia);
        }
        
        sql += ' ORDER BY data DESC, hora DESC';
        
        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }
        
        const checkins = await query(sql, params);
        
        // Parse sintomas
        return checkins.map(c => {
            if (c.sintomas) {
                try {
                    c.sintomas = JSON.parse(c.sintomas);
                } catch {
                    c.sintomas = [];
                }
            }
            return c;
        });
    }
    
    // Verificar se já existe check-in para o momento do dia
    async existeCheckinHoje(pacienteId, momento_dia) {
        const hoje = new Date().toISOString().split('T')[0];
        const existe = await queryOne(
            'SELECT id FROM checkins WHERE paciente_id = ? AND data = ? AND momento_dia = ?',
            [pacienteId, hoje, momento_dia]
        );
        return !!existe;
    }
    
    // Atualizar check-in
    async atualizar(id, dados) {
        const campos = [];
        const valores = [];
        
        const permitidos = ['humor', 'energia', 'sono', 'horas_sono', 'qualidade_sono', 
                           'acordou_descansado', 'sintomas', 'intensidade_sintomas', 'local', 'notas'];
        
        for (const [key, value] of Object.entries(dados)) {
            if (permitidos.includes(key)) {
                campos.push(`${key} = ?`);
                if (key === 'sintomas' && Array.isArray(value)) {
                    valores.push(JSON.stringify(value));
                } else if (key === 'acordou_descansado') {
                    valores.push(value ? 1 : 0);
                } else {
                    valores.push(value);
                }
            }
        }
        
        if (campos.length === 0) return null;
        
        valores.push(id);
        await run(`UPDATE checkins SET ${campos.join(', ')} WHERE id = ?`, valores);
        
        return this.buscarPorId(id);
    }
    
    // Excluir check-in
    async excluir(id) {
        const result = await run('DELETE FROM checkins WHERE id = ?', [id]);
        return result.changes > 0;
    }
    
    // Estatísticas do período
    async estatisticasPeriodo(pacienteId, dias = 7) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - dias);
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        
        const checkins = await query(
            `SELECT * FROM checkins 
             WHERE paciente_id = ? AND data >= ?
             ORDER BY data DESC`,
            [pacienteId, dataInicioStr]
        );
        
        if (checkins.length === 0) {
            return {
                total: 0,
                mediaHumor: null,
                mediaEnergia: null,
                mediaSono: null,
                tendencia: null
            };
        }
        
        // Calcular médias
        const soma = {
            humor: 0,
            energia: 0,
            sono: 0
        };
        
        checkins.forEach(c => {
            soma.humor += c.humor || 0;
            soma.energia += c.energia || 0;
            soma.sono += c.sono || 0;
        });
        
        const total = checkins.length;
        
        return {
            total,
            periodoDias: dias,
            mediaHumor: parseFloat((soma.humor / total).toFixed(1)),
            mediaEnergia: parseFloat((soma.energia / total).toFixed(1)),
            mediaSono: parseFloat((soma.sono / total).toFixed(1)),
            checkinsPorDia: parseFloat((total / dias).toFixed(1)),
            ultimoCheckin: checkins[0]
        };
    }
    
    // Resumo para dashboard
    async resumoDashboard(pacienteId) {
        const hoje = new Date().toISOString().split('T')[0];
        
        // Check-in de hoje
        const checkinHoje = await query(
            'SELECT * FROM checkins WHERE paciente_id = ? AND data = ? ORDER BY hora DESC',
            [pacienteId, hoje]
        );
        
        // Sequência de dias consecutivos
        const streak = await this.calcularStreak(pacienteId);
        
        // Estatísticas da semana
        const statsSemana = await this.estatisticasPeriodo(pacienteId, 7);
        
        return {
            checkinsHoje: checkinHoje.map(c => {
                if (c.sintomas) {
                    try { c.sintomas = JSON.parse(c.sintomas); } catch {}
                }
                return c;
            }),
            streakDias: streak,
            statsSemana,
            proximoCheckin: this.sugerirProximoCheckin(checkinHoje)
        };
    }
    
    // Calcular sequência de dias consecutivos com check-in
    async calcularStreak(pacienteId) {
        const checkins = await query(
            'SELECT DISTINCT data FROM checkins WHERE paciente_id = ? ORDER BY data DESC',
            [pacienteId]
        );
        
        if (checkins.length === 0) return 0;
        
        let streak = 1;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Verificar se fez check-in hoje ou ontem
        const ultimaData = new Date(checkins[0].data);
        ultimaData.setHours(0, 0, 0, 0);
        
        const diffDias = Math.floor((hoje - ultimaData) / (1000 * 60 * 60 * 24));
        if (diffDias > 1) return 0; // Quebrou a sequência
        
        // Contar dias consecutivos
        for (let i = 1; i < checkins.length; i++) {
            const dataAtual = new Date(checkins[i - 1].data);
            const dataAnterior = new Date(checkins[i].data);
            
            const diff = Math.floor((dataAtual - dataAnterior) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Sugerir próximo momento para check-in
    sugerirProximoCheckin(checkinsHoje) {
        const momentosFeitos = checkinsHoje.map(c => c.momento_dia);
        
        if (!momentosFeitos.includes('manha')) {
            return { sugerido: 'manha', label: 'Manhã', motivo: 'Ainda não fez check-in hoje' };
        }
        if (!momentosFeitos.includes('tarde')) {
            return { sugerido: 'tarde', label: 'Tarde', motivo: 'Check-in da manhã já registrado' };
        }
        if (!momentosFeitos.includes('noite')) {
            return { sugerido: 'noite', label: 'Noite', motivo: 'Fechamento do dia' };
        }
        
        return { sugerido: null, label: null, motivo: 'Todos os check-ins de hoje completos!' };
    }
}

module.exports = new CheckinService();
