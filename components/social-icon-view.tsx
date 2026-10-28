'use client';
import {Instagram,Youtube,Linkedin,Github,Facebook,Globe,Send,Music2,MessageCircle,ExternalLink,AtSign} from 'lucide-react';
import type {SocialIcon} from '@/lib/social-link-types';
const icons={instagram:Instagram,youtube:Youtube,linkedin:Linkedin,github:Github,facebook:Facebook,telegram:Send,x:AtSign,tiktok:Music2,
 eitaa:MessageCircle,rubika:MessageCircle,pinterest:AtSign,whatsapp:MessageCircle,website:Globe,globe:Globe,send:Send,music:Music2,message:MessageCircle} satisfies Record<SocialIcon,typeof Globe>;
export default function SocialIconView({name,size=22}:{name:SocialIcon;size?:number}){
 const Icon=icons[name]||Globe;
 return <Icon aria-hidden="true" size={size} strokeWidth={2}/>;
}
