# Project Conventions & Architectural Rules

## Stack Overview
- **Backend:** Laravel (PHP) — `ecommerce_api_laravel/`
- **Frontend:** React + Vite — `ecommerce_api_reactjs/`
- **Database:** PostgreSQL 18 — database name: `E-bookstrore_db`, password: `123`
- **Dev Server Port:** Always run on port **3000** (`php artisan serve --port=3000` / `npm run dev -- --port 3000`)

---

## Cart Behavior
- Adding an existing product to the cart MUST increment the quantity, not overwrite it.
- Cart state is managed globally via `CartContext` — always consume the context, never duplicate local cart state.
- **Stock Validation**: Cart operations validate stock availability before adding/updating items
- **Shop Pages**: For pages like Home and Shop that don't use CartContext, manage cart count locally:
  - Load cart items on mount when authenticated via `getCart()`
  - Maintain `cartCount` and `cartItems` state
  - Update cart count after adding items and reload cart items to stay in sync
  - Pass `cartCount` to ShopHeader for badge display
- **Wishlist Count**: ShopHeader also displays a wishlist count badge:
  - Pages should track wishlist count and pass `wishlistCount` to ShopHeader
  - For pages with wishlist state (Home, Shop, ProductDetail, Favourites), use the actual count
  - For pages without wishlist state (Cart, Payment, Orders, OrderConfirmation), pass 0
- **Cart to Payment Flow**: Cart page passes cart items to payment page via React Router location state:
  ```jsx
  navigate('/payment', { state: { cartItems } });
  ```
  Payment page receives items via `useLocation().state?.cartItems` or fetches from API as fallback.
- **Cart Images**: 
  - Backend includes product images in cart API response via `->with(['product.productImage'])`
  - Frontend uses `item.imageUrl` directly from API response
  - Image fallback displays first letter of product name if image is missing
  - Cart page syncs global cart state after quantity updates and item removals
  - Toast notifications for cart operations (success/error feedback)

---

## Global Context Management
- **AuthContext** (`src/contexts/AuthContext.jsx`): Manages user authentication state, token, and user profile
- **CartContext** (`src/contexts/CartContext.jsx`): Provides global cart state (cartCount, cartItems, isLoading) and functions (loadCart, updateCartCount, updateCartItems)
- **WishlistContext** (`src/contexts/WishlistContext.jsx`): Provides global wishlist state (wishlistCount, wishlistItems, wishlist Set, isLoading) and functions (loadWishlist, updateWishlistCount, updateWishlist, toggleWishlistItem)
- **Context Usage**: 
  - All contexts are wrapped in `App.jsx` with proper provider hierarchy: AuthProvider → AuthPromptProvider → ToastProvider → CartProvider → WishlistProvider
  - Context functions are memoized with `useCallback` to prevent unnecessary re-renders
  - Contexts automatically load data when authentication state changes
  - Pages should consume contexts via hooks (`useAuth`, `useCart`, `useWishlist`) rather than managing local state
- **Context Dependencies**: CartContext and WishlistContext depend on AuthContext to check authentication status before loading data

---

## Frontend Data Handling
- Backend API responses for currency (prices) are returned as strings. Frontend MUST cast these to `Number()` before arithmetic or `toFixed()` formatting.
- Dates returned from the API are ISO strings — format them via `new Date(value).toLocaleDateString()` as needed.

---

## Page Layout Standard (User-Facing / Shop Pages)
Every user-browsing page (Home, Shop, ProductDetail, Cart, Payment, Favourites, etc.) MUST follow this shell:

```jsx
import ShopHeader from '../../components/layouts/ShopHeader';
import ShopFooter from '../../components/layouts/ShopFooter';
import Loading from '../../components/common/Loading';

return (
  <div className="page-root">
    <ShopHeader cartCount={cartCount} wishlistCount={wishlistCount} onCartClick={handleCartClick} onWishlistClick={handleWishlistClick} />
    <main>
      {loading ? (
        <Loading label="Loading..." variant="page" />
      ) : (
        /* page content */
      )}
    </main>
    <ShopFooter />
  </div>
);
```

