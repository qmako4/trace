const http = require('node:http');
const {spawn} = require('node:child_process');
let log = '', link = '';
const child = spawn('npx', ['expo','start','--tunnel'], {cwd:process.cwd(),env:{...process.env,CI:'1'},stdio:['ignore','pipe','pipe']});
function collect(chunk) { log=(log+chunk.toString()).slice(-20000); const match=log.match(/exp:\/\/[^\s\x1b]+/); if(match) link=match[0]; }
child.stdout.on('data',collect); child.stderr.on('data',collect);
child.on('error',e=>collect(String(e))); child.on('exit',c=>collect('\nExpo exited: '+c));
async function resolveLink(){ if(link)return; try {const r=await fetch('http://127.0.0.1:8081/_expo/open?platform=ios&runtime=expo',{signal:AbortSignal.timeout(3000)}); const j=await r.json(); if(typeof j.url==='string'&&j.url.startsWith('exp://'))link=j.url;}catch{} }
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
http.createServer(async(req,res)=>{await resolveLink();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">'+(link?'':'<meta http-equiv="refresh" content="5">')+'<style>body{font:17px system-ui;padding:24px}a{display:block;padding:16px;background:#222;color:white;border-radius:12px;text-align:center}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}</style><h1>TRACE preview</h1>'+(link?'<a href="'+esc(link)+'">Open in Expo Go</a>':'<p>Waiting for Expo tunnel. This page refreshes automatically.</p>')+'<details '+(link?'':'open')+'><summary>Startup log</summary><pre>'+esc(log)+'</pre></details>');}).listen(3000,'0.0.0.0');
