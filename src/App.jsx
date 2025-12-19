import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Upload, Scissors, Download, Loader, Eraser, CheckCircle,
    MessageCircle, Hash, Moon, Settings, ChevronDown, Copy,
    Wand2, Star, Tag, Crop, Info
} from 'lucide-react';

const PROMPT_THEMES = {
    daily: { label: '日常用語', texts: '早安、晚安、謝謝、不客氣、對不起、沒問題、好的、收到、拜託、辛苦了、OK、等等', emotions: '喜、怒、哀、樂、驚訝、無語、放空、大哭', actions: '謝謝配雙手合十、OK比手勢、早安揮手、發呆流口水' },
    greet: { label: '打招呼', texts: 'Hello、Hi、早安、午安、晚安、你好、吃飽沒、好久不見、初次見面、歡迎、有空嗎、掰掰', emotions: '熱情、微笑、眨眼、期待、害羞、友善', actions: '揮手致意、90度鞠躬、從角落探頭、比手指愛心、拿著大聲公' },
    holiday: { label: '節日祝福', texts: '新年快樂、恭喜發財、生日快樂、聖誕快樂、情人節快樂、中秋快樂、母親節快樂、父親節快樂、端午安康、萬聖節快樂、Happy New Year、紅包拿來', emotions: '喜氣洋洋、興奮、溫馨、大笑、感動、派對臉', actions: '雙手拿紅包、點燃鞭炮、捧著生日蛋糕、送出禮物盒、舉杯慶祝' },
    response: { label: '回應篇', texts: '真的假的、笑死、確?、好喔、??、!!!、無言、傻眼、厲害、佩服、+1、路過', emotions: '震驚到變形、翻白眼、懷疑眼神、豎起大拇指、敷衍假笑', actions: '比讚、雙手打叉(NG)、單手扶額頭、吃瓜看戲、比出 OK 手勢' },
    work: { label: '上班族', texts: '收到、馬上改、開會中、加班、準時下班、心累、報告長官、辛苦了、求放過、薪水呢、不想上班、加油', emotions: '眼神死、崩潰大哭、職業假笑、黑眼圈深重、燃燒鬥志', actions: '瘋狂敲鍵盤、吊點滴喝咖啡、趴在桌上靈魂出竅、標準敬禮、舉白旗投降' },
    couple: { label: '老公老婆', texts: '愛你、想你、抱抱、親親、寶貝、老公、老婆、在幹嘛、快回家、買給我、原諒我、啾咪', emotions: '害羞臉紅、色瞇瞇、撒嬌水汪汪大眼、生氣鼓臉、陶醉', actions: '抱緊處理、發射飛吻、跪算盤謝罪、摸頭殺、壁咚' },
    meme: { label: '迷因搞笑', texts: '是在哈囉、我就爛、阿姨我不想努力了、像極了愛情、可憐哪、嚇到吃手手、沒在怕、本斥但大、真香、歸剛欸、突破盲腸、怕', emotions: '極度嘲諷臉、堅定眼神、猥瑣笑容、崩壞顏藝、鄙視眼神', actions: '攤手無奈、指指點點、戴墨鏡耍帥、拿著鹹魚攻擊、謎之舞步' }
};

const PROMPT_STYLES = {
    qversion: { label: '通用 Q 版', desc: '可愛、活潑、2D平面' },
    realistic: { label: '寫實風格', desc: '細緻、擬真、高質感' },
    threed: { label: '3D 立體', desc: 'Blender風格、圓潤、光影' },
    sketch: { label: '手繪塗鴉', desc: '線條感、童趣、蠟筆' },
    pixel: { label: '像素風', desc: '復古遊戲、8-bit' },
    anime: { label: '日系動漫', desc: '大眼、賽璐璐上色' }
};

