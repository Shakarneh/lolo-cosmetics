import { useState } from 'react'
import { regenVariants } from '../lib/variations.js'

const PRESETS = ['اللون', 'الحجم', 'الشكل', 'الرائحة']

const cell =
  'w-full rounded-lg border border-rose/20 bg-white px-3 py-1.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition'

// One attribute (name + its values). Adding/removing a value regenerates combinations.
function AttributeCard({ attr, onAddValue, onRemoveValue, onRemove }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    onAddValue(draft)
    setDraft('')
  }
  return (
    <div className="rounded-xl bg-white border border-rose/15 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-rose-dark">{attr.name}</span>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">
          حذف الخاصية
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {attr.values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-full bg-blush/40 px-3 py-1 text-sm"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemoveValue(v)}
              aria-label={`حذف ${v}`}
              className="text-taupe hover:text-rose-dark font-bold"
            >
              ×
            </button>
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder="أضف قيمة"
            className="rounded-full border border-rose/20 bg-white px-3 py-1 text-sm w-28 outline-none focus:border-rose"
          />
          <button
            type="button"
            onClick={add}
            className="rounded-full border border-rose/30 px-3 py-1 text-sm text-rose-dark hover:bg-blush transition-colors"
          >
            +
          </button>
        </span>
      </div>
    </div>
  )
}

// eBay-style: define each attribute's values → auto-generated combination table with a
// price + SKU per row, plus a bulk "set price for all". value = { attributes, variants }.
function VariationsEditor({ value, onChange }) {
  const attributes = value.attributes ?? []
  const variants = value.variants ?? []
  const [custom, setCustom] = useState('')
  const [bulk, setBulk] = useState('')

  // any change to attributes/values regenerates the combination list (preserving price/code)
  const setAttributes = (next) => onChange({ attributes: next, variants: regenVariants(next, variants) })

  const addAttribute = (name) => {
    const n = name.trim()
    if (!n || attributes.some((a) => a.name === n)) return
    setAttributes([...attributes, { name: n, values: [] }])
  }
  const removeAttribute = (i) => setAttributes(attributes.filter((_, idx) => idx !== i))
  const addValue = (i, val) => {
    const v = val.trim()
    if (!v || attributes[i].values.includes(v)) return
    setAttributes(attributes.map((a, idx) => (idx === i ? { ...a, values: [...a.values, v] } : a)))
  }
  const removeValue = (i, val) =>
    setAttributes(
      attributes.map((a, idx) => (idx === i ? { ...a, values: a.values.filter((x) => x !== val) } : a))
    )

  const setVariant = (key, patch) =>
    onChange({ attributes, variants: variants.map((v) => (v.key === key ? { ...v, ...patch } : v)) })
  const applyBulkPrice = () => {
    if (bulk === '') return
    onChange({ attributes, variants: variants.map((v) => ({ ...v, price: bulk })) })
  }

  const usedPresets = attributes.map((a) => a.name)
  const availablePresets = PRESETS.filter((p) => !usedPresets.includes(p))
  const attrCols = attributes.filter((a) => a.values.length > 0)

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-blush/20 p-4">
      {/* attributes + their values */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">خصائص التنويعات وقيمها</span>
        {attributes.map((attr, i) => (
          <AttributeCard
            key={attr.name}
            attr={attr}
            onAddValue={(v) => addValue(i, v)}
            onRemoveValue={(v) => removeValue(i, v)}
            onRemove={() => removeAttribute(i)}
          />
        ))}
        <div className="flex flex-wrap items-center gap-2">
          {availablePresets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addAttribute(p)}
              className="rounded-full border border-rose/30 px-3 py-1 text-sm text-rose-dark hover:bg-blush transition-colors"
            >
              + {p}
            </button>
          ))}
          <span className="inline-flex items-center gap-1">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAttribute(custom)
                  setCustom('')
                }
              }}
              placeholder="خاصية مخصصة"
              className="rounded-full border border-rose/20 bg-white px-3 py-1 text-sm w-32 outline-none focus:border-rose"
            />
            <button
              type="button"
              onClick={() => {
                addAttribute(custom)
                setCustom('')
              }}
              className="rounded-full border border-rose/30 px-3 py-1 text-sm text-rose-dark hover:bg-blush transition-colors"
            >
              إضافة
            </button>
          </span>
        </div>
      </div>

      {/* auto-generated combination table */}
      {variants.length === 0 ? (
        <p className="text-sm text-taupe">
          أضف خاصية وقيمها (مثال: اللون → أحمر، أزرق) وستظهر جميع التوليفات تلقائياً بالأسفل.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold">التنويعات ({variants.length})</span>
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.5"
                dir="ltr"
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder="سعر موحّد"
                className="rounded-lg border border-rose/20 bg-white px-3 py-1.5 text-sm w-28 outline-none focus:border-rose"
              />
              <button
                type="button"
                onClick={applyBulkPrice}
                className="rounded-full border border-rose/30 px-3 py-1.5 text-sm text-rose-dark hover:bg-blush transition-colors"
              >
                تطبيق على الكل
              </button>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-taupe text-xs">
                  {attrCols.map((a) => (
                    <th key={a.name} className="text-start font-medium px-2 py-1 whitespace-nowrap">
                      {a.name}
                    </th>
                  ))}
                  <th className="text-start font-medium px-2 py-1">السعر (₪)</th>
                  <th className="text-start font-medium px-2 py-1">الكود (SKU)</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.key} className="border-t border-rose/10">
                    {attrCols.map((a) => (
                      <td key={a.name} className="px-2 py-1.5 whitespace-nowrap">
                        {v.values[a.name]}
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        dir="ltr"
                        value={v.price}
                        onChange={(e) => setVariant(v.key, { price: e.target.value })}
                        className={`${cell} w-24`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={v.code}
                        onChange={(e) => setVariant(v.key, { code: e.target.value })}
                        className={`${cell} w-32`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default VariationsEditor
