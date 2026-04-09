export const calculator = {
    // 출처: Human Benchmark (수백만 명 실측 평균)
    reactionData: [
        { ms: 220, age: 20 },  // 18-24세 평균(255ms) 이하 하한선
        { ms: 255, age: 24 },  // 18-24세 실측 평균 (최고 구간)
        { ms: 262, age: 30 },  // 25-34세 실측 평균
        { ms: 275, age: 40 },  // 35-44세 실측 평균
        { ms: 296, age: 50 },  // 45-54세 실측 평균
        { ms: 330, age: 60 },  // 55-64세 실측 평균
        { ms: 376, age: 70 },  // 65세+ 실측 평균
    ],

    getReactionAge(ms) {
        const data = this.reactionData;
        if (ms <= data[0].ms) return data[0].age;
        if (ms >= data[data.length - 1].ms) return data[data.length - 1].age;
        for (let i = 0; i < data.length - 1; i++) {
            const low = data[i];
            const high = data[i + 1];
            if (ms >= low.ms && ms <= high.ms) {
                const ratio = (ms - low.ms) / (high.ms - low.ms);
                return Math.round(low.age + (high.age - low.age) * ratio);
            }
        }
        return 70;
    },


    // 숫자 기억 폭(Digit Span) → 나이 (10살 단위, -5살 보너스와 조합해 5살 단위 세분화)
    memoryData: [
        { span: 3, age: 80 },
        { span: 4, age: 70 },
        { span: 5, age: 60 },
        { span: 6, age: 50 },
        { span: 7, age: 40 },
        { span: 8, age: 30 },
        { span: 9, age: 20 },
    ],

    getMemoryAge(span) {
        const data = this.memoryData;
        if (span <= data[0].span) return data[0].age;
        if (span >= data[data.length - 1].span) return data[data.length - 1].age;
        for (let i = 0; i < data.length - 1; i++) {
            const low = data[i];
            const high = data[i + 1];
            if (span >= low.span && span <= high.span) {
                const ratio = (span - low.span) / (high.span - low.span);
                return Math.round(low.age + (high.age - low.age) * ratio);
            }
        }
        return 80;
    },

    // 엑셀 데이터 + 80세 확장 데이터
    hearingData: [
        { hz: 20000, age: 15 },
        { hz: 19000, age: 20 },
        { hz: 17000, age: 24 },
        { hz: 15000, age: 29 },
        { hz: 14000, age: 34 },
        { hz: 12000, age: 44 },
        { hz: 10000, age: 54 },
        { hz: 8000,  age: 64 },
        { hz: 1000,  age: 80 }  // 80세 기준점
    ],

    // 시력 (색각 정답 개수 0~8) → 나이
    getVisionAge(correct) {
        const ageMap = [80, 75, 65, 55, 45, 35, 27, 23, 20];
        return ageMap[Math.min(correct, 8)];
    },

    // 집중력 (스트룹 테스트 평균 반응시간 ms, 오답 +500ms 페널티) → 나이
    // 출처: Stroop 테스트 연령별 반응시간 연구 기반
    attentionData: [
        { ms: 700,  age: 20 },
        { ms: 900,  age: 30 },
        { ms: 1100, age: 40 },
        { ms: 1400, age: 50 },
        { ms: 1700, age: 60 },
        { ms: 2100, age: 70 },
        { ms: 2600, age: 80 },
    ],

    getAttentionAge(ms) {
        const data = this.attentionData;
        if (ms <= data[0].ms) return data[0].age;
        if (ms >= data[data.length - 1].ms) return data[data.length - 1].age;
        for (let i = 0; i < data.length - 1; i++) {
            const low = data[i];
            const high = data[i + 1];
            if (ms >= low.ms && ms <= high.ms) {
                const ratio = (ms - low.ms) / (high.ms - low.ms);
                return Math.round(low.age + (high.age - low.age) * ratio);
            }
        }
        return 80;
    },

    // 균형감각 (자이로스코프 흔들림 표준편차 °) → 나이
    // 출처: Berg Balance Scale + postural sway 연구 기반 추정
    balanceData: [
        { sway: 2.0,  age: 20 },
        { sway: 4.0,  age: 30 },
        { sway: 6.0,  age: 40 },
        { sway: 8.5,  age: 50 },
        { sway: 11.0, age: 60 },
        { sway: 14.0, age: 70 },
        { sway: 18.0, age: 80 },
    ],

    getBalanceAge(sway) {
        const data = this.balanceData;
        if (sway <= data[0].sway) return data[0].age;
        if (sway >= data[data.length - 1].sway) return data[data.length - 1].age;
        for (let i = 0; i < data.length - 1; i++) {
            const low = data[i];
            const high = data[i + 1];
            if (sway >= low.sway && sway <= high.sway) {
                const ratio = (sway - low.sway) / (high.sway - low.sway);
                const age = low.age + (high.age - low.age) * ratio;
                return Math.round(age / 5) * 5;
            }
        }
        return 80;
    },

    getHearingAge(hz) {
        const data = this.hearingData;
        
        // [안전장치] 최고령/최연소 범위 밖 처리
        if (hz >= data[0].hz) return data[0].age;
        if (hz <= data[data.length - 1].hz) return data[data.length - 1].age;

        // 선형 보간 계산 (Pro 모델 검증 완료)
        for (let i = 0; i < data.length - 1; i++) {
            const high = data[i];
            const low = data[i + 1];

            if (hz <= high.hz && hz >= low.hz) {
                const ratio = (high.hz - hz) / (high.hz - low.hz);
                const age = high.age + (low.age - high.age) * ratio;
                return Math.round(age);
            }
        }
        return 80; // 기본값
    }
};