/**
 * Bioritmo v2 - Frontend Application
 */

// Configuração
const API_URL = '/api';

// Estado global
const state = {
    token: localStorage.getItem('bioritmo_token'),
    user: JSON.parse(localStorage.getItem('bioritmo_user') || 'null'),
    currentPage: 'dashboard'
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
// Autenticação
// ============================================

async function login(email, senha) {
    const data = await api('/auth/login', {
        method: 'POST',
        body: { email, senha }
    });
    
    state.token = data.data.token;
    state.user = data.data.usuario;
    
    localStorage.setItem('bioritmo_token', state.token);
    localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
    
    showMainApp();
}

async function register(nome, email, senha) {
    const data = await api('/auth/registro', {
        method: 'POST',
        body: { nome, email, senha }
    });
    
    state.token = data.data.token;
    state.user = data.data.usuario;
    
    localStorage.setItem('bioritmo_token', state.token);
    localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
    
    showMainApp();
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('bioritmo_token');
    localStorage.removeItem('bioritmo_user');
    showLogin();
}

// ============================================
// Navegação
// ============================================

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    if (state.user) {
        document.getElementById('user-name').textContent = state.user.nome;
        document.getElementById('user-avatar').textContent = state.user.nome.charAt(0).toUpperCase();
    }
    
    navigateTo('dashboard');
}

function navigateTo(page) {
    state.currentPage = page;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    
    switch (page) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard';
            loadDashboard(contentArea);
            break;
        case 'checkin':
            pageTitle.textContent = 'Check-in Diário';
            loadCheckin(contentArea);
            break;
        case 'historico':
            pageTitle.textContent = 'Histórico';
            loadHistorico(contentArea);
            break;
        case 'score':
            pageTitle.textContent = 'Meu Score';
            loadScore(contentArea);
            break;
        case 'correlacao':
            pageTitle.textContent = 'Insights';
            loadCorrelacao(contentArea);
            break;
    }
}

// ============================================
// Páginas
// ============================================

