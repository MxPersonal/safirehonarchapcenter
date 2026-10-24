-- Additive multilingual fields for editable pages, categories, and products.
-- Apply in the Supabase project connected to Safire Honar. Existing Persian data survives unchanged.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.site_pages
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS body_en text;
-- Preserve existing RLS policies. All writes use the same authenticated admin API.
-- Do not use a machine translation service or publish guesses as official terms.
COMMENT ON COLUMN public.site_pages.body_en IS 'Administrator-approved English copy; empty means unpublished English version.';
