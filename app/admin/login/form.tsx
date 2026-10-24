'use client';
import {useI18n} from '@/components/locale-provider';
import {useActionState, useState} from 'react';
import {useFormStatus} from 'react-dom';
import {Eye, EyeOff, ArrowLeft} from 'lucide-react';
import {signInAdmin, type AdminLoginState} from './actions';

const INITIAL: AdminLoginState = {message: ''};
export default function AdminLoginForm() {
  const {pick}=useI18n();
  const [state, action] = useActionState(signInAdmin, INITIAL);
  const [visible, setVisible] = useState(false);
  return <form action={action} className="admin-secure-fields">
    <label>{pick('ایمیل مدیر','Administrator email')} <input name="email" type="email" dir="ltr" autoComplete="username" required maxLength={254} placeholder="admin@example.com"/></label>
    <label>{pick('گذرواژه مدیر','Password')} <span className="admin-secure-input"><input name="password" type={visible?'text':'password'} required autoComplete="current-password" maxLength={1024} placeholder={pick("گذرواژه اختصاصی","Administrator password")}/><button aria-label={visible?pick('پنهان‌کردن گذرواژه','Hide password'):pick('نمایش گذرواژه','Show password')} type="button" onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span></label>
    {state.message && <p role="alert" className="form-error">{pick(state.message,'Could not sign in. Please check your administrator credentials.')}</p>}
    <Submit/>
  </form>;
}
function Submit() {const {pick}=useI18n();const {pending} = useFormStatus(); return <button className="v2-primary" disabled={pending}>{pending?pick('در حال تأیید هویت...','Verifying credentials...'):pick('ورود به پنل مدیریت','Enter admin dashboard')} <ArrowLeft size={19}/></button>}
