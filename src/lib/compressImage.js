// Shrinks a photo before upload: max 1200px on the long side, WebP ~82% quality.
// A typical phone photo (3-8 MB) becomes ~100-300 KB, stretching the free 1 GB a long way.
export async function compressImage(file, { maxSize = 1200, quality = 0.82 } = {}) {
  const bitmap = await createImageBitmap(file) // throws on unsupported formats
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) throw new Error('compression failed')
  return blob
}
