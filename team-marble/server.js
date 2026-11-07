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

const arcadeCatalog=[{"id":0,"title":"⚡ 번개 터치","kind":"tap","duration":12,"target":16,"question":null},{"id":1,"title":"🎈 풍선 팡팡","kind":"tap","duration":15,"target":20,"question":null},{"id":2,"title":"🥁 드럼 러시","kind":"tap","duration":10,"target":13,"question":null},{"id":3,"title":"🚀 로켓 부스터","kind":"tap","duration":18,"target":22,"question":null},{"id":4,"title":"🎯 순발력 숫자","kind":"choice","duration":15,"target":0,"question":["다음 숫자는? 3, 6, 9, 12, ?",["15","16","18","21"],0]},{"id":5,"title":"🧠 암산 챔피언","kind":"choice","duration":20,"target":0,"question":["17 + 28 = ?",["43","45","46","47"],1]},{"id":6,"title":"🌍 세계 수도","kind":"choice","duration":20,"target":0,"question":["프랑스의 수도는?",["런던","로마","파리","베를린"],2]},{"id":7,"title":"🐾 동물 스피드","kind":"choice","duration":18,"target":0,"question":["문어의 다리는 몇 개?",["6","7","8","10"],2]},{"id":8,"title":"🎲 확률 감각","kind":"choice","duration":16,"target":0,"question":["동전을 2번 던질 때 가능한 결과는 몇 가지?",["2","3","4","8"],2]},{"id":9,"title":"🍉 과일 상식","kind":"choice","duration":17,"target":0,"question":["바나나는 주로 어떤 식물에서 열릴까?",["나무","초본식물","덩굴","선인장"],1]},{"id":10,"title":"🎵 음악 퀴즈","kind":"choice","duration":17,"target":0,"question":["음악에서 4분음표 두 개의 길이는?",["2분음표 하나","온음표 하나","8분음표 하나","쉼표 하나"],0]},{"id":11,"title":"📆 달력 마스터","kind":"choice","duration":17,"target":0,"question":["일주일은 며칠?",["5","6","7","8"],2]},{"id":12,"title":"🧩 패턴 완성","kind":"choice","duration":18,"target":0,"question":["패턴 다음은? 🔴🔵🔴🔵🔴 ?",["🔴","🔵","🟡","🟢"],1]},{"id":13,"title":"🤖 논리 대결","kind":"choice","duration":18,"target":0,"question":["모든 A는 B, 모든 B는 C. 모든 A는 C일까?",["그렇다","아니다","알 수 없다","경우에 따라"],0]},{"id":14,"title":"🔢 구구단","kind":"choice","duration":14,"target":0,"question":["9 × 7 = ?",["54","56","63","72"],2]},{"id":15,"title":"🏙️ 도시 탐험","kind":"choice","duration":20,"target":0,"question":["일본의 수도는?",["오사카","교토","도쿄","나고야"],2]},{"id":16,"title":"💎 보석 찾기","kind":"target","duration":16,"target":0,"question":null},{"id":17,"title":"🐹 두더지 잡기","kind":"target","duration":18,"target":0,"question":null},{"id":18,"title":"🛸 UFO 터치","kind":"target","duration":17,"target":0,"question":null},{"id":19,"title":"🌟 별 수집","kind":"target","duration":15,"target":0,"question":null}];
function arcadePublic(){const a=s.arcade||{};const g=arcadeCatalog.find(x=>x.id===a.gameId)||null;return {status:a.status||'idle',gameId:a.gameId??null,game:g?{...g,question:g.question?g.question.slice(0,2):null}:null,startedAt:a.startedAt||null,endsAt:a.endsAt||null,results:a.results||{},winner:a.winner??null,awarded:!!a.awarded};}
function arcadeFinish(){const a=s.arcade;if(!a||a.status!=='running')return;if(Date.now()<a.endsAt)return;a.status='finished';const ranking=s.teams.map(t=>({id:t.id,score:a.results[t.id]?.score||0,when:a.results[t.id]?.when||Infinity})).sort((x,y)=>y.score-x.score||x.when-y.when);a.winner=ranking[0]?.score>0?ranking[0].id:null;s.message=a.winner===null?'🎮 오락실 결과: 성공 팀 없음. MC가 재경기할 수 있습니다.':'🎮 오락실 1등 '+s.teams.find(t=>t.id===a.winner).name+'! 특혜를 지급하세요.';save();}
const goldenCards=[
{id:'cash',icon:'💰',title:'은행 보너스',detail:'현금 50만 원을 받습니다.'},
{id:'tax',icon:'💸',title:'여행 세금',detail:'현금 30만 원을 납부합니다.'},
{id:'shield',icon:'🛡️',title:'통행료 면제권',detail:'다음 통행료 1회 면제!'},
{id:'land',icon:'🏠',title:'무료 땅 구매권',detail:'빈 도시에 도착하면 무료 구매!'},
{id:'build',icon:'🏨',title:'무료 건물 건설',detail:'보유 땅 하나의 건물을 무료 업그레이드!'},
{id:'travel',icon:'✈️',title:'세계여행',detail:'소유주 없는 도시로 이동해 무료 취득!'},
{id:'bonus',icon:'🏦',title:'부동산 보너스',detail:'소유 땅 1개당 현금 10만 원!'},
{id:'dice',icon:'🎲',title:'행운의 추가 주사위',detail:'다음 차례에 주사위를 한 번 더!'}
];
function drawCard(except){const a=goldenCards.filter(x=>x.id!==except);return a[Math.floor(Math.random()*a.length)];}
function applyGoldenCard(t,id){const card=goldenCards.find(x=>x.id===id);if(!card)throw Error('황금열쇠 카드 오류');let effect=card.detail;
if(id==='cash')t.cash+=500000;
if(id==='tax'){const fine=Math.min(t.cash,300000);t.cash-=fine;effect='현금 '+money(fine)+' 납부';}
if(id==='shield')t.shield=(t.shield||0)+1;
if(id==='land')t.freeBuy=(t.freeBuy||0)+1;
if(id==='dice')t.extraRoll=(t.extraRoll||0)+1;
if(id==='bonus'){const count=Object.values(s.properties).filter(x=>x.owner===t.id).length;const value=count*100000;t.cash+=value;effect='땅 '+count+'개 × 10만 = '+money(value)+' 획득';}
if(id==='build'){const p=Object.values(s.properties).find(x=>x.owner===t.id&&x.level<2);if(p){p.level++;effect='내 건물 무료 업그레이드 완료';}else{t.cash+=300000;effect='건설할 땅 없음 · 현금 30만 획득';}}
if(id==='travel'){const index=places.findIndex((name,i)=>i>0&&tile(i).price&&!s.properties[i]);if(index>=0){const old=t.pos;t.pos=index;const l=tile(index);s.properties[index]={owner:t.id,price:l.price,level:0};s.lastMove={id:Date.now()+'-golden-'+t.id,team:t.id,from:old,to:index,steps:0,at:Date.now(),tile:places[index]};effect=places[index]+'로 이동해 무료 취득';}else{t.cash+=500000;effect='빈 땅 없음 · 현금 50만 획득';}}
s.goldenDisplay={id:Date.now()+'-'+t.id,team:t.id,card:{...card},effect,at:Date.now()};s.message='🔑 황금열쇠! '+t.name+' — '+card.title+'! '+effect;s.log.unshift(s.message);s.log=s.log.slice(0,12);return effect;}
function openGoldenChoice(t){const first=drawCard();const second=drawCard(first.id);s.goldenChoice={team:t.id,cards:[first,second],id:Date.now()+'-'+t.id};s.message='🔑 '+t.name+' 황금열쇠 2장 중 1장을 골라주세요!';}

