import React from 'react';
import { Upload, Scissors, Loader, Star, ChevronDown, Info, Wand2, CheckCircle, Copy } from 'lucide-react';
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
    PROMPT_THEMES,
    PROMPT_STYLES
}) => {
    return (
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
    );
};

export default UploadSection;
