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
        passcodeImage: null,
        profileImage: null,
        bgImage: null
    });

    // Prompt States
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [themeColor, setThemeColor] = useState('溫柔的奶茶色系');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [activePromptType, setActivePromptType] = useState('ios');
    const [copySuccess, setCopySuccess] = useState(false);

    const getPromptText = (type) => {
        const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
        let dimensions = "";
        let title = "";

        if (type === 'ios') {
            title = "iOS 主要圖片 (ios_thumbnail.png)";
            dimensions = "200 × 284";
        } else if (type === 'android') {
            title = "Android 主要圖片 (android_thumbnail.png)";
            dimensions = "136 × 202";
        } else if (type === 'store') {
            title = "LINE STORE 主要圖片 (store_thumbnail.png)";
            dimensions = "198 × 278";
        }

        return `✅ ${title}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${dimensions.split(' × ')[0]} px，高度 ${dimensions.split(' × ')[1]} px」。
• 不可去背：背景必須填滿顏色，不可為透明。
• 居中構圖：主要角色必須完全集中在「畫面正中央」，四周保留大面積的安全邊距（避免在不同裝置上被微調或裁切）。

請參考我上傳的圖片生圖：
• 角色設定：請必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵，請放置在畫面最正中間。
• 視覺風格：${style.label}（${style.desc}）。
• 背景設定：以 ${themeColor} 為主的乾淨背景，四周邊緣請維持留白與簡單圖樣，絕對不要在畫面的邊角出現任何文字或複雜物件。`;
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
    const progress = Math.round((allUploaded / 8) * 100);

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
                        上傳這 8 張關鍵圖片，如果主要圖片只上傳一張，系統也會自動幫您作為其他平台的替代與壓縮。
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

                            <div className="bg-slate-950/80 p-6 rounded-[1.5rem] border border-white/5 shadow-inner">
                                <div className="font-bold text-lg text-white mb-4 flex items-center justify-between">
                                    <span>✅ 主要圖片 | Prompt 產生器 (點擊複製)</span>
                                </div>
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-slate-700/50 custom-scrollbar">
                                    {[
                                        { id: 'ios', label: 'iOS (200×284)' },
                                        { id: 'android', label: 'Android (136×202)' },
                                        { id: 'store', label: 'LINE STORE (198×278)' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setActivePromptType(t.id);
                                                handleCopyPrompt(t.id);
                                            }}
                                            className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${activePromptType === t.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white border'}`}
                                        >
                                            {copySuccess && activePromptType === t.id ? <CheckCircle className="w-4 h-4" /> : null}
                                            {copySuccess && activePromptType === t.id ? '已複製！' : t.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-4 mt-4">
                                    <span className="text-purple-300 text-sm font-bold flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />目前預覽與複製：{activePromptType === 'ios' ? 'iOS' : activePromptType === 'android' ? 'Android' : 'LINE STORE'}
                                    </span>
                                </div>

                                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed bg-slate-900 p-4 rounded-xl overflow-x-auto">
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
                        已準備素材 {allUploaded} / 8
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <UploadCard
                            label="iOS 主要圖片"
                            desc="200×284 px"
                            stateKey="mainImageIos"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="Android 主要圖片"
                            desc="136×202 px"
                            stateKey="mainImageAndroid"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="STORE 主要圖片"
                            desc="198×278 px"
                            stateKey="mainImageStore"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="共用背景圖"
                            desc="聊天室與主選單的背景"
                            stateKey="bgImage"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="選單按鈕 (未選取)"
                            desc="例如灰色的 Home Icon"
                            stateKey="menuOffImage"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="選單按鈕 (已選取)"
                            desc="例如彩色的 Home Icon"
                            stateKey="menuOnImage"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="密碼圖案"
                            desc="密碼畫面的小圖案"
                            stateKey="passcodeImage"
                            icon={ImageIcon}
                        />
                        <UploadCard
                            label="個人圖片"
                            desc="預設的大頭貼"
                            stateKey="profileImage"
                            icon={ImageIcon}
                        />
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
