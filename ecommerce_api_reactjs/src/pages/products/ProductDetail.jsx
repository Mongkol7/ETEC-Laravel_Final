import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ShopFooter from '../../components/layouts/ShopFooter';
import ShopHeader from '../../components/layouts/ShopHeader';
import Loading from '../../components/common/Loading';
import {
  getPublicProduct,
  getPublicProducts,
} from '../../services/productService';
import { toggleFavourite } from '../../services/favouriteService';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const getProductImages = (product) => {
  const rows = product?.product_image || product?.productImage || [];
  const urls = rows.map((img) => img.image_url).filter(Boolean);
  return urls.length ? urls : [];
};

const getCategoryName = (product) =>
  product?.category?.name || `Category ${product?.category_id || ''}`.trim();

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { wishlist, toggleWishlistItem } = useWishlist();
  const { addToCart: contextAddToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  // Helper to require auth before running an action
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return false;
    }
    action();
    return true;
  };

  // Gated wishlist toggle
  const handleToggleWishlist = async () => {
    if (!requireAuth(() => {})) return;
    if (!product?.id) return;

    try {
      const isCurrentlyWishlisted = wishlist.has(product.id);
      const success = await toggleWishlistItem(product.id);
      
      if (success) {
        if (isCurrentlyWishlisted) {
          showToast(`Removed "${product.name}" from wishlist`, 'info');
        } else {
          showToast(`Added "${product.name}" to wishlist`, 'success');
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  // Gated add to cart - now saves to API
  const handleAddToCart = async () => {
    if (!requireAuth(() => {})) return;
    try {
      await contextAddToCart(product.id, quantity);
      showToast(`Added ${quantity} of "${product.name}" to cart`, 'success');
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      showToast('Failed to add item to cart', 'info');
    }
  };

  // Gated handlers for header icons
  const handleWishlistIconClick = () => {
    requireAuth(() => {
      navigate('/favourite');
    });
  };

  const handleCartIconClick = () => {
    if (!requireAuth(() => {})) return;
    // Future: could navigate to cart page or show cart modal
  };

  useEffect(() => {
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link');
      link.id = 'bs-css';
      link.rel = 'stylesheet';
      link.href =
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css';
      document.head.appendChild(link);
    }

    const style = document.createElement('style');
    style.id = 'product-detail-css';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

      .detail-root {
        min-height: 100vh;
        background: #050508;
        font-family: 'DM Sans', sans-serif;
        position: relative;
        overflow-x: hidden;
      }
      .detail-grid-bg {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image: linear-gradient(rgba(0,255,140,.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,140,.02) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .detail-main { max-width: 1280px; margin: 0 auto; padding: 32px 28px 48px; position: relative; z-index: 1; }
      .detail-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.35); margin-bottom: 28px; flex-wrap: wrap; }
      .detail-breadcrumb a { color: rgba(255,255,255,.35); text-decoration: none; }
      .detail-breadcrumb a:hover { color: #00ff8c; }
      .detail-breadcrumb span:last-child { color: #fff; }

      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 48px; }
      @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; gap: 28px; } }

      .detail-gallery-main {
        aspect-ratio: 1; border-radius: 24px; overflow: hidden;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
        display: flex; align-items: center; justify-content: center;
      }
      .detail-gallery-main img { width: 100%; height: 100%; object-fit: cover; }
      .detail-gallery-fallback {
        font-family: 'Syne', sans-serif; font-size: 72px; font-weight: 800; color: #00ff8c;
      }
      .detail-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; }
      .detail-thumb {
        aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer;
        border: 2px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03); padding: 0;
      }
      .detail-thumb.active { border-color: #00ff8c; box-shadow: 0 0 16px rgba(0,255,140,.15); }
      .detail-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .detail-cat { font-size: 11px; color: rgba(255,255,255,.28); letter-spacing: .8px; text-transform: uppercase; margin-bottom: 8px; }
      .detail-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 16px; }
      .detail-stock {
        display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px;
        font-size: 12px; font-weight: 500; margin-bottom: 20px;
      }
      .detail-stock.in { background: rgba(0,255,140,.08); border: 1px solid rgba(0,255,140,.25); color: #00ff8c; }
      .detail-stock.out { background: rgba(255,71,87,.08); border: 1px solid rgba(255,71,87,.25); color: #ff7b8a; }
      .detail-stock.low { background: rgba(255,170,0,.08); border: 1px solid rgba(255,170,0,.25); color: #ffaa00; }

      .detail-price-box {
        padding: 20px 24px; border-radius: 20px; margin-bottom: 24px;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
      }
      .detail-price { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #00ff8c; }

      .detail-qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
      .detail-qty-label { color: rgba(255,255,255,.55); font-size: 14px; font-weight: 500; }
      .detail-qty-ctrl {
        display: flex; align-items: center; background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08); border-radius: 12px;
      }
      .detail-qty-btn {
        padding: 10px 16px; background: none; border: none; color: rgba(255,255,255,.55);
        cursor: pointer; font-size: 18px; line-height: 1;
      }
      .detail-qty-btn:disabled { opacity: .35; cursor: not-allowed; }
      .detail-qty-btn:hover:not(:disabled) { color: #00ff8c; }
      .detail-qty-val { padding: 10px 20px; color: #fff; font-weight: 700; font-size: 16px; min-width: 48px; text-align: center; }

      .detail-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 480px) { .detail-actions { grid-template-columns: 1fr; } }
      .detail-btn-primary {
        padding: 14px 24px; border: none; border-radius: 12px; cursor: pointer;
        background: linear-gradient(135deg,#00ff8c,#00c9ff); color: #050508;
        font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
        transition: transform .15s, box-shadow .2s;
      }
      .detail-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,255,140,.3); }
      .detail-btn-primary:disabled { opacity: .45; cursor: not-allowed; }
      .detail-btn-ghost {
        padding: 14px 24px; border-radius: 12px; cursor: pointer;
        background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
        color: rgba(255,255,255,.7); font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px;
      }
      .detail-btn-ghost:hover { background: rgba(255,255,255,.08); color: #fff; }

      .detail-tabs-wrap {
        padding: 28px 32px; border-radius: 24px; margin-bottom: 48px;
        background: rgba(255,255,255,.026); border: 1px solid rgba(255,255,255,.08);
      }
      .detail-tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,.06); padding-bottom: 16px; flex-wrap: wrap; }
      .detail-tab {
        padding: 8px 18px; border-radius: 10px; border: none; cursor: pointer;
        background: transparent; color: rgba(255,255,255,.4); font-size: 14px; font-weight: 500;
        text-transform: capitalize;
      }
      .detail-tab.active { background: #00ff8c; color: #050508; font-weight: 600; }
      .detail-tab:hover:not(.active) { color: #fff; background: rgba(255,255,255,.05); }
      .detail-tab-content h3 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 16px; }
      .detail-tab-content p { color: rgba(255,255,255,.55); line-height: 1.7; font-size: 14.5px; }
      .detail-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 600px) { .detail-specs { grid-template-columns: 1fr; } }
      .detail-spec {
        display: flex; justify-content: space-between; padding: 14px 16px; border-radius: 12px;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
      }
      .detail-spec-label { color: rgba(255,255,255,.4); font-size: 13px; }
      .detail-spec-value { color: #fff; font-weight: 600; font-size: 13px; }

      .detail-related-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 20px; }
      .detail-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      @media (max-width: 900px) { .detail-related-grid { grid-template-columns: repeat(2, 1fr); } }
      .detail-related-card {
        padding: 14px; border-radius: 16px; text-decoration: none; color: inherit;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
        transition: border-color .2s, transform .2s;
      }
      .detail-related-card:hover { border-color: rgba(0,255,140,.3); transform: translateY(-3px); }
      .detail-related-img {
        aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: 10px;
        background: rgba(255,255,255,.04); display: flex; align-items: center; justify-content: center;
      }
      .detail-related-img img { width: 100%; height: 100%; object-fit: cover; }
      .detail-related-name { font-size: 13px; color: #fff; font-weight: 500; margin-bottom: 6px; line-height: 1.4; }
      .detail-related-price { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #00ff8c; }

      .detail-error-wrap { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,.6); }
      .detail-error-wrap a { color: #00ff8c; text-decoration: none; font-weight: 500; }
    `;
    const existing = document.getElementById('product-detail-css');
    if (existing) existing.remove();
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('product-detail-css');
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setSelectedImage(0);
      setQuantity(1);

      try {
        const data = await getPublicProduct(id);
        if (!alive) return;

        if (!data) {
          setProduct(null);
          setError('Product not found.');
          return;
        }

        setProduct(data);

        const allProducts = await getPublicProducts();
        if (!alive) return;

        const list = Array.isArray(allProducts) ? allProducts : [];
        setRelatedProducts(
          list
            .filter(
              (item) =>
                item.id !== data.id && item.category_id === data.category_id,
            )
            .slice(0, 4),
        );
      } catch (err) {
        if (!alive) return;
        console.error('Failed to load product:', err);
        setProduct(null);
        setError('Unable to load product. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      alive = false;
    };
  }, [id]);

  const handleQuantityChange = (change) => {
    const stock = Number(product?.stock ?? 0);
    setQuantity((current) => {
      const next = current + change;
      return Math.min(Math.max(1, next), Math.max(stock, 1));
    });
  };



  const images = product ? getProductImages(product) : [];
  const stock = Number(product?.stock ?? 0);
  const price = Number(product?.price ?? 0);
  const categoryName = product ? getCategoryName(product) : '';
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="detail-root">
      <div className="detail-grid-bg" />
      <ShopHeader
        onCartClick={handleCartIconClick}
        onWishlistClick={handleWishlistIconClick}
      />

      {loading ? (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loading label="Loading product..." variant="page" />
        </div>
      ) : error || !product ? (
        <div className="detail-main detail-error-wrap">
          <p>{error || 'Product not found.'}</p>
          <Link to="/">← Back to store</Link>
        </div>
      ) : (
        <main className="detail-main">
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{categoryName}</span>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className="detail-grid">
            <div>
              <div className="detail-gallery-main">
                {images.length > 0 ? (
                  <img src={images[selectedImage]} alt={product.name} />
                ) : (
                  <span className="detail-gallery-fallback">
                    {(product.name || 'P').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="detail-thumbs">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      className={`detail-thumb ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="detail-cat">{categoryName}</p>
              <h1 className="detail-title">{product.name}</h1>

              <div
                className={`detail-stock ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}
              >
                {isOutOfStock
                  ? 'Out of stock'
                  : isLowStock
                    ? `Only ${stock} left`
                    : 'In stock'}
              </div>

              <div className="detail-price-box">
                <div className="detail-price">${price.toFixed(2)}</div>
              </div>

              <div className="detail-qty-row">
                <span className="detail-qty-label">Quantity</span>
                <div className="detail-qty-ctrl">
                  <button
                    type="button"
                    className="detail-qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="detail-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="detail-qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stock || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  type="button"
                  className="detail-btn-primary"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="detail-btn-ghost"
                  onClick={handleToggleWishlist}
                >
                  {product?.id && wishlist.has(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>

          <div className="detail-tabs-wrap">
            <div className="detail-tabs" role="tablist">
              {['description', 'details'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === tab}
                  className={`detail-tab ${selectedTab === tab ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="detail-tab-content">
              {selectedTab === 'description' && (
                <div>
                  <h3>About this product</h3>
                  <p>{product.description || 'No description available.'}</p>
                </div>
              )}

              {selectedTab === 'details' && (
                <div>
                  <h3>Product details</h3>
                  <div className="detail-specs">
                    {[
                      { label: 'Category', value: categoryName },
                      { label: 'Status', value: product.status || 'active' },
                      { label: 'Stock', value: String(stock) },
                      { label: 'Slug', value: product.slug },
                    ].map((spec) => (
                      <div key={spec.label} className="detail-spec">
                        <span className="detail-spec-label">{spec.label}</span>
                        <span className="detail-spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="detail-related-title">You may also like</h2>
              <div className="detail-related-grid">
                {relatedProducts.map((item) => {
                  const itemImages = getProductImages(item);
                  const itemPrice = Number(item.price || 0);

                  return (
                    <Link
                      key={item.id}
                      to={`/products/${item.id}`}
                      className="detail-related-card"
                    >
                      <div className="detail-related-img">
                        {itemImages.length > 0 ? (
                          <img src={itemImages[0]} alt={item.name} />
                        ) : (
                          <span
                            className="detail-gallery-fallback"
                            style={{ fontSize: 32 }}
                          >
                            {(item.name || 'P').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="detail-related-name">{item.name}</p>
                      <p className="detail-related-price">
                        ${itemPrice.toFixed(2)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      )}

      <ShopFooter />
    </div>
  );
}

export default ProductDetailPage;
