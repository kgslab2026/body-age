import { navigate, state, showMain, HOME_ICON } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult } from './history.js';

const TEST_DURATION = 10;

export function startBalanceTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="mobile-only-box with-top-gap">
                    <div class="mobile-only-icon">📱</div>
                    <div class="mobile-only-title">모바일 전용 테스트예요</div>
                    <div class="mobile-only-desc">균형감각 테스트는 스마트폰의<br>자이로스코프 센서를 사용합니다.<br>모바일 기기에서 접속해 주세요!</div>
                </div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
        });
        return;
    }

    function showStart() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 class="test-title-accent">균형감각 테스트</h2>
                <div class="test-range-pill">측정 범위: 15살 ~ 70살</div>
                <p class="test-copy-relaxed">
                    📱 화면이 위를 향하도록 폰을 수평으로 들고<br>
                    <strong>한 발로 서서 ${TEST_DURATION}초</strong> 버텨보세요!<br><br>
                    폰의 흔들림으로 균형감각을 측정합니다.
                </p>
                <div class="test-note-card">
                    ⚠️ 안전한 곳에서 넘어지지 않게 주의하세요
                </div>
                <button id="start-btn" class="btn btn-start-wide">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = requestPermission;
        });
    }

    function requestPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') showCountdown(3);
                    else showPermissionError();
                })
                .catch(() => showPermissionError());
        } else {
            showCountdown(3);
        }
    }

    function showPermissionError() {
        if (!active) return;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="test-center-icon">⚠️</div>
                <div class="test-error-title">센서 권한이 필요합니다</div>
                <p class="test-error-desc">설정 → Safari → 동작 및 방향 접근 허용</p>
                <button id="back-btn" class="btn btn-start-wide">돌아가기</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('back-btn').onclick = showStart;
        });
    }

    function showCountdown(startCount) {
        if (!active) return;

        const html = `
            <div class="balance-display" id="bal-display">
                <div class="balance-phase-badge balance-phase-badge--ready" id="bal-badge">준비 중</div>
                <div class="balance-countdown" id="bal-num">${startCount}</div>
                <div class="balance-ring-wrap">
                    <div class="balance-ring"></div>
                    <div class="balance-ring-2"></div>
                    <div class="balance-ring-3"></div>
                    <div class="balance-ring-4"></div>
                    <div class="balance-ring-inner"></div>
                    <div class="balance-dot" id="bal-dot"></div>
                </div>
                <div class="balance-progress-wrap" id="bal-progress-wrap" style="opacity:0; transition:opacity 0.4s;">
                    <div class="balance-progress-bar" id="bal-progress"></div>
                </div>
                <div class="balance-live-hint" id="bal-hint">볼을 초록 원 안에 맞춰주세요!</div>
            </div>
        `;

        navigate(html, () => {
            let count = startCount;
            const readings = [];
            let measuring = false;

            const orientHandler = (e) => {
                if (!active) return;
                const beta = e.beta ?? 0;
                const gamma = e.gamma ?? 0;
                const dx = Math.max(-60, Math.min(60, gamma * 5));
                const dy = Math.max(-60, Math.min(60, beta * 5));
                const dot = document.getElementById('bal-dot');
                if (dot) {
                    dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    dot.style.background = dist < 12 ? '#22c55e' : dist < 32 ? '#fbbf24' : '#f87171';
                }
                if (measuring) readings.push({ beta, gamma });
            };
            window.addEventListener('deviceorientation', orientHandler);

            const cdTick = setInterval(() => {
                if (!active) {
                    clearInterval(cdTick);
                    window.removeEventListener('deviceorientation', orientHandler);
                    return;
                }
                count--;
                if (count <= 0) {
                    clearInterval(cdTick);
                    startMeasuring();
                } else {
                    const el = document.getElementById('bal-num');
                    if (el) el.textContent = count;
                }
            }, 1000);

            function startMeasuring() {
                measuring = true;
                let timeLeft = TEST_DURATION;

                const badge = document.getElementById('bal-badge');
                if (badge) {
                    badge.className = 'balance-phase-badge balance-phase-badge--testing';
                    badge.innerHTML = '<span class="balance-phase-dot"></span>측정 중';
                }
                const numEl = document.getElementById('bal-num');
                if (numEl) {
                    numEl.className = 'balance-timer';
                    numEl.textContent = timeLeft;
                }
                const pw = document.getElementById('bal-progress-wrap');
                if (pw) pw.style.opacity = '1';
                const hint = document.getElementById('bal-hint');
                if (hint) hint.textContent = '초록 원 안에 최대한 유지하세요!';

                const measTick = setInterval(() => {
                    if (!active) {
                        clearInterval(measTick);
                        window.removeEventListener('deviceorientation', orientHandler);
                        return;
                    }
                    timeLeft--;
                    const timerEl = document.getElementById('bal-num');
                    if (timerEl) timerEl.textContent = timeLeft;
                    const progressEl = document.getElementById('bal-progress');
                    if (progressEl) progressEl.style.width = `${((TEST_DURATION - timeLeft) / TEST_DURATION) * 100}%`;
                    if (timeLeft <= 0) {
                        clearInterval(measTick);
                        window.removeEventListener('deviceorientation', orientHandler);
                        calculateResult(readings);
                    }
                }, 1000);
            }
        });
    }

    function calculateResult(readings) {
        if (!active) return;
        if (readings.length < 20) {
            showSensorError();
            return;
        }
        // 중심(0,0)으로부터 평균 거리 — 가운데에 있을수록 낮음
        const avgDist = readings.reduce((s, r) =>
            s + Math.sqrt(r.beta * r.beta + r.gamma * r.gamma), 0) / readings.length;
        // 흔들림(표준편차) — 안정적일수록 낮음
        const betaMean = readings.reduce((s, r) => s + r.beta, 0) / readings.length;
        const gammaMean = readings.reduce((s, r) => s + r.gamma, 0) / readings.length;
        const sway = Math.sqrt(
            readings.reduce((s, r) =>
                s + Math.pow(r.beta - betaMean, 2) + Math.pow(r.gamma - gammaMean, 2), 0)
            / readings.length
        );
        // 최종 점수: 중심 이탈 60% + 흔들림 40%
        const score = avgDist * 0.6 + sway * 0.4;
        showResult(score);
    }

    function showSensorError() {
        if (!active) return;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="test-center-icon">📱</div>
                <div class="test-error-title">센서를 감지할 수 없어요</div>
                <p class="test-error-desc">
                    이 기기는 자이로스코프를 지원하지 않거나, 권한이 거부되었어요.<br>
                    설정에서 모션 센서 권한을 허용하고 다시 시도해주세요.
                </p>
                <div class="test-action-row">
                    <button id="retry-btn" class="btn btn-warn">재시도</button>
                    <button id="back-btn" class="btn btn-flex">돌아가기</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = () => requestPermission();
            document.getElementById('back-btn').onclick = showStart;
        });
    }

    function showResult(sway) {
        if (!active) return;
        const age = calculator.getBalanceAge(sway);
        const ageLabel = `${age}살`;
        state.save('balance', sway);
        saveResult('balance', age, `${sway.toFixed(1)}°`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 class="result-title">측정 결과</h2>
                <div class="age-result" style="font-size: 48px;">${ageLabel}</div>
                <p class="result-sub-note">중심 이탈 점수: <strong>${sway.toFixed(1)}°</strong></p>
${renderTipsCard('balance')}
                <div class="test-action-row test-action-row--compact">
                    <button id="retry-btn" class="btn btn-ghost-light">다시하기</button>
                    <button id="next-btn" class="btn btn-flex">다음 단계</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startBalanceTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
