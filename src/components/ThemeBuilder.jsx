import React, { useState, useRef } from 'react';
import { Upload, Download, Loader, Info, Palette, Image as ImageIcon, Wand2, ChevronDown, Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
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
        passcodeIosOffImage: null,
        passcodeIosOnImage: null,
        passcodeAndroidOffImage: null,
        passcodeAndroidOnImage: null,
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
        { id: 'menu_btn_off', category: 'B. 選單按鍵圖片', label: '選單按鍵 (未選取狀態)', size: '384×450' },
        { id: 'menu_btn_on', category: 'B. 選單按鍵圖片', label: '選單按鍵 (已選取狀態)', size: '384×450' },
        { id: 'menu_bg', category: 'C. 選單背景圖片', label: '選單背景 (極扁長)', size: '1472×150' },
        { id: 'passcode_ios_off', category: 'D. 密碼畫面圖片', label: '密碼圖案 iOS (未輸入狀態)', size: '240×240' },
        { id: 'passcode_ios_on', category: 'D. 密碼畫面圖片', label: '密碼圖案 iOS (已輸入狀態)', size: '240×240' },
        { id: 'passcode_android_off', category: 'D. 密碼畫面圖片', label: '密碼圖案 Android (未輸入狀態)', size: '232×232' },
        { id: 'passcode_android_on', category: 'D. 密碼畫面圖片', label: '密碼圖案 Android (已輸入狀態)', size: '232×232' },
        { id: 'profile', category: 'E. 個人圖片', label: '大頭貼 (正方形)', size: '240×240' },
        { id: 'chat_bg_ios', category: 'F. 聊天室背景圖片', label: '聊天底圖 (iOS)', size: '1482×1334' },
        { id: 'chat_bg_android', category: 'F. 聊天室背景圖片', label: '聊天底圖 (Android)', size: '1300×1300' },
    ];

    const getPromptText = (typeId) => {
        const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
        const typeInfo = PROMPT_TYPES.find(t => t.id === typeId) || PROMPT_TYPES[0];

        let isMenuGrid = typeId === 'menu_btn_off' || typeId === 'menu_btn_on';
        let isPasscodeGrid = typeId.startsWith('passcode');
        let isGrid = isMenuGrid || isPasscodeGrid;

        if (isGrid) {
            let stateDesc = '';
            let gridCols = isMenuGrid ? 3 : 2;
            let gridRows = isMenuGrid ? 3 : 2;
            let cellW = isMenuGrid ? 128 : (typeId.includes('android') ? 116 : 120);
            let cellH = isMenuGrid ? 150 : (typeId.includes('android') ? 116 : 120);
            let cellCount = isMenuGrid ? 9 : 4;
            let targetGroup = isMenuGrid ? '小選單圖示' : '密碼狀態圖示';

            if (isMenuGrid) {
                stateDesc = typeId === 'menu_btn_off'
                    ? '請使用低調、平淡或是單色草圖線條設計，代表未選取狀態。'
                    : '請使用色彩鮮明、生動可愛的特效設計，代表正被點擊活躍中。';
            } else {
                stateDesc = typeId.includes('_off')
                    ? '這代表「未輸入」的空狀態，顏色請設計較暗沉平淡，或是顯示角色最基本的樣子（例如：蛋殼、還沒被點亮的燈）。'
                    : '這代表「已輸入」的點亮狀態，顏色請鮮豔發光，也可以有情緒、破殼、或是開燈後的漸進變化。';
            }

            let extraGridRules = isMenuGrid
                ? '• 集中偏左下避讓（極重要）：每格內的圖示必須完全獨立且緊湊地集中在單一格子的「中央偏左下」。\n• 避開右上通知區域：在實際的 LINE 畫面上，每個選單的「右上角（距上空 49px、距右空 21px，尺寸 33×33 px）」會被系統強制覆蓋紅色的提醒數字。因此強烈要求：你的小圖示主要結構絕對要「避開右上角」，不能把格子畫滿！'
                : '• 集中置中：每個密碼圖案必須保持圓潤小巧，並且完全置中，四周保留安全的去背空間。可以透過動作或表情的變化增添密碼輸入時的樂趣。';

            return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${typeInfo.size.split('×')[0]} px，高度 ${typeInfo.size.split('×')[1]} px」。
• 不可變更：請在 AI 生圖工具中將解析度明確設定為 ${typeInfo.size.split('×')[0]}×${typeInfo.size.split('×')[1]}，不可使用其他尺寸。

請參考我上傳的圖片生圖：生成一張 ${typeInfo.size.split('×')[0]}×${typeInfo.size.split('×')[1]} px 的滿版大圖，包含 ${cellCount} 個不同的${targetGroup}。

畫面佈局設計（極重要參數）
• 版面規則：${gridCols} 欄 × ${gridRows} 列，每格 ${cellW}×${cellH} px，共 ${cellCount} 格。
• 隱形網格（超重點防呆）：所有 ${cellCount} 個圖示必須排列整齊，呈現嚴格的網格陣列。👉 絕對禁止畫出任何白色的網格線、實體十字分隔線、宮格框線或整體大外框！
• 嚴禁畫分隔線：請注意，去背系統會因為白線發生錯誤！你只要讓 ${cellCount} 個圖示各自散開排好就好，背景必須是「一整片完全乾淨、無任何干擾線條」的純連續綠色，絕對不要自作主張畫出各格子的邊界框線！
• 絕對禁止文字：👉 畫面中「絕對不准」出現任何數字、英文字母 (如 ON, OFF, 1, 2, 3)、國字或符號。不管是按鈕名字還是編號都禁止！只需要畫出圖案本身。
${extraGridRules}
• 安全邊界：單一個小圖示四周必須保留明確且足夠寬敞的綠色安全邊距（Padding），確保切割出來的各張圖完全不會互相切斷或黏合。

角色與風格設定
• ${targetGroup}設計（極重要）：這「${cellCount} 個不同的圖示」會在 APP 內被連續使用。👉 絕對禁止在每一格都畫一個複雜的「全身佈景」！圖示必須是簡單易懂的小符號、大頭或小道具。
• 參考圖轉換：請擷取我上傳原圖的配色與風格氛圍，將這些特徵完美融入到 ${cellCount} 個圖示中。
• 按鍵狀態要求：${stateDesc}
• 去背優化：請在每個物件邊緣加入「粗白色外框 (Sticker Style)」。背景統一為不可有任何漸層與雜訊的 #00FF00 (純綠色)。
• 視覺風格：${style.label}（${style.desc}）。`;
        }

        let extraGuide = '';
        if (typeInfo.category.startsWith('C')) {
            extraGuide = '\n• 橫向無縫拼接（極度重要）：這是一張 1472×150 px、極度扁長的「底部選單背景圖片」。因為這張圖會在 APP 內水平無縫重複，請務必將**左右兩端的圖案設計為自然無縫銜接（Seamless pattern）**。\n• 頂部留去背安全區：官方規定這張圖的下方為「主體繪製區（高度100~130px）」，而上方必須保留「20~50px 的去背區間」。因此強烈要求：**圖片上方至少 30px 請塗滿純綠色（#00FF00）作為預留的去背區**，所有的圖樣與裝飾必須貼緊下方邊緣設計。\n• 極簡設計：請設計能融入主題的低調地平線、雲朵或簡單線條，絕對不要在背景放過度複雜或巨大的角色，避免干擾浮在上面的按鈕。';
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
    const progress = Math.round((allUploaded / 12) * 100);

    const [showMenuGrid, setShowMenuGrid] = useState(true);
    const [showPasscodeGrid, setShowPasscodeGrid] = useState(true);

    const UploadCard = ({ label, desc, stateKey, icon: Icon }) => {
        const hasImage = !!assets[stateKey];
        const isMenuGrid = stateKey === 'menuOffImage' || stateKey === 'menuOnImage';
        const isPasscodeGrid = stateKey.startsWith('passcode');

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
                    <div className="w-full flex flex-col items-center justify-center animate-fade-in relative h-[120px]">
                        <img src={assets[stateKey]} className="max-h-[120px] w-full h-full rounded-xl shadow-lg object-contain relative z-0" alt={label} />

                        {isMenuGrid && showMenuGrid && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 384 450" preserveAspectRatio="xMidYMid meet">
                                <line x1="128" y1="0" x2="128" y2="450" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                <line x1="256" y1="0" x2="256" y2="450" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                <line x1="0" y1="150" x2="384" y2="150" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                <line x1="0" y1="300" x2="384" y2="300" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                            </svg>
                        )}

                        {isPasscodeGrid && showPasscodeGrid && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                viewBox={stateKey.toLowerCase().includes('android') ? "0 0 232 232" : "0 0 240 240"}
                                preserveAspectRatio="xMidYMid meet">
                                <line x1={stateKey.toLowerCase().includes('android') ? "116" : "120"} y1="0" x2={stateKey.toLowerCase().includes('android') ? "116" : "120"} y2={stateKey.toLowerCase().includes('android') ? "232" : "240"} stroke="rgba(255,50,50,0.8)" strokeWidth="3" strokeDasharray="6 3" />
                                <line x1="0" y1={stateKey.toLowerCase().includes('android') ? "116" : "120"} x2={stateKey.toLowerCase().includes('android') ? "232" : "240"} y2={stateKey.toLowerCase().includes('android') ? "116" : "120"} stroke="rgba(255,50,50,0.8)" strokeWidth="3" strokeDasharray="6 3" />
                            </svg>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl z-20 pointer-events-none">
                            <span className="text-white font-bold bg-slate-900/80 px-3 py-1 rounded-full text-xs">點擊更換圖片</span>
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
                                        { id: 'C', title: <span>C. 選單背景 <span className="text-[10px] font-normal opacity-70">(非必要)</span></span>, items: PROMPT_TYPES.filter(t => t.category.startsWith('C')) },
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

                                <pre className="whitespace-pre-wrap text-[13px] text-teal-300 font-mono leading-relaxed bg-slate-950 border border-slate-800 p-5 md:p-6 rounded-2xl overflow-y-auto max-h-[400px] shadow-inner break-words custom-scrollbar">
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
                        已準備素材 {allUploaded} / 12
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
                                <h4 className="flex justify-between items-center text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
                                    <span className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">B</span> 選單按鍵圖片
                                    </span>
                                </h4>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <UploadCard label="九宮格 (OFF)" desc="384×450 px" stateKey="menuOffImage" icon={ImageIcon} />
                                    <UploadCard label="九宮格 (ON)" desc="384×450 px" stateKey="menuOnImage" icon={ImageIcon} />
                                </div>
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-2">
                                        <span className="text-slate-500">每格約：</span>
                                        <span className="text-sky-400 font-mono font-bold">128 × 150 px</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowMenuGrid(!showMenuGrid); }}
                                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all border ${showMenuGrid ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {showMenuGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {showMenuGrid ? '隱藏切割線' : '顯示切割線'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
                                    <span className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">C</span>
                                    選單背景圖片 <span className="text-sm text-slate-500 font-normal tracking-wider ml-1">(非必要)</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <UploadCard label="選單背景" desc="1472×150 px" stateKey="menuBgImage" icon={ImageIcon} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-2">
                                <h4 className="flex justify-between items-center text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
                                    <span className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">D</span> 密碼畫面
                                    </span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <UploadCard label="iOS (OFF)" desc="240×240 px" stateKey="passcodeIosOffImage" icon={ImageIcon} />
                                    <UploadCard label="iOS (ON)" desc="240×240 px" stateKey="passcodeIosOnImage" icon={ImageIcon} />
                                    <UploadCard label="Android (OFF)" desc="232×232 px" stateKey="passcodeAndroidOffImage" icon={ImageIcon} />
                                    <UploadCard label="Android (ON)" desc="232×232 px" stateKey="passcodeAndroidOnImage" icon={ImageIcon} />
                                </div>
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-4">
                                        <span className="text-slate-500">iOS 切線約： <span className="text-sky-400 font-mono font-bold">120×120 px</span></span>
                                        <span className="text-slate-500">Android 切線約： <span className="text-sky-400 font-mono font-bold">116×116 px</span></span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowPasscodeGrid(!showPasscodeGrid); }}
                                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all border ${showPasscodeGrid ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {showPasscodeGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {showPasscodeGrid ? '隱藏切割線' : '顯示切割線'}
                                    </button>
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
