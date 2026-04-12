import { startHearingTest } from './hearing.js';
import { startNeuralTest } from './neural.js';
import { startMemoryTest } from './memory.js';
import { startBalanceTest } from './balance.js';
import { startAttentionTest } from './attention.js';
import { startVisionTest } from './vision.js';
import { startNumberTest } from './number.js';
import { calculator } from './calculator.js';
import { showHistoryView, showConfirm } from './history.js';

export const APP_URL = 'https://kgslab2026.github.io/body-age/';

export const HOME_ICON = `<svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
  <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M7 18v-5h6v5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

const ICONS = {
    hearing: `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><path d="M19 7c-6.5 0-11 5-11 11 0 4 1.8 7.5 4.5 9.5v7c0 2 1.5 3 3.5 3h2c2 0 3-1.5 3-3v-2c0-2 1-3 2.5-4.5C25.5 26.5 28 23 28 18c0-6.5-4-11-9-11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19 13c-3 0-5 2.5-5 5 0 2 1 3.5 2.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".6"/><path d="M31 14c2 2 3 4 3 6s-1 4.5-3 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><path d="M35 10.5c3 3.5 4.5 7 4.5 9.5s-1.5 6.5-4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".25"/></svg>`,
    neural:  `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><path d="M27 4L11 24h11L17 40 37 20H26z" fill="currentColor" opacity=".12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M27 4L11 24h11L17 40 37 20H26z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="5" y1="19" x2="9" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".4"/><line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".3"/><line x1="5" y1="29" x2="9" y2="29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".2"/></svg>`,
    balance: `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><circle cx="22" cy="8" r="4" stroke="currentColor" stroke-width="2"/><line x1="22" y1="12" x2="22" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="18" x2="34" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="26" x2="22" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="28" x2="34" y2="35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="38" x2="29" y2="38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".4"/></svg>`,
    attention:`<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="17" stroke="currentColor" stroke-width="1.5" opacity=".3"/><circle cx="22" cy="22" r="10" stroke="currentColor" stroke-width="2" opacity=".65"/><circle cx="22" cy="22" r="3" fill="currentColor"/><line x1="22" y1="3" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="32" x2="22" y2="41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="22" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="22" x2="41" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    vision:  `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><path d="M4 22c4.5-10 9.5-14 18-14s13.5 4 18 14c-4.5 10-9.5 14-18 14S8.5 32 4 22z" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="22" r="7" stroke="currentColor" stroke-width="2"/><circle cx="22" cy="22" r="3" fill="currentColor" opacity=".8"/><circle cx="25" cy="20" r="1.2" fill="currentColor" opacity=".5"/><line x1="22" y1="15" x2="22" y2="11" stroke="currentColor" stroke-width="1" opacity=".35"/><line x1="22" y1="29" x2="22" y2="33" stroke="currentColor" stroke-width="1" opacity=".35"/></svg>`,
    brain:   `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><path d="M22 8c-3.5 0-6.5 2-8 5.5-2.5.3-5 2.5-5 5.5 0 2 1 3.5 2.5 4.5-.5 2-.5 5.5 2 7.5 1 2 3 3 5.5 3.5V38h6v-3.5c2.5-.5 4.5-1.5 5.5-3.5 2.5-2 2.5-5.5 2-7.5 1.5-1 2.5-2.5 2.5-4.5 0-3-2.5-5.2-5-5.5C28.5 10 25.5 8 22 8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16" cy="19" r="1.8" fill="currentColor" opacity=".7"/><circle cx="22" cy="16" r="1.8" fill="currentColor" opacity=".7"/><circle cx="28" cy="19" r="1.8" fill="currentColor" opacity=".7"/><circle cx="18.5" cy="26" r="1.8" fill="currentColor" opacity=".7"/><circle cx="25.5" cy="26" r="1.8" fill="currentColor" opacity=".7"/><line x1="16" y1="19" x2="22" y2="16" stroke="currentColor" stroke-width="1" opacity=".35"/><line x1="22" y1="16" x2="28" y2="19" stroke="currentColor" stroke-width="1" opacity=".35"/><line x1="16" y1="19" x2="18.5" y2="26" stroke="currentColor" stroke-width="1" opacity=".35"/><line x1="28" y1="19" x2="25.5" y2="26" stroke="currentColor" stroke-width="1" opacity=".35"/><line x1="18.5" y1="26" x2="25.5" y2="26" stroke="currentColor" stroke-width="1" opacity=".35"/></svg>`,
    number:  `<svg viewBox="0 0 44 44" width="1em" height="1em" fill="none" aria-hidden="true"><rect x="12" y="12" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2"/><rect x="17" y="17" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5" opacity=".5"/><line x1="17" y1="12" x2="17" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="12" x2="22" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="27" y1="12" x2="27" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="17" y1="32" x2="17" y2="38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="32" x2="22" y2="38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="27" y1="32" x2="27" y2="38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="17" x2="6" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="22" x2="6" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="27" x2="6" y2="27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="17" x2="38" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="22" x2="38" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="27" x2="38" y2="27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};



