import { navigate, showMain, HOME_ICON, state } from './app.js';

const STORAGE_KEY = 'bodyage_history';
const MAX_ENTRIES = 20;

const LABELS = {
    hearing:   { icon: '🎵', label: '청력 나이' },
    neural:    { icon: '⚡', label: '반응속도 나이' },
    balance:   { icon: '🌀', label: '균형감각 나이' },
    attention: { icon: '🎯', label: '집중력 나이' },
    vision:    { icon: '🔮', label: '색감 나이' },
    memory:    { icon: '🧩', label: '기억력 나이' },
};

function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
}

function persist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearByKey(key) {
    const data = load();
    if (!data[key]) return;
    delete data[key];
    persist(data);
}

export function showConfirm(message, onOk) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-title">삭제 확인</div>
            <div class="confirm-msg">${message}</div>
            <div class="confirm-btns">
                <button class="confirm-cancel">취소</button>
                <button class="confirm-ok">삭제</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.confirm-cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-ok').onclick = () => { overlay.remove(); onOk(); };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
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

function buildSparkline(entries, key) {
    // entries[0] = 최신, 그래프는 오래된 것 → 최신 순으로 표시
    const pts = [...entries].reverse();
    const W = 280, H = 90, PAD_L = 30, PAD_R = 12, PAD_T = 10, PAD_B = 24;

    const ages = pts.map(e => e.age);
    const minA = Math.max(0,  Math.min(...ages) - 5);
    const maxA = Math.max(80, Math.max(...ages) + 5);

    const toX = i => PAD_L + (i / Math.max(pts.length - 1, 1)) * (W - PAD_L - PAD_R);
    const toY = a => PAD_T + (1 - (a - minA) / (maxA - minA)) * (H - PAD_T - PAD_B);

    // 폴리라인 경로
    const linePts = pts.map((e, i) => `${toX(i).toFixed(1)},${toY(e.age).toFixed(1)}`).join(' ');

    // 면적 채우기용 polygon
    const areaFirst = `${toX(0).toFixed(1)},${(H - PAD_B).toFixed(1)}`;
    const areaLast  = `${toX(pts.length - 1).toFixed(1)},${(H - PAD_B).toFixed(1)}`;
    const areaPts   = `${areaFirst} ${linePts} ${areaLast}`;

    // Y축 눈금 (2개)
    const midA = Math.round((minA + maxA) / 2);
    const yMid = toY(midA);
    const yMax = toY(maxA);
    const yMin = toY(minA);

    // X축 날짜 레이블 (최대 5개)
    const step = Math.max(1, Math.floor(pts.length / 5));
    const dateLabels = pts
        .map((e, i) => ({ i, ts: e.ts }))
        .filter((_, idx) => idx === 0 || idx === pts.length - 1 || idx % step === 0)
        .slice(0, 5)
        .map(({ i, ts }) => {
            const d = new Date(ts);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            return `<text x="${toX(i).toFixed(1)}" y="${H}" class="hg-date">${label}</text>`;
        }).join('');

    // 점
    const dots = pts.map((e, i) => {
        const isLatest = i === pts.length - 1;
        return `<circle cx="${toX(i).toFixed(1)}" cy="${toY(e.age).toFixed(1)}"
            r="${isLatest ? 4 : 2.5}"
            class="${isLatest ? 'hg-dot-latest' : 'hg-dot'}" />`;
    }).join('');

    // 최신값 레이블
    const latestX = toX(pts.length - 1);
    const latestY = toY(pts[pts.length - 1].age);
    const labelX  = Math.min(latestX + 6, W - PAD_R - 20);
    const latestLabel = `<text x="${labelX.toFixed(1)}" y="${(latestY + 4).toFixed(1)}" class="hg-label-latest">${pts[pts.length - 1].age}살</text>`;

    const gradId = `hg-grad-${key}`;
    return `
        <svg viewBox="0 0 ${W} ${H}" width="100%" class="hg-svg">
            <defs>
                <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#a855f7" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <!-- 그리드 -->
            <line x1="${PAD_L}" y1="${yMax.toFixed(1)}" x2="${W - PAD_R}" y2="${yMax.toFixed(1)}" class="hg-grid"/>
            <line x1="${PAD_L}" y1="${yMid.toFixed(1)}" x2="${W - PAD_R}" y2="${yMid.toFixed(1)}" class="hg-grid"/>
            <line x1="${PAD_L}" y1="${yMin.toFixed(1)}" x2="${W - PAD_R}" y2="${yMin.toFixed(1)}" class="hg-grid"/>
            <!-- Y축 레이블 -->
            <text x="${(PAD_L - 4).toFixed(1)}" y="${(yMax + 4).toFixed(1)}" class="hg-ylabel">${Math.round(maxA)}</text>
            <text x="${(PAD_L - 4).toFixed(1)}" y="${(yMid + 4).toFixed(1)}" class="hg-ylabel">${midA}</text>
            <text x="${(PAD_L - 4).toFixed(1)}" y="${(yMin + 4).toFixed(1)}" class="hg-ylabel">${Math.round(minA)}</text>
            <!-- 면적 -->
            <polygon points="${areaPts}" fill="url(#${gradId})"/>
            <!-- 선 -->
            <polyline points="${linePts}" class="hg-line"/>
            <!-- 점 -->
            ${dots}
            <!-- 최신값 레이블 -->
            ${latestLabel}
            <!-- X축 날짜 -->
            ${dateLabels}
        </svg>`;
}

