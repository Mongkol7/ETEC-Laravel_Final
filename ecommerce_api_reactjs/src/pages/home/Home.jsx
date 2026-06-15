import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopFooter from '../../components/layouts/ShopFooter';
import ShopHeader from '../../components/layouts/ShopHeader';
import ProductCard from '../../components/products/ProductCard';
import Loading from '../../components/common/Loading';
import {
  getPublicCategories,
  getPublicProducts,
} from '../../services/productService';
import { addToCart } from '../../services/cartService';
import { toggleFavourite } from '../../services/favouriteService';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

/* ──────────────────────────────────────────────────────────────────────────
   MK7 Phone Shop — liquid-glass dark theme (blue/cyan accents)
   Sections: top bar, hero, category pills, featured products grid, banner,
   trending row, newsletter, footer
   ────────────────────────────────────────────────────────────────────────── */

// Phone shop category icons
const categoryIcons = ['📱', '💻', '🎧', '🔋', '🖥️', '⌚', '📷'];

const trending = [
  { name: 'MK7 Pro Max — Midnight Black', price: 1099.0, color: '#00c9ff' },
  { name: 'MK7 Ultra Case (MagSafe)', price: 39.0, color: '#a86bff' },
  { name: 'MK7 65W GaN Charger', price: 49.0, color: '#00ff8c' },
  { name: 'MK7 AirBuds Pro (ANC)', price: 179.0, color: '#ffaa00' },
  { name: 'MK7 SmartWatch Series 3', price: 299.0, color: '#ff4d80' },
];