const app = document.getElementById('app');

const STATE_KEY = 'bodyage_state';

export const state = {
    results: { hearing: null, neural: null, memory: null, balance: null, attention: null, vision: null, number: null },
    save(key, value) {
        this.results[key] = value;
        try {
            const saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
            saved[key] = value;
            localStorage.setItem(STATE_KEY, JSON.stringify(saved));
        } catch {}
    },
    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
            Object.assign(this.results, saved);
        } catch {}
    },
    clear() {
        Object.keys(this.results).forEach(k => { this.results[k] = null; });
        localStorage.removeItem(STATE_KEY);
    }
};

export function navigate(contentHtml, initFunction) {
    app.classList.remove('page-enter');
    app.innerHTML = contentHtml;
    void app.offsetWidth;
    app.classList.add('page-enter');
    if (initFunction) initFunction();
}

const indicators = [
    { id: 'hearing',   icon: ICONS.hearing,   emoji: '👂', label: '청력 나이',    color: 'cyan',    available: true, action: startHearingTest,   range: '15~70세' },
    { id: 'neural',    icon: ICONS.neural,    emoji: '⚡', label: '반응속도 나이', color: 'amber',   available: true, action: startNeuralTest,    range: '15~70세' },
    { id: 'balance',   icon: ICONS.balance,   emoji: '🧘', label: '균형감각 나이', color: 'emerald', available: true, action: startBalanceTest,   range: '15~70세' },
    { id: 'attention', icon: ICONS.attention, emoji: '🎯', label: '집중력 나이',   color: 'red',     available: true, action: startAttentionTest, range: '15~70세' },
    { id: 'vision',    icon: ICONS.vision,    emoji: '👁️', label: '색감 나이',     color: 'violet',  available: true, action: startVisionTest,    range: '15~70세' },
    { id: 'brain',     icon: ICONS.brain,     emoji: '🧠', label: '기억력 나이',   color: 'blue',    available: true, action: startMemoryTest,    range: '15~70세' },
    { id: 'number',    icon: ICONS.number,    emoji: '🔢', label: '처리속도 나이',  color: 'orange',  available: true, action: startNumberTest,    range: '15~70세' },
    { id: 'coming1',   icon: '🚧',            emoji: '🚧', label: '',              color: 'gray',    available: false },
];

// brain indicator의 결과는 state.results.memory에 저장됨
function getStateKey(id) { return id === 'brain' ? 'memory' : id; }

function hasResult(id) { return state.results[getStateKey(id)] != null; }

