import sharp, { type FormatEnum } from "sharp";

type AspectRatio = Record<string, { width: number; height: number }>;

export interface CompressImageOpts {
    size: AspectRatio[string];
    /** `webp` by default. */
    format?: keyof FormatEnum;
    /** `95` by default. */
    quality?: number;
}

export const twoByThree = {
    small: { width: 360, height: 540 },
    medium: { width: 540, height: 810 },
    large: { width: 810, height: 1215 },
} as const satisfies AspectRatio;

export const oneByOne = {
    small: { width: 360, height: 360 },
    medium: { width: 720, height: 720 },
    large: { width: 1440, height: 1440 },
} as const satisfies AspectRatio;

export function compressImage(buffer: ArrayBuffer | Buffer<ArrayBuffer>, opts: CompressImageOpts) {
    return sharp(buffer)
        .withMetadata()
        .autoOrient()
        .resize(opts.size.width, opts.size.height)
        .toFormat(opts.format || "webp", { quality: opts.quality || 95 })
        .toBuffer();
}
