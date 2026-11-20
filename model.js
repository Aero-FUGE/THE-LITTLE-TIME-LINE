(function(root){
'use strict';
const KEY='riji-unified-v2', cats=['待办','灵感','思考','体验','情绪'];
const day=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const empty=()=>({version:2,records:[],sessions:[],active:null,legacy:{},revision:0});
function migrate(old,now=Date.now()){
 const s=empty();s.legacy=structuredClone(old);const add=(x)=>{if(!s.records.some(r=>r.id===x.id))s.records.push(x)};
 for(const x of old.journalEntries||[])add({id:String(x.id||uid()),text:x.text||'',category:cats.includes(x.category)?x.category:'思考',createdAt:x.createdAt||now,day:x.day||day(x.createdAt||now),number:x.number||1,done:false,today:{},updatedAt:now});
 for(const x of [...old.tasks||[],...old.routines||[]]){const dates=Object.keys(x.doneDays||{}).filter(d=>x.doneDays[d]).sort();add({id:String(x.id),text:x.title||'',category:'待办',createdAt:x.updatedAt||now,day:x.day||day(x.updatedAt||now),number:0,done:x.repeat==='once'?!!dates.length:!!x.doneDays?.[day(now)],completedAt:dates.length?new Date(dates.at(-1)+'T12:00').getTime():null,today:Object.fromEntries(dates.map(d=>[d,{done:true}])),legacySchedule:x,updatedAt:now})}
 for(const x of old.items||[]){if(!Number.isFinite(x.start))continue;const session={id:String(x.id),name:x.note||'未命名事项',start:x.start,end:x.end,mode:x.estimateMin?'down':'up',plannedMs:(x.estimateMin||0)*60000,result:'阶段性完成',note:'',activity:'生活',segments:x.end?[[x.start,x.end]]:[],updatedAt:x.updatedAt||now};if(x.end!=null)s.sessions.push(session);else if(!s.active)s.active={...session,running:true,segmentStart:x.start,accumulatedMs:0,alerted:!!x.deadlineNotified,expectedEnd:x.deadline||null};else s.sessions.push({...session,end:now,segments:[[x.start,now]]})}
 const used={};for(const r of s.records){used[r.day]=Math.max(used[r.day]||0,r.number||0)}for(const r of s.records)if(!r.number)r.number=++used[r.day];return s;
}
function elapsed(a,now=Date.now()){return a?(a.accumulatedMs||0)+(a.running?Math.max(0,now-a.segmentStart):0):0}
function pause(a,now=Date.now()){if(a?.running){a.segments.push([a.segmentStart,now]);a.accumulatedMs=elapsed(a,now);a.running=false;a.segmentStart=null;a.expectedEnd=null}return a}
function resume(a,now=Date.now()){if(a&&!a.running){a.segmentStart=now;a.running=true;a.expectedEnd=a.mode==='down'?now+Math.max(0,a.plannedMs-a.accumulatedMs):null}return a}
function create(s,text,category='思考',today=false,now=Date.now()){const d=day(now);const r={id:uid(),text,category,createdAt:now,day:d,number:1+Math.max(0,...s.records.filter(x=>x.day===d).map(x=>x.number)),done:false,pinned:false,priority:0,order:now,today:today?{[d]:{done:false}}:{},updatedAt:now};s.records.push(r);return r}
function complete(r,value,now=Date.now()){r.done=value;r.completedAt=value?now:null;r.updatedAt=now;const d=day(now);if(r.today[d])r.today[d].done=value}
function duration(s){return (s.segments||[]).reduce((sum,[a,b])=>sum+Math.max(0,b-a),0)}
function onDay(s,d){const lo=new Date(d+'T00:00').getTime(),hi=new Date(d+'T00:00');hi.setDate(hi.getDate()+1);return (s.segments||[]).reduce((v,[a,b])=>v+Math.max(0,Math.min(b,+hi)-Math.max(a,lo)),0)}
function finish(s,now=Date.now()){const a=s.active;if(!a)return null;pause(a,now);const record={...a,end:now,actualMs:elapsed(a,now),draft:true,result:'未完成',updatedAt:now};delete record.segmentStart;delete record.running;s.sessions.push(record);s.active=null;return record}
function validate(s){if(s?.version!==2||!Array.isArray(s.records)||!Array.isArray(s.sessions))throw Error('备份格式不正确');const ids=new Set();for(const r of s.records){if(!r||typeof r.id!=='string'||ids.has(r.id)||typeof r.text!=='string'||!cats.includes(r.category)||!Number.isFinite(r.createdAt)||!/^\d{4}-\d{2}-\d{2}$/.test(r.day)||!Number.isFinite(r.number)||!r.today||typeof r.today!=='object')throw Error('记录数据不完整');ids.add(r.id)}for(const t of [...s.sessions,...s.active?[s.active]:[]]){if(!t||typeof t.id!=='string'||!Number.isFinite(t.start)||!Array.isArray(t.segments)||t.segments.some(p=>!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[1]<p[0]))throw Error('计时数据不完整')}if(s.active&&(!Number.isFinite(s.active.accumulatedMs)||(s.active.running&&!Number.isFinite(s.active.segmentStart))))throw Error('运行计时无效');return s}
const api={KEY,cats,day,uid,empty,migrate,elapsed,pause,resume,create,complete,duration,onDay,finish,validate};root.Riji=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
