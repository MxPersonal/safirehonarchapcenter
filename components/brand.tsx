import Image from 'next/image';
export default function Brand({compact=false}:{compact?:boolean}){
 return <span className={`brand ${compact?'brand-compact':''}`}>
  <span className="brand-emblem" aria-hidden="true"><Image src="/logo-no-numbers.webp" alt="" width={383} height={264} priority /></span>
  <span className="brand-copy"><strong>چاپ سفیر هنر</strong><small>SAFIRE HONAR PRINT STUDIO</small></span>
 </span>
}
