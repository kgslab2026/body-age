import { startHearingTest } from './hearing.js';
import { startNeuralTest } from './neural.js';
import { startMemoryTest } from './memory.js';
import { startBalanceTest } from './balance.js';
import { startAttentionTest } from './attention.js';
import { startVisionTest } from './vision.js';
import { calculator } from './calculator.js';
import { showHistoryView } from './history.js';

const app = document.getElementById('app');

const STATE_KEY = 'bodyage_state';

export const state = {
    results: { hearing: null, neural: null, memory: null, balance: null, attention: null, vision: null },
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
    { id: 'hearing',   icon: '🎧', label: '청력 나이',    color: 'cyan',    available: true, action: startHearingTest, range: '15~80세' },
    { id: 'neural',    icon: '⚡', label: '반응속도 나이', color: 'amber',   available: true, action: startNeuralTest,  range: '20~70세' },
    { id: 'balance',   icon: '🦩', label: '균형감각 나이', color: 'emerald', available: true, action: startBalanceTest, range: '20~80세' },
    { id: 'attention', icon: '🎯', label: '집중력 나이',   color: 'red',     available: true, action: startAttentionTest, range: '20~80세' },
    { id: 'vision',    icon: '🔍', label: '시력 나이',     color: 'violet',  available: true, action: startVisionTest,  range: '20~80세' },
    { id: 'brain',     icon: '🧠', label: '기억력 나이',   color: 'blue',    available: true, action: startMemoryTest,  range: '20~80세' },
    { id: 'coming1',   icon: '🚧', label: '', color: 'gray',    available: false },
    { id: 'coming2',   icon: '🚧', label: '', color: 'gray',    available: false },
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

function showFinalResult() {
    const done = [];
    const pending = [];
    for (const i of indicators) {
        if (!i.available) continue;
        if (hasResult(i.id)) {
            done.push({ icon: i.icon, label: i.label.replace(' 나이', ''), age: getResultAge(i.id) });
        } else {
            pending.push({ icon: i.icon, label: i.label.replace(' 나이', '') });
        }
    }

    // 아직 아무것도 안 했을 때
    if (done.length === 0) {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size:3rem; margin:20px 0;">🏆</div>
                <div style="font-size:1.3rem; font-weight:900; color:#f1f5f9;">아직 측정 결과가 없어요</div>
                <p style="color:#64748b; margin-top:10px; line-height:1.7;">테스트를 하나 이상 완료하면<br>종합 결과를 볼 수 있어요!</p>
                <button id="btn-home2" class="btn" style="width:100%; margin-top:24px;">테스트 시작하기</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('btn-home2').onclick = showMain;
        });
        return;
    }

    const avgAge = Math.round(done.reduce((s, e) => s + e.age, 0) / done.length);

    const grade =
        avgAge <= 22 ? { g: 'S', msg: '전설적인 신체 능력이에요!', color: '#fbbf24' } :
        avgAge <= 32 ? { g: 'A', msg: '매우 젊고 건강한 신체예요!', color: '#34d399' } :
        avgAge <= 42 ? { g: 'B', msg: '평균보다 젊은 신체예요',     color: '#60a5fa' } :
        avgAge <= 55 ? { g: 'C', msg: '나이에 맞는 건강한 신체예요', color: '#a78bfa' } :
                       { g: 'D', msg: '꾸준한 관리를 시작해보세요', color: '#fb923c' };

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
        <div class="final-row" style="opacity:0.35;">
            <span class="final-icon">${e.icon}</span>
            <span class="final-label">${e.label}</span>
            <div class="final-bar-bg"></div>
            <span class="final-age" style="font-size:11px; color:#475569;">미측정</span>
        </div>`
    ).join('');

    const pendingNote = pending.length > 0
        ? `<p style="font-size:12px; color:#475569; text-align:center; margin:0 0 10px;">* ${pending.length}개 미완료 — 모두 측정하면 더 정확해져요</p>`
        : '';

    const shareLabels = done.map(e => e.label).join('·');
    const shareText = `신체 나이 측정기에서 ${shareLabels} 측정 결과, 평균 ${avgAge}살! 너도 해봐 👇`;

    const html = `
        <div class="final-box">
            <div class="final-header">
                <div class="final-grade" style="color:${grade.color}">${grade.g}</div>
                <div class="final-avg-label">종합 신체 나이 (${done.length}/6)</div>
                <div class="final-avg">${avgAge}살</div>
                <div class="final-msg">${grade.msg}</div>
            </div>
            <div class="final-rows">${doneRows}${pendingRows}</div>
            ${pendingNote}
            <button id="final-save"  class="save-img-btn">📸 이미지로 저장</button>
            <button id="final-share" class="share-fab">📤 결과 공유하기</button>
            <button id="final-history" class="history-fab">📋 이전 기록 보기</button>
            <button id="final-home" class="btn" style="width:100%; margin-top:4px; background:#1e293b;">처음으로</button>
        </div>
    `;

    navigate(html, () => {
        document.getElementById('final-home').onclick = showMain;
        document.getElementById('final-history').onclick = showHistoryView;
        document.getElementById('final-save').addEventListener('click', () => saveResultImage(done, avgAge, grade));
        document.getElementById('final-share').addEventListener('click', async () => {
            const btn = document.getElementById('final-share');
            const url = 'https://kgslab2026.github.io/body-age/';
            if (navigator.share) {
                try { await navigator.share({ title: '신체 나이 측정기', text: shareText, url }); }
                catch (e) { if (e.name !== 'AbortError') copyFinalLink(btn, `${shareText}\n${url}`); }
            } else {
                copyFinalLink(btn, `${shareText}\n${url}`);
            }
        });
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

function drawResultCard(done, avgAge, grade) {
    const W = 400;
    const H = 362 + done.length * 40;
    const DPR = 2;
    const canvas = document.createElement('canvas');
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // 배경 그라디언트
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#06030e');
    bg.addColorStop(0.45, '#0d083a');
    bg.addColorStop(1, '#04060f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 그리드 패턴
    ctx.strokeStyle = 'rgba(124,58,237,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 26) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let yy = 0; yy < H; yy += 26) { ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(W,yy); ctx.stroke(); }

    const pad = 32;
    let y = pad;

    // 앱 뱃지
    ctx.fillStyle = 'rgba(124,58,237,0.2)';
    ctx.strokeStyle = 'rgba(124,58,237,0.5)';
    ctx.lineWidth = 1;
    roundRect(ctx, pad, y, 126, 26, 13); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BODY AGE TEST', pad + 12, y + 17);
    y += 42;

    // 앱 이름
    ctx.fillStyle = '#64748b';
    ctx.font = '400 13px "Noto Sans KR", sans-serif';
    ctx.fillText('신체 나이 측정기 · KGS Lab', pad, y);
    y += 34;

    // 등급
    ctx.fillStyle = grade.color;
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = grade.color;
    ctx.shadowBlur = 24;
    ctx.fillText(grade.g, W / 2, y + 56);
    ctx.shadowBlur = 0;
    y += 72;

    // 종합 나이 라벨
    ctx.fillStyle = '#64748b';
    ctx.font = '700 12px "Noto Sans KR", sans-serif';
    ctx.fillText(`종합 신체 나이 (${done.length}/6)`, W / 2, y);
    y += 20;

    // 평균 나이
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '900 42px "Space Grotesk", sans-serif';
    ctx.fillText(`${avgAge}살`, W / 2, y + 34);
    y += 48;

    // 메시지
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 13px "Noto Sans KR", sans-serif';
    ctx.fillText(grade.msg, W / 2, y);
    y += 26;

    // 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 18;

    // 결과 행
    ctx.textAlign = 'left';
    const barX = pad + 92;
    const barW = W - barX - pad - 36;

    for (const e of done) {
        // 아이콘
        ctx.font = '15px sans-serif';
        ctx.fillText(e.icon, pad, y + 11);

        // 라벨
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 11px "Noto Sans KR", sans-serif';
        ctx.fillText(e.label, pad + 22, y + 12);

        // 바 배경
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        roundRect(ctx, barX, y + 4, barW, 7, 4); ctx.fill();

        // 바 채우기
        const pct = Math.max(0.05, e.age / 80);
        const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        barGrad.addColorStop(0, '#7c3aed');
        barGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = barGrad;
        roundRect(ctx, barX, y + 4, barW * pct, 7, 4); ctx.fill();

        // 나이
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${e.age}살`, W - pad, y + 12);
        ctx.textAlign = 'left';

        y += 40;
    }

    y += 6;

    // 하단 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 14;

    // URL
    ctx.fillStyle = '#334155';
    ctx.font = '400 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('kgslab2026.github.io/body-age', W / 2, y);

    return canvas;
}

