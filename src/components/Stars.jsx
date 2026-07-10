function Stars({ rating, className = '' }) {
  const full = Math.round(rating)
  return (
    <span dir="ltr" className={`text-amber-500 ${className}`} aria-label={`${rating} من 5`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  )
}

export default Stars
