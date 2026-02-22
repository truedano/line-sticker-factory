import React, { useState, useEffect } from 'react';
import { version } from '../package.json';
import { PRODUCT_TYPES, PROMPT_THEMES, PROMPT_STYLES, GRID_MODES, EMOJI_GRID_MODES, EMOJI_PROMPT_THEMES } from './data';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import RemoveBgSection from './components/RemoveBgSection';
import DownloadSection from './components/DownloadSection';
import useImageProcessing from './hooks/useImageProcessing';
import useStickerPack from './hooks/useStickerPack';

const App = () => {
    const [productType, setProductType] = useState('sticker');
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

    // Derived config based on product type
    const isEmoji = productType === 'emoji';
    const productConfig = PRODUCT_TYPES[productType];
    const gridModes = isEmoji ? EMOJI_GRID_MODES : GRID_MODES;
    const promptThemes = isEmoji ? EMOJI_PROMPT_THEMES : PROMPT_THEMES;
    // 安全取得 gridConfig：如果當前 gridMode 在目前的 gridModes 中不存在，使用第一個可用模式
    const effectiveGridMode = gridModes[gridMode] ? gridMode : Object.keys(gridModes)[0];
    const gridConfig = gridModes[effectiveGridMode];

    const {
        slicedPieces, setSlicedPieces,
        finalImages, setFinalImages,
        isProcessing, setIsProcessing,
        processedCount,
        performSlice,
        performProcessing
    } = useImageProcessing(autoRemoveBg, targetColorHex, colorTolerance, smoothness, zoomLevel);

    const { downloadZip, getFileName } = useStickerPack(finalImages, mainId, tabId, startNumber, productType);

    useEffect(() => {
        applyPreset('green');
    }, []);

    // 切換產品類型時重設相關 state
    useEffect(() => {
        const availableModes = Object.keys(gridModes);
        if (!availableModes.includes(gridMode)) {
            setGridMode(availableModes[0]);
        }
        // 重設主題（因為表情貼/靜態貼圖的主題不同）
        setActiveTheme('daily');
        // 重設流程
        setOriginalSheet(null);
        setSlicedPieces([]);
        setFinalImages([]);
        setStep(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productType]);

    useEffect(() => {
        if (processedCount === gridConfig.total && isProcessing) {
            setIsProcessing(false);
            if (productConfig.hasMain) {
                setMainId(1);
            } else {
                setMainId(null);
            }
            setTabId(1);
            setStep(3);
        }
    }, [processedCount, isProcessing, setIsProcessing, gridConfig.total, productConfig.hasMain]);

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
        const total = gridConfig.total;
        // 嘗試找到匹配 total 的特殊 key
        const key = `${field}${total}`;
        if (theme[key]) return theme[key];
        // 對靜態貼圖回退到預設（12 張）的情況
        if (!isEmoji && total !== 12) return theme[field];
        return theme[field];
    };

    const getPromptText = () => {
        const theme = promptThemes[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        const totalCount = gridConfig.total;
        const layoutLabel = `${gridConfig.cols} × ${gridConfig.rows}`;
        const sizeLabel = `${gridConfig.width} × ${gridConfig.height} px`;

        if (isEmoji) {
            const finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions');
            const finalActions = getThemeField(theme, 'actions');
            const cellW = Math.round(gridConfig.width / gridConfig.cols);
            const cellH = Math.round(gridConfig.height / gridConfig.rows);

            return `✅ ${totalCount} 格角色表情貼集｜AI Prompt 建議

⚠️ 圖片解析度（最重要，務必遵守）
• 輸出圖片的精確像素尺寸必須為：寬 ${gridConfig.width} px × 高 ${gridConfig.height} px。
• 每格固定 ${cellW} × ${cellH} px，共 ${gridConfig.cols} 欄 × ${gridConfig.rows} 列 = ${totalCount} 格。
• 請在 AI 生圖工具中將解析度/畫布大小設定為 ${gridConfig.width}×${gridConfig.height}，不可使用其他尺寸。

請參考上傳圖片中的角色特徵，生成一張 ${gridConfig.width}×${gridConfig.height} px 的表情貼大圖，包含 ${totalCount} 個不同表情（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。
• 構圖邏輯：表情貼「不含文字」，純粹以角色的表情和動作傳達情緒。
• 風格關鍵字：${style.desc}
• 去背優化：角色需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。

畫面佈局（${gridConfig.width} × ${gridConfig.height} px）
• 整體畫布：${gridConfig.width} × ${gridConfig.height} px（不可偏差）。
• 佈局：${gridConfig.cols} 欄 × ${gridConfig.rows} 列，每格 ${cellW}×${cellH} px，共 ${totalCount} 格。
• 所有 ${totalCount} 個格子必須排列整齊，呈現嚴格的均等網格，格子之間不可有間隙、分隔線或邊框。
• 每格內的角色必須「畫滿整格」：角色（含白色外框）應佔據單格面積的 85% 以上。
• 嚴禁在格子內留下大面積空白綠色背景。
• 視角：以臉部大特寫和上半身為主，確保縮小到極小時仍能清楚辨識表情。

表情貼設計原則
• 設計簡潔、輪廓清晰：避免太過複雜的細節、漸層或極小的文字，使用較粗的線條描繪輪廓。
• 單獨傳送會放大：讓放大後的畫質維持良好，避免出現鋸齒。
• 深色背景兼容：確保圖案邊緣或配色在淺色與深色背景下都容易辨識。

表情與動作設計
• 情緒清單：${finalEmotions}
• 建議動作：${finalActions}
• ${totalCount} 格皆須為不同表情與動作，展現角色張力。`;
        }

        // 原始靜態貼圖 Prompt
        const finalTexts = activeTheme === 'custom' ? customTexts : getThemeField(theme, 'texts');
        const finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions');
        const finalActions = getThemeField(theme, 'actions');

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
• 配色：每張貼圖的文字顏色必須各不相同，從以下色系中輪流選用：紅色、橘色、黃色、藍色、紫色、粉紅色、白色、深藍色、棕色、酒紅色。絕對禁止使用綠色系與黑色。確保整套貼圖的文字色彩豐富多元、不重複。
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
            <Header step={step} version={version} productType={productType} setProductType={setProductType} />

            <UploadSection
                step={step}
                originalSheet={originalSheet}
                handleUpload={handleUpload}
                isProcessing={isProcessing}
                performSlice={() => performSlice(originalSheet, setStep, gridConfig.cols, gridConfig.rows, isEmoji ? 0 : 3)}
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
                promptThemes={promptThemes}
                PROMPT_STYLES={PROMPT_STYLES}
                gridMode={gridMode}
                setGridMode={setGridMode}
                gridConfig={gridConfig}
                gridModes={gridModes}
                productType={productType}
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
                performProcessing={() => performProcessing(setStep, setMainId, setTabId, productType)}
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
                productType={productType}
                productConfig={productConfig}
            />
        </div>
    );
};

export default App;
