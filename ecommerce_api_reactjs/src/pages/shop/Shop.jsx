import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';
import ProductCard from '../../components/products/ProductCard';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { getPublicProducts, getPublicCategories } from '../../services/productService';
import { toggleFavourite } from '../../services/favouriteService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

function ShopPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { showToast } = useToast();
  const { addToCart: contextAddToCart } = useCart();
  const { wishlist, toggleWishlistItem } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-15', label: 'Under $15' },
    { value: '15-25', label: '$15 - $25' },
    { value: '25-35', label: '$25 - $35' },
    { value: '35+', label: 'Over $35' },
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 4.5, label: '4.5+ Stars' },
    { value: 4, label: '4.0+ Stars' },
    { value: 3.5, label: '3.5+ Stars' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [productsRes, categoriesRes] = await Promise.all([
        getPublicProducts(),
        getPublicCategories(),
      ]);
      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      await contextAddToCart(product.id, 1);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }

    try {
      const product = products.find((p) => p.id === productId);
      const productName = product ? product.name : 'Product';
      const isCurrentlyWishlisted = wishlist.has(productId);
      
      const success = await toggleWishlistItem(productId);
      if (success) {
        if (isCurrentlyWishlisted) {
          showToast(`Removed "${productName}" from favourites`, 'info');
        } else {
          showToast(`Added "${productName}" to favourites`, 'success');
        }
      }
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
      showToast('Failed to update favourites', 'error');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(product => {
        const categoryId = product.category_id || product.category?.id;
        return categoryId === Number(selectedCategory);
      });
    }

    if (priceRange !== 'all') {
      if (priceRange === '35+') {
        result = result.filter(product => Number(product.price || 0) >= 35);
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        result = result.filter(product => {
          const p = Number(product.price || 0);
          return p >= min && p <= max;
        });
      }
    }

    if (minRating > 0) {
      result = result.filter(product => Number(product.rating || 0) >= minRating);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, priceRange, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFilterCount = [
    selectedCategory !== 'all',
    priceRange !== 'all',
    minRating > 0
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange('all');
    setMinRating(0);
    setCurrentPage(1);
  };

  const getCategoryName = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    const categoryId = product.category_id || product.category?.id;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || product.category?.name || '';
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return;
    }
    navigate('/favourite');
  };

  return (
    <div className="shop-root">
      <style>{`
        .shop-root {
          min-height: 100vh;
          background: #050508;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          overflow-x: hidden;
        }

        .shop-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: linear-gradient(rgba(0, 255, 140, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 140, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .shop-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 28px 48px;
          position: relative;
          z-index: 1;
        }

        .shop-header {
          margin-bottom: 32px;
        }

        .shop-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .shop-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
        }

        .filter-bar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
        }

        .filter-group {
          flex: 1;
          min-width: 180px;
        }

        .filter-label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .filter-select {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:hover {
          border-color: rgba(0, 255, 140, 0.3);
        }

        .filter-select:focus {
          outline: none;
          border-color: rgba(0, 255, 140, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 255, 140, 0.1);
        }

        .filter-select option {
          background: #0a0a0f;
          color: #fff;
        }

        .clear-btn {
          padding: 10px 18px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 10px;
          color: #ff7b8a;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: rgba(255, 71, 87, 0.2);
        }

        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(0, 255, 140, 0.1);
          border: 1px solid rgba(0, 255, 140, 0.25);
          border-radius: 8px;
          color: #00ff8c;
          font-size: 12px;
          font-weight: 500;
        }

        .filter-pill button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .filter-pill button:hover {
          opacity: 0.7;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 32px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .empty-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 24px;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }

        .page-btn {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 255, 140, 0.3);
        }

        .page-btn.active {
          background: rgba(0, 255, 140, 0.15);
          border-color: rgba(0, 255, 140, 0.4);
          color: #00ff8c;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .results-info {
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
          margin-top: 16px;
        }

        /* ProductCard CSS classes */
        .product-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          border-color: rgba(0, 255, 140, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        .product-img {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .product-img-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-img-photo {
          transform: scale(1.05);
        }

        .product-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
        }

        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .product-wish {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(255, 255, 255, 0.6);
          z-index: 10;
        }

        .product-wish:hover {
          background: rgba(0, 0, 0, 0.8);
          color: #ff4757;
          transform: scale(1.1);
        }

        .product-wish.active {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.15);
          border-color: rgba(255, 71, 87, 0.3);
        }

        .product-body {
          padding: 16px;
        }

        .product-cat {
          display: block;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ffaa00;
        }

        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .price-now {
          font-size: 18px;
          font-weight: 700;
          color: #00ff8c;
        }

        .price-old {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: line-through;
        }

        .product-add {
          width: 40px;
          height: 40px;
          background: rgba(0, 255, 140, 0.1);
          border: 1px solid rgba(0, 255, 140, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #00ff8c;
        }

        .product-add:hover:not(:disabled) {
          background: rgba(0, 255, 140, 0.2);
          transform: scale(1.05);
        }

        .product-add:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-group {
            min-width: 100%;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }
      `}</style>

      <div className="shop-grid-bg" />
      <ShopHeader 
        onCartClick={handleCartClick}
        onWishlistClick={handleWishlistClick}
      />

      <main className="shop-main">
        <div className="shop-header">
          <h1 className="shop-title">Shop All Products</h1>
          <p className="shop-subtitle">{filteredProducts.length} products available</p>
        </div>

        {loading ? (
          <Loading label="Loading products..." variant="page" />
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h2 className="empty-title">Error Loading Products</h2>
            <p className="empty-text">{error}</p>
            <button onClick={loadData} className="clear-btn" style={{ background: 'rgba(0, 255, 140, 0.1)', borderColor: 'rgba(0, 255, 140, 0.3)', color: '#00ff8c' }}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }}
                    className="filter-select"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => { setMinRating(Number(e.target.value)); setCurrentPage(1); }}
                    className="filter-select"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="clear-btn">
                    Clear Filters
                  </button>
                )}
              </div>

              {activeFilterCount > 0 && (
                <div className="active-filters">
                  {selectedCategory !== 'all' && (
                    <span className="filter-pill">
                      {categories.find(c => c.id === Number(selectedCategory))?.name || selectedCategory}
                      <button onClick={() => setSelectedCategory('all')}>✕</button>
                    </span>
                  )}
                  {priceRange !== 'all' && (
                    <span className="filter-pill">
                      {priceRanges.find(r => r.value === priceRange)?.label}
                      <button onClick={() => setPriceRange('all')}>✕</button>
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="filter-pill">
                      {minRating}+ Stars
                      <button onClick={() => setMinRating(0)}>✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h2 className="empty-title">No products found</h2>
                <p className="empty-text">Try adjusting your filters to find what you're looking for.</p>
                <button onClick={clearFilters} className="clear-btn" style={{ background: 'rgba(0, 255, 140, 0.1)', borderColor: 'rgba(0, 255, 140, 0.3)', color: '#00ff8c' }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={getCategoryName(product.id)}
                      categoryIndex={index}
                      isWishlisted={wishlist.has(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', padding: '0 4px' }}>...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}

                <p className="results-info">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </>
            )}
          </>
        )}
      </main>

      <ShopFooter />
    </div>
  );
}

export default ShopPage;
