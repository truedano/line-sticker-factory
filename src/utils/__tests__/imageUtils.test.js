import { describe, it, expect } from 'vitest';
import { calculateSliceDimensions } from '../imageUtils';

describe('imageUtils', () => {
    describe('calculateSliceDimensions', () => {
        it('should correctly calculate dimensions for a simple 2x2 grid without crop', () => {
            // 800x800 image, 2x2 grid, 0% crop
            const imgW = 800;
            const imgH = 800;
            const cols = 2;
            const rows = 2;
            const c = 0; // Top-left cell
            const r = 0;
            const cropPercent = 0;

            const result = calculateSliceDimensions(imgW, imgH, cols, rows, c, r, cropPercent);

            expect(result).toEqual({
                sourceX: 0,
                sourceY: 0,
                sourceWidth: 400,
                sourceHeight: 400,
                canvasWidth: 400,
                canvasHeight: 400
            });
        });

        it('should correctly calculate dimensions with cropPercent', () => {
            // 1000x1000 image, 2x2 grid (500x500 cells), 10% crop (50px inset)
            const imgW = 1000;
            const imgH = 1000;
            const cols = 2;
            const rows = 2;
            const c = 0;
            const r = 0;
            const cropPercent = 10;

            const result = calculateSliceDimensions(imgW, imgH, cols, rows, c, r, cropPercent);

            expect(result).toEqual({
                sourceX: 50,      // 0 + 50
                sourceY: 50,      // 0 + 50
                sourceWidth: 400, // 500 - 2 * 50
                sourceHeight: 400,// 500 - 2 * 50
                canvasWidth: 400,
                canvasHeight: 400
            });
        });

        it('should handle non-zero col/row index', () => {
            // 1000x1000 image, 2x2 grid (500x500 cells), 10% crop
            // Bottom-right cell (1, 1)
            const imgW = 1000;
            const imgH = 1000;
            const cols = 2;
            const rows = 2;
            const c = 1;
            const r = 1;
            const cropPercent = 10;

            const result = calculateSliceDimensions(imgW, imgH, cols, rows, c, r, cropPercent);

            expect(result).toEqual({
                sourceX: 550,     // 500 + 50
                sourceY: 550,     // 500 + 50
                sourceWidth: 400, // 500 - 100
                sourceHeight: 400,
                canvasWidth: 400,
                canvasHeight: 400
            });
        });

        it('should use Math.round correctly for non-integer dimensions', () => {
            // 100x100 image, 3x3 grid
            // Grid cell widths: 33, 34, 33 (0-33, 33-67, 67-100)
            const imgW = 100;
            const imgH = 100;
            const cols = 3;
            const rows = 3;
            const c = 1; // Middle cell
            const r = 1; // Middle cell
            const cropPercent = 0;

            // calc for c=1, r=1
            // x1 = round(1 * 100 / 3) = 33
            // x2 = round(2 * 100 / 3) = 67
            // rawW = 67 - 33 = 34
            const result = calculateSliceDimensions(imgW, imgH, cols, rows, c, r, cropPercent);

            expect(result).toEqual({
                sourceX: 33,
                sourceY: 33,
                sourceWidth: 34,
                sourceHeight: 34,
                canvasWidth: 34,
                canvasHeight: 34
            });
        });
    });
});
