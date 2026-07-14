import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const MAX_MB = 50

export function videoUrl(path) {
  return supabase.storage.from('product-videos').getPublicUrl(path).data.publicUrl
}

// One optional video per product (stored in the product-videos bucket, path on products.video_path).
function ProductVideo({ productId, imageCount = 0 }) {
  const [videoPath, setVideoPath] = useState(undefined) // undefined = loading, null = none
  const [videoPosition, setVideoPosition] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from('products')
      .select('video_path, video_position')
      .eq('id', productId)
      .maybeSingle()
    if (dbError) setError('تعذّر تحميل الفيديو')
    else {
      setVideoPath(data?.video_path ?? null)
      setVideoPosition(data?.video_position ?? 0)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`حجم الفيديو كبير — الحد الأقصى ${MAX_MB} ميغابايت`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
      const path = `${productId}/video-${Date.now()}.${ext}`
      const { error: upError } = await supabase.storage
        .from('product-videos')
        .upload(path, file, { contentType: file.type })
      if (upError) throw upError
      const old = videoPath
      const { error: updError } = await supabase
        .from('products')
        .update({ video_path: path })
        .eq('id', productId)
      if (updError) {
        await supabase.storage.from('product-videos').remove([path])
        throw updError
      }
      if (old) await supabase.storage.from('product-videos').remove([old]) // drop the replaced file
      setVideoPath(path)
    } catch {
      setError('تعذّر رفع الفيديو — تأكد أنه ملف فيديو صالح وحاول مجدداً')
    }
    setBusy(false)
  }

  async function changePosition(e) {
    const val = Number(e.target.value)
    const previous = videoPosition
    setVideoPosition(val)
    const { error: updError } = await supabase
      .from('products')
      .update({ video_position: val })
      .eq('id', productId)
    if (updError) {
      setError('تعذّر تحديث موضع الفيديو')
      setVideoPosition(previous)
    }
  }

  async function handleDelete() {
    if (!window.confirm('حذف فيديو المنتج؟')) return
    setBusy(true)
    setError(null)
    const { error: updError } = await supabase
      .from('products')
      .update({ video_path: null })
      .eq('id', productId)
    if (updError) {
      setError('تعذّر حذف الفيديو')
    } else {
      if (videoPath) await supabase.storage.from('product-videos').remove([videoPath])
      setVideoPath(null)
    }
    setBusy(false)
  }

  return (
    <div className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
      <h2 className="font-bold text-rose-dark">فيديو المنتج (اختياري)</h2>

      {videoPath === undefined ? (
        <div className="flex justify-center py-4">
          <span className="h-8 w-8 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
        </div>
      ) : videoPath ? (
        <div className="flex flex-col gap-3">
          <video src={videoUrl(videoPath)} controls playsInline className="w-full max-h-72 rounded-xl bg-black" />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">موضع الفيديو في معرض الصور</span>
            <select
              value={Math.min(videoPosition, imageCount)}
              onChange={changePosition}
              className="w-full rounded-xl border border-rose/20 bg-white px-4 py-2.5 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
            >
              {Array.from({ length: imageCount + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0
                    ? 'في البداية (قبل كل الصور)'
                    : i === imageCount
                      ? 'في النهاية (بعد كل الصور)'
                      : `بعد الصورة ${i}`}
                </option>
              ))}
            </select>
          </label>
          <p className="-mt-1 text-xs text-taupe">
            اختر أين يظهر الفيديو بين صور المنتج على صفحة المنتج.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="self-start rounded-full border border-red-300 px-5 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {busy ? '...' : 'حذف الفيديو'}
          </button>
        </div>
      ) : (
        <label
          className={`rounded-xl border-2 border-dashed border-rose/30 flex flex-col items-center justify-center gap-1 py-8 text-taupe hover:border-rose hover:text-rose-dark transition-colors cursor-pointer ${
            busy ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {busy ? (
            <span className="h-6 w-6 rounded-full border-[3px] border-rose/25 border-t-rose animate-spin" />
          ) : (
            <>
              <span className="text-2xl leading-none">🎬</span>
              <span className="text-sm">إضافة فيديو</span>
            </>
          )}
          <input type="file" accept="video/*" onChange={handleFile} disabled={busy} className="hidden" />
        </label>
      )}

      <p className="text-xs text-taupe">
        فيديو واحد لكل منتج، بحد أقصى {MAX_MB} ميغابايت. يُفضّل مقطع قصير (MP4).
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}
    </div>
  )
}

export default ProductVideo
