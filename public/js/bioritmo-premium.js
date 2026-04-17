/**
 * BIORITMO+ - Aplicativo Premium de Saúde Digital
 * Produto de alto padrão, experiência impecável
 */

const API_URL = '/api';

// Estado global
const state = {
  token: localStorage.getItem('bioritmo_token'),
  user: JSON.parse(localStorage.getItem('bioritmo_user') || 'null'),
  currentPage: 'home',
  onboardingStep: 1
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
// Onboarding
// ============================================

function initOnboarding() {
  const btnNext = document.getElementById('btn-onboarding-next');
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.dot');
  
  btnNext.addEventListener('click', () => {
    if (state.onboardingStep < 3) {
      // Próximo slide
      document.querySelector(`.onboarding-slide[data-slide="${state.onboardingStep}"]`).classList.remove('active');
      document.querySelector(`.dot[data-slide="${state.onboardingStep}"]`).classList.remove('active');
      
      state.onboardingStep++;
      
      document.querySelector(`.onboarding-slide[data-slide="${state.onboardingStep}"]`).classList.add('active');
      document.querySelector(`.dot[data-slide="${state.onboardingStep}"]`).classList.add('active');
      
      if (state.onboardingStep === 3) {
        btnNext.innerHTML = '<span>Começar</span><i class="fas fa-arrow-right"></i>';
      }
    } else {
      // Ir para auth
      showScreen('auth-screen');
    }
  });
}

// ============================================
// Autenticação
// ============================================

function initAuth() {
  // Tabs
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const formId = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(formId).classList.add('active');
    });
  });
  
  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('span');
    const spinner = btn.querySelector('.spinner');
    
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: {
          email: document.getElementById('login-email').value,
          senha: document.getElementById('login-senha').value
        }
      });
      
      state.token = data.data.token;
      state.user = data.data.usuario;
      localStorage.setItem('bioritmo_token', state.token);
      localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
      
      showMainApp();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });
  
  // Register
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('span');
    const spinner = btn.querySelector('.spinner');
    
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    
    try {
      const data = await api('/auth/registro', {
        method: 'POST',
        body: {
          nome: document.getElementById('reg-nome').value,
          email: document.getElementById('reg-email').value,
          senha: document.getElementById('reg-senha').value
        }
      });
      
      state.token = data.data.token;
      state.user = data.data.usuario;
      localStorage.setItem('bioritmo_token', state.token);
      localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
      
      showMainApp();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });
}

// ============================================
// Navegação
// ============================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

function showMainApp() {
  showScreen('main-app');
  
  // Atualizar saudação
  const hour = new Date().getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
  else if (hour >= 18) greeting = 'Boa noite';
  
  document.getElementById('greeting-text').textContent = greeting;
  document.getElementById('user-name-display').textContent = state.user?.nome?.split(' ')[0] || 'Usuário';
  
  // Carregar home
  loadHome();
  
  // Init navigation
  initNavigation();
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      const page = item.dataset.page;
      state.currentPage = page;
      
      switch(page) {
        case 'home':
          loadHome();
          break;
        case 'checkin':
          loadCheckin();
          break;
        case 'dashboard':
          loadDashboard();
          break;
      }
    });
  });
}

// ============================================
// Páginas
// ============================================

