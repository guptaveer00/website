const assert=require('node:assert/strict');const {deck,judge}=require('./game-core.js');
assert.equal(judge([10,20],1,0).points,100);assert.equal(judge([-5,-15],0,1).points,125);assert.equal(judge([2,3],0,4).streak,0);assert.equal(judge([2,3],1,20).points,200);assert.equal(judge([1.234,1.233],0,0).tie,true);assert.equal(judge([1.234,1.233],1,0).correct,true);
for(const pool of ['tech','mixed'])for(const days of [30,90,365]){const rounds=deck({rounds:10,days,pool},new Date('2026-09-19T12:00:00Z'));assert.equal(rounds.length,10);assert.equal(new Set(rounds.map(r=>r.pair.map(c=>c.symbol).sort().join())).size,10);for(const r of rounds){assert(r.end<'2026-09-19');assert.equal((Date.parse(r.end)-Date.parse(r.start))/86400000,days);assert.notEqual(r.pair[0].symbol,r.pair[1].symbol);}}
console.log('PASS: winner selection, negative returns, ties, streaks, bonus cap, distinct pairs, historical windows, both stock pools.');

for(const pool of ['tech','mixed']) {const first=deck({rounds:10,days:90,pool});const symbols=first.flatMap(r=>r.pair.map(c=>c.symbol));assert.equal(new Set(symbols).size,20);if(pool==='mixed'){const next=deck({rounds:10,days:90,pool,recent:symbols});assert(next.every(r=>r.pair.every(c=>!symbols.includes(c.symbol))));}}
console.log('PASS: no repeated companies within a game, fresh mixed-sector companies on replay.');