function ShopHome() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { openLoginPrompt } = useAuthPrompt();
  const { cartCount, updateCartCount } = useCart();
  const { wishlist, wishlistCount, toggleWishlistItem } = useWishlist();
  const [activeCategory, setActiveCategory] = useState('All');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 30 });
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const heroRef = useRef(null);

  // Page loading state with minimum loading time
  useEffect(() => {
    const minLoadTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(minLoadTimer);
  }, []);

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      openLoginPrompt();
      return false;
    }
    action();
    return true;
  };

  const handleAddToCart = async (product) => {
    if (!requireAuth(() => {})) return;
    try {
      await addToCart(product.id, 1);
      showToast(`Added "${product.name}" to cart`, 'success');
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      showToast('Failed to add item to cart', 'info');
    }
  };

  const handleToggleWishlist = async (id) => {
    if (!requireAuth(() => {})) return;
    try {
      const product = products.find((p) => p.id === id);
      const productName = product ? product.name : 'Product';
      const isCurrentlyWishlisted = wishlist.has(id);
      
      const success = await toggleWishlistItem(id);
      if (success) {
        if (isCurrentlyWishlisted) {
          showToast(`Removed "${productName}" from wishlist`, 'info');
        } else {
          showToast(`Added "${productName}" to wishlist`, 'success');
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item:', err);
    }
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
    style.id = 'shop-css';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

      html, body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        overflow-y: auto;
      }

      #root {
        margin: 0;
        padding: 0;
        overflow: visible;
      }

      .shop-root {
        min-height: 100vh;
        background: #050508;
        font-family: 'DM Sans', sans-serif;
        position: relative;
        width: 100%;
        overflow: visible;
      }

      /* ── ambient orbs — cool blue/indigo for tech feel ── */
      .orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; animation: drift 11s ease-in-out infinite; z-index: 0; }
      .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,255,140,.10) 0%, transparent 70%); top: -180px; left: -120px; animation-duration: 12s; }
      .orb-2 { width: 480px; height: 480px; background: radial-gradient(circle, rgba(0,180,255,.09) 0%, transparent 70%); top: 30%; right: -140px; animation-duration: 14s; animation-delay: -4s; }
      .orb-3 { width: 380px; height: 380px; background: radial-gradient(circle, rgba(160,0,255,.06) 0%, transparent 70%); bottom: -120px; left: 30%; animation-duration: 16s; animation-delay: -7s; }
      @keyframes drift {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(30px,-22px) scale(1.05); }
        66%      { transform: translate(-22px,18px) scale(.96); }
      }
      .grid-bg {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image: linear-gradient(rgba(0,255,140,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,140,.02) 1px, transparent 1px);
        background-size: 40px 40px;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,.6), transparent 700px);
      }

      /* ── top bar ── */
      .shop-topbar {
        position: sticky; top: 0; z-index: 100;
        height: 64px; display: flex; align-items: center; gap: 18px;
        padding: 0 28px;
        background: rgba(5,5,8,.75);
        border-bottom: 1px solid rgba(255,255,255,.06);
        backdrop-filter: blur(28px) saturate(150%);
        -webkit-backdrop-filter: blur(28px) saturate(150%);
      }
      .shop-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; text-decoration: none; }
      .shop-logo-mark {
        width: 36px; height: 36px; border-radius: 11px;
        background: linear-gradient(135deg, #00ff8c, #00c9ff);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px;
        color: #fff; box-shadow: 0 4px 18px rgba(0,255,140,.35);
      }
      .shop-logo-text { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -.3px; }
      .shop-logo-text span { color: #00ff8c; }

      .shop-nav { display: flex; gap: 22px; margin-left: 12px; }
      .shop-nav a {
        font-size: 13.5px; color: rgba(255,255,255,.45);
        text-decoration: none; font-weight: 500; transition: color .2s;
        white-space: nowrap;
      }
      .shop-nav a:hover, .shop-nav a.active { color: #00ff8c; }

      .shop-search-wrap { flex: 1; max-width: 380px; position: relative; margin-left: auto; }
      .shop-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,.22); display: flex; }
      .shop-search {
        width: 100%; padding: 9px 14px 9px 38px;
        background: rgba(255,255,255,.045);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 11px; outline: none; color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: 13px;
        -webkit-text-fill-color: #fff; transition: all .2s;
      }
      .shop-search::placeholder { color: rgba(255,255,255,.22); }
      .shop-search:focus { background: rgba(255,255,255,.075); border-color: rgba(0,255,140,.4); box-shadow: 0 0 0 3px rgba(0,255,140,.08); }

      .shop-icon-btn {
        width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
        background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08);
        color: rgba(255,255,255,.45); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; position: relative; text-decoration: none;
      }
      .shop-icon-btn:hover { background: rgba(255,255,255,.09); color: rgba(255,255,255,.8); }
      .shop-cart-badge {
        position: absolute; top: -5px; right: -5px;
        min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px;
        background: linear-gradient(135deg,#00ff8c,#00c9ff); color: #fff;
        font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;
        border: 2px solid #050508;
      }
      .shop-avatar {
        width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
        background: linear-gradient(135deg,rgba(0,255,140,.3),rgba(0,200,255,.3));
        border: 1px solid rgba(0,255,140,.25);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #00ff8c;
        cursor: pointer;
      }

      /* ── hero ── */
      .hero {
        position: relative; z-index: 1;
        max-width: 1280px; margin: 0 auto; padding: 56px 28px 40px;
      }
      .hero-card {
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.026);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 28px;
        backdrop-filter: blur(40px) saturate(160%);
        -webkit-backdrop-filter: blur(40px) saturate(160%);
        box-shadow: 0 0 0 1px rgba(255,255,255,.04) inset, 0 32px 80px rgba(0,0,0,.6), 0 0 80px rgba(0,255,140,.04);
        padding: 56px 48px;
        display: flex; align-items: center; justify-content: space-between; gap: 40px;
        flex-wrap: wrap;
      }
      .hero-glow {
        position: absolute; inset: 0; pointer-events: none; border-radius: 28px; opacity: .6;
      }
      .hero-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 12px 5px 8px;
        background: rgba(0,255,140,.08); border: 1px solid rgba(0,255,140,.2);
        border-radius: 20px; font-size: 11px; font-weight: 500;
        color: rgba(100,180,255,.9); letter-spacing: .5px; margin-bottom: 22px;
      }
      .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff8c; box-shadow: 0 0 6px #00ff8c; animation: pdot 2s ease-in-out infinite; }
      @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.4;transform:scale(.75);} }

      .hero-title {
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: clamp(34px, 5vw, 54px); line-height: 1.08;
        color: #fff; letter-spacing: -1px; margin-bottom: 16px; max-width: 560px;
      }
      .hero-title span {
        background: linear-gradient(135deg,#00ff8c 0%,#00c9ff 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      .hero-sub { font-size: 15px; color: rgba(255,255,255,.4); font-weight: 300; line-height: 1.7; max-width: 460px; margin-bottom: 28px; }

      .hero-btn-primary {
        background: linear-gradient(135deg,#00ff8c 0%,#00d4aa 50%,#00a8ff 100%) !important;
        border: none !important; border-radius: 12px !important; color: #050508 !important;
        font-family: 'Syne', sans-serif !important; font-size: 14.5px !important; font-weight: 700 !important;
        padding: 13px 28px !important; position: relative; overflow: hidden;
        box-shadow: 0 4px 24px rgba(0,255,140,.3) !important;
        transition: transform .15s ease, box-shadow .3s ease !important;
      }
      .hero-btn-primary:hover { transform: translateY(-1px); color: #050508 !important; box-shadow: 0 8px 32px rgba(0,255,140,.4) !important; }
      .hero-btn-ghost {
        background: rgba(255,255,255,.045) !important; border: 1px solid rgba(255,255,255,.1) !important;
        border-radius: 12px !important; color: rgba(255,255,255,.65) !important;
        font-family: 'DM Sans', sans-serif !important; font-size: 14px !important;
        padding: 13px 24px !important; transition: all .2s !important;
      }
      .hero-btn-ghost:hover { background: rgba(255,255,255,.09) !important; color: #fff !important; }

      /* hero visual — phone mockup */
      .hero-visual {
        position: relative; width: 280px; height: 300px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .hero-orb-ring {
        position: absolute; inset: 0; border-radius: 50%;
        border: 1px dashed rgba(0,255,140,.2);
        animation: spin-slow 22s linear infinite;
      }
      .hero-orb-ring.r2 { inset: 24px; border-color: rgba(0,200,255,.15); animation-direction: reverse; animation-duration: 28s; }
      @keyframes spin-slow { to { transform: rotate(360deg); } }

      /* phone silhouette */
      .hero-phone {
        width: 110px; height: 200px; border-radius: 22px;
        background: linear-gradient(160deg, rgba(30,40,80,.9), rgba(10,14,36,.95));
        border: 1.5px solid rgba(100,160,255,.25);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        box-shadow: 0 0 60px rgba(0,255,140,.2), inset 0 0 30px rgba(0,100,255,.05);
        animation: float-prod 4s ease-in-out infinite;
        position: relative; overflow: hidden;
      }
      .hero-phone::before {
        content: ''; position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
        width: 36px; height: 6px; border-radius: 3px;
        background: rgba(255,255,255,.12);
      }
      .hero-phone-screen {
        width: 80px; height: 130px; border-radius: 10px; margin-top: 10px;
        background: linear-gradient(160deg, rgba(0,100,200,.3), rgba(80,0,200,.2));
        border: 1px solid rgba(100,160,255,.15);
        display: flex; align-items: center; justify-content: center;
        font-size: 28px;
      }
      .hero-phone-logo {
        font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px;
        color: rgba(100,180,255,.6); letter-spacing: 2px; margin-top: 8px;
      }
      @keyframes float-prod { 0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);} }

      .hero-float-chip {
        position: absolute; padding: 8px 13px; border-radius: 12px;
        background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
        backdrop-filter: blur(20px); font-size: 11.5px; color: rgba(255,255,255,.7);
        display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif;
        animation: float-chip 5s ease-in-out infinite;
      }
      @keyframes float-chip { 0%,100%{transform:translateY(0) translateX(0);}50%{transform:translateY(-8px) translateX(4px);} }
      .chip-1 { top: 10px; left: -10px; animation-delay: 0s; }
      .chip-2 { bottom: 30px; right: -20px; animation-delay: 1.5s; }
      .chip-dot { width: 6px; height: 6px; border-radius: 50%; }

      /* ── section heading ── */
      .section-wrap { max-width: 1280px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }
      .section-head {
        display: flex; align-items: baseline; justify-content: space-between;
        margin-bottom: 22px; flex-wrap: wrap; gap: 10px;
      }
      .section-title {
        font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -.4px;
      }
      .section-title span {
        background: linear-gradient(135deg,#00ff8c,#00c9ff);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      .section-link { font-size: 13px; color: rgba(100,160,255,.8); text-decoration: none; font-weight: 500; transition: color .2s; }
      .section-link:hover { color: #00ff8c; }

      /* ── category pills ── */
      .cat-row { display: flex; gap: 10px; overflow-x: auto; padding: 4px 0 28px; scrollbar-width: none; }
      .cat-row::-webkit-scrollbar { display: none; }
      .cat-pill {
        display: flex; align-items: center; gap: 7px; flex-shrink: 0;
        padding: 9px 18px; border-radius: 24px; cursor: pointer;
        background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
        color: rgba(255,255,255,.5); font-size: 13px; font-weight: 500;
        transition: all .2s; white-space: nowrap;
      }
      .cat-pill:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.8); }
      .cat-pill.active {
        background: rgba(0,255,140,.1); border-color: rgba(0,255,140,.3); color: #00ff8c;
        box-shadow: 0 0 20px rgba(0,255,140,.08);
      }

      /* ── product grid ── */
      .product-grid {
        padding-bottom: 48px;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      .product-card {
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 20px;
        transition: all .3s cubic-bezier(.4,0,.2,1);
        height: 100%; display: flex; flex-direction: column;
        cursor: pointer;
      }
      .product-card:hover {
        transform: translateY(-5px);
        border-color: rgba(0,255,140,.25);
        box-shadow: 0 16px 40px rgba(0,0,0,.4), 0 0 40px rgba(0,255,140,.06);
      }
      .product-card button { padding: 0; font: inherit; }
      .product-img {
        position: relative; aspect-ratio: 1; border-radius: 20px 20px 0 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 52px; overflow: hidden;
      }
      .product-img::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(5,5,8,.4) 100%);
      }
      .product-img-photo {
        position: relative; z-index: 1;
        width: 100%; height: 100%; object-fit: cover; display: block;
      }
      .product-img-fallback {
        position: relative; z-index: 1;
        width: 72px; height: 72px; border-radius: 18px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08);
        font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800;
      }
      .product-badge {
        position: absolute; top: 10px; left: 10px; z-index: 2;
        font-size: 10px; font-weight: 700; letter-spacing: .4px;
        padding: 4px 9px; border-radius: 8px; color: #fff;
        font-family: 'Syne', sans-serif;
      }
      .product-wish {
        position: absolute; top: 10px; right: 10px; z-index: 2;
        width: 30px; height: 30px; border-radius: 9px;
        background: rgba(5,5,8,.5); border: 1px solid rgba(255,255,255,.1);
        backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .2s; color: rgba(255,255,255,.5);
      }
      .product-wish:hover { background: rgba(5,5,8,.7); }
      .product-wish.active { color: #ff4d80; }

      .product-body { padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
      .product-cat { font-size: 10.5px; color: rgba(255,255,255,.28); letter-spacing: .8px; text-transform: uppercase; font-weight: 500; }
      .product-name { font-size: 13.5px; color: #fff; font-weight: 500; line-height: 1.4; font-family: 'DM Sans', sans-serif; }
      .product-meta { display: flex; align-items: center; gap: 10px; font-size: 11.5px; color: rgba(255,255,255,.3); }
      .product-rating { display: flex; align-items: center; gap: 3px; color: #ffaa00; }

      .product-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 6px; }
      .product-price { display: flex; align-items: baseline; gap: 6px; }
      .price-now { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; color: #00ff8c; }
      .price-old { font-size: 12px; color: rgba(255,255,255,.25); text-decoration: line-through; }
      .product-add {
        width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
        background: rgba(0,255,140,.1); border: 1px solid rgba(0,255,140,.25);
        color: #00ff8c; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .2s;
      }
      .product-add:hover { background: #00ff8c; color: #fff; box-shadow: 0 4px 16px rgba(0,255,140,.35); }
      .product-add:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
      .product-state {
        padding: 28px; border-radius: 16px;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
        color: rgba(255,255,255,.55); text-align: center; font-size: 13.5px;
      }
      .product-state.error { color: #ff7b8a; border-color: rgba(255,71,87,.25); background: rgba(255,71,87,.08); }

      /* ── promo banner ── */
      .promo-banner {
        position: relative; overflow: hidden;
        border-radius: 24px; padding: 40px 44px;
        background: linear-gradient(120deg, rgba(0,255,140,.1), rgba(0,180,255,.06));
        border: 1px solid rgba(0,255,140,.18);
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 24px; margin-bottom: 48px;
      }
      .promo-text h3 { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 6px; letter-spacing: -.4px; }
      .promo-text p { font-size: 13.5px; color: rgba(255,255,255,.45); font-weight: 300; }
      .promo-code {
        display: inline-flex; align-items: center; gap: 8px; margin-top: 12px;
        padding: 8px 16px; border-radius: 10px;
        background: rgba(5,5,8,.4); border: 1px dashed rgba(0,255,140,.4);
        font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #00ff8c; letter-spacing: 1px;
      }

      /* ── trending strip ── */
      .trend-row { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 48px; scrollbar-width: none; }
      .trend-row::-webkit-scrollbar { display: none; }
      .trend-card {
        flex-shrink: 0; width: 200px; padding: 16px;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
        border-radius: 16px; transition: all .2s; cursor: pointer;
      }
      .trend-card:hover { border-color: rgba(255,255,255,.16); transform: translateY(-3px); }
      .trend-icon {
        width: 44px; height: 44px; border-radius: 12px; margin-bottom: 12px;
        display: flex; align-items: center; justify-content: center; font-size: 20px;
      }
      .trend-name { font-size: 12.5px; color: rgba(255,255,255,.75); font-weight: 500; line-height: 1.4; margin-bottom: 6px; }
      .trend-price { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #00ff8c; }

      /* ── newsletter ── */
      .newsletter {
        position: relative; overflow: hidden;
        border-radius: 28px; padding: 48px;
        background: rgba(255,255,255,.026); border: 1px solid rgba(255,255,255,.08);
        backdrop-filter: blur(40px); text-align: center; margin-bottom: 48px;
      }
      .newsletter h3 { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: -.4px; }
      .newsletter p { font-size: 13.5px; color: rgba(255,255,255,.4); font-weight: 300; margin-bottom: 26px; }
      .newsletter-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; }
      .newsletter-input {
        flex: 1; padding: 12px 16px; border-radius: 12px;
        background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08);
        color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; outline: none;
        -webkit-text-fill-color: #fff; transition: all .2s;
      }
      .newsletter-input::placeholder { color: rgba(255,255,255,.25); }
      .newsletter-input:focus { border-color: rgba(0,255,140,.4); box-shadow: 0 0 0 3px rgba(0,255,140,.08); }
      .newsletter-btn {
        background: linear-gradient(135deg,#00ff8c,#00c9ff) !important; border: none !important;
        border-radius: 12px !important; color: #050508 !important; font-family: 'Syne', sans-serif !important;
        font-weight: 700 !important; font-size: 13.5px !important; padding: 12px 22px !important;
        transition: transform .15s !important;
      }
      .newsletter-btn:hover { transform: translateY(-1px); }

      /* ── footer ── */
      .shop-footer {
        border-top: 1px solid rgba(255,255,255,.06);
        padding: 36px 28px; position: relative; z-index: 1;
        display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;
      }
      .footer-text { font-size: 12.5px; color: rgba(255,255,255,.25); font-family: 'DM Sans', sans-serif; }
      .footer-links { display: flex; gap: 22px; }
      .footer-links a { font-size: 12.5px; color: rgba(255,255,255,.35); text-decoration: none; transition: color .2s; }
      .footer-links a:hover { color: #00ff8c; }

      /* fade-up */
      @keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
      .fu { animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both; }
      .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
    `;
    const ex = document.getElementById('shop-css');
    if (ex) ex.remove();
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('shop-css');
      if (s) s.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadShopData = async () => {
      setIsLoadingProducts(true);
      setProductsError('');

      try {
        const [productsData, categoriesData] = await Promise.all([
          getPublicProducts(),
          getPublicCategories().catch(() => []),
        ]);

        if (!alive) return;

        setProducts(Array.isArray(productsData) ? productsData : []);
        setDbCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        if (!alive) return;
        console.error('Failed to load shop products:', error);
        setProducts([]);
        setProductsError('Unable to load products from the database.');
      } finally {
        if (alive) setIsLoadingProducts(false);
      }
    };

    loadShopData();
    return () => { alive = false; };
  }, []);

  const handleHeroMove = (e) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  const handleWishlistIconClick = () => {
    requireAuth(() => { navigate('/favourite'); });
  };

  const handleCartIconClick = () => {
    if (!requireAuth(() => {})) return;
  };

  const categoryMap = useMemo(
    () =>
      dbCategories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {}),
    [dbCategories],
  );

  const shopCategories = useMemo(
    () => [
      { label: 'All', icon: '📱' },
      ...dbCategories.map((category, index) => ({
        label: category.name,
        icon: categoryIcons[(index + 1) % categoryIcons.length],
      })),
    ],
    [dbCategories],
  );

  const getCategoryName = (product) =>
    product.category?.name ||
    categoryMap[product.category_id] ||
    `Category ${product.category_id || ''}`.trim();

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter(
          (product) => getCategoryName(product) === activeCategory,
        );

  if (isPageLoading) {
    return (
      <div className="shop-root">
        <style>{`
          .shop-root { min-height: 100vh; background: #050508; font-family: 'DM Sans', sans-serif; position: relative; width: 100%; overflow-x: hidden; }
          .shop-loading-main { max-width: 1200px; margin: 0 auto; padding: 48px 28px; position: relative; z-index: 1; min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; }
        `}</style>
        <ShopHeader
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onCartClick={handleCartIconClick}
          onWishlistClick={handleWishlistIconClick}
        />
        <main className="shop-loading-main">
          <Loading label="Loading MK7 Store..." variant="page" />
        </main>
        <ShopFooter />
      </div>
    );
  }

  return (
    <div className="shop-root">
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <ShopHeader
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={handleCartIconClick}
        onWishlistClick={handleWishlistIconClick}
      />

      {/* ── Hero ── */}
      <section className="hero">
        <div
          ref={heroRef}
          className="hero-card fu"
          onMouseMove={handleHeroMove}
        >
          <div
            className="hero-glow"
            style={{
              background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,255,140,.08) 0%, transparent 65%)`,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="hero-badge">
              <span className="hero-badge-dot" /> MK7 PRO — NOW AVAILABLE
            </span>
            <h1 className="hero-title">
              Next-gen phones.
              <br />
              Built for <span>performance.</span>
            </h1>
            <p className="hero-sub">
              Explore the MK7 lineup — flagship smartphones, accessories, and
              wearables engineered for people who move fast.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <button className="btn hero-btn-primary">Shop Phones →</button>
              <button className="btn hero-btn-ghost">Compare Models</button>
            </div>
          </div>

          <div
            className="hero-visual"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div className="hero-orb-ring" />
            <div className="hero-orb-ring r2" />
            {/* Phone silhouette */}
            <div className="hero-phone">
              <div className="hero-phone-screen">📱</div>
              <div className="hero-phone-logo">MK7</div>
            </div>
            <div className="hero-float-chip chip-1">
              <span
                className="chip-dot"
                style={{ background: '#00ff8c', boxShadow: '0 0 6px #00ff8c' }}
              />
              Free shipping over $99
            </div>
            <div className="hero-float-chip chip-2">
              <span
                className="chip-dot"
                style={{ background: '#00c9ff', boxShadow: '0 0 6px #00c9ff' }}
              />
              2-year warranty
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section-wrap fu d1">
        <div className="cat-row">
          {shopCategories.map((c) => (
            <div
              key={c.label}
              className={`cat-pill ${activeCategory === c.label ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.label)}
            >
              <span>{c.icon}</span> {c.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="section-wrap fu d2">
        <div className="section-head">
          <h2 className="section-title">
            Featured <span>Devices</span>
          </h2>
          <a href="/shop" className="section-link">
            View all →
          </a>
        </div>

        <div className="row g-3 product-grid">
          {isLoadingProducts && (
            <div className="col-12" style={{ padding: '60px 0' }}>
              <Loading label="Loading products..." variant="page" />
            </div>
          )}

          {!isLoadingProducts && productsError && (
            <div className="col-12">
              <div className="product-state error">{productsError}</div>
            </div>
          )}

          {!isLoadingProducts &&
            !productsError &&
            filteredProducts.map((product) => {
              const categoryName = getCategoryName(product);
              const categoryIndex = dbCategories.findIndex(
                (category) => category.name === categoryName,
              );

              return (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard
                    product={product}
                    categoryName={categoryName}
                    categoryIndex={categoryIndex >= 0 ? categoryIndex : 0}
                    isWishlisted={wishlist.has(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              );
            })}

          {!isLoadingProducts &&
            !productsError &&
            filteredProducts.length === 0 && (
              <div className="col-12">
                <div className="product-state">No products found.</div>
              </div>
            )}
        </div>
      </section>

      {/* ── Promo banner ── */}
      <section className="section-wrap fu d3">
        <div className="promo-banner">
          <div className="promo-text">
            <h3>Trade in & save up to $400</h3>
            <p>
              Exchange your old device at checkout. Valid on all MK7 Pro and
              Ultra models.
            </p>
            <div className="promo-code">📲 MK7TRADE400</div>
          </div>
          <button className="btn hero-btn-primary">Claim Offer →</button>
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="section-wrap fu d3">
        <div className="section-head">
          <h2 className="section-title">
            Trending <span>This Week</span>
          </h2>
          <a href="/shop?sort=trending" className="section-link">
            See more →
          </a>
        </div>
        <div className="trend-row">
          {trending.map((t, i) => (
            <div key={i} className="trend-card">
              <div
                className="trend-icon"
                style={{
                  background: `${t.color}1a`,
                  color: t.color,
                  border: `1px solid ${t.color}33`,
                }}
              >
                📱
              </div>
              <div className="trend-name">{t.name}</div>
              <div className="trend-price">${t.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="section-wrap fu d4">
        <div className="newsletter">
          <h3>
            Be first to{' '}
            <span style={{ color: '#00ff8c' }}>know</span>
          </h3>
          <p>
            Get early access to new MK7 launches, exclusive deals, and tech
            news — straight to your inbox.
          </p>
          <div className="newsletter-form">
            <input
              className="newsletter-input"
              type="email"
              placeholder="you@example.com"
            />
            <button className="btn newsletter-btn">Subscribe</button>
          </div>
        </div>
      </section>

      <ShopFooter />
    </div>
  );
}

export default ShopHome;