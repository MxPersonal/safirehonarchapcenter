import {redirect} from 'next/navigation';
export default async function LegacyLogin({searchParams}:{searchParams:Promise<{next?:string}>}){const {next}=await searchParams;const target=next?.startsWith('/')&&!next.startsWith('//')?`?next=${encodeURIComponent(next)}`:'';redirect('/login'+target)}
