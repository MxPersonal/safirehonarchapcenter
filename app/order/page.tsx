import {siteLocale} from '@/lib/i18n-server';
import {siteText} from '@/lib/i18n-server';
import ProjectInquiryWizard from '@/components/project-inquiry-wizard';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Custom Print Request':'سفارش چاپ اختصاصی'};}
export default async function Order(){
 const {pick}=await siteText();
 return <main className="wf-order-page">
  <header className="wf-order-intro">
   <span>{pick('سفیر هنر / سفارش اختصاصی','SAFIRE HONAR / CUSTOM REQUEST')}</span>
   <h1>{pick('سفارش چاپ، قدم‌به‌قدم','Custom printing, step by step')}</h1>
   <p>{pick('ابتدا اطلاعات تماس، سپس مشخصات پروژه و در پایان بررسی و ثبت درخواست. قیمت و زمان اجرا پس از بررسی اعلام می‌شود.','Contact details, project requirements, then review and submit. Pricing and production dates are confirmed after review.')}</p>
  </header>
  <ProjectInquiryWizard/>
 </main>;
}