- **Never** use a bare early-return (`if (loading) return <Loading />`) that skips rendering `<ShopHeader />` and `<ShopFooter />`. The loading check must be **inline inside `<main>`**.
- `ShopFooter` is a re-export of the full `Footer` component — editing `Footer.jsx` propagates to all shop pages automatically.
- Admin pages use `<AdminLayout />` (sidebar + `<Navbar />`). Auth pages use `<AuthLayout />`.
- **Admin Sidebar**: Includes a "Visit Shop" button under the "Client View" section for quick navigation to the user-facing store.
- **Admin Capabilities**: Users with the `admin` role have full access to client-facing features, including cart management and order placement.
- **Shop Page**: The shop page (`src/pages/shop/Shop.jsx`) includes full product filtering, cart integration, and favourites management. Navigation to payment page via cart checkout flow.

---

## Toast / Alert Notification System
- The global toast system lives in `src/contexts/ToastContext.jsx`.
- It is provided at the top level in `src/App.jsx`, wrapping all routes.
- Consume it in any component via:
  ```js
  import { useToast } from '../../contexts/ToastContext';
  const { showToast } = useToast();
  // Usage:
  showToast('Product added to cart!', 'success');
  showToast('Removed from favourites.', 'info');
  showToast('Please log in first.', 'warning');
  showToast('Something went wrong.', 'error');
  ```
- Toast types: `'success'` | `'error'` | `'warning'` | `'info'`
- **All user-triggered actions** (add to cart, add/remove favourite, login errors, cart operations) MUST trigger a toast. Never use `alert()` or `console.log` for user feedback.
- **Cart Operations**: Cart page uses toast notifications for:
  - Quantity update success/failure
  - Item removal success/failure
  - General cart operation feedback

---

## Favourites Feature
- Favourites are **persisted in the database** via the `favourites` table (user_id, product_id).
- All CRUD is handled through `src/services/favouriteService.js` which calls the Laravel API.
- API endpoints (authenticated, `auth:sanctum` middleware):
  - `GET  /api/favourites` — list user's favourites
  - `POST /api/favourites` — add (`{ product_id }`)
  - `DELETE /api/favourites/{productId}` — remove
- Frontend state for "is this product a favourite?" is derived by checking if `product.id` exists in the fetched favourites list.

---

## ProductCard Component Rules
`src/components/products/ProductCard.jsx` is the single reusable card for all product grids.

### Structure — Navigation vs. Action separation
The card wrapper is a **plain `<div class="product-card">`**, NOT a `<Link>`. Only the navigable zones are wrapped in `<Link>`:

```jsx
<div className="product-card">
  {/* Image → navigates to detail */}
  <Link to={`/products/${product.id}`}>
    <div className="product-img">…</div>
  </Link>

  <div className="product-body">
    {/* Name/meta → navigates to detail */}
    <Link to={`/products/${product.id}`}>…</Link>

    {/* Footer: price + buttons → NEVER inside a Link */}
    <div className="product-footer">
      <div className="product-price">…</div>
      <button onClick={handleAddToCart}>…</button>   {/* ← standalone, e.preventDefault() */}
    </div>
  </div>
</div>
```

- The ♡ wishlist button and ＋ add-to-cart button MUST call `e.preventDefault()` and `e.stopPropagation()`.
- **Never** wrap the entire card in a `<Link>` — clicking action buttons would trigger navigation.

### CSS dependency — self-contained styles
`ProductCard` relies on these CSS classes: `.product-card`, `.product-img`, `.product-img-photo`, `.product-img-fallback`, `.product-badge`, `.product-wish`, `.product-body`, `.product-cat`, `.product-name`, `.product-meta`, `.product-rating`, `.product-footer`, `.product-price`, `.price-now`, `.price-old`, `.product-add`.

**These classes are NOT global.** Each page that renders `<ProductCard>` MUST include all of them in its own `<style>` block. Do NOT assume they'll be available from another page's injected CSS.

