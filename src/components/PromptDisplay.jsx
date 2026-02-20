import React from 'react';
import { PROMPT_THEMES, PROMPT_STYLES } from '../data';

const PromptDisplay = ({ activeTheme, activeStyle, customTexts, customEmotions }) => {
    const theme = PROMPT_THEMES[activeTheme];
    const style = PROMPT_STYLES[activeStyle];

    return (
        <div className="prompt-content text-sm font-inter bg-slate-950/80 p-8 rounded-[2rem] border border-white/5 h-[450px] overflow-y-auto shadow-inner custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-line opacity-50"></div>

            <div className="font-bold text-2xl mb-6 text-white flex items-center gap-2">
                <span className="text-line">✅</span> 12 格角色貼圖集｜AI Prompt 建議
            </div>

            <p className="text-slate-300 leading-relaxed mb-8 text-base">
                請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 12 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。
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
                        <li>整體為 <span className="text-white font-medium">4 × 3 佈局</span>，共 12 張貼圖。總尺寸：<span className="fixed-val">1480 × 960 px</span>。</li>
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
                        <li><span className="text-slate-400">內容：</span><span className="var-highlight">{activeTheme === 'custom' ? customTexts : theme.texts}</span></li>
                        <li><span className="text-slate-400">配色：</span>使用高對比鮮豔色彩。絕對禁止使用綠色系與黑色。</li>
                        <li><span className="text-slate-400">排版：</span>大小約佔 1/3，可壓在衣服邊角，<span className="text-red-400 font-bold">不可遮臉</span>。</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-line border-green-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-line"></div>
                        表情與動作設計
                    </h2>
                    <ul className="space-y-2 mt-3">
                        <li><span className="text-slate-400">情緒清單：</span><span className="var-highlight">{activeTheme === 'custom' ? customEmotions : theme.emotions}</span></li>
                        <li><span className="text-slate-400">建議動作：</span><span className="var-highlight">{theme.actions}</span></li>
                        <li><span className="text-white font-bold italic">12 格皆須為不同動作與表情，展現角色張力。</span></li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default PromptDisplay;
