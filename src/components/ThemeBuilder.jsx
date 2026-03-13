import React, { useState, useEffect } from 'react';
import { Upload, Download, Loader, Info, Palette, Image as ImageIcon, Wand2, ChevronDown, Copy, CheckCircle, Eye, EyeOff, Share2, Check } from 'lucide-react';
import useThemePack from '../hooks/useThemePack';
import { PROMPT_STYLES } from '../data';
import { removeGeminiWatermark } from '../utils/removeGeminiWatermark';
import { generateThemePrompt } from '../utils/promptUtils';

const ThemeBuilder = ({ productType, autoRemoveGeminiWatermark, setAutoRemoveGeminiWatermark, setIsGlobalProcessing }) => {
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

    const [isFolderLoading, setIsFolderLoading] = useState(false);
    const [folderLoadSuccess, setFolderLoadSuccess] = useState(false);

    // Prompt States
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [themeColor, setThemeColor] = useState(() => {
        return localStorage.getItem('lsf_theme_color') || '日系清爽薄荷綠';
    });
    const [isCustomThemeColor, setIsCustomThemeColor] = useState(() => {
        return localStorage.getItem('lsf_is_custom_color') === 'true';
    });
    const [activeStyle, setActiveStyle] = useState(() => {
        return localStorage.getItem('lsf_active_style') || 'qversion';
    });
    const [chatBgCharPos, setChatBgCharPos] = useState(() => {
        return localStorage.getItem('lsf_chat_bg_char_pos') || 'default';
    });

    useEffect(() => {
        localStorage.setItem('lsf_theme_color', themeColor);
    }, [themeColor]);

    useEffect(() => {
        localStorage.setItem('lsf_is_custom_color', isCustomThemeColor);
    }, [isCustomThemeColor]);

    useEffect(() => {
        localStorage.setItem('lsf_active_style', activeStyle);
    }, [activeStyle]);

    useEffect(() => {
        localStorage.setItem('lsf_chat_bg_char_pos', chatBgCharPos);
    }, [chatBgCharPos]);
    const [activePromptType, setActivePromptType] = useState('main_ios');
    const [copySuccess, setCopySuccess] = useState(false);
    const [maxSizeBytes, setMaxSizeBytes] = useState(950000); // Default 950KB

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
        return generateThemePrompt({
            activeStyle,
            themeColor,
            typeId,
            chatBgCharPos
        });
    };

    const handleCopyPrompt = (type) => {
        navigator.clipboard.writeText(getPromptText(type)).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const processImageFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = async () => {
                    let finalUrl = ev.target.result;
                    if (autoRemoveGeminiWatermark) {
                        try {
                            const processed = await removeGeminiWatermark(img);
                            finalUrl = processed.src;
                        } catch (err) { console.error(err); }
                    }
                    resolve(finalUrl);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const processBatchFiles = async (files) => {
        if (!files || files.length === 0) return;

        const fileNameMapping = {
            'a.png': ['mainImageIos', 'mainImageAndroid', 'mainImageStore'],
            'b_off.png': ['menuOffImage'],
            'b_on.png': ['menuOnImage'],
            'c.png': ['menuBgImage'],
            'd_off.png': ['passcodeIosOffImage', 'passcodeAndroidOffImage'],
            'd_on.png': ['passcodeIosOnImage', 'passcodeAndroidOnImage'],
            'e.png': ['profileIosImage', 'profileAndroidImage'],
            'f.png': ['chatBgIosImage', 'chatBgAndroidImage']
        };

        setIsGlobalProcessing(true);
        let updatedAssets = { ...assets };

        for (const file of files) {
            const name = file.name.toLowerCase();
            const keys = fileNameMapping[name];
            if (keys) {
                const url = await processImageFile(file);
                keys.forEach(key => {
                    updatedAssets[key] = url;
                });
            }
        }

        setAssets(updatedAssets);
        setIsGlobalProcessing(false);
    };



    const handleDirectoryPick = async () => {
        if (!('showDirectoryPicker' in window)) {
            alert('您的瀏覽器不支援現代化資料夾選取 API，請改用「選擇多個圖片」或拖拉資料夾。');
            return;
        }
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
            setIsFolderLoading(true);
            setIsGlobalProcessing(true);
            const files = [];
            
            const scanDirectory = async (handle) => {
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        const file = await entry.getFile();
                        if (file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp)$/i)) {
                            files.push(file);
                        }
                    } else if (entry.kind === 'directory') {
                        await scanDirectory(entry);
                    }
                }
            };
            
            await scanDirectory(dirHandle);
            
            if (files.length > 0) {
                await processBatchFiles(files);
                setFolderLoadSuccess(true);
                setTimeout(() => setFolderLoadSuccess(false), 2000);
            } else {
                alert('在此資料夾內沒有找到支援的圖片。');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting directory:', err);
                alert('載入資料夾時發生錯誤，請重試。');
            }
        } finally {
            setIsFolderLoading(false);
            setIsGlobalProcessing(false);
        }
    };

    const handleUpload = async (e, stateKey) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsGlobalProcessing(true);
        const finalUrl = await processImageFile(file);
        setAssets(prev => ({ ...prev, [stateKey]: finalUrl }));
        setIsGlobalProcessing(false);
    };

    const handleExport = async () => {
        await generateThemeZip(assets, maxSizeBytes);
    };

    if (productType !== 'theme') return null;

    const allUploaded = Object.values(assets).filter(Boolean).length;
    const progress = Math.round((allUploaded / 14) * 100);

    const [showMenuGrid, setShowMenuGrid] = useState(true);
    const [showPasscodeGrid, setShowPasscodeGrid] = useState(true);
    const [showProfileGrid, setShowProfileGrid] = useState(true);

    const MENU_LABELS = [
        "主頁", "聊天", "VOOM",
        "購物", "通話", "新聞",
        "TODAY", "錢包", "MINI"
    ];

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
                            <div className="absolute inset-0 w-full h-full pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-60">
                                {MENU_LABELS.map((label, idx) => (
                                    <div key={idx} className="border border-red-500/30 flex items-center justify-center">
                                        <span className="text-[10px] text-red-500 bg-black/50 px-1 rounded font-bold shadow-sm">{label}</span>
                                    </div>
                                ))}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 450" preserveAspectRatio="xMidYMid meet">
                                    <line x1="128" y1="0" x2="128" y2="450" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                    <line x1="256" y1="0" x2="256" y2="450" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                    <line x1="0" y1="150" x2="384" y2="150" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                    <line x1="0" y1="300" x2="384" y2="300" stroke="rgba(255,50,50,0.8)" strokeWidth="4" strokeDasharray="8 4" />
                                </svg>
                            </div>
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

                        <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors flex flex-col justify-start">
                            <span className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
                                2. 設定主題色系
                            </span>
                            <div className="flex gap-2 flex-wrap mb-4">
                                {['日系清爽薄荷綠', '粉嫩馬卡龍色系', '沉穩莫蘭迪色系', '活潑糖果色系'].map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => { setThemeColor(preset); setIsCustomThemeColor(false); }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${!isCustomThemeColor && themeColor === preset ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setIsCustomThemeColor(true)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isCustomThemeColor ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                >
                                    自訂
                                </button>
                            </div>
                            <div className={`transition-all duration-300 overflow-hidden ${isCustomThemeColor ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <input
                                    type="text"
                                    value={isCustomThemeColor ? themeColor : ''}
                                    onChange={(e) => {
                                        setThemeColor(e.target.value);
                                    }}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                    placeholder="輸入自訂主題色系 (例如: 漸層霓虹色系)"
                                />
                            </div>
                        </div>

                        {activePromptType.startsWith('chat_bg') && (
                            <div className="p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/50 hover:border-slate-600 transition-colors flex flex-col justify-start md:col-span-2">
                                <span className="block text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">
                                    3. 聊天室背景角色專屬設定
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { id: 'default', label: '預設 (底部或居中)' },
                                        { id: 'center', label: '畫面正中央' },
                                        { id: 'bottom-right', label: '右下角點綴' },
                                        { id: 'full', label: '大滿版展現' },
                                        { id: 'none', label: '無角色 (純背景)' }
                                    ].map(pos => (
                                        <button
                                            key={pos.id}
                                            onClick={() => setChatBgCharPos(pos.id)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${chatBgCharPos === pos.id ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                    <div className="flex flex-col md:flex-row items-stretch justify-center mb-12 gap-6 px-4">
                        {/* 一鍵載入按鈕 */}
                        <div 
                            onClick={!isFolderLoading ? handleDirectoryPick : undefined}
                            className={`flex items-center gap-4 bg-slate-900/60 p-5 rounded-[1.5rem] border transition-all relative group shadow-lg 
                                ${isFolderLoading 
                                    ? 'border-purple-500/50 shadow-purple-500/20 cursor-wait' 
                                    : folderLoadSuccess
                                        ? 'border-green-500/50 bg-green-900/20 shadow-green-500/20'
                                        : 'border-cyan-500/20 hover:border-cyan-500/40 hover:bg-slate-800/80 cursor-pointer shadow-cyan-500/5'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                ${isFolderLoading 
                                    ? 'bg-purple-500/20 text-purple-400' 
                                    : folderLoadSuccess
                                        ? 'bg-green-500/20 text-green-400 scale-110'
                                        : 'bg-cyan-500/10 text-cyan-400 group-hover:scale-110'}`}>
                                {isFolderLoading ? (
                                    <Loader className="w-6 h-6 animate-spin" />
                                ) : folderLoadSuccess ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <Upload className="w-6 h-6" />
                                )}
                            </div>
                            <div className="flex flex-col text-left min-w-[140px]">
                                <span className={`text-sm font-bold flex items-center gap-2 transition-colors duration-300
                                    ${folderLoadSuccess ? 'text-green-400' : 'text-white'}`}>
                                    {isFolderLoading ? '正在掃描檔案...' : folderLoadSuccess ? '載入完畢！' : '一鍵載入圖片目錄'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {isFolderLoading 
                                        ? '這可能需要幾秒鐘' 
                                        : folderLoadSuccess
                                            ? '圖片已成功載入'
                                            : '自動分配 A, B, C, D, E, F 等檔案'}
                                </span>
                            </div>
                        </div>

                        {/* 去浮水印開關 */}
                        <div className="flex items-center gap-4 bg-slate-900/60 p-5 rounded-[1.5rem] border border-white/5 shadow-lg">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                    自動去除 Gemini 浮水印
                                </span>
                                <span className="text-[10px] text-slate-500">上傳時自動移除右下角標誌</span>
                            </div>
                            <button
                                onClick={() => setAutoRemoveGeminiWatermark(!autoRemoveGeminiWatermark)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRemoveGeminiWatermark ? 'bg-purple-600' : 'bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRemoveGeminiWatermark ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* 進度條 */}
                        <div className="flex-1 max-w-xs flex flex-col justify-center bg-slate-900/40 p-5 rounded-[1.5rem] border border-white/5">
                            <div className="bg-slate-950/60 rounded-full h-2.5 w-full overflow-hidden mb-2 border border-slate-700/50">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.3)]" style={{ width: `${Math.max(5, progress)}%` }}>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase text-center">
                                已準備素材 {allUploaded} / 14
                            </p>
                        </div>
                    </div>
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
                                選單背景圖片 <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">支援自動去背</span><span className="text-sm text-slate-500 font-normal tracking-wider ml-1">(非必要)</span>
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
                    <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-md">
                        <div className="w-full bg-slate-900/60 p-6 rounded-[1.5rem] border border-white/5">
                            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Info className="w-4 h-4 text-purple-400" /> 目標檔案大小限制 (防止超過 1MB)
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: '標準 (950KB)', value: 950000 },
                                    { label: '較小 (800KB)', value: 800000 },
                                    { label: '極小 (600KB)', value: 600000 }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMaxSizeBytes(opt.value)}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${maxSizeBytes === opt.value ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-3 text-[10px] text-slate-500 leading-tight">
                                ※ 若上傳的背景圖細節過多導致壓縮失敗，請嘗試選擇「較小」或「極小」。系統將透過降低噪點來縮減容量。
                            </p>
                        </div>

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
                    </div>

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
