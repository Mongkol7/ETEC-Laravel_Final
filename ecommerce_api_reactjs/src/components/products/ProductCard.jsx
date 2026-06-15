import { Link } from 'react-router-dom'

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.416 3.967 1.48-8.279-6.064-5.828 8.332-1.151z" />
  </svg>
)

const categoryColors = ['#00ff8c', '#ff4d80', '#ffaa00', '#00c9ff', '#a86bff']
const categoryEmoji = {
  Skincare: 'B',
  Makeup: 'M',
  'Hair Care': 'H',
  Fragrance: 'F',
  Tools: 'T',
  Wellness: 'W',
}

const getProductImages = (product) => {
  const images = product.product_image || product.productImage || product.product_images || product.images || []
  return Array.isArray(images) ? images : [images]
}

const getImageUrl = (product) => {
  const [mainImage] = getProductImages(product)
  return mainImage?.image_url || mainImage?.url || (typeof mainImage === 'string' ? mainImage : '')
}

const getBadge = (product) => {
  const stock = Number(product.stock ?? 0)
  if (product.badge) return product.badge
  if (stock <= 0) return 'Out'
  if (stock <= 5) return 'Low Stock'
  return null
}

const ProductCard = ({
  product,
  categoryName,
  categoryIndex = 0,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
}) => {
  const price = Number(product.price || 0)
  const oldPrice = Number(product.oldPrice || product.old_price || 0)
  const stock = Number(product.stock ?? 0)
  const rating = Number(product.rating || 4.8)
  const color = product.color || categoryColors[categoryIndex % categoryColors.length]
  const imageUrl = getImageUrl(product)
  const badge = getBadge(product)
  const label = categoryName || product.category?.name || `Category ${product.category_id || ''}`.trim()

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleWishlist?.(product.id)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product)
  }

  return (
    <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Image area — clicking navigates to detail ── */}
      <Link
        to={`/products/${product.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div className="product-img" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }}>
          {badge && (
            <span className="product-badge" style={{
              background: badge === 'Out' ? '#ff4757' : badge === 'Low Stock' ? '#ffaa00' : '#00ff8c',
              color: badge === 'Out' ? '#fff' : '#050508',
            }}>
              {badge}
            </span>
          )}

          {/* ♡ Wishlist button — sits inside the image div but is NOT inside the <Link> click path */}
          <button
            type="button"
            className={`product-wish ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            <HeartIcon filled={isWishlisted} />
          </button>

          {imageUrl ? (
            <img className="product-img-photo" src={imageUrl} alt={product.name} />
          ) : (
            <span className="product-img-fallback" style={{ color }}>
              {categoryEmoji[label] || (product.name || 'P').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </Link>

      {/* ── Body — name/meta navigates, footer buttons do NOT ── */}
      <div className="product-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="product-cat">{label}</span>
          <span className="product-name" style={{ display: 'block' }}>{product.name}</span>
          <div className="product-meta">
            <span className="product-rating"><StarIcon /> {rating.toFixed(1)}</span>
            <span>-</span>
            <span>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
          </div>
        </Link>

        {/* Footer: price + add-to-cart button — completely outside <Link> */}
        <div className="product-footer">
          <div className="product-price">
            <span className="price-now">${price.toFixed(2)}</span>
            {oldPrice > price && <span className="price-old">${oldPrice.toFixed(2)}</span>}
          </div>
          <button
            type="button"
            className="product-add"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            aria-label="Add to cart"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
