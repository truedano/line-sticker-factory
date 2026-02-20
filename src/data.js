export const PROMPT_THEMES = {
    daily: { label: '日常用語', texts: '早安、晚安、謝謝、不客氣、對不起、沒問題、好的、收到、拜託、辛苦了、OK、等等', emotions: '喜、怒、哀、樂、驚訝、無語、放空、大哭', actions: '謝謝配雙手合十、OK比手勢、早安揮手、發呆流口水' },
    greet: { label: '打招呼', texts: 'Hello、Hi、早安、午安、晚安、你好、吃飽沒、好久不見、初次見面、歡迎、有空嗎、掰掰', emotions: '熱情、微笑、眨眼、期待、害羞、友善', actions: '揮手致意、90度鞠躬、從角落探頭、比手指愛心、拿著大聲公' },
    holiday: { label: '節日祝福', texts: '新年快樂、恭喜發財、生日快樂、聖誕快樂、情人節快樂、中秋快樂、母親節快樂、父親節快樂、端午安康、萬聖節快樂、Happy New Year、紅包拿來', emotions: '喜氣洋洋、興奮、溫馨、大笑、感動、派對臉', actions: '雙手拿紅包、點燃鞭炮、捧著生日蛋糕、送出禮物盒、舉杯慶祝' },
    response: { label: '回應篇', texts: '真的假的、笑死、確?、好喔、??、!!!、無言、傻眼、厲害、佩服、+1、路過', emotions: '震驚到變形、翻白眼、懷疑眼神、豎起大拇指、敷衍假笑', actions: '比讚、雙手打叉(NG)、單手扶額頭、吃瓜看戲、比出 OK 手勢' },
    work: { label: '上班族', texts: '收到、馬上改、開會中、加班、準時下班、心累、報告長官、辛苦了、求放過、薪水呢、不想上班、加油', emotions: '眼神死、崩潰大哭、職業假笑、黑眼圈深重、燃燒鬥志', actions: '瘋狂敲鍵盤、吊點滴喝咖啡、趴在桌上靈魂出竅、標準敬禮、舉白旗投降' },
    couple: { label: '老公老婆', texts: '愛你、想你、抱抱、親親、寶貝、老公、老婆、在幹嘛、快回家、買給我、原諒我、啾咪', emotions: '害羞臉紅、色瞇瞇、撒嬌水汪汪大眼、生氣鼓臉、陶醉', actions: '抱緊處理、發射飛吻、跪算盤謝罪、摸頭殺、壁咚' },
    meme: { label: '迷因搞笑', texts: '是在哈囉、我就爛、阿姨我不想努力了、像極了愛情、可憐哪、嚇到吃手手、沒在怕、本斥但大、真香、歸剛欸、突破盲腸、怕', emotions: '極度嘲諷臉、堅定眼神、猥瑣笑容、崩壞顏藝、鄙視眼神', actions: '攤手無奈、指指點點、戴墨鏡耍帥、拿著鹹魚攻擊、謎之舞步' },
    custom: { label: '🌟 自訂主題', texts: '', emotions: '', actions: '自訂動作描述' }
};

export const PROMPT_STYLES = {
    qversion: { label: '通用 Q 版', desc: '可愛、活潑、2D平面' },
    realistic: { label: '寫實風格', desc: '細緻、擬真、高質感' },
    threed: { label: '3D 立體', desc: 'Blender風格、圓潤、光影' },
    sketch: { label: '手繪塗鴉', desc: '線條感、童趣、蠟筆' },
    pixel: { label: '像素風', desc: '復古遊戲、8-bit' },
    anime: { label: '日系動漫', desc: '大眼、賽璐璐上色' }
};
