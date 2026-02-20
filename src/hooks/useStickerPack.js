import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const useStickerPack = (finalImages, mainId, tabId, startNumber) => {

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

    return {
        downloadZip,
        getFileName
    };
};

export default useStickerPack;
