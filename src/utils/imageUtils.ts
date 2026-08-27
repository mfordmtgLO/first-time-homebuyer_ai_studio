/**
 * Helper utility for processing local computer-saved image uploads (JPG, PNG, WEBP).
 * Resizes the image via HTML Canvas to a max dimension of 600px and compresses to a lightweight JPEG data URL (~30-50KB).
 * This ensures uploaded photos save instantly into profile state and localStorage without exceeding quota limits.
 */
export function processLocalImageFile(file: File, maxDimension = 600, quality = 0.85, forceSquare = true): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Selected file is not a valid image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Empty file content."));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data."));
      img.onload = () => {
        let srcWidth = img.width;
        let srcHeight = img.height;
        let destWidth = srcWidth;
        let destHeight = srcHeight;
        
        let sx = 0;
        let sy = 0;
        let sWidth = srcWidth;
        let sHeight = srcHeight;

        if (forceSquare) {
          const minDim = Math.min(srcWidth, srcHeight);
          sWidth = minDim;
          sHeight = minDim;
          sx = (srcWidth - minDim) / 2;
          sy = (srcHeight - minDim) / 2;
          destWidth = Math.min(minDim, maxDimension);
          destHeight = destWidth;
        } else {
          if (srcWidth > maxDimension || srcHeight > maxDimension) {
            if (srcWidth > srcHeight) {
              destHeight = Math.round((srcHeight * maxDimension) / srcWidth);
              destWidth = maxDimension;
            } else {
              destWidth = Math.round((srcWidth * maxDimension) / srcHeight);
              destHeight = maxDimension;
            }
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = destWidth;
        canvas.height = destHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          // Fallback to original data URL if canvas context unavailable
          resolve(src);
          return;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, destWidth, destHeight);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extracts initials from a full name (e.g., "Lonn Kilstrom" -> "LK", "Mike Ford" -> "MF")
 */
export function getInitials(name: string): string {
  if (!name) return "LO";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
