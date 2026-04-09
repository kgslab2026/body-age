import { navigate, showMain } from './app.js';

const STORAGE_KEY = 'bodyage_history';
const MAX_ENTRIES = 20;

const LABELS = {
    hearing:   { icon: '🎵', label: '청력 나이' },
    neural:    { icon: '⚡', label: '반응속도 나이' },
    balance:   { icon: '🌀', label: '균형감각 나이' },
    attention: { icon: '🎯', label: '집중력 나이' },
    vision:    { icon: '🔮', label: '시력 나이' },
    memory:    { icon: '🧩', label: '기억력 나이' },
};

function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
}

function persist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveResult(key, age, raw = null) {
    const data = load();
    if (!data[key]) data[key] = [];
    data[key].unshift({ age, raw, ts: Date.now() });
    if (data[key].length > MAX_ENTRIES) data[key].length = MAX_ENTRIES;
    persist(data);
}

export function hasHistory() {
    return Object.values(load()).some(arr => arr.length > 0);
}

// 결과 화면에 인라인으로 삽입: "이전 기록: 38살(310ms) → 32살(262ms) ↓"
export function renderHistoryInline(key) {
    const entries = (load()[key] ?? []).filter(e => e.age <= 100);
    if (entries.length < 2) return '';

    const curr = entries[0];
    const prev = entries[1];
    const diff = curr.age - prev.age;
    const [arrow, cls] =
        diff < -1 ? ['↓', 'hist-better'] :
        diff >  1 ? ['↑', 'hist-worse']  :
                    ['→', 'hist-same'];

    const fmt = e => e.raw != null ? `${e.age}살<span class="hist-raw">(${e.raw})</span>` : `${e.age}살`;

    return `<div class="hist-inline ${cls}">이전 기록: ${fmt(prev)} → ${fmt(curr)} <span class="hist-arrow">${arrow}</span></div>`;
}

function formatDate(ts) {
    const d   = new Date(ts);
    const now = new Date();
    const opt = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== now.getFullYear()) opt.year = 'numeric';
    return d.toLocaleDateString('ko-KR', opt);
}

export function showHistoryView() {
    const data = load();
    const hasAny = Object.values(data).some(a => a.length > 0);

    const sections = Object.entries(LABELS).map(([key, meta]) => {
        const entries = data[key] ?? [];
        if (entries.length === 0) return '';

        const rows = entries.map((e, i) => {
            const prev = entries[i + 1];
            const diff = prev ? e.age - prev.age : null;
            const trend =
                diff === null ? '' :
                diff < -1 ? '<span style="color:#34d399">↓</span>' :
                diff >  1 ? '<span style="color:#f87171">↑</span>' :
                            '';
            const isLatest = i === 0;
            return `
                <div class="history-entry ${isLatest ? 'history-entry-latest' : ''}">
                    <span class="history-entry-date">${formatDate(e.ts)}</span>
                    <span class="history-entry-age">${e.age}살 ${trend}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="history-section">
                <div class="history-section-header">
                    <span class="history-section-icon">${meta.icon}</span>
                    <span class="history-section-label">${meta.label}</span>
                    <span class="history-section-count">${entries.length}회</span>
                </div>
                ${rows}
            </div>
        `;
    }).join('');

    const html = `
        <div class="history-box">
            <button class="btn-home" id="btn-home">
                <span class="btn-home-icon">🏠</span><span>처음으로</span>
            </button>
            <div class="section-label">테스트 기록</div>
            ${hasAny ? sections : '<div class="history-empty">아직 기록이 없습니다.<br>테스트를 완료하면 여기에 쌓입니다.</div>'}
            ${hasAny ? `
                <button id="clear-history-btn" class="history-clear-btn">기록 전체 삭제</button>
            ` : ''}
        </div>
    `;

    navigate(html, () => {
        document.getElementById('btn-home').onclick = showMain;
        document.getElementById('clear-history-btn')?.addEventListener('click', () => {
            if (confirm('모든 기록을 삭제할까요?')) {
                localStorage.removeItem(STORAGE_KEY);
                showMain();
            }
        });
    });
}