---

## ShopHeader — Live Search
`ShopHeader` contains a live product search dropdown:
- Products are fetched once on mount via `getPublicProducts()` and cached in local state.
- Typing debounces **180ms** then filters `allProducts[]` client-side (name + category match).
- Results are capped at **8** and shown as glassmorphic mini-cards (thumbnail, name, category, price).
- Clicking a result navigates to `/products/:id` and clears the search.
- **ESC** clears and closes; clicking outside also closes.
- The search `<div>` wrapper uses `ref={searchRef}` for outside-click detection.

Do NOT add another search feature elsewhere that duplicates this — extend `ShopHeader`'s search instead.

---

## Frontend File/Folder Conventions
```
src/
  api/            # Axios instance (base URL, auth headers)
  components/
    common/       # Loading, Alert, Pagination, LoginPromptModal, ModalDelete
    layouts/      # ShopHeader (with live search), ShopFooter (→ Footer), AdminLayout, AuthLayout, Navbar, Sidebar
    products/     # ProductCard (reusable, self-contained structure)
    forms/        # Reusable form components
  contexts/       # AuthContext, AuthPromptContext, ToastContext
  hooks/          # Custom React hooks
  pages/
    auth/         # Login, Register
    home/         # Home (product listing/browsing)
    shop/         # Shop (full product catalog with filtering, search, pagination)
    products/     # ProductDetail
    cart/         # Cart (with delete confirmation modal)
    payment/      # Payment (checkout flow with card/PayPal/Apple Pay)
    order-confirmation/ # Order confirmation page
    orders/       # Order history and order details
    favourite/    # Favourite (must include full product-card CSS in its own <style>)
    categories/   # Admin: category management
    dashboard/    # Admin: dashboard
    users/        # Admin: user management
    errors/       # 404, etc.
  routes/         # AppRoutes.jsx (React Router config)
  services/       # authService, cartService, productService, favouriteService, categoryService, userService, orderService
  utils/          # Shared utility functions (userDisplay, etc.)
```

---

## Styling & Theming
- **Theme:** Dark glassmorphic UI with neon green (`#00ff8c`) and cyan (`#00c9ff`) accents.
- **Background base:** `#050508`
- **Typography:** Google Fonts — `Syne` (headings, 700/800) + `DM Sans` (body, 300/400/500).
- **Animations:** Prefer `fadeUp`, `drift` (ambient orbs), `scale`, and glow animations. Avoid jarring transitions.
- **Glass cards:** `background: rgba(255,255,255,0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.07);`
- **Ambient orbs:** Every major page should have 2–3 positioned `<div class="orb">` elements with `radial-gradient` and a `drift` keyframe animation for visual depth.
- Avoid plain/flat colors (red, blue, green). Use HSL-tuned or gradient variants.
- Do NOT use Tailwind CSS. All styling is Vanilla CSS (inline styles or `<style>` blocks in JSX).
- **Overflow Handling**: 
  - `html, body` should have `overflow-x: hidden` and `overflow-y: auto`
  - `#root` should have `overflow: visible` to prevent scroll issues
  - Page containers should use `overflow: visible` to allow proper scrolling

---

## API Service Pattern
Each service file in `src/services/` follows this pattern:
```js
import api from '../api/axiosInstance'; // or equivalent

export const getSomething = () => api.get('/endpoint');
export const createSomething = (data) => api.post('/endpoint', data);
export const deleteSomething = (id) => api.delete(`/endpoint/${id}`);
```

- Always handle errors in the **calling component** (try/catch), not inside the service.
- Auth token is attached automatically via the Axios interceptor.
- **Cart API**: Backend cart endpoint includes product images via eager loading:
  - Laravel: `->with(['product.productImage'])` to load product images
  - Response includes `imageUrl` field from `product.productImage->first()->image_url`
  - Frontend consumes `item.imageUrl` directly for image display

---

