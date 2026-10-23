'use client';
import {useActionState, useState} from 'react';
import {useFormStatus} from 'react-dom';
import {Eye, EyeOff, ArrowLeft} from 'lucide-react';
import {signInAdmin, type AdminLoginState} from './actions';

const INITIAL: AdminLoginState = {message: ''};
export default function AdminLoginForm() {
  const [state, action] = useActionState(signInAdmin, INITIAL);
  const [visible, setVisible] = useState(false);
  return <form action={action} className="admin-secure-fields">
    <label>ایمیل مدیر <input name="email" type="email" dir="ltr" autoComplete="username" required maxLength={254} placeholder="admin@example.com"/></label>
    <label>گذرواژه مدیر <span className="admin-secure-input"><input name="password" type={visible?'text':'password'} required autoComplete="current-password" maxLength={1024} placeholder="گذرواژه اختصاصی"/><button aria-label={visible?'پنهان‌کردن گذرواژه':'نمایش گذرواژه'} type="button" onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span></label>
    {state.message && <p role="alert" className="form-error">{state.message}</p>}
    <Submit/>
  </form>;
}
function Submit() {const {pending} = useFormStatus(); return <button className="v2-primary" disabled={pending}>{pending?'در حال تأیید هویت...':'ورود به پنل مدیریت'} <ArrowLeft size={19}/></button>}
