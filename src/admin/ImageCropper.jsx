import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'

// Square-crop modal shown before an image is uploaded. onApply(cropPixels) with the
// selected area, or onApply(null) to upload without cropping. aspect is fixed 1:1 to
// match the product card / gallery tiles.
function ImageCropper({ src, busy = false, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pixels, setPixels] = useState(null)
  const onCropComplete = useCallback((_, p) => setPixels(p), [])

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="relative h-80 bg-charcoal">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 flex flex-col gap-3">
          <label className="flex items-center gap-3 text-sm text-taupe">
            تكبير
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-rose"
            />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-full border border-rose/25 px-4 py-2 text-sm text-rose-dark hover:bg-blush disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => onApply(null)}
              disabled={busy}
              className="rounded-full border border-rose/25 px-4 py-2 text-sm text-taupe hover:bg-blush disabled:opacity-50"
            >
              بدون قص
            </button>
            <button
              type="button"
              onClick={() => onApply(pixels)}
              disabled={busy}
              className="rounded-full bg-rose px-5 py-2 text-sm font-bold text-white hover:bg-rose-dark disabled:opacity-50"
            >
              قص وحفظ
            </button>
          </div>
        </div>
        {busy && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="h-9 w-9 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageCropper
