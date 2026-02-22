import React from 'react';
import { MessageCircle, CheckCircle, Image, SmilePlus } from 'lucide-react';

const Header = ({ step, version, productType, setProductType }) => {
    return (
        <header className="mb-10 glass-effect p-6 md:p-8 rounded-[2rem] flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
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
            </div>

            {/* 產品類型切換 */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setProductType('sticker')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 border-2 ${productType === 'sticker'
                            ? 'bg-line/15 border-line text-white shadow-lg shadow-green-500/10'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${productType === 'sticker' ? 'bg-line/20' : 'bg-slate-700/50'
                        }`}>
                        <Image className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">LINE 靜態貼圖</div>
                        <div className="text-[10px] opacity-60">370×320 px</div>
                    </div>
                </button>
                <button
                    onClick={() => setProductType('emoji')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 border-2 ${productType === 'emoji'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${productType === 'emoji' ? 'bg-amber-500/20' : 'bg-slate-700/50'
                        }`}>
                        <SmilePlus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">LINE 表情貼</div>
                        <div className="text-[10px] opacity-60">180×180 px</div>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