function getResultAge(id) {
    const value = state.results[getStateKey(id)];
    switch (id) {
        case 'hearing':   return calculator.getHearingAge(value);
        case 'neural':    return calculator.getReactionAge(value);
        case 'brain':
            if (value !== null && typeof value === 'object')
                return value.partial && value.maxSpan >= 4
                    ? calculator.getMemoryAgePartial(value.maxSpan)
                    : calculator.getMemoryAge(value.maxSpan);
            return calculator.getMemoryAge(value);
        case 'balance':   return calculator.getBalanceAge(value);
        case 'attention':
            if (value !== null && typeof value === 'object')
                return calculator.getAttentionAge(value.correctCount, value.avgRawTime);
            return calculator.getAttentionAge(0, value);
        case 'vision':
            if (value !== null && typeof value === 'object')
                return calculator.getVisionAge(value.correctCount, value.partialCount);
            return calculator.getVisionAge(value);
        case 'number':    return calculator.getNumberAge(value);
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
                <div class="summary-meta">
                    <button id="summary-reset" class="summary-reset-btn" aria-label="모든 결과 초기화">RESET</button>
                    <span class="summary-avg">${avgAge}살</span>
                </div>
            </div>
            <div class="summary-rows">${rows}</div>
        </div>
    `;
}

function showFinalResult() {
    const done = [];
    const pending = [];
    for (const i of indicators) {
        if (!i.available) continue;
        if (hasResult(i.id)) {
            done.push({ id: i.id, icon: i.icon, label: i.label.replace(' 나이', ''), age: getResultAge(i.id) });
        } else {
            pending.push({ icon: i.icon, label: i.label.replace(' 나이', '') });
        }
    }

    // 아직 아무것도 안 했을 때
    if (done.length === 0) {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="empty-result-icon">🏆</div>
                <div class="empty-result-title">아직 측정 결과가 없어요</div>
                <p class="empty-result-copy">테스트를 하나 이상 완료하면<br>종합 결과를 볼 수 있어요!</p>
                <button id="btn-home2" class="btn empty-result-cta">테스트 시작하기</button>
                <div class="final-share-row" style="margin-top:16px">
                    <button id="btn-share-empty" class="share-fab">📤 결과 공유하기</button>
                    <button id="btn-recommend-empty" class="share-fab">🔗 친구에게 추천하기</button>
                </div>
                <div class="final-sub-actions" style="margin-top:8px">
                    <button id="btn-history-empty" class="history-fab">📋 이전 기록 보기</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('btn-home2').onclick = showMain;
            document.getElementById('btn-share-empty').addEventListener('click', () => showToast('📋 검사 결과가 없습니다'));
            document.getElementById('btn-recommend-empty').addEventListener('click', e => shareApp(e.currentTarget));
            document.getElementById('btn-history-empty').addEventListener('click', showHistoryView);
        });
        return;
    }

    const avgAge = Math.round(done.reduce((s, e) => s + e.age, 0) / done.length);


    const doneRows = done.map(e => {
        const pct = Math.max(5, Math.round((e.age / 80) * 100));
        return `
            <div class="final-row">
                <span class="final-icon">${e.icon}</span>
                <span class="final-label">${e.label}</span>
                <div class="final-bar-bg"><div class="final-bar-fill" style="width:${pct}%"></div></div>
                <span class="final-age">${e.age}살</span>
            </div>`;
    }).join('');

    const pendingRows = pending.map(e => `
        <div class="final-row final-row-pending">
            <span class="final-icon">${e.icon}</span>
            <span class="final-label">${e.label}</span>
            <div class="final-bar-bg"></div>
            <span class="final-age final-age-pending">미측정</span>
        </div>`
    ).join('');

    const pendingNote = pending.length > 0
        ? `<p class="final-note">* ${pending.length}개 미완료 — 모두 측정하면 더 정확해져요</p>`
        : '';

    const html = `
        <div class="final-box">
            <div class="final-header">
                <div class="final-avg-label">종합 신체 나이 (${done.length}/${indicators.filter(i => i.available).length})</div>
                <div class="final-avg">${avgAge}살</div>
            </div>
            <div class="final-rows">${doneRows}${pendingRows}</div>
            ${pendingNote}
            <div class="final-actions">
                <div class="final-share-row">
                    <button id="final-share" class="share-fab">📤 결과 공유하기</button>
                    <button id="final-recommend" class="share-fab">🔗 친구에게 추천하기</button>
                </div>
            </div>
            <div class="final-sub-actions">
                <button id="final-history" class="history-fab">📋 이전 기록 보기</button>
                <button id="final-home" class="btn final-home-btn">처음으로</button>
            </div>
            <div class="final-disclaimer">
                본 결과는 의료 진단이 아닌 참고·오락 목적입니다.<br>
                건강 이상이 의심되면 전문 의료기관을 방문하세요.
                <a href="terms.html" class="final-disclaimer-link">이용약관</a>
            </div>
        </div>
    `;

    navigate(html, () => {
        document.getElementById('final-home').onclick = showMain;
        document.getElementById('final-history').onclick = showHistoryView;
        document.getElementById('final-share').addEventListener('click', () => shareResultImage(done, avgAge));
        document.getElementById('final-recommend').addEventListener('click', e => shareApp(e.currentTarget));
    });
}

// ── 결과 이미지 저장 ──
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawSvgIcon(ctx, svgStr, x, y, size, color) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const scale = size / 44;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    for (const el of doc.querySelectorAll('path, circle, line, rect')) {
        const tag = el.tagName;
        const stroke = el.getAttribute('stroke');
        const fill = el.getAttribute('fill');
        const sw = parseFloat(el.getAttribute('stroke-width') || '1');
        const op = parseFloat(el.getAttribute('opacity') || '1');

        ctx.save();
        ctx.globalAlpha = op;
        ctx.lineWidth = sw;
        ctx.lineCap = el.getAttribute('stroke-linecap') || 'butt';
        ctx.lineJoin = el.getAttribute('stroke-linejoin') || 'miter';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        if (tag === 'path') {
            const p = new Path2D(el.getAttribute('d'));
            if (fill && fill !== 'none') ctx.fill(p);
            if (stroke && stroke !== 'none') ctx.stroke(p);
        } else if (tag === 'circle') {
            ctx.beginPath();
            ctx.arc(+el.getAttribute('cx'), +el.getAttribute('cy'), +el.getAttribute('r'), 0, Math.PI * 2);
            if (fill && fill !== 'none') ctx.fill();
            if (stroke && stroke !== 'none') ctx.stroke();
        } else if (tag === 'line') {
            ctx.beginPath();
            ctx.moveTo(+el.getAttribute('x1'), +el.getAttribute('y1'));
            ctx.lineTo(+el.getAttribute('x2'), +el.getAttribute('y2'));
            if (stroke && stroke !== 'none') ctx.stroke();
        } else if (tag === 'rect') {
            const rx = +(el.getAttribute('x') || 0), ry = +(el.getAttribute('y') || 0);
            const rw = +el.getAttribute('width'),   rh = +el.getAttribute('height');
            const r  = +(el.getAttribute('rx') || 0);
            if (r > 0) { roundRect(ctx, rx, ry, rw, rh, r); } else { ctx.beginPath(); ctx.rect(rx, ry, rw, rh); }
            if (fill && fill !== 'none') ctx.fill();
            if (stroke && stroke !== 'none') ctx.stroke();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawResultCard(done, avgAge) {
    const W = 400;
    const ROW_H = 50;
    const H = 380 + done.length * ROW_H;
    const DPR = 2;
    const canvas = document.createElement('canvas');
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // ── 배경 ──
    ctx.fillStyle = '#07040f';
    ctx.fillRect(0, 0, W, H);

    // 방사형 글로우 (좌상단)
    const g1 = ctx.createRadialGradient(W * 0.15, H * 0.15, 0, W * 0.15, H * 0.15, W * 0.65);
    g1.addColorStop(0, 'rgba(109,40,217,0.35)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

    // 방사형 글로우 (우하단)
    const g2 = ctx.createRadialGradient(W * 0.9, H * 0.85, 0, W * 0.9, H * 0.85, W * 0.5);
    g2.addColorStop(0, 'rgba(79,20,180,0.2)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    // 미세 그리드
    ctx.strokeStyle = 'rgba(124,58,237,0.07)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let yy = 0; yy < H; yy += 24) { ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(W,yy); ctx.stroke(); }

    // 상단 퍼플 라인
    const topLine = ctx.createLinearGradient(0, 0, W, 0);
    topLine.addColorStop(0,   'rgba(124,58,237,0)');
    topLine.addColorStop(0.5, 'rgba(168,85,247,1)');
    topLine.addColorStop(1,   'rgba(124,58,237,0)');
    ctx.fillStyle = topLine;
    ctx.fillRect(0, 0, W, 2);

    const pad = 28;
    let y = pad + 6;

    // ── 앱 타이틀 ──
    ctx.textAlign = 'left';

    // "BODY AGE" — 굵고 밝게
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Space Grotesk", sans-serif';
    ctx.fillText('BODY AGE', pad, y + 22);

    // 구분 점
    const baWidth = ctx.measureText('BODY AGE').width;
    ctx.fillStyle = 'rgba(168,85,247,0.9)';
    ctx.font = '700 22px "Space Grotesk", sans-serif';
    ctx.fillText(' —', pad + baWidth, y + 22);

    const dashWidth = ctx.measureText(' —').width;

    // "신체 나이 측정기" — 가늘고 연하게
    ctx.fillStyle = 'rgba(196,181,253,0.75)';
    ctx.font = '400 14px "Noto Sans KR", sans-serif';
    ctx.fillText(' 신체 나이 측정기', pad + baWidth + dashWidth, y + 21);

    y += 52;

    // ── 나이 카드 ──
    const cardH = 130;
    const cardX = pad;
    const cardW = W - pad * 2;

    // 카드 배경
    ctx.fillStyle = 'rgba(124,58,237,0.1)';
    roundRect(ctx, cardX, y, cardW, cardH, 16); ctx.fill();

    // 카드 테두리 (그라디언트)
    const borderGrad = ctx.createLinearGradient(cardX, y, cardX + cardW, y + cardH);
    borderGrad.addColorStop(0,   'rgba(168,85,247,0.8)');
    borderGrad.addColorStop(0.5, 'rgba(124,58,237,0.4)');
    borderGrad.addColorStop(1,   'rgba(168,85,247,0.8)');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, y, cardW, cardH, 16); ctx.stroke();

    ctx.textAlign = 'center';

    // "내 신체 나이" 라벨
    ctx.fillStyle = 'rgba(196,181,253,0.8)';
    ctx.font = '500 14px "Noto Sans KR", sans-serif';
    ctx.fillText('내 신체 나이', W / 2, y + 32);

    // 숫자 글로우
    ctx.shadowColor = 'rgba(168,85,247,0.65)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.fillText(`${avgAge}살`, W / 2, y + 105);
    ctx.shadowBlur = 0;
    y += cardH + 20;

    // 그라디언트 구분선
    const divGrad = ctx.createLinearGradient(pad, 0, W - pad, 0);
    divGrad.addColorStop(0,   'rgba(124,58,237,0)');
    divGrad.addColorStop(0.5, 'rgba(124,58,237,0.5)');
    divGrad.addColorStop(1,   'rgba(124,58,237,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 20;

    // ── 결과 행 ──
    const ACCENT = {
        hearing:   '#22d3ee', neural: '#fbbf24', balance:   '#34d399',
        attention: '#f87171', vision: '#a78bfa', brain:     '#60a5fa', number: '#fb923c',
    };
    const ICON_SIZE = 18;
    const labelX = pad + 14 + ICON_SIZE + 6;
    const barX   = labelX + 68;
    const barW   = W - barX - pad - 40;

    ctx.textAlign = 'left';
    for (const e of done) {
        const accent = ACCENT[e.id] || '#a78bfa';

        // 행 배경
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(ctx, pad, y, W - pad * 2, ROW_H - 6, 8); ctx.fill();

        // 왼쪽 컬러 액센트 바
        ctx.fillStyle = accent;
        roundRect(ctx, pad, y, 3, ROW_H - 6, 2); ctx.fill();

        // 아이콘
        drawSvgIcon(ctx, e.icon, pad + 12, y + (ROW_H - 6 - ICON_SIZE) / 2, ICON_SIZE, accent);

        // 라벨
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '400 11px "Noto Sans KR", sans-serif';
        ctx.fillText(e.label, labelX, y + 20);

        // 바 배경
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, barX, y + 19, barW, 5, 3); ctx.fill();

        // 바 채우기 (지표색 그라디언트)
        const pct = Math.max(0.05, e.age / 80);
        const bGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        bGrad.addColorStop(0, accent + '88');
        bGrad.addColorStop(1, accent);
        ctx.fillStyle = bGrad;
        roundRect(ctx, barX, y + 19, barW * pct, 5, 3); ctx.fill();

        // 나이 값
        ctx.fillStyle = accent;
        ctx.font = '700 13px "Space Grotesk", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${e.age}살`, W - pad, y + 22);
        ctx.textAlign = 'left';

        y += ROW_H;
    }

    y += 10;

    // 하단 KGS Lab
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(196,181,253,0.6)';
    ctx.font = '600 14px "Space Grotesk", sans-serif';
    ctx.fillText('KGS Lab', W / 2, y + 8);


    return canvas;
}

