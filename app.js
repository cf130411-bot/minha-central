const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='minhaCentral_v1';
let state=JSON.parse(localStorage.getItem(KEY)||'{"tasks":[],"alarms":[],"apps":[]}');
const today=new Date(); const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
$('#today').textContent=today.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
$('#greeting').textContent=(today.getHours()<12?'Bom dia':today.getHours()<18?'Boa tarde':'Boa noite')+'! 👋';
$('#taskDate').value=localDate(today);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function goto(page){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page))}
$$('.tab').forEach(b=>b.onclick=()=>goto(b.dataset.page));$$('[data-goto]').forEach(b=>b.onclick=()=>goto(b.dataset.goto));
function empty(msg){return `<div class="empty">${msg}</div>`}
function taskCard(t){return `<div class="task ${t.done?'done':''}"><button class="check" data-check="${t.id}" aria-label="Concluir tarefa">${t.done?'✓':''}</button><div class="task-info"><div class="task-name">${esc(t.name)}</div><div class="task-meta">${esc(t.category)} · ${esc(t.date)} ${t.time?'· '+esc(t.time):''}</div></div><button class="delete" data-del-task="${t.id}" aria-label="Excluir">×</button></div>`}
function render(){
 const pending=state.tasks.filter(t=>!t.done).length, done=state.tasks.filter(t=>t.done).length;
 $('#pendingCount').textContent=pending;$('#doneCount').textContent=done;$('#alarmCount').textContent=state.alarms.filter(a=>a.enabled).length;
 const sorted=[...state.tasks].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 $('#taskList').innerHTML=sorted.length?sorted.map(taskCard).join(''):empty('Nenhuma tarefa por enquanto. Toque em “Nova” para começar.');
 const upcoming=sorted.filter(t=>!t.done).slice(0,4);$('#homeTasks').innerHTML=upcoming.length?upcoming.map(taskCard).join(''):empty('Tudo em dia! Adicione uma tarefa para organizar sua rotina.');
 $('#alarmList').innerHTML=state.alarms.length?state.alarms.slice().sort((a,b)=>a.time.localeCompare(b.time)).map(a=>`<div class="task"><div class="task-info"><div class="alarm-time">${esc(a.time)}</div><div class="alarm-title">${esc(a.name)}</div><div class="task-meta">${a.repeat?'Todos os dias':'Uma vez'} · Som: ${esc(a.soundLabel)} · ${a.enabled?'Ativo':'Desativado'}</div></div><button class="secondary" data-toggle-alarm="${a.id}">${a.enabled?'Desativar':'Ativar'}</button><button class="delete" data-del-alarm="${a.id}">×</button></div>`).join(''):empty('Nenhum alarme cadastrado.');
 $('#appList').innerHTML=state.apps.length?state.apps.map(a=>`<a class="app-tile" href="${esc(a.url)}" target="_blank" rel="noopener"><span class="emoji">${esc(a.emoji||'📱')}</span><span class="app-label">${esc(a.name)}</span><button type="button" class="delete" data-del-app="${a.id}" aria-label="Excluir atalho">×</button></a>`).join(''):empty('Adicione seus sites e atalhos favoritos.');
}
document.addEventListener('click',e=>{
 const c=e.target.closest('[data-check]');if(c){let t=state.tasks.find(x=>x.id===c.dataset.check);if(t)t.done=!t.done;save()}
 const dt=e.target.closest('[data-del-task]');if(dt){state.tasks=state.tasks.filter(x=>x.id!==dt.dataset.delTask);save()}
 const da=e.target.closest('[data-del-alarm]');if(da){state.alarms=state.alarms.filter(x=>x.id!==da.dataset.delAlarm);save()}
 const ta=e.target.closest('[data-toggle-alarm]');if(ta){let a=state.alarms.find(x=>x.id===ta.dataset.toggleAlarm);if(a)a.enabled=!a.enabled;save()}
 const ap=e.target.closest('[data-del-app]');if(ap){e.preventDefault();e.stopPropagation();state.apps=state.apps.filter(x=>x.id!==ap.dataset.delApp);save()}
});
function formToggle(form,on){$(form).classList.toggle('hidden',!on)}
$('#newTaskBtn').onclick=()=>formToggle('#taskForm',true);$('#cancelTask').onclick=()=>formToggle('#taskForm',false);
$('#taskForm').onsubmit=e=>{e.preventDefault();state.tasks.push({id:crypto.randomUUID(),name:$('#taskName').value.trim(),date:$('#taskDate').value,time:$('#taskTime').value,category:$('#taskCategory').value,done:false});e.target.reset();$('#taskDate').value=localDate(new Date());formToggle('#taskForm',false);save()};
$('#newAlarmBtn').onclick=()=>formToggle('#alarmForm',true);$('#cancelAlarm').onclick=()=>formToggle('#alarmForm',false);
$('#alarmForm').onsubmit=e=>{e.preventDefault();const sounds={bell:'Sino',chime:'Sininho',soft:'Suave'};state.alarms.push({id:crypto.randomUUID(),name:$('#alarmName').value.trim(),time:$('#alarmTime').value,sound:$('#alarmSound').value,soundLabel:sounds[$('#alarmSound').value],repeat:$('#alarmRepeat').checked,enabled:true});e.target.reset();$('#alarmRepeat').checked=true;formToggle('#alarmForm',false);save()};
$('#newAppBtn').onclick=()=>formToggle('#appForm',true);$('#cancelApp').onclick=()=>formToggle('#appForm',false);
$('#appForm').onsubmit=e=>{e.preventDefault();let url=$('#appUrl').value.trim();if(!/^https?:\/\//i.test(url)){alert('Informe um endereço começando com https:// ou http://');return}state.apps.push({id:crypto.randomUUID(),name:$('#appName').value.trim(),url,emoji:$('#appEmoji').value.trim()||'📱'});e.target.reset();$('#appEmoji').value='📱';formToggle('#appForm',false);save()};
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();