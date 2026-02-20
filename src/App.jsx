import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Upload, Scissors, Download, Loader, Eraser, CheckCircle,
    MessageCircle, Hash, Moon, Settings, ChevronDown, Copy,
    Wand2, Star, Tag, Crop, Info
} from 'lucide-react';
import { version } from '../package.json';
import { PROMPT_THEMES, PROMPT_STYLES } from './data';
import PromptDisplay from './components/PromptDisplay';



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
            <header className="mb-10 glass-effect p-6 md:p-8 rounded-[2rem] flex flex-col lg:flex-row justify-between items-center gap-8 animate-fade-in">
                <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-line rounded-2xl shadow-lg shadow-green-500/20">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            Line 貼圖自動化助手
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-line/10 text-line border border-line/20 translate-y-[2px]">
                                v{version}
                            </span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium ml-1">快速分割、去背、打包您的 AI 貼圖</p>
                </div>

                <div className="flex items-center bg-slate-900/60 backdrop-blur-md rounded-3xl px-6 py-4 border border-white/5 shadow-inner">
                    {[{ num: 1, label: '上傳分割' }, { num: 2, label: '智能去背' }, { num: 3, label: '成品打包' }].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex flex-col md:flex-row items-center gap-3 px-2 transition-all duration-500 ${step === s.num ? 'scale-105' : 'opacity-60'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${step >= s.num ? 'bg-line text-white shadow-[0_0_15px_rgba(6,199,85,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                                </div>
                                <span className={`text-xs md:text-sm font-bold whitespace-nowrap ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className="mx-2 md:mx-4 w-6 md:w-12 h-[2px] rounded-full overflow-hidden bg-slate-800">
                                    <div className={`h-full bg-line transition-all duration-700 ease-in-out ${step > s.num ? 'w-full' : 'w-0'}`}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </header>

            <div className={`transition-all duration-500 transform ${step !== 1 ? 'opacity-0 translate-y-4 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-line to-transparent opacity-30"></div>

                        <div className="mb-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-6">上傳您的貼圖原始檔</h2>
                            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl text-left">
                                <p className="mb-4 font-semibold text-slate-200 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-sky-400" />
                                    請上傳 AI 生成的 4x3 網格圖 (JPG/PNG)
                                </p>
                                <ul className="space-y-3 text-sm text-slate-400 list-none">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-line mt-1.5 shrink-0"></div>
                                        <span>佈局格式：<span className="text-white font-medium">4 欄 × 3 列</span>，共 12 張貼圖</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-line mt-1.5 shrink-0"></div>
                                        <span>建議尺寸：<span className="text-sky-400 font-mono">2560 × 1664 px</span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="relative group w-full max-w-xl mx-auto">
                            <div className={`border-2 border-dashed rounded-[2rem] h-72 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden relative ${originalSheet ? 'border-line bg-slate-800/50' : 'border-slate-700 bg-slate-900/50 hover:border-line hover:bg-slate-800/80'}`}>
                                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                {originalSheet ? (
                                    <div className="w-full h-full p-4 flex flex-col items-center justify-center animate-fade-in">
                                        <img src={originalSheet.src} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2rem]">
                                            <span className="text-white font-bold bg-slate-900/80 px-4 py-2 rounded-full">點擊更換圖片</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center z-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-20 h-20 bg-slate-800 text-line rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-700 group-hover:bg-line group-hover:text-white transition-all duration-500">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <span className="text-slate-300 font-bold text-lg mb-2">點擊或拖放圖片</span>
                                        <span className="text-sm text-slate-500 uppercase tracking-widest">支持 JPG, PNG 格式</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {originalSheet && (
                            <div className="animate-fade-in mt-10">
                                <button onClick={performSlice} className="btn-premium bg-line hover:bg-line/90 text-white px-16 py-5 rounded-[1.25rem] font-bold shadow-xl shadow-green-500/20 transition-all btn-press flex items-center justify-center gap-3 mx-auto text-xl active:scale-95 group">
                                    {isProcessing ? <Loader className="animate-spin" /> : <Scissors className="group-hover:rotate-12 transition-transform" />}
                                    <span>開始切割資源包</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-[2rem] p-8 border-l-4 border-l-line h-full flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Star className="w-5 h-5 text-line fill-line" />
                                使用指南
                            </h3>
                            <div className="space-y-6 flex-1">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-line">01</div>
                                    <div className="font-bold text-white mb-1">生出你的貼圖</div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        透過下方 AI 提示詞大師挑選合適 Prompt，配合 Gemini 或 ChatGPT 產生高畫質貼圖大圖。
                                    </p>
                                </div>
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-line">02</div>
                                    <div className="font-bold text-white mb-1">智能切圖與去背</div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        上傳大圖後，系統會自動切成 12 張小圖，支援一鍵綠幕/黑底智能去背。
                                    </p>
                                </div>
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-line">03</div>
                                    <div className="font-bold text-white mb-1">打包上架</div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        設定封面與編號後打包成 ZIP，即可直接前往 LINE Creators Market 上傳。
                                    </p>
                                </div>
                            </div>
                            <a href="https://creator.line.me/zh-hant/" target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors border border-slate-700">
                                前往 Creators Market <ChevronDown className="-rotate-90 w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 mb-12">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Wand2 className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-2xl text-white">AI 提示詞大師</h3>
                        </div>
                        <button onClick={() => setShowPromptGuide(!showPromptGuide)} className="bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition-all flex items-center gap-2 border border-slate-700">
                            {showPromptGuide ? "隱藏面板" : "展開面板"}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showPromptGuide ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <div className={`transition-all duration-700 ${showPromptGuide ? 'opacity-100 max-h-[1200px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
                                <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">1. 選擇主題內容</span>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(PROMPT_THEMES).map(([key, theme]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTheme(key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeTheme === key ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                        >
                                            {theme.label}
                                        </button>
                                    ))}
                                </div>
                                {activeTheme === 'custom' && (
                                    <div className="mt-6 space-y-4 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">自訂文字內容 (以逗號分隔)</label>
                                            <textarea
                                                value={customTexts}
                                                onChange={(e) => setCustomTexts(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                placeholder="例如：加油、辛苦了、想睡覺..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">自訂情緒/表情描述</label>
                                            <textarea
                                                value={customEmotions}
                                                onChange={(e) => setCustomEmotions(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                placeholder="例如：浮誇的表情、眼神死、幸福感爆棚..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
                                <span className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">2. 選擇視覺風格</span>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(PROMPT_STYLES).map(([key, style]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveStyle(key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeStyle === key ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <PromptDisplay
                                activeTheme={activeTheme}
                                activeStyle={activeStyle}
                                customTexts={customTexts}
                                customEmotions={customEmotions}
                            />
                            <div className="absolute bottom-6 right-6">
                                <button
                                    onClick={handleCopyPrompt}
                                    className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-xl ${copySuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                                >
                                    {copySuccess ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                    <span>{copySuccess ? "已複製到剪貼簿" : "複製 AI 提示詞"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`step-card glass-card rounded-[3rem] p-8 md:p-12 mb-12 transform transition-all duration-700 ${step !== 2 ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100 relative'}`}>
                <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                    <div className="w-full xl:flex-1">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">分割與去背預覽</h2>
                            <p className="text-slate-400 font-medium font-inter">檢查您的 12 個貼圖資源，並調整去背參數</p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
                            {slicedPieces.map((p) => (
                                <div key={p.id} className="aspect-square bg-slate-900/80 rounded-2xl border border-white/5 p-3 flex items-center justify-center shadow-inner group relative overflow-hidden">
                                    <div className="absolute top-2 left-2 w-5 h-5 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-700">{p.id}</div>
                                    <img src={p.previewUrl} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full xl:w-96 shrink-0 h-fit sticky top-8">
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3 font-bold text-xl text-white">
                                        <div className="p-2 bg-line/20 rounded-lg">
                                            <Settings className="w-5 h-5 text-line" />
                                        </div>
                                        去背設定
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={autoRemoveBg} onChange={(e) => setAutoRemoveBg(e.target.checked)} className="sr-only peer" />
                                        <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-line"></div>
                                    </div>
                                </div>

                                {autoRemoveBg && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => applyPreset('black')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${targetColorHex === '#000000' ? 'bg-slate-800 border-white/20 text-white shadow-lg' : 'bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10'}`}>
                                                <Moon className="w-5 h-5" />
                                                <span className="text-xs font-bold">黑底風格</span>
                                            </button>
                                            <button onClick={() => applyPreset('green')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${targetColorHex === '#00FF00' ? 'bg-green-900/30 border-green-500/30 text-green-400 shadow-lg' : 'bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10'}`}>
                                                <div className="w-5 h-5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                                <span className="text-xs font-bold">綠幕模式</span>
                                            </button>
                                        </div>

                                        <div className="space-y-5 pt-2">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs font-bold font-inter tracking-wider">
                                                    <span className="text-slate-400 uppercase">裁切縮放 (去除黑邊)</span>
                                                    <span className="text-line">{Math.round((zoomLevel - 1) * 100)}%</span>
                                                </div>
                                                <input type="range" min="1.00" max="1.50" step="0.01" value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-line" />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs font-bold font-inter tracking-wider">
                                                    <span className="text-slate-400 uppercase">色彩容許度</span>
                                                    <span className="text-line">{colorTolerance}</span>
                                                </div>
                                                <input type="range" min="1" max="100" value={colorTolerance} onChange={(e) => setColorTolerance(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-line" />
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">溢色去除 (Despill)</span>
                                                <button
                                                    onClick={() => setDespill(!despill)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${despill ? 'bg-line text-white shadow-lg shadow-green-500/20' : 'bg-slate-800 text-slate-500'}`}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 bg-slate-950/30">
                                <button
                                    onClick={performProcessing}
                                    disabled={isProcessing}
                                    className="w-full bg-line hover:bg-line/90 text-white py-5 rounded-2xl font-bold shadow-xl shadow-green-500/20 transition-all btn-press flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                                >
                                    {isProcessing ? (
                                        <><Loader className="animate-spin w-6 h-6" /><span>處理中 {processedCount}/12</span></>
                                    ) : (
                                        <><Eraser className="w-6 h-6" /><span>執行智能去背</span></>
                                    )}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full mt-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">重新上傳圖片</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`step-card glass-card rounded-[3rem] p-8 md:p-12 mb-12 transform transition-all duration-700 ${step !== 3 ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100 relative'}`}>
                <div className="mb-12 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                            <Download className="w-7 h-7 text-line" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">打包與導出資源</h2>
                    </div>
                    <p className="text-slate-400 font-medium">最後一步：設定封面圖與貼圖編號，準備上線！</p>
                </div>

                <div className="flex flex-col xl:flex-row gap-10 items-stretch mb-12">
                    <div className="flex-1 glass-card bg-amber-500/5 border-amber-500/20 p-8 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="w-6 h-6 text-amber-500" />
                            <span className="text-lg font-bold text-amber-500">最後的小提醒</span>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-amber-500">1</span></div>
                                <p className="text-slate-300 text-sm md:text-base">設定封面圖：點擊下方圖示的 <span className="text-white font-bold underline decoration-line decoration-2">Main</span> 與 <span className="text-white font-bold underline decoration-line decoration-2">Tab</span> 按鈕來決定門面。</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-amber-500">2</span></div>
                                <p className="text-slate-300 text-sm md:text-base">起始編號：如果是第二波貼圖，編號請設為 <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">13</span> 以免檔名衝突。</p>
                            </li>
                        </ul>
                    </div>

                    <div className="w-full xl:w-96 flex flex-col gap-4">
                        <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5 flex-1 flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">檔名起始編號</span>
                            <div className="flex items-center gap-4">
                                <Hash className="w-6 h-6 text-line" />
                                <input
                                    type="number"
                                    min="1"
                                    value={startNumber}
                                    onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="flex-1 bg-slate-800/50 border border-white/5 text-white rounded-xl text-center font-bold text-2xl focus:ring-2 focus:ring-line outline-none py-3 shadow-inner"
                                />
                            </div>
                        </div>
                        <button
                            onClick={downloadZip}
                            className="bg-line hover:bg-line/90 text-white py-6 rounded-[1.5rem] font-bold shadow-2xl shadow-green-500/30 transition-all btn-press animate-pulse-subtle flex items-center justify-center gap-4 text-xl"
                        >
                            <Download className="w-7 h-7" /> 打包下載完整 ZIP
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {finalImages.map((img, idx) => (
                        <div key={img.id} className="glass-card bg-slate-950/40 rounded-[1.5rem] p-4 group">
                            <div className="aspect-[370/320] grid-bg rounded-xl flex items-center justify-center overflow-hidden border border-white/5 mb-4 shadow-inner">
                                <img src={img.dataUrl} className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                            </div>
                            <div className="text-center text-xs font-bold text-slate-400 mb-4 bg-slate-900/80 rounded-lg py-1.5 font-mono shadow-inner border border-white/5">
                                {getFileName(idx)}.png
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="cursor-pointer group/label">
                                    <input type="radio" name="main_select" checked={mainId === img.id} onChange={() => setMainId(img.id)} className="hidden" />
                                    <div className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${mainId === img.id ? 'bg-line/20 border-line text-line shadow-lg shadow-green-500/10' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}>
                                        <Star className={`w-3 h-3 ${mainId === img.id ? 'fill-line' : ''}`} /> MAIN
                                    </div>
                                </label>
                                <label className="cursor-pointer group/label">
                                    <input type="radio" name="tab_select" checked={tabId === img.id} onChange={() => setTabId(img.id)} className="hidden" />
                                    <div className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${tabId === img.id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}>
                                        <Tag className={`w-3 h-3 ${tabId === img.id ? 'fill-indigo-400' : ''}`} /> TAB
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <button
                        onClick={() => setStep(1)}
                        className="text-slate-500 hover:text-white transition-all font-bold text-sm underline decoration-slate-800 underline-offset-8 decoration-2 hover:decoration-line"
                    >
                        處理下一張圖資源組
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
