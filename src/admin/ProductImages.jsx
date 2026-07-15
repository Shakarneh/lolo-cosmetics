import EntityImages, { makeImageUrl } from './EntityImages.jsx'

export const imageUrl = makeImageUrl('product-images')

function ProductImages({ productId, onCountChange }) {
  return (
    <EntityImages
      entityId={productId}
      table="product_images"
      bucket="product-images"
      fkColumn="product_id"
      title="صور المنتج"
      onCountChange={onCountChange}
    />
  )
}

export default ProductImages
