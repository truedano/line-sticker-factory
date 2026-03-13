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
import { generateStickerPrompt, generateEmojiPrompt } from './utils/promptUtils';

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

    const getPromptText = (tabIndex = 0) => {
        if (productType === 'emoji') {
            return generateEmojiPrompt({
                activeTheme,
                activeStyle,
                gridMode,
                isEmojiTextEnabled,
                customEmotions,
                customActions,
                tabIndex
            });
        }
        return generateStickerPrompt({
            activeTheme,
            activeStyle,
            gridMode,
            customTexts,
            customEmotions,
            customActions,
            tabIndex
        });
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
