import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { compressImage } from '../lib/compressImage.js'
import { getCroppedBlob } from '../lib/cropImage.js'
import ImageCropper from './ImageCropper.jsx'

const MAX_IMAGES = 15

export function imageUrl(storagePath) {
  return supabase.storage.from('product-images').getPublicUrl(storagePath).data.publicUrl
}

function ProductImages({ productId }) {
  const [images, setImages] = useState(null) // null = loading
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState([]) // files queued for the crop step
  const [cropSrc, setCropSrc] = useState(null)
  const posRef = useRef(0)
  const currentFile = pending[0] ?? null

  // object URL for the file currently in the cropper
  useEffect(() => {
    if (!currentFile) {
      setCropSrc(null)
      return
    }
    const url = URL.createObjectURL(currentFile)
    setCropSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [currentFile])

  const load = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('position')
    if (dbError) setError('تعذّر تحميل الصور')
    else setImages(data)
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  if (!images) {
    return (
      <div className="rounded-2xl bg-white border border-rose/15 p-6 flex justify-center">
        <span className="h-8 w-8 rounded-full border-4 border-rose/25 border-t-rose animate-spin" />
      </div>
    )
  }

  const mainPosition = images.length ? Math.min(...images.map((i) => i.position)) : null

  // pick files → queue them for the crop step (one modal per file)
  function handleFiles(e) {
    const files = [...e.target.files]
    e.target.value = '' // allow picking the same file again later
    if (!files.length) return
    if (images.length + files.length > MAX_IMAGES) {
      setError(`الحد الأقصى ${MAX_IMAGES} صورة لكل منتج`)
      return
    }
    setError(null)
    posRef.current = images.length ? Math.max(...images.map((i) => i.position)) + 1 : 0
    setPending(files)
  }

  async function uploadBlob(blob) {
    const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const { error: upError } = await supabase.storage
      .from('product-images')
      .upload(path, blob, { contentType: 'image/webp' })
    if (upError) throw upError
    const { error: insError } = await supabase
      .from('product_images')
      .insert({ product_id: productId, storage_path: path, position: posRef.current++ })
    if (insError) {
      // keep DB and storage consistent: remove the orphaned file
      await supabase.storage.from('product-images').remove([path])
      throw insError
    }
  }

  // cropPixels = area from the cropper, or null to upload the whole image (just compressed)
  async function processCurrent(cropPixels) {
    const file = currentFile
    setBusy(true)
    setError(null)
    try {
      const blob = cropPixels ? await getCroppedBlob(cropSrc, cropPixels) : await compressImage(file)
      await uploadBlob(blob)
    } catch (err) {
      setError(
        String(err.message ?? '').includes('15')
          ? `الحد الأقصى ${MAX_IMAGES} صورة لكل منتج`
          : 'تعذّر رفع الصورة — تأكد أنها صورة صالحة وحاول مجدداً'
      )
      setPending([]) // abort the rest of the batch
      await load()
      setBusy(false)
      return
    }
    setPending((p) => p.slice(1))
    await load()
    setBusy(false)
  }

  async function handleDelete(img) {
    if (!window.confirm('حذف هذه الصورة؟')) return
    setBusy(true)
    setError(null)
    const { error: delError } = await supabase.from('product_images').delete().eq('id', img.id)
    if (delError) {
      setError('تعذّر حذف الصورة')
    } else {
      await supabase.storage.from('product-images').remove([img.storage_path])
    }
    await load()
    setBusy(false)
  }

  async function makeMain(img) {
    if (img.position === mainPosition) return
    setBusy(true)
    setError(null)
    // main image = smallest position; min-1 never collides with the unique constraint
    const { error: updError } = await supabase
      .from('product_images')
      .update({ position: mainPosition - 1 })
      .eq('id', img.id)
    if (updError) setError('تعذّر تغيير الصورة الرئيسية')
    await load()
    setBusy(false)
  }

  return (
    <div className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-rose-dark">صور المنتج</h2>
        <span className="text-sm text-taupe">
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden border border-rose/15">
            <img src={imageUrl(img.storage_path)} alt="" className="aspect-square w-full object-cover" />
            {img.position === mainPosition && (
              <span className="absolute top-1.5 start-1.5 rounded-full bg-rose text-white text-[10px] font-bold px-2 py-0.5">
                رئيسية
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1.5 bg-charcoal/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              {img.position !== mainPosition && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => makeMain(img)}
                  className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-charcoal hover:bg-white"
                >
                  اجعلها رئيسية
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDelete(img)}
                aria-label="حذف الصورة"
                className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-red-700 hover:bg-white"
              >
                حذف
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label
            className={`aspect-square rounded-xl border-2 border-dashed border-rose/30 flex flex-col items-center justify-center gap-1 text-taupe hover:border-rose hover:text-rose-dark transition-colors cursor-pointer ${
              busy ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {busy ? (
              <span className="h-6 w-6 rounded-full border-[3px] border-rose/25 border-t-rose animate-spin" />
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs">إضافة صور</span>
              </>
            )}
            <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={busy} className="hidden" />
          </label>
        )}
      </div>

      <p className="text-xs text-taupe">
        الصورة «الرئيسية» هي التي تظهر في صفحات الموقع. يمكنك قص كل صورة قبل الرفع، ويتم ضغطها تلقائياً.
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm text-rose-dark">
          {error}
        </p>
      )}

      {cropSrc && (
        <ImageCropper src={cropSrc} busy={busy} onCancel={() => setPending([])} onApply={processCurrent} />
      )}
    </div>
  )
}

export default ProductImages
