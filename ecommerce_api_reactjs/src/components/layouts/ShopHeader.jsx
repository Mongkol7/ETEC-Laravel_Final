import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import {
  getUserInitials,
  getUserAvatar,
  getUserDisplayName,
} from '../../utils/userDisplay';
import { getPublicProducts } from '../../services/productService';

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6m-6-6.78l4.24-4.24m3.08 3.08l4.24 4.24M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── tiny helper: first image URL from a product ─── */
const getThumb = (product) => {
  const imgs = product.product_image || product.productImage || product.product_images || product.images || [];
  const first = Array.isArray(imgs) ? imgs[0] : imgs;
  return first?.image_url || first?.url || (typeof first === 'string' ? first : '');
};

/* ─── Search result mini-card ─── */
const SearchResultCard = ({ product, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const price = Number(product.price || 0);
  const thumb = getThumb(product);
  const categoryLabel = product.category?.name || '';

  return (
    <Link
      to={`/products/${product.id}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        textDecoration: 'none',
        background: hovered ? 'rgba(0,255,140,0.06)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s ease',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        flexShrink: 0,
        overflow: 'hidden',
        background: 'rgba(0,255,140,0.08)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>
        {thumb
          ? <img src={thumb} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#00ff8c', fontWeight: 800 }}>{(product.name || 'P').charAt(0).toUpperCase()}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          color: hovered ? '#00ff8c' : '#fff',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.15s',
        }}>
          {product.name}
        </div>
        {categoryLabel && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {categoryLabel}
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{
        fontSize: 13,
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        color: '#00ff8c',
        flexShrink: 0,
      }}>
        ${price.toFixed(2)}
      </div>
    </Link>
  );
};

/* ─── Main ShopHeader ─── */
const ShopHeader = ({ cartCount = 0, wishlistCount = 0, onCartClick, onWishlistClick }) => {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ── Search state ──
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const avatar = getUserAvatar(user);

  // Load all products once for client-side filtering (fast instant results)
  useEffect(() => {
    let alive = true;
    const loadProducts = async () => {
      try {
        const data = await getPublicProducts();
        if (alive) setAllProducts(Array.isArray(data) ? data : []);
      } catch (_) {}
    };
    loadProducts();
    return () => { alive = false; };
  }, []);

  // Debounced search filter
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = query.trim();

    if (!q) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    setIsSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const filtered = allProducts
        .filter(p =>
          (p.name || '').toLowerCase().includes(lower) ||
          (p.category?.name || '').toLowerCase().includes(lower)
        )
        .slice(0, 8); // cap at 8 results
      setSearchResults(filtered);
      setIsSearchOpen(true);
      setIsSearchLoading(false);
    }, 180);

    return () => clearTimeout(debounceRef.current);
  }, [query, allProducts]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const handleResultSelect = () => {
    clearSearch();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') clearSearch();
    if (e.key === 'Enter' && query.trim()) {
      // Navigate to home with search query as state (optional future feature)
      clearSearch();
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      openLoginPrompt();
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginPrompt();
    } else {
      navigate('/cart');
      if (onCartClick) onCartClick();
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginPrompt();
    } else {
      navigate('/favourite');
      if (onWishlistClick) onWishlistClick();
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const handleAdminClick = () => {
    setIsDropdownOpen(false);
    navigate('/admin');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .shop-topbar {
          position: sticky; top: 0; z-index: 200;
          height: 64px; display: flex; align-items: center; gap: 18px;
          padding: 0 28px;
          background: rgba(8,8,14,0.82);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(28px) saturate(150%);
          -webkit-backdrop-filter: blur(28px) saturate(150%);
          font-family: 'DM Sans', sans-serif;
        }
        .shop-logo { display:flex;align-items:center;gap:10px;flex-shrink:0;text-decoration:none; }
        .shop-logo-mark {
          width:36px;height:36px;border-radius:11px;
          background:linear-gradient(135deg,#00ff8c,#00c9ff);
          display:flex;align-items:center;justify-content:center;
          font-family:'Syne',sans-serif;font-weight:800;font-size:13px;
          color:#050508;box-shadow:0 4px 18px rgba(0,255,140,.3);
        }
        .shop-logo-text { font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;letter-spacing:-.3px; }
        .shop-logo-text span { color:#00ff8c; }

        .shop-nav { display:flex;gap:22px;margin-left:12px; }
        .shop-nav a { font-size:13.5px;color:rgba(255,255,255,.45);text-decoration:none;font-weight:500;transition:color .2s; }
        .shop-nav a:hover, .shop-nav a.active { color:#00ff8c; }

        /* ── search wrap ── */
        .shop-search-wrap { flex:1;max-width:400px;position:relative;margin-left:auto; }
        .shop-search-icon {
          position:absolute;left:12px;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.25);display:flex;pointer-events:none;z-index:1;
        }
        .shop-search {
          width:100%;padding:9px 36px 9px 38px;
          background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);
          border-radius:11px;outline:none;color:#fff;
          font-family:'DM Sans',sans-serif;font-size:13px;
          -webkit-text-fill-color:#fff;transition:all .2s;box-sizing:border-box;
        }
        .shop-search::placeholder { color:rgba(255,255,255,.22); }
        .shop-search:focus {
          background:rgba(255,255,255,.07);
          border-color:rgba(0,255,140,.35);
          box-shadow:0 0 0 3px rgba(0,255,140,.08);
        }
        .shop-search-clear {
          position:absolute;right:11px;top:50%;transform:translateY(-50%);
          width:20px;height:20px;border-radius:50%;
          background:rgba(255,255,255,.1);border:none;
          color:rgba(255,255,255,.5);cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:all .15s;
        }
        .shop-search-clear:hover { background:rgba(255,71,87,.2);color:#ff7b8a; }

        /* ── search dropdown ── */
        .shop-search-dropdown {
          position:absolute;top:calc(100% + 8px);left:0;right:0;
          background:rgba(8,8,14,0.97);
          border:1px solid rgba(0,255,140,.2);
          border-radius:14px;
          box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04) inset,0 0 30px rgba(0,255,140,.06);
          backdrop-filter:blur(30px);
          overflow:hidden;
          animation:searchDropIn .18s cubic-bezier(.4,0,.2,1) both;
          z-index:300;
        }
        @keyframes searchDropIn {
          from { opacity:0;transform:translateY(-6px) scale(.99); }
          to   { opacity:1;transform:translateY(0) scale(1); }
        }
        .shop-search-dropdown-header {
          padding:10px 14px 8px;
          display:flex;align-items:center;justify-content:space-between;
          border-bottom:1px solid rgba(255,255,255,.05);
        }
        .shop-search-dropdown-label {
          font-size:10.5px;color:rgba(255,255,255,.3);letter-spacing:.8px;text-transform:uppercase;
        }
        .shop-search-dropdown-count {
          font-size:10.5px;color:rgba(0,255,140,.6);
          background:rgba(0,255,140,.06);border:1px solid rgba(0,255,140,.12);
          border-radius:20px;padding:2px 8px;
        }
        .shop-search-no-results {
          padding:24px 14px;text-align:center;
          color:rgba(255,255,255,.3);font-size:13px;
        }
        .shop-search-loading {
          padding:20px 14px;display:flex;align-items:center;justify-content:center;gap:8px;
          color:rgba(255,255,255,.3);font-size:13px;
        }
        .search-spinner {
          width:14px;height:14px;border-radius:50%;
          border:2px solid rgba(0,255,140,.15);
          border-top-color:#00ff8c;
          animation:spin .6s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .shop-search-footer {
          padding:8px 14px;border-top:1px solid rgba(255,255,255,.04);
          display:flex;align-items:center;justify-content:center;
        }
        .shop-search-hint { font-size:11px;color:rgba(255,255,255,.2); }
        .shop-search-hint kbd {
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          border-radius:4px;padding:1px 5px;font-size:10px;
        }

        /* ── icon buttons ── */
        .shop-icon-btn {
          width:38px;height:38px;border-radius:11px;flex-shrink:0;
          background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.45);cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          text-decoration:none;transition:all .2s;position:relative;
        }
        .shop-icon-btn:hover { background:rgba(255,255,255,.08);color:rgba(255,255,255,.65); }
        .shop-cart-badge {
          position:absolute;top:-5px;right:-5px;
          min-width:18px;height:18px;padding:0 4px;border-radius:9px;
          background:linear-gradient(135deg,#00ff8c,#00c9ff);color:#050508;
          font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;
          border:2px solid #050508;
        }

        /* ── avatar & profile dropdown ── */
        .shop-avatar-wrapper { position:relative;display:flex;align-items:center; }
        .shop-avatar {
          width:38px;height:38px;border-radius:11px;
          background:linear-gradient(135deg,rgba(0,255,140,.3),rgba(0,200,255,.3));
          border:1px solid rgba(0,255,140,.25);
          display:flex;align-items:center;justify-content:center;
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#00ff8c;
          cursor:pointer;transition:all .2s;overflow:hidden;
        }
        .shop-avatar:hover { border-color:rgba(0,255,140,.5);box-shadow:0 0 12px rgba(0,255,140,.2); }
        .shop-avatar img { width:100%;height:100%;object-fit:cover; }
        .shop-avatar-placeholder { width:100%;height:100%;display:flex;align-items:center;justify-content:center; }
        .shop-avatar.loading { animation:pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:.6;} 50%{opacity:1;} }

        .shop-dropdown {
          position:absolute;top:100%;right:0;margin-top:8px;
          background:rgba(8,8,14,.97);border:1px solid rgba(0,255,140,.2);
          border-radius:12px;
          box-shadow:0 8px 32px rgba(0,255,140,.1),0 0 1px rgba(255,255,255,.1);
          min-width:200px;overflow:hidden;z-index:1001;
          animation:slideDown .2s ease-out;
        }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .shop-dropdown-header { padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;gap:4px; }
        .shop-dropdown-name { font-size:13px;font-weight:600;color:#fff; }
        .shop-dropdown-email { font-size:12px;color:rgba(255,255,255,.45); }
        .shop-dropdown-menu { padding:8px 0; }
        .shop-dropdown-item {
          padding:10px 16px;display:flex;align-items:center;gap:10px;
          font-size:13px;color:rgba(255,255,255,.65);cursor:pointer;
          text-decoration:none;transition:all .2s;
          border:none;background:none;width:100%;text-align:left;
        }
        .shop-dropdown-item:hover { background:rgba(0,255,140,.08);color:#00ff8c; }
        .shop-dropdown-item.danger:hover { background:rgba(255,71,87,.08);color:#ff7b8a; }
      `}</style>

      <header className="shop-topbar">
        <Link to="/" className="shop-logo">
          <div className="shop-logo-mark">EC</div>
          <div className="shop-logo-text">Ecommerce<span>.</span></div>
        </Link>

        <nav className="shop-nav d-none d-lg-flex">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Link>
          <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>Orders</Link>
          <a href="/deals">Deals</a>
          <a href="/about">About</a>
        </nav>

        {/* ── Live Search ── */}
        <div className="shop-search-wrap" ref={searchRef}>
          <span className="shop-search-icon"><SearchIcon /></span>
          <input
            className="shop-search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            id="shop-search-input"
          />
          {query && (
            <button
              type="button"
              className="shop-search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}

          {/* Dropdown */}
          {isSearchOpen && (
            <div className="shop-search-dropdown">
              <div className="shop-search-dropdown-header">
                <span className="shop-search-dropdown-label">Results for "{query}"</span>
                {!isSearchLoading && (
                  <span className="shop-search-dropdown-count">
                    {searchResults.length} found
                  </span>
                )}
              </div>

              {isSearchLoading ? (
                <div className="shop-search-loading">
                  <div className="search-spinner" />
                  Searching…
                </div>
              ) : searchResults.length === 0 ? (
                <div className="shop-search-no-results">
                  No products match <strong style={{ color: 'rgba(255,255,255,0.5)' }}>"{query}"</strong>
                </div>
              ) : (
                <div>
                  {searchResults.map((product) => (
                    <SearchResultCard
                      key={product.id}
                      product={product}
                      onSelect={handleResultSelect}
                    />
                  ))}
                </div>
              )}

              <div className="shop-search-footer">
                <span className="shop-search-hint">
                  <kbd>↑</kbd> <kbd>↓</kbd> navigate &nbsp;·&nbsp; <kbd>Esc</kbd> close
                </span>
              </div>
            </div>
          )}
        </div>

        <button type="button" className="shop-icon-btn" onClick={handleWishlistClick}>
          <HeartIcon filled={false} />
          {wishlistCount > 0 && <span className="shop-cart-badge">{wishlistCount}</span>}
        </button>

        <button type="button" className="shop-icon-btn" onClick={handleCartClick}>
          <CartIcon />
          {cartCount > 0 && <span className="shop-cart-badge">{cartCount}</span>}
        </button>

        <div className="shop-avatar-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`shop-avatar ${isInitializing ? 'loading' : ''}`}
            title={isAuthenticated ? displayName : 'Sign in'}
            onClick={handleProfileClick}
          >
            {isInitializing ? (
              <div className="shop-avatar-placeholder">{initials}</div>
            ) : avatar.type === 'image' ? (
              <img src={avatar.value} alt={displayName} />
            ) : (
              <div className="shop-avatar-placeholder">{avatar.value}</div>
            )}
          </button>

          {isDropdownOpen && isAuthenticated && (
            <div className="shop-dropdown">
              <div className="shop-dropdown-header">
                <div className="shop-dropdown-name">{displayName}</div>
                <div className="shop-dropdown-email">{user?.email}</div>
              </div>
              <div className="shop-dropdown-menu">
                <button type="button" className="shop-dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate('/orders'); }}>
                  <CartIcon />
                  My Orders
                </button>
                {user?.role === 'admin' && (
                  <button type="button" className="shop-dropdown-item" onClick={handleAdminClick}>
                    <SettingsIcon />
                    Admin Panel
                  </button>
                )}
                <button type="button" className="shop-dropdown-item danger" onClick={handleLogout}>
                  <LogOutIcon />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default ShopHeader;
