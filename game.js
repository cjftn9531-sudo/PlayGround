import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

const canvas=document.querySelector('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene();scene.background=new THREE.Color('#604639');scene.fog=new THREE.Fog('#604639',19,37);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,14,18);
scene.add(new THREE.HemisphereLight('#ffe3b3','#44302a',2.2));
const sun=new THREE.DirectionalLight('#fff0cf',3.3);sun.position.set(-7,13,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;sun.shadow.bias=-.0005;scene.add(sun);
const fill=new THREE.PointLight('#ee8553',18,18);fill.position.set(7,5,-4);scene.add(fill);
const mat=(color,rough=.8)=>new THREE.MeshStandardMaterial({color,roughness:rough});
const mats={floor:mat('#765343'),tile1:mat('#80604c'),tile2:mat('#72513f'),dark:mat('#31211d'),wood:mat('#52352a'),wood2:mat('#80523a'),gold:mat('#d7a455'),cream:mat('#f3d9aa'),red:mat('#bc5140'),green:mat('#71905d'),skin:mat('#e6ad78'),metal:mat('#c5c6b6',.4),black:mat('#30201e'),pink:mat('#dd7c69'),white:mat('#f6e8cb'),blue:mat('#648b9b')};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),mats.floor);ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const arena=new THREE.Group();scene.add(arena);
const tileGeo=new THREE.BoxGeometry(1.95,.12,1.95);
for(let x=-5;x<=5;x++)for(let z=-4;z<=4;z++){let t=new THREE.Mesh(tileGeo,((x+z)&1)?mats.tile1:mats.tile2);t.position.set(x*2,-.035,z*2);t.receiveShadow=true;arena.add(t)}
function box(parent,w,h,d,material,x,y,z,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,r,material,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m}
function cylinder(parent,rt,rb,h,material,x,y,z,n=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
// cozy alley perimeter: timber stalls, awnings, lanterns, crates
for(let side of [-1,1]){
  const wall=box(arena,2.4,4,19,mats.wood,side*12,1.8,0);wall.material=mat(side<0?'#52332a':'#604034');
  for(let z of [-7,-3,1,5,8]){
    const stall=new THREE.Group();stall.position.set(side*9.3,0,z);arena.add(stall);
    box(stall,3.8,.22,2.8,mats.wood2,0,2.2,0);box(stall,3.4,.16,2.5,mats.red,0,2.37,0);
    for(let x of [-1.4,1.4])box(stall,.14,2.2,.14,mats.wood,-x,1.1,0);
    box(stall,3.4,.72,.24,mats.wood2,0,.54,1.2);
    for(let x=-1.3;x<=1.31;x+=.65){box(stall,.4,.35,.32,mats.gold,x,.99,.62);}
    const lamp=new THREE.PointLight('#ffbb65',3.5,6);lamp.position.set(0,2.8,.4);stall.add(lamp);
    const lantern=new THREE.Group();lantern.position.set(0,2.95,.4);stall.add(lantern);box(lantern,.22,.33,.22,mats.gold,0,0,0);sphere(lantern,.08,mat('#fff0a0',.2),0,0,0,.7,1.3,.7);
  }
}
for(let z of [-10,10]){
  box(arena,24,3,.6,mats.wood,-0,1.2,z);
  for(let x=-10;x<=10;x+=2.5)box(arena,.17,3.6,.24,mats.gold,x,1.5,z);
}
// little butchery props
function createCrate(x,z,size=1){const g=new THREE.Group();g.position.set(x,.04,z);arena.add(g);box(g,size,.8*size,size,mats.wood2,0,.4*size,0);for(let a of [-1,1]){box(g,size*1.04,.09*size,.1*size,mats.gold,0,.2*size,a*.32*size);box(g,.1*size,.09*size,size*1.04,a*.32*size,.2*size,0)}return g}
createCrate(-7,-8,1.2);createCrate(7,8,1);createCrate(-7,7,.9);createCrate(7,-7,1.1);
// overhead cloth flags
for(let x of [-5,0,5]){const flag=box(arena,1.2,.08,2.5,mat(x===0?'#bc5140':'#d39b55'),x,5,-9);flag.rotation.z=.03}

const player=new THREE.Group();scene.add(player);player.position.set(0,0,2);player.rotation.order='YXZ';
const avatar=new THREE.Group();player.add(avatar);
// small heroic butcher character
const body=sphere(avatar,.48,mats.blue,0,1.03,0,.82,1.05,.64);body.material=mat('#557f8b');
cylinder(avatar,.37,.45,.28,mats.cream,0,1.53,0);
sphere(avatar,.37,mats.skin,0,1.96,0,1,.94,.88);
// chef hat base + puff
cylinder(avatar,.29,.34,.15,mats.white,0,2.27,0);sphere(avatar,.24,mats.white,-.11,2.4,0,.85,.85,.85);sphere(avatar,.23,mats.white,.1,2.4,0,.85,.85,.85);
// face
sphere(avatar,.045,mats.black,-.14,1.99,.32);sphere(avatar,.045,mats.black,.14,1.99,.32);sphere(avatar,.055,mats.pink,0,1.88,.34,1,.65,.6);
// apron and straps
const apron=box(avatar,.46,.58,.12,mats.cream,0,1.04,.38);apron.rotation.x=-.08;
box(avatar,.06,.65,.08,mats.gold,0,1.49,.33);
for(let x of [-.22,.22]){const arm=sphere(avatar,.17,mats.skin,x,1.35,0,1,1.05,1);arm.name='arm'+x;}
for(let x of [-.2,.2]){cylinder(avatar,.12,.15,.5,mats.black,x,.35,0);box(avatar,.17,.13,.32,mats.wood2,x,.09,.08)}
const weapon=new THREE.Group();weapon.position.set(.56,1.43,.22);weapon.rotation.z=-.42;avatar.add(weapon);
const handle=cylinder(weapon,.055,.07,.45,mats.wood2,0,-.17,0,8);handle.rotation.x=Math.PI/2;
const blade=box(weapon,.43,.32,.08,mats.metal,.04,.16,0);blade.rotation.z=-.18;
const bladeTip=new THREE.Mesh(new THREE.ConeGeometry(.15,.26,4),mats.metal);bladeTip.position.set(.23,.35,0);bladeTip.rotation.z=-.78;weapon.add(bladeTip);bladeTip.castShadow=true;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,24),new THREE.MeshBasicMaterial({color:'#1a0e0b',transparent:true,opacity:.22}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;player.add(shadow);

let enemies=[];let pickups=[];let effects=[];let running=false,paused=false,gameOver=false,started=false;
let level=1,xp=0,xpNeed=5,kills=0,meat=0,coins=0,wave=1,hp=100,maxHp=100,damage=20,attackRate=.5,speed=5.1,attackTimer=0,spawnTimer=1.5,waveKills=0;
let move={x:0,z:0},attackHeld=false,keys={};let clock=new THREE.Clock();let toastTimer;
const ui={meat:document.querySelector('#meat'),coins:document.querySelector('#coins'),level:document.querySelector('#level'),xpNow:document.querySelector('#xp-now'),xpMax:document.querySelector('#xp-max'),xpFill:document.querySelector('#xp-fill'),hpFill:document.querySelector('#health-fill'),hpText:document.querySelector('#health-text'),wave:document.querySelector('#wave-label'),waveNum:document.querySelector('#wave-num'),enemy:document.querySelector('#enemy-count')};
function updateHud(){ui.meat.textContent=meat;ui.coins.textContent=coins;ui.level.textContent=level;ui.xpNow.textContent=xp;ui.xpMax.textContent=xpNeed;ui.xpFill.style.width=(xp/xpNeed*100)+'%';ui.hpFill.style.width=Math.max(0,hp/maxHp*100)+'%';ui.hpText.textContent=Math.ceil(hp)+' / '+maxHp;ui.waveNum.textContent='웨이브 '+wave;ui.enemy.textContent='도깨비 '+enemies.length;ui.wave.textContent=paused?'잠시 멈춤':'사냥 중'}
function showToast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1350)}
function makeGoblin(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const body=sphere(g,.5,mat('#76a65d'),0,.76,0,1.05,1.2,.86);body.name='body';sphere(g,.32,mat('#83b76a'),0,1.35,0,1.08,.88,.85);sphere(g,.06,mats.black,-.13,1.4,.28);sphere(g,.06,mats.black,.13,1.4,.28);sphere(g,.055,mat('#f5cf62',.4),-.13,1.4,.33,.65,.65,.5);sphere(g,.055,mat('#f5cf62',.4),.13,1.4,.33,.65,.65,.5);
  for(let s of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,8),mat('#d5b879'));horn.position.set(s*.23,1.68,0);horn.rotation.z=s*.38;horn.castShadow=true;g.add(horn);sphere(g,.13,mat('#679453'),s*.51,.83,0,1,.75,.9)}
  const belly=sphere(g,.24,mat('#d8b576'),0,.72,.4,1,.8,.3);
  const hpBg=box(g,.9,.09,.06,mats.dark,0,2.05,0,false);const hpBar=box(g,.84,.05,.07,mat('#e75c4d'),0,2.05,.04,false);hpBg.castShadow=false;hpBar.castShadow=false;
  const e={group:g,hp:28+wave*5,max:28+wave*5,hpBar,attack:0,phase:Math.random()*6,body,flash:0};enemies.push(e);updateHud();return e}
