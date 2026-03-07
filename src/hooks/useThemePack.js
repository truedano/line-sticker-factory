import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const useThemePack = () => {
    // Utility to resize and crop image, returning base64
    const resizeImage = (dataUrl, targetWidth, targetHeight, mode = 'cover') => {
        return new Promise((resolve, reject) => {
            if (!dataUrl) {
                resolve(null);
                return;
            }
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

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
                    // stretch
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                }

                resolve(canvas.toDataURL('image/png').split(',')[1]);
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = dataUrl;
        });
    };

    const generateThemeZip = async (assets) => {
        const zip = new JSZip();

        const { mainImageIos, mainImageAndroid, mainImageStore, menuOffImage, menuOnImage, bgImage, passcodeImage, profileImage } = assets;

        const mainFallback = mainImageIos || mainImageAndroid || mainImageStore || bgImage || profileImage;

        // 1. MainImages
        if (mainFallback) {
            const mainFolder = zip.folder("1_MainImages");
            mainFolder.file("ios_thumbnail.png", await resizeImage(mainImageIos || mainFallback, 200, 284, 'cover'), { base64: true });
            mainFolder.file("android_thumbnail.png", await resizeImage(mainImageAndroid || mainFallback, 136, 202, 'cover'), { base64: true });
            mainFolder.file("store_thumbnail.png", await resizeImage(mainImageStore || mainFallback, 198, 278, 'cover'), { base64: true });
        }

        // 2. MenuButtons
        if (menuOffImage && menuOnImage) {
            const menuFolder = zip.folder("2_MenuButtons");
            const offBase = await resizeImage(menuOffImage, 128, 150, 'contain');
            const onBase = await resizeImage(menuOnImage, 128, 150, 'contain');

            // Generate 10 sets of menu icons as fallbacks
            for (let i = 1; i <= 10; i++) {
                const num = i.toString().padStart(2, '0');
                menuFolder.file(`${num}_off.png`, offBase, { base64: true });
                menuFolder.file(`${num}_on.png`, onBase, { base64: true });
            }
        }

        // 3. MenuBackground
        if (bgImage) {
            const menuBgFolder = zip.folder("3_MenuBackground");
            // 1472x150 for general repeating iOS background
            menuBgFolder.file("menu_bg.png", await resizeImage(bgImage, 1472, 150, 'cover'), { base64: true });
        }

        // 4. Passcode
        if (passcodeImage) {
            const passcodeFolder = zip.folder("4_Passcode");
            const passOff = await resizeImage(passcodeImage, 120, 120, 'contain');
            const passOn = await resizeImage(passcodeImage, 120, 120, 'cover'); // Just as variation

            for (let i = 1; i <= 4; i++) {
                passcodeFolder.file(`passcode_off_${i}.png`, passOff, { base64: true });
                passcodeFolder.file(`passcode_on_${i}.png`, passOn, { base64: true });
            }
        }

        // 5. Profile
        if (profileImage) {
            const profileFolder = zip.folder("5_Profile");
            profileFolder.file("profile_personal.png", await resizeImage(profileImage, 240, 240, 'cover'), { base64: true });
            profileFolder.file("profile_group.png", await resizeImage(profileImage, 240, 240, 'cover'), { base64: true });
        }

        // 6. ChatBackground
        if (bgImage) {
            const chatBgFolder = zip.folder("6_ChatBackground");
            chatBgFolder.file("chat_bg_ios.png", await resizeImage(bgImage, 1482, 1334, 'cover'), { base64: true });
            chatBgFolder.file("chat_bg_android.png", await resizeImage(bgImage, 1300, 1300, 'cover'), { base64: true });
        }

        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "LINE_Theme_Assets.zip");
    };

    return { generateThemeZip };
};

export default useThemePack;
