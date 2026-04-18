// BIORITMO+ - Mobile Simples e Fluido

const API_URL = '/api';
let state = {
  token: localStorage.getItem('bioritmo_token'),
  user: JSON.parse(localStorage.getItem('bioritmo_user') || 'null'),
  page: 'home'
};

// API simples
async function api(endpoint, opts = {}) {
  const res = await fetch(API_URL + endpoint, {
    headers: { 'Content-Type': 'application/json', ...(state.token && { 'Authorization': 'Bearer ' + state.token }) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// Navegação entre telas
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Navegação bottom
function setPage(page) {
  state.page = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="' + page + '"]').classList.add('active');
  
  if (page === 'home') loadHome();
  if (page === 'checkin') loadCheckin();
  if (page === 'dashboard') loadDashboard();
}

// Home
async function loadHome() {
  const content = document.getElementById('home-content');
  if (!state.user?.pacienteId) {
    content.innerHTML = '<div class="card text-center"><p>Bem-vindo! Complete seu cadastro.</p></div>';
    return;
  }
  
  try {
    const [scoreRes, dashRes] = await Promise.all([
      api('/score/paciente/' + state.user.pacienteId).catch(() => null),
      api('/checkins/paciente/' + state.user.pacienteId + '/dashboard').catch(() => null)
    ]);
    
    const score = scoreRes?.data?.score_geral || '--';
    const streak = dashRes?.data?.streakDias || 0;
    
    content.innerHTML = `
      <div class="card score-card">
        <div class="score-value">${score}</div>
        <div class="score-label">Score de Saúde</div>
        ${streak > 0 ? '<div class="mt-1"><span style="background:rgba(255,255,255,0.2);padding:0.25rem 0.75rem;border-radius:20px;font-size:0.875rem;"><i class="fas fa-fire"></i> ' + streak + ' dias</span></div>' : ''}
      </div>
      
      <div class="card" onclick="setPage('checkin')" style="cursor:pointer;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:48px;height:48px;background:var(--accent-light);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:1.25rem;"><i class="fas fa-plus"></i></div>
          <div><div style="font-weight:600;">Novo Check-in</div><div style="font-size:0.875rem;color:var(--text-secondary);">Como você está hoje?</div></div>
        </div>
      </div>
      
      <div class="card" onclick="setPage('dashboard')" style="cursor:pointer;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:48px;height:48px;background:#D1FAE5;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--success);font-size:1.25rem;"><i class="fas fa-chart-line"></i></div>
          <div><div style="font-weight:600;">Meu Dashboard</div><div style="font-size:0.875rem;color:var(--text-secondary);">Veja sua evolução</div></div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = '<div class="card">Erro ao carregar dados</div>';
  }
}

// Check-in
function loadCheckin() {
  const content = document.getElementById('checkin-content');
  content.innerHTML = `
    <div class="card">
      <div class="card-title">Como você está?</div>
      
      <div class="slider-group">
        <div class="slider-header"><span>Humor</span><span class="slider-value" id="v-humor">5</span></div>
        <input type="range" id="humor" min="1" max="10" value="5" oninput="document.getElementById('v-humor').textContent=this.value">
      </div>
      
      <div class="slider-group">
        <div class="slider-header"><span>Energia</span><span class="slider-value" id="v-energia">5</span></div>
        <input type="range" id="energia" min="1" max="10" value="5" oninput="document.getElementById('v-energia').textContent=this.value">
      </div>
      
      <div class="slider-group">
        <div class="slider-header"><span>Sono</span><span class="slider-value" id="v-sono">5</span></div>
        <input type="range" id="sono" min="1" max="10" value="5" oninput="document.getElementById('v-sono').textContent=this.value">
      </div>
      
      <div class="slider-group">
        <div class="slider-header"><span>Horas de sono</span><span class="slider-value" id="v-horas">7h</span></div>
        <input type="range" id="horas" min="0" max="12" step="0.5" value="7" oninput="document.getElementById('v-horas').textContent=this.value+'h'">
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Hábitos de hoje</div>
      <div class="habits">
        <button type="button" class="habit-btn" id="h-agua" onclick="toggleHabit(this)">
          <i class="fas fa-tint"></i>Água
        </button>
        <button type="button" class="habit-btn" id="h-exercicio" onclick="toggleHabit(this)">
          <i class="fas fa-running"></i>Exercício
        </button>
        <button type="button" class="habit-btn" id="h-alimentacao" onclick="toggleHabit(this)">
          <i class="fas fa-carrot"></i>Alimentação
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Observações</div>
      <textarea id="notas" rows="3" placeholder="Como foi seu dia?"></textarea>
    </div>
    
    <button class="btn" onclick="salvarCheckin()">Salvar Check-in</button>
  `;
}

function toggleHabit(btn) {
  btn.classList.toggle('active');
}

async function salvarCheckin() {
  if (!state.user?.pacienteId) return alert('Erro: usuário não logado');
  
  const btn = document.querySelector('.btn');
  btn.textContent = 'Salvando...';
  btn.disabled = true;
  
  try {
    await api('/checkins', {
      method: 'POST',
      body: {
        paciente_id: state.user.pacienteId,
        humor: parseInt(document.getElementById('humor').value),
        energia: parseInt(document.getElementById('energia').value),
        sono: parseInt(document.getElementById('sono').value),
        horas_sono: parseFloat(document.getElementById('horas').value),
        notas: document.getElementById('notas').value
      }
    });
    
    await api('/checkins/habitos', {
      method: 'POST',
      body: {
        paciente_id: state.user.pacienteId,
        agua_litros: document.getElementById('h-agua').classList.contains('active') ? 2 : 0.5,
        exercicio: document.getElementById('h-exercicio').classList.contains('active') ? 1 : 0,
        alimentacao_saudavel: document.getElementById('h-alimentacao').classList.contains('active') ? 5 : 3
      }
    });
    
    alert('Check-in salvo!');
    setPage('home');
  } catch (e) {
    alert('Erro: ' + e.message);
    btn.textContent = 'Salvar Check-in';
    btn.disabled = false;
  }
}

// Dashboard
async function loadDashboard() {
  const content = document.getElementById('dashboard-content');
  content.innerHTML = '<div class="card text-center"><p>Carregando...</p></div>';
  
  if (!state.user?.pacienteId) {
    content.innerHTML = '<div class="card text-center"><p>Faça check-ins para ver seu dashboard</p></div>';
    return;
  }
  
  try {
    const res = await api('/checkins/paciente/' + state.user.pacienteId + '/dashboard');
    const data = res.data;
    
    content.innerHTML = `
      <div class="card">
        <div class="card-title">Resumo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;">
          <div class="text-center">
            <div style="font-size:2rem;font-weight:600;color:var(--accent);">${data.statsSemana?.totalCheckins || 0}</div>
            <div style="font-size:0.875rem;color:var(--text-secondary);">Esta semana</div>
          </div>
          <div class="text-center">
            <div style="font-size:2rem;font-weight:600;color:var(--success);">${data.streakDias || 0}</div>
            <div style="font-size:0.875rem;color:var(--text-secondary);">Dias seguidos</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">Gráfico</div>
        <canvas id="chart" style="max-height:200px;"></canvas>
      </div>
    `;
    
    // Chart simples
    new Chart(document.getElementById('chart'), {
      type: 'line',
      data: {
        labels: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
        datasets: [{
          label: 'Score',
          data: [65, 70, 68, 75, 72, 78, 80],
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
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
  } catch (e) {
    content.innerHTML = '<div class="card">Erro ao carregar dashboard</div>';
  }
}

// Login
async function login(e) {
  e.preventDefault();
  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: {
        email: document.getElementById('login-email').value,
        senha: document.getElementById('login-senha').value
      }
    });
    
    state.token = res.data.token;
    state.user = res.data.user;
    localStorage.setItem('bioritmo_token', state.token);
    localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
    
    showScreen('main-screen');
    loadHome();
  } catch (e) {
    alert('Erro no login: ' + e.message);
  }
}

// Register
async function register(e) {
  e.preventDefault();
  try {
    const res = await api('/auth/register', {
      method: 'POST',
      body: {
        nome: document.getElementById('reg-nome').value,
        email: document.getElementById('reg-email').value,
        senha: document.getElementById('reg-senha').value
      }
    });
    
    state.token = res.data.token;
    state.user = res.data.user;
    localStorage.setItem('bioritmo_token', state.token);
    localStorage.setItem('bioritmo_user', JSON.stringify(state.user));
    
    showScreen('main-screen');
    loadHome();
  } catch (e) {
    alert('Erro no cadastro: ' + e.message);
  }
}

// Logout
function logout() {
  state = { token: null, user: null, page: 'home' };
  localStorage.removeItem('bioritmo_token');
  localStorage.removeItem('bioritmo_user');
  showScreen('auth-screen');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners
  document.getElementById('login-form')?.addEventListener('submit', login);
  document.getElementById('register-form')?.addEventListener('submit', register);
  
  // Verificar login
  if (state.token && state.user) {
    showScreen('main-screen');
    loadHome();
  } else {
    showScreen('auth-screen');
  }
});
