// Crop an image (object URL / data URL) to the given pixel rect and export WebP.
// Handles any aspect ratio (the crop box is free-form); the long side is capped at maxSize.
// Used by the admin media editor before upload. Mirrors compressImage's WebP/quality output.
export async function getCroppedBlob(src, cropPixels, { maxSize = 1200, quality = 0.82 } = {}) {
  const img = await loadImage(src)
  const { x, y, width, height } = cropPixels
  const scale = Math.min(1, maxSize / Math.max(width, height))
  const outW = Math.max(1, Math.round(width * scale))
  const outH = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  canvas.getContext('2d').drawImage(img, x, y, width, height, 0, 0, outW, outH)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) throw new Error('crop failed')
  return blob
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
