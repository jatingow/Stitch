/**
 * Image processing utilities for client-side rotation, cropping, and compression.
 */

export async function rotateImage(imageSrc, degrees = 90) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));

      const is90or270 = Math.abs(degrees % 180) === 90;
      canvas.width = is90or270 ? img.naturalHeight : img.naturalWidth;
      canvas.height = is90or270 ? img.naturalWidth : img.naturalHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to create blob from rotated canvas'));
          const previewUrl = URL.createObjectURL(blob);
          resolve({ blob, previewUrl, width: canvas.width, height: canvas.height });
        },
        'image/png'
      );
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

export async function cropImage(imageElement, completedCrop) {
  if (!completedCrop || !imageElement) {
    throw new Error('Crop coordinates or image element missing');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const scaleX = imageElement.naturalWidth / imageElement.width;
  const scaleY = imageElement.naturalHeight / imageElement.height;

  const pixelX = completedCrop.x * scaleX;
  const pixelY = completedCrop.y * scaleY;
  const pixelWidth = completedCrop.width * scaleX;
  const pixelHeight = completedCrop.height * scaleY;

  canvas.width = Math.max(1, Math.round(pixelWidth));
  canvas.height = Math.max(1, Math.round(pixelHeight));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    imageElement,
    pixelX,
    pixelY,
    pixelWidth,
    pixelHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to create blob from cropped canvas'));
        const previewUrl = URL.createObjectURL(blob);
        resolve({ blob, previewUrl, width: canvas.width, height: canvas.height });
      },
      'image/png'
    );
  });
}

export async function prepareImageForPDF({
  imageSrc,
  smartScaling = 'fit',
  pageWidth,
  pageHeight,
  margin = 10,
  quality = 'high',
}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      const printWidth = Math.max(5, pageWidth - 2 * margin);
      const printHeight = Math.max(5, pageHeight - 2 * margin);
      const targetAspect = printWidth / printHeight;
      const srcAspect = srcW / srcH;

      // Quality presets
      let maxDimension = 2400;
      let jpegQuality = 0.92;
      if (quality === 'medium') {
        maxDimension = 1600;
        jpegQuality = 0.75;
      } else if (quality === 'low') {
        maxDimension = 1000;
        jpegQuality = 0.55;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let renderX = margin;
      let renderY = margin;
      let renderWidth = printWidth;
      let renderHeight = printHeight;

      if (smartScaling === 'fill') {
        // "Fill Page": scale & crop image to completely fill printable dimensions
        let sx = 0, sy = 0, sw = srcW, sh = srcH;
        if (srcAspect > targetAspect) {
          // Wider than target box: crop horizontal sides
          sw = srcH * targetAspect;
          sx = (srcW - sw) / 2;
        } else {
          // Taller than target box: crop vertical sides
          sh = srcW / targetAspect;
          sy = (srcH - sh) / 2;
        }

        let destW = sw;
        let destH = sh;
        if (destW > maxDimension || destH > maxDimension) {
          if (destW > destH) {
            destH = Math.round((destH * maxDimension) / destW);
            destW = maxDimension;
          } else {
            destW = Math.round((destW * maxDimension) / destH);
            destH = maxDimension;
          }
        }

        canvas.width = Math.max(1, Math.round(destW));
        canvas.height = Math.max(1, Math.round(destH));
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

        renderX = margin;
        renderY = margin;
        renderWidth = printWidth;
        renderHeight = printHeight;
      } else {
        // "Fit to Page": preserve aspect ratio, fits completely inside box with margins
        let finalW, finalH;
        if (srcAspect > targetAspect) {
          finalW = printWidth;
          finalH = printWidth / srcAspect;
        } else {
          finalH = printHeight;
          finalW = printHeight * srcAspect;
        }

        renderX = margin + (printWidth - finalW) / 2;
        renderY = margin + (printHeight - finalH) / 2;
        renderWidth = finalW;
        renderHeight = finalH;

        let destW = srcW;
        let destH = srcH;
        if (destW > maxDimension || destH > maxDimension) {
          if (destW > destH) {
            destH = Math.round((destH * maxDimension) / destW);
            destW = maxDimension;
          } else {
            destW = Math.round((destW * maxDimension) / destH);
            destH = maxDimension;
          }
        }

        canvas.width = Math.max(1, Math.round(destW));
        canvas.height = Math.max(1, Math.round(destH));
        ctx.drawImage(img, 0, 0, destW, destH);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
      resolve({
        dataUrl,
        x: renderX,
        y: renderY,
        width: renderWidth,
        height: renderHeight,
      });
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}
