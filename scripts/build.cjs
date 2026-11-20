const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="app.css">',()=>'<style>'+fs.readFileSync(path.join(root,'app.css'),'utf8')+'</style>');
for(const name of ['model.js','app.js'])html=html.replace(`<script src="${name}" defer></script>`,()=>`<script>${fs.readFileSync(path.join(root,name),'utf8')}</script>`);
// Inline scripts run after the DOM exists, while Supabase loads independently.
html=html.replace(/<script>([\s\S]*?)<\/script>/g,(full,code)=>`<script>window.addEventListener('DOMContentLoaded',()=>{${code}\n});</script>`);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const asset of ['日迹.ico','apple-touch-icon.png','manifest.webmanifest','icons'])fs.cpSync(path.join(root,asset),path.join(root,'dist',asset),{recursive:true});
fs.writeFileSync(path.join(root,'dist/index.html'),html);
const standalone=html.replace(/href="日迹\.ico\?v=[^"]+"/,()=>`href="data:image/x-icon;base64,${fs.readFileSync(path.join(root,'日迹.ico')).toString('base64')}"`).replace(/href="apple-touch-icon\.png\?v=[^"]+"/,()=>`href="data:image/png;base64,${fs.readFileSync(path.join(root,'apple-touch-icon.png')).toString('base64')}"`).replace(/<link rel="manifest"[^>]*>/,'');
fs.writeFileSync(path.join(root,'日迹_图标已植入_打开即用.html'),standalone);
console.log('Built static and standalone editions');
