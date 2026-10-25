# Glass UI 2.1: Hero, Physical Card Elevation, and Product Categories

## UI
- Light Mode hero: pale blue and lilac translucent backdrop, dark legible headings, contrasting buttons and brighter image frame.
- Dark Mode hero: midnight navy gradients, light headings, cooler neon accents.
- Both appearances retain the same structure, logo switching, and product data.
- Home fallback typographic illustration is localized in Persian/English. Uploaded product imagery is intentionally not altered by site language selection.
- Light Mode cards use **physical layered elevation**: thick lower edge, bevelled surface and soft shadows. Mouse tilts up to 3.6° and lifts up to 17px; touch raises a card by 12px briefly. The light card reflection and neon glow effects are removed.
- Dark Mode keeps restrained neon glass outlines.
- Reduced-motion and keyboard navigation remain supported.

## Admin category hierarchy
- The product editor has a clear grouped category dropdown: parent category, followed by child categories.
- Current selected category displays its full path and a shortcut to the category editor.
- Clicking a stored product scrolls its details form into view on small screens.
- The product list has category/subcategory filters and a text search box, with a visible category path on each product.
- Main categories have quick access to the products within their descendant groups.
- Products without a valid database category are flagged prominently.
- Products cannot be saved with a category ID that is not present in the Supabase categories table.

## Optional safe repair
The authenticated admin action \`repairStarterCategoryLinks\` reassigns **only original starter products** whose saved category link is null or invalid, based on their known starter slug. It never changes:
- custom products
- products with an existing valid category (even if assigned differently)
- prices, images, product descriptions, mode, or publish state.

If the expected category has not been imported, the action reports this and does not modify that product. Use the existing "Import current site" action to import missing categories before repairing. No migration is required for the standard \`products.category_id\` foreign key when the existing e-commerce schema is installed.

**Important:** A source-code update does not by itself repair rows in Supabase. An authorized administrator must trigger the repair on the correct connected database. Without direct access to the actual Safire Honar Supabase project, existing database relationships cannot be confirmed or silently modified.

## Source QA
\`node scripts/check-glass-categories.mjs\` plus the existing TypeScript and Next.js Build checks. Also manually test categories/products in the authenticated administrator console; test data values and image associations cannot be inferred from a public GET request.

## Publication
Everything is committed to GitHub **main** in one push. The existing Vercel Git integration handles automatic deployment. Never create a separate manual Deployment.
