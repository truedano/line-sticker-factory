import React, { useState, useEffect } from 'react';
import { version } from '../package.json';
import { PRODUCT_TYPES, PROMPT_THEMES, PROMPT_STYLES, GRID_MODES, EMOJI_GRID_MODES, EMOJI_PROMPT_THEMES } from './data';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import RemoveBgSection from './components/RemoveBgSection';
import DownloadSection from './components/DownloadSection';
import ThemeBuilder from './components/ThemeBuilder';
import useImageProcessing from './hooks/useImageProcessing';
import useStickerPack from './hooks/useStickerPack';
import { removeGeminiWatermark } from './utils/removeGeminiWatermark';

const App = () => {
    // Load settings from localStorage using a function to avoid re-reading on every render
    const [settings] = useState(() => JSON.parse(localStorage.getItem('lsf_settings') || '{}'));

    const [productType, setProductType] = useState(settings.productType || 'sticker');
    const [originalSheet1, setOriginalSheet1] = useState(null);
    const [originalSheet2, setOriginalSheet2] = useState(null);
    const [mainId, setMainId] = useState(null);
    const [tabId, setTabId] = useState(null);
    const [startNumber, setStartNumber] = useState(1);
    const [step, setStep] = useState(1);
    const [gridMode, setGridMode] = useState(settings.gridMode || '4x3');
    const [showPromptGuide, setShowPromptGuide] = useState(settings.showPromptGuide ?? true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [autoWorkflowMode, setAutoWorkflowMode] = useState(false);

    // Settings State
    const [activeTheme, setActiveTheme] = useState(settings.activeTheme || 'daily');
    const [activeStyle, setActiveStyle] = useState(settings.activeStyle || 'qversion');
    const [isEmojiTextEnabled, setIsEmojiTextEnabled] = useState(settings.isEmojiTextEnabled ?? false);
    const [autoRemoveGeminiWatermark, setAutoRemoveGeminiWatermark] = useState(settings.autoRemoveGeminiWatermark ?? true);
    const [autoRemoveBg, setAutoRemoveBg] = useState(settings.autoRemoveBg ?? true);
    const [targetColorHex, setTargetColorHex] = useState(settings.targetColorHex || "#00FF00");
    const [colorTolerance, setColorTolerance] = useState(settings.colorTolerance ?? 30);
    const [smoothness, setSmoothness] = useState(settings.smoothness ?? 2);
    const [despill, setDespill] = useState(settings.despill ?? true);
    const [zoomLevel, setZoomLevel] = useState(settings.zoomLevel ?? 1.00);
    const [customTexts, setCustomTexts] = useState(settings.customTexts || '您的自訂文字（例如：加油、想睡覺、嘿嘿、你好棒）');
    const [customEmotions, setCustomEmotions] = useState(settings.customEmotions || '描述表情風格（例如：浮誇的大笑、無奈的苦笑、充滿星星的眼神）');
    const [customActions, setCustomActions] = useState(settings.customActions || '描述角色動作（例如：雙手比讚、開心地揮手、拿著大聲公、比出手指愛心）');

    // Save settings to localStorage whenever they change
    useEffect(() => {
        const newSettings = {
            productType,
            gridMode,
            showPromptGuide,
            activeTheme,
            activeStyle,
            isEmojiTextEnabled,
            autoRemoveGeminiWatermark,
            autoRemoveBg,
            targetColorHex,
            colorTolerance,
            smoothness,
            despill,
            zoomLevel,
            customTexts,
            customEmotions,
            customActions
        };
        localStorage.setItem('lsf_settings', JSON.stringify(newSettings));
    }, [
        productType, gridMode, showPromptGuide, activeTheme, activeStyle,
        isEmojiTextEnabled, autoRemoveGeminiWatermark, autoRemoveBg,
        targetColorHex, colorTolerance, smoothness, despill, zoomLevel,
        customTexts, customEmotions, customActions
    ]);

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
        // Only apply default preset if no settings were saved
        if (Object.keys(settings).length === 0) {
            applyPreset('green');
        }
    }, [settings]);

    const prevProductTypeRef = React.useRef(productType);

    // 切換產品類型時重設相關 state
    useEffect(() => {
        // 如果產品類型沒變（例如初始掛載時），不要執行重設
        if (prevProductTypeRef.current === productType) {
            return;
        }

        const availableModes = Object.keys(gridModes);
        if (!availableModes.includes(gridMode)) {
            setGridMode(availableModes[0]);
        }

        // 重設為該類型的預設主題
        setActiveTheme('daily');

        // 重設流程狀態
        setOriginalSheet1(null);
        setOriginalSheet2(null);
        setSlicedPieces([]);
        setFinalImages([]);
        setStep(1);

        // 更新前一次的產品類型記錄
        prevProductTypeRef.current = productType;
    }, [productType, gridModes, gridMode, setGridMode, setOriginalSheet1, setOriginalSheet2, setSlicedPieces, setFinalImages, setStep]);

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

    // 自動處理流程 Step 2: 圖片分割完成後，自動觸發去背
    useEffect(() => {
        if (autoWorkflowMode && step === 2 && slicedPieces.length > 0 && !isProcessing) {
            performProcessing(setStep, setMainId, setTabId, productType);
        }
    }, [autoWorkflowMode, step, slicedPieces.length, isProcessing, performProcessing, setStep, setMainId, setTabId, productType]);

    // 自動處理流程 Step 3: 去背完成並進入預覽後，自動觸發打包下載
    useEffect(() => {
        if (autoWorkflowMode && step === 3 && !isProcessing && finalImages.length === gridConfig.total) {
            const timer = setTimeout(() => {
                downloadZip();
                setAutoWorkflowMode(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [autoWorkflowMode, step, isProcessing, finalImages.length, gridConfig.total, downloadZip]);

    const handleAutoWorkflow = () => {
        setAutoWorkflowMode(true);
        performSlice(originalSheet1, originalSheet2, setStep, gridConfig, isEmoji ? 0 : 3);
    };

    const handleUpload = (e, sheetIndex = 1) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = async () => {
                let finalImg = img;
                if (autoRemoveGeminiWatermark) {
                    setIsProcessing(true);
                    try {
                        finalImg = await removeGeminiWatermark(img);
                    } catch (err) {
                        console.error('Error removing watermark:', err);
                    }
                    setIsProcessing(false);
                }
                if (sheetIndex === 2) {
                    setOriginalSheet2(finalImg);
                } else {
                    setOriginalSheet1(finalImg);
                }
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

    const getPromptText = (tabIndex = 0) => {
        const theme = promptThemes[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        const getSheetCount = (index) => {
            if (gridConfig.grids && gridConfig.grids[index]) {
                return gridConfig.grids[index].cols * gridConfig.grids[index].rows;
            }
            if (!gridConfig.isDoubleSheet) return gridConfig.total;
            return gridConfig.cols * gridConfig.rows;
        };

        const sheetTotalCount = getSheetCount(tabIndex);
        const currentGrid = gridConfig.grids ? gridConfig.grids[tabIndex] : gridConfig;
        const layoutLabel = `${currentGrid.cols} × ${currentGrid.rows}`;
        const sizeLabel = `${currentGrid.width} × ${currentGrid.height} px`;

        const splitAndGet = (str, index) => {
            if (!str) return '';
            const parts = str.split(/[,、]+/).map(s => s.trim()).filter(Boolean);
            if (!gridConfig.isDoubleSheet) return parts.join('、');

            if (gridConfig.grids) {
                const count1 = gridConfig.grids[0].cols * gridConfig.grids[0].rows;
                const count2 = gridConfig.grids[1].cols * gridConfig.grids[1].rows;
                if (index === 0) return parts.slice(0, count1).join('、');
                return parts.slice(count1, count1 + count2).join('、');
            } else {
                const half = gridConfig.cols * gridConfig.rows;
                if (index === 0) return parts.slice(0, half).join('、');
                return parts.slice(half, half * 2).join('、');
            }
        };

        if (isEmoji) {
            let finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions');
            let finalActions = activeTheme === 'custom' ? customActions : getThemeField(theme, 'actions');

            finalEmotions = splitAndGet(finalEmotions, tabIndex);
            finalActions = splitAndGet(finalActions, tabIndex);

            const cellW = Math.round(currentGrid.width / currentGrid.cols);
            const cellH = Math.round(currentGrid.height / currentGrid.rows);

            let titlePrefix = gridConfig.isDoubleSheet ? `✅ (第 ${tabIndex + 1} 組)` : '✅';

            return `${titlePrefix} ${sheetTotalCount} 格角色表情貼集｜AI Prompt 建議

⚠️ 圖片解析度（最重要，務必遵守）
• 輸出圖片的精確像素尺寸必須為：寬 ${currentGrid.width} px × 高 ${currentGrid.height} px。
• 每格固定 ${cellW} × ${cellH} px，共 ${currentGrid.cols} 欄 × ${currentGrid.rows} 列 = ${sheetTotalCount} 格。
• 請在 AI 生圖工具中將解析度/畫布大小設定為 ${currentGrid.width}×${currentGrid.height}，不可使用其他尺寸。

請參考上傳圖片中的角色特徵，生成一張 ${currentGrid.width}×${currentGrid.height} px 的表情貼大圖，包含 ${sheetTotalCount} 個不同表情（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色。
• 構圖邏輯：${isEmojiTextEnabled ? '以角色的表情和動作傳達情緒，可搭配「簡單少量的文字」（如：OK、讚、哈等短語）。' : '表情貼「不含文字」，純粹以角色的表情和動作傳達情緒。'}
${isEmojiTextEnabled ? '• 文字配色：每格的文字顏色必須各不相同，從以下色系中輪流選用：紅色、橘色、黃色、藍色、紫色、粉紅色、白色、深藍色、棕色、酒紅色。絕對禁止使用綠色系與黑色。確保整套表情貼的文字色彩豐富多元、不重複。\n' : ''}• 風格關鍵字：${style.desc}
• 去背優化：角色需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。
• 🚫 審核防護重點（重要）：不可出現彩虹色、漸層色、或任何宗教符號與違規旗幟。建議在生圖工具加入負向提示詞：rainbow, holographic, iridescent, multicolored gradients, LGBT, pride flag, religious symbols, nudity, gore.

畫面佈局（${currentGrid.width} × ${currentGrid.height} px）
• 整體畫布：${currentGrid.width} × ${currentGrid.height} px（不可偏差）。
• 佈局：${currentGrid.cols} 欄 × ${currentGrid.rows} 列，每格 ${cellW}×${cellH} px，共 ${sheetTotalCount} 格。
• 所有 ${sheetTotalCount} 個格子必須排列整齊，呈現嚴格的均等網格。絕對禁止畫出任何實體的網格線、分隔線、邊框或底框，背景必須是一整片純粹連續的綠色。
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
• ${sheetTotalCount} 格皆須為不同表情與動作，展現角色張力。`;
        }

        // 原始靜態貼圖 Prompt
        let finalTexts = activeTheme === 'custom' ? customTexts : getThemeField(theme, 'texts');
        let finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions');
        let finalActions = activeTheme === 'custom' ? customActions : getThemeField(theme, 'actions');

        finalTexts = splitAndGet(finalTexts, tabIndex);
        finalEmotions = splitAndGet(finalEmotions, tabIndex);
        finalActions = splitAndGet(finalActions, tabIndex);

        let titlePrefix = gridConfig.isDoubleSheet ? `✅ (第 ${tabIndex + 1} 組)` : '✅';

        return `${titlePrefix} ${sheetTotalCount} 格角色貼圖集｜AI Prompt 建議

請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 ${sheetTotalCount} 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色。
• 構圖邏輯：畫面僅包含「角色 + 文字」，不包含任何複雜背景。
• 風格關鍵字：${style.desc}
• 去背優化：角色與文字需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。
• 🚫 審核防護重點（重要）：不可出現彩虹色、漸層色、或任何宗教符號與違規旗幟。建議在生圖工具加入負向提示詞：rainbow, holographic, iridescent, multicolored gradients, LGBT, pride flag, religious symbols, nudity, gore.

畫面佈局與尺寸規格
• 整體為 ${layoutLabel} 佈局，共 ${sheetTotalCount} 張貼圖。總尺寸：${sizeLabel}。
• 所有 ${sheetTotalCount} 個貼圖必須排列整齊，呈現嚴格的均等網格。絕對禁止畫出任何實體的網格線、分隔線、邊框或底框，背景必須是一整片純粹連續的綠色。
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
• ${sheetTotalCount} 格皆須為不同動作與表情，展現角色張力。`;
    };

    const handleCopyPrompt = (tabIndex = 0) => {
        navigator.clipboard.writeText(getPromptText(tabIndex)).then(() => {
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

            {productType === 'theme' ? (
                <ThemeBuilder
                    productType={productType}
                    autoRemoveGeminiWatermark={autoRemoveGeminiWatermark}
                    setAutoRemoveGeminiWatermark={setAutoRemoveGeminiWatermark}
                    setIsGlobalProcessing={setIsProcessing}
                />
            ) : (
                <>
                    <UploadSection
                        step={step}
                        originalSheet1={originalSheet1}
                        originalSheet2={originalSheet2}
                        handleUpload={handleUpload}
                        isProcessing={isProcessing}
                        performSlice={() => performSlice(originalSheet1, originalSheet2, setStep, gridConfig, isEmoji ? 0 : 3)}
                        showPromptGuide={showPromptGuide}
                        setShowPromptGuide={setShowPromptGuide}
                        activeTheme={activeTheme}
                        setActiveTheme={setActiveTheme}
                        activeStyle={activeStyle}
                        setActiveStyle={setActiveStyle}
                        isEmojiTextEnabled={isEmojiTextEnabled}
                        setIsEmojiTextEnabled={setIsEmojiTextEnabled}
                        customTexts={customTexts}
                        setCustomTexts={setCustomTexts}
                        customEmotions={customEmotions}
                        setCustomEmotions={setCustomEmotions}
                        customActions={customActions}
                        setCustomActions={setCustomActions}
                        handleCopyPrompt={handleCopyPrompt}
                        copySuccess={copySuccess}
                        promptThemes={promptThemes}
                        PROMPT_STYLES={PROMPT_STYLES}
                        gridMode={gridMode}
                        setGridMode={setGridMode}
                        gridConfig={gridConfig}
                        gridModes={gridModes}
                        productType={productType}
                        autoRemoveGeminiWatermark={autoRemoveGeminiWatermark}
                        setAutoRemoveGeminiWatermark={setAutoRemoveGeminiWatermark}
                        handleAutoWorkflow={handleAutoWorkflow}
                        autoWorkflowMode={autoWorkflowMode}
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
                </>
            )}
        </div>
    );
};

export default App;
