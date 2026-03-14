export const calculateSliceDimensions = (imgW, imgH, cols, rows, c, r, cropPercent = 3) => {
    // 取得當前格子的邊界
    const x1 = Math.round(c * imgW / cols);
    const y1 = Math.round(r * imgH / rows);
    const x2 = Math.round((c + 1) * imgW / cols);
    const y2 = Math.round((r + 1) * imgH / rows);
    
    // 計算該格原始的寬高
    const rawW = x2 - x1;
    const rawH = y2 - y1;
    
    // 計算內縮的大小 (基於 cropPercent)
    const insetX = Math.round(rawW * cropPercent / 100);
    const insetY = Math.round(rawH * cropPercent / 100);
    
    // 計算最終 Canvas 取得的內容尺寸
    const pieceW = rawW - insetX * 2;
    const pieceH = rawH - insetY * 2;
    
    return {
        sourceX: x1 + insetX,
        sourceY: y1 + insetY,
        sourceWidth: pieceW,
        sourceHeight: pieceH,
        canvasWidth: pieceW,
        canvasHeight: pieceH
    };
};
