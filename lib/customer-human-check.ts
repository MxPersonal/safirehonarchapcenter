import 'server-only';
import {createHmac, randomBytes, randomInt, timingSafeEqual} from 'node:crypto';

const lifetime=3*60*1000;
function secret(){
 const key=process.env.AUTH0_SECRET;
 if(!key||key.length<32)throw new Error('CUSTOMER_CHALLENGE_SECRET_NOT_CONFIGURED');
 return createHmac('sha256',key).update('safir:customer-human-check:v1').digest();
}
function mac(value:string){return createHmac('sha256',secret()).update(value).digest('base64url')}
export function issueCheck(){
 const digits=String(randomInt(100000,1000000));
 const nonce=randomBytes(12).toString('hex');
 const exp=Date.now()+lifetime;
 const payload=nonce+'.'+exp;
 return {digits,token:payload+'.'+mac(payload+'.'+digits)};
}
export function verifyCheck(token:unknown,answer:unknown){
 if(typeof token!=='string'||typeof answer!=='string'||token.length>300||!/^[0-9]{6}$/.test(answer))return false;
 const [nonce,exp,sig,...other]=token.split('.');
 if(other.length||!nonce||!exp||!sig||!/^[0-9a-f]{24}$/.test(nonce)||!/^\d{13}$/.test(exp))return false;
 const until=Number(exp),now=Date.now();
 if(until<=now||until-now>lifetime)return false;
 const expected=Buffer.from(mac(nonce+'.'+exp+'.'+answer));
 const actual=Buffer.from(sig);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
