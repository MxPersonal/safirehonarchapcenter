-- Safire Honar product-family taxonomy upgrade.
-- Apply AFTER 20261023_print_commerce.sql using Supabase SQL Editor (or Supabase CLI migrations).
-- This is additive: existing products, orders, user accounts, and category IDs remain intact.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS categories_parent_sort_idx ON public.categories(parent_id, sort_order);

-- Only two levels are currently supported: Product Type -> Subcategory.
-- Prevent self-reference, cyclic hierarchy, or reparenting a category that already has children.
CREATE OR REPLACE FUNCTION public.validate_category_hierarchy()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF NEW.parent_id IS NOT NULL THEN
   IF NEW.id=NEW.parent_id THEN RAISE EXCEPTION 'A category cannot be its own parent'; END IF;
   IF EXISTS(SELECT 1 FROM public.categories p WHERE p.id=NEW.parent_id AND p.parent_id IS NOT NULL)
     THEN RAISE EXCEPTION 'A subcategory cannot contain another subcategory'; END IF;
   IF EXISTS(SELECT 1 FROM public.categories c WHERE c.parent_id=NEW.id)
     THEN RAISE EXCEPTION 'A category with children cannot become a subcategory'; END IF;
 END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS check_category_hierarchy ON public.categories;
CREATE TRIGGER check_category_hierarchy BEFORE INSERT OR UPDATE OF parent_id
ON public.categories FOR EACH ROW EXECUTE FUNCTION public.validate_category_hierarchy();

-- Root product types. These are catalogue placeholders, not verified available products or offers.
INSERT INTO public.categories(slug,name,description,theme,sort_order,active) VALUES
 ('banner','بنر','بنر مناسبتی، زیارتی، تولد، تسلیت و تبلیغاتی','coral',10,true),
 ('brochure','بروشور','بروشورهای تبلیغاتی و معرفی خدمات و محصولات','gold',20,true),
 ('business-card','کارت ویزیت','کارت ویزیت رسمی و اختصاصی با انواع جنس و روکش','ink',30,true),
 ('signboard','تابلو و حروف برجسته','تابلو فروشگاهی، حروف برجسته و لایت‌باکس','cobalt',40,true),
 ('sticker','استیکر و لیبل','برچسب اختصاصی و لیبل محصولات','teal',50,true),
 ('flyer','تراکت و پوستر','محصولات چاپی اطلاع‌رسانی و تبلیغاتی','violet',60,true),
 ('packaging','بسته‌بندی چاپی','بسته‌بندی، جعبه و پاکت چاپی','gold',70,true),
 ('exhibition','چاپ و سازه نمایشگاهی','رول‌آپ، استند و چاپ غرفه','coral',80,true)
ON CONFLICT(slug) DO NOTHING;

-- Preserve prior category IDs and product associations when turning old occasion categories into banner children.
UPDATE public.categories SET parent_id=(SELECT id FROM public.categories WHERE slug='banner')
WHERE slug IN ('condolence','birthday','pilgrimage','business','events') AND parent_id IS NULL;

-- Seed only missing subcategories; admins can edit or deactivate them after installation.
INSERT INTO public.categories(slug,name,description,theme,parent_id,sort_order,active)
SELECT s.slug,s.name,s.description,s.theme,p.id,s.sort_order,true
FROM (VALUES
 ('banner','condolence','بنر تسلیت','طرح‌های تسلیت و یادبود','ink',10),
 ('banner','birthday','بنر تولد','طرح‌های تولد و جشن','coral',20),
 ('banner','pilgrimage','بنر زیارتی','حج و کربلا','teal',30),
 ('banner','events','بنر مناسبتی','تبریک و قدردانی','violet',40),
 ('banner','business','بنر تبلیغاتی','افتتاحیه و تبلیغات','cobalt',50),
 ('brochure','brochure-bifold','بروشور دو لت','چاپ بروشور با یک خط تا','gold',10),
 ('brochure','brochure-trifold','بروشور سه لت','چاپ بروشور سه‌قسمتی','gold',20),
 ('business-card','card-matte','کارت ویزیت مات','روکش مات','ink',10),
 ('business-card','card-special','کارت ویزیت خاص','پرداخت سفارشی','cobalt',20),
 ('signboard','raised-letters','حروف برجسته','تابلو و حروف برجسته','cobalt',10),
 ('signboard','lightbox','لایت‌باکس','تابلو نورپردازی‌شده','teal',20),
 ('signboard','shop-signs','تابلو فروشگاهی','سردر فروشگاه و تابلو تبلیغاتی','ink',30),
 ('sticker','product-label','لیبل محصولات','لیبل چاپی بسته‌بندی','teal',10),
 ('sticker','window-sticker','استیکر ویترین','استیکر فروشگاهی و شیشه','gold',20)
) AS s(parent_slug,slug,name,description,theme,sort_order)
JOIN public.categories p ON p.slug=s.parent_slug
ON CONFLICT(slug) DO NOTHING;

-- RLS remains active, using the existing admin-only insert/update policies.
