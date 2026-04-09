import { startHearingTest } from './hearing.js';
import { startNeuralTest } from './neural.js';
import { startMemoryTest } from './memory.js';
import { startBalanceTest } from './balance.js';
import { startAttentionTest } from './attention.js';
import { startVisionTest } from './vision.js';
import { calculator } from './calculator.js';
import { hasHistory, showHistoryView } from './history.js';

const app = document.getElementById('app');

export const state = {
    results: { hearing: null, neural: null, memory: null, balance: null, attention: null, vision: null },
    save(key, value) { this.results[key] = value; }
};

export function navigate(contentHtml, initFunction) {
    app.innerHTML = contentHtml;
    if (initFunction) initFunction();
}

const indicators = [
    { id: 'hearing',   icon: '🎵', label: '청력 나이',    color: 'cyan',    available: true, action: startHearingTest },
    { id: 'neural',    icon: '⚡', label: '반응속도 나이', color: 'amber',   available: true, action: startNeuralTest },
    { id: 'balance',   icon: '🌀', label: '균형감각 나이', color: 'emerald', available: true, action: startBalanceTest },
    { id: 'attention', icon: '🎯', label: '집중력 나이',   color: 'red',     available: true, action: startAttentionTest },
    { id: 'vision',    icon: '🔮', label: '시력 나이',     color: 'violet',  available: true, action: startVisionTest },
    { id: 'brain',     icon: '🧩', label: '기억력 나이',   color: 'blue',    available: true, action: startMemoryTest },
    { id: 'coming1',   icon: '🚧', label: '준비중 기능1', color: 'gray',    available: false },
    { id: 'coming2',   icon: '🚧', label: '준비중 기능2', color: 'gray',    available: false },
];

// brain indicator의 결과는 state.results.memory에 저장됨
function getStateKey(id) { return id === 'brain' ? 'memory' : id; }

function hasResult(id) { return state.results[getStateKey(id)] != null; }

function getResultAge(id) {
    const value = state.results[getStateKey(id)];
    switch (id) {
        case 'hearing':   return calculator.getHearingAge(value);
        case 'neural':    return calculator.getReactionAge(value);
        case 'brain':     return calculator.getMemoryAge(value);
        case 'balance':   return calculator.getBalanceAge(value);
        case 'attention': return calculator.getAttentionAge(value);
        case 'vision':    return calculator.getVisionAge(value);
        default: return null;
    }
}

function renderSummary() {
    const entries = [];
    for (const i of indicators) {
        if (!hasResult(i.id)) continue;
        const age = getResultAge(i.id);
        if (age != null) entries.push({ icon: i.icon, label: i.label.replace(' 나이', ''), age });
    }

    if (entries.length === 0) return '';

    const avgAge = Math.round(entries.reduce((s, e) => s + e.age, 0) / entries.length);

    const rows = entries.map(e => {
        const pct = Math.max(5, Math.round((e.age / 80) * 100));
        return `
            <div class="summary-row">
                <span class="summary-icon">${e.icon}</span>
                <span class="summary-label">${e.label}</span>
                <div class="summary-bar-bg">
                    <div class="summary-bar-fill" style="width:${pct}%"></div>
                </div>
                <span class="summary-age">${e.age}살</span>
            </div>
        `;
    }).join('');

    return `
        <div class="summary-card">
            <div class="summary-header">
                <span class="summary-title">⚡ BODY STATS</span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button id="summary-reset" class="summary-reset-btn" aria-label="모든 결과 초기화">RESET</button>
                    <span class="summary-avg">${avgAge}살</span>
                </div>
            </div>
            <div class="summary-rows">${rows}</div>
        </div>
    `;
}

export function showMain() {
    let completedCount = 0;
    const cards = indicators.map(item => {
        const done = item.available && hasResult(item.id);
        if (done) completedCount++;
        const age = done ? getResultAge(item.id) : null;

        return `
            <div class="indicator-card card-${item.color} ${item.available ? 'available' : 'locked'}"
                 ${item.available ? `id="card-${item.id}" aria-label="${item.label} 테스트 시작"` : `aria-label="${item.label} 준비중"`}>
                ${item.available ? `<div class="active-badge">ACTIVE</div>` : ''}
                <div class="card-icon">${item.icon}</div>
                <div class="card-label">${item.label}</div>
                ${!item.available ? `<div class="badge-soon">COMING SOON</div>` : ''}
                ${done ? `<div class="done-overlay">✓ ${age}살</div>` : ''}
            </div>
        `;
    }).join('');

    const html = `
        <div class="main-box">
            <div class="hero">
                <div class="hero-text">
                    <div class="hero-badge">신체 나이 측정기</div>
                    <div class="hero-main">재미로 확인하는<br>내 신체 나이 측정</div>
                </div>
                <div class="hero-emoji">🕹️</div>
            </div>
            ${renderSummary()}
            ${hasHistory() ? `<button id="btn-history" class="history-fab" aria-label="기록 보기">📋 기록 보기</button>` : ''}
            <div class="section-label">지표 선택 · ${completedCount}/6 완료</div>
            <div class="card-grid">${cards}</div>
        </div>
    `;

    navigate(html, () => {
        indicators.forEach(item => {
            if (!item.available) return;
            document.getElementById(`card-${item.id}`).onclick = item.action;
        });
        document.getElementById('btn-history')?.addEventListener('click', showHistoryView);
        document.getElementById('summary-reset')?.addEventListener('click', () => {
            Object.keys(state.results).forEach(k => { state.results[k] = null; });
            showMain();
        });
    });
}

window.onload = showMain;