async function saveResultImage(done, avgAge, grade) {
    const btn = document.getElementById('final-save');
    if (btn) { btn.textContent = '⏳ 생성 중...'; btn.disabled = true; }

    await document.fonts.ready;
    const canvas = drawResultCard(done, avgAge, grade);

    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'body-age-result.png', { type: 'image/png' });

        // 모바일: 이미지 파일 직접 공유
        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ title: '신체 나이 측정기', files: [file] });
                resetSaveBtn(btn);
                return;
            } catch (e) {
                if (e.name === 'AbortError') { resetSaveBtn(btn); return; }
            }
        }

        // PC: 다운로드
        const a = document.createElement('a');
        a.download = 'body-age-result.png';
        a.href = URL.createObjectURL(blob);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        if (btn) { btn.textContent = '✅ 저장됨!'; setTimeout(() => resetSaveBtn(btn), 2000); }
    }, 'image/png');
}

function resetSaveBtn(btn) {
    if (btn) { btn.textContent = '📸 이미지로 저장'; btn.disabled = false; }
}

function copyFinalLink(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ 복사됨!';
        btn.classList.add('share-fab--copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('share-fab--copied'); }, 2000);
    });
}

async function shareApp() {
    const shareData = {
        title: '신체 나이 측정기',
        text: '내 신체 나이가 궁금하다면? 청력·반응속도·균형·집중력·시력·기억력으로 측정해봐! 🕹️',
        url: 'https://kgslab2026.github.io/body-age/',
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (e) {
            if (e.name !== 'AbortError') copyLink();
        }
    } else {
        copyLink();
    }
}

