# SADIYA Collection - Online Bag Store

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full e-commerce website for "SADIYA Collection – a brand of MT Industries Ltd." with tagline "Your Bags Shopping Ends Here"
- Customer authentication: Sign Up / Sign In
- Product catalog with all types of bags (handbags, backpacks, tote bags, travel bags, clutches, etc.)
- Product detail pages with image gallery, price, description, size/color options, add-to-cart
- Shopping cart and checkout flow
- Stripe payment integration for order payments
- Order management: customers can view their order history and status
- Shipping status tracking per order (carrier + tracking number stored and displayed)
- Admin dashboard (master admin role):
  - Product CRUD (add/edit/delete products with image upload)
  - AI trademark/logo detection on uploaded product images via HTTP outcall to an external vision API
  - Order management (view all orders, update shipping status and tracking number)
  - Customer management (view all registered customers)
  - Discount/offers management (create limited-time offers with animated banners)
- 10 switchable themes: user can pick a theme that persists across sessions; themes stored as named CSS variable sets (e.g., Rose Gold, Midnight Black, Ocean Blue, Forest Green, Lavender, Coral, Champagne, Slate Gray, Ruby Red, Emerald)
- Auto theme-change mode: cycles through themes automatically on a timer
- Smooth animations: animated offer banners (pulse/glow), product card hover effects, page transitions, cart add animation, confetti/pop on checkout success
- Contact/Support page showing: Mohammad Tanzeb | 8750787355 | tanzebmohammad@gmail.com
- Responsive design for mobile and desktop

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. User management: register, login (via authorization component), roles (customer / admin)
2. Product data model: id, name, description, category, price, images (blob-storage refs), stock, variants (color/size), isActive, discountPercent
3. Cart: per-user cart with items
4. Order data model: id, userId, items, total, paymentStatus, shippingStatus, trackingNumber, createdAt
5. Stripe payment intent creation and webhook confirmation
6. Shipping update endpoint (admin sets carrier + tracking)
7. Offers/announcements: id, title, description, discount, expiresAt, isActive
8. Theme preference: store selected theme per user
9. AI trademark check: HTTP outcall to image analysis API on product image upload, return result to admin
10. Admin-only guarded endpoints for product CRUD, order management, customer listing, offer management

### Frontend (React + TypeScript + Tailwind)
1. Public pages: Home (hero, featured products, offer banners), Shop (catalog with filters), Product Detail, Cart, Checkout, Order Confirmation, Contact/Support, About
2. Auth pages: Sign Up, Sign In
3. Customer account pages: My Orders, Profile
4. Admin dashboard: Products, Orders, Customers, Offers, Trademark Check results
5. Theme switcher component (10 themes + auto-cycle toggle) in header
6. Animated offer banner component (CSS keyframe animations)
7. Smooth page transitions (Framer Motion or CSS transitions)
8. Cart drawer with add-to-cart animation
9. Checkout success confetti animation
10. Fully responsive layout
