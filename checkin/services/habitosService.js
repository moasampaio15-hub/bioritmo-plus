const { run, query, queryOne } = require('../../core/database/connection');

class HabitosService {
    // Registrar hábitos do dia
    async registrar(dados) {
        const {
            paciente_id,
            data,
            refeicoes_regulares,
            alimentacao_saudavel,
            exercicio,
            tipo_exercicio,
            duracao_exercicio,
            agua_litros,
            cafe_copos,
            bebidas_alcoolicas,
            fumou,
            medicamentos_tomados,
            esqueceu_medicamento,
            horas_trabalho,
            pausas_regulares,
            estresse_trabalho,
            contato_social,
            atividades_lazer
        } = dados;
        
        const medicamentosJson = Array.isArray(medicamentos_tomados) 
            ? JSON.stringify(medicamentos_tomados) 
            : medicamentos_tomados;
        
        const result = await run(
            `INSERT INTO habitos_registro 
             (paciente_id, data, refeicoes_regulares, alimentacao_saudavel, exercicio, 
              tipo_exercicio, duracao_exercicio, agua_litros, cafe_copos, bebidas_alcoolicas,
              fumou, medicamentos_tomados, esqueceu_medicamento, horas_trabalho,
              pausas_regulares, estresse_trabalho, contato_social, atividades_lazer)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(paciente_id, data) DO UPDATE SET
             refeicoes_regulares = excluded.refeicoes_regulares,
             alimentacao_saudavel = excluded.alimentacao_saudavel,
             exercicio = excluded.exercicio,
             tipo_exercicio = excluded.tipo_exercicio,
             duracao_exercicio = excluded.duracao_exercicio,
             agua_litros = excluded.agua_litros,
             cafe_copos = excluded.cafe_copos,
             bebidas_alcoolicas = excluded.bebidas_alcoolicas,
             fumou = excluded.fumou,
             medicamentos_tomados = excluded.medicamentos_tomados,
             esqueceu_medicamento = excluded.esqueceu_medicamento,
             horas_trabalho = excluded.horas_trabalho,
             pausas_regulares = excluded.pausas_regulares,
             estresse_trabalho = excluded.estresse_trabalho,
            contato_social = excluded.contato_social,
             atividades_lazer = excluded.atividades_lazer,
             atualizada_em = CURRENT_TIMESTAMP`,
            [paciente_id, data, refeicoes_regulares ? 1 : 0, alimentacao_saudavel, exercicio ? 1 : 0,
             tipo_exercicio, duracao_exercicio, agua_litros, cafe_copos, bebidas_alcoolicas,
             fumou ? 1 : 0, medicamentosJson, esqueceu_medicamento ? 1 : 0, horas_trabalho,
             pausas_regulares ? 1 : 0, estresse_trabalho, contato_social ? 1 : 0, atividades_lazer ? 1 : 0]
        );
        
        return this.buscar(paciente_id, data);
    }
    
    // Buscar hábitos de um dia específico
    async buscar(pacienteId, data) {
        const habito = await queryOne(
            'SELECT * FROM habitos_registro WHERE paciente_id = ? AND data = ?',
            [pacienteId, data]
        );
        
        if (habito && habito.medicamentos_tomados) {
            try {
                habito.medicamentos_tomados = JSON.parse(habito.medicamentos_tomados);
            } catch {
                habito.medicamentos_tomados = [];
            }
        }
        
        return habito;
    }
    
    // Listar hábitos de um período
    async listarPeriodo(pacienteId, dataInicio, dataFim) {
        const habitos = await query(
            `SELECT * FROM habitos_registro 
             WHERE paciente_id = ? AND data BETWEEN ? AND ?
             ORDER BY data DESC`,
            [pacienteId, dataInicio, dataFim]
        );
        
        return habitos.map(h => {
            if (h.medicamentos_tomados) {
                try {
                    h.medicamentos_tomados = JSON.parse(h.medicamentos_tomados);
                } catch {
                    h.medicamentos_tomados = [];
                }
            }
            return h;
        });
    }
    
    // Médias do período (para correlação)
    async mediasPeriodo(pacienteId, dias = 7) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - dias);
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        
        const result = await queryOne(
            `SELECT 
                AVG(alimentacao_saudavel) as media_alimentacao,
                AVG(duracao_exercicio) as media_exercicio_min,
                AVG(agua_litros) as media_agua,
                AVG(cafe_copos) as media_cafe,
                AVG(horas_trabalho) as media_horas_trabalho,
                AVG(estresse_trabalho) as media_estresse,
                SUM(CASE WHEN exercicio = 1 THEN 1 ELSE 0 END) as dias_com_exercicio,
                SUM(CASE WHEN refeicoes_regulares = 1 THEN 1 ELSE 0 END) as dias_refeicoes_regulares,
                SUM(CASE WHEN pausas_regulares = 1 THEN 1 ELSE 0 END) as dias_com_pausas,
                COUNT(*) as total_dias
             FROM habitos_registro 
             WHERE paciente_id = ? AND data >= ?`,
            [pacienteId, dataInicioStr]
        );
        
        return {
            periodoDias: dias,
            ...result,
            percentualDiasExercicio: result.total_dias > 0 
                ? Math.round((result.dias_com_exercicio / result.total_dias) * 100) 
                : 0,
            percentualRefeicoesRegulares: result.total_dias > 0 
                ? Math.round((result.dias_refeicoes_regulares / result.total_dias) * 100) 
                : 0
        };
    }
}

module.exports = new HabitosService();