const App = () => {
    const [originalSheet, setOriginalSheet] = useState(null);
    const [slicedPieces, setSlicedPieces] = useState([]);
    const [finalImages, setFinalImages] = useState([]);
    const [mainId, setMainId] = useState(null);
    const [tabId, setTabId] = useState(null);
    const [startNumber, setStartNumber] = useState(1);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [showPromptGuide, setShowPromptGuide] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [activeTheme, setActiveTheme] = useState('daily');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [autoRemoveBg, setAutoRemoveBg] = useState(true);
    const [targetColorHex, setTargetColorHex] = useState("#00ff00");
    const [colorTolerance, setColorTolerance] = useState(30);
    const [smoothness, setSmoothness] = useState(2);
    const [despill, setDespill] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1.00);
    const workerRef = useRef(null);

    useEffect(() => {
        // In Vite, assets in public folder are served at root path
        workerRef.current = new Worker('./worker.js');
        workerRef.current.onmessage = (e) => {
            const { id, processedImageData } = e.data;

            const canvas = document.createElement('canvas');
            canvas.width = processedImageData.width;
            canvas.height = processedImageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(processedImageData, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');

            setFinalImages(prev => {
                const exists = prev.find(img => img.id === id);
                if (exists) return prev;
                return [...prev, { id, dataUrl, rawSource: null }].sort((a, b) => a.id - b.id);
            });
            setProcessedCount(prev => prev + 1);
        };
        return () => { workerRef.current.terminate(); }
    }, []);

    useEffect(() => {
        if (processedCount === 12 && isProcessing) {
            setIsProcessing(false);
            setMainId(1);
            setTabId(1);
            setStep(3);
        }
    }, [processedCount, isProcessing]);

    useEffect(() => {
        applyPreset('green');
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                setOriginalSheet(img);
                setSlicedPieces([]);
                setFinalImages([]);
                setStep(1);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const getPromptText = () => {
        const theme = PROMPT_THEMES[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        return `✅ 12 格角色貼圖集｜Prompt 建議\n請參考上傳圖片中的角色，生成 一張包含 12 個不同動作的角色貼圖集，也不要使用任何emoji表情符號。\n\n[角色與風格設定]\n角色一致性：必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。\n構圖風格：畫面僅包含「角色 + 文字」，不包含任何場景背景。\n畫風設定：【${style.desc}】。\n貼紙風格（去背友善）：角色與文字外圍皆需加入 粗白色外框（Sticker Style）。背景統一為 #00FF00（純綠色），不可有雜點。\n\n[畫面佈局與尺寸規格]\n整體為 4 × 3 佈局，共 12 張貼圖。總尺寸：1480 × 960 px。\n每張小圖約 370 × 320 px（自動等比縮放填滿排列）。每張貼圖四周預留約 0.2 cm Padding，避免畫面互相黏住。\n鏡頭多樣化：全身 + 半身混合，必須包含正面、側面、俯角等不同視角。\n\n[文字設計]\n語言：【台灣繁體中文】\n文字內容：【${theme.texts}】\n字型風格：【可愛 Q 版字型，顏色鮮豔、易讀，多色彩混合，絕對禁止使用任何綠色（包含深綠、淺綠、螢光綠、藍綠）與黑色，因為會導致去背錯誤。請改用紅、藍、紫、橘、黃等高對比色彩。】\n排版：文字大小約佔單張貼圖 1/3，文字可適度壓在衣服邊角等非重要區域，不能遮臉，也不要使用任何emoji表情符號。\n\n[表情與動作設計]\n表情必須明顯、誇張、情緒豐富：【${theme.emotions}】\n角色動作需與文字情境一致：例如【${theme.actions}】\n12 格皆須為 不同動作與不同表情。\n\n[輸出格式]\n一張大圖，內含 4 × 3 的 12 張貼圖。背景必須為 純綠色 #00FF00。每格角色 + 文字均附上粗白邊。`;
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(getPromptText()).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const performSlice = () => {
        if (!originalSheet) return;
        setIsProcessing(true);
        setTimeout(() => {
            const pieces = [];
            const cols = 4;
            const rows = 3;
            const pieceW = originalSheet.width / cols;
            const pieceH = originalSheet.height / rows;
            const canvas = document.createElement('canvas');
            canvas.width = originalSheet.width;
            canvas.height = originalSheet.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(originalSheet, 0, 0);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const pCanvas = document.createElement('canvas');
                    pCanvas.width = pieceW;
                    pCanvas.height = pieceH;
                    const pCtx = pCanvas.getContext('2d');
                    pCtx.drawImage(canvas, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
                    pieces.push({
                        id: r * cols + c + 1,
                        rawCanvas: pCanvas,
                        previewUrl: pCanvas.toDataURL('image/png')
                    });
                }
            }
            setSlicedPieces(pieces);
            setStep(2);
            setIsProcessing(false);
        }, 50);
    };

    const performProcessing = async () => {
        if (!autoRemoveBg) {
            setFinalImages(slicedPieces.map(piece => ({ id: piece.id, dataUrl: piece.previewUrl })));
            setMainId(1);
            setTabId(1);
            setStep(3);
            return;
        }
        setIsProcessing(true);
        setProcessedCount(0);
        setFinalImages([]);
        const targetW = 370;
        const targetH = 320;
        const workW = targetW * 2;
        const workH = targetH * 2;
        slicedPieces.forEach(piece => {
            const workCanvas = document.createElement('canvas');
            workCanvas.width = workW;
            workCanvas.height = workH;
            const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
            const rawW = piece.rawCanvas.width;
            const rawH = piece.rawCanvas.height;
            const baseScale = Math.min(workW / rawW, workH / rawH);
            const finalScale = baseScale * zoomLevel;
            const drawW = rawW * finalScale;
            const drawH = rawH * finalScale;
            const dx = (workW - drawW) / 2;
            const dy = (workH - drawH) / 2;
            workCtx.drawImage(piece.rawCanvas, 0, 0, rawW, rawH, dx, dy, drawW, drawH);

            const imgData = workCtx.getImageData(0, 0, workW, workH);

            workerRef.current.postMessage({
                id: piece.id,
                rawImageData: imgData,
                removalMode: targetColorHex === '#00FF00' ? 'flood' : 'feather',
                targetColorHex: targetColorHex,
                colorTolerance: colorTolerance,
                erodeStrength: 0,
                smoothness: smoothness,
                width: workW,
                height: workH
            });
        });
    };

    const resizeImageFromUrl = (dataUrl, width, height) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const scale = Math.min(width / img.width, height / img.height);
                const newW = img.width * scale;
                const newH = img.height * scale;
                ctx.drawImage(img, 0, 0, img.width, img.height, (width - newW) / 2, (height - newH) / 2, newW, newH);
                resolve(canvas.toDataURL('image/png').split(',')[1]);
            };
            img.src = dataUrl;
        });
    };

    const getFileName = (index) => (startNumber + index).toString().padStart(2, '0');

    const downloadZip = async () => {
        const zip = new JSZip();
        await Promise.all(finalImages.map(async (img, idx) => {
            const b64 = await resizeImageFromUrl(img.dataUrl, 370, 320);
            zip.file(`${getFileName(idx)}.png`, b64, { base64: true });
        }));
        if (mainId) {
            const mainImg = finalImages.find(img => img.id === mainId);
            if (mainImg) zip.file("main.png", await resizeImageFromUrl(mainImg.dataUrl, 240, 240), { base64: true });
        }
        if (tabId) {
            const tabImg = finalImages.find(img => img.id === tabId);
            if (tabImg) zip.file("tab.png", await resizeImageFromUrl(tabImg.dataUrl, 96, 74), { base64: true });
        }
        zip.generateAsync({ type: "blob" }).then(c => saveAs(c, "line_stickers_pack.zip"));
    };

    const applyPreset = (type) => {
        if (type === 'green') {
            setTargetColorHex("#00FF00");
            setColorTolerance(30);
            setSmoothness(2);
            setDespill(true);
            setZoomLevel(1.00);
        } else if (type === 'black') {
            setTargetColorHex("#000000");
            setColorTolerance(15);
            setSmoothness(1);
            setDespill(false);
            setZoomLevel(1.00);
        }
    };

    const PromptDisplay = () => {
        const theme = PROMPT_THEMES[activeTheme];
        const style = PROMPT_STYLES[activeStyle];
        return (
            <div className="prompt-content text-sm font-mono bg-slate-800 p-4 rounded-lg border border-slate-700 h-[380px] overflow-y-auto">
                <div className="font-bold text-xl mb-2 text-white">✅ 12 格角色貼圖集｜Prompt 建議</div>
                <p>請參考上傳圖片中的角色，生成 一張包含 12 個不同動作的角色貼圖集。</p>
                <h2>[角色與風格設定]</h2>
                <ul>
                    <li>角色一致性：必須完全維持原圖主角的髮型、服裝、五官與整體外觀特徵。</li>
                    <li>構圖風格：畫面僅包含「角色 + 文字」，不包含任何場景背景。</li>
                    <li>畫風設定：<span className="var-highlight">【{style.desc}】</span>。</li>
                    <li>貼紙風格（去背友善）：角色與文字外圍皆需加入 粗白色外框（Sticker Style）。背景統一為 <span className="fixed-val">#00FF00（純綠色）</span>，不可有雜點。</li>
                </ul>
                <h2>[畫面佈局與尺寸規格]</h2>
                <ul>
                    <li>整體為 4 × 3 佈局，共 12 張貼圖。總尺寸：<span className="fixed-val">1480 × 960 px</span>。</li>
                    <li>每張小圖約 370 × 320 px（自動等比縮放填滿排列）。每張貼圖四周預留約 0.2 cm Padding，避免畫面互相黏住。</li>
                    <li>鏡頭多樣化：全身 + 半身混合，必須包含正面、側面、俯角等不同視角。</li>
                </ul>
                <h2>[文字設計]</h2>
                <ul>
                    <li>語言：<span className="var-highlight">【台灣繁體中文】</span></li>
                    <li>文字內容：<span className="var-highlight">【{theme.texts}】</span></li>
                    <li>字型風格：<span className="no-highlight">【可愛 Q 版字型，顏色鮮豔、易讀，多色彩混合，絕對禁止使用任何綠色（包含深綠、淺綠、螢光綠、藍綠）與黑色，因為會導致去背錯誤。請改用紅、藍、紫、橘、黃等高對比色彩。】</span></li>
                    <li>排版：文字大小約佔單張貼圖 1/3，文字可適度壓在衣服邊角等非重要區域，不能遮臉，也不要使用任何emoji表情符號。</li>
                </ul>
                <h2>[表情與動作設計]</h2>
                <ul>
                    <li>表情必須明顯、誇張、情緒豐富：<span className="var-highlight">【{theme.emotions}】</span></li>
                    <li>角色動作需與文字情境一致：例如<span className="var-highlight">【{theme.actions}】</span></li>
                    <li>12 格皆須為 不同動作與不同表情。</li>
                </ul>
                <h2>[輸出格式]</h2>
                <ul>
                    <li>一張大圖，內含 4 × 3 的 12 張貼圖。背景必須為 <span className="fixed-val">純綠色 #00FF00</span>。每格角色 + 文字均附上粗白邊。</li>
                </ul>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto pb-32">
            <header className="mb-8 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-line" />
                        Line 貼圖自動化助手
                    </h1>

                </div>
                <div className="flex items-center bg-slate-900 rounded-full px-6 py-2 border border-slate-700">
                    {[{ num: 1, label: '上傳與分割' }, { num: 2, label: '去背' }, { num: 3, label: '打包' }].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s.num ? 'bg-line text-white' : 'bg-slate-700 text-slate-500'}`}>{step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}</div>
                                <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : ''}`}>{s.label}</span>
                            </div>
                            {idx < 2 && <div className={`w-8 h-[2px] mx-3 rounded-full ${step > s.num ? 'bg-green-600' : 'bg-slate-700'}`}></div>}
                        </div>
                    ))}
                </div>
            </header>

            <div className={`transition-opacity duration-500 ${step !== 1 ? 'opacity-0 hidden' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    <div className="lg:col-span-3 bg-slate-800 rounded-3xl shadow-lg border border-slate-700 p-10 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">上傳您的貼圖原始檔</h2>
                        <div className="text-slate-400 mb-8 text-sm leading-relaxed max-w-3xl mx-auto bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                            <p className="mb-2 font-medium text-white">請上傳 AI 生成的 4x3 網格圖 (JPG/PNG)，圖片需要符合以下規格：</p>
                            <ul className="text-left list-none space-y-1 mb-4 pl-4 md:pl-12">
                                <li>(1) 整體為 4欄 × 3列 佈局，共 12 張貼圖，總尺寸：<span className="text-sky-400 font-mono">2560 × 1664 px</span>。</li>
                                <li>(2) 建議使用下方規範好的Prompt進行生圖，若發現圖片生成不符合尺寸，可以再次跟AI提出需求，請AI依據指定的像素修改。</li>
                            </ul>
                            <p className="text-yellow-400 font-bold border-t border-slate-700 pt-3 mt-2">
                                💡 可以參考下方生圖【AI 提示詞大師】先生成圖片，再使用【Line 貼圖自動化助手】進行加工。
                            </p>
                        </div>

                        <div className="relative group w-full max-w-2xl mx-auto">
                            <div className="border-2 border-dashed border-slate-600 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-900 group-hover:border-line group-hover:bg-slate-800 transition-all cursor-pointer overflow-hidden relative">
                                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                {originalSheet ? (
                                    <div className="w-full h-full p-2 flex flex-col items-center justify-center relative z-10"><img src={originalSheet.src} className="max-w-full max-h-full object-contain shadow-sm rounded-lg" alt="Preview" /></div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
                                        <div className="w-16 h-16 bg-slate-800 text-line rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-white transition-all border border-slate-700">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-md group-hover:shadow-lg transition-all">選擇檔案</span>
                                        <span className="text-xs text-slate-500 mt-3">或是將圖片拖曳至此</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {originalSheet && (
                            <button onClick={performSlice} className="mt-8 bg-line hover:bg-green-600 text-white px-12 py-4 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all btn-press flex items-center justify-center gap-3 mx-auto text-lg">
                                {isProcessing ? <Loader className="animate-spin" /> : <Scissors />} 開始切割
                            </button>
                        )}
                    </div>

                    <div className="lg:col-span-2 bg-slate-800/80 p-6 rounded-3xl border border-slate-700 h-fit space-y-6 text-slate-300">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-3">【Line 貼圖自動化助手 步驟說明】</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="font-bold text-line text-lg mb-1">Step 1：先把你的貼圖「生」出來！</div>
                                <p className="text-sm leading-relaxed text-slate-400">還沒有圖片？完全沒問題～<br />直接使用下方 Meiko幫大家設計的【AI 提示詞大師】，挑選適合的prompt後，生成圖片(Prompt內橘色文字都是可以修改的)。加點你的創意調味，用 Gemini Nano Banana Pro / ChatGPT ...等AI工具 就能生成超可愛貼圖素材！</p>
                            </div>
                            <div>
                                <div className="font-bold text-line text-lg mb-1">Step 2：用《LINE貼圖自動化助手》一鍵搞定切圖＋去背！</div>
                                <p className="text-sm text-slate-400">下載前記得先做兩件小事：</p>
                                <ul className="list-none pl-0 mt-1 space-y-2 text-xs text-slate-300">
                                    <li className="bg-slate-900 p-3 rounded-lg border border-slate-700"><span className="font-bold text-white">① 選擇 main / tab 封面圖</span><br />挑一張最能代表你角色靈魂的封面圖，按一下「Main 和 tab按鈕（建議使用同一張貼圖）」就設定完成，下載時可以一併下載下來。</li>
                                    <li className="bg-slate-900 p-3 rounded-lg border border-slate-700"><span className="font-bold text-white">② 設定檔名起始編號</span><br />如果你正在生產第二組貼圖，把起始編號改成 13，這樣下載後全部 40 張貼圖（含 main、tab）會乖乖排好隊，輕鬆彙整進同一個壓縮檔，完全不會撞號 ✨</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-line text-lg mb-1">Step 3：到 LINE Creators Market 一鍵上傳！</div>
                                <p className="text-sm text-slate-400">打開 <a href="https://creator.line.me/zh-hant/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-bold">Line Creators Market</a>，整包壓縮檔直接上傳～</p>
                                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">
                                    提醒：完成分割去背後的貼圖，也可以放在其他社群工具內使用，例如：IG、Messenger、WhatsAPP、Telegram、Discord.....等等。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-3xl shadow-lg border border-slate-700 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2"><Wand2 className="w-5 h-5 text-line" /> AI 提示詞大師</h3>
                        <button onClick={() => setShowPromptGuide(!showPromptGuide)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                            {showPromptGuide ? "隱藏" : "展開"} <ChevronDown className={`w-3 h-3 transition-transform ${showPromptGuide ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    <div className={`transition-all duration-300 ${showPromptGuide ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl mb-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-400">1. 選擇主題內容：</span>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(PROMPT_THEMES).map(([key, theme]) => (
                                        <button key={key} onClick={() => setActiveTheme(key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeTheme === key ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>{theme.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-400">2. 選擇畫風：</span>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(PROMPT_STYLES).map(([key, style]) => (
                                        <button key={key} onClick={() => setActiveStyle(key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeStyle === key ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>{style.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <PromptDisplay />
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleCopyPrompt} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}>
                                {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copySuccess ? "已複製成功！" : "複製 Prompt"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`step-card bg-slate-800 rounded-3xl shadow-lg border border-slate-700 p-8 mb-8 ${step !== 2 && 'hidden'}`}>
                <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                    <div className={`transition-all duration-500 ${showSettings ? 'w-full xl:w-2/3' : 'w-full'}`}>
                        <div className={`grid gap-4 ${showSettings ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-4' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
                            {slicedPieces.map((p) => (
                                <div key={p.id} className="aspect-square bg-slate-900 rounded-xl border border-slate-700 p-2 flex items-center justify-center">
                                    <img src={p.previewUrl} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`transition-all duration-500 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden ${showSettings ? 'w-full xl:w-1/3 opacity-100' : 'w-full xl:w-12 h-16 xl:h-auto opacity-80 cursor-pointer hover:bg-slate-800'}`}>
                        <div onClick={() => setShowSettings(!showSettings)} className="p-6 flex items-center justify-between cursor-pointer">
                            <div className={`flex items-center gap-2 font-bold text-white whitespace-nowrap ${!showSettings && 'xl:hidden'}`}>
                                <Settings className="w-5 h-5 text-line" /> 啟用智能去背
                            </div>
                            <div className={`hidden xl:flex flex-col items-center gap-4 py-4 ${showSettings && 'hidden'}`}>
                                <Settings className="w-6 h-6 text-slate-400" />
                                <span className="text-[10px] text-slate-500 writing-vertical-lr tracking-widest">點擊展開設定</span>
                            </div>
                            <div className={`relative inline-flex items-center cursor-pointer ${!showSettings && 'xl:hidden'}`}>
                                <input type="checkbox" checked={autoRemoveBg} onChange={(e) => { e.stopPropagation(); setAutoRemoveBg(e.target.checked) }} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-line"></div>
                            </div>
                        </div>
                        <div className={`px-6 pb-6 space-y-6 ${!showSettings && 'hidden'}`}>
                            {autoRemoveBg && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium"><span>快速設定 (Presets)</span></div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => applyPreset('black')} className={`px-3 py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition ${targetColorHex === '#000000' ? 'bg-slate-800 text-white border-slate-600 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}><Moon className="w-4 h-4" /> <span>黑底去背</span></button>
                                            <button onClick={() => applyPreset('green')} className={`px-3 py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition ${targetColorHex === '#00FF00' ? 'bg-green-900/30 text-green-400 border-green-700 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-green-800'}`}><div className="w-4 h-4 bg-green-500 rounded-full"></div> <span>綠幕去背</span></button>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white pt-2 border-t border-slate-700">
                                        <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> 顯示進階設定</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`collapse-content ${showAdvanced ? 'collapse-open' : ''}`}>
                                        <div className="pt-4 space-y-4">
                                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                    <span className="flex items-center gap-1"><Crop className="w-3 h-3" /> 裁切縮放 (去除黑邊)</span>
                                                    <span className="font-bold text-line">{Math.round((zoomLevel - 1) * 100)}%</span>
                                                </div>
                                                <input type="range" min="1.00" max="1.50" step="0.01" value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                                <div className="text-[10px] text-slate-500 mt-1">若兩側仍有黑邊，請將數值往右拉大</div>
                                            </div>
                                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>目標顏色</span><span className="font-mono">{targetColorHex}</span></div>
                                                <input type="color" value={targetColorHex} onChange={(e) => setTargetColorHex(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-slate-600 p-0" />
                                            </div>
                                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>色彩容許度 (Tolerance)</span><span>{colorTolerance}</span></div>
                                                <input type="range" min="1" max="100" value={colorTolerance} onChange={(e) => setColorTolerance(Number(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>邊緣柔化 (Smoothness)</span><span>{smoothness}</span></div>
                                                <input type="range" min="0" max="10" step="1" value={smoothness} onChange={(e) => setSmoothness(Number(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm">
                                                <span className="text-[10px] text-slate-400">溢色去除 (Despill)</span>
                                                <input type="checkbox" checked={despill} onChange={(e) => setDespill(e.target.checked)} className="accent-green-500 w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 pt-8 border-t border-slate-700 mt-6">
                    <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-400 bg-slate-900 hover:bg-slate-700 hover:text-white transition">重新上傳</button>
                    <button onClick={performProcessing} disabled={isProcessing} className="bg-line hover:bg-green-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-green-900 transition-all btn-press flex items-center justify-center gap-2 min-w-[240px]">
                        {isProcessing ? <><Loader className="animate-spin" /><span>處理中 ({processedCount}/12)</span></> : <><Eraser />執行去背</>}
                    </button>
                </div>
            </div>

            <div className={`step-card bg-slate-800 rounded-3xl shadow-lg border border-slate-700 p-8 mb-8 ${step !== 3 && 'hidden'}`}>
                <div className="mb-8 border-b border-slate-700 pb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2"><CheckCircle className="text-line" />設定與打包</h2>
                    <p className="text-slate-400 text-sm">請勾選主圖(Main)與標籤圖(Tab) <span className="text-xs text-slate-500">(可選)</span>。</p>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-end mb-8">
                    <div className="w-full xl:flex-1 bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-xl text-lg text-yellow-200">
                        <div className="font-bold flex items-center gap-2 mb-3 text-yellow-400 text-xl"><Info className="w-6 h-6" /> 下載前記得先做兩件小事：</div>
                        <ul className="list-disc pl-6 space-y-3 opacity-90 text-base md:text-lg">
                            <li>選擇 <span className="text-white font-bold bg-yellow-600/30 px-1 rounded">main / tab 封面圖</span>：挑一張最能代表你角色靈魂的封面圖，按一下就設定完成！</li>
                            <li>設定 <span className="text-white font-bold bg-yellow-600/30 px-1 rounded">檔名起始編號</span>：第二組貼圖請改為 13，下載後 40 張貼圖自動排隊，完全不撞號 ✨</li>
                        </ul>
                    </div>

                    <div className="w-full xl:w-auto flex flex-row items-stretch gap-3">
                        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-600 flex flex-col justify-center min-w-[140px]">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1"><Hash className="w-3 h-3" /> 起始編號</span>
                            <input type="number" min="1" value={startNumber} onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-green-500 outline-none py-1" />
                        </div>
                        <button onClick={downloadZip} className="flex-1 bg-line hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all btn-press flex items-center justify-center gap-2 text-lg whitespace-nowrap"><Download className="w-6 h-6" /> 下載完整 ZIP</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {finalImages.map((img, idx) => (
                        <div key={img.id} className="bg-slate-900 rounded-2xl border border-slate-700 p-3 hover:border-green-500 hover:shadow-md transition-all">
                            <div className="aspect-[370/320] grid-bg rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 mb-3"><img src={img.dataUrl} className="w-full h-full object-contain" /></div>
                            <div className="text-center text-sm font-bold text-slate-400 mb-4 bg-slate-800 rounded py-1">{getFileName(idx)}.png</div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="main_select" checked={mainId === img.id} onChange={() => setMainId(img.id)} className="hidden custom-radio" />
                                    <div className={`flex-1 text-xs border rounded-lg px-2 py-2 flex items-center gap-1 justify-center transition-all ${mainId === img.id ? 'bg-green-900/40 border-line text-line font-bold' : 'bg-slate-800 border-slate-600 text-slate-500 group-hover:bg-slate-700 group-hover:border-slate-500'}`}><Star className="w-3 h-3" /> Main</div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="tab_select" checked={tabId === img.id} onChange={() => setTabId(img.id)} className="hidden custom-radio" />
                                    <div className={`flex-1 text-xs border rounded-lg px-2 py-2 flex items-center gap-1 justify-center transition-all ${tabId === img.id ? 'bg-green-900/40 border-line text-line font-bold' : 'bg-slate-800 border-slate-600 text-slate-500 group-hover:bg-slate-700 group-hover:border-slate-500'}`}><Tag className="w-3 h-3" /> Tab</div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10"><button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors underline">處理下一張原始圖</button></div>
            </div>

        </div>
    );
};

export default App;