export function showHistoryView() {
    const data = load();
    const hasAny = Object.values(data).some(a => a.length > 0);

    const sections = Object.entries(LABELS).map(([key, meta]) => {
        const entries = data[key] ?? [];
        if (entries.length === 0) return '';

        const latest  = entries[0];
        const prev    = entries[1];
        const diff    = prev ? latest.age - prev.age : null;
        const [trendIcon, trendCls, trendText] =
            diff === null ? ['', '', ''] :
            diff < -1     ? ['↓', 'hg-better', `${Math.abs(diff)}살 개선`] :
            diff >  1     ? ['↑', 'hg-worse',  `${diff}살 증가`] :
                            ['→', 'hg-same',   '유지'];

        const sparkline = entries.length >= 2
            ? buildSparkline(entries, key)
            : `<div class="hg-single">측정 1회 — 다음 측정 후 그래프가 표시됩니다</div>`;

        return `
            <div class="history-section">
                <div class="history-section-header">
                    <span class="history-section-icon">${meta.icon}</span>
                    <span class="history-section-label">${meta.label}</span>
                    <span class="history-section-count">${entries.length}회</span>
                    <button class="history-section-clear-btn" data-key="${key}" aria-label="${meta.label} 기록 삭제">지우기</button>
                </div>
                <div class="hg-summary">
                    <span class="hg-latest-age">${latest.age}살</span>
                    ${diff !== null ? `<span class="hg-trend ${trendCls}">${trendIcon} ${trendText}</span>` : ''}
                </div>
                ${sparkline}
            </div>
        `;
    }).join('');

    const html = `
        <div class="history-box">
            <button class="btn-home" id="btn-home">
                <span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span>
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

        document.querySelectorAll('.history-section-clear-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                if (!key) return;
                const label = LABELS[key]?.label ?? '해당 지표';
                showConfirm(`${label} 기록을 삭제할까요?`, () => {
                    clearByKey(key);
                    state.save(key, null);
                    showHistoryView();
                });
            });
        });

        document.getElementById('clear-history-btn')?.addEventListener('click', () => {
            showConfirm('모든 기록을 삭제할까요?', () => {
                localStorage.removeItem(STORAGE_KEY);
                state.clear();
                showMain();
            });
        });
    });
}
