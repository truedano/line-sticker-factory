import React from 'react';
import { Settings, Moon, CheckCircle, Loader, Eraser } from 'lucide-react';

const RemoveBgSection = ({
    step,
    slicedPieces,
    autoRemoveBg,
    setAutoRemoveBg,
    targetColorHex,
    applyPreset,
    zoomLevel,
    setZoomLevel,
    colorTolerance,
    setColorTolerance,
    despill,
    setDespill,
    performProcessing,
    isProcessing,
    processedCount,
    setStep,
    gridConfig
}) => {
    return (
        <div className={`step-card glass-card rounded-[3rem] p-8 md:p-12 mb-12 transform transition-all duration-700 ${step !== 2 ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100 relative'}`}>
            <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                <div className="w-full xl:flex-1">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">分割與去背預覽</h2>
                        <p className="text-slate-400 font-medium font-inter">檢查您的 {gridConfig.total} 個貼圖資源，並調整去背參數</p>
                    </div>
                    <div className={`grid gap-4 md:gap-6 ${gridConfig.cols === 8 ? 'grid-cols-4 md:grid-cols-8 lg:grid-cols-8' : gridConfig.cols === 6 ? 'grid-cols-3 md:grid-cols-6 lg:grid-cols-6' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-4'}`}>
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
                                    <><Loader className="animate-spin w-6 h-6" /><span>處理中 {processedCount}/{gridConfig.total}</span></>
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
    );
};

export default RemoveBgSection;
