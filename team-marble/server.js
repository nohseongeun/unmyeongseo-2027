import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const PIN=process.env.ADMIN_PIN||'2026';
const names=['레드팀','블루팀','그린팀','옐로팀','퍼플팀','오렌지팀','핑크팀','화이트팀'];
const places=['출발','서울','황금열쇠','도쿄','대결','베이징','보너스','방콕','미션','싱가포르','통행료 면제','두바이','황금열쇠','로마','약탈전','파리','보너스','런던','미션','마드리드','황금열쇠','뉴욕','대결','로스앤젤레스','보너스','시드니','약탈전','상파울루'];
const missions=[
['몸으로 말해요','30초 안에 제시어 5개 맞히기'],
['단체 가위바위보','전원이 사회자와 가위바위보! 마지막 생존자 팀 승리'],
['눈치 숫자 게임','숫자를 외치며 기립! 겹치지 않고 가장 오래 살아남기'],
['제자리 댄스 배틀','팀 대표가 15초 즉흥 댄스, 박수로 승패 결정'],
['손가락 접기','회사생활 공감 질문에 손가락 접기, 끝까지 남은 팀 승리'],
['스피드 초성퀴즈','제시된 초성 단어 5개를 가장 먼저 맞히기'],
['릴레이 박수','팀원 모두 한 사람씩 박수 이어가기, 최단시간 승리'],
['눈치 일어나기','사회자 외침에 맞춰 지정 인원만 일어나기'],
['퀵 퀴즈','30초 동안 상식 문제 정답 많이 맞히기'],
['팀 구호 대결','모든 팀원이 동시에 팀 구호 외치기, 큰 응원 승리'],
['밸런스 게임','팀원이 한쪽에 모여 의견 통일하기, 가장 빠른 팀 승리'],
['표정 복사','대표 표정을 팀원들이 가장 똑같이 따라 하기'],
['지목 스파이','상대 팀 대표가 10초 내 질문 세 개 답하기'],
['단체 포즈','제시 키워드를 팀 전체가 5초 안에 몸으로 표현'],
['가위바위보 왕중왕','팀 대표 3판 2선승 대결'],
['팀 전원 하이파이브','정해진 순서로 하이파이브 릴레이 기록 대결']
];
const file=path.join(ROOT,'game-state.json');
function fresh(){return {round:1,turn:0,phase:'roll',dice:0,message:'MC 레크리에이션 1등 팀에게 특혜를 지급하세요!',mission:null,teams:names.slice(0,4).map((name,i)=>({id:i,name,cash:2000000,pos:0,joined:false,shield:0,freeBuy:0,extraRoll:0})),properties:{},log:[],finished:false,recreationRound:0,awards:[],timer:{duration:3600,remaining:3600,running:false,until:null}};}
let s;try{s=JSON.parse(fs.readFileSync(file,'utf8'));}catch{s=fresh();}
s.timer||={duration:3600,remaining:3600,running:false,until:null};s.recreationRound??=0;s.awards||=[];for(const t of s.teams){t.shield??=0;t.freeBuy??=0;t.extraRoll??=0;}
function tick(){if(!s.timer.running||s.finished)return;s.timer.remaining=Math.max(0,Math.ceil((s.timer.until-Date.now())/1000));if(s.timer.remaining===0){s.timer.running=false;s.finished=true;s.phase='finished';s.message='⏰ 제한시간 종료! 총자산 1등이 최종 우승!';save();}}
function save(){try{fs.writeFileSync(file,JSON.stringify(s));}catch{}}
function money(n){return Math.round(n/10000)+'만';}
function tile(i){return {name:places[i],price:(i>0&& !['황금열쇠','대결','보너스','미션','통행료 면제','약탈전'].includes(places[i])) ? (15+(i%6)*5)*10000:0};}
function event(team){const ix=s.teams.findIndex(x=>x.id===team.id);const land=tile(team.pos);const own=s.properties[team.pos];const special=places[team.pos];if(land.price){if(own && own.owner!==team.id){const fee=Math.round(own.price*(.35+own.level*.25));const receiver=s.teams.find(t=>t.id===own.owner);const paid=team.shield>0?0:Math.min(team.cash,fee);if(team.shield>0)team.shield--;team.cash-=paid;receiver.cash+=paid;s.message=paid?team.name+'이 '+receiver.name+'에게 통행료 '+money(paid)+' 지급!':team.name+'의 통행료 면제권 발동!';}else if(!own){s.message=land.name+' 땅을 '+money(land.price)+'에 구매할 수 있습니다.';}else{s.message='내 땅에 도착! 건물을 업그레이드할 수 있습니다.';}}else if(special==='보너스'){team.cash+=500000;s.message='보너스 50만 획득!';}else if(special==='황금열쇠'){const win=Math.random()<.65;team.cash=Math.max(0,team.cash+(win?600000:-300000));s.message=win?'황금열쇠! 60만 획득!':'황금열쇠! 벌금 30만!';}else{s.message=special+' 칸에 도착!';}
const steal=special==='약탈전';let opponent=s.teams[(ix+1)%s.teams.length];s.mission={title:(steal?'🔥 땅 약탈전 — ':'⚡ 팀 대항 미션 — ')+missions[Math.floor(Math.random()*missions.length)][0],detail:'',attacker:team.id,defender:opponent.id,steal,reward:steal?600000:400000};
s.mission.detail=missions.find(m=>s.mission.title.endsWith(m[0]))?.[1]||'사회자가 미션을 진행합니다.';
s.phase='mission';}
function next(){const t=s.teams[s.turn];if(t.extraRoll>0){t.extraRoll--;s.phase='roll';s.mission=null;s.message=t.name+' 추가 주사위 차례!';return;}s.turn=(s.turn+1)%s.teams.length;if(!s.turn)s.round++;s.phase='roll';s.mission=null;s.message=s.teams[s.turn].name+' 차례!';}
function action(b){tick();const team=s.teams[s.turn];if(s.finished&&b.type!=='reset')throw Error('게임이 종료되었습니다');switch(b.type){
case 'timerConfig':{const duration=Math.max(300,Math.min(14400,Math.round(Number(b.minutes||60)*60)));s.timer={duration,remaining:duration,running:false,until:null};s.message='제한시간 '+Math.round(duration/60)+'분 설정';break;}
case 'timerStart':{if(!s.timer.running){s.timer.until=Date.now()+s.timer.remaining*1000;s.timer.running=true;s.message='⏱ 게임 시작!';}break;}
case 'timerPause':{tick();s.timer.running=false;s.timer.until=null;s.message='⏸ 타이머 일시정지';break;}
case 'mcAward':{const winner=s.teams.find(t=>t.id===Number(b.winner));if(!winner)throw Error('팀을 선택하세요');const kind=String(b.award||'cash');const kinds=['cash','freeBuy','extraRoll','shield','steal'];if(!kinds.includes(kind))throw Error('잘못된 특혜');let detail='';if(kind==='cash'){winner.cash+=500000;detail='현금 +50만';}if(kind==='freeBuy'){winner.freeBuy++;detail='무료 땅 구매권 +1';}if(kind==='extraRoll'){winner.extraRoll++;detail='추가 주사위 +1';}if(kind==='shield'){winner.shield++;detail='통행료 면제권 +1';}if(kind==='steal'){const enemy=Object.entries(s.properties).filter(([,p])=>p.owner!==winner.id).sort((a,b)=>b[1].price-a[1].price)[0];if(enemy){enemy[1].owner=winner.id;detail='상대 땅 '+places[Number(enemy[0])]+' 약탈';}else{winner.cash+=500000;detail='약탈할 땅 없음, 현금 +50만';}}s.recreationRound++;s.awards.unshift({round:s.recreationRound,winner:winner.name,detail});s.awards=s.awards.slice(0,12);s.message='🎤 레크리에이션 1등 '+winner.name+' — '+detail+'! 다른 팀은 특혜 없음.';s.log.unshift(s.message);break;}

case 'join':{const t=s.teams.find(x=>x.id===Number(b.team));if(!t)throw Error('팀 없음');t.joined=true;save();return {team:t.id};}
case 'roll':{if(s.phase!=='roll'||s.finished)throw Error('주사위를 굴릴 수 없습니다');const d=Math.floor(Math.random()*6)+1;s.dice=d;const old=team.pos;team.pos=(team.pos+d)%places.length;if(team.pos<old)team.cash+=300000;event(team);break;}
case 'buy':{const l=tile(team.pos);if(!l.price||s.properties[team.pos]||(team.cash<l.price&&team.freeBuy<1))throw Error('구매 불가');if(team.freeBuy>0)team.freeBuy--;else team.cash-=l.price;s.properties[team.pos]={owner:team.id,price:l.price,level:0};s.message=team.name+' '+l.name+' 구매!';break;}
case 'upgrade':{const p=s.properties[team.pos];if(!p||p.owner!==team.id||p.level>=2)throw Error('업그레이드 불가');const cost=Math.round(p.price*.6);if(team.cash<cost)throw Error('잔액 부족');team.cash-=cost;p.level++;s.message='건물 업그레이드 성공!';break;}
case 'resolve':{if(s.phase!=='mission')throw Error('진행 중인 미션 없음');const m=s.mission;const winner=s.teams.find(t=>t.id===Number(b.winner));if(!winner)throw Error('팀 선택 오류');if(m.steal&&winner.id===m.attacker){const enemy=Object.entries(s.properties).filter(([,p])=>p.owner===m.defender).sort((a,b)=>b[1].price-a[1].price)[0];if(enemy){enemy[1].owner=winner.id;s.message=winner.name+'이 '+s.teams.find(t=>t.id===m.defender).name+' 땅을 빼앗았습니다!';}else{winner.cash+=m.reward;s.message=winner.name+' 미션 성공! '+money(m.reward)+' 획득';}}else{winner.cash+=m.reward;s.message=winner.name+' 미션 승리! '+money(m.reward)+' 획득';}s.log.unshift(s.message);s.log=s.log.slice(0,12);next();break;}
case 'skip':{if(s.phase!=='mission')throw Error('미션 없음');next();break;}
case 'defender':{if(!s.mission)throw Error('미션 없음');if(Number(b.defender)===team.id)throw Error('같은 팀 선택 불가');s.mission.defender=Number(b.defender);break;}
case 'reset':{s=fresh();break;}
case 'finish':{tick();s.finished=true;s.phase='finished';s.timer.running=false;s.message='🏆 게임 종료! 총자산 1등이 우승팀입니다!';break;}
case 'rename':{const t=s.teams.find(t=>t.id===Number(b.team));if(!t)throw Error('팀 없음');t.name=String(b.name||'').trim().slice(0,20)||t.name;break;}
default:throw Error('지원하지 않는 작업');}save();return {};}
function publicState(){tick();return {...s,tiles:places.map((name,i)=>({...tile(i),name})),rank:s.teams.map(t=>({...t,total:t.cash+Object.values(s.properties).filter(p=>p.owner===t.id).reduce((a,p)=>a+p.price*(1+p.level*.6),0)})).sort((a,b)=>b.total-a.total)};}
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');function send(status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'});res.end(JSON.stringify(obj));}
if(req.method==='GET'&&url.pathname==='/api/state')return send(200,publicState());
if(req.method==='POST'&&url.pathname==='/api/action'){try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>10000)throw Error('요청 초과');}const b=JSON.parse(raw);const admin=String(req.headers['x-admin-pin']||'')===PIN;const allowed=['join'];if(!admin&&!allowed.includes(b.type)){if(b.type!=='roll'||Number(b.team)!==s.teams[s.turn].id)throw Error('관리자 권한 필요');}const result=action(b);return send(200,{ok:true,...result});}catch(e){return send(400,{error:e.message});}}
if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/index.html')){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return fs.createReadStream(path.join(ROOT,'index.html')).pipe(res);}
res.writeHead(404);res.end('Not found');});
server.listen(PORT,'0.0.0.0',()=>console.log('Team Marble online on '+PORT));
