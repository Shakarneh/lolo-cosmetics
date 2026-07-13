// Crop an image (object URL / data URL) to the given pixel rect and export a square WebP.
// Used by the admin media editor before upload. Mirrors compressImage's WebP/quality output.
export async function getCroppedBlob(src, cropPixels, { maxSize = 1200, quality = 0.82 } = {}) {
  const img = await loadImage(src)
  const out = Math.max(1, Math.round(Math.min(cropPixels.width, maxSize)))
  const canvas = document.createElement('canvas')
  canvas.width = out
  canvas.height = out
  canvas
    .getContext('2d')
    .drawImage(img, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, 0, 0, out, out)
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
