import { useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// Free-form crop modal shown before an image is uploaded: drag any edge/corner to resize,
// drag the middle to move. Optional 1:1 lock for perfectly square product cards.
// onApply(cropPixels) with the selected area (in NATURAL image pixels), or onApply(null)
// to upload the whole image uncropped.
function ImageCropper({ src, busy = false, onCancel, onApply }) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completed, setCompleted] = useState(null)
  const [square, setSquare] = useState(false)

  // default selection: centered, 90% of the image (respecting the 1:1 lock)
  function makeDefault(width, height, locked) {
    const base = { unit: '%', width: 90, height: 90, x: 5, y: 5 }
    const c = locked
      ? makeAspectCrop({ unit: '%', width: 90 }, 1, width, height)
      : base
    return centerCrop(c, width, height)
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget
    setCrop(makeDefault(width, height, square))
  }

  function toggleSquare(e) {
    const locked = e.target.checked
    setSquare(locked)
    const img = imgRef.current
    if (img) setCrop(makeDefault(img.width, img.height, locked))
  }

  // convert the on-screen crop to natural-image pixels for the canvas
  function apply() {
    const img = imgRef.current
    if (!img || !completed?.width || !completed?.height) {
      onApply(null) // nothing selected → upload the whole image
      return
    }
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    onApply({
      x: completed.x * scaleX,
      y: completed.y * scaleY,
      width: completed.width * scaleX,
      height: completed.height * scaleY,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex items-center justify-center bg-charcoal p-3 max-h-[65vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompleted(c)}
            aspect={square ? 1 : undefined}
            keepSelection
          >
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={onImageLoad}
              className="max-h-[58vh] w-auto"
            />
          </ReactCrop>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={square}
              onChange={toggleSquare}
              className="w-4 h-4 accent-rose"
            />
            <span className="text-sm font-medium">قص مربّع (1:1) — أفضل شكل في بطاقات المنتجات</span>
          </label>
          <p className="-mt-1 text-xs text-taupe">
            اسحب أي حافة أو زاوية لتغيير حجم منطقة القص، واسحب من المنتصف لتحريكها.
          </p>

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
              onClick={apply}
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
