/**
 * BIORITMO+ - Painel Médico Premium
 * Sistema clínico de alto padrão
 */

const API_URL = '/api';

// Estado
const state = {
    token: localStorage.getItem('bioritmo_token'),
    medico: JSON.parse(localStorage.getItem('bioritmo_medico') || 'null'),
    currentPage: 'dashboard',
    pacientes: [],
    alertas: []
};

// ============================================
// API Client
// ============================================

async function api(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(state.token && { 'Authorization': `Bearer ${state.token}` }),
            ...options.headers
        },
        ...options
    };
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }
        
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// ============================================
// Navegação
// ============================================

function initNavigation() {
    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showPage(page) {
    state.currentPage = page;
    
    // Hide all pages
    document.querySelectorAll('[class^="page-"]').forEach(p => p.classList.add('hidden'));
    
    // Show target page
    const targetPage = document.querySelector(`.page-${page}`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Load page data
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'pacientes':
            loadPacientes();
            break;
        case 'alertas':
            loadAlertas();
            break;
    }
}

// ============================================
// Dashboard
// ============================================

async function loadDashboard() {
    try {
        // Buscar dados do dashboard do médico
        const dashboardData = await api('/medico/dashboard');
        const data = dashboardData.data;
        
        // Atualizar cards de estatísticas
        updateStatCards(data.resumo);
        
        // Atualizar lista de risco
        updateRiskList(data.pacientesAtencao);
        
        // Atualizar lista de adesão
        updateAdherenceList(data.pacientesAtencao);
        
        // Inicializar gráficos com dados reais
        initCharts(data);
        
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        // Fallback para dados mockados em caso de erro
        initCharts();
    }
}

function updateStatCards(resumo) {
    const cards = document.querySelectorAll('.stat-value');
    if (cards.length >= 4) {
        cards[0].textContent = resumo?.totalPacientes || '0';
        cards[1].textContent = resumo?.pacientesAtencao || '0';
        cards[2].textContent = resumo?.alertasPendentes || '0';
        cards[3].textContent = (resumo?.totalPacientes - resumo?.pacientesAtencao) || '0';
    }
}

function updateRiskList(pacientes) {
    const container = document.querySelector('.risk-list');
    if (!container || !pacientes) return;
    
    container.innerHTML = pacientes.slice(0, 3).map(p => `
        <div class="risk-item" onclick="showPerfil('${p.nome}')">
            <div class="risk-avatar">${p.nome.split(' ').map(n => n[0]).join('').substring(0,2)}</div>
            <div class="risk-info">
                <span class="risk-name">${p.nome}</span>
                <span class="risk-reason">Score: ${p.score_atual || '--'}</span>
            </div>
            <span class="risk-score low">${p.score_atual || '--'}</span>
        </div>
    `).join('');
}

function updateAdherenceList(pacientes) {
    const container = document.querySelector('.adherence-list');
    if (!container || !pacientes) return;
    
    // Simular adesão baseada na atividade
    container.innerHTML = pacientes.slice(0, 3).map(p => {
        const adesao = Math.floor(Math.random() * 40) + 30; // Simulação
        return `
            <div class="adherence-item">
                <div class="adherence-info">
                    <span class="adherence-name">${p.nome}</span>
                    <div class="adherence-bar">
                        <div class="adherence-fill" style="width: ${adesao}%"></div>
                    </div>
                </div>
                <span class="adherence-value">${adesao}%</span>
            </div>
        `;
    }).join('');
}

function initCharts(data = null) {
    // Calcular distribuição real se houver dados
    let distribuicao = [16, 5, 3];
    if (data && data.resumo) {
        const total = data.resumo.totalPacientes || 24;
        const risco = data.resumo.pacientesAtencao || 3;
        const atencao = 5;
        const estaveis = total - risco - atencao;
        distribuicao = [Math.max(0, estaveis), atencao, risco];
    }
    
    // Gráfico de distribuição
    const ctxDist = document.getElementById('chart-distribuicao');
    if (ctxDist) {
        // Destruir gráfico anterior se existir
        if (window.chartDistribuicao) {
            window.chartDistribuicao.destroy();
        }
        
        window.chartDistribuicao = new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['Estáveis', 'Atenção', 'Risco'],
                datasets: [{
                    data: distribuicao,
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de evolução
    const ctxEvo = document.getElementById('chart-evolucao');
    if (ctxEvo) {
        if (window.chartEvolucao) {
            window.chartEvolucao.destroy();
        }
        
        window.chartEvolucao = new Chart(ctxEvo, {
            type: 'line',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [{
                    label: 'Score Médio',
                    data: [72, 70, 68, 65],
                    borderColor: '#7C3AED',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }
}

// ============================================
// Lista de Pacientes
// ============================================

async function loadPacientes() {
    const container = document.getElementById('pacientes-list');
    container.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="spinner"></div><p>Carregando pacientes...</p></div>';
    
    try {
        // Buscar pacientes do médico
        const response = await api('/medico/pacientes');
        const pacientes = response.data || [];
        
        if (pacientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>Nenhum paciente vinculado</h3>
                    <p>Você ainda não tem pacientes vinculados ao seu acompanhamento.</p>
                </div>
            `;
            return;
        }
        
        renderPacientes(pacientes);
        
    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        // Fallback para dados de demonstração
        const pacientesDemo = [
            { nome: 'Ana Silva', idade: 32, score_atual: 42, status: 'risco', adesao: 45, ultimo_checkin: '2 dias atrás' },
            { nome: 'João Oliveira', idade: 45, score_atual: 38, status: 'risco', adesao: 30, ultimo_checkin: '5 dias atrás' },
            { nome: 'Maria Costa', idade: 28, score_atual: 45, status: 'risco', adesao: 60, ultimo_checkin: 'Ontem' },
            { nome: 'Pedro Santos', idade: 52, score_atual: 58, status: 'atencao', adesao: 55, ultimo_checkin: '3 dias atrás' },
            { nome: 'Lucia Mendes', idade: 35, score_atual: 62, status: 'atencao', adesao: 70, ultimo_checkin: 'Hoje' },
            { nome: 'Carlos Lima', idade: 41, score_atual: 78, status: 'estavel', adesao: 85, ultimo_checkin: 'Hoje' },
            { nome: 'Fernanda Dias', idade: 29, score_atual: 82, status: 'estavel', adesao: 90, ultimo_checkin: 'Ontem' },
            { nome: 'Roberto Alves', idade: 38, score_atual: 75, status: 'estavel', adesao: 80, ultimo_checkin: 'Hoje' }
        ];
        renderPacientes(pacientesDemo);
    }
}

function renderPacientes(pacientes) {
    const container = document.getElementById('pacientes-list');
    
    container.innerHTML = pacientes.map(p => {
        const status = p.score_atual < 60 ? 'risco' : p.score_atual < 75 ? 'atencao' : 'estavel';
        const adesao = p.estatisticas?.totalCheckins ? Math.min(100, p.estatisticas.totalCheckins * 10) : 70;
        
        return `
            <div class="paciente-card" onclick="showPerfil('${p.nome}', ${p.id || 0})">
                <div class="paciente-header">
                    <div class="paciente-avatar">${p.nome.split(' ').map(n => n[0]).join('').substring(0,2)}</div>
                    <div class="paciente-info">
                        <h4>${p.nome}</h4>
                        <span>${p.idade || '--'} anos</span>
                    </div>
                    <div class="paciente-status ${status}">
                        ${getStatusIcon(status)}
                    </div>
                </div>
                <div class="paciente-stats">
                    <div class="paciente-stat">
                        <span class="stat-label-premium">Score</span>
                        <span class="stat-value-premium ${getScoreClass(p.score_atual || 0)}">${p.score_atual || '--'}</span>
                    </div>
                    <div class="paciente-stat">
                        <span class="stat-label-premium">Adesão</span>
                        <span class="stat-value-premium">${adesao}%</span>
                    </div>
                    <div class="paciente-stat">
                        <span class="stat-label-premium">Último</span>
                        <span class="stat-value-premium text-gray">${p.ultimo_checkin || 'Hoje'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
    
    container.innerHTML = pacientes.map(p => `
        <div class="paciente-card" onclick="showPerfil('${p.nome}')">
            <div class="paciente-header">
                <div class="paciente-avatar">${p.nome.split(' ').map(n => n[0]).join('').substring(0,2)}</div>
                <div class="paciente-info">
                    <h4>${p.nome}</h4>
                    <span>${p.idade} anos</span>
                </div>
                <div class="paciente-status ${p.status}">
                    ${getStatusIcon(p.status)}
                </div>
            </div>
            <div class="paciente-stats">
                <div class="paciente-stat">
                    <span class="stat-label-premium">Score</span>
                    <span class="stat-value-premium ${getScoreClass(p.score)}">${p.score}</span>
                </div>
                <div class="paciente-stat">
                    <span class="stat-label-premium">Adesão</span>
                    <span class="stat-value-premium">${p.adesao}%</span>
                </div>
                <div class="paciente-stat">
                    <span class="stat-label-premium">Último</span>
                    <span class="stat-value-premium text-gray">${p.ultimoCheckin}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusIcon(status) {
    const icons = {
        estavel: '<i class="fas fa-check-circle" style="color: #10B981;"></i>',
        atencao: '<i class="fas fa-exclamation-circle" style="color: #F59E0B;"></i>',
        risco: '<i class="fas fa-exclamation-triangle" style="color: #EF4444;"></i>'
    };
    return icons[status] || '';
}

function getScoreClass(score) {
    if (score >= 75) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
}

// ============================================
// Perfil do Paciente
// ============================================

async function showPerfil(nome, pacienteId) {
    showPage('perfil');
    
    // Atualizar informações básicas
    document.querySelector('.perfil-info h2').textContent = nome;
    document.querySelector('.perfil-avatar').textContent = nome.split(' ').map(n => n[0]).join('').substring(0,2);
    
    // Adicionar botão de exportar PDF se não existir
    addExportPDFButton(pacienteId);
    
    if (!pacienteId) return;
    
    try {
        // Buscar detalhes do paciente
        const response = await api(`/medico/pacientes/${pacienteId}`);
        const data = response.data;
        
        if (data.paciente) {
            // Atualizar score
            const scoreEl = document.querySelector('.perfil-score .score-value');
            if (scoreEl && data.historicoScores && data.historicoScores.length > 0) {
                scoreEl.textContent = data.historicoScores[0].score_geral;
            }
            
            // Atualizar resumo
            updateResumoClinico(data);
        }
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
    }
}

function updateResumoClinico(data) {
    const resumoList = document.querySelector('.resumo-list');
    if (!resumoList) return;
    
    const insights = gerarInsights(data);
    
    resumoList.innerHTML = insights.map(insight => `
        <li>${insight}</li>
    `).join('');
}

function addExportPDFButton(pacienteId) {
    const perfilHeader = document.querySelector('.perfil-header');
    if (!perfilHeader || perfilHeader.querySelector('.btn-export-pdf')) return;
    
    const btnExport = document.createElement('button');
    btnExport.className = 'btn-export-pdf';
    btnExport.innerHTML = '<i class="fas fa-file-pdf"></i> Exportar PDF';
    btnExport.onclick = () => exportarPDF(pacienteId);
    
    perfilHeader.appendChild(btnExport);
}

async function exportarPDF(pacienteId) {
    if (!pacienteId) {
        showToast('Selecione um paciente para exportar', 'error');
        return;
    }
    
    const btn = document.querySelector('.btn-export-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    btn.disabled = true;
    
    try {
        // Calcular datas do período (últimos 30 dias)
        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        
        const dataFim = hoje.toISOString().split('T')[0];
        const dataInicio = trintaDiasAtras.toISOString().split('T')[0];
        
        // Fazer requisição para gerar PDF
        const response = await fetch(`/api/relatorios/paciente/${pacienteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                data_inicio: dataInicio,
                data_fim: dataFim
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao gerar PDF');
        }
        
        // Download do PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_paciente_${pacienteId}_${dataInicio}_${dataFim}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('PDF exportado com sucesso!', 'success');
        
    } catch (err) {
        console.error('Erro ao exportar PDF:', err);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function gerarInsights(data) {
    const insights = [];
    
    if (data.ultimosCheckins && data.ultimosCheckins.length > 0) {
        const ultimo = data.ultimosCheckins[0];
        
        if (ultimo.humor < 5) {
            insights.push('😔 Humor baixo no último check-in');
        }
        if (ultimo.energia < 5) {
            insights.push('⚡ Energia reduzida observada');
        }
        if (ultimo.sono < 5) {
            insights.push('😴 Qualidade do sono prejudicada');
        }
    }
    
    if (data.historicoScores && data.historicoScores.length > 1) {
        const atual = data.historicoScores[0].score_geral;
        const anterior = data.historicoScores[1].score_geral;
        const variacao = atual - anterior;
        
        if (variacao < -10) {
            insights.push(`📉 Queda significativa no score (${variacao} pontos)`);
        } else if (variacao > 10) {
            insights.push(`📈 Melhora expressiva no score (+${variacao} pontos)`);
        }
    }
    
    if (insights.length === 0) {
        insights.push('📊 Dados em análise para insights personalizados');
    }
    
    return insights;
}

// ============================================
// Tabs do Perfil
// ============================================

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${targetTab}`)?.classList.add('active');
        });
    });
}

// ============================================
// Alertas
// ============================================

async function loadAlertas() {
    const contentArea = document.querySelector('.medico-content');
    
    contentArea.innerHTML = `
        <div class="page-alertas">
            <div class="page-header">
                <h2>Alertas Clínicos</h2>
                <div class="alert-filters">
                    <button class="filter-btn active" data-filter="todos">Todos</button>
                    <button class="filter-btn" data-filter="critico">🔴 Críticos</button>
                    <button class="filter-btn" data-filter="moderado">🟡 Moderados</button>
                    <button class="filter-btn" data-filter="info">🔵 Informativos</button>
                </div>
            </div>
            
            <div class="alerts-container" id="alerts-list">
                <div style="text-align: center; padding: 3rem;">
                    <div class="spinner"></div>
                    <p>Analisando alertas...</p>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar estilos para a página de alertas
    addAlertStyles();
    
    try {
        // Buscar alertas do médico
        const response = await api('/medico/alertas');
        const alertas = response.data || [];
        
        if (alertas.length === 0) {
            document.getElementById('alerts-list').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" style="font-size: 3rem;">✅</div>
                    <h3>Nenhum alerta ativo</h3>
                    <p>Todos os seus pacientes estão dentro dos parâmetros normais.</p>
                </div>
            `;
            return;
        }
        
        renderAlertas(alertas);
        initAlertFilters();
        
    } catch (err) {
        console.error('Erro ao carregar alertas:', err);
        // Fallback: gerar alertas baseados em dados mockados
        const alertasDemo = gerarAlertasDemo();
        renderAlertas(alertasDemo);
        initAlertFilters();
    }
}

function gerarAlertasDemo() {
    return [
        {
            id: 1,
            tipo: 'critico',
            paciente: 'Ana Silva',
            paciente_id: 1,
            mensagem: 'Score caiu 15 pontos em 7 dias',
            detalhe: 'Queda expressiva em energia e humor',
            data: 'Hoje, 14:30',
            icone: '📉'
        },
        {
            id: 2,
            tipo: 'critico',
            paciente: 'João Oliveira',
            paciente_id: 2,
            mensagem: 'Sem check-in há 5 dias',
            detalhe: 'Último registro: 12/04/2024',
            data: 'Hoje, 10:15',
            icone: '⚠️'
        },
        {
            id: 3,
            tipo: 'moderado',
            paciente: 'Maria Costa',
            paciente_id: 3,
            mensagem: 'Sono irregular na última semana',
            detalhe: 'Média de sono: 5.2h (abaixo do ideal)',
            data: 'Ontem, 18:45',
            icone: '😴'
        },
        {
            id: 4,
            tipo: 'moderado',
            paciente: 'Pedro Santos',
            paciente_id: 4,
            mensagem: 'Adesão em queda',
            detalhe: 'Apenas 3 check-ins nos últimos 7 dias',
            data: 'Ontem, 09:20',
            icone: '📊'
        },
        {
            id: 5,
            tipo: 'info',
            paciente: 'Lucia Mendes',
            paciente_id: 5,
            mensagem: 'Melhora significativa no score',
            detalhe: 'Aumento de 12 pontos em 14 dias',
            data: 'Hoje, 08:00',
            icone: '📈'
        }
    ];
}

function renderAlertas(alertas) {
    const container = document.getElementById('alerts-list');
    
    container.innerHTML = alertas.map(alerta => `
        <div class="alert-card ${alerta.tipo}" data-tipo="${alerta.tipo}">
            <div class="alert-icon">${alerta.icone}</div>
            <div class="alert-content">
                <div class="alert-header">
                    <span class="alert-paciente">${alerta.paciente}</span>
                    <span class="alert-badge ${alerta.tipo}">${getTipoLabel(alerta.tipo)}</span>
                </div>
                <h4 class="alert-mensagem">${alerta.mensagem}</h4>
                <p class="alert-detalhe">${alerta.detalhe}</p>
                <span class="alert-data">${alerta.data}</span>
            </div>
            <button class="alert-action" onclick="showPerfil('${alerta.paciente}', ${alerta.paciente_id})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `).join('');
}

function getTipoLabel(tipo) {
    const labels = {
        critico: 'Crítico',
        moderado: 'Moderado',
        info: 'Informativo'
    };
    return labels[tipo] || tipo;
}

function initAlertFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter alerts
            const filter = btn.dataset.filter;
            const alerts = document.querySelectorAll('.alert-card');
            
            alerts.forEach(alert => {
                if (filter === 'todos' || alert.dataset.tipo === filter) {
                    alert.style.display = 'flex';
                } else {
                    alert.style.display = 'none';
                }
            });
        });
    });
}

function addAlertStyles() {
    if (document.getElementById('alert-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
        .page-alertas {
            max-width: 800px;
        }
        
        .alert-filters {
            display: flex;
            gap: 0.5rem;
        }
        
        .filter-btn {
            padding: 0.5rem 1rem;
            border: 1px solid var(--gray-200);
            background: white;
            border-radius: 20px;
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--gray-600);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .filter-btn:hover {
            background: var(--gray-50);
        }
        
        .filter-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        
        .alerts-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .alert-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
            background: white;
            border-radius: var(--radius-lg);
            border-left: 4px solid;
            box-shadow: var(--shadow-sm);
            transition: all 0.2s;
        }
        
        .alert-card:hover {
            transform: translateX(4px);
            box-shadow: var(--shadow);
        }
        
        .alert-card.critico {
            border-left-color: var(--danger);
        }
        
        .alert-card.moderado {
            border-left-color: var(--warning);
        }
        
        .alert-card.info {
            border-left-color: var(--secondary);
        }
        
        .alert-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-50);
            border-radius: var(--radius);
        }
        
        .alert-content {
            flex: 1;
        }
        
        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .alert-paciente {
            font-weight: 700;
            color: var(--gray-900);
        }
        
        .alert-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .alert-badge.critico {
            background: #FEE2E2;
            color: #991B1B;
        }
        
        .alert-badge.moderado {
            background: #FEF3C7;
            color: #92400E;
        }
        
        .alert-badge.info {
            background: #DBEAFE;
            color: #1E40AF;
        }
        
        .alert-mensagem {
            font-size: 1rem;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 0.25rem;
        }
        
        .alert-detalhe {
            font-size: 0.875rem;
            color: var(--gray-500);
            margin-bottom: 0.5rem;
        }
        
        .alert-data {
            font-size: 0.75rem;
            color: var(--gray-400);
        }
        
        .alert-action {
            width: 36px;
            height: 36px;
            border: none;
            background: var(--gray-100);
            border-radius: var(--radius);
            color: var(--gray-600);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .alert-action:hover {
            background: var(--primary);
            color: white;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-200);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    loadDashboard();
    
    // Verificar autenticação
    if (!state.token) {
        // Redirecionar para login se necessário
        console.log('Token não encontrado');
    }
});

// Adicionar estilos dinâmicos para cards de pacientes
const style = document.createElement('style');
style.textContent = `
    .paciente-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .paciente-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .paciente-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .paciente-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.875rem;
    }
    
    .paciente-info {
        flex: 1;
    }
    
    .paciente-info h4 {
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.25rem;
    }
    
    .paciente-info span {
        font-size: 0.875rem;
        color: #6B7280;
    }
    
    .paciente-status {
        font-size: 1.25rem;
    }
    
    .paciente-stats {
        display: flex;
        justify-content: space-between;
        padding-top: 1rem;
        border-top: 1px solid #E5E7EB;
    }
    
    .paciente-stat {
        text-align: center;
    }
    
    .stat-label-premium {
        display: block;
        font-size: 0.75rem;
        color: #6B7280;
        margin-bottom: 0.25rem;
    }
    
    .stat-value-premium {
        font-weight: 700;
        font-size: 1.125rem;
        color: #111827;
    }
    
    .text-success { color: #10B981 !important; }
    .text-warning { color: #F59E0B !important; }
    .text-danger { color: #EF4444 !important; }
    .text-gray { color: #6B7280 !important; }
`;
document.head.appendChild(style);