function spawnEnemy(){const a=Math.random()*Math.PI*2;const r=9+Math.random()*1.7;makeGoblin(THREE.MathUtils.clamp(player.position.x+Math.cos(a)*r,-10,10),THREE.MathUtils.clamp(player.position.z+Math.sin(a)*r,-8,8));}
function addPickup(x,z,type){const g=new THREE.Group();g.position.set(x,.25,z);scene.add(g);let color=type==='meat'?'#d85e4f':'#eec260';const item=sphere(g,type==='meat'?.18:.14,mat(color,.45),0,0,0,type==='meat'?1.2:1,1,type==='meat'?.7:1);if(type==='meat'){const bone=sphere(g,.07,mats.cream,.2,.04,0,1,1,1)}else{const edge=new THREE.TorusGeometry(.12,.035,6,12);const ring=new THREE.Mesh(edge,mat('#fff0a4',.35));ring.rotation.x=Math.PI/2;g.add(ring)}pickups.push({g,type,age:0});}
function burst(x,z,color){for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),mat(color,.7));m.position.set(x,.8+Math.random()*.8,z);scene.add(m);effects.push({mesh:m,life:.45,v:new THREE.Vector3((Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3)})}}
function gainXp(amount){xp+=amount;while(xp>=xpNeed){xp-=xpNeed;level++;xpNeed=Math.ceil(xpNeed*1.28+2);showUpgrade()}updateHud()}
const upgrades=[{icon:'⚔️',name:'날 선 칼날',desc:'공격력 35% 증가',apply:()=>damage=Math.round(damage*1.35)},{icon:'👟',name:'날렵한 발',desc:'이동 속도 20% 증가',apply:()=>speed*=1.2},{icon:'❤️',name:'든든한 체력',desc:'최대 체력 +30, 회복',apply:()=>{maxHp+=30;hp=Math.min(maxHp,hp+45)}}];
function showUpgrade(){paused=true;document.querySelector('#level-screen').classList.remove('hidden');const list=document.querySelector('#upgrade-list');list.innerHTML='';for(const u of upgrades){const b=document.createElement('button');b.className='upgrade-option';b.innerHTML=`<span class="upgrade-icon">${u.icon}</span><b>${u.name}</b><small>${u.desc}</small>`;b.onclick=()=>{u.apply();document.querySelector('#level-screen').classList.add('hidden');paused=false;showToast(u.name+' 획득!');updateHud()};list.appendChild(b)}updateHud()}
function killEnemy(e){scene.remove(e.group);enemies=enemies.filter(n=>n!==e);kills++;waveKills++;meat+=1+Math.floor(Math.random()*2);coins+=2+Math.floor(Math.random()*3);addPickup(e.group.position.x,e.group.position.z,'meat');if(kills%2===0)addPickup(e.group.position.x+.3,e.group.position.z+.2,'coin');gainXp(1);burst(e.group.position.x,e.group.position.z,'#e99a61');if(waveKills>=5+wave*2){wave++;waveKills=0;showToast('웨이브 '+wave+' 시작!')}updateHud()}
function hitNearest(){if(attackTimer>0||paused||!running)return;attackTimer=attackRate;weapon.userData.swing=1;let nearest=null,best=3.7;for(const e of enemies){const d=e.group.position.distanceTo(player.position);if(d<best){best=d;nearest=e}}if(nearest){const dir=new THREE.Vector3().subVectors(nearest.group.position,player.position);player.rotation.y=Math.atan2(dir.x,dir.z);nearest.hp-=damage;nearest.flash=.13;nearest.hpBar.scale.x=Math.max(.02,.84*(nearest.hp/nearest.max));nearest.hpBar.position.x=-(.84-nearest.hpBar.scale.x)/2;burst(nearest.group.position.x,nearest.group.position.z,'#f4b76d');if(nearest.hp<=0)killEnemy(nearest);else showToast('탁!')}else{showToast('가까이 다가가세요')};}
function startGame(){started=true;running=true;paused=false;gameOver=false;level=1;xp=0;xpNeed=5;kills=0;meat=0;coins=0;wave=1;waveKills=0;hp=100;maxHp=100;damage=20;attackRate=.55;speed=5.1;spawnTimer=2.8;attackHeld=false;keys={};player.position.set(0,0,2);for(const e of enemies)scene.remove(e.group);enemies=[];for(const p of pickups)scene.remove(p.g);pickups=[];document.querySelectorAll('.overlay').forEach(el=>el.classList.add('hidden'));document.querySelector('#pause-btn').style.display='block';updateHud();showToast('도깨비가 나타났어요!')}
function endGame(){running=false;gameOver=true;document.querySelector('#final-kills').textContent=kills;document.querySelector('#final-meat').textContent=meat;document.querySelector('#final-coins').textContent=coins;document.querySelector('#gameover-screen').classList.remove('hidden')}
document.querySelector('#start-btn').onclick=startGame;document.querySelector('#retry-btn').onclick=startGame;
document.querySelector('#pause-btn').onclick=()=>{if(!running||gameOver)return;paused=true;document.querySelector('#pause-screen').classList.remove('hidden');updateHud()};document.querySelector('#resume-btn').onclick=()=>{paused=false;document.querySelector('#pause-screen').classList.add('hidden');updateHud()};document.querySelector('#restart-btn').onclick=()=>{document.querySelector('#pause-screen').classList.add('hidden');startGame()};

