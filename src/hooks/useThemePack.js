import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const useThemePack = () => {
    // Utility to resize and crop image, returning base64 with size optimization
    const resizeImage = async (dataUrl, targetWidth, targetHeight, mode = 'cover') => {
        if (!dataUrl) return null;

        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = dataUrl;
        });

        const processCanvas = (blurAmount = 0) => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            // Apply smoothing filter if needed (Plan C)
            if (blurAmount > 0) {
                ctx.filter = `blur(${blurAmount}px)`;
            }

            if (mode === 'cover') {
                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const x = (targetWidth - drawW) / 2;
                const y = (targetHeight - drawH) / 2;
                ctx.drawImage(img, x, y, drawW, drawH);
            } else if (mode === 'contain') {
                const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const x = (targetWidth - drawW) / 2;
                const y = (targetHeight - drawH) / 2;
                ctx.drawImage(img, x, y, drawW, drawH);
            } else {
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            }
            return canvas;
        };

        // Iterative optimization loop (Plan B/C Hybrid: JPEG Re-encoding Noise Reduction)
        let canvas = processCanvas(0);
        let base64 = canvas.toDataURL('image/png').split(',')[1];
        const MAX_BYTES = 950000; // 950KB safety threshold

        // If PNG is over 1MB, use JPEG to strip invisible high-frequency noise
        if ((base64.length * 0.75) > MAX_BYTES) {
            let quality = 0.95;
            while ((base64.length * 0.75) > MAX_BYTES && quality > 0.4) {
                // Step 1: Export to high-quality lossy JPEG to remove noise
                const jpegData = canvas.toDataURL('image/jpeg', quality);

                // Step 2: Load the JPEG back into an Image object
                const midImg = await new Promise(res => {
                    const i = new Image();
                    i.onload = () => res(i);
                    i.src = jpegData;
                });

                // Step 3: Draw back to Canvas and re-export as PNG
                const midCanvas = document.createElement('canvas');
                midCanvas.width = targetWidth;
                midCanvas.height = targetHeight;
                midCanvas.getContext('2d').drawImage(midImg, 0, 0);
                base64 = midCanvas.toDataURL('image/png').split(',')[1];

                quality -= 0.15; // Gradually decrease quality if still too big
            }
        }

        return base64;
    };

    const removeGreenBackground = (canvas) => {
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        const isGreen = (r, g, b) => {
            // Hard threshold for #00FF00 based green screen
            return g > 150 && g > r * 1.4 && g > b * 1.4;
        };

        const visited = new Uint8Array(w * h);
        const stack = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];

        while (stack.length) {
            const [x, y] = stack.pop();
            const offset = y * w + x;
            if (x < 0 || x >= w || y < 0 || y >= h || visited[offset]) continue;
            visited[offset] = 1;

            const idx = offset * 4;
            if (isGreen(data[idx], data[idx + 1], data[idx + 2])) {
                data[idx + 3] = 0;
                stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }

        // Final cleanup for isolated green pixels
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0 && isGreen(data[i], data[i + 1], data[i + 2])) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    };

    const sliceImageGrid = (dataUrl, colCount, rowCount, tileW, tileH, removeBg = false) => {
        return new Promise((resolve, reject) => {
            if (!dataUrl) return resolve([]);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const tiles = [];
                const srcTileW = img.width / colCount;
                const srcTileH = img.height / rowCount;

                for (let r = 0; r < rowCount; r++) {
                    for (let c = 0; c < colCount; c++) {
                        let canvas = document.createElement('canvas');
                        canvas.width = tileW;
                        canvas.height = tileH;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, c * srcTileW, r * srcTileH, srcTileW, srcTileH, 0, 0, tileW, tileH);

                        if (removeBg) {
                            canvas = removeGreenBackground(canvas);
                        }

                        tiles.push(canvas.toDataURL('image/png').split(',')[1]);
                    }
                }
                resolve(tiles);
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = dataUrl;
        });
    };

    const generateThemeZip = async (assets) => {
        const zip = new JSZip();

        const { mainImageIos, mainImageAndroid, mainImageStore, menuOffImage, menuOnImage, menuBgImage, passcodeIosOffImage, passcodeIosOnImage, passcodeAndroidOffImage, passcodeAndroidOnImage, profileIosImage, profileAndroidImage, chatBgIosImage, chatBgAndroidImage } = assets;

        const mainFallback = mainImageIos || mainImageAndroid || mainImageStore || chatBgIosImage || chatBgAndroidImage;

        // 1. Main Images
        const mainFolder = zip.folder("1_Main");
        if (mainImageIos) mainFolder.file("ios_thumbnail.png", await resizeImage(mainImageIos, 200, 284, 'cover'), { base64: true });
        if (mainImageAndroid) mainFolder.file("android_thumbnail.png", await resizeImage(mainImageAndroid, 136, 202, 'cover'), { base64: true });
        if (mainImageStore) mainFolder.file("store_thumbnail.png", await resizeImage(mainImageStore, 198, 278, 'cover'), { base64: true });

        // 2. Menu Buttons
        if (menuOffImage && menuOnImage) {
            const menuFolder = zip.folder("2_MenuButtons");

            const MENU_MAPPING = [
                { off: "i_29.png", on: "i_30.png" }, // 1. 主頁
                { off: "i_03.png", on: "i_04.png" }, // 2. 聊天
                { off: "i_33.png", on: "i_34.png" }, // 3. VOOM
                { off: "i_35.png", on: "i_36.png" }, // 4. 購物
                { off: "i_07.png", on: "i_08.png" }, // 5. 通話
                { off: "i_25.png", on: "i_26.png" }, // 6. 新聞
                { off: "i_31.png", on: "i_32.png" }, // 7. TODAY
                { off: "i_27.png", on: "i_28.png" }, // 8. 錢包
                { off: "i_37.png", on: "i_38.png" }, // 9. MINI
            ];

            const offTiles = await sliceImageGrid(menuOffImage, 3, 3, 128, 150, true);
            const onTiles = await sliceImageGrid(menuOnImage, 3, 3, 128, 150, true);

            for (let i = 0; i < 9; i++) {
                if (offTiles[i]) menuFolder.file(MENU_MAPPING[i].off, offTiles[i], { base64: true });
                if (onTiles[i]) menuFolder.file(MENU_MAPPING[i].on, onTiles[i], { base64: true });
            }
        }

        // 3. MenuBackground
        if (menuBgImage) {
            const menuBgFolder = zip.folder("3_MenuBackground");
            // 1472x150 for general repeating iOS background
            menuBgFolder.file("menu_bg.png", await resizeImage(menuBgImage, 1472, 150, 'cover'), { base64: true });
        }

        // 4. Passcode
        const hasPasscode = passcodeIosOffImage || passcodeIosOnImage || passcodeAndroidOffImage || passcodeAndroidOnImage;
        if (hasPasscode) {
            const passcodeFolder = zip.folder("4_Passcode");

            // iOS fallback logic
            const iosOff = passcodeIosOffImage || passcodeAndroidOffImage;
            const iosOn = passcodeIosOnImage || passcodeAndroidOnImage || iosOff;

            // Android fallback logic
            const androidOff = passcodeAndroidOffImage || passcodeIosOffImage;
            const androidOn = passcodeAndroidOnImage || passcodeIosOnImage || androidOff;

            const iosOffTiles = await sliceImageGrid(iosOff, 2, 2, 120, 120, true);
            const iosOnTiles = await sliceImageGrid(iosOn, 2, 2, 120, 120, true);

            const androidOffTiles = await sliceImageGrid(androidOff, 2, 2, 116, 116, true);
            const androidOnTiles = await sliceImageGrid(androidOn, 2, 2, 116, 116, true);

            const iosMapping = [
                { off: 'i_12.png', on: 'i_13.png' },
                { off: 'i_14.png', on: 'i_15.png' },
                { off: 'i_16.png', on: 'i_17.png' },
                { off: 'i_18.png', on: 'i_19.png' }
            ];

            const androidMapping = [
                { off: 'a_12.png', on: 'a_13.png' },
                { off: 'a_14.png', on: 'a_15.png' },
                { off: 'a_16.png', on: 'a_17.png' },
                { off: 'a_18.png', on: 'a_19.png' }
            ];

            for (let i = 0; i < 4; i++) {
                if (iosOffTiles[i]) passcodeFolder.file(iosMapping[i].off, iosOffTiles[i], { base64: true });
                if (iosOnTiles[i]) passcodeFolder.file(iosMapping[i].on, iosOnTiles[i], { base64: true });
                if (androidOffTiles[i]) passcodeFolder.file(androidMapping[i].off, androidOffTiles[i], { base64: true });
                if (androidOnTiles[i]) passcodeFolder.file(androidMapping[i].on, androidOnTiles[i], { base64: true });
            }
        }

        // 5. Profile
        const hasProfile = profileIosImage || profileAndroidImage;
        if (hasProfile) {
            const profileFolder = zip.folder("5_Profile");

            const iosTiles = await sliceImageGrid(profileIosImage || profileAndroidImage, 1, 2, 240, 240);
            const androidTiles = await sliceImageGrid(profileAndroidImage || profileIosImage, 1, 2, 247, 247);

            // iOS
            if (iosTiles[0]) profileFolder.file("i_20.png", iosTiles[0], { base64: true });
            if (iosTiles[1]) profileFolder.file("i_21.png", iosTiles[1], { base64: true });

            // Android
            if (androidTiles[0]) profileFolder.file("a_20.png", androidTiles[0], { base64: true });
            if (androidTiles[1]) profileFolder.file("a_21.png", androidTiles[1], { base64: true });
        }

        // 6. ChatBackground
        const hasChatBg = chatBgIosImage || chatBgAndroidImage;
        if (hasChatBg) {
            const chatBgFolder = zip.folder("6_ChatBackground");
            const iosImg = chatBgIosImage || chatBgAndroidImage;
            const androidImg = chatBgAndroidImage || chatBgIosImage;

            chatBgFolder.file("i_22.png", await resizeImage(iosImg, 1482, 1334, 'cover'), { base64: true });
            chatBgFolder.file("a_22.png", await resizeImage(androidImg, 1300, 1300, 'cover'), { base64: true });
        }

        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "LINE_Theme_Assets.zip");
    };

    return { generateThemeZip };
};

export default useThemePack;
