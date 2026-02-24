import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Scissors, Loader, Star, ChevronDown, Info, Wand2, CheckCircle, Copy, Grid3X3, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import PromptDisplay from './PromptDisplay';

const UploadSection = ({
    step,
    originalSheet,
    handleUpload,
    isProcessing,
    performSlice,
    showPromptGuide,
    setShowPromptGuide,
    activeTheme,
    setActiveTheme,
    activeStyle,
    setActiveStyle,
    customTexts,
    setCustomTexts,
    customEmotions,
    setCustomEmotions,
    handleCopyPrompt,
    copySuccess,
    promptThemes,
    PROMPT_STYLES,
    gridMode,
    setGridMode,
    gridConfig,
    gridModes,
    productType,
    isEmojiTextEnabled,
    setIsEmojiTextEnabled
}) => {
    const isEmoji = productType === 'emoji';
    const [showGrid, setShowGrid] = useState(true);
    const canvasRef = useRef(null);

    // 繪製帶網格線的預覽
    const drawGridPreview = useCallback(() => {
        if (!originalSheet || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        const maxW = container.clientWidth - 32; // padding
        const maxH = 260;
        const scale = Math.min(maxW / originalSheet.width, maxH / originalSheet.height);
        const drawW = Math.round(originalSheet.width * scale);
        const drawH = Math.round(originalSheet.height * scale);

        canvas.width = drawW;
        canvas.height = drawH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalSheet, 0, 0, drawW, drawH);

        if (showGrid && gridConfig) {
            const { cols, rows } = gridConfig;
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 3]);
            // 垂直線
            for (let c = 1; c < cols; c++) {
                const x = Math.round(c * drawW / cols);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, drawH);
                ctx.stroke();
            }
            // 水平線
            for (let r = 1; r < rows; r++) {
                const y = Math.round(r * drawH / rows);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(drawW, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }
    }, [originalSheet, showGrid, gridConfig]);

    useEffect(() => {
        drawGridPreview();
    }, [drawGridPreview]);

    return (
        <div className={`transition-all duration-500 transform ${step !== 1 ? 'opacity-0 translate-y-4 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isEmoji ? 'via-amber-500' : 'via-line'} to-transparent opacity-30`}></div>

                    <div className="mb-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            上傳您的{isEmoji ? '表情貼' : '貼圖'}原始檔
                        </h2>

                        {/* 表情貼規範提示 */}
                        {isEmoji && (
                            <div className="mb-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-left animate-fade-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">表情貼設計重點</span>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <span>每張圖片 <span className="text-white font-medium">180 × 180 px</span>，必須<span className="text-amber-400 font-bold">去背（透明背景）</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <span><span className="text-red-400 font-bold">不要留白</span>：請把畫布畫滿，圖案越大越好</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <span>設計簡潔、<span className="text-white font-medium">輪廓清晰</span>、使用粗線條</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <span>數量可選 <span className="text-white font-medium">8 / 16 / 24 / 32 / 40</span> 張</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* 網格模式選擇 */}
                        <div className="mb-6 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                            <span className="block text-xs font-bold text-line uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Grid3X3 className="w-4 h-4" />
                                選擇佈局模式
                            </span>
                            <div className={`grid gap-3 ${Object.keys(gridModes).length <= 5 ? 'grid-cols-3 md:grid-cols-5' : 'grid-cols-3 md:grid-cols-5'}`}>
                                {Object.entries(gridModes).map(([key, mode]) => (
                                    <button
                                        key={key}
                                        onClick={() => setGridMode(key)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${gridMode === key
                                            ? (isEmoji ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10' : 'bg-line/15 border-line text-white shadow-lg shadow-green-500/10')
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                                    >
                                        <span className="text-lg font-bold">{mode.label}</span>
                                        <span className="text-xs opacity-70">{mode.width} × {mode.height} px</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl text-left">
                            <p className="mb-4 font-semibold text-slate-200 flex items-center gap-2">
                                <Info className="w-5 h-5 text-sky-400" />
                                請上傳 AI 生成的 {gridConfig.cols}x{gridConfig.rows} 網格圖 (JPG/PNG)
                            </p>
                            <ul className="space-y-3 text-sm text-slate-400 list-none">
                                <li className="flex items-start gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isEmoji ? 'bg-amber-500' : 'bg-line'}`}></div>
                                    <span>佈局格式：<span className="text-white font-medium">{gridConfig.cols} 欄 × {gridConfig.rows} 列</span>，共 {gridConfig.total} 張{isEmoji ? '表情貼' : '貼圖'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isEmoji ? 'bg-amber-500' : 'bg-line'}`}></div>
                                    <span>建議尺寸：<span className="text-sky-400 font-mono">{gridConfig.width} × {gridConfig.height} px</span></span>
                                </li>
                                {isEmoji && (
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <span>單張成品尺寸：<span className="text-amber-400 font-mono">180 × 180 px</span>（正方形）</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="relative w-full max-w-xl mx-auto">
                        <div className={`border-2 border-dashed rounded-[2rem] min-h-[18rem] flex flex-col items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden relative ${originalSheet ? (isEmoji ? 'border-amber-500 bg-slate-800/50' : 'border-line bg-slate-800/50') : `border-slate-700 bg-slate-900/50 ${isEmoji ? 'hover:border-amber-500' : 'hover:border-line'} hover:bg-slate-800/80`}`}>
                            <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                            {originalSheet ? (
                                <div className="w-full p-4 flex flex-col items-center justify-center animate-fade-in">
                                    <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-2xl" style={{ imageRendering: 'auto' }} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2rem] z-10">
                                        <span className="text-white font-bold bg-slate-900/80 px-4 py-2 rounded-full">點擊更換圖片</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center z-10 pointer-events-none group-hover:scale-105 transition-transform duration-500 py-8">
                                    <div className={`w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-700 transition-all duration-500 ${isEmoji ? 'text-amber-500 group-hover:bg-amber-500 group-hover:text-white' : 'text-line group-hover:bg-line group-hover:text-white'}`}>
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    <span className="text-slate-300 font-bold text-lg mb-2">點擊或拖放圖片</span>
                                    <span className="text-sm text-slate-500 uppercase tracking-widest">支持 JPG, PNG 格式</span>
                                </div>
                            )}
                        </div>

                        {/* 圖片尺寸資訊 & 切割線開關 */}
                        {originalSheet && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
                                <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-2">
                                    <span className="text-slate-500">圖片尺寸：</span>
                                    <span className="text-white font-mono font-bold">{originalSheet.width} × {originalSheet.height} px</span>
                                </div>
                                <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-2">
                                    <span className="text-slate-500">每格約：</span>
                                    <span className="text-sky-400 font-mono font-bold">
                                        {Math.round(originalSheet.width / gridConfig.cols)} × {Math.round(originalSheet.height / gridConfig.rows)} px
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowGrid(!showGrid); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showGrid ? 'bg-red-500/15 border-red-500/50 text-red-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                                >
                                    {showGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    {showGrid ? '隱藏切割線' : '顯示切割線'}
                                </button>
                            </div>
                        )}
                    </div>

                    {originalSheet && (
                        <div className="animate-fade-in mt-8">
                            <button onClick={performSlice} className={`btn-premium text-white px-16 py-5 rounded-[1.25rem] font-bold shadow-xl transition-all btn-press flex items-center justify-center gap-3 mx-auto text-xl active:scale-95 group ${isEmoji ? 'bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20' : 'bg-line hover:bg-line/90 shadow-green-500/20'}`}>
                                {isProcessing ? <Loader className="animate-spin" /> : <Scissors className="group-hover:rotate-12 transition-transform" />}
                                <span>開始切割資源包</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className={`glass-card rounded-[2rem] p-8 h-full flex flex-col ${isEmoji ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-line'}`}>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className={`w-5 h-5 ${isEmoji ? 'text-amber-500 fill-amber-500' : 'text-line fill-line'}`} />
                            {isEmoji ? '表情貼指南' : '使用指南'}
                        </h3>
                        <div className="space-y-6 flex-1">
                            {isEmoji ? (
                                <>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-amber-500">01</div>
                                        <div className="font-bold text-white mb-1">生成表情貼</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            使用下方 AI 提示詞產生表情貼大圖。注意：表情貼可包含<span className="text-amber-400 font-bold">少量簡單文字</span>，「畫滿畫布」是關鍵。
                                        </p>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-amber-500">02</div>
                                        <div className="font-bold text-white mb-1">切圖與去背</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            上傳後系統自動切割成獨立表情貼，並支援一鍵去背處理。
                                        </p>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-amber-500">03</div>
                                        <div className="font-bold text-white mb-1">打包上架</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            設定標籤圖 (tab) 後打包成 ZIP。表情貼不需要 main 封面。檔名格式：001.png ~ {String(gridConfig?.total || 8).padStart(3, '0')}.png。
                                        </p>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                        <p className="text-[11px] text-amber-400/80 leading-relaxed">
                                            📌 表情貼尺寸為 180×180 px（正方形），背景透明，單張 &lt; 1MB，ZIP 總計 &lt; 20MB。
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
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
                                            上傳大圖後，系統會自動切成 {gridConfig?.total || 12} 張小圖，支援一鍵綠幕/黑底智能去背。
                                        </p>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center text-line">03</div>
                                        <div className="font-bold text-white mb-1">打包上架</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            設定封面與編號後打包成 ZIP，即可直接前往 LINE Creators Market 上傳。
                                        </p>
                                    </div>
                                </>
                            )}
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
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${isEmoji ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
                        <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
                                1. 選擇{isEmoji ? '表情主題' : '主題內容'}
                            </span>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(promptThemes).map(([key, theme]) => (
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
                                    {!isEmoji && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">自訂文字內容 (以逗號分隔)</label>
                                            <textarea
                                                value={customTexts}
                                                onChange={(e) => setCustomTexts(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                placeholder="例如：加油、辛苦了、想睡覺..."
                                            />
                                        </div>
                                    )}
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
                        {isEmoji && (
                            <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors md:col-span-2 lg:col-span-1">
                                <span className="block text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">3. 表情貼文字設定</span>
                                <div className="flex gap-4 items-center">
                                    <button
                                        onClick={() => setIsEmojiTextEnabled(false)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!isEmojiTextEnabled ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                    >
                                        不含文字 (純表情)
                                    </button>
                                    <button
                                        onClick={() => setIsEmojiTextEnabled(true)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isEmojiTextEnabled ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                    >
                                        搭配少量文字
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <PromptDisplay
                        activeTheme={activeTheme}
                        activeStyle={activeStyle}
                        isEmojiTextEnabled={isEmojiTextEnabled}
                        customTexts={customTexts}
                        customEmotions={customEmotions}
                        gridMode={gridMode}
                        handleCopyPrompt={handleCopyPrompt}
                        copySuccess={copySuccess}
                        productType={productType}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadSection;