// responsive renderer and camera framing
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<600?48:42;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
function setJoy(e){const rect=document.querySelector('#joystick').getBoundingClientRect();const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);const max=38,len=Math.hypot(dx,dy),scale=len>max?max/len:1;const x=dx*scale,y=dy*scale;document.querySelector('#joy-knob').style.transform=`translate(${x}px,${y}px)`;move.x=x/max;move.z=y/max;}
const joy=document.querySelector('#joystick');joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);setJoy(e)});joy.addEventListener('pointermove',e=>{if(joy.hasPointerCapture(e.pointerId))setJoy(e)});function resetJoy(){move.x=0;move.z=0;document.querySelector('#joy-knob').style.transform='translate(0,0)'}joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);
const ab=document.querySelector('#attack-btn');ab.addEventListener('pointerdown',e=>{e.preventDefault();ab.setPointerCapture(e.pointerId);attackHeld=true;ab.classList.add('active');hitNearest()});function stopAttack(){attackHeld=false;ab.classList.remove('active')}ab.addEventListener('pointerup',stopAttack);ab.addEventListener('pointercancel',stopAttack);ab.addEventListener('lostpointercapture',stopAttack);
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'&&!e.repeat){attackHeld=true;hitNearest()}if(e.code==='Escape'&&running&&!paused)document.querySelector('#pause-btn').click();else if(e.code==='Escape'&&paused&&document.querySelector('#pause-screen').classList.contains('hidden')){paused=false;document.querySelector('#level-screen').classList.add('hidden')}});window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space')attackHeld=false});window.addEventListener('blur',()=>{keys={};attackHeld=false;resetJoy();stopAttack()});
let muted=false;document.querySelector('#sound-btn').onclick=e=>{muted=!muted;e.currentTarget.textContent=muted?'♪':'♫';showToast(muted?'소리 끔':'소리 켬')};

