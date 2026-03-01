# SADIYA Collection

## Current State
AdminProducts.tsx has a single add/edit dialog with:
- Manual field entry (name, description, category, price, stock, discount, colors, tags)
- Multi-image upload (min 8, max 15) via file picker or drag & drop
- AI auto-fill triggered on first image upload (title, description, colors, tags)
- Individual AI sparkle buttons per field

No URL-import mode exists. No "image-first" manual flow exists.

## Requested Changes (Diff)

### Add
1. **URL Import mode** -- A new tab/section at the top of the Add Product dialog: "Import from URL". User pastes an Amazon/Flipkart/Snapdeal/etc. product URL, clicks "Fetch Details", and the system fetches product title, description, price, category, and images from the URL. Since cross-origin restrictions block direct fetching, use a CORS proxy (allorigins.win or similar) to retrieve page HTML, then parse out Open Graph / meta tags (og:title, og:description, og:price, og:image) and structured data (JSON-LD). All fetched data fills the form fields and imageUrls automatically. The user can then edit all fields before saving.
2. **Image-first manual mode** -- A new tab: "Upload Images First". User uploads exactly 3 images first; on upload the AI auto-fills title, description, colors, and tags immediately (same logic as existing processFiles). After AI fill, a second upload zone appears for the remaining images (up to 12 more, totaling 15 max). User edits fields freely before saving.
3. **Tab switcher** at top of dialog: three options -- "Manual" (existing flow), "Import from URL", "Upload Images First".

### Modify
- The existing "Add New Product" dialog gets a 3-tab header at the top.
- The "Manual" tab retains the current form exactly as-is.
- Validation (min 8 images) still applies regardless of mode.
- After URL import or image-first fill, user lands on the editable form with all fields pre-populated.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `addProductMode` state: `"manual" | "url-import" | "image-first"`.
2. Add URL import state: `importUrl`, `isFetching`, `fetchError`.
3. Build `fetchProductFromUrl(url)` utility in AdminProducts.tsx: uses allorigins.win proxy to get HTML, parses og:title/og:description/og:image/og:price/product:price from meta tags and JSON-LD. Returns `{ name, description, price, images[], category }`.
4. Add "Import from URL" tab UI: URL input + "Fetch Details" button + loading/error state. After fetch populates form fields + imageUrls, switches to the form view for editing.
5. Build "Upload Images First" tab UI: upload zone that accepts exactly 3 images first. On 3-image upload, auto-fill runs (same as processFiles logic), then a second zone appears for remaining images (up to 12 more).
6. Add 3-tab switcher at dialog top using existing Tabs component.
7. Ensure all 3 modes funnel into the same handleSubmit with same validation.
