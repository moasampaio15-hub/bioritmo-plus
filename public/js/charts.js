/**
 * BIORITMO+ - Gráficos
 */

// Configuração global do Chart.js
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#6b7280';
Chart.defaults.scale.grid.color = '#f3f4f6';

const CHART_COLORS = {
    primary: '#8b5cf6',    // Roxo
    secondary: '#3b82f6',  // Azul
    success: '#10b981',    // Verde
    warning: '#f59e0b',    // Laranja
    danger: '#ef4444',     // Vermelho
    info: '#06b6d4',       // Ciano
    gray: '#9ca3af'
};

/**
 * Gráfico de evolução semanal (linha)
 */
function createWeeklyChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(d => {
        const date = new Date(d.data);
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    });
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Humor',
                    data: data.map(d => d.humor),
                    borderColor: CHART_COLORS.primary,
                    backgroundColor: CHART_COLORS.primary + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Energia',
                    data: data.map(d => d.energia),
                    borderColor: CHART_COLORS.secondary,
                    backgroundColor: 'transparent',
                    tension: 0.4
                },
                {
                    label: 'Sono',
                    data: data.map(d => d.sono),
                    borderColor: CHART_COLORS.info,
                    backgroundColor: 'transparent',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de score (gauge)
 */
function createScoreGauge(canvasId, score) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const color = score >= 75 ? CHART_COLORS.success : 
                  score >= 60 ? CHART_COLORS.warning : CHART_COLORS.danger;
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Score', 'Restante'],
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [color, '#f3f4f6'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            rotation: -90,
            circumference: 180
        },
        plugins: [{
            id: 'scoreText',
            beforeDraw: (chart) => {
                const { ctx, chartArea: { top, bottom, left, right } } = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2 + 20;
                
                ctx.save();
                ctx.font = 'bold 48px Inter';
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.fillText(score, centerX, centerY);
                
                ctx.font = '14px Inter';
                ctx.fillStyle = '#6b7280';
                ctx.fillText('de 100', centerX, centerY + 24);
                ctx.restore();
            }
        }]
    });
}

/**
 * Gráfico de hábitos (radar)
 */
function createHabitsRadar(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Água', 'Exercício', 'Alimentação', 'Sono', 'Social', 'Pausas'],
            datasets: [{
                label: 'Hábitos',
                data: [
                    data.agua || 5,
                    data.exercicio || 5,
                    data.alimentacao || 5,
                    data.sono || 5,
                    data.social || 5,
                    data.pausas || 5
                ],
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primary + '30',
                pointBackgroundColor: CHART_COLORS.primary,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: CHART_COLORS.primary
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Gráfico de barras - Distribuição de scores
 */
function createScoreDistribution(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mental', 'Físico', 'Sono', 'Hábitos'],
            datasets: [{
                label: 'Score',
                data: [data.mental, data.fisico, data.sono, data.habitos],
                backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.info,
                    CHART_COLORS.success
                ],
                borderRadius: 8,
                borderSkipped: false
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
                    max: 100,
                    ticks: {
                        stepSize: 25
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de linha - Evolução do score
 */
function createScoreHistory(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(d => {
        const date = new Date(d.data);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Score Geral',
                data: data.map(d => d.score_geral),
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primary + '20',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
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

/**
 * Gráfico de pizza - Aderência
 */
function createAdherenceChart(canvasId, percentage) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Preenchido', 'Faltante'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [CHART_COLORS.success, '#f3f4f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [{
            id: 'percentageText',
            beforeDraw: (chart) => {
                const { ctx, chartArea: { top, bottom, left, right } } = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                
                ctx.save();
                ctx.font = 'bold 32px Inter';
                ctx.fillStyle = CHART_COLORS.success;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percentage}%`, centerX, centerY);
                ctx.restore();
            }
        }]
    });
}

// Exportar para uso global
window.BioritmoCharts = {
    createWeeklyChart,
    createScoreGauge,
    createHabitsRadar,
    createScoreDistribution,
    createScoreHistory,
    createAdherenceChart
};
