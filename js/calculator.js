export const calculator = {
    reactionData: [
        { ms: 200, age: 15 },
        { ms: 215, age: 18 },
        { ms: 255, age: 22 },
        { ms: 262, age: 30 },
        { ms: 275, age: 40 },
        { ms: 296, age: 50 },
        { ms: 330, age: 60 },
        { ms: 376, age: 70 },
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


    // 숫자 기억 폭(Digit Span) → 나이
    memoryData: [
        { span: 3,  age: 70 },
        { span: 4,  age: 64 },
        { span: 5,  age: 58 },
        { span: 6,  age: 50 },
        { span: 7,  age: 37 },
        { span: 8,  age: 30 },
        { span: 9,  age: 25 },
        { span: 10, age: 20 },
        { span: 11, age: 15 },
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
        return 70;
    },

    getMemoryAgePartial(span) {
        // 1개 틀림: 현재 span 나이와 이전 span 나이의 중간값
        const current = this.getMemoryAge(span);
        const prev = this.getMemoryAge(span - 1);
        return Math.round((current + prev) / 2);
    },

    // 나이별 최대 가청 주파수 (15~70세, 1살 단위, 5세 앵커 사이 선형 보간)
    // 앵커: 15→20000, 20→18000, 25→17000, 30→16000, 35→15000, 40→14000,
    //        45→13000, 50→12000, 55→11000, 60→10000, 65→9000, 70→8000 (Hz)
    hearingData: [
        { hz: 20000, age: 15 },
        { hz: 19600, age: 16 },
        { hz: 19200, age: 17 },
        { hz: 18800, age: 18 },
        { hz: 18400, age: 19 },
        { hz: 18000, age: 20 },
        { hz: 17800, age: 21 },
        { hz: 17600, age: 22 },
        { hz: 17400, age: 23 },
        { hz: 17200, age: 24 },
        { hz: 17000, age: 25 },
        { hz: 16800, age: 26 },
        { hz: 16600, age: 27 },
        { hz: 16400, age: 28 },
        { hz: 16200, age: 29 },
        { hz: 16000, age: 30 },
        { hz: 15800, age: 31 },
        { hz: 15600, age: 32 },
        { hz: 15400, age: 33 },
        { hz: 15200, age: 34 },
        { hz: 15000, age: 35 },
        { hz: 14800, age: 36 },
        { hz: 14600, age: 37 },
        { hz: 14400, age: 38 },
        { hz: 14200, age: 39 },
        { hz: 14000, age: 40 },
        { hz: 13800, age: 41 },
        { hz: 13600, age: 42 },
        { hz: 13400, age: 43 },
        { hz: 13200, age: 44 },
        { hz: 13000, age: 45 },
        { hz: 12800, age: 46 },
        { hz: 12600, age: 47 },
        { hz: 12400, age: 48 },
        { hz: 12200, age: 49 },
        { hz: 12000, age: 50 },
        { hz: 11800, age: 51 },
        { hz: 11600, age: 52 },
        { hz: 11400, age: 53 },
        { hz: 11200, age: 54 },
        { hz: 11000, age: 55 },
        { hz: 10800, age: 56 },
        { hz: 10600, age: 57 },
        { hz: 10400, age: 58 },
        { hz: 10200, age: 59 },
        { hz: 10000, age: 60 },
        { hz:  9800, age: 61 },
        { hz:  9600, age: 62 },
        { hz:  9400, age: 63 },
        { hz:  9200, age: 64 },
        { hz:  9000, age: 65 },
        { hz:  8800, age: 66 },
        { hz:  8600, age: 67 },
        { hz:  8400, age: 68 },
        { hz:  8200, age: 69 },
        { hz:  8000, age: 70 },
    ],

    // 색감 (정답 개수 0~10) → 나이, 부분정답 1개당 +2살
    getVisionAge(correct, partialCount = 0) {
        const ageMap = [70, 67, 62, 56, 50, 44, 38, 32, 26, 20, 15];
        const base = ageMap[Math.min(correct, 10)];
        return Math.min(70, base + partialCount * 2);
    },

    // 집중력 (스트룹 테스트) → 나이
    // 속도 주 지표, 오답당 250ms 페널티
    getAttentionAge(correctCount, avgMs) {
        const wrongCount = 10 - Math.min(correctCount, 10);
        const effectiveMs = avgMs + wrongCount * 250;

        if (effectiveMs <  500) return 15;
        if (effectiveMs <  650) return 18;
        if (effectiveMs <  800) return 22;
        if (effectiveMs <  950) return 27;
        if (effectiveMs < 1100) return 32;
        if (effectiveMs < 1300) return 38;
        if (effectiveMs < 1500) return 44;
        if (effectiveMs < 1800) return 50;
        if (effectiveMs < 2200) return 56;
        if (effectiveMs < 2700) return 63;
        return 70;
    },

    // 균형감각 (중심 이탈 60% + 흔들림 40% 합산 점수) → 나이
    // score = avgDist*0.6 + sway*0.4  (도 단위)
    balanceData: [
        { sway:  2.0, age: 15 },
        { sway:  4.5, age: 25 },
        { sway:  7.5, age: 40 },
        { sway: 11.0, age: 50 },
        { sway: 15.0, age: 60 },
        { sway: 20.0, age: 70 },
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
                return Math.round(age);
            }
        }
        return 70;
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
        return 70; // 기본값
    },

    // 숫자 순서 찾기 (평균 소요시간 ms) → 나이 (제한 30초)
    numberData: [
        { ms:  6000, age: 15 },
        { ms:  8000, age: 20 },
        { ms: 11000, age: 30 },
        { ms: 14000, age: 40 },
        { ms: 18000, age: 50 },
        { ms: 23000, age: 60 },
        { ms: 30000, age: 70 },
    ],

    getNumberAge(ms) {
        const data = this.numberData;
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
    }
};