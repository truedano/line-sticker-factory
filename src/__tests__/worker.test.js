import { describe, it, expect } from 'vitest';
import { hexToRgb, colorDistance, isPixelBackgroundHSVHard, removeBgFloodFill, removeBgFeathered, applyErosion } from '../worker.js';

describe('Web Worker Image Processing Logic', () => {
    describe('hexToRgb', () => {
        it('should convert standard hex to rgb', () => {
            expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
            expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
            expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('should handle hex without hash', () => {
            expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
        });
    });

    describe('colorDistance', () => {
        it('should compute exact euclidean distance', () => {
            // Distance between (0,0,0) and (0,3,4) should be 5
            expect(colorDistance(0, 0, 0, 0, 3, 4)).toBe(5);
        });
    });

    describe('isPixelBackgroundHSVHard', () => {
        it('should identify pure green as background', () => {
            expect(isPixelBackgroundHSVHard(0, 255, 0, 30)).toBe(true);
        });

        it('should reject non-green prominent colors (red, blue)', () => {
            expect(isPixelBackgroundHSVHard(255, 0, 0, 30)).toBe(false);
            expect(isPixelBackgroundHSVHard(0, 0, 255, 30)).toBe(false);
            expect(isPixelBackgroundHSVHard(255, 255, 255, 30)).toBe(false);
            expect(isPixelBackgroundHSVHard(100, 100, 100, 30)).toBe(false);
        });
    });

    describe('removeBgFloodFill', () => {
        it('should correctly remove green background using flood fill', () => {
            // 2x2 grid
            // Green | Green
            // Red   | Green
            const data = new Uint8ClampedArray([
                0, 255, 0, 255,   // top-left (green)
                0, 255, 0, 255,   // top-right (green)
                255, 0, 0, 255,   // bottom-left (red, foreground)
                0, 255, 0, 255    // bottom-right (green)
            ]);
            
            const imgData = { data, width: 2, height: 2 };
            removeBgFloodFill(imgData, 2, 2, '#00FF00', 30);

            expect(imgData.data[3]).toBe(0);   // top-left removed
            expect(imgData.data[7]).toBe(0);   // top-right removed
            expect(imgData.data[11]).toBe(255); // bottom-left kept!
            expect(imgData.data[15]).toBe(0);  // bottom-right removed
        });

        it('should clean residual green pockets using global scan', () => {
             // 3x1 grid
             // Green | Red | Green (pocket)
             // The pocket might be disconnected from corners depending on traversal, 
             // but our flood fill second pass should strip it.
             const data = new Uint8ClampedArray([
                 0, 255, 0, 255,   
                 255, 0, 0, 255,   
                 0, 255, 0, 255    
             ]);
             
             const imgData = { data, width: 3, height: 1 };
             removeBgFloodFill(imgData, 3, 1, '#00FF00', 30);
 
             expect(imgData.data[3]).toBe(0);   // removed
             expect(imgData.data[7]).toBe(255); // kept
             expect(imgData.data[11]).toBe(0);  // removed
        });
    });

    describe('applyErosion', () => {
        it('should erode outer edge pixels of the foreground', () => {
            // 3x3 grid
            // All transparent except a solid 3x3 block in the middle? 
            // Let's make an isolated 1 pixel block in a 3x3
            // Trans | Trans | Trans
            // Trans | Solid | Trans
            // Trans | Trans | Trans
            const data = new Uint8ClampedArray([
                0,0,0,0,  0,0,0,0,  0,0,0,0,
                0,0,0,0,  255,0,0,255, 0,0,0,0,
                0,0,0,0,  0,0,0,0,  0,0,0,0
            ]);

            const imgData = { data, width: 3, height: 3 };
            
            // Apply erosion of strength 1
            applyErosion(imgData, 3, 3, 1);

            // The central solid pixel is surrounded by transparent pixels (alpha 0),
            // so it should be eroded (alpha becomes 0)
            expect(imgData.data[4 * 4 + 3]).toBe(0); // central pixel alpha
        });
    });
});
