import { useState, useEffect, useRef } from 'react';

const useImageProcessing = (autoRemoveBg, targetColorHex, colorTolerance, smoothness, zoomLevel) => {
    const [slicedPieces, setSlicedPieces] = useState([]);
    const [finalImages, setFinalImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../worker.js', import.meta.url));
        workerRef.current.onmessage = (e) => {
            const { id, processedImageData } = e.data;

            const canvas = document.createElement('canvas');
            canvas.width = processedImageData.width;
            canvas.height = processedImageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(processedImageData, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');

            setFinalImages(prev => {
                const exists = prev.find(img => img.id === id);
                if (exists) return prev;
                return [...prev, { id, dataUrl, rawSource: null }].sort((a, b) => a.id - b.id);
            });
            setProcessedCount(prev => prev + 1);
        };
        return () => { workerRef.current.terminate(); }
    }, []);

    const performSlice = (originalSheet, setStep, cols = 4, rows = 3, cropPercent = 3) => {
        if (!originalSheet) return;
        setIsProcessing(true);
        setTimeout(() => {
            const pieces = [];
            const imgW = originalSheet.width;
            const imgH = originalSheet.height;
            const canvas = document.createElement('canvas');
            canvas.width = imgW;
            canvas.height = imgH;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(originalSheet, 0, 0);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // 用 Math.round 精確計算每格的起始與結束像素位置，避免浮點數累積誤差
                    const x1 = Math.round(c * imgW / cols);
                    const y1 = Math.round(r * imgH / rows);
                    const x2 = Math.round((c + 1) * imgW / cols);
                    const y2 = Math.round((r + 1) * imgH / rows);
                    const rawW = x2 - x1;
                    const rawH = y2 - y1;
                    // 內縮 cropPercent% 避免切到相鄰貼圖（表情貼為 0）
                    const insetX = Math.round(rawW * cropPercent / 100);
                    const insetY = Math.round(rawH * cropPercent / 100);
                    const pieceW = rawW - insetX * 2;
                    const pieceH = rawH - insetY * 2;
                    const pCanvas = document.createElement('canvas');
                    pCanvas.width = pieceW;
                    pCanvas.height = pieceH;
                    const pCtx = pCanvas.getContext('2d');
                    pCtx.drawImage(canvas, x1 + insetX, y1 + insetY, pieceW, pieceH, 0, 0, pieceW, pieceH);
                    pieces.push({
                        id: r * cols + c + 1,
                        rawCanvas: pCanvas,
                        previewUrl: pCanvas.toDataURL('image/png')
                    });
                }
            }
            setSlicedPieces(pieces);
            setStep(2);
            setIsProcessing(false);
        }, 50);
    };

    const performProcessing = async (setStep, setMainId, setTabId, productType = 'sticker') => {
        if (!autoRemoveBg) {
            setFinalImages(slicedPieces.map(piece => ({ id: piece.id, dataUrl: piece.previewUrl })));
            if (productType === 'sticker') {
                setMainId(1);
            }
            setTabId(1);
            setStep(3);
            return;
        }
        setIsProcessing(true);
        setProcessedCount(0);
        setFinalImages([]);

        // 表情貼使用 180x180（正方形），靜態貼圖使用 370x320
        const isEmoji = productType === 'emoji';
        const targetW = isEmoji ? 180 : 370;
        const targetH = isEmoji ? 180 : 320;
        const workW = targetW * 2;
        const workH = targetH * 2;
        slicedPieces.forEach(piece => {
            const workCanvas = document.createElement('canvas');
            workCanvas.width = workW;
            workCanvas.height = workH;
            const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
            // 先用目標背景色填滿整張畫布，確保 Flood Fill 能從角落正確啟動
            workCtx.fillStyle = targetColorHex;
            workCtx.fillRect(0, 0, workW, workH);
            const rawW = piece.rawCanvas.width;
            const rawH = piece.rawCanvas.height;
            const baseScale = Math.min(workW / rawW, workH / rawH);
            const finalScale = baseScale * zoomLevel;
            const drawW = rawW * finalScale;
            const drawH = rawH * finalScale;
            const dx = (workW - drawW) / 2;
            const dy = (workH - drawH) / 2;
            workCtx.drawImage(piece.rawCanvas, 0, 0, rawW, rawH, dx, dy, drawW, drawH);

            const imgData = workCtx.getImageData(0, 0, workW, workH);

            workerRef.current.postMessage({
                id: piece.id,
                rawImageData: imgData,
                removalMode: targetColorHex === '#00FF00' ? 'flood' : 'feather',
                targetColorHex: targetColorHex,
                colorTolerance: colorTolerance,
                erodeStrength: 0,
                smoothness: smoothness,
                width: workW,
                height: workH
            });
        });
    };

    return {
        slicedPieces,
        setSlicedPieces,
        finalImages,
        setFinalImages,
        isProcessing,
        setIsProcessing,
        processedCount,
        setProcessedCount,
        performSlice,
        performProcessing
    };
};

export default useImageProcessing;