async function loadHome() {
  const container = document.getElementById('content-area');
  const pacienteId = state.user?.pacienteId;
  
  if (!pacienteId) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👋</div><h3 class="empty-state-title">Bem-vindo!</h3><p class="empty-state-text">Complete seu perfil para começar.</p></div>';
    return;
  }
  
  try {
    // Buscar dados
    let scoreData = null;
    let dashboardData = null;
    
    try {
      const scoreRes = await api(`/score/paciente/${pacienteId}`);
      scoreData = scoreRes.data;
    } catch {}
    
    try {
      const dashRes = await api(`/checkins/paciente/${pacienteId}/dashboard`);
      dashboardData = dashRes.data;
    } catch {}
    
    container.innerHTML = `
      <!-- Score Card -->
      <div class="card score-card">
        <div class="score-value">${scoreData?.score_geral || '--'}</div>
        <div class="score-label">Seu Score de Saúde</div>
        ${dashboardData?.streakDias > 0 ? `
          <div style="margin-top: 1rem;">
            <span class="streak-badge">🔥 ${dashboardData.streakDias} dias seguidos</span>
          </div>
        ` : ''}
      </div>
      
      <!-- Quick Insight -->
      ${scoreData ? `
        <div class="insight-card">
          <span style="color: var(--gray-700);">
            ${getInsightMessage(scoreData, dashboardData)}
          </span>
        </div>
      ` : ''}
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="quick-action" onclick="document.querySelector('[data-page=\"checkin\"]').click()">
          <div class="quick-action-icon">📝</div>
          <span>Novo Check-in</span>
        </div>
        <div class="quick-action" onclick="document.querySelector('[data-page=\"dashboard\"]').click()">
          <div class="quick-action-icon">📊</div>
          <span>Meu Dashboard</span>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Resumo</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: var(--radius);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${dashboardData?.statsSemana?.totalCheckins || 0}</div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">Check-ins esta semana</div>
          </div>
          <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: var(--radius);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${dashboardData?.checkinsHoje?.length || 0}</div>
            <div style="font-size: 0.75rem; color: var(--gray-500);">Hoje</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3 class="empty-state-title">Ops!</h3><p class="empty-state-text">${err.message}</p></div>`;
  }
}

function getInsightMessage(score, dashboard) {
  if (!score) return 'Comece seu primeiro check-in para receber insights personalizados.';
  
  if (score.tendencia === 'melhora') {
    return 'Excelente! Seu score está em ascensão. Continue com os bons hábitos! 🚀';
  } else if (score.tendencia === 'piora') {
    return 'Notamos uma queda recente. Que tal focar no sono esta semana? 😴';
  }
  
  if (dashboard?.streakDias >= 7) {
    return 'Incrível! Você está em uma sequência de 7+ dias. Constância é tudo! 💪';
  }
  
  return 'Seu score está estável. Pequenas melhorias nos hábitos podem fazer grande diferença.';
}

