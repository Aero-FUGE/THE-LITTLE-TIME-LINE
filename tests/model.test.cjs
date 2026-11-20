const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../model.js');
test('migration retains legacy raw data, IDs, timestamps and historical selections',()=>{
 const old={journalEntries:[{id:'j1',number:7,text:'念头',day:'2026-11-19',createdAt:100}],tasks:[{id:'t1',title:'任务',doneDays:{'2026-11-18':true}}],routines:[{id:'r1',title:'日常'}],items:[{id:'s1',note:'学习',start:1000,end:61000},{id:'s2',start:70000,end:null}]};
 const s=M.migrate(old,80000);assert.deepEqual(s.legacy,old);assert.equal(s.records[0].number,7);assert.equal(s.records[0].createdAt,100);assert.equal(s.sessions.length,1);assert.equal(s.active.id,'s2');assert.equal(M.elapsed(s.active,90000),20000);assert.equal(s.records[1].today['2026-11-18'].done,true);M.validate(s);
});
test('records share identity, immutable numbering and independent classifications',()=>{
 const s=M.empty(),now=+new Date('2026-11-20T10:00');const r=M.create(s,'一','灵感',false,now),n=r.number;M.create(s,'二','思考',false,now+10);r.today[M.day(now)]={done:false};M.complete(r,true,now+20);assert.equal(r.category,'灵感');assert.equal(r.number,n);assert.equal(r.today[M.day(now)].done,true);M.complete(r,false,now+30);assert.equal(r.completedAt,null);assert.equal(s.records.length,2);assert.equal(s.records.filter(x=>x.today[M.day(now+86400000)]).length,0);
});
test('pause, reload and resume exclude background pause time',()=>{
 let a={id:'x',start:1000,mode:'down',plannedMs:5000,running:true,segmentStart:1000,accumulatedMs:0,segments:[]};
 M.pause(a,3000);assert.equal(M.elapsed(a,100000),2000);a=JSON.parse(JSON.stringify(a));M.resume(a,100000);assert.equal(a.expectedEnd,103000);assert.equal(M.elapsed(a,105000),7000);M.pause(a,105000);assert.equal(M.duration(a),7000);
});
test('finishing persists once and sums multiple sessions',()=>{
 const s=M.empty();s.active={id:'x',start:1000,mode:'up',running:true,segmentStart:1000,accumulatedMs:0,segments:[]};assert.equal(M.finish(s,5000).actualMs,4000);assert.equal(M.finish(s,6000),null);assert.equal(s.sessions.length,1);assert.equal(s.sessions[0].draft,true);
});
test('cross-midnight totals split effective segments',()=>{
 const start=+new Date('2026-11-19T23:50:00'),end=+new Date('2026-11-20T00:10:00'),s={segments:[[start,end]]};assert.equal(M.onDay(s,'2026-11-19'),600000);assert.equal(M.onDay(s,'2026-11-20'),600000);assert.equal(M.duration(s),1200000);
});
test('backup roundtrip preserves active state and rejects invalid timer',()=>{
 const s=M.migrate({items:[{id:'x',start:1000,end:null}]});assert.deepEqual(M.validate(JSON.parse(JSON.stringify(s))),s);s.active.segmentStart=null;assert.throws(()=>M.validate(s));assert.throws(()=>M.validate({version:2,records:[{}],sessions:[]}));
});