async function loadDashboard(container) {
    const pacienteId = state.user?.pacienteId;
    
    if (!pacienteId) {
        container.innerHTML = '<div class="alert alert-warning">Complete seu cadastro para começar.</div>';
        return;
    }
    
    try {
        const checkinData = await api(`/checkins/paciente/${pacienteId}/dashboard`);
        const dashboard = checkinData.data;
        
        let scoreData = null;
        try {
            const scoreRes = await api(`/score/paciente/${pacienteId}`);
            scoreData = scoreRes.data;
        } catch {}
        
        let historicoCheckins = [];
        try {
            const histData = await api(`/checkins/paciente/${pacienteId}?limit=7`);
            historicoCheckins = histData.data.reverse();
        } catch {}
        
        let historicoScores = [];
        try {
            const scoreHist = await api(`/score/paciente/${pacienteId}/historico?dias=30`);
            historicoScores = scoreHist.data.reverse();
        } catch {}
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Score Geral</div>
                    <div class="stat-value" style="color: ${getScoreColor(scoreData?.score_geral || 0)}">
                        ${scoreData ? scoreData.score_geral : '-'}
                    </div>
                    <div class="stat-change ${scoreData?.tendencia === 'melhora' ? 'positive' : scoreData?.tendencia === 'piora' ? 'negative' : ''}">
                        ${scoreData ? formatTendencia(scoreData.tendencia) : 'Sem dados'}
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Check-ins Hoje</div>
                    <div class="stat-value">${dashboard.checkinsHoje?.length || 0}</div>
                    <div class="stat-change">
                        ${dashboard.proximoCheckin?.sugerido 
                            ? `Próximo: ${dashboard.proximoCheckin.label}` 
                            : 'Dia completo!'}
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Sequência</div>
                    <div class="stat-value">${dashboard.streakDias || 0}</div>
                    <div class="stat-change">dias consecutivos</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Total Check-ins</div>
                    <div class="stat-value">${dashboard.statsSemana?.totalCheckins || 0}</div>
                    <div class="stat-change">esta semana</div>
                </div>
            </div>
            
            ${historicoCheckins.length > 0 ? `
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="card-header">
                    <h3 class="card-title">📈 Evolução da Semana</h3>
                </div>
                <div class="card-body">
                    <div style="height: 300px;">
                        <canvas id="chart-semanal"></canvas>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${historicoScores.length > 0 ? `
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="card-header">
                    <h3 class="card-title">📊 Evolução do Score</h3>
                </div>
                <div class="card-body">
                    <div style="height: 250px;">
                        <canvas id="chart-score-history"></canvas>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Ações Rápidas</h3>
                </div>
                <div class="card-body">
                    <div class="flex gap-4">
                        <button class="btn btn-primary" onclick="navigateTo('checkin')">
                            📝 Fazer Check-in
                        </button>
                        <button class="btn btn-secondary" onclick="navigateTo('score')">
                            📊 Ver Score Completo
                        </button>
                        <button class="btn btn-secondary" onclick="navigateTo('correlacao')">
                            💡 Ver Insights
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        if (historicoCheckins.length > 0) {
            BioritmoCharts.createWeeklyChart('chart-semanal', historicoCheckins);
        }
        if (historicoScores.length > 0) {
            BioritmoCharts.createScoreHistory('chart-score-history', historicoScores);
        }
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👋</div>
                <div class="empty-state-title">Bem-vindo ao Bioritmo!</div>
                <div class="empty-state-description">
                    Comece fazendo seu primeiro check-in para acompanhar sua saúde.
                </div>
                <button class="btn btn-primary" onclick="navigateTo('checkin')">
                    Fazer Primeiro Check-in
                </button>
            </div>
        `;
    }
}

function loadCheckin(container) {
    container.innerHTML = `
        <div class="card-premium page-enter" style="max-width: 600px; margin: 0 auto;">
            <div class="card-header" style="text-align: center; border: none; padding-bottom: 0;">
                <h3 class="card-title" style="font-size: 1.5rem; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Como você está hoje?
                </h3>
                <p style="color: var(--gray-500); margin-top: 0.5rem;">Leva menos de 30 segundos</p>
            </div>
            <div class="card-body">
                <form id="checkin-form">
                    <!-- Humor -->
                    <div class="slider-container" style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label class="form-label" style="font-weight: 600; color: var(--bioritmo-primary);">😊 Humor</label>
                            <span id="humor-value" class="slider-value" style="position: static; transform: none;">5</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.5rem; margin-bottom: 0.5rem;">
                            <span>😢</span><span>😐</span><span>😄</span>
                        </div>
                        <input type="range" id="checkin-humor" class="slider-premium" min="1" max="10" value="5" required>
                    </div>
                    
                    <!-- Energia -->
                    <div class="slider-container" style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label class="form-label" style="font-weight: 600; color: var(--bioritmo-primary);">⚡ Energia</label>
                            <span id="energia-value" class="slider-value" style="position: static; transform: none;">5</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.5rem; margin-bottom: 0.5rem;">
                            <span>🪫</span><span>🔋</span><span>🔋🔋</span>
                        </div>
                        <input type="range" id="checkin-energia" class="slider-premium" min="1" max="10" value="5" required>
                    </div>
                    
                    <!-- Sono -->
                    <div class="slider-container" style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label class="form-label" style="font-weight: 600; color: var(--bioritmo-primary);">😴 Qualidade do Sono</label>
                            <span id="sono-value" class="slider-value" style="position: static; transform: none;">5</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.5rem; margin-bottom: 0.5rem;">
                            <span>😫</span><span>😌</span><span>✨</span>
                        </div>
                        <input type="range" id="checkin-sono" class="slider-premium" min="1" max="10" value="5" required>
                    </div>
                    
                    <!-- Horas de sono -->
                    <div class="slider-container" style="margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label class="form-label" style="font-weight: 600; color: var(--bioritmo-primary);">🌙 Horas de sono</label>
                            <span id="horas-value" style="background: var(--bioritmo-secondary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 700;">7h</span>
                        </div>
                        <input type="range" id="checkin-horas-sono" class="slider-premium" min="0" max="12" step="0.5" value="7" style="background: linear-gradient(to right, #3B82F6 0%, #06B6D4 100%);">
                    </div>
                    
                    <!-- Hábitos rápidos -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <label class="habit-toggle" style="cursor: pointer; text-align: center; padding: 1rem; border: 2px solid #E5E7EB; border-radius: 16px; transition: all 0.2s;">
                            <input type="checkbox" id="habit-agua" style="display: none;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💧</div>
                            <div style="font-weight: 600; font-size: 0.875rem;">Água</div>
                        </label>
                        <label class="habit-toggle" style="cursor: pointer; text-align: center; padding: 1rem; border: 2px solid #E5E7EB; border-radius: 16px; transition: all 0.2s;">
                            <input type="checkbox" id="habit-exercicio" style="display: none;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏃</div>
                            <div style="font-weight: 600; font-size: 0.875rem;">Exercício</div>
                        </label>
                        <label class="habit-toggle" style="cursor: pointer; text-align: center; padding: 1rem; border: 2px solid #E5E7EB; border-radius: 16px; transition: all 0.2s;">
                            <input type="checkbox" id="habit-alimentacao" style="display: none;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🥗</div>
                            <div style="font-weight: 600; font-size: 0.875rem;">Alimentação</div>
                        </label>
                    </div>
                    
                    <!-- Notas -->
                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label class="form-label" style="font-weight: 600; color: var(--bioritmo-primary);">📝 Notas (opcional)</label>
                        <textarea id="checkin-notas" class="input-premium" rows="3" placeholder="Como foi seu dia? Alguma observação?"></textarea>
                    </div>
                    
                    <button type="submit" class="btn-premium btn-premium-primary w-full" style="font-size: 1.125rem; padding: 1.25rem;">
                        <span id="checkin-btn-text">✨ Salvar Check-in</span>
                        <span id="checkin-btn-loading" class="loading hidden" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></span>
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Slider interactions
    const setupSlider = (id, valueId, suffix = '') => {
        const slider = document.getElementById(id);
        const value = document.getElementById(valueId);
        slider.addEventListener('input', () => {
            value.textContent = slider.value + suffix;
            const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            value.style.left = percent + '%';
        });
    };
    
    setupSlider('checkin-humor', 'humor-value');
    setupSlider('checkin-energia', 'energia-value');
    setupSlider('checkin-sono', 'sono-value');
    
    const horasSlider = document.getElementById('checkin-horas-sono');
    const horasValue = document.getElementById('horas-value');
    horasSlider.addEventListener('input', () => {
        horasValue.textContent = horasSlider.value + 'h';
    });
    
    // Habit toggle styling
    document.querySelectorAll('.habit-toggle').forEach(toggle => {
        const checkbox = toggle.querySelector('input');
        toggle.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            toggle.style.borderColor = checkbox.checked ? 'var(--bioritmo-primary)' : '#E5E7EB';
            toggle.style.background = checkbox.checked ? 'rgba(124, 58, 237, 0.05)' : 'white';
        });
    });
    
    document.getElementById('checkin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pacienteId = state.user?.pacienteId;
        if (!pacienteId) return;
        
        const btnText = document.getElementById('checkin-btn-text');
        const btnLoading = document.getElementById('checkin-btn-loading');
        
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        
        try {
            await api('/checkins', {
                method: 'POST',
                body: {
                    paciente_id: pacienteId,
                    humor: parseInt(document.getElementById('checkin-humor').value),
                    energia: parseInt(document.getElementById('checkin-energia').value),
                    sono: parseInt(document.getElementById('checkin-sono').value),
                    horas_sono: parseFloat(document.getElementById('checkin-horas-sono').value) || null,
                    sintomas: document.getElementById('checkin-sintomas').value
                        ? document.getElementById('checkin-sintomas').value.split(',').map(s => s.trim())
                        : [],
                    notas: document.getElementById('checkin-notas').value
                }
            });
            
            document.getElementById('checkin-success').classList.remove('hidden');
            document.getElementById('checkin-form').reset();
            
            setTimeout(() => {
                document.getElementById('checkin-success').classList.add('hidden');
            }, 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });
}

async function loadHistorico(container) {
    const pacienteId = state.user?.pacienteId;
    
    if (!pacienteId) {
        container.innerHTML = '<div class="alert alert-warning">Complete seu cadastro.</div>';
        return;
    }
    
    try {
        const data = await api(`/checkins/paciente/${pacienteId}?limit=30`);
        const checkins = data.data;
        
        if (checkins.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-title">Nenhum check-in ainda</div>
                    <div class="empty-state-description">
                        Faça seu primeiro check-in para começar a acompanhar sua evolução.
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Últimos Check-ins</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Humor</th>
                                    <th>Energia</th>
                                    <th>Sono</th>
                                    <th>Sintomas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${checkins.map(c => `
                                    <tr>
                                        <td>${formatDate(c.data)} ${c.hora}</td>
                                        <td>${renderStars(c.humor)}</td>
                                        <td>${renderStars(c.energia)}</td>
                                        <td>${renderStars(c.sono)}</td>
                                        <td>${c.sintomas?.length ? c.sintomas.join(', ') : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Erro ao carregar histórico: ${err.message}</div>`;
    }
}

async function loadScore(container) {
    const pacienteId = state.user?.pacienteId;
    
    if (!pacienteId) {
        container.innerHTML = '<div class="alert alert-warning">Complete seu cadastro.</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="flex gap-4 mb-4">
            <button class="btn btn-primary" id="btn-calcular-score">
                🔄 Calcular Score Agora
            </button>
        </div>
        <div id="score-content">
            <div class="loading"></div>
        </div>
    `;
    
    document.getElementById('btn-calcular-score').addEventListener('click', async () => {
        document.getElementById('score-content').innerHTML = '<div class="loading"></div>';
        try {
            await api(`/score/calcular/${pacienteId}`, { method: 'POST' });
            await renderScore(container, pacienteId);
        } catch (err) {
            document.getElementById('score-content').innerHTML = 
                `<div class="alert alert-danger">${err.message}</div>`;
        }
    });
    
    await renderScore(container, pacienteId);
}

async function renderScore(container, pacienteId) {
    try {
        const data = await api(`/score/paciente/${pacienteId}`);
        const score = data.data;
        
        document.getElementById('score-content').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Score Geral</h3>
                    </div>
                    <div class="card-body" style="height: 250px;">
                        <canvas id="chart-score-gauge"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Distribuição por Categoria</h3>
                    </div>
                    <div class="card-body" style="height: 250px;">
                        <canvas id="chart-score-bars"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
                <div class="stat-card">
                    <div class="stat-label">Mental</div>
                    <div class="stat-value" style="color: ${getScoreColor(score.score_mental)}; font-size: 2.5rem;">
                        ${score.score_mental}
                    </div>
                    <div class="stat-change">Humor e bem-estar</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Físico</div>
                    <div class="stat-value" style="color: ${getScoreColor(score.score_fisico)}; font-size: 2.5rem;">
                        ${score.score_fisico}
                    </div>
                    <div class="stat-change">Energia e disposição</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Sono</div>
                    <div class="stat-value" style="color: ${getScoreColor(score.score_sono)}; font-size: 2.5rem;">
                        ${score.score_sono}
                    </div>
                    <div class="stat-change">Qualidade do sono</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Hábitos</div>
                    <div class="stat-value" style="color: ${getScoreColor(score.score_habitos)}; font-size: 2.5rem;">
                        ${score.score_habitos}
                    </div>
                    <div class="stat-change">Comportamentos saudáveis</div>
                </div>
            </div>
            
            ${score.alertas?.length ? `
                <div class="card mt-4">
                    <div class="card-header">
                        <h3 class="card-title">⚠️ Alertas</h3>
                    </div>
                    <div class="card-body">
                        ${score.alertas.map(a => `
                            <div class="alert alert-${a.tipo === 'critico' ? 'danger' : 'warning'} mb-2">
                                <strong>${a.categoria.toUpperCase()}:</strong> ${a.mensagem}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        setTimeout(() => {
            BioritmoCharts.createScoreGauge('chart-score-gauge', score.score_geral);
            BioritmoCharts.createScoreDistribution('chart-score-bars', {
                mental: score.score_mental,
                fisico: score.score_fisico,
                sono: score.score_sono,
                habitos: score.score_habitos
            });
        }, 100);
    } catch (err) {
        document.getElementById('score-content').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-title">Nenhum score calculado</div>
                <div class="empty-state-description">
                    Clique em "Calcular Score" para gerar sua primeira avaliação.
                </div>
            </div>
        `;
    }
}

async function loadCorrelacao(container) {
    const pacienteId = state.user?.pacienteId;
    
    if (!pacienteId) {
        container.innerHTML = '<div class="alert alert-warning">Complete seu cadastro.</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="flex gap-4 mb-4">
            <button class="btn btn-primary" id="btn-analisar">
                🔍 Analisar Meus Dados
            </button>
        </div>
        <div id="correlacao-content">
            <div class="loading"></div>
        </div>
    `;
    
    document.getElementById('btn-analisar').addEventListener('click', async () => {
        document.getElementById('correlacao-content').innerHTML = '<div class="loading"></div>';
        try {
            const result = await api(`/correlacao/analisar/${pacienteId}`, {
                method: 'POST'
            });
            renderCorrelacoes(result.data);
        } catch (err) {
            document.getElementById('correlacao-content').innerHTML = 
                `<div class="alert alert-danger">${err.message}</div>`;
        }
    });
    
    try {
        const data = await api(`/correlacao/paciente/${pacienteId}`);
        if (data.data.length > 0) {
            renderCorrelacoes({ correlacoes: data.data });
        } else {
            document.getElementById('correlacao-content').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">Descubra seus padrões</div>
                    <div class="empty-state-description">
                        Analisamos seus dados para encontrar correlações entre seus hábitos e bem-estar.
                    </div>
                </div>
            `;
        }
    } catch {
        document.getElementById('correlacao-content').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-title">Dados insuficientes</div>
                <div class="empty-state-description">
                    Continue fazendo check-ins por pelo menos 5 dias para gerar insights.
                </div>
            </div>
        `;
    }
}

function renderCorrelacoes(data) {
    if (!data.correlacoes || data.correlacoes.length === 0) {
        document.getElementById('correlacao-content').innerHTML = `
            <div class="alert alert-info">
                Nenhuma correlação significativa encontrada ainda. Continue registrando seus dados.
            </div>
        `;
        return;
    }
    
    document.getElementById('correlacao-content').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Correlações Encontradas</h3>
            </div>
            <div class="card-body">
                ${data.correlacoes.map(c => `
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
                        <div>
                            <div class="font-semibold">${c.nome || `${c.fator_a} ↔ ${c.fator_b}`}</div>
                            <div class="text-sm text-gray-500">${c.interpretacao?.descricao || c.descricao}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold ${c.tipo_correlacao === 'positiva' ? 'text-success' : 'text-danger'}">
                                ${c.coeficiente > 0 ? '+' : ''}${c.coeficiente}
                            </div>
                            <div class="badge badge-${c.significancia === 'alta' ? 'success' : c.significancia === 'media' ? 'warning' : 'info'}">
                                ${c.significancia}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${data.correlacoes[0]?.interpretacao?.sugestao ? `
            <div class="card mt-4">
                <div class="card-header">
                    <h3 class="card-title">💡 Sugestão</h3>
                </div>
                <div class="card-body">
                    <p>${data.correlacoes[0].interpretacao.sugestao}</p>
                </div>
            </div>
        ` : ''}
    `;
}

// ============================================
// Helpers
// ============================================

function getScoreColor(score) {
    if (score >= 75) return 'var(--success-500)';
    if (score >= 60) return 'var(--warning-500)';
    return 'var(--danger-500)';
}

function formatTendencia(tendencia) {
    const map = {
        'melhora': '↗️ Melhorando',
        'estavel': '→ Estável',
        'piora': '↘️ Piorando'
    };
    return map[tendencia] || tendencia;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

function renderStars(value) {
    if (!value) return '-';
    const filled = '★';
    const empty = '☆';
    return filled.repeat(Math.round(value / 2)) + empty.repeat(5 - Math.round(value / 2));
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnText = document.getElementById('login-text');
        const btnLoading = document.getElementById('login-loading');
        const errorDiv = document.getElementById('login-error');
        
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        try {
            await login(
                document.getElementById('login-email').value,
                document.getElementById('login-senha').value
            );
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
        } finally {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });
    
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnText = document.getElementById('reg-text');
        const btnLoading = document.getElementById('reg-loading');
        const errorDiv = document.getElementById('reg-error');
        
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        try {
            await register(
                document.getElementById('reg-nome').value,
                document.getElementById('reg-email').value,
                document.getElementById('reg-senha').value
            );
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
        } finally {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });
    
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
    
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });
    
    if (state.token && state.user) {
        showMainApp();
    } else {
        showLogin();
    }
});
