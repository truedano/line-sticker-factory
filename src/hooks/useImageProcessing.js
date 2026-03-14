import { useState, useEffect, useRef } from 'react';
import { calculateSliceDimensions } from '../utils/imageUtils';

const useImageProcessing = (autoRemoveBg, targetColorHex, colorTolerance, smoothness, zoomLevel) => {
    const [slicedPieces, setSlicedPieces] = useState([]);
    const [finalImages, setFinalImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../worker.js', import.meta.url), {
            type: 'module'
        });
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

    const performSlice = (originalSheet1, originalSheet2, setStep, gridConfig, cropPercent = 3) => {
        if (!gridConfig.isDoubleSheet && !originalSheet1) return;
        if (gridConfig.isDoubleSheet && (!originalSheet1 || !originalSheet2)) return;

        setIsProcessing(true);
        setTimeout(() => {
            const pieces = [];
            let currentId = 1;
            const sheets = gridConfig.isDoubleSheet ? [originalSheet1, originalSheet2] : [originalSheet1];

            sheets.forEach((sheet, sheetIndex) => {
                if (!sheet) return;
                const imgW = sheet.width;
                const imgH = sheet.height;
                const canvas = document.createElement('canvas');
                canvas.width = imgW;
                canvas.height = imgH;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(sheet, 0, 0);

                let cols = gridConfig.cols;
                let rows = gridConfig.rows;

                // Support specialized different grid sizes like 6x4 + 4x4
                if (gridConfig.grids && gridConfig.grids[sheetIndex]) {
                    cols = gridConfig.grids[sheetIndex].cols;
                    rows = gridConfig.grids[sheetIndex].rows;
                }

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const {
                            sourceX,
                            sourceY,
                            sourceWidth,
                            sourceHeight,
                            canvasWidth,
                            canvasHeight
                        } = calculateSliceDimensions(imgW, imgH, cols, rows, c, r, cropPercent);

                        const pCanvas = document.createElement('canvas');
                        pCanvas.width = canvasWidth;
                        pCanvas.height = canvasHeight;
                        const pCtx = pCanvas.getContext('2d');
                        pCtx.drawImage(
                            canvas,
                            sourceX, sourceY, sourceWidth, sourceHeight,
                            0, 0, canvasWidth, canvasHeight
                        );
                        pieces.push({
                            id: currentId++,
                            rawCanvas: pCanvas,
                            previewUrl: pCanvas.toDataURL('image/png')
                        });
                    }
                }
            });
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