async function buildResultImageFile(done, avgAge) {
    await document.fonts.ready;
    const canvas = drawResultCard(done, avgAge);
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            resolve(new File([blob], 'body-age-result.png', { type: 'image/png' }));
        }, 'image/png');
    });
}


async function shareResultImage(done, avgAge) {
    const btn = document.getElementById('final-share');
    if (btn) { btn.textContent = '⏳ 생성 중...'; btn.disabled = true; }

    const file = await buildResultImageFile(done, avgAge);

    const reset = () => { if (btn) { btn.textContent = '📤 결과 공유하기'; btn.disabled = false; } };

    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ title: '신체 나이 측정기', files: [file] });
            reset();
            return;
        } catch (e) {
            if (e.name === 'AbortError') { reset(); return; }
        }
    }

    // 공유 API 미지원 시 다운로드로 대체
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.download = 'body-age-result.png';
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    reset();
}



async function shareApp(triggerBtn) {
    const shareData = {
        title: '신체 나이 측정기',
        text: '내 신체 나이가 궁금하다면? 청력·반응속도·균형·집중력·색감·기억력으로 측정해봐! 🕹️',
        url: APP_URL,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (e) {
            if (e.name !== 'AbortError') copyLink(triggerBtn);
        }
    } else {
        copyLink(triggerBtn);
    }
}

