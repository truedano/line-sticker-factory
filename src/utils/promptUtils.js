import { PROMPT_THEMES, PROMPT_STYLES, GRID_MODES, EMOJI_GRID_MODES, EMOJI_PROMPT_THEMES } from '../data';

/**
 * Helper to get themed field based on grid total count
 */
const getThemeField = (theme, field, total, isEmoji) => {
    if (!theme) return '';
    const key = `${field}${total}`;
    if (theme[key]) return theme[key];
    return theme[field] || '';
};

/**
 * Helper to split content strings and get the part for the current tab
 */
const splitAndGet = (str, index, gridConfig) => {
    if (!str) return '';
    const parts = str.split(/[,、]+/).map(s => s.trim()).filter(Boolean);
    if (!gridConfig.isDoubleSheet) return parts.join('、');

    if (gridConfig.grids) {
        const count1 = gridConfig.grids[0].cols * gridConfig.grids[0].rows;
        const count2 = gridConfig.grids[1].cols * gridConfig.grids[1].rows;
        if (index === 0) return parts.slice(0, count1).join('、');
        return parts.slice(count1, count1 + count2).join('、');
    } else {
        const half = gridConfig.cols * gridConfig.rows;
        if (index === 0) return parts.slice(0, half).join('、');
        return parts.slice(half, half * 2).join('、');
    }
};

/**
 * Generate LINE Sticker Prompt
 */
export const generateStickerPrompt = ({
    activeTheme = 'daily',
    activeStyle = 'qversion',
    gridMode = '4x2',
    customTexts = '',
    customEmotions = '',
    customActions = '',
    tabIndex = 0
}) => {
    const theme = PROMPT_THEMES[activeTheme];
    const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
    const gridConfig = GRID_MODES[gridMode] || GRID_MODES['4x2'] || Object.values(GRID_MODES)[0];

    const getSheetCount = (index) => {
        if (gridConfig.grids && gridConfig.grids[index]) {
            return gridConfig.grids[index].cols * gridConfig.grids[index].rows;
        }
        if (!gridConfig.isDoubleSheet) return gridConfig.total;
        return gridConfig.cols * gridConfig.rows;
    };

    const sheetTotalCount = getSheetCount(tabIndex);
    const currentGrid = gridConfig.grids ? gridConfig.grids[tabIndex] : gridConfig;
    const layoutLabel = `${currentGrid.cols} × ${currentGrid.rows}`;
    const sizeLabel = `${currentGrid.width} × ${currentGrid.height} px`;

    let finalTexts = activeTheme === 'custom' ? customTexts : getThemeField(theme, 'texts', gridConfig.total, false);
    let finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions', gridConfig.total, false);
    let finalActions = activeTheme === 'custom' ? customActions : getThemeField(theme, 'actions', gridConfig.total, false);

    finalTexts = splitAndGet(finalTexts, tabIndex, gridConfig);
    finalEmotions = splitAndGet(finalEmotions, tabIndex, gridConfig);
    finalActions = splitAndGet(finalActions, tabIndex, gridConfig);

    let titlePrefix = gridConfig.isDoubleSheet ? `✅ (第 ${tabIndex + 1} 組)` : '✅';

    return `${titlePrefix} ${sheetTotalCount} 格角色貼圖集｜AI Prompt 建議

請參考上傳圖片中的角色特徵，在您常用的 AI 生圖工具中輸入以下指令，生成一張包含 ${sheetTotalCount} 個不同動作的貼圖大圖（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色。
• 構圖邏輯：畫面僅包含「角色 + 文字」，不包含任何複雜背景。
• 風格關鍵字：${style.desc}
• 去背優化：角色與文字需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。
• 🚫 審核防護重點（重要）：不可出現彩虹色、漸層色、或任何宗教符號與違規旗幟。強烈建議在生圖工具加入負向提示詞：grid lines, frames, borders, dividing lines, panels, bounding boxes, rainbow, holographic, iridescent, multicolored gradients, LGBT, pride flag, religious symbols, nudity, gore.

畫面佈局與尺寸規格
• 整體為 ${layoutLabel} 佈局，共 ${sheetTotalCount} 張貼圖。總尺寸：${sizeLabel}。
• 所有 ${sheetTotalCount} 個貼圖必須排列整齊，形成「隱形的網格」(Invisible Grid)。【極度重要】絕對不要畫出任何實體的網格線、分隔線、邊框或底框。
• 背景必須是一整片純粹連續的 #00FF00 (純綠色)，不可有任何線條切斷背景。
• 每個角色必須嚴格控制在自己的區域內，不可與相鄰貼圖重疊，以免在裁切時被切斷（Do not overlap boundaries）。
• 每張貼圖四周預留適度 Padding，保留安全間距避免畫面互相黏住。
• 視角：全身 + 半身混合，包含正面、側面、俯角等。

文字設計細節
• 語言：台灣繁體中文
• 內容：${finalTexts}
• 配色：每張貼圖的文字顏色必須各不相同，從以下色系中輪流選用：紅色、橘色、黃色、藍色、紫色、粉紅色、白色、深藍色、棕色、酒紅色。絕對禁止使用綠色系與黑色。確保整套貼圖的文字色彩豐富多元、不重複。
• 排版：大小約佔 1/3，可壓在衣服邊角，不可遮臉。

表情與動作設計
• 情緒清單：${finalEmotions}
• 建議動作：${finalActions}
• ${sheetTotalCount} 格皆須為不同動作與表情，展現角色張力。`;
};

