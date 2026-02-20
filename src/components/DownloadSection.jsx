import React from 'react';
import { Download, Info, Hash, Star, Tag } from 'lucide-react';

const DownloadSection = ({
    step,
    finalImages,
    mainId,
    setMainId,
    tabId,
    setTabId,
    startNumber,
    setStartNumber,
    downloadZip,
    getFileName,
    setStep
}) => {
    return (
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
    );
};

export default DownloadSection;
