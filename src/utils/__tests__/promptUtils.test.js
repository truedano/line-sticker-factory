import { describe, it, expect } from 'vitest';
import { generateStickerPrompt, generateEmojiPrompt, generateThemePrompt } from '../promptUtils';

describe('promptUtils', () => {
    describe('Sticker Prompts', () => {
        it('should contain basic sticker keywords', () => {
            const prompt = generateStickerPrompt({});
            expect(prompt).toContain('角色貼圖集');
            expect(prompt).toContain('AI Prompt 建議');
            expect(prompt).toContain('4 × 2');
        });
    });

    describe('Emoji Prompts', () => {
        it('should contain basic emoji keywords', () => {
            const prompt = generateEmojiPrompt({});
            expect(prompt).toContain('角色表情貼集');
            expect(prompt).toContain('寬 720 px × 高 360 px');
        });
    });

    describe('Theme Prompts', () => {
        it('should generate theme main prompt', () => {
            const prompt = generateThemePrompt({ typeId: 'main_ios' });
            expect(prompt).toContain('主要圖片 (iOS)');
            expect(prompt).toContain('寬度 200 px，高度 284 px');
        });

        it('should generate theme grid prompt', () => {
            const prompt = generateThemePrompt({ typeId: 'menu_btn_off' });
            expect(prompt).toContain('選單按鍵');
            expect(prompt).toContain('3 Columns × 3 Rows');
        });
    });
});
