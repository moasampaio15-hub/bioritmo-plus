// BIORITMO+ - Versão Simples e Funcional

const API_URL = '/api';

// Estado
let token = localStorage.getItem('bioritmo_token');
let user = JSON.parse(localStorage.getItem('bioritmo_user') || 'null');

// Helper
function $(id) { return document.getElementById(id); }

// Mostrar/esconder telas
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  $(id).style.display = 'flex';
}

// Toast simples
function toast(msg, tipo = 'success') {
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  t.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check' : 'exclamation'}"></i> ${msg}`;
  t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:12px 24px;border-radius:8px;z-index:9999;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// API
async function api(endpoint, opts = {}) {
  const res = await fetch(API_URL + endpoint, {
    headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': 'Bearer ' + token }) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// ONBOARDING
let onboardingStep = 1;

function nextOnboarding() {
  if (onboardingStep < 3) {
    document.querySelectorAll('.onboarding-slide')[onboardingStep - 1].classList.remove('active');
    document.querySelectorAll('.dot')[onboardingStep - 1].classList.remove('active');
    onboardingStep++;
    document.querySelectorAll('.onboarding-slide')[onboardingStep - 1].classList.add('active');
    document.querySelectorAll('.dot')[onboardingStep - 1].classList.add('active');
    if (onboardingStep === 3) {
      $('btn-onboarding-next').innerHTML = '<span>Começar</span> <i class="fas fa-arrow-right"></i>';
    }
  } else {
    localStorage.setItem('bioritmo_onboarding', 'true');
    show('auth-screen');
  }
}

// LOGIN
$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: {
        email: $('login-email').value,
        senha: $('login-senha').value
      }
    });
    
    token = res.data.token;
    user = res.data.user;
    localStorage.setItem('bioritmo_token', token);
    localStorage.setItem('bioritmo_user', JSON.stringify(user));
    
    show('main-screen');
    loadHome();
  } catch (err) {
    toast(err.message, 'error');
    btn.innerHTML = 'Entrar';
  }
});

// CADASTRO
$('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  try {
    const res = await api('/auth/register', {
      method: 'POST',
      body: {
        nome: $('reg-nome').value,
        email: $('reg-email').value,
        senha: $('reg-senha').value
      }
    });
    
    token = res.data.token;
    user = res.data.user;
    localStorage.setItem('bioritmo_token', token);
    localStorage.setItem('bioritmo_user', JSON.stringify(user));
    
    show('main-screen');
    loadHome();
  } catch (err) {
    toast(err.message, 'error');
    btn.innerHTML = 'Criar conta';
  }
});

// TABS AUTH
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const form = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    $(form).classList.add('active');
  });
});

// NAVEGAÇÃO
function go(page) {
  // Esconder páginas
  $('page-home').style.display = 'none';
  $('page-checkin').style.display = 'none';
  $('page-dashboard').style.display = 'none';
  
  // Mostrar página
  $('page-' + page).style.display = 'block';
  
  // Atualizar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="' + page + '"]').classList.add('active');
  
  // Carregar
  if (page === 'home') loadHome();
  if (page === 'checkin') loadCheckin();
  if (page === 'dashboard') loadDashboard();
}

// HOME
async function loadHome() {
  if (!user?.pacienteId) return;
  
  try {
    const scoreRes = await api('/score/paciente/' + user.pacienteId).catch(() => null);
    const dashRes = await api('/checkins/paciente/' + user.pacienteId + '/dashboard').catch(() => null);
    
    $('score-value').textContent = scoreRes?.data?.score_geral || '--';
    $('checkins-semana').textContent = dashRes?.data?.statsSemana?.totalCheckins || 0;
    $('checkins-hoje').textContent = dashRes?.data?.checkinsHoje?.length || 0;
    
    const streak = dashRes?.data?.streakDias || 0;
    if (streak > 0) {
      $('streak-container').innerHTML = '<span class="streak-badge"><i class="fas fa-fire"></i> ' + streak + ' dias</span>';
    }
  } catch (e) {
    console.log('Erro home:', e);
  }
}

// CHECK-IN
function loadCheckin() {
  // Reset
  ['humor', 'energia', 'sono'].forEach(id => {
    $(id).value = 5;
    $('val-' + id).textContent = '5';
  });
  $('horas').value = 7;
  $('val-horas').textContent = '7h';
  $('notas').value = '';
  document.querySelectorAll('.habit-btn').forEach(b => b.classList.remove('active'));
}

function updateSlider(id, val) {
  $('val-' + id).textContent = val;
}

function toggleHabit(btn) {
  btn.classList.toggle('active');
}

async function saveCheckin() {
  if (!user?.pacienteId) {
    toast('Erro: não logado', 'error');
    return;
  }
  
  const btn = document.querySelector('#page-checkin button[onclick="saveCheckin()"]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
  
  try {
    // Check-in
    await api('/checkins', {
      method: 'POST',
      body: {
        paciente_id: user.pacienteId,
        humor: parseInt($('humor').value),
        energia: parseInt($('energia').value),
        sono: parseInt($('sono').value),
        horas_sono: parseFloat($('horas').value),
        notas: $('notas').value
      }
    });
    
    // Hábitos
    await api('/checkins/habitos', {
      method: 'POST',
      body: {
        paciente_id: user.pacienteId,
        agua_litros: $('habit-agua').classList.contains('active') ? 2 : 0.5,
        exercicio: $('habit-exercicio').classList.contains('active') ? 1 : 0,
        alimentacao_saudavel: $('habit-alimentacao').classList.contains('active') ? 5 : 3
      }
    });
    
    toast('Check-in salvo!');
    setTimeout(() => go('home'), 1000);
    
  } catch (err) {
    toast(err.message, 'error');
  }
  
  btn.innerHTML = '<i class="fas fa-check"></i> Salvar Check-in';
}

// DASHBOARD
async function loadDashboard() {
  if (!user?.pacienteId) return;
  
  try {
    const res = await api('/checkins/paciente/' + user.pacienteId + '/dashboard');
    const data = res.data;
    
    $('dash-media').textContent = data.score7Dias?.toFixed(0) || '--';
    $('dash-streak').textContent = data.streakDias || 0;
    
    // Gráfico
    new Chart($('chart-evolucao'), {
      type: 'line',
      data: {
        labels: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
        datasets: [{
          data: data.scoresUltimos7Dias || [70, 72, 75, 73, 78, 80, 82],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { display: false } }
      }
    });
  } catch (e) {
    console.log('Erro dashboard:', e);
  }
}

// LOGOUT
function logout() {
  token = null;
  user = null;
  localStorage.removeItem('bioritmo_token');
  localStorage.removeItem('bioritmo_user');
  show('auth-screen');
}

// INICIALIZAR
window.onload = function() {
  // Onboarding
  $('btn-onboarding-next').addEventListener('click', nextOnboarding);
  
  // Verificar estado
  const onboardingDone = localStorage.getItem('bioritmo_onboarding');
  
  if (token && user) {
    show('main-screen');
    loadHome();
  } else if (onboardingDone) {
    show('auth-screen');
  } else {
    show('onboarding-screen');
  }
};