/**
 * Generate LINE Emoji Prompt
 */
export const generateEmojiPrompt = ({
    activeTheme = 'daily',
    activeStyle = 'qversion',
    gridMode = '4x2',
    isEmojiTextEnabled = false,
    customEmotions = '',
    customActions = '',
    tabIndex = 0
}) => {
    const theme = EMOJI_PROMPT_THEMES[activeTheme];
    const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
    const gridConfig = EMOJI_GRID_MODES[gridMode] || EMOJI_GRID_MODES['4x2'] || Object.values(EMOJI_GRID_MODES)[0];

    const getSheetCount = (index) => {
        if (gridConfig.grids && gridConfig.grids[index]) {
            return gridConfig.grids[index].cols * gridConfig.grids[index].rows;
        }
        if (!gridConfig.isDoubleSheet) return gridConfig.total;
        return gridConfig.cols * gridConfig.rows;
    };

    const sheetTotalCount = getSheetCount(tabIndex);
    const currentGrid = gridConfig.grids ? gridConfig.grids[tabIndex] : gridConfig;
    const cellW = Math.round(currentGrid.width / currentGrid.cols);
    const cellH = Math.round(currentGrid.height / currentGrid.rows);

    let finalEmotions = activeTheme === 'custom' ? customEmotions : getThemeField(theme, 'emotions', gridConfig.total, true);
    let finalActions = activeTheme === 'custom' ? customActions : getThemeField(theme, 'actions', gridConfig.total, true);

    finalEmotions = splitAndGet(finalEmotions, tabIndex, gridConfig);
    finalActions = splitAndGet(finalActions, tabIndex, gridConfig);

    let titlePrefix = gridConfig.isDoubleSheet ? `✅ (第 ${tabIndex + 1} 組)` : '✅';

    return `${titlePrefix} ${sheetTotalCount} 格角色表情貼集｜AI Prompt 建議

⚠️ 圖片解析度（最重要，務必遵守）
• 輸出圖片的精確像素尺寸必須為：寬 ${currentGrid.width} px × 高 ${currentGrid.height} px。
• 每格固定 ${cellW} × ${cellH} px，共 ${currentGrid.cols} 欄 × ${currentGrid.rows} 列 = ${sheetTotalCount} 格。
• 請在 AI 生圖工具中將解析度/畫布大小設定為 ${currentGrid.width}×${currentGrid.height}，不可使用其他尺寸。

請參考上傳圖片中的角色特徵，生成一張 ${currentGrid.width}×${currentGrid.height} px 的表情貼大圖，包含 ${sheetTotalCount} 個不同表情（切勿包含任何表情符號 Emoji）。

角色與風格設定
• 核心要求：必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色。
• 構圖邏輯：${isEmojiTextEnabled ? '以角色的表情和動作傳達情緒，可搭配「簡單少量的文字」（如：OK、讚、哈等短語）。' : '表情貼「不含文字」，純粹以角色的表情和動作傳達情緒。'}
${isEmojiTextEnabled ? '• 文字配色：每格的文字顏色必須各不相同，從以下色系中輪流選用：紅色、橘色、黃色、藍色、紫色、粉紅色、白色、深藍色、棕色、酒紅色。絕對禁止使用綠色系與黑色。確保整套表情貼的文字色彩豐富多元、不重複。\n' : ''}• 風格關鍵字：${style.desc}
• 去背優化：角色需加入 粗白色外框 (Sticker Style)。背景統一為 #00FF00 (純綠色)。
• 🚫 審核防護重點（重要）：不可出現彩虹色、漸層色、或任何宗教符號與違規旗幟。強烈建議在生圖工具加入負向提示詞：grid lines, frames, borders, dividing lines, panels, bounding boxes, rainbow, holographic, iridescent, multicolored gradients, LGBT, pride flag, religious symbols, nudity, gore.

畫面佈局（${currentGrid.width} × ${currentGrid.height} px）
• 整體畫布：${currentGrid.width} × ${currentGrid.height} px（不可偏差）。
• 佈局：${currentGrid.cols} 欄 × ${currentGrid.rows} 列，每格 ${cellW}×${cellH} px，共 ${sheetTotalCount} 格。
• 所有 ${sheetTotalCount} 個格子必須排列整齊，形成「隱形的網格」(Invisible Grid)。【極度重要】絕對不要畫出任何實體的網格線、分隔線、邊框或底框，角色之間必須以純白背景或純綠色區域自然隔開。
• 背景必須是一整片純粹連續的 #00FF00 (純綠色)，不可有任何線條切斷背景。
• 每個角色必須嚴格控制在自己的格子內，不可越界、不可與其他格子邊緣重疊，以免在裁切時被切斷（Do not overlap cell boundaries）。
• 角色（含白色外框）應佔據單格面積的 80%~85%，保留適當的周圍安全間距。
• 視角：以臉部大特寫和上半身為主，確保縮小到極小時仍能清楚辨識表情。

表情貼設計原則
• 設計簡潔、輪廓清晰：避免太過複雜的細節、漸層或極小的文字，使用較粗的線條描繪輪廓。
• 單獨傳送會放大：讓放大後的畫質維持良好，避免出現鋸齒。
• 深色背景兼容：確保圖案邊緣或配色在淺色與深色背景下都容易辨識。

表情與動作設計
• 情緒清單：${finalEmotions}
• 建議動作：${finalActions}
• ${sheetTotalCount} 格皆須為不同表情與動作，展現角色張力。`;
};

