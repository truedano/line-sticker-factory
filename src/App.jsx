import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Loader, Copy
} from 'lucide-react';
import { version } from '../package.json';
import { PROMPT_THEMES, PROMPT_STYLES } from './data';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import RemoveBgSection from './components/RemoveBgSection';
import DownloadSection from './components/DownloadSection';



const App = () => {
    const [originalSheet, setOriginalSheet] = useState(null);
    const [slicedPieces, setSlicedPieces] = useState([]);
    const [finalImages, setFinalImages] = useState([]);
    const [mainId, setMainId] = useState(null);
    const [tabId, setTabId] = useState(null);
    const [startNumber, setStartNumber] = useState(1);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [activeTheme, setActiveTheme] = useState('daily');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [autoRemoveBg, setAutoRemoveBg] = useState(true);
    const [targetColorHex, setTargetColorHex] = useState("#00ff00");
    const [colorTolerance, setColorTolerance] = useState(30);
    const [smoothness, setSmoothness] = useState(2);
    const [despill, setDespill] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1.00);
    const [customTexts, setCustomTexts] = useState('您的自訂文字（例如：加油、想睡覺、嘿嘿、你好棒）');
    const [customEmotions, setCustomEmotions] = useState('描述表情風格（例如：浮誇的大笑、無奈的苦笑、充滿星星的眼神）');
    const workerRef = useRef(null);

    useEffect(() => {
        // In Vite, assets in public folder are served at root path
        workerRef.current = new Worker('./worker.js');
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

    useEffect(() => {
        if (processedCount === 12 && isProcessing) {
            setIsProcessing(false);
            setMainId(1);
            setTabId(1);
            setStep(3);
        }
    }, [processedCount, isProcessing]);

    useEffect(() => {
        applyPreset('green');
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                setOriginalSheet(img);
                setSlicedPieces([]);
                setFinalImages([]);
                setStep(1);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const getPromptText = () => {
        const theme = PROMPT_THEMES[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        const finalTexts = activeTheme === 'custom' ? customTexts : theme.texts;
        const finalEmotions = activeTheme === 'custom' ? customEmotions : theme.emotions;

        return `✅ 12 格角色貼圖集｜AI Prompt 建議

請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 12 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。
• 構圖邏輯：畫面僅包含「角色 + 文字」，不包含任何複雜背景。
• 風格關鍵字：${style.desc}
• 去背優化：角色與文字需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。

畫面佈局與尺寸規格
• 整體為 4 × 3 佈局，共 12 張貼圖。總尺寸：1480 × 960 px。
• 每張貼圖四周預留適度 Padding，避免畫面互相黏住。
• 視角：全身 + 半身混合，包含正面、側面、俯角等。

文字設計細節
• 語言：台灣繁體中文
• 內容：${finalTexts}
• 配色：使用高對比鮮豔色彩。絕對禁止使用綠色系與黑色。
• 排版：大小約佔 1/3，可壓在衣服邊角，不可遮臉。

表情與動作設計
• 情緒清單：${finalEmotions}
• 建議動作：${theme.actions}
• 12 格皆須為不同動作與表情，展現角色張力。`;
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(getPromptText()).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const performSlice = () => {
        if (!originalSheet) return;
        setIsProcessing(true);
        setTimeout(() => {
            const pieces = [];
            const cols = 4;
            const rows = 3;
            const pieceW = originalSheet.width / cols;
            const pieceH = originalSheet.height / rows;
            const canvas = document.createElement('canvas');
            canvas.width = originalSheet.width;
            canvas.height = originalSheet.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(originalSheet, 0, 0);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const pCanvas = document.createElement('canvas');
                    pCanvas.width = pieceW;
                    pCanvas.height = pieceH;
                    const pCtx = pCanvas.getContext('2d');
                    pCtx.drawImage(canvas, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
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

    const performProcessing = async () => {
        if (!autoRemoveBg) {
            setFinalImages(slicedPieces.map(piece => ({ id: piece.id, dataUrl: piece.previewUrl })));
            setMainId(1);
            setTabId(1);
            setStep(3);
            return;
        }
        setIsProcessing(true);
        setProcessedCount(0);
        setFinalImages([]);
        const targetW = 370;
        const targetH = 320;
        const workW = targetW * 2;
        const workH = targetH * 2;
        slicedPieces.forEach(piece => {
            const workCanvas = document.createElement('canvas');
            workCanvas.width = workW;
            workCanvas.height = workH;
            const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
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

    const resizeImageFromUrl = (dataUrl, width, height) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const scale = Math.min(width / img.width, height / img.height);
                const newW = img.width * scale;
                const newH = img.height * scale;
                ctx.drawImage(img, 0, 0, img.width, img.height, (width - newW) / 2, (height - newH) / 2, newW, newH);
                resolve(canvas.toDataURL('image/png').split(',')[1]);
            };
            img.src = dataUrl;
        });
    };

    const getFileName = (index) => (startNumber + index).toString().padStart(2, '0');

    const downloadZip = async () => {
        const zip = new JSZip();
        await Promise.all(finalImages.map(async (img, idx) => {
            const b64 = await resizeImageFromUrl(img.dataUrl, 370, 320);
            zip.file(`${getFileName(idx)}.png`, b64, { base64: true });
        }));
        if (mainId) {
            const mainImg = finalImages.find(img => img.id === mainId);
            if (mainImg) zip.file("main.png", await resizeImageFromUrl(mainImg.dataUrl, 240, 240), { base64: true });
        }
        if (tabId) {
            const tabImg = finalImages.find(img => img.id === tabId);
            if (tabImg) zip.file("tab.png", await resizeImageFromUrl(tabImg.dataUrl, 96, 74), { base64: true });
        }
        zip.generateAsync({ type: "blob" }).then(c => saveAs(c, "line_stickers_pack.zip"));
    };

    const applyPreset = (type) => {
        if (type === 'green') {
            setTargetColorHex("#00FF00");
            setColorTolerance(30);
            setSmoothness(2);
            setDespill(true);
            setZoomLevel(1.00);
        } else if (type === 'black') {
            setTargetColorHex("#000000");
            setColorTolerance(15);
            setSmoothness(1);
            setDespill(false);
            setZoomLevel(1.00);
        }
    };



    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto pb-32">
            <Header step={step} version={version} />

            <UploadSection
                step={step}
                originalSheet={originalSheet}
                handleUpload={handleUpload}
                isProcessing={isProcessing}
                performSlice={performSlice}
                showPromptGuide={showPromptGuide}
                setShowPromptGuide={setShowPromptGuide}
                activeTheme={activeTheme}
                setActiveTheme={setActiveTheme}
                activeStyle={activeStyle}
                setActiveStyle={setActiveStyle}
                customTexts={customTexts}
                setCustomTexts={setCustomTexts}
                customEmotions={customEmotions}
                setCustomEmotions={setCustomEmotions}
                handleCopyPrompt={handleCopyPrompt}
                copySuccess={copySuccess}
                PROMPT_THEMES={PROMPT_THEMES}
                PROMPT_STYLES={PROMPT_STYLES}
            />

            <RemoveBgSection
                step={step}
                slicedPieces={slicedPieces}
                autoRemoveBg={autoRemoveBg}
                setAutoRemoveBg={setAutoRemoveBg}
                targetColorHex={targetColorHex}
                applyPreset={applyPreset}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                colorTolerance={colorTolerance}
                setColorTolerance={setColorTolerance}
                despill={despill}
                setDespill={setDespill}
                performProcessing={performProcessing}
                isProcessing={isProcessing}
                processedCount={processedCount}
                setStep={setStep}
            />

            <DownloadSection
                step={step}
                finalImages={finalImages}
                mainId={mainId}
                setMainId={setMainId}
                tabId={tabId}
                setTabId={setTabId}
                startNumber={startNumber}
                setStartNumber={setStartNumber}
                downloadZip={downloadZip}
                getFileName={getFileName}
                setStep={setStep}
            />
        </div>
    );
};

export default App;