const file=path.join(ROOT,'game-state.json');
function fresh(count=4){return {round:1,turn:0,phase:'roll',dice:0,message:'MC 레크리에이션 1등 팀에게 특혜를 지급하세요!',mission:null,teams:names.slice(0,count).map((name,i)=>({id:i,name,cash:2000000,pos:0,joined:false,shield:0,freeBuy:0,extraRoll:0})),properties:{},log:[],finished:false,recreationRound:0,awards:[],timer:{duration:5400,remaining:5400,running:false,until:null},playMode:'mc',arcade:{status:'idle',results:{}},goldenDisplay:null,goldenChoice:null};}
let s;try{s=JSON.parse(fs.readFileSync(file,'utf8'));}catch{s=fresh();}
s.timer||={duration:3600,remaining:3600,running:false,until:null};s.recreationRound??=0;s.playMode||='mc';s.arcade||={status:'idle',results:{}};s.awards||=[];s.goldenDisplay||=null;s.goldenChoice||=null;for(const t of s.teams){t.shield??=0;t.freeBuy??=0;t.extraRoll??=0;}
function tick(){if(!s.timer.running||s.finished)return;s.timer.remaining=Math.max(0,Math.ceil((s.timer.until-Date.now())/1000));if(s.timer.remaining===0){s.timer.running=false;s.finished=true;s.phase='finished';s.message='⏰ 제한시간 종료! 총자산 1등이 최종 우승!';save();}}
function save(){try{fs.writeFileSync(file,JSON.stringify(s));}catch{}}
function money(n){return Math.round(n/10000)+'만';}
function tile(i){return {name:places[i],price:(i>0&& !['황금열쇠','대결','보너스','미션','통행료 면제','약탈전'].includes(places[i])) ? (15+(i%6)*5)*10000:0};}
function event(team){s.pendingToll=null;const ix=s.teams.findIndex(x=>x.id===team.id);const land=tile(team.pos);const own=s.properties[team.pos];const special=places[team.pos];if(land.price){if(own && own.owner!==team.id){const receiver=s.teams.find(t=>t.id===own.owner);const multiplier=receiver.doubleToll>0?2:1;const fee=Math.round(own.price*(.35+own.level*.25)*multiplier);if(receiver.doubleToll>0)receiver.doubleToll--;const paid=team.shield>0?0:Math.min(team.cash,fee);if(team.shield>0)team.shield--;team.cash-=paid;receiver.cash+=paid;s.message=paid?'🏙️ '+team.name+' → '+receiver.name+' 통행료 '+money(paid)+' 자동 정산!':'🛡️ '+team.name+' 통행료 면제권 사용!';s.pendingToll=null;}else if(!own){s.message=land.name+' 땅을 '+money(land.price)+'에 구매할 수 있습니다.';}else{s.message='내 땅에 도착! 건물을 업그레이드할 수 있습니다.';}}else if(special==='보너스'){team.cash+=500000;s.message='보너스 50만 획득!';}else if(special==='황금열쇠'){applyGoldenCard(team,drawCard().id);}else{s.message=special+' 칸에 도착!';}
const shouldMission=['대결','미션','약탈전'].includes(special);if(!shouldMission){s.mission=null;s.phase='action';return;}const steal=special==='약탈전';let opponent=s.teams[(ix+1)%s.teams.length];s.mission={title:(steal?'🔥 땅 약탈전 — ':'⚡ 팀 대항 미션 — ')+missions[Math.floor(Math.random()*missions.length)][0],detail:'',attacker:team.id,defender:opponent.id,steal,reward:steal?600000:400000};
s.mission.detail=missions.find(m=>s.mission.title.endsWith(m[0]))?.[1]||'사회자가 미션을 진행합니다.';
s.phase='mission';}
function next(){const t=s.teams[s.turn];if(t.extraRoll>0){t.extraRoll--;s.phase='roll';s.mission=null;s.message=t.name+' 추가 주사위 차례!';return;}s.turn=(s.turn+1)%s.teams.length;if(!s.turn)s.round++;s.phase='roll';s.mission=null;s.message=s.teams[s.turn].name+' 차례!';}
function action(b){tick();arcadeFinish();const team=s.teams[s.turn];if(s.finished&&b.type!=='reset')throw Error('게임이 종료되었습니다');switch(b.type){
case 'setPlayMode':{if(!['mc','arcade'].includes(b.mode))throw Error('진행 방식 오류');if(s.playMode!==b.mode&&s.arcade?.status==='running')throw Error('진행 중인 QR 게임을 먼저 종료하세요');s.playMode=b.mode;s.message=b.mode==='arcade'?'🎮 텐텐 스타일 QR 오락실 모드':'🎤 MC 직접 레크리에이션 모드';break;}
case 'arcadeStart':{if(s.playMode!=='arcade')throw Error('오락실 모드를 선택하세요');const g=arcadeCatalog.find(x=>x.id===Number(b.gameId));if(!g)throw Error('게임 선택 오류');s.arcade={status:'running',gameId:g.id,startedAt:Date.now()+2500,endsAt:Date.now()+2500+g.duration*1000,results:{},winner:null,awarded:false};s.message='🎮 '+g.title+' 시작! 팀 대표들이 QR로 참가합니다.';break;}
case 'arcadeSubmit':{const a=s.arcade;if(s.playMode!=='arcade'||a?.status!=='running')throw Error('진행 중인 오락실 게임이 없습니다');const id=Number(b.team);if(!s.teams.some(t=>t.id===id))throw Error('팀 오류');const now=Date.now();if(now<a.startedAt||now>a.endsAt+500)throw Error('제한시간이 지났습니다');if(a.results[id])throw Error('이미 제출했습니다');const g=arcadeCatalog.find(x=>x.id===a.gameId);let score=0;const answer=Number(b.answer);if(g.kind==='choice')score=answer===g.question[2]?Math.max(100,1000-Math.floor((now-a.startedAt)/35)):0;else if(g.kind==='tap'||g.kind==='target')score=Math.max(0,Math.min(g.target||20,Math.floor(answer)))*50; a.results[id]={score,when:now};break;}
case 'arcadeFinish':{if(s.arcade?.status!=='running')throw Error('게임 진행 중이 아닙니다');s.arcade.endsAt=Date.now()-1;arcadeFinish();break;}
case 'arcadeAward':{if(s.playMode!=='arcade'||s.arcade?.status!=='finished'||s.arcade.awarded||s.arcade.winner===null)throw Error('지급할 오락실 1등 팀이 없습니다');s.arcade.awarded=true;const result=action({type:'randomAward',winner:s.arcade.winner});return result;}
case 'tollPay':{const p=s.pendingToll;if(!p||s.phase!=='toll')throw Error('처리할 통행료가 없습니다');const visitor=s.teams.find(t=>t.id===p.visitor),owner=s.teams.find(t=>t.id===p.owner);const amount=visitor.shield>0?0:Math.min(visitor.cash,p.amount);if(visitor.shield>0)visitor.shield--;visitor.cash-=amount;owner.cash+=amount;s.message=amount?visitor.name+' → '+owner.name+' 통행료 '+money(amount)+' 정산 완료':visitor.name+' 통행료 면제권 사용!';s.log.unshift(s.message);s.pendingToll=null;s.phase='mission';break;}
case 'tollDuel':{const p=s.pendingToll;if(!p||s.phase!=='toll')throw Error('진행할 통행료 방어전이 없습니다');p.duel=true;s.message='⚔️ 통행료 방어전! '+s.teams.find(t=>t.id===p.visitor).name+' VS '+s.teams.find(t=>t.id===p.owner).name+' — MC 레크리에이션으로 승자 결정!';break;}
case 'tollDuelResult':{const p=s.pendingToll;if(!p||s.phase!=='toll'||!p.duel)throw Error('방어전이 진행되지 않았습니다');const visitor=s.teams.find(t=>t.id===p.visitor),owner=s.teams.find(t=>t.id===p.owner);if(Number(b.winner)===visitor.id){s.message='🎉 '+visitor.name+' 통행료 방어 성공! 무료 통과!';}else if(Number(b.winner)===owner.id){const amount=visitor.shield>0?0:Math.min(visitor.cash,p.amount);if(visitor.shield>0)visitor.shield--;visitor.cash-=amount;owner.cash+=amount;s.message='🏆 '+owner.name+' 방어 성공! 통행료 '+money(amount)+' 획득!';}else throw Error('두 팀 중 승자 선택');s.log.unshift(s.message);s.pendingToll=null;s.phase='mission';break;}
case 'goldenChoose':{const p=s.goldenChoice;if(!p)throw Error('선택할 황금열쇠가 없습니다');const idx=Number(b.index);if(idx!==0&&idx!==1)throw Error('카드 선택 오류');const t=s.teams.find(x=>x.id===p.team);s.goldenChoice=null;applyGoldenCard(t,p.cards[idx].id);break;}
case 'randomAward':{if(s.goldenChoice)throw Error('황금열쇠 선택을 먼저 완료하세요');const winner=s.teams.find(x=>x.id===Number(b.winner));if(!winner)throw Error('1등 팀 선택 필요');const picks=['cash','freeBuy','extraRoll','shield','steal','hotel','travel','double','estate','golden'];const kind=picks[Math.floor(Math.random()*picks.length)];let detail='';
if(kind==='cash'){winner.cash+=500000;detail='현금 50만 원';}
if(kind==='freeBuy'){winner.freeBuy++;detail='무료 땅 구매권';}
if(kind==='extraRoll'){winner.extraRoll++;detail='추가 주사위';}
if(kind==='shield'){winner.shield++;detail='통행료 1회 면제';}
if(kind==='steal'){const enemy=Object.values(s.properties).find(x=>x.owner!==winner.id);if(enemy){enemy.owner=winner.id;detail='상대 팀 땅 1개 강탈';}else{winner.cash+=500000;detail='상대 땅 없음 · 현금 50만';}}
if(kind==='hotel'){const own=Object.values(s.properties).find(x=>x.owner===winner.id&&x.level<2);if(own){own.level=2;detail='보유 도시 무료 호텔 건설';}else{winner.cash+=300000;detail='건설할 땅 없음 · 현금 30만';}}
if(kind==='travel'){const idx=places.findIndex((name,i)=>i>0&&tile(i).price&&!s.properties[i]);if(idx>=0){const land=tile(idx);s.properties[idx]={owner:winner.id,price:land.price,level:0};detail=places[idx]+' 무료 취득';}else{winner.cash+=500000;detail='빈 땅 없음 · 현금 50만';}}
if(kind==='double'){winner.doubleToll=(winner.doubleToll||0)+1;detail='다음 통행료 수입 2배';}
if(kind==='estate'){const count=Object.values(s.properties).filter(x=>x.owner===winner.id).length;winner.cash+=count*100000;detail='보유 땅 '+count+'개 × 10만 원';}
if(kind==='golden'){openGoldenChoice(winner);detail='황금열쇠 2장 중 1장 선택';}
s.recreationRound++;s.awards.unshift({round:s.recreationRound,winner:winner.name,detail});s.awards=s.awards.slice(0,12);s.lastReward={id:Date.now()+'-'+winner.id,team:winner.id,kind,detail,at:Date.now()};if(kind!=='golden')s.message='🎉 1등 '+winner.name+' 랜덤 특혜: '+detail;s.log.unshift(s.message);break;}
case 'timerConfig':{const duration=Math.max(300,Math.min(14400,Math.round(Number(b.minutes||60)*60)));s.timer={duration,remaining:duration,running:false,until:null};s.message='제한시간 '+Math.round(duration/60)+'분 설정';break;}
case 'timerStart':{if(!s.timer.running){s.timer.until=Date.now()+s.timer.remaining*1000;s.timer.running=true;s.message='⏱ 게임 시작!';}break;}
case 'timerPause':{tick();s.timer.running=false;s.timer.until=null;s.message='⏸ 타이머 일시정지';break;}
case 'mcAward':{const winner=s.teams.find(t=>t.id===Number(b.winner));if(!winner)throw Error('팀을 선택하세요');const kind=String(b.award||'cash');const kinds=['cash','freeBuy','extraRoll','shield','steal'];if(!kinds.includes(kind))throw Error('잘못된 특혜');let detail='';if(kind==='cash'){winner.cash+=500000;detail='현금 +50만';}if(kind==='freeBuy'){winner.freeBuy++;detail='무료 땅 구매권 +1';}if(kind==='extraRoll'){winner.extraRoll++;detail='추가 주사위 +1';}if(kind==='shield'){winner.shield++;detail='통행료 면제권 +1';}if(kind==='steal'){const enemy=Object.entries(s.properties).filter(([,p])=>p.owner!==winner.id).sort((a,b)=>b[1].price-a[1].price)[0];if(enemy){enemy[1].owner=winner.id;detail='상대 땅 '+places[Number(enemy[0])]+' 약탈';}else{winner.cash+=500000;detail='약탈할 땅 없음, 현금 +50만';}}s.recreationRound++;s.awards.unshift({round:s.recreationRound,winner:winner.name,detail});s.awards=s.awards.slice(0,12);s.message='🎤 레크리에이션 1등 '+winner.name+' — '+detail+'! 다른 팀은 특혜 없음.';s.log.unshift(s.message);break;}

case 'join':{const t=s.teams.find(x=>x.id===Number(b.team));if(!t)throw Error('팀 없음');t.joined=true;save();return {team:t.id};}
case 'teamCount':{const count=Number(b.count);if(!Number.isInteger(count)||count<2||count>8)throw Error('팀은 2~8개까지 설정할 수 있습니다');if(s.round>1||Object.keys(s.properties).length||s.teams.some(t=>t.pos!==0))throw Error('팀 수 변경은 새 게임에서만 가능합니다');const duration=s.timer.duration;s=fresh(count);s.timer.duration=duration;s.timer.remaining=duration;break;}
case 'endTurn':{if(s.phase!=='action')throw Error('현재 차례를 종료할 수 없습니다');next();break;}
case 'roll':{if(s.phase!=='roll'||s.finished)throw Error('주사위를 굴릴 수 없습니다');const d=Math.floor(Math.random()*6)+1;s.dice=d;const old=team.pos;team.pos=(team.pos+d)%places.length;s.lastMove={id:Date.now()+'-'+team.id,team:team.id,from:old,to:team.pos,steps:d,at:Date.now(),tile:places[team.pos]};if(team.pos<old)team.cash+=300000;event(team);break;}
case 'buy':{const l=tile(team.pos);if(!l.price||s.properties[team.pos]||(team.cash<l.price&&team.freeBuy<1))throw Error('구매 불가');if(team.freeBuy>0)team.freeBuy--;else team.cash-=l.price;s.properties[team.pos]={owner:team.id,price:l.price,level:0};s.message=team.name+' '+l.name+' 구매!';break;}
case 'upgrade':{const p=s.properties[team.pos];if(!p||p.owner!==team.id||p.level>=3)throw Error('업그레이드 불가');const cost=Math.round(p.price*.6);if(team.cash<cost)throw Error('잔액 부족');team.cash-=cost;p.level++;s.message='건물 업그레이드 성공!';break;}
case 'resolve':{if(s.phase!=='mission')throw Error('진행 중인 미션 없음');const m=s.mission;const winner=s.teams.find(t=>t.id===Number(b.winner));if(!winner)throw Error('팀 선택 오류');if(m.steal&&winner.id===m.attacker){const enemy=Object.entries(s.properties).filter(([,p])=>p.owner===m.defender).sort((a,b)=>b[1].price-a[1].price)[0];if(enemy){enemy[1].owner=winner.id;s.message=winner.name+'이 '+s.teams.find(t=>t.id===m.defender).name+' 땅을 빼앗았습니다!';}else{winner.cash+=m.reward;s.message=winner.name+' 미션 성공! '+money(m.reward)+' 획득';}}else{winner.cash+=m.reward;s.message=winner.name+' 미션 승리! '+money(m.reward)+' 획득';}s.log.unshift(s.message);s.log=s.log.slice(0,12);next();break;}
case 'skip':{if(s.phase!=='mission')throw Error('미션 없음');next();break;}
case 'defender':{if(!s.mission)throw Error('미션 없음');if(Number(b.defender)===team.id)throw Error('같은 팀 선택 불가');s.mission.defender=Number(b.defender);break;}
case 'reset':{const count=s.teams.length,duration=s.timer.duration;s=fresh(count);s.timer.duration=duration;s.timer.remaining=duration;break;}
case 'finish':{tick();s.finished=true;s.phase='finished';s.timer.running=false;s.message='🏆 게임 종료! 총자산 1등이 우승팀입니다!';break;}
case 'rename':{const t=s.teams.find(t=>t.id===Number(b.team));if(!t)throw Error('팀 없음');t.name=String(b.name||'').trim().slice(0,20)||t.name;break;}
default:throw Error('지원하지 않는 작업');}save();return {};}
function publicState(){tick();arcadeFinish();return {...s,arcade:arcadePublic(),arcadeCatalog:arcadeCatalog.map(({id,title,kind,duration})=>({id,title,kind,duration})),tiles:places.map((name,i)=>({...tile(i),name})),rank:s.teams.map(t=>({...t,total:t.cash+Object.values(s.properties).filter(p=>p.owner===t.id).reduce((a,p)=>a+p.price*(1+p.level*.6),0)})).sort((a,b)=>b.total-a.total)};}
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');function send(status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'});res.end(JSON.stringify(obj));}
if(req.method==='GET'&&url.pathname==='/api/state')return send(200,publicState());
if(req.method==='POST'&&url.pathname==='/api/action'){try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>10000)throw Error('요청 초과');}const b=JSON.parse(raw);// Public hands-on demo: no manager PIN required. Protect the production event separately.const result=action(b);return send(200,{ok:true,...result});}catch(e){return send(400,{error:e.message});}}
if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/index.html')){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return fs.createReadStream(path.join(ROOT,'index.html')).pipe(res);}
res.writeHead(404);res.end('Not found');});
server.listen(PORT,'0.0.0.0',()=>console.log('Team Marble online on '+PORT));