/**
 * Generate LINE Theme Prompt
 */
export const generateThemePrompt = ({
    activeStyle = 'qversion',
    themeColor = '日系清爽薄荷綠',
    typeId = 'main_ios',
    chatBgCharPos = 'default'
}) => {
    const style = PROMPT_STYLES[activeStyle] || PROMPT_STYLES.qversion;
    const currentThemeColor = themeColor || '溫和且具有整體感的色調';

    const PROMPT_TYPES_DATA = [
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

    const typeInfo = PROMPT_TYPES_DATA.find(t => t.id === typeId) || PROMPT_TYPES_DATA[0];

    let isMenuGrid = typeId === 'menu_btn_off' || typeId === 'menu_btn_on';
    let isPasscodeGrid = typeId.startsWith('passcode');
    let isProfileGrid = typeId.startsWith('profile');
    let isGrid = isMenuGrid || isPasscodeGrid || isProfileGrid;

    if (isGrid) {
        let stateDesc = '';
        let gridCols = isMenuGrid ? 3 : (isProfileGrid ? 1 : 2);
        let gridRows = isMenuGrid ? 3 : 2;
        let targetGroup = isMenuGrid ? '選單導覽圖籤 (Menu Icons)' : (isProfileGrid ? '大頭貼圖示' : '密碼狀態圖示');

        if (isMenuGrid) {
            const isOff = typeId === 'menu_btn_off';
            stateDesc = isOff 
                ? '【狀態：未選取 (OFF)】請使用簡潔的高級灰色調、低飽和度、或是極簡線條設計，背景務必保持純綠色。' 
                : '【狀態：已選取 (ON)】請使用色彩吸睛、飽和度高、或是帶有發光特效的動態設計，背景務必保持純綠色。';
            
            stateDesc += `\n\n🎯 九宮格內容清單 (Grid Content List) - 請務必按照以下座標產生 9 個不同物件（注意：下方的文字標籤僅供說明，畫面中「絕對禁止」畫出任何文字）：
Row 1 (第一行)：
• (1,1) Top-Left (左上): 主頁房子 (Home icon)
• (1,2) Top-Center (中上): 聊天氣泡 (Chat / Message bubble)
• (1,3) Top-Right (右上): VOOM/影片播放 (VOOM / Timeline icon)

Row 2 (第二行)：
• (2,1) Mid-Left (左中): 購物袋 (Shopping bag / cart icon)
• (2,2) Mid-Center (正中): 電話聽筒 (Calls / Phone icon) 👈 重要！
• (2,3) Mid-Right (右中): 新聞報紙 (News / Document icon) 👈 重要！

Row 3 (第三行)：
• (3,1) Bottom-Left (左下): TODAY新聞 (TODAY / Newspaper icon)
• (3,2) Bottom-Center (中下): 錢包硬幣 (Wallet / Payment icon)
• (3,3) Bottom-Right (右下): 更多/MINI (Mini App / Grid icon)`;
        } else if (isPasscodeGrid) {
            stateDesc = typeId.includes('_off')
                ? '這代表「未輸入」的空狀態，顏色請設計較暗沉平淡，或是顯示角色最基本的樣子（例如：蛋殼、還沒被點亮的燈）。'
                : '這代表「已輸入」的點亮狀態，顏色請鮮豔發光，也可以有情緒、破殼、或是開燈後的漸進變化。';
        } else {
            stateDesc = '請在 1 欄 × 2 列的垂直網格中填入大頭貼：\n• 上方格 (Slot 1)：個人代表圖片（建議為角色正臉 or 招牌動作）。\n• 下方格 (Slot 2)：群組代表圖片（建議為角色與小夥伴、或是另一個活潑的動作）。';
        }

        let extraGridRules = isMenuGrid
            ? '• 分開繪製：這 9 個物件必須完全獨立，彼此互不接觸並保持間隔(Keep safe margin)。\n• 避開右上角 (Avoid Top-Right): 每一格內的物件請盡量靠左下方一點，避開每格右上角 40x40px 的區域，那是 LINE 顯示通知紅點的地方。\n• 嚴格禁止文字 (NO TEXT)：畫面中「絕對不能」出現任何文字、英文字母、說明標籤或數字，只需畫出圖案(Icon)本身。\n• 嚴格禁止分隔線 (NO SEPARATORS)：背景必須是一整張完美連續的純綠色，格子之間「絕對禁止」畫出任何實體的白色分隔線、網格線、黑線或邊框！'
            : (isPasscodeGrid
                ? '• 集中置中：每個密碼圖案必須保持圓潤小巧，並且完全置中，四周保留安全的去背空間及間隔(Keep safe margin)。可以透過動作或表情的變化增添密碼輸入時的樂趣。'
                : '• 延伸滿版且禁畫外框 (非常重要)：大頭貼在 LINE app 內最終會被系統自動裁切為圓形，因此請確保角色臉部集中在每格的正中央。請讓背景自然地填滿整個方格，【絕對不要在角色外圍畫出任何圓圈、邊界或相框】！');

        let backgroundGuide = isProfileGrid 
            ? `• 背景 (Background): 請使用與「${currentThemeColor}」相符的顏色或簡單的圖樣作為背景，絕對不要畫成純綠色（這裡不需要去背）。`
            : '• 背景 (Background): 全平面純色，使用 #00FF00 (Pure Green)，不准有漸層或陰影。';

        return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 格式要求 (Format)
• 尺寸 (Size): ${typeInfo.size.split('×')[0]} x ${typeInfo.size.split('×')[1]} px.
• 佈局 (Layout): ${gridCols} Columns × ${gridRows} Rows.

🎨 核心內容 (Core Content)
${stateDesc}

🛠️ 製圖細節 (Technical Details)
• 隱形網格 (Invisible Grid): 排列必須整齊，但「絕對禁止」畫出任何實體格線、白色分隔線、框線或標記數字。每個物件都要嚴格待在自己的無形格子內，不可越界.
${backgroundGuide}
${extraGridRules}
• 風格維持 (Style Continuity): ${style.label} (${style.desc})。請參考參考圖的配色「${currentThemeColor}」與主角外觀特徵。`;
    }

    let extraGuide = '';
    if (typeInfo.category.startsWith('C')) {
        extraGuide = `\n• 橫向無縫拼接（極度重要）：這是一張 1472×150 px、極度扁長的「底部選單背景圖片」。因為這張圖會在 APP 內水平無縫重複，請務必將**左右兩端的圖案設計為自然無縫銜接（Seamless pattern）**。\n• 頂部去背安全區：官方規定這張圖的主體（不透明部分）高度必須在 100px~150px 之間，且必須貼緊下方邊緣。代表你【可以完全不去背（整圖畫滿150px高）】；若需在頂部做透明效果，透明的去背空間「最多只能從頂部向下算 0~50px 之間」（例如：上方 20px 綠色去背，下方 130px 保留為實體主圖）。若有去背需求，請在最上方的去背區塊塗滿純綠色（#00FF00）。\n• 極簡純色設計：圖片請盡量以「純色、微漸層或極簡的幾何色塊」顯示，只需與主題色系（${currentThemeColor}）互相搭配即可。絕對不要在背景放任何複雜圖樣，避免干擾浮在上面的按鈕。`;
    } else if (typeInfo.category.startsWith('F')) {
        const isIos = typeId.includes('ios');
        let positionGuide = '';

        if (chatBgCharPos === 'none') {
            positionGuide = '• 無角色純背景：這是一張純粹的背景圖，請用主題色與簡單的背景物件散落畫面，保持柔和佈局。';
        } else if (chatBgCharPos === 'center') {
            positionGuide = '• 角色位置：請將主要角色安置於「畫面正中央」，並保持適當的大小，不要過度佔滿整個空間。';
        } else if (chatBgCharPos === 'bottom-right') {
            positionGuide = '• 角色位置：請將主要角色安置於「畫面右下角」或外側邊緣作為點綴，其他區域保留為純粹的背景。';
        } else if (chatBgCharPos === 'full') {
            positionGuide = '• 角色位置 (大滿版)：請將主角「極度放大並填滿整個畫面空間」。整個畫面【只能有一隻巨大化的角色】作為底圖，畫面上下左右絕對不可以再畫出其他的迷你/小隻分身！';
        } else {
            positionGuide = `• 構圖與位置（官方預設推薦）：${isIos ? '建議將主要角色放在畫面的「最下方邊緣」，營造從輸入欄位「向上探頭」的效果。' : '建議將角色置於畫面的「下半部中央」，並避開最底部的功能鍵區。'}`;
        }

        extraGuide = `\n• 聊天室背景圖片設定（${isIos ? 'iOS' : 'Android'}）：這是一張非必要的背景裝飾圖。
• 淡化處理（極重要）：**必須將人物與背景進行淡化處理**。請使用低飽和度（Desaturated）、高亮度（High Brightness）、低對比度（Low Contrast）的色彩。
• 視覺呈現：建議呈現如「水彩渲染」、「磨砂玻璃感」或「輕透半透明感」的視覺效果，確保聊天文字（黑色或白色）在背景上清晰易讀。
• 避免畫面斷層：請務必讓背景底色與「${currentThemeColor}」完美融合，或是將背景設計為純淨的 ${currentThemeColor} 滿版色彩。
${positionGuide}
• 閱讀性優先：請保持畫面中央區域（對話流動區）盡量乾淨清爽，絕對不要有複雜圖樣。`;
    }

    let characterGuide = '• 角色設定：請必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色，請放置在畫面最適當的地方。';
    
    if (typeInfo.category.startsWith('C')) {
        characterGuide = '• 角色排除 (純色背景)：請「絕對不要」在畫面中保留或畫出任何角色。這只是一張單純的底部襯底。';
    } else if (typeInfo.category.startsWith('F')) {
        if (chatBgCharPos === 'none') {
            characterGuide = '• 角色排除 (純背景)：請「絕對不要」保留或畫出圖片中的主角。畫面只能有符合主題氛圍的背景元素！';
        } else {
            characterGuide = '• 角色設定：請必須完全維持原圖主角的髮型、服裝、五官、真實色彩（Natural color）與整體外觀特徵，並使用單一或自然的毛色/膚色。畫面只能存在「唯一一隻主角」，請嚴格避免複製出多個角色！';
        }
    }

    return `✅ ${typeInfo.category} - ${typeInfo.label}｜AI Prompt 建議

⚠️ 尺寸與裁切要求 (極度重要)
• 畫布精確尺寸：請設定為「寬度 ${typeInfo.size.split('×')[0]} px，高度 ${typeInfo.size.split('×')[1]} px」。
• 不可去背：背景必須填滿顏色，不可為透明。
• 佈局構圖：四周務必保留大面積的安全留白（避免在不同裝置上被微調或裁切）。

請參考我上傳的圖片生圖：
${characterGuide}${extraGuide}
• 視覺風格：${style.label}（${style.desc}）。
• 背景設定：以 ${currentThemeColor} 為主的乾淨背景，四周維持留白與簡單圖樣，絕對不要在畫面出現任何干擾文字。
• 🚫 審核防護重點（重要）：不可出現彩虹色、漸層色、或任何宗教符號與違規旗幟。強烈建議在生圖工具加入負向提示詞：grid lines, frames, borders, dividing lines, panels, bounding boxes, rainbow, holographic, iridescent, multicolored gradients, LGBT, pride flag, religious symbols, nudity, gore.`;
};
