import React, { useState, useEffect } from 'react';
import { version } from '../package.json';
import { PROMPT_THEMES, PROMPT_STYLES, GRID_MODES } from './data';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import RemoveBgSection from './components/RemoveBgSection';
import DownloadSection from './components/DownloadSection';
import useImageProcessing from './hooks/useImageProcessing';
import useStickerPack from './hooks/useStickerPack';

const App = () => {
    const [originalSheet, setOriginalSheet] = useState(null);
    const [mainId, setMainId] = useState(null);
    const [tabId, setTabId] = useState(null);
    const [startNumber, setStartNumber] = useState(1);
    const [step, setStep] = useState(1);
    const [gridMode, setGridMode] = useState('4x3');
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    // Settings State
    const [activeTheme, setActiveTheme] = useState('daily');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [autoRemoveBg, setAutoRemoveBg] = useState(true);
    const [targetColorHex, setTargetColorHex] = useState("#00FF00");
    const [colorTolerance, setColorTolerance] = useState(30);
    const [smoothness, setSmoothness] = useState(2);
    const [despill, setDespill] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1.00);
    const [customTexts, setCustomTexts] = useState('您的自訂文字（例如：加油、想睡覺、嘿嘿、你好棒）');
    const [customEmotions, setCustomEmotions] = useState('描述表情風格（例如：浮誇的大笑、無奈的苦笑、充滿星星的眼神）');

    // Custom Hooks
    const gridConfig = GRID_MODES[gridMode];

    const {
        slicedPieces, setSlicedPieces,
        finalImages, setFinalImages,
        isProcessing, setIsProcessing,
        processedCount,
        performSlice,
        performProcessing
    } = useImageProcessing(autoRemoveBg, targetColorHex, colorTolerance, smoothness, zoomLevel);

    const { downloadZip, getFileName } = useStickerPack(finalImages, mainId, tabId, startNumber);

    useEffect(() => {
        applyPreset('green');
    }, []);

    useEffect(() => {
        if (processedCount === gridConfig.total && isProcessing) {
            setIsProcessing(false);
            setMainId(1);
            setTabId(1);
            setStep(3);
        }
    }, [processedCount, isProcessing, setIsProcessing, gridConfig.total]);

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

    const getThemeField = (theme, field) => {
        const key32 = `${field}32`;
        const key24 = `${field}24`;
        if (gridMode === '8x4' && theme[key32]) return theme[key32];
        if ((gridMode === '6x4' || gridMode === '8x4') && theme[key24]) return theme[key24];
        return theme[field];
    };

    const getPromptText = () => {
        const theme = PROMPT_THEMES[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        const finalTexts = activeTheme === 'custom' ? customTexts : getThemeField(theme, 'texts');
        const finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions');
        const finalActions = getThemeField(theme, 'actions');
        const totalCount = gridConfig.total;
        const layoutLabel = `${gridConfig.cols} × ${gridConfig.rows}`;
        const sizeLabel = `${gridConfig.width} × ${gridConfig.height} px`;

        return `✅ ${totalCount} 格角色貼圖集｜AI Prompt 建議

請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 ${totalCount} 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。
• 構圖邏輯：畫面僅包含「角色 + 文字」，不包含任何複雜背景。
• 風格關鍵字：${style.desc}
• 去背優化：角色與文字需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。

畫面佈局與尺寸規格
• 整體為 ${layoutLabel} 佈局，共 ${totalCount} 張貼圖。總尺寸：${sizeLabel}。
• 每張貼圖四周預留適度 Padding，避免畫面互相黏住。
• 視角：全身 + 半身混合，包含正面、側面、俯角等。

文字設計細節
• 語言：台灣繁體中文
• 內容：${finalTexts}
• 配色：使用高對比鮮豔色彩。絕對禁止使用綠色系與黑色。
• 排版：大小約佔 1/3，可壓在衣服邊角，不可遮臉。

表情與動作設計
• 情緒清單：${finalEmotions}
• 建議動作：${finalActions}
• ${totalCount} 格皆須為不同動作與表情，展現角色張力。`;
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(getPromptText()).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
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
                performSlice={() => performSlice(originalSheet, setStep, gridConfig.cols, gridConfig.rows)}
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
                gridMode={gridMode}
                setGridMode={setGridMode}
                gridConfig={gridConfig}
                GRID_MODES={GRID_MODES}
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
                performProcessing={() => performProcessing(setStep, setMainId, setTabId)}
                isProcessing={isProcessing}
                processedCount={processedCount}
                setStep={setStep}
                gridConfig={gridConfig}
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
