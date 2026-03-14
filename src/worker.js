// worker.js

// --- 核心距離計算函數 ---

// 歐幾里德距離 (用於計算 RGB 空間中的顏色差異)
export const colorDistance = (r1, g1, b1, r2, g2, b2) => {
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
};

export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// 1. HSV 判斷邏輯（已調整：加入綠色通道純度檢查）
export const isPixelBackgroundHSVHard = (r, g, b, tolerancePercent) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let hue = 0;
    if (delta !== 0) {
        if (max === g) hue = 60 * ((b - r) / delta + 2);
        else if (max === r) hue = 60 * ((g - b) / delta + 4);
        else hue = 60 * ((r - g) / delta);
    }
    if (hue < 0) hue += 360;

    const saturation = max === 0 ? 0 : delta / max;
    const value = max / 255;

    const toleranceFactor = tolerancePercent / 100;

    // --- 綠幕去背的強制條件 ---

    // 🌟 關鍵調整 1: 綠色通道純度檢查 (防止誤殺藍色/紅色)
    // 綠色通道必須明顯高於紅藍通道。容許度越高，純度要求越低。
    // 這裡我們只允許 G/R 和 G/B 的比值在一定範圍內。
    const greenPurityMultiplier = 1.2 * (1 - toleranceFactor * 0.5); // 容許度高，乘數低
    const isGreenDominant = (g > r * greenPurityMultiplier) && (g > b * greenPurityMultiplier);

    if (!isGreenDominant) {
        return false; // 如果綠色不佔絕對優勢，立刻判定為前景（保護藍色文字）
    }

    // 關鍵調整 2: HSV 門檻檢查 (確保是目標範圍內的綠色)
    const isGreenHue = (hue >= 60 && hue <= 180); // 綠色色相範圍

    const baseSat = 0.5;
    const baseVal = 0.5;

    // 容許度控制的是可以向下放寬的幅度 (最高 50%)
    const minSat = Math.max(0.1, baseSat * (1 - toleranceFactor * 0.5));
    const minVal = Math.max(0.1, baseVal * (1 - toleranceFactor * 0.5));

    const isStandardGreenScreen = isGreenHue && saturation >= minSat && value >= minVal;

    // 額外判斷綠色是否明顯佔優勢 (防止前景的淺色被誤判)
    const isDominantGreen = (g > r + 30) && (g > b + 30) && (g > 80);

    return isStandardGreenScreen || isDominantGreen;
};


// 2. 核心去背邏輯：實現邊緣柔化 (Feathering)
export const removeBgFeathered = (imgData, targetHex, tolerancePercent, smoothnessPercent) => {
    const data = imgData.data;
    const len = data.length;

    const toleranceFactor = tolerancePercent / 100;
    const smoothnessFactor = smoothnessPercent / 100;

    const isGreenScreen = targetHex.toLowerCase() === '#00ff00';
    const targetRgb = isGreenScreen ? null : hexToRgb(targetHex) || { r: 0, g: 0, b: 0 };
    const maxDist = 442;

    for (let i = 0; i < len; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        let similarity = 0;

        if (isGreenScreen) {
            // 對綠幕使用 HSV 邏輯 (使用柔化專用的相似度計算)
            const distG = Math.abs(g - 255);
            const distRB = Math.abs(r - 0) + Math.abs(b - 0);
            const score = (distG * 0.5) + distRB;
            similarity = 1 - (score / 442); // 正規化為 0-1
        } else {
            const distance = colorDistance(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b);
            similarity = 1 - (distance / maxDist);
        }

        const edgeStart = toleranceFactor;
        const edgeEnd = Math.max(0, edgeStart - smoothnessFactor);

        if (similarity >= edgeStart) {
            data[i + 3] = 0;
        } else if (similarity > edgeEnd) {
            const range = edgeStart - edgeEnd;
            const diff = similarity - edgeEnd;
            let alpha = Math.round(255 * (1 - diff / range));
            data[i + 3] = Math.max(0, Math.min(255, alpha));
        } else {
            data[i + 3] = 255;
        }
    }

    return imgData;
};

// 3. 連通去背 (Flood Fill) 邏輯 - HARD EDGE 模式（使用最新的綠色純度檢查）
export const removeBgFloodFill = (imgData, w, h, targetHex, tolerancePercent) => {
    const data = imgData.data;
    const isGreenScreen = targetHex.toLowerCase() === '#00ff00';
    const targetRgb = isGreenScreen ? null : hexToRgb(targetHex) || { r: 0, g: 0, b: 0 };
    const maxDist = 442;
    const toleranceDist = maxDist * (tolerancePercent / 100);

    const isBackground = (r, g, b) => {
        if (isGreenScreen) {
            return isPixelBackgroundHSVHard(r, g, b, tolerancePercent);
        } else {
            const distance = colorDistance(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b);
            return distance <= toleranceDist;
        }
    };

    // === 第一輪：從四個角落開始的連通 Flood Fill ===
    const stack = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    const visited = new Uint8Array(w * h);

    while (stack.length) {
        const [x, y] = stack.pop();
        const offset = y * w + x;

        if (x < 0 || x >= w || y < 0 || y >= h || visited[offset]) continue;
        visited[offset] = 1;

        const idx = offset * 4;

        if (isBackground(data[idx], data[idx + 1], data[idx + 2])) {
            data[idx + 3] = 0;
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    // === 第二輪：全域掃描清理殘留綠色口袋 ===
    // 處理被角色/文字隔開、Flood Fill 無法觸及的綠色區域
    const len = w * h * 4;
    for (let i = 0; i < len; i += 4) {
        if (data[i + 3] === 0) continue; // 已經透明的跳過
        if (isBackground(data[i], data[i + 1], data[i + 2])) {
            data[i + 3] = 0;
        }
    }

    return imgData;
};

// 4. 侵蝕濾鏡
export const applyErosion = (imgData, w, h, strength) => {
    if (strength <= 0) return imgData;

    const data = imgData.data;

    for (let k = 0; k < strength; k++) {
        const currentAlpha = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) currentAlpha[i] = data[i * 4 + 3];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;

                if (currentAlpha[idx] > 0) {
                    if (currentAlpha[idx - 1] === 0 || currentAlpha[idx + 1] === 0 ||
                        currentAlpha[idx - w] === 0 || currentAlpha[idx + w] === 0) {
                        data[idx * 4 + 3] = 0;
                    }
                }
            }
        }
    }
    return imgData;
};

// --- Web Worker Main Listener ---

if (typeof self !== 'undefined') {
    self.onmessage = function (e) {
        const { id, rawImageData, removalMode, targetColorHex, colorTolerance, erodeStrength, smoothness, width, height } = e.data;

        let processedImageData = rawImageData;

        if (removalMode === 'flood') {
            // 連通去背 (Hard Edge) - 請使用此模式
            processedImageData = removeBgFloodFill(processedImageData, width, height, targetColorHex, colorTolerance);
        } else {
            // 柔化去背 (Feathering)
            processedImageData = removeBgFeathered(processedImageData, targetColorHex, colorTolerance, smoothness);
        }

        // 執行邊緣侵蝕
        processedImageData = applyErosion(processedImageData, width, height, erodeStrength);

        // 將結果傳回主執行緒 (Web Worker 加速的核心)
        self.postMessage({ id: id, processedImageData: processedImageData }, [processedImageData.data.buffer]);
    };
}
