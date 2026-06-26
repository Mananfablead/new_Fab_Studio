/**
 * Canvas-based watermark utility functions
 * This merges watermarks directly into images so they persist when downloaded
 */

interface WatermarkOptions {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  opacity?: number;
  scale?: number; // 0-1, percentage of image width
  margin?: number; // pixels from edge
  isTiled?: boolean;
  type?: 'image' | 'text';
}

/**
 * Add watermark to an image using HTML Canvas
 * @param originalImageUrl - URL of the original image
 * @param watermarkContent - URL of the watermark image or text string
 * @param options - Watermark positioning and styling options
 * @returns Promise<string> - Data URL of the watermarked image
 */
export const addWatermarkToImage = (
  originalImageUrl: string,
  watermarkContent: string,
  options: WatermarkOptions = {}
 ): Promise<string> => {
  const {
    position = 'bottom-right',
    opacity = 0.5,
    scale = 0.2, // 20% of image width
    margin = 20,
    isTiled = false,
    type = 'image'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.globalAlpha = opacity;

        if (type === 'image') {
          const watermark = new Image();
          watermark.crossOrigin = 'anonymous';
          watermark.onload = () => {
            const wmWidth = img.width * scale;
            const wmHeight = wmWidth * (watermark.height / watermark.width);

            if (isTiled) {
              const spacing = wmWidth * 2;
              for (let x = 0; x < canvas.width; x += wmWidth + spacing) {
                for (let y = 0; y < canvas.height; y += wmHeight + spacing) {
                  ctx.save();
                  ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
                  ctx.rotate(-Math.PI / 4);
                  ctx.drawImage(watermark, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                  ctx.restore();
                }
              }
            } else {
              let x = margin;
              let y = margin;
              switch (position) {
                case 'bottom-right':
                  x = canvas.width - wmWidth - margin;
                  y = canvas.height - wmHeight - margin;
                  break;
                case 'bottom-left':
                  x = margin;
                  y = canvas.height - wmHeight - margin;
                  break;
                case 'top-right':
                  x = canvas.width - wmWidth - margin;
                  y = margin;
                  break;
                case 'center':
                  x = (canvas.width - wmWidth) / 2;
                  y = (canvas.height - wmHeight) / 2;
                  break;
              }
              ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
            }
            resolve(canvas.toDataURL('image/png'));
          };
          watermark.src = watermarkContent;
        } else {
          // Text Watermark
          const fontSize = img.width * (scale / 2);
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = 'white';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          
          if (isTiled) {
            const spacing = fontSize * 3;
            for (let x = 0; x < canvas.width; x += spacing) {
              for (let y = 0; y < canvas.height; y += spacing) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 4);
                ctx.fillText(watermarkContent, 0, 0);
                ctx.restore();
              }
            }
          } else {
            const metrics = ctx.measureText(watermarkContent);
            const textWidth = metrics.width;
            let x = margin;
            let y = margin + fontSize;

            switch (position) {
              case 'bottom-right':
                x = canvas.width - textWidth - margin;
                y = canvas.height - margin;
                break;
              case 'bottom-left':
                x = margin;
                y = canvas.height - margin;
                break;
              case 'top-right':
                x = canvas.width - textWidth - margin;
                y = margin + fontSize;
                break;
              case 'center':
                x = (canvas.width - textWidth) / 2;
                y = (canvas.height + fontSize) / 2;
                break;
            }
            ctx.fillText(watermarkContent, x, y);
          }
          resolve(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = originalImageUrl;
  });
};

export const shouldApplyWatermark = (enabled: boolean, image: string | null): boolean => enabled && !!image;