## Authentication
- Auth state is managed by `AuthContext` (`src/contexts/AuthContext.jsx`).
- Unauthenticated users attempting gated actions (cart, favourites) should see the `<LoginPromptModal />` via `AuthPromptContext`, NOT be hard-redirected.
- Protected routes are defined in `AppRoutes.jsx`.

---

## Navigation Active States
- Navigation components should highlight the active page link based on the current route.
- Use `useLocation` hook from React Router to get current pathname.
- Create an `isActive(path)` helper function to check if current path matches the link path.
- Apply `active` class conditionally: `className={isActive('/path') ? 'active' : ''}`
- This applies to both `Navbar.jsx` (admin) and `ShopHeader.jsx` (shop pages).

---

## ModalDelete Component
- `src/components/common/ModalDelete.jsx` provides a reusable confirmation dialog for delete actions.
- Props: `open` (boolean), `title` (string), `onCancel` (function), `onConfirm` (function)
- Usage pattern for delete confirmation:
  ```jsx
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // In JSX:
  <ModalDelete
    open={deleteModalOpen}
    title="Remove item from cart"
    onCancel={handleDeleteCancel}
    onConfirm={handleDeleteConfirm}
  />
  ```
- Each page using ModalDelete must include its own modal CSS styles (`.modal-backdrop`, `.modal`, etc.)

---

## Payment Page
- `src/pages/payment/payment.jsx` handles the checkout flow with multiple payment methods.
- **Cart Connection**: Cart page passes cart items via React Router location state: `navigate('/payment', { state: { cartItems } })`
- **Payment Methods**: Card, PayPal, Apple Pay with tab selection UI
- **Authentication**: Requires authentication - redirects to login if not authenticated
- **Cart Loading**: Loads cart items from location state or API as fallback
- **Image Handling**: Checks multiple possible image field names from API response (`product_image`, `imageUrl`, `image`, `images` array, nested `product` object)
- **Styling**: Follows project dark glassmorphic theme with vanilla CSS (no Tailwind)
- **Components**: Uses ShopHeader, ShopFooter, Loading for consistent layout
- **Processing**: Shows processing overlay during payment simulation
- **Order Summary**: Displays subtotal, tax (10%), shipping (free over $50), and total

---
## ConfirmModal Component
- `src/components/common/ConfirmModal.jsx` provides a consistent, glassmorphic confirmation dialog for destructive actions (e.g., delete, logout).
- Always use `ConfirmModal` instead of native `window.confirm` for a polished user experience.
- Props: `open` (boolean), `title` (string), `message` (string), `onCancel` (function), `onConfirm` (function), `confirmText` (string).
- **Styling**: All modals MUST adhere to the project's glassmorphic design (`backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.05)`, `z-index: 9999`).
- Ensure modals are perfectly centered (vertically and horizontally) using flexbox and `margin: auto` on the modal content.

---

## Order Management
- **Backend**: Laravel Order and OrderItem models with relationships to User and Product
- **Stock Management**: Automatic stock validation and decrement during checkout, restoration on order cancellation
- **Cancellation Policy**: Orders can only be cancelled within 24 hours of purchase if status is not 'completed'.
- **Revenue Sync**: Dashboard revenue calculations exclude 'cancelled' orders immediately.
- **Order API**: `POST /user/orders/checkout`, `GET /user/orders`, `GET /user/orders/{id}`, `POST /user/orders/{id}/cancel`
- **Order History**: `src/pages/orders/Orders.jsx` displays user's order history with status filtering
- **Order Details**: `src/pages/orders/OrderDetails.jsx` shows comprehensive order information with cancel functionality
- **Order Confirmation**: `src/pages/order-confirmation/OrderConfirmation.jsx` displays order success with order details
- **Navigation**: Orders link added to ShopHeader navigation and profile dropdown
- **Order Status**: pending, processing, completed, cancelled with color-coded badges
- **Payment Methods**: card, paypal, apple_pay with proper labeling
- **Transaction Safety**: Uses database transactions to ensure atomic operations
--- End of Context from: D:/Document/CODES DEV/ETEC_Laravel_Project/GEMINI.md ---