function loadCheckin() {
  const container = document.getElementById('content-area');
  
  container.innerHTML = `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="card-header">
        <h3 class="card-title">Como você está hoje?</h3>
      </div>
      
      <form id="checkin-form">
        <!-- Humor -->
        <div class="slider-container">
          <div class="slider-header">
            <span class="slider-label">😊 Humor</span>
            <span class="slider-value" id="humor-value">5</span>
          </div>
          <div class="slider-emojis">
            <span>😢</span><span>😐</span><span>😄</span>
          </div>
          <input type="range" id="checkin-humor" min="1" max="10" value="5" required>
        </div>
        
        <!-- Energia -->
        <div class="slider-container">
          <div class="slider-header">
            <span class="slider-label">⚡ Energia</span>
            <span class="slider-value" id="energia-value">5</span>
          </div>
          <div class="slider-emojis">
            <span>😫</span><span>😌</span><span>💪</span>
          </div>
          <input type="range" id="checkin-energia" min="1" max="10" value="5" required>
        </div>
        
        <!-- Sono -->
        <div class="slider-container">
          <div class="slider-header">
            <span class="slider-label">😴 Qualidade do sono</span>
            <span class="slider-value" id="sono-value">5</span>
          </div>
          <div class="slider-emojis">
            <span>😵</span><span>😴</span><span>✨</span>
          </div>
          <input type="range" id="checkin-sono" min="1" max="10" value="5" required>
        </div>
        
        <!-- Horas de sono -->
        <div class="slider-container">
          <div class="slider-header">
            <span class="slider-label">🌙 Horas de sono</span>
            <span class="slider-value" id="horas-value" style="background: var(--secondary); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">7h</span>
          </div>
          <input type="range" id="checkin-horas" min="0" max="12" step="0.5" value="7" style="background: linear-gradient(to right, var(--secondary), var(--accent));">
        </div>
        
        <!-- Hábitos -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-weight: 600; color: var(--gray-700); margin-bottom: 0.75rem;">Hábitos de hoje</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <label class="habit-toggle" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); cursor: pointer; transition: all 0.2s;">
              <input type="checkbox" id="habit-agua" style="display: none;">
              <span style="font-size: 1.5rem;">💧</span>
              <span style="font-size: 0.75rem; font-weight: 600;">Água</span>
            </label>
            <label class="habit-toggle" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); cursor: pointer; transition: all 0.2s;">
              <input type="checkbox" id="habit-exercicio" style="display: none;">
              <span style="font-size: 1.5rem;">🏃</span>
              <span style="font-size: 0.75rem; font-weight: 600;">Exercício</span>
            </label>
            <label class="habit-toggle" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); cursor: pointer; transition: all 0.2s;">
              <input type="checkbox" id="habit-alimentacao" style="display: none;">
              <span style="font-size: 1.5rem;">🥗</span>
              <span style="font-size: 0.75rem; font-weight: 600;">Alimentação</span>
            </label>
          </div>
        </div>
        
        <!-- Notas -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Observações (opcional)</label>
          <textarea id="checkin-notas" rows="3" placeholder="Como foi seu dia?" style="width: 100%; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); font-family: inherit; resize: none;"></textarea>
        </div>
        
        <button type="submit" class="btn-primary btn-large" style="width: 100%;">
          <span>✨ Salvar Check-in</span>
        </button>
      </form>
    </div>
  `;
  
  // Slider interactions
  const setupSlider = (id, valueId, suffix = '') => {
    const slider = document.getElementById(id);
    const value = document.getElementById(valueId);
    slider.addEventListener('input', () => {
      value.textContent = slider.value + suffix;
    });
  };
  
  setupSlider('checkin-humor', 'humor-value');
  setupSlider('checkin-energia', 'energia-value');
  setupSlider('checkin-sono', 'sono-value');
  
  const horasSlider = document.getElementById('checkin-horas');
  const horasValue = document.getElementById('horas-value');
  horasSlider.addEventListener('input', () => {
    horasValue.textContent = horasSlider.value + 'h';
  });
  
  // Habit toggle styling
  document.querySelectorAll('.habit-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const checkbox = this.querySelector('input');
      checkbox.checked = !checkbox.checked;
      this.style.borderColor = checkbox.checked ? 'var(--primary)' : 'var(--gray-200)';
      this.style.background = checkbox.checked ? 'rgba(124, 58, 237, 0.05)' : 'white';
    });
  });
  
  // Form submit
  document.getElementById('checkin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pacienteId = state.user?.pacienteId;
    if (!pacienteId) return;
    
    try {
      // Salvar check-in
      await api('/checkins', {
        method: 'POST',
        body: {
          paciente_id: pacienteId,
          humor: parseInt(document.getElementById('checkin-humor').value),
          energia: parseInt(document.getElementById('checkin-energia').value),
          sono: parseInt(document.getElementById('checkin-sono').value),
          horas_sono: parseFloat(document.getElementById('checkin-horas').value),
          notas: document.getElementById('checkin-notas').value
        }
      });
      
      // Salvar hábitos
      await api('/checkins/habitos', {
        method: 'POST',
        body: {
          paciente_id: pacienteId,
          agua_litros: document.getElementById('habit-agua').checked ? 2 : 0.5,
          exercicio: document.getElementById('habit-exercicio').checked ? 1 : 0,
          alimentacao_saudavel: document.getElementById('habit-alimentacao').checked ? 5 : 3
        }
      });
      
      showToast('Check-in salvo! 🎉', 'success');
      
      // Voltar para home
      setTimeout(() => {
        document.querySelector('[data-page="home"]').click();
      }, 1500);
      
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function loadDashboard() {
  const container = document.getElementById('content-area');
  const pacienteId = state.user?.pacienteId;
  
  if (!pacienteId) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3 class="empty-state-title">Sem dados ainda</h3><p class="empty-state-text">Faça check-ins para ver seu dashboard.</p></div>';
    return;
  }
  
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Evolução</h3>
      </div>
      <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--gray-400);">
        <i class="fas fa-chart-line" style="font-size: 3rem; opacity: 0.3;"></i>
      </div>
      <p style="text-align: center; color: var(--gray-500); font-size: 0.875rem;">Gráficos em desenvolvimento</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Correlações</h3>
      </div>
      <div class="insight-card">
        💡 Quanto mais você dorme, melhor seu humor tende a ser.
      </div>
      <div class="insight-card">
        💡 Dias com exercício mostram 20% mais energia.
      </div>
    </div>
  `;
}

// ============================================
// Toast System
// ============================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initOnboarding();
  initAuth();
  
  // Check auth state
  if (state.token && state.user) {
    showMainApp();
  }
});
