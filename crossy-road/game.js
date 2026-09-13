'use strict';
(() => {
  const canvas = document.querySelector('#board'), ctx = canvas.getContext('2d');
  const scoreEl = document.querySelector('#score'), statusEl = document.querySelector('#status');
  const HOP = .18;
  let viewWidth=528;
  const directions = {up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]};
  const keys = {ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  let player, lanes, camera, targetCamera, furthest, score, over, lastTime, hop, queued, held, landing;
  const colors = ['#ff713b','#ffe254','#8bd447','#af89ff'];
  function laneAt(row) {
    if (!lanes.has(row)) {
      const phase=row%12, river=row>2 && (phase===7||phase===8);
      const road=row>2 && [3,4,5,10].includes(phase);
      const lane={road,river,logs:[],obstacles:[],direction:row%2?1:-1,speed:Math.min(2.7,1.15+row*.025),cars:[]};
      if(road) for(let i=0;i<4;i++) lane.cars.push({x:i*5.4-5+(row*1.37%3),width:row%4===0?1.85:1.5,color:colors[(i+row)%4]});
      if(river){lane.speed=.65+(row%3)*.12;for(let i=0;i<5;i++)lane.logs.push({x:i*4.6-6+(row%2)*1.5,width:3.3});}
      lanes.set(row,lane);
    }
    const lane=lanes.get(row);
    if(!lane.road&&!lane.river){
      const {left,right}=laneBounds(row);
      lane.obstacles=[];
      // Repeat stable, spaced scenery into every visible section of the lane.
      for(let band=Math.floor(left/11)-1;band<=Math.ceil(right/11);band++){
        for(const local of [1+(row*3%4),7+(row%3)]){
          const col=band*11+local;
          if(col<left-1||col>right+1||(row<2&&col>=3&&col<=7))continue;
          lane.obstacles.push({col,type:Math.abs(col)%2?'tree':'rock'});
        }
      }
    }
    return lane;
  }
  function reset() {
    player={col:5,row:0,x:5.5,y:.5,z:0};lanes=new Map();camera=0;targetCamera=0;furthest=0;score=0;over=false;lastTime=null;hop=null;queued=null;held=new Map();landing=0;
    scoreEl.textContent='0';statusEl.textContent='Head toward class. Watch both ways!';ensureLanes();render();
  }
  function ensureLanes() {
    for(let r=Math.max(0,Math.floor(camera)-3);r<Math.ceil(camera)+18;r++)laneAt(r);
    for(const r of lanes.keys())if(r<Math.floor(camera)-4)lanes.delete(r);
  }
  function screenLimits(y){
    // Keep the full student sprite inside the current canvas, with a small visual margin.
    const offset=(y-camera-.5)*19;
    return {left:5.5+(20-viewWidth/2-offset)/43,right:5.5+(viewWidth-20-viewWidth/2-offset)/43};
  }
  function move(direction) {
    if(over)return;
    if(hop){queued=direction;return;}
    const [dx,dy]=directions[direction];
    let x=player.x+dx;
    const row=Math.max(Math.floor(targetCamera),player.row+dy);
    const limits=screenLimits(row+.5);
    if(dx!==0)x=Math.max(limits.left,Math.min(limits.right,x));
    else if(x<limits.left||x>limits.right)return;
    const col=Math.floor(x);
    if(Math.abs(x-player.x)<.001&&row===player.row)return;
    if(laneAt(row).obstacles.some(o=>Math.abs(x-(o.col+.5))<.7))return;
    hop={fromX:player.x,fromY:player.y,toX:x,toY:row+.5,col,row,forward:dy>0,t:0};
    landing=0;
  }
  function lose(reason){over=true;queued=null;held.clear();statusEl.textContent=`${reason} ${score} forward steps. Press R or Restart.`;}
  function support(){return laneAt(player.row).logs.find(log=>player.x>log.x+.12&&player.x<log.x+log.width-.12);}
  function collision() {
    // Check the same interpolated footprint that is rendered, even during hops.
    for(let r=Math.floor(player.y-.2);r<=Math.floor(player.y+.2);r++) {
      const lane=lanes.get(r);
      if(lane?.road && player.y+.2>r+.16 && player.y-.2<r+.84 && lane.cars.some(c=>player.x+.22>c.x+.06 && player.x-.22<c.x+c.width-.06)) {
        lose("Hit by traffic!");return;
      }
    }
  }
  function laneBounds(row){
    // Invert the horizontal projection, with padding for complete vehicles and camera motion.
    const center=5.5-(row-camera)*19/43;
    return {left:Math.min(-8,center-viewWidth/86-5),right:Math.max(19,center+viewWidth/86+5)};
  }
  function advanceTraffic(row,lane,dt){
    const items=lane.road?lane.cars:lane.logs;
    if(!items.length)return;
    const gap=lane.road?5.4:4.6,{left,right}=laneBounds(row);
    for(const item of items)item.x+=lane.direction*lane.speed*dt;
    items.sort((a,b)=>a.x-b.x);
    // Extend the same traffic stream outside the viewport; never teleport a visible object.
    while(items[0].x>left){const first=items[0];items.unshift({...first,x:first.x-gap});}
    while(items[items.length-1].x<right){const last=items[items.length-1];items.push({...last,x:last.x+gap});}
    while(items.length>1&&items[0].x+items[0].width<left-gap)items.shift();
    while(items.length>1&&items[items.length-1].x>right+gap)items.pop();
  }
  function update(dt) {
    if(over)return;
    ensureLanes();
    for(const [row,lane] of lanes) advanceTraffic(row,lane,dt);
    if(!hop&&laneAt(player.row).river){player.x+=laneAt(player.row).direction*laneAt(player.row).speed*dt;player.col=Math.floor(player.x);}
    let finished=false,forward=false;
    if(hop){
      hop.t=Math.min(1,hop.t+dt/HOP);
      const t=hop.t,e=t*t*(3-2*t);
      player.x=hop.fromX+(hop.toX-hop.fromX)*e;player.y=hop.fromY+(hop.toY-hop.fromY)*e;player.z=Math.sin(t*Math.PI)*14;
      if(t===1){player.col=hop.col;player.row=hop.row;forward=hop.forward;hop=null;player.z=0;landing=.1;finished=true;}
    } else landing=Math.max(0,landing-dt);
    collision();
    if(over)return;
    if(!hop&&laneAt(player.row).river&&(!support()||player.x<screenLimits(player.y).left||player.x>screenLimits(player.y).right)){lose('Into the river!');return;}
    if(finished){furthest=Math.max(furthest,player.row);if(forward)score++;scoreEl.textContent=String(score);targetCamera=Math.max(targetCamera,player.row-3);}
    camera+=(targetCamera-camera)*(1-Math.exp(-8*dt));
    if(!hop){const next=queued||Array.from(held.values()).pop();queued=null;if(next)move(next);}
  }
  // Parallel projection: ground tiles are parallelograms; vertical edges stay upright.
  function project(x,y,z=0){return {x:viewWidth/2+(x-5.5)*43+(y-camera-.5)*19,y:515-(y-camera-.5)*35+(x-player.x)*18-z};}
  function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}
  function tile(x,y,w,d,color,z=0){polygon([project(x,y,z),project(x+w,y,z),project(x+w,y+d,z),project(x,y+d,z)],color);}
  function shade(hex,factor){const n=parseInt(hex.slice(1),16);return `rgb(${(n>>16)*factor|0},${((n>>8)&255)*factor|0},${(n&255)*factor|0})`;}
  function box(x,y,w,d,h,color,z=0){
    polygon([project(x,y,z),project(x+w,y,z),project(x+w,y,z+h),project(x,y,z+h)],shade(color,.72));
    polygon([project(x+w,y,z),project(x+w,y+d,z),project(x+w,y+d,z+h),project(x+w,y,z+h)],shade(color,.85));
    tile(x,y,w,d,color,z+h);
  }
  function student(){
    const {x,y,z}=player,squash=landing>0?Math.sin(landing/.1*Math.PI)*2:0;
    tile(x-.25,y-.23,.58,.48,'#23342d55');
    const h=z-squash+(laneAt(player.row).river?7:0);
    box(x-.2,y-.17,.16,.26,7,'#343845',h);box(x+.05,y-.17,.16,.26,7,'#343845',h);
    box(x-.25,y-.19,.5,.38,14,'#d8354c',h+7);
    box(x-.34,y-.14,.09,.22,10,'#efbd96',h+8);box(x+.25,y-.14,.09,.22,10,'#efbd96',h+8);
    box(x-.18,y-.31,.36,.17,12,'#414957',h+8);box(x-.13,y-.34,.26,.06,5,'#7c8897',h+10);
    box(x-.19,y-.15,.38,.32,12,'#efbd96',h+22);box(x-.21,y-.16,.42,.35,5,'#392d32',h+32);
  }
  function car(c,row,direction){
    tile(c.x+.08,row+.1,c.width,.8,'#27313b44');
    for(const x of [c.x+.2,c.x+c.width-.35]){box(x,row+.13,.22,.13,8,'#252933');box(x,row+.74,.22,.13,8,'#252933');}
    box(c.x,row+.2,c.width,.6,13,c.color,5);box(c.x+.32,row+.26,c.width-.65,.48,12,'#eaffff',18);
    tile(c.x+.38,row+.28,c.width-.78,.43,c.color,31);
    box(direction>0?c.x+c.width-.07:c.x,row+.25,.07,.12,5,'#fff1be',9);
    box(direction>0?c.x+c.width-.07:c.x,row+.63,.07,.12,5,'#fff1be',9);
  }
  function tree(x,y){box(x,y,.15,.15,20,'#806451');box(x-.27,y-.2,.7,.65,22,'#86b924',17);box(x-.17,y-.1,.5,.45,14,'#b4e43c',39);}
  function sign(x,y,label){box(x,y,.07,.08,41,'#646675');box(x-.35,y,.85,.12,19,'#c93349',32);const p=project(x+.06,y,42);ctx.fillStyle='#fff5e8';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText(label,p.x,p.y);ctx.textAlign='left';}
  function render(){
    ctx.fillStyle='#b5e665';ctx.fillRect(0,0,viewWidth,624);
    const start=Math.max(0,Math.floor(camera)-4),end=Math.ceil(camera)+17;
    const objects=[];
    for(let r=end;r>=start;r--){
      const lane=laneAt(r);
      advanceTraffic(r,lane,0);
      const {left,right}=laneBounds(r),span=right-left;
      tile(left,r,span,1,lane.river?'#53d1f5':lane.road?'#535b72':r%2?'#b3e568':'#a4db56');
      if(lane.river){
        for(let x=Math.floor(left);x<right;x+=2.3)tile(x+(r%2)*.7,r+.65,.8,.06,'#b5f5ff');
        for(const log of lane.logs){objects.push({depth:project(log.x+log.width/2,r+.5).y-15,draw:()=>{box(log.x,r+.13,log.width,.74,7,'#b77755');for(let x=log.x+.15;x<log.x+log.width-.2;x+=.5)tile(x,r+.34,.3,.12,'#93513e',7);}});}
      } else if(lane.road){
        tile(left,r,span,.045,'#bec2b7');tile(left,r+.955,span,.045,'#404b55');
        for(let x=Math.floor(left);x<right;x+=1.7)tile(x,r+.49,.7,.035,'#d4c9a3');
        for(let y=r+.08;y<r+.95;y+=.19)tile(4.8,y,.9,.1,'#e5e1cf');
        for(const c of lane.cars)objects.push({depth:project(c.x+c.width/2,r+.5).y,draw:()=>car(c,r,lane.direction)});
      } else {
        if(r%5===1||r===0){tile(left,r+.18,span,.62,'#f0ddaa');for(let x=Math.floor(left);x<right;x++)tile(x,r+.18,.018,.62,'#d8c38b');}
        else for(let x=Math.floor(left);x<right;x++)if((x+r)%3===0)tile(x+.3,r+.4,.12,.14,'#80996f');
        for(const obstacle of lane.obstacles){const x=obstacle.col+.5;objects.push({depth:project(x,r+.5).y,draw:()=>{if(obstacle.type==='tree')tree(x,r+.5);else{box(x-.3,r+.2,.65,.6,17,'#a4a4c5');box(x-.2,r+.28,.42,.4,9,'#c2c4df',17);}}});}
        if(r%10===1)objects.push({depth:project(1,r+.8).y,draw:()=>sign(1,r+.8,r===1?'CMU':'TO CLASS')});
      }
    }
    objects.push({depth:project(player.x,player.y).y,draw:student});
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    if(over){ctx.fillStyle='#15202bb0';ctx.fillRect(0,0,viewWidth,624);ctx.fillStyle='#252b35';ctx.fillRect(viewWidth/2-216,235,432,135);ctx.textAlign='center';ctx.fillStyle='#ff7c87';ctx.font='bold 30px system-ui';ctx.fillText('MISSED CLASS!',viewWidth/2,279);ctx.fillStyle='#f4f1eb';ctx.font='16px system-ui';ctx.fillText(`${score} forward steps · Try another route`,viewWidth/2,315);ctx.font='13px system-ui';ctx.fillText('Press R or use Restart above',viewWidth/2,346);ctx.textAlign='left';}
  }
  window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(keys[key]){e.preventDefault();if(!held.has(key)){held.set(key,keys[key]);move(keys[key]);}}else if(key==='r')reset();});
  window.addEventListener('keyup',e=>{held.delete(e.key.length===1?e.key.toLowerCase():e.key);});
  window.addEventListener('blur',()=>{held.clear();queued=null;lastTime=null;});
  document.addEventListener('visibilitychange',()=>{held.clear();queued=null;lastTime=null;});
  document.querySelector('#restart').addEventListener('click',reset);
  document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.move)));
  function frame(time){let dt=lastTime===null?0:Math.min((time-lastTime)/1000,.05);lastTime=time;while(dt>0){const step=Math.min(dt,1/120);update(step);dt-=step;}render();requestAnimationFrame(frame);}
  function resizeBoard(){
    const bounds=canvas.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    const pixelRatio=Math.min(window.devicePixelRatio||1,2);
    viewWidth=624*bounds.width/bounds.height;
    canvas.width=Math.round(bounds.width*pixelRatio);
    canvas.height=Math.round(bounds.height*pixelRatio);
    ctx.setTransform(canvas.width/viewWidth,0,0,canvas.height/624,0,0);
    render();
  }
  reset();
  new ResizeObserver(resizeBoard).observe(canvas);
  resizeBoard();
  requestAnimationFrame(frame);
})();
