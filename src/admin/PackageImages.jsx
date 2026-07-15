import EntityImages from './EntityImages.jsx'

function PackageImages({ packageId, onCountChange }) {
  return (
    <EntityImages
      entityId={packageId}
      table="package_images"
      bucket="package-images"
      fkColumn="package_id"
      title="صور البكج"
      onCountChange={onCountChange}
    />
  )
}

export default PackageImages
