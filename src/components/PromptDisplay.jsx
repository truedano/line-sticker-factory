import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { PROMPT_THEMES, PROMPT_STYLES, GRID_MODES } from '../data';

const PromptDisplay = ({ activeTheme, activeStyle, customTexts, customEmotions, gridMode = '4x3', handleCopyPrompt, copySuccess }) => {
    const theme = PROMPT_THEMES[activeTheme];
    const style = PROMPT_STYLES[activeStyle];
    const gridConfig = GRID_MODES[gridMode];
    const totalCount = gridConfig.total;
    const layoutLabel = `${gridConfig.cols} × ${gridConfig.rows}`;
    const sizeLabel = `${gridConfig.width} × ${gridConfig.height} px`;

    const getField = (field) => {
        const key32 = `${field}32`;
        const key24 = `${field}24`;
        if (gridMode === '8x4' && theme[key32]) return theme[key32];
        if ((gridMode === '6x4' || gridMode === '8x4') && theme[key24]) return theme[key24];
        return theme[field];
    };

    const textsToShow = activeTheme === 'custom' ? customTexts : getField('texts');
    const emotionsToShow = activeTheme === 'custom' ? customEmotions : getField('emotions');
    const actionsToShow = getField('actions');

    return (
        <div className="prompt-content text-sm font-inter bg-slate-950/80 p-8 rounded-[2rem] border border-white/5 h-[450px] overflow-y-auto shadow-inner custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-line opacity-50"></div>

            <div className="flex items-center justify-between mb-6">
                <div className="font-bold text-2xl text-white flex items-center gap-2">
                    <span className="text-line">✅</span> {totalCount} 格角色貼圖集｜AI Prompt 建議
                </div>
                {handleCopyPrompt && (
                    <button
                        onClick={handleCopyPrompt}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all transform active:scale-95 shrink-0 ${copySuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
                    >
                        {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copySuccess ? "已複製" : "複製 AI 提示詞"}</span>
                    </button>
                )}
            </div>

            <p className="text-slate-300 leading-relaxed mb-8 text-base">
                請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 {totalCount} 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。
            </p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-indigo-400 border-indigo-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        角色與風格設定
                    </h2>
                    <ul className="space-y-2 mt-3">
                        <li><span className="text-slate-400">核心要求：</span>必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。</li>
                        <li><span className="text-slate-400">構圖邏輯：</span>畫面僅包含「角色 + 文字」，不包含任何複雜背景。</li>
                        <li><span className="text-slate-400">風格關鍵字：</span><span className="var-highlight">{style.desc}</span></li>
                        <li><span className="text-slate-400">去背優化：</span>角色與文字需加入 <span className="text-white font-medium">粗白色外框 (Sticker Style)</span>。背景統一為 <span className="fixed-val">#00FF00 (純綠色)</span>。</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-purple-400 border-purple-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        畫面佈局與尺寸規格
                    </h2>
                    <ul className="space-y-2 mt-3">
                        <li>整體為 <span className="text-white font-medium">{layoutLabel} 佈局</span>，共 {totalCount} 張貼圖。總尺寸：<span className="fixed-val">{sizeLabel}</span>。</li>
                        <li>每張貼圖四周預留適度 <span className="text-slate-400 italic">Padding</span>，避免畫面互相黏住。</li>
                        <li><span className="text-slate-400">視角：</span>全身 + 半身混合，包含正面、側面、俯角等。</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-sky-400 border-sky-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                        文字設計細節
                    </h2>
                    <ul className="space-y-2 mt-3">
                        <li><span className="text-slate-400">語言：</span><span className="var-highlight">台灣繁體中文</span></li>
                        <li><span className="text-slate-400">內容：</span><span className="var-highlight">{textsToShow}</span></li>
                        <li><span className="text-slate-400">配色：</span>每張貼圖的文字顏色必須各不相同，從以下色系中輪流選用：<span className="var-highlight">紅色、橘色、黃色、藍色、紫色、粉紅色、白色、深藍色、棕色、酒紅色</span>。絕對禁止使用綠色系與黑色。確保整套貼圖的文字色彩豐富多元、不重複。</li>
                        <li><span className="text-slate-400">排版：</span>大小約佔 1/3，可壓在衣服邊角，<span className="text-red-400 font-bold">不可遮臉</span>。</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-line border-green-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-line"></div>
                        表情與動作設計
                    </h2>
                    <ul className="space-y-2 mt-3">
                        <li><span className="text-slate-400">情緒清單：</span><span className="var-highlight">{emotionsToShow}</span></li>
                        <li><span className="text-slate-400">建議動作：</span><span className="var-highlight">{actionsToShow}</span></li>
                        <li><span className="text-white font-bold italic">{totalCount} 格皆須為不同動作與表情，展現角色張力。</span></li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default PromptDisplay;
