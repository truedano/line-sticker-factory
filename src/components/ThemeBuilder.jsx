import React, { useState, useRef } from 'react';
import { Upload, Download, Loader, Info, Palette, Image as ImageIcon, Wand2, ChevronDown, Copy, CheckCircle } from 'lucide-react';
import useThemePack from '../hooks/useThemePack';
import { PROMPT_STYLES } from '../data';

const ThemeBuilder = ({ productType }) => {
    const { generateThemeZip, isExporting } = useThemePack();

    // States for uploaded images
    const [assets, setAssets] = useState({
        mainImageIos: null,
        mainImageAndroid: null,
        mainImageStore: null,
        menuOffImage: null,
        menuOnImage: null,
        menuBgImage: null,
        passcodeImage: null,
        profileImage: null,
        chatBgImage: null
    });

    // Prompt States
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [themeColor, setThemeColor] = useState('溫柔的奶茶色系');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [activePromptType, setActivePromptType] = useState('main_ios');
    const [copySuccess, setCopySuccess] = useState(false);

    const PROMPT_TYPES = [
        { id: 'main_ios', category: 'A. 主要圖片', label: '主要圖片 (iOS)', size: '200×284' },
        { id: 'main_android', category: 'A. 主要圖片', label: '主要圖片 (Android)', size: '136×202' },
        { id: 'main_store', category: 'A. 主要圖片', label: '主要圖片 (STORE)', size: '198×278' },
        { id: 'menu_btn_off', category: 'B. 選單按鍵圖片', label: '選單按鍵 (未選取 OFF)', size: '384×450' },
        { id: 'menu_btn_on', category: 'B. 選單按鍵圖片', label: '選單按鍵 (已選取 ON)', size: '384×450' },
        { id: 'menu_bg', category: 'C. 選單背景圖片', label: '選單背景 (極扁長)', size: '1472×150' },
        { id: 'passcode', category: 'D. 密碼畫面圖片', label: '密碼圖示 (正方形)', size: '120×120' },
        { id: 'profile', category: 'E. 個人圖片', label: '大頭貼 (正方形)', size: '240×240' },
        { id: 'chat_bg_ios', category: 'F. 聊天室背景圖片', label: '聊天底圖 (iOS)', size: '1482×1334' },
        { id: 'chat_bg_android', category: 'F. 聊天室背景圖片', label: '聊天底圖 (Android)', size: '1300×1300' },
    ];

    const getPromptText = (typeId) => {
        const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
        const typeInfo = PROMPT_TYPES.find(t => t.id === typeId) || PROMPT_TYPES[0];

        let extraGuide = '';
        if (typeId === 'menu_btn_off') {
            extraGuide = '\n• 九宮格按鍵設計 (未選取 OFF)：請設計一個 3x3 的九宮格版面（共 9 個不同的小圖示）。這是「未選取」的狀態，顏色建議較為黯淡、低調或以單色系、線條為主。請確保每個小圖案置中於自己的格子內（系統稍後會將此圖精準等分成 9 張 128x150 的小圖）。特別注意：每個小圖示的「右上角」未來將會被 LINE 覆蓋「紅色提醒數字 N」，因此務必確保每個圖案四周與右上角保持充足的留白，圖案絕對不能畫太滿！';
        } else if (typeId === 'menu_btn_on') {
            extraGuide = '\n• 九宮格按鍵設計 (已選取 ON)：請設計一個 3x3 的九宮格版面（共 9 個不同的小圖示）。這是「已選取」的活躍狀態，顏色建議極度鮮明、生動可愛或帶有高亮特效。請確保每個小圖案置中於自己的格子內（系統稍後會將此圖精準等分成 9 張 128x150 的小圖）。特別注意：每個小圖示的「右上角」未來將會被 LINE 覆蓋「紅色提醒數字 N」，因此務必確保每個圖案四周與右上角保持充足的留白，圖案絕對不能畫太滿！';
        } else if (typeInfo.category.startsWith('C')) {
            extraGuide = '\n• 橫條背景：這是一張極度扁長的橫條圖片，請設計適合橫向平鋪的連續圖案或漸層背景，絕對不要把角色放太大。';
        } else if (typeInfo.category.startsWith('D')) {
            extraGuide = '\n• 密碼圖示：這是一個密碼解鎖圖示，應該是圓潤且小巧的單純圖案。';
        } else if (typeInfo.category.startsWith('F')) {
            extraGuide = '\n• 聊天室底圖：請保持畫面中央清爽，主體物件或角色請往角落邊緣靠攏，避免影響對話文字的閱讀性，推薦以留白或大面積簡單色塊為主。';
        }

        return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${typeInfo.size.split('×')[0]} px，高度 ${typeInfo.size.split('×')[1]} px」。
• 不可去背：背景必須填滿顏色，不可為透明。
• 佈局構圖：四周務必保留大面積的安全留白（避免在不同裝置上被微調或裁切）。

請參考我上傳的圖片生圖：
• 角色設定：請必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵，請放置在畫面最適當的地方。${extraGuide}
• 視覺風格：${style.label}（${style.desc}）。
• 背景設定：以 ${themeColor} 為主的乾淨背景，四周維持留白與簡單圖樣，絕對不要在畫面出現任何干擾文字。`;
    };

    const handleCopyPrompt = (type) => {
        navigator.clipboard.writeText(getPromptText(type)).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleUpload = (e, key) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAssets(prev => ({ ...prev, [key]: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleExport = async () => {
        await generateThemeZip(assets);
    };

    if (productType !== 'theme') return null;

    const allUploaded = Object.values(assets).filter(Boolean).length;
    const progress = Math.round((allUploaded / 9) * 100);

    const UploadCard = ({ label, desc, stateKey, icon: Icon }) => {
        const hasImage = !!assets[stateKey];

        return (
            <div className={`relative group border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden min-h-[160px] p-6
                ${hasImage ? 'border-purple-500 bg-slate-800/50' : 'border-slate-700 bg-slate-900/50 hover:border-purple-500 hover:bg-slate-800/80 cursor-pointer'}`}>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, stateKey)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />

                {hasImage ? (
                    <div className="w-full flex flex-col items-center justify-center animate-fade-in relative">
                        <img src={assets[stateKey]} className="max-h-[120px] max-w-full rounded-xl shadow-lg object-contain" alt={label} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl z-10 pointer-events-none">
                            <span className="text-white font-bold bg-slate-900/80 px-3 py-1 rounded-full text-xs">點擊更換</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center pointer-events-none group-hover:scale-105 transition-transform duration-500">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all border border-slate-700 shadow-sm">
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-slate-300 font-bold mb-1">{label}</span>
                        <span className="text-[10px] text-slate-500">{desc}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative animate-fade-in pb-10">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group mb-10 border-t-4 border-t-purple-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>

                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                            <Palette className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">LINE 主題懶人包產生器</h2>
                    </div>

                    <p className="text-slate-400 font-medium mb-8">
                        上傳以下 A 到 F 共 9 張關鍵圖片，讓系統自動為您打包成完整的 LINE 主題 ZIP 檔。
                    </p>

                    <div className="glass-card rounded-[2rem] p-6 md:p-8 mb-10 text-left border border-white/5">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Wand2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="font-bold text-xl text-white">主題 AI 提示詞大師</h3>
                            </div>
                            <button onClick={() => setShowPromptGuide(!showPromptGuide)} className="bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition-all flex items-center gap-2 border border-slate-700">
                                {showPromptGuide ? "隱藏面板" : "展開面板"}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showPromptGuide ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className={`transition-all duration-700 overflow-hidden ${showPromptGuide ? 'opacity-100 max-h-[1200px]' : 'opacity-0 max-h-0'}`}>
                            <div className="mb-6">
                                <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50">
                                    <span className="block text-base font-bold text-purple-400 tracking-wider mb-5">
                                        1. 選擇視覺風格
                                    </span>
                                    <div className="flex gap-4 flex-wrap mb-8">
                                        {Object.entries(PROMPT_STYLES).map(([key, style]) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveStyle(key)}
                                                className={`px-6 py-3 rounded-2xl text-base font-bold transition-all border ${activeStyle === key ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/60 hover:bg-cyan-900/60 hover:text-cyan-200'}`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>

                                    <span className="block text-base font-bold text-purple-400 tracking-wider mb-4">
                                        2. 背景主題色系
                                    </span>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={themeColor}
                                            onChange={(e) => setThemeColor(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-4 text-base focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                            placeholder="例如：粉嫩馬卡龍色系"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950/80 p-6 md:p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
                                <div className="font-bold text-lg text-white mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                        <Wand2 className="w-4 h-4" />
                                    </div>
                                    <span>主題 Prompt 切換器 (分類好選擇)</span>
                                </div>

                                {/* 1st Level: Category Tabs (A~F) */}
                                {(() => {
                                    const PROMPT_CATEGORIES = [
                                        { id: 'A', title: 'A. 主要圖片', items: PROMPT_TYPES.filter(t => t.category.startsWith('A')) },
                                        { id: 'B', title: 'B. 選單按鍵', items: PROMPT_TYPES.filter(t => t.category.startsWith('B')) },
                                        { id: 'C', title: 'C. 選單背景', items: PROMPT_TYPES.filter(t => t.category.startsWith('C')) },
                                        { id: 'D', title: 'D. 密碼畫面', items: PROMPT_TYPES.filter(t => t.category.startsWith('D')) },
                                        { id: 'E', title: 'E. 個人圖片', items: PROMPT_TYPES.filter(t => t.category.startsWith('E')) },
                                        { id: 'F', title: 'F. 聊天底圖', items: PROMPT_TYPES.filter(t => t.category.startsWith('F')) }
                                    ];
                                    const activeCategoryGroup = PROMPT_CATEGORIES.find(c => c.items.some(i => i.id === activePromptType)) || PROMPT_CATEGORIES[0];

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
                                                {PROMPT_CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setActivePromptType(cat.items[0].id)}
                                                        className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${activeCategoryGroup.id === cat.id ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                                                    >
                                                        {cat.title}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* 2nd Level: Action Buttons for specific prompt variant */}
                                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 p-4 md:p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                                <div className="w-full mb-2">
                                                    <span className="text-xs font-bold text-slate-500 tracking-wider">點擊下方按鈕立刻複製 PROMPT：</span>
                                                </div>
                                                {activeCategoryGroup.items.map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => {
                                                            setActivePromptType(t.id);
                                                            handleCopyPrompt(t.id);
                                                        }}
                                                        className={`flex-1 py-4 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activePromptType === t.id ? 'bg-white text-purple-900 shadow-xl border-2 border-purple-300 scale-[1.02]' : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                                    >
                                                        {copySuccess && activePromptType === t.id ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 opacity-50" />}
                                                        {copySuccess && activePromptType === t.id ? '複製成功！' : t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="flex items-center justify-between mb-3 mt-4">
                                    <span className="text-purple-300 text-sm font-bold flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />產生結果預覽：{PROMPT_TYPES.find(t => t.id === activePromptType)?.label}
                                    </span>
                                </div>

                                <pre className="whitespace-pre-wrap text-[13px] text-teal-300 font-mono leading-relaxed bg-slate-950 border border-slate-800 p-5 md:p-6 rounded-2xl overflow-x-auto shadow-inner break-words">
                                    {getPromptText(activePromptType)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 rounded-full h-3 w-full max-w-md mx-auto overflow-hidden mb-2 border border-slate-700/50">
                        <div className="h-full bg-purple-500 transition-all duration-700 ease-out flex items-center justify-end pr-2" style={{ width: `${Math.max(5, progress)}%` }}>
                            {progress > 10 && <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-10">
                        已準備素材 {allUploaded} / 9
                    </p>

                    <div className="flex flex-col gap-10">
                        <div>
                            <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">A</span> 主要圖片</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <UploadCard label="iOS 主要圖片" desc="200×284 px" stateKey="mainImageIos" icon={ImageIcon} />
                                <UploadCard label="Android 主要圖片" desc="136×202 px" stateKey="mainImageAndroid" icon={ImageIcon} />
                                <UploadCard label="STORE 主要圖片" desc="198×278 px" stateKey="mainImageStore" icon={ImageIcon} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">B</span> 選單按鍵圖片</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <UploadCard label="九宮格 (OFF)" desc="384×450 px" stateKey="menuOffImage" icon={ImageIcon} />
                                    <UploadCard label="九宮格 (ON)" desc="384×450 px" stateKey="menuOnImage" icon={ImageIcon} />
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">C</span> 選單背景圖片</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <UploadCard label="選單背景" desc="1472×150 px" stateKey="menuBgImage" icon={ImageIcon} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">D</span> 密碼畫面</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <UploadCard label="密碼圖案" desc="120×120 px" stateKey="passcodeImage" icon={ImageIcon} />
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-black">E</span> 個人圖片</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <UploadCard label="預設大頭貼" desc="240×240 px" stateKey="profileImage" icon={ImageIcon} />
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5"><span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">F</span> 聊天底圖</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <UploadCard label="聊天室底圖" desc="最高 1482×1334 px" stateKey="chatBgImage" icon={ImageIcon} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <button
                            onClick={handleExport}
                            disabled={isExporting || allUploaded === 0}
                            className={`w-full max-w-sm mx-auto text-white py-5 rounded-[1.5rem] font-bold shadow-2xl transition-all btn-press flex items-center justify-center gap-3 text-xl 
                                ${allUploaded > 0 ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                        >
                            {isExporting ? <Loader className="animate-spin w-6 h-6" /> : <Download className="w-6 h-6" />}
                            {isExporting ? '打包中...' : '一鍵產生主題 ZIP'}
                        </button>
                    </div>

                    <div className="mt-8 text-left bg-slate-900/60 border border-slate-700 p-6 rounded-2xl">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                            <Info className="w-4 h-4 text-purple-400" /> 上線小提示
                        </h4>
                        <ul className="text-xs leading-relaxed text-slate-400 space-y-2 list-disc pl-5">
                            <li>您下載的 ZIP 中已包含分類好的資料夾與幾十張符合命名、尺寸規範的圖片。</li>
                            <li>由於 LINE 審核系統的限制，顏色設定 (包含對話框顏色、文字顏色等) 需要您直接在 LINE Creators Market 網頁上的<b>「檢視・變更色彩模式」</b>進行設定。</li>
                            <li>將 ZIP 解壓縮後，可以直接拖曳至 LINE 商店對應的類別上傳。</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeBuilder;
