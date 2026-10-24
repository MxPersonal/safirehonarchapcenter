import type {Locale} from '@/lib/i18n';
export const categoryEnglish:Record<string,[string,string]>={
 banner:['Banners','Custom banners for events, ceremonies, retail and promotions.'],
 brochure:['Brochures','Folded and flat brochures for brands and services.'],
 'business-card':['Business Cards','Personalized business cards with distinctive finishes.'],
 signboard:['Signs and 3D Letters','Storefront signage, dimensional lettering and illuminated signs.'],
 sticker:['Stickers and Labels','Product labels, window stickers and custom decals.'],
 flyer:['Flyers and Posters','Printed flyers, event posters and promotional materials.'],
 packaging:['Printed Packaging','Custom boxes, sleeves and branded packaging.'],
 exhibition:['Exhibition Displays','Roll-up banners, display stands and event installations.'],
 condolence:['Memorial Banners','Respectful commemorative prints and tributes.'],
 birthday:['Birthday Banners','Colorful birthday banners and celebration prints.'],
 pilgrimage:['Pilgrimage Banners','Commemorative banners for pilgrimage and religious occasions.'],
 events:['Occasion Banners','Congratulations, recognition and special events.'],
 business:['Advertising Banners','Promotional banners for openings, sales and businesses.'],
 'brochure-bifold':['Bi-Fold Brochures','Two-panel brochures for company introductions.'],
 'brochure-trifold':['Tri-Fold Brochures','Three-fold brochures for marketing and information.'],
 'card-matte':['Matte Business Cards','Business cards with a premium matte finish.'],
 'card-special':['Specialty Business Cards','Distinctive cuts and bespoke finishing options.'],
 'raised-letters':['3D Letters','Dimensional lettering and custom fabrication.'],
 lightbox:['Lightbox Signs','Illuminated displays and lightbox signage.'],
 'shop-signs':['Storefront Signs','Custom shopfront and business signage.'],
 'product-label':['Product Labels','Printed labels for packaging and products.'],
 'window-sticker':['Window Stickers','Custom window decals and retail graphics.']
};
export const designEnglish:Record<string,[string,string]>={
 aramesh:['Serenity','Elegant memorial typography.'],
 yadegar:['Tribute','Black and gold commemorative composition.'],
 tavalod:['Celebration','Bold colors for joyful occasions.'],
 shadi:['Best Wishes','A modern palette for celebrations.'],
 ziarat:['Pilgrimage','Geometric motifs and traditional styling.'],
 roshan:['Fresh Start','A vibrant visual for brand openings.'],
 brandmark:['Identity','Labels designed for brands and packaging.'],
 tabrik:['Congratulations','A print created for memorable milestones.']
};
export const pageEnglish:Record<string,[string,string]>={
 home:['Print is an art, not just a service.','From large-format banners to the finest business cards. Explore the possibilities and make each order uniquely yours.'],
 about:['About Safire Honar','Safire Honar is a creative print studio where you can explore sample designs, personalize artwork and request bespoke printing services. Verified company information will be added by the administrator.'],
 contact:['Contact Us','For official phone numbers, business hours and the correct address, please refer to the contact information published by the studio administrator.'],
 terms:['Terms and Conditions','Our official order terms have not yet been published. Confirmed orders and payment are unavailable until the studio approves its terms.'],
 privacy:['Privacy Policy','The business administrator will review and publish the official privacy policy.']
};
export const slugTitle=(slug:string)=>slug.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function translatedFields<T extends {slug:string;name:string;description:string;name_en?:string|null;description_en?:string|null}>(record:T,locale:Locale,kind:'category'|'product'):T{
 if(locale==='fa')return record;
 const pair=(kind==='category'?categoryEnglish:designEnglish)[record.slug];
 return {...record,
  name:record.name_en?.trim()||pair?.[0]||slugTitle(record.slug),
  description:record.description_en?.trim()||pair?.[1]||'Contact our studio for more information about this print product.'} as T;
}
export function translatedPage(record:{slug:string;title:string;body:string;title_en?:string|null;body_en?:string|null},locale:Locale){
 if(locale==='fa')return record;
 const fallback=pageEnglish[record.slug];
 return {...record,title:record.title_en?.trim()||fallback?.[0]||slugTitle(record.slug),
  body:record.body_en?.trim()||fallback?.[1]||'This page is being prepared in English. Please contact the studio for assistance.'};
}