function copyLink() {
    navigator.clipboard.writeText('https://kgslab2026.github.io/body-age/').then(() => {
        const btn = document.getElementById('btn-share');
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

export function showMain() {
    let completedCount = 0;
    const cards = indicators.map(item => {
        const done = item.available && hasResult(item.id);
        if (done) completedCount++;

        return `
            <div class="indicator-card card-${item.color} ${item.available ? 'available' : 'locked'}"
                 ${item.available ? `id="card-${item.id}" aria-label="${item.label} 테스트 시작"` : `aria-label="${item.label} 준비중"`}>
                <div class="card-icon">${item.icon}</div>
                <div class="card-label">${item.label}</div>
                ${item.range ? `<div class="card-range">${item.range}</div>` : ''}
                ${!item.available ? `<div class="badge-soon">COMING SOON</div>` : ''}
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
                <div class="hero-pulse">
                    <span class="pulse-ring r1"></span>
                    <span class="pulse-ring r2"></span>
                    <span class="pulse-ring r3"></span>
                    <img src="icon.png" alt="Body Age" class="pulse-icon">
                </div>
            </div>
            ${renderSummary()}
            <button id="btn-final" class="final-fab" aria-label="종합 결과 보기">🏆 종합 결과 보기 ${completedCount > 0 ? `(${completedCount}/6)` : ''}</button>
            <button id="btn-share" class="share-fab" aria-label="앱 추천하기">🔗 친구에게 추천하기</button>
            <div class="section-label">지표 선택 · ${completedCount}/6 완료</div>
            <div class="card-grid">${cards}</div>
            <footer class="app-footer">
                <a href="privacy.html" class="footer-link">개인정보처리방침</a>
                <span class="footer-sep">·</span>
                <span class="footer-copy">© 2026 KGS Lab</span>
            </footer>
        </div>
    `;

    navigate(html, () => {
        indicators.forEach(item => {
            if (!item.available) return;
            document.getElementById(`card-${item.id}`).onclick = item.action;
        });
        document.getElementById('btn-final')?.addEventListener('click', showFinalResult);
        document.getElementById('btn-history')?.addEventListener('click', showHistoryView);
        document.getElementById('btn-share').addEventListener('click', shareApp);
        document.getElementById('summary-reset')?.addEventListener('click', () => {
            state.clear();
            showMain();
        });
    });
}

window.onload = () => { state.load(); showMain(); };
