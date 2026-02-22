import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PRODUCT_TYPES } from '../data';

const useStickerPack = (finalImages, mainId, tabId, startNumber, productType = 'sticker') => {

    const productConfig = PRODUCT_TYPES[productType];
    const isEmoji = productType === 'emoji';

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

    // 表情貼使用三位數 (001, 002, ...)，靜態貼圖使用兩位數 (01, 02, ...)
    const getFileName = (index) => {
        const num = startNumber + index;
        return isEmoji ? num.toString().padStart(3, '0') : num.toString().padStart(2, '0');
    };

    const downloadZip = async () => {
        const zip = new JSZip();
        const { stickerSize, tabSize } = productConfig;

        await Promise.all(finalImages.map(async (img, idx) => {
            const b64 = await resizeImageFromUrl(img.dataUrl, stickerSize.width, stickerSize.height);
            zip.file(`${getFileName(idx)}.png`, b64, { base64: true });
        }));

        // main 圖（只有靜態貼圖需要）
        if (productConfig.hasMain && mainId) {
            const mainImg = finalImages.find(img => img.id === mainId);
            if (mainImg) {
                const { mainSize } = productConfig;
                zip.file("main.png", await resizeImageFromUrl(mainImg.dataUrl, mainSize.width, mainSize.height), { base64: true });
            }
        }

        // tab 圖（兩者都需要）
        if (tabId) {
            const tabImg = finalImages.find(img => img.id === tabId);
            if (tabImg) zip.file("tab.png", await resizeImageFromUrl(tabImg.dataUrl, tabSize.width, tabSize.height), { base64: true });
        }

        zip.generateAsync({ type: "blob" }).then(c => saveAs(c, `${productConfig.filePrefix}.zip`));
    };

    return {
        downloadZip,
        getFileName
    };
};

export default useStickerPack;