function tick(dt,time){
  if(running&&!paused&&!gameOver){
    // keyboard movement and smooth, camera-relative controls
    let ix=move.x,iz=move.z;
    if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
    if(keys.KeyW||keys.ArrowUp)iz-=1;if(keys.KeyS||keys.ArrowDown)iz+=1;
    const len=Math.hypot(ix,iz);if(len>1){ix/=len;iz/=len}
    if(len>.08){player.position.x+=ix*speed*dt;player.position.z+=iz*speed*dt;player.rotation.y=Math.atan2(ix,iz);avatar.position.y=Math.abs(Math.sin(time*10))*.045;}
    else avatar.position.y=0;
    player.position.x=THREE.MathUtils.clamp(player.position.x,-10.1,10.1);player.position.z=THREE.MathUtils.clamp(player.position.z,-8.2,8.2);
    attackTimer=Math.max(0,attackTimer-dt);if(attackHeld&&attackTimer<=0)hitNearest();
    weapon.rotation.z=weapon.userData.swing?(-.42-weapon.userData.swing*2.7):-.42;
    if(weapon.userData.swing){weapon.userData.swing=Math.max(0,weapon.userData.swing-dt*5.2)}
    spawnTimer-=dt;if(spawnTimer<=0&&enemies.length<4){spawnEnemy();spawnTimer=Math.max(2.2,3.6-wave*.06)}
    for(const e of [...enemies]){
      const dx=player.position.x-e.group.position.x,dz=player.position.z-e.group.position.z,d=Math.hypot(dx,dz)||.001;
      if(d>1.18){e.group.position.x+=dx/d*(1.15+wave*.05)*dt;e.group.position.z+=dz/d*(1.15+wave*.05)*dt;e.group.rotation.y=Math.atan2(dx,dz)}
      else{e.attack-=dt;if(e.attack<=0){e.attack=1.5+Math.random()*.5;hp-=2+Math.min(3,wave);e.group.scale.set(.88,1.08,.88);setTimeout(()=>e.group.scale.set(1,1,1),100);updateHud();if(hp<=0){hp=0;updateHud();endGame();break}}}
      e.phase+=dt*4;e.group.position.y=Math.max(0,Math.sin(e.phase)*.045);if(e.flash>0){e.flash-=dt;e.body.material.color.set('#fff2b0')}else e.body.material.color.set('#76a65d');
    }
    for(const p of [...pickups]){p.age+=dt;p.g.position.y=.24+Math.sin(p.age*4)*.1;p.g.rotation.y+=dt*1.6;const d=p.g.position.distanceTo(player.position);if(d<1.15){if(p.type==='meat'){meat++;hp=Math.min(maxHp,hp+12);gainXp(1)}else coins+=3;scene.remove(p.g);pickups=pickups.filter(a=>a!==p);updateHud()}}
  }
  for(const fx of [...effects]){fx.life-=dt;fx.mesh.position.addScaledVector(fx.v,dt);fx.v.y-=5*dt;if(fx.life<=0){scene.remove(fx.mesh);effects=effects.filter(a=>a!==fx)}}
  const target=new THREE.Vector3(player.position.x,0,player.position.z);
  camera.position.x+=(player.position.x*.48-camera.position.x)*Math.min(1,dt*2.7);camera.position.y+=(14-camera.position.y)*Math.min(1,dt*2);camera.position.z+=(player.position.z+17-camera.position.z)*Math.min(1,dt*2.7);camera.lookAt(target.x,.4,target.z-1.6);
  fill.position.set(player.position.x+5,4,player.position.z-4);
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;tick(dt,time);renderer.render(scene,camera)}
animate();
