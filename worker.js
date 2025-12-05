// worker.js

// --- 核心距離計算函數 ---

// 歐幾里德距離 (用於計算 RGB 空間中的顏色差異)
const colorDistance = (r1, g1, b1, r2, g2, b2) => {
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
};

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// 1. RGB 距離計算 (回傳實際距離)
const isTargetColorRGB = (r, g, b, targetRgb) => {
    return colorDistance(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b);
};

// 2. HSV 相似度計算 (專用於綠幕，回傳相似度分數 0~1)
const isPixelBackgroundHSV = (r, g, b) => {
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
    
    // 色相範圍 (H: 60-180 為綠色)
    const isGreenHue = (hue >= 60 && hue <= 180);

    if (!isGreenHue) return 0;
    
    return saturation; 
};


// 3. 核心去背邏輯：實現邊緣柔化 (Feathering) - 仍保留給 'global' 模式使用
const removeBgFeathered = (imgData, targetHex, tolerancePercent, smoothnessPercent) => {
    const data = imgData.data;
    const len = data.length;
    
    const toleranceFactor = tolerancePercent / 100;
    const smoothnessFactor = smoothnessPercent / 100;

    const isGreenScreen = targetHex.toLowerCase() === '#00ff00';
    const targetRgb = isGreenScreen ? null : hexToRgb(targetHex) || {r:0, g:0, b:0};
    const maxDist = 442; 

    for (let i = 0; i < len; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        let similarity = 0; 
        
        if (isGreenScreen) {
            similarity = isPixelBackgroundHSV(r, g, b); 
        } else {
            const distance = isTargetColorRGB(r, g, b, targetRgb);
            similarity = 1 - (distance / maxDist);
        }

        const edgeStart = toleranceFactor;
        const edgeEnd = Math.max(0, edgeStart - smoothnessFactor); 
        
        if (similarity >= edgeStart) {
            data[i+3] = 0; 
        } else if (similarity > edgeEnd) {
            const range = edgeStart - edgeEnd;
            const diff = similarity - edgeEnd;
            let alpha = Math.round(255 * (1 - diff / range));
            data[i+3] = Math.max(0, Math.min(255, alpha)); 
        } else {
            data[i+3] = 255; 
        }
    }
    
    return imgData;
};

// 4. 連通去背 (Flood Fill) 邏輯 - HARD EDGE 模式（與舊版邏輯一致）
const removeBgFloodFill = (imgData, w, h, targetHex, tolerancePercent) => {
    const data = imgData.data;
    const isGreenScreen = targetHex.toLowerCase() === '#00ff00';
    const targetRgb = isGreenScreen ? null : hexToRgb(targetHex) || {r:0, g:0, b:0};
    const maxDist = 442;
    const toleranceDist = maxDist * (tolerancePercent / 100);

    const isBackground = (r, g, b) => {
        // 使用硬門檻判斷，不使用柔化邏輯
        if (isGreenScreen) {
            const similarity = isPixelBackgroundHSV(r, g, b);
            // 這裡的容許度控制的是 HSV 相似度
            return similarity >= (tolerancePercent / 100); 
        } else {
            const distance = colorDistance(r, g, b, targetRgb.r, targetRgb.g, targetRgb.b);
            // 這裡的容許度控制的是 RGB 距離
            return distance <= toleranceDist;
        }
    };
    
    // 從四個角落開始向內填充
    const stack = [[0,0], [w-1,0], [0,h-1], [w-1,h-1]];
    const visited = new Uint8Array(w*h);
    
    while(stack.length) {
        const [x, y] = stack.pop();
        const offset = y*w + x;

        if (x < 0 || x >= w || y < 0 || y >= h || visited[offset]) continue;
        visited[offset] = 1;

        const idx = offset * 4;
        
        if (isBackground(data[idx], data[idx+1], data[idx+2])) {
            data[idx+3] = 0; // 硬性設為完全透明
            
            // 向四個方向擴散 (連通性)
            stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
        }
    }
    return imgData;
};

// 5. 侵蝕濾鏡
const applyErosion = (imgData, w, h, strength) => {
    if (strength <= 0) return imgData;

    const data = imgData.data;
    
    for (let k = 0; k < strength; k++) {
        const currentAlpha = new Uint8Array(w * h);
        for(let i=0; i<w*h; i++) currentAlpha[i] = data[i*4+3];

        for (let y = 1; y < h-1; y++) {
            for (let x = 1; x < w-1; x++) {
                const idx = y*w + x;
                
                if (currentAlpha[idx] > 0) {
                    if (currentAlpha[idx-1] === 0 || currentAlpha[idx+1] === 0 || 
                        currentAlpha[idx-w] === 0 || currentAlpha[idx+w] === 0) {
                        data[idx*4+3] = 0; 
                    }
                }
            }
        }
    }
    return imgData;
};

// --- Web Worker Main Listener ---

self.onmessage = function(e) {
    const { id, rawImageData, removalMode, targetColorHex, colorTolerance, erodeStrength, smoothness, width, height } = e.data;
    
    let processedImageData = rawImageData; 
    
    // 如果選擇了 'flood' 模式 (連通去背)，我們現在使用硬邊判斷，這應該匹配您的舊版水準
    if (removalMode === 'flood') {
        processedImageData = removeBgFloodFill(processedImageData, width, height, targetColorHex, colorTolerance);
    } else {
        // 'global' 模式繼續使用柔化去背 (Feathering)
        processedImageData = removeBgFeathered(processedImageData, targetColorHex, colorTolerance, smoothness);
    }
    
    // 執行邊緣侵蝕
    processedImageData = applyErosion(processedImageData, width, height, erodeStrength);
    
    // 將結果傳回主執行緒 (Web Worker 加速的核心)
    self.postMessage({ id: id, processedImageData: processedImageData }, [processedImageData.data.buffer]);
};
