#!/usr/bin/env node
// Run locally: node scripts/generate-admin-secrets.mjs (never paste passwords into chat).
import {randomBytes, scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
if (!process.stdin.isTTY) {console.error('Please run this script in an interactive terminal.');process.exitCode=1;} else {
 const readSecret=(prompt)=>new Promise((resolve,reject)=>{
   let value='';
   process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
   const finish=(err)=>{process.stdin.off('data',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');err?reject(err):resolve(value)};
   const onKey=(key)=>{if(key==='\u0003')return finish(new Error('Cancelled'));if(key==='\r'||key==='\n')return finish();if(key==='\u007f'||key==='\b'){value=value.slice(0,-1);return;}if(!key.startsWith('\u001b'))value+=key;};
   process.stdin.on('data',onKey);
 });
 try {
   const pw=await readSecret('Admin password (hidden, at least 16 characters): ');
   if(pw.length<16)throw Error('Choose a password with at least 16 characters.');
   const confirm=await readSecret('Confirm password (hidden): ');
   if(pw!==confirm)throw Error('Passwords do not match.');
   const salt=randomBytes(16);
   const derived=await scrypt(pw,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
   console.log('\nCopy ONLY these values into the server environment:');
   console.log('ADMIN_PASSWORD_HASH=scrypt$32768$'+salt.toString('hex')+'$'+derived.toString('hex'));
   console.log('ADMIN_SESSION_SECRET='+randomBytes(48).toString('hex'));
   console.log('\nAlso set ADMIN_EMAIL to the confirmed Supabase admin email.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
