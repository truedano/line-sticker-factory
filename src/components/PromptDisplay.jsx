import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { PROMPT_THEMES, PROMPT_STYLES, GRID_MODES, EMOJI_GRID_MODES, EMOJI_PROMPT_THEMES } from '../data';

const PromptDisplay = ({ activeTheme, activeStyle, customTexts, customEmotions, gridMode = '4x3', handleCopyPrompt, copySuccess, productType = 'sticker' }) => {
    const isEmoji = productType === 'emoji';
    const promptThemes = isEmoji ? EMOJI_PROMPT_THEMES : PROMPT_THEMES;
    const gridModes = isEmoji ? EMOJI_GRID_MODES : GRID_MODES;
    const theme = promptThemes[activeTheme] || promptThemes['daily'];
    const style = PROMPT_STYLES[activeStyle];
    const effectiveGridMode = gridModes[gridMode] ? gridMode : Object.keys(gridModes)[0];
    const gridConfig = gridModes[effectiveGridMode];
    const totalCount = gridConfig.total;
    const layoutLabel = `${gridConfig.cols} × ${gridConfig.rows}`;
    const sizeLabel = `${gridConfig.width} × ${gridConfig.height} px`;

    const getField = (field) => {
        const total = gridConfig.total;
        const key = `${field}${total}`;
        if (theme[key]) return theme[key];
        return theme[field];
    };

    const emotionsToShow = activeTheme === 'custom' ? customEmotions : getField('emotions');
    const actionsToShow = getField('actions');

    // 靜態貼圖才需要文字
    const textsToShow = !isEmoji && (activeTheme === 'custom' ? customTexts : getField('texts'));

    if (isEmoji) {
        return (
            <div className="prompt-content text-sm font-inter bg-slate-950/80 p-8 rounded-[2rem] border border-white/5 h-[450px] overflow-y-auto shadow-inner custom-scrollbar relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-50"></div>

                <div className="flex items-center justify-between mb-6">
                    <div className="font-bold text-2xl text-white flex items-center gap-2">
                        <span className="text-amber-500">✅</span> {totalCount} 格角色表情貼集｜AI Prompt 建議
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

                {/* 解析度警示區塊 */}
                <div className="mb-6 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <h2 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        ⚠️ 圖片解析度（最重要，務必遵守）
                    </h2>
                    <ul className="space-y-1.5 text-sm">
                        <li>輸出圖片的精確像素尺寸必須為：<span className="text-red-400 font-bold text-base">{gridConfig.width} × {gridConfig.height} px</span></li>
                        <li>每格固定 <span className="fixed-val">{Math.round(gridConfig.width / gridConfig.cols)}×{Math.round(gridConfig.height / gridConfig.rows)} px</span>，共 {gridConfig.cols} 欄 × {gridConfig.rows} 列 = {totalCount} 格。</li>
                        <li>請在 AI 生圖工具中將解析度設定為 <span className="text-white font-bold">{gridConfig.width}×{gridConfig.height}</span>，不可使用其他尺寸。</li>
                    </ul>
                </div>

                <p className="text-slate-300 leading-relaxed mb-8 text-base">
                    請參考上傳圖片中的角色特徵，生成一張 <span className="text-white font-bold">{gridConfig.width}×{gridConfig.height} px</span> 的表情貼大圖，包含 {totalCount} 個不同表情（切勿包含任何表情符號 Emoji）。
                </p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-amber-400 border-amber-500/30 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            角色與風格設定
                        </h2>
                        <ul className="space-y-2 mt-3">
                            <li><span className="text-slate-400">核心要求：</span>必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。</li>
                            <li><span className="text-slate-400">構圖邏輯：</span>表情貼<span className="text-amber-400 font-bold">「不含文字」</span>，純粹以角色的表情和動作傳達情緒。</li>
                            <li><span className="text-slate-400">風格關鍵字：</span><span className="var-highlight">{style.desc}</span></li>
                            <li><span className="text-slate-400">去背優化：</span>角色需加入 <span className="text-white font-medium">粗白色外框 (Sticker Style)</span>。背景統一為 <span className="fixed-val">#00FF00 (純綠色)</span>。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-orange-400 border-orange-500/30 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                            畫面佈局（{gridConfig.width} × {gridConfig.height} px）
                        </h2>
                        <ul className="space-y-2 mt-3">
                            <li>整體畫布：<span className="text-red-400 font-bold">{gridConfig.width} × {gridConfig.height} px</span>（不可偏差）。</li>
                            <li>佈局：{gridConfig.cols} 欄 × {gridConfig.rows} 列，每格 <span className="fixed-val">{Math.round(gridConfig.width / gridConfig.cols)}×{Math.round(gridConfig.height / gridConfig.rows)} px</span>，共 {totalCount} 格。</li>
                            <li>所有 {totalCount} 個格子必須排列整齊，呈現嚴格的均等網格，格子之間<span className="text-red-400 font-bold">不可有間隙、分隔線或邊框</span>。</li>
                            <li>每格內的角色必須<span className="text-amber-400 font-bold">「畫滿整格」</span>：角色（含白色外框）應佔據單格面積的 <span className="text-amber-400 font-bold">85% 以上</span>。</li>
                            <li><span className="text-red-400 font-bold">嚴禁</span>在格子內留下大面積空白綠色背景。</li>
                            <li><span className="text-slate-400">視角：</span>以臉部大特寫和上半身為主，確保縮小到極小時仍能清楚辨識表情。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-yellow-400 border-yellow-500/30 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                            表情貼設計原則
                        </h2>
                        <ul className="space-y-2 mt-3">
                            <li><span className="text-slate-400">設計簡潔：</span>避免太過複雜的細節、漸層或極小的文字，使用<span className="text-white font-medium">較粗的線條</span>描繪輪廓。</li>
                            <li><span className="text-slate-400">放大兼容：</span>單獨傳送會放大，讓放大後的畫質維持良好，避免出現鋸齒。</li>
                            <li><span className="text-slate-400">深色背景兼容：</span>確保圖案邊緣或配色在淺色與深色背景下都容易辨識。</li>
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
                            <li><span className="text-white font-bold italic">{totalCount} 格皆須為不同表情與動作，展現角色張力。</span></li>
                        </ul>
                    </section>
                </div>
            </div>
        );
    }

    // 原始靜態貼圖 PromptDisplay
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