function copyLink(btn) {
    navigator.clipboard.writeText(APP_URL).then(() => {
        if (!btn) return;
        const original = btn.textContent;
        btn.textContent = '✅ 링크 복사됨!';
        btn.classList.add('share-fab--copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('share-fab--copied');
        }, 2000);
    });
}

let toastTimer = null;
function showToast(msg) {
    let toast = document.getElementById('coming-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'coming-toast';
        toast.className = 'coming-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    clearTimeout(toastTimer);
    toast.classList.remove('show');
    void toast.offsetWidth; // reflow
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function showComingSoonToast() { showToast('🚧 곧 출시될 예정이에요!'); }

export function showMain() {
    const availableCount = indicators.filter(i => i.available).length;
    let completedCount = 0;
    const cards = indicators.map(item => {
        const done = item.available && hasResult(item.id);
        if (done) completedCount++;

        return `
            <div class="indicator-card card-${item.color} ${item.available ? 'available' : 'locked'} ${done ? 'completed' : ''}"
                 id="card-${item.id}" role="button" tabindex="0"
                 ${item.available ? `aria-label="${item.label} 테스트 시작"` : `aria-label="준비중" aria-disabled="true"`}>
                <div class="card-icon">${item.icon}</div>
                <div class="card-label">${item.label}</div>
                ${item.range ? `<div class="card-range">${item.range}</div>` : ''}
                ${!item.available ? `<div class="badge-soon">COMING SOON</div>` : ''}
                ${done ? `<div class="check-badge">✓</div>` : ''}
            </div>
        `;
    }).join('');

    const progressSegments = Array.from({ length: availableCount }, (_, idx) => (
        `<span class="progress-segment ${idx < completedCount ? 'filled' : ''}" aria-hidden="true"></span>`
    )).join('');

    const html = `
        <div class="main-box">
            <div class="hero">
                <div class="hero-text">
                    <div class="hero-badge">신체 나이 측정기</div>
                    <div class="hero-main">재미로 해보는<br>내 신체 나이 테스트</div>
                </div>
                <div class="hero-pulse">
                    <span class="pulse-ring r1"></span>
                    <span class="pulse-ring r2"></span>
                    <span class="pulse-ring r3"></span>
                    <img src="icon.png" alt="Body Age" class="pulse-icon">
                </div>
            </div>
            ${renderSummary()}
            <button id="btn-final" class="final-fab" aria-label="종합 결과 보기">🏆 종합 결과 보기 ${completedCount > 0 ? `(${completedCount}/${availableCount})` : ''}</button>
            <div class="progress-section">
                <div class="section-label-wrapper">
                    <div class="section-label">지표 선택</div>
                    <span class="progress-count">${completedCount}/${availableCount}</span>
                </div>
                <div class="progress-steps" aria-label="지표 진행도 ${completedCount}/${availableCount}">
                    ${progressSegments}
                </div>
            </div>
            <div class="card-grid">${cards}</div>
            <footer class="app-footer">
                <a href="privacy.html" class="footer-link">개인정보처리방침</a>
                <span class="footer-sep">·</span>
                <a href="terms.html" class="footer-link">이용약관</a>
                <span class="footer-sep">·</span>
                <span class="footer-copy">© 2026 KGS Lab</span>
            </footer>
        </div>
    `;

    navigate(html, () => {
        indicators.forEach(item => {
            const card = document.getElementById(`card-${item.id}`);
            if (!card) return;
            const action = item.available ? item.action : showComingSoonToast;
            card.onclick = action;
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
            });
        });
        document.getElementById('btn-final')?.addEventListener('click', showFinalResult);
        document.getElementById('btn-history')?.addEventListener('click', showHistoryView);
        document.getElementById('summary-reset')?.addEventListener('click', () => {
            showConfirm('모든 결과를 초기화할까요?', () => {
                state.clear();
                showMain();
            });
        });
    });
}

window.onload = () => { state.load(); showMain(); };
