const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="app.css">',()=>'<style>'+fs.readFileSync(path.join(root,'app.css'),'utf8')+'</style>');
for(const name of ['model.js','app.js'])html=html.replace(`<script src="${name}" defer></script>`,()=>`<script>${fs.readFileSync(path.join(root,name),'utf8')}</script>`);
// Inline scripts run after the DOM exists, while Supabase loads independently.
html=html.replace(/<script>([\s\S]*?)<\/script>/g,(full,code)=>`<script>window.addEventListener('DOMContentLoaded',()=>{${code}\n});</script>`);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/index.html'),html);
fs.writeFileSync(path.join(root,'日迹_图标已植入_打开即用.html'),html);
console.log('Built static and standalone editions');
