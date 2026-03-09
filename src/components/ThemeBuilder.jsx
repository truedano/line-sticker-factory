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
        profileIosImage: null,
        profileAndroidImage: null,
        chatBgIosImage: null,
        chatBgAndroidImage: null
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
        { id: 'menu_bg', category: 'C. 選單背景圖片', label: '選單背景 (極扁長) (非必要)', size: '1472×150' },
        { id: 'passcode_ios_off', category: 'D. 密碼畫面圖片', label: '密碼圖案 iOS (未輸入狀態)', size: '240×240' },
        { id: 'passcode_ios_on', category: 'D. 密碼畫面圖片', label: '密碼圖案 iOS (已輸入狀態)', size: '240×240' },
        { id: 'passcode_android_off', category: 'D. 密碼畫面圖片', label: '密碼圖案 Android (未輸入狀態)', size: '232×232' },
        { id: 'passcode_android_on', category: 'D. 密碼畫面圖片', label: '密碼圖案 Android (已輸入狀態)', size: '232×232' },
        { id: 'profile_ios', category: 'E. 個人圖片', label: '大頭貼 iOS (1x2 網格)', size: '240×480' },
        { id: 'profile_android', category: 'E. 個人圖片', label: '大頭貼 Android (1x2 網格)', size: '247×494' },
        { id: 'chat_bg_ios', category: 'F. 聊天室背景圖片', label: '聊天室背景圖片 (iOS) (非必要)', size: '1482×1334' },
        { id: 'chat_bg_android', category: 'F. 聊天室背景圖片', label: '聊天室背景圖片 (Android) (非必要)', size: '1300×1300' },
    ];

    const getPromptText = (typeId) => {
        const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
        const typeInfo = PROMPT_TYPES.find(t => t.id === typeId) || PROMPT_TYPES[0];
        const currentThemeColor = themeColor || '溫和且具有整體感的色調';

        let isMenuGrid = typeId === 'menu_btn_off' || typeId === 'menu_btn_on';
        let isPasscodeGrid = typeId.startsWith('passcode');
        let isProfileGrid = typeId.startsWith('profile');
        let isGrid = isMenuGrid || isPasscodeGrid || isProfileGrid;

        if (isGrid) {
            let stateDesc = '';
            let gridCols = isMenuGrid ? 3 : (isProfileGrid ? 1 : 2);
            let gridRows = isMenuGrid ? 3 : 2;
            let cellW = isMenuGrid ? 128 : (typeId.includes('android') ? (isProfileGrid ? 247 : 116) : (isProfileGrid ? 240 : 120));
            let cellH = isMenuGrid ? 150 : (typeId.includes('android') ? (isProfileGrid ? 247 : 116) : (isProfileGrid ? 240 : 120));
            let cellCount = isMenuGrid ? 9 : (isProfileGrid ? 2 : 4);
            let targetGroup = isMenuGrid ? '小選單圖示' : (isProfileGrid ? '大頭貼圖示' : '密碼狀態圖示');

            if (isMenuGrid) {
                stateDesc = typeId === 'menu_btn_off'
                    ? '請使用低調、平淡或是單色草圖線條設計，代表未選取狀態。'
                    : '請使用色彩鮮明、生動可愛的特效設計，代表正被點擊活躍中。';
            } else if (isPasscodeGrid) {
                stateDesc = typeId.includes('_off')
                    ? '這代表「未輸入」的空狀態，顏色請設計較暗沉平淡，或是顯示角色最基本的樣子（例如：蛋殼、還沒被點亮的燈）。'
                    : '這代表「已輸入」的點亮狀態，顏色請鮮豔發光，也可以有情緒、破殼、或是開燈後的漸進變化。';
            } else {
                stateDesc = '請在 1 欄 × 2 列的垂直網格中填入大頭貼：\n• 上方格 (Slot 1)：個人代表圖片（建議為角色正臉或招牌動作）。\n• 下方格 (Slot 2)：群組代表圖片（建議為角色與小夥伴、或是另一個活潑的動作）。';
            }

            let extraGridRules = isMenuGrid
                ? '• 集中偏左下避讓（極重要）：每格內的圖示必須完全獨立且緊湊地集中在單一格子的「中央偏左下」。\n• 避開右上通知區域：在實際的 LINE 畫面上，每個選單的「右上角（距上空 49px、距環境空 21px，尺寸 33×33 px）」會被系統強制覆蓋紅色的提醒數字。因此強烈要求：你的小圖示主要結構絕對要「避開右上角」，不能把格子畫滿！'
                : (isPasscodeGrid
                    ? '• 集中置中：每個密碼圖案必須保持圓潤小巧，並且完全置中，四周保留安全的去背空間。可以透過動作或表情的變化增添密碼輸入時的樂趣。'
                    : '• 滿格或圓形預留：大頭貼在 LINE 內會被剪裁為「圓形」，請確保角色的臉部集中在每格的中央。畫面可以填滿格子，但主題務必置中以便裁切。');

            return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${typeInfo.size.split('×')[0]} px，高度 ${typeInfo.size.split('×')[1]} px」。
• 不可變更：請在 AI 生圖工具中將解析度明確設定為 ${typeInfo.size.split('×')[0]}×${typeInfo.size.split('×')[1]}，不可使用其他尺寸。

請參考我上傳的圖片生圖：生成一張 ${typeInfo.size.split('×')[0]}×${typeInfo.size.split('×')[1]} px 的滿版大圖，包含 ${cellCount} 個不同的${targetGroup}。

畫面佈局設計（極重要參數）
• 版面規則：${gridCols} 欄 × ${gridRows} 列，每格 ${cellW}×${cellH} px，共 ${cellCount} 格。
• 隱形網格（超重點防呆）：所有 ${cellCount} 個圖示必須排列整齊，呈現嚴格的網格陣列。👉 絕對禁止畫出任何白色的網格線、實體十字分隔線、宮格框線或整體大外框！
• 嚴禁畫分隔線：請注意，去背系統會因為白線發生錯誤！你只要讓 ${cellCount} 個圖示各自散開排好就好，背景必須是${isProfileGrid ? '「一整片完全乾淨、無任何干擾線條」的連續背景色' : '「一整片完全乾淨、無任何干擾線條」的純連續綠色'}，絕對不要自作主張畫出各格子的邊界框線！${isProfileGrid ? '' : '\n• 自動去背功能：系統在切割完成後將「自動移除純綠色背景」，請放心產生。'}
• 絕對禁止文字：👉 畫面中「絕對不准」出現任何數字、英文字母 (如 ON, OFF, 1, 2, 3)、國字或符號。不管是按鈕名字還是編號都禁止！只需要畫出圖案本身。
${extraGridRules}
• 安全邊界：單一個小圖示四周必須保留明確且足夠寬敞的${isProfileGrid ? '背景' : '綠色'}安全邊距（Padding），確保切割出來的各張圖完全不會互相切斷或黏合。

角色與風格設定
• ${targetGroup}設計（極重要）：這「${cellCount} 個不同的圖示」會在 APP 內被連續使用。👉 絕對禁止在每一格都畫一個複雜的「全身佈景」！圖示必須是簡單易懂的小符號、大頭或小道具。
• 參考圖轉換：請擷取我上傳原圖的配色與風格氛圍，將這些特徵完美融入到 ${cellCount} 個圖示中。
• 按鍵狀態要求：${stateDesc}
• 背景設定：${isProfileGrid ? `這組大頭貼「不需要去背」，請直接填滿背景。背景顏色請優先使用「${currentThemeColor}」，或者由你根據角色配色自動適配一組和諧、粉嫩且具有質感的背景色。` : '去背優化：請在每個物件邊緣加入「粗白色外框 (Sticker Style)」。背景統一為不可有任何漸層與雜訊的 #00FF00 (純綠色)。'}
• 視覺風格：${style.label}（${style.desc}）。`;
        }

        let extraGuide = '';
        if (typeInfo.category.startsWith('C')) {
            extraGuide = '\n• 橫向無縫拼接（極度重要）：這是一張 1472×150 px、極度扁長的「底部選單背景圖片」。因為這張圖會在 APP 內水平無縫重複，請務必將**左右兩端的圖案設計為自然無縫銜接（Seamless pattern）**。\n• 頂部留去背安全區：官方規定這張圖的下方為「主體繪製區（高度100~130px）」，而上方必須保留「20~50px 的去背區間」。因此強烈要求：**圖片上方至少 30px 請塗滿純綠色（#00FF00）作為預留的去背區**，所有的圖樣與裝飾必須貼緊下方邊緣設計。\n• 極簡設計：請設計能融入主題的低調地平線、雲朵或簡單線條，絕對不要在背景放過度複雜或巨大的角色，避免干擾浮在上面的按鈕。';
        } else if (typeInfo.category.startsWith('F')) {
            const isIos = typeId.includes('ios');
            extraGuide = `\n• 聊天室背景圖片設定（${isIos ? 'iOS' : 'Android'}）：這是一張非必要的背景裝飾圖。
• 淡化處理（極重要）：**必須將人物與背景進行淡化處理**。請使用低飽和度（Desaturated）、高亮度（High Brightness）、低對比度（Low Contrast）的色彩。
• 視覺呈現：建議呈現如「水彩渲染」、「磨砂玻璃感」或「輕透半透明感」的視覺效果，確保聊天文字（黑色或白色）在背景上清晰易讀。
• 避免畫面斷層：請務必讓背景底色與「${currentThemeColor}」完美融合，或是將背景設計為純淨的 ${currentThemeColor} 滿版色彩。
• 構圖與位置（官方風格推薦）：${isIos ? '建議將主要角色放在畫面的「最下方邊緣」，營造從輸入欄位「向上探頭」的效果。' : '建議將角色置於畫面的「下半部中央」，並避開最底部的功能鍵區。'}
• 閱讀性優先：請保持畫面中央區域（對話流動區）完全乾淨清爽，絕對不要有複雜圖樣。`;
        }

        return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${typeInfo.size.split('×')[0]} px，高度 ${typeInfo.size.split('×')[1]} px」。
• 不可去背：背景必須填滿顏色，不可為透明。
• 佈局構圖：四周務必保留大面積的安全留白（避免在不同裝置上被微調或裁切）。

請參考我上傳的圖片生圖：
• 角色設定：請必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵，請放置在畫面最適當的地方。${extraGuide}
• 視覺風格：${style.label}（${style.desc}）。
• 背景設定：以 ${currentThemeColor} 為主的乾淨背景，四周維持留白與簡單圖樣，絕對不要在畫面出現任何干擾文字。`;
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
    const progress = Math.round((allUploaded / 14) * 100);

    const [showMenuGrid, setShowMenuGrid] = useState(true);
    const [showPasscodeGrid, setShowPasscodeGrid] = useState(true);
    const [showProfileGrid, setShowProfileGrid] = useState(true);

    const UploadCard = ({ label, desc, stateKey, icon: Icon }) => {
        const hasImage = !!assets[stateKey];
        const isMenuGrid = stateKey === 'menuOffImage' || stateKey === 'menuOnImage';
        const isPasscodeGrid = stateKey.startsWith('passcode');
        const isProfileGrid = stateKey.startsWith('profile');

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

                        {isProfileGrid && showProfileGrid && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                viewBox={stateKey.toLowerCase().includes('android') ? "0 0 247 494" : "0 0 240 480"}
                                preserveAspectRatio="xMidYMid meet">
                                <line x1="0" y1={stateKey.toLowerCase().includes('android') ? "247" : "240"} x2={stateKey.toLowerCase().includes('android') ? "247" : "240"} y2={stateKey.toLowerCase().includes('android') ? "247" : "240"} stroke="rgba(255,50,50,0.8)" strokeWidth="5" strokeDasharray="10 5" />
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
        <div className="relative animate-fade-in pb-10 space-y-8">
            {/* 標題與簡介區 */}
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden group border-t-4 border-t-purple-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                            <Palette className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">LINE 主題懶人包產生器</h2>
                    </div>
                    <p className="text-slate-400 font-medium">
                        上傳以下 A 到 F 共 9 張關鍵圖片，讓系統自動為您打包成完整的 LINE 主題 ZIP 檔。
                    </p>
                </div>
            </div>

            {/* AI 提示詞大師 */}
            <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Wand2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="font-bold text-2xl text-white">主題 AI 提示詞大師</h3>
                    </div>
                    <button onClick={() => setShowPromptGuide(!showPromptGuide)} className="bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-300 transition-all flex items-center gap-2 border border-slate-700">
                        {showPromptGuide ? "隱藏面板" : "展開面板"}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showPromptGuide ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className={`transition-all duration-700 ${showPromptGuide ? 'opacity-100 max-h-[1400px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <span className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
                                1. 選擇視覺風格
                            </span>
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

                        <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <span className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
                                2. 設定主題色系
                            </span>
                            <input
                                type="text"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                placeholder="例如：溫柔的奶茶色系、粉嫩馬卡龍色系"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-950/80 p-6 md:p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
                        <div className="font-bold text-lg text-white mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                <Palette className="w-4 h-4" />
                            </div>
                            <span>3. 選擇要輸出的素材分類</span>
                        </div>

                        {/* 1st Level: Category Tabs (A~F) */}
                        {(() => {
                            const PROMPT_CATEGORIES = [
                                { id: 'A', title: 'A. 主要圖片', items: PROMPT_TYPES.filter(t => t.category.startsWith('A')) },
                                { id: 'B', title: 'B. 選單按鍵', items: PROMPT_TYPES.filter(t => t.category.startsWith('B')) },
                                { id: 'C', title: <span>C. 選單背景 <span className="text-[10px] font-normal opacity-70">(非必要)</span></span>, items: PROMPT_TYPES.filter(t => t.category.startsWith('C')) },
                                { id: 'D', title: 'D. 密碼畫面', items: PROMPT_TYPES.filter(t => t.category.startsWith('D')) },
                                { id: 'E', title: 'E. 個人圖片', items: PROMPT_TYPES.filter(t => t.category.startsWith('E')) },
                                { id: 'F', title: 'F. 聊天室背景圖片', items: PROMPT_TYPES.filter(t => t.category.startsWith('F')) }
                            ];
                            const activeCategoryGroup = PROMPT_CATEGORIES.find(c => c.items.some(i => i.id === activePromptType)) || PROMPT_CATEGORIES[0];

                            return (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
                                        {PROMPT_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActivePromptType(cat.items[0].id)}
                                                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${activeCategoryGroup.id === cat.id ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                                            >
                                                {cat.title}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                        <div className="w-full mb-2">
                                            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">點擊複方按鈕直接複製 PROMPT：</span>
                                        </div>
                                        {activeCategoryGroup.items.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setActivePromptType(t.id);
                                                    handleCopyPrompt(t.id);
                                                }}
                                                className={`flex-1 py-4 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${activePromptType === t.id ? 'bg-white text-purple-900 border-purple-300 scale-[1.02] shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
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

            {/* 素材上傳區 */}
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="bg-slate-900/60 rounded-full h-3 w-full max-w-md mx-auto overflow-hidden mb-2 border border-slate-700/50">
                        <div className="h-full bg-purple-500 transition-all duration-700 ease-out flex items-center justify-end pr-2 shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${Math.max(5, progress)}%` }}>
                            {progress > 10 && <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse"></div>}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase mb-12">
                        已準備素材 {allUploaded} / 14
                    </p>
                </div>

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
                                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">B</span> 選單按鍵圖片 <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">自動去背</span>
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
                                    <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-black">D</span> 密碼畫面 <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/30">自動去背</span>
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
                            <h4 className="flex justify-between items-center text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-black">E</span> 個人圖片
                                </span>
                            </h4>
                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <UploadCard label="iOS 1x2" desc="240×480 px" stateKey="profileIosImage" icon={ImageIcon} />
                                <UploadCard label="Android 1x2" desc="247×494 px" stateKey="profileAndroidImage" icon={ImageIcon} />
                            </div>
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-xs flex items-center gap-4">
                                    <span className="text-slate-500">版面：<span className="text-sky-400 font-mono font-bold">1欄 x 2列 (上下排列)</span></span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowProfileGrid(!showProfileGrid); }}
                                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all border ${showProfileGrid ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {showProfileGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    {showProfileGrid ? '隱藏切割線' : '顯示切割線'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-3 text-lg font-bold text-white mb-6 pb-3 border-b border-white/5 tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">F</span> 聊天室背景圖片
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <UploadCard label="iOS 聊天室背景圖片" desc="1482×1334 px" stateKey="chatBgIosImage" icon={ImageIcon} />
                                <UploadCard label="Android 聊天室背景圖片" desc="1300×1300 px" stateKey="chatBgAndroidImage" icon={ImageIcon} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center">
                    <button
                        onClick={handleExport}
                        disabled={isExporting || allUploaded === 0}
                        className={`btn-premium text-white px-10 py-5 rounded-[1.5rem] font-bold shadow-2xl transition-all btn-press flex items-center justify-center gap-4 text-xl active:scale-95 group min-w-[320px] 
                                ${allUploaded > 0 ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                    >
                        {isExporting ? <Loader className="animate-spin w-6 h-6" /> : <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                        <div className="flex flex-col items-center">
                            <span>{isExporting ? '打包中...' : '一鍵產生主題 ZIP'}</span>
                            <span className="text-[10px] font-normal opacity-80 -mt-0.5">自動切割 ➔ 重新命名 ➔ 打包下載</span>
                        </div>
                    </button>

                    <div className="mt-12 text-left bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-[2rem] w-full max-w-3xl">
                        <h4 className="flex items-center gap-2 text-base font-bold text-slate-200 mb-4">
                            <Info className="w-5 h-5 text-purple-400" /> 上線小提示
                        </h4>
                        <ul className="text-sm leading-relaxed text-slate-400 space-y-3 list-none">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                <span>您下載的 ZIP 中已包含分類好的資料夾與符合規格的圖片。</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                <span>顏色設定需在 LINE Creators Market 網頁上的<b>「檢視・變更色彩模式」</b>手動調整。</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                <span>將 ZIP 解壓縮後，即可直接按類別拖曳上傳。</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeBuilder;
