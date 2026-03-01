import bg48Src from '../assets/bg_48.png';
import bg96Src from '../assets/bg_96.png';

const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

/**
 * Calculate alpha map from an ImageData block
 */
function calculateAlphaMap(imageData) {
    const { width, height, data } = imageData;
    const alphaMap = new Float32Array(width * height);

    for (let i = 0; i < alphaMap.length; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const maxChannel = Math.max(r, g, b);
        alphaMap[i] = maxChannel / 255.0;
    }

    return alphaMap;
}

/**
 * Load an image source and convert to an alpha map
 */
function loadAlphaMap(src, size) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, size, size);
            resolve(calculateAlphaMap(imageData));
        };
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Remove watermark using reverse alpha blending
 */
function applyReverseAlphaBlending(imageData, alphaMap, position) {
    const { x, y, width, height } = position;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
            const alphaIdx = row * width + col;
            let alpha = alphaMap[alphaIdx];

            if (alpha < ALPHA_THRESHOLD) continue;
            alpha = Math.min(alpha, MAX_ALPHA);
            const oneMinusAlpha = 1.0 - alpha;

            for (let c = 0; c < 3; c++) {
                const watermarked = imageData.data[imgIdx + c];
                const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
                imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
            }
        }
    }
}

// Global cache for alpha maps
let alphaMapCache = {
    48: null,
    96: null
};

export async function removeGeminiWatermark(imageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width || imageElement.naturalWidth;
    canvas.height = imageElement.height || imageElement.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imageElement, 0, 0);

    // Config properties determining the layout based on gemini's standard sizes
    let logoSize, marginRight, marginBottom;
    if (canvas.width > 1024 && canvas.height > 1024) {
        logoSize = 96;
        marginRight = 64;
        marginBottom = 64;
    } else {
        logoSize = 48;
        marginRight = 32;
        marginBottom = 32;
    }

    // Load alpha map if needed
    if (!alphaMapCache[logoSize]) {
        alphaMapCache[logoSize] = await loadAlphaMap(logoSize === 48 ? bg48Src : bg96Src, logoSize);
    }
    const alphaMap = alphaMapCache[logoSize];

    const position = {
        x: canvas.width - marginRight - logoSize,
        y: canvas.height - marginBottom - logoSize,
        width: logoSize,
        height: logoSize
    };

    // Before proceeding, do a quick sanity check to see if we should actually remove it.
    // However, since this is a user-initiated option, we can proceed forcefully.
    // Extract Image Data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyReverseAlphaBlending(imageData, alphaMap, position);
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
        const resultImg = new Image();
        resultImg.onload = () => resolve(resultImg);
        resultImg.src = canvas.toDataURL('image/png');
    });
}
