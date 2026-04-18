/**
 * BIORITMO+ v2.0
 * JavaScript otimizado para mobile
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
// UTILITÁRIOS
// ============================================

function $(id) { return document.getElementById(id); }

function showToast(message, type = 'success') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function api(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(state.token && { 'Authorization': `Bearer ${state.token}` })
    },
    ...options
  };
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// ============================================
// NAVEGAÇÃO
// ============================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

function navigateTo(page) {
  // Esconder todas as páginas
  $('page-home').classList.add('hidden');
  $('page-checkin').classList.add('hidden');
  $('page-dashboard').classList.add('hidden');
  
  // Mostrar página selecionada
  $(`page-${page}`).classList.remove('hidden');
  
  // Atualizar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Carregar conteúdo
  if (page === 'home') loadHome();
  if (page === 'checkin') loadCheckin();
  if (page === 'dashboard') loadDashboard();
  
  // Scroll topo
  $('main-content').scrollTop = 0;
}

// ============================================
// ONBOARDING
// ============================================

function initOnboarding() {
  const btn = $('btn-onboarding-next');
  if (!btn) return; // Elemento não existe
  
  const dots = document.querySelectorAll('.dot');
  const slides = document.querySelectorAll('.onboarding-slide');
  
  btn.addEventListener('click', () => {
    if (state.onboardingStep < 3) {
      // Próximo slide
      slides[state.onboardingStep - 1].classList.remove('active');
      dots[state.onboardingStep - 1].classList.remove('active');
      
      state.onboardingStep++;
      
      slides[state.onboardingStep - 1].classList.add('active');
      dots[state.onboardingStep - 1].classList.add('active');
      
      if (state.onboardingStep === 3) {
        btn.innerHTML = '<span>Começar</span><i class="fas fa-arrow-right"></i>';
      }
    } else {
      // Ir para auth
      localStorage.setItem('bioritmo_onboarding', 'true');
      showScreen('auth-screen');
      initAuth();
    }
  });
}

// ============================================
// AUTH
// ============================================

function initAuth() {
  // Verificar se estamos na tela de auth
  if (!$('auth-screen') || $('auth-screen').classList.contains('hidden')) return;
  
  // Tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const formId = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      $(formId).classList.add('active');
    });
  });
  
  // Login
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<div class="spinner"></div>';
    
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: {
          email: $('login-email').value,
          senha: $('login-senha').value
        }
      });
      
      state.token = res.data.token;
      state.user = res.data.user;
      localStorage.setItem('bioritmo_token', state.token);
      localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
      
      showScreen('main-screen');
      loadHome();
    } catch (err) {
      showToast(err.message, 'error');
      btn.innerHTML = '<span>Entrar</span>';
    }
  });
  
  // Register
  $('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<div class="spinner"></div>';
    
    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: {
          nome: $('reg-nome').value,
          email: $('reg-email').value,
          senha: $('reg-senha').value
        }
      });
      
      state.token = res.data.token;
      state.user = res.data.user;
      localStorage.setItem('bioritmo_token', state.token);
      localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
      
      showScreen('main-screen');
      loadHome();
    } catch (err) {
      showToast(err.message, 'error');
      btn.innerHTML = '<span>Criar conta</span>';
    }
  });
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('bioritmo_token');
  localStorage.removeItem('bioritmo_user');
  showScreen('auth-screen');
}

// ============================================
// HOME
// ============================================

async function loadHome() {
  // Verificar se elementos existem
  if (!$('score-value')) return;
  
  if (!state.user?.pacienteId) {
    $('score-value').textContent = '--';
    $('checkins-semana').textContent = '0';
    $('checkins-hoje').textContent = '0';
    $('streak-container').innerHTML = '';
    $('insight-container').innerHTML = '';
    return;
  }
  
  // Atualizar nome
  if (state.user.nome) {
    $('user-name').textContent = state.user.nome.split(' ')[0];
  }
  
  try {
    const [scoreRes, dashRes] = await Promise.all([
      api(`/score/paciente/${state.user.pacienteId}`).catch(() => null),
      api(`/checkins/paciente/${state.user.pacienteId}/dashboard`).catch(() => null)
    ]);
    
    const score = scoreRes?.data?.score_geral || '--';
    const streak = dashRes?.data?.streakDias || 0;
    const semana = dashRes?.data?.statsSemana?.totalCheckins || 0;
    const hoje = dashRes?.data?.checkinsHoje?.length || 0;
    
    // Atualizar apenas se elementos existirem
    if ($('score-value')) $('score-value').textContent = score;
    if ($('checkins-semana')) $('checkins-semana').textContent = semana;
    if ($('checkins-hoje')) $('checkins-hoje').textContent = hoje;
    
    // Streak
    if ($('streak-container')) {
      if (streak > 0) {
        $('streak-container').innerHTML = `<span class="streak-badge"><i class="fas fa-fire"></i> ${streak} dias seguidos</span>`;
      } else {
        $('streak-container').innerHTML = '';
      }
    }
    
    // Insight
    if (scoreRes?.data && $('insight-container')) {
      const msg = getInsightMessage(scoreRes.data, dashRes?.data);
      $('insight-container').innerHTML = `
        <div class="insight-card">
          <i class="fas fa-lightbulb"></i>
          <span>${msg}</span>
        </div>
      `;
    }
  } catch (err) {
    console.error('Erro ao carregar home:', err);
    // Não travar o app em caso de erro
  }
}

function getInsightMessage(score, dashboard) {
  if (!score) return 'Comece seu primeiro check-in para receber insights personalizados.';
  
  if (score.tendencia === 'melhora') {
    return 'Excelente! Seu score está em ascensão. Continue com os bons hábitos!';
  } else if (score.tendencia === 'piora') {
    return 'Notamos uma queda recente. Que tal focar no sono esta semana?';
  }
  
  if (dashboard?.streakDias >= 7) {
    return 'Incrível! Você está em uma sequência de 7+ dias. Constância é tudo!';
  }
  
  return 'Seu score está estável. Pequenas melhorias nos hábitos podem fazer grande diferença.';
}

// ============================================
// CHECK-IN
// ============================================

function loadCheckin() {
  // Resetar valores
  ['humor', 'energia', 'sono'].forEach(id => {
    $(id).value = 5;
    $(`val-${id}`).textContent = '5';
  });
  $('horas').value = 7;
  $('val-horas').textContent = '7h';
  $('notas').value = '';
  
  // Resetar hábitos
  document.querySelectorAll('.habit-btn').forEach(btn => btn.classList.remove('active'));
}

function updateSlider(id, value) {
  $(`val-${id}`).textContent = value;
  
  // Atualizar ícones ativos
  const icons = $(id).parentElement.querySelectorAll('.slider-icons i');
  icons.forEach(icon => icon.classList.remove('active'));
  
  const val = parseInt(value);
  if (val <= 3) icons[0].classList.add('active');
  else if (val <= 7) icons[1].classList.add('active');
  else icons[2].classList.add('active');
}

function toggleHabit(btn) {
  btn.classList.toggle('active');
}

async function salvarCheckin() {
  if (!state.user?.pacienteId) {
    showToast('Erro: usuário não identificado', 'error');
    return;
  }
  
  // Pegar valores dos sliders
  const humor = $('humor')?.value;
  const energia = $('energia')?.value;
  const sono = $('sono')?.value;
  const horas = $('horas')?.value;
  const notas = $('notas')?.value || '';
  
  if (!humor || !energia || !sono || !horas) {
    showToast('Preencha todos os campos', 'error');
    return;
  }
  
  const btn = document.querySelector('#page-checkin .btn-primary');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;
  }
  
  try {
    console.log('Salvando check-in...', { humor, energia, sono, horas, notas });
    
    // Salvar check-in
    await api('/checkins', {
      method: 'POST',
      body: {
        paciente_id: state.user.pacienteId,
        humor: parseInt(humor),
        energia: parseInt(energia),
        sono: parseInt(sono),
        horas_sono: parseFloat(horas),
        notas: notas
      }
    });
    
    // Salvar hábitos
    const agua = $('habit-agua')?.classList.contains('active') ? 2 : 0.5;
    const exercicio = $('habit-exercicio')?.classList.contains('active') ? 1 : 0;
    const alimentacao = $('habit-alimentacao')?.classList.contains('active') ? 5 : 3;
    
    await api('/checkins/habitos', {
      method: 'POST',
      body: {
        paciente_id: state.user.pacienteId,
        agua_litros: agua,
        exercicio: exercicio,
        alimentacao_saudavel: alimentacao
      }
    });
    
    showToast('Check-in salvo com sucesso!');
    
    setTimeout(() => {
      navigateTo('home');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Salvar Check-in';
        btn.disabled = false;
      }
    }, 1500);
    
  } catch (err) {
    console.error('Erro ao salvar:', err);
    showToast(err.message || 'Erro ao salvar', 'error');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check"></i> Salvar Check-in';
      btn.disabled = false;
    }
  }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
  if (!state.user?.pacienteId) {
    $('page-dashboard').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-chart-line"></i></div>
        <h3 class="empty-state-title">Sem dados ainda</h3>
        <p class="empty-state-text">Faça check-ins para ver seu dashboard.</p>
      </div>
    `;
    return;
  }
  
  try {
    const res = await api(`/checkins/paciente/${state.user.pacienteId}/dashboard`);
    const data = res.data;
    
    $('dash-media').textContent = data.score7Dias?.toFixed(0) || '--';
    $('dash-streak').textContent = data.streakDias || 0;
    
    // Chart
    const ctx = $('chart-evolucao').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
        datasets: [{
          label: 'Score',
          data: data.scoresUltimos7Dias || [65, 70, 68, 75, 72, 78, 80],
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#6366F1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { display: false, min: 0, max: 100 }
        }
      }
    });
    
    // Correlações (mock por enquanto)
    $('correlations-container').innerHTML = `
      <div class="insight-card">
        <i class="fas fa-lightbulb"></i>
        <span>Você dorme 23% melhor quando faz exercício regularmente.</span>
      </div>
      <div class="insight-card">
        <i class="fas fa-lightbulb"></i>
        <span>Seu humor é 31% melhor quando dorme 8+ horas.</span>
      </div>
    `;
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Verificar se já fez onboarding
    const onboardingDone = localStorage.getItem('bioritmo_onboarding');
    
    if (state.token && state.user) {
      // Usuário logado - ir direto para app
      showScreen('main-screen');
      setTimeout(loadHome, 100);
    } else if (onboardingDone) {
      // Já fez onboarding - mostrar login
      showScreen('auth-screen');
      initAuth();
    } else {
      // Primeira vez - mostrar onboarding
      showScreen('onboarding-screen');
      initOnboarding();
    }
  } catch (err) {
    console.error('Erro na inicialização:', err);
    // Fallback: mostrar tela de login
    showScreen('auth-screen');
  }
});
