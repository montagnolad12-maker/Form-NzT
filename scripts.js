// Simula banco local
let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');

function uidShort(){ return Math.random().toString(36).slice(2,9); }

// --------- FORMULÁRIO ---------
const form = document.getElementById('nzt-form');
const result = document.getElementById('result');
if(form){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = {
      id: uidShort(),
      name: form.name.value.trim(),
      discord: form.discord.value.trim(),
      age: form.age.value,
      availability: form.availability.value.trim(),
      calls: form.calls.value,
      status: 'pending',
      ticketCode: ''
    };
    submissions.push(data);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    result.classList.remove('hidden');
    result.innerHTML=`Inscrição enviada! Seu submissionId é: <code>${data.id}</code>`;
    form.reset();
  });
}

// --------- STATUS ---------
const btnCheck = document.getElementById('btnCheck');
const statusResult = document.getElementById('statusResult');
if(btnCheck){
  btnCheck.addEventListener('click', ()=>{
    const id = document.getElementById('checkId').value.trim();
    const sub = submissions.find(s=>s.id===id);
    statusResult.classList.remove('hidden');
    if(!sub) statusResult.textContent='ID não encontrado';
    else if(sub.status==='pending') statusResult.textContent='Seu formulário está em análise pela NzT...';
    else if(sub.status==='approved') statusResult.innerHTML=`Você foi aprovado! Abra um ticket no Discord: <a href="https://discord.gg/XnkKDrhwAs" target="_blank">Discord NzT</a><br>Senha: <strong>${sub.ticketCode}</strong>`;
    else statusResult.textContent='Infelizmente você não foi aprovado desta vez.';
  });
}

// --------- DASHBOARD ---------
const loginDiv = document.getElementById('loginDiv');
const panel = document.getElementById('panel');
const submissionsDiv = document.getElementById('submissions');
const loginMsg = document.getElementById('loginMsg');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');

if(btnLogin){
  btnLogin.addEventListener('click', ()=>{
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    if(user==='NzLobo' && pass==='Lobo1234'){
      loginDiv.classList.add('hidden');
      panel.classList.remove('hidden');
      renderSubmissions();
    }else loginMsg.textContent='Usuário ou senha incorretos';
  });
}

if(btnLogout){
  btnLogout.addEventListener('click', ()=>{
    panel.classList.add('hidden');
    loginDiv.classList.remove('hidden');
  });
}

function renderSubmissions(){
  submissionsDiv.innerHTML='';
  submissions.forEach((s,i)=>{
    const div = document.createElement('div');
    div.style.border='1px solid #ffcc00';
    div.style.padding='8px';
    div.style.margin='8px 0';
    div.style.borderRadius='8px';
    div.innerHTML=`
      <strong>ID:</strong> ${s.id}<br>
      <strong>Nome:</strong> ${s.name}<br>
      <strong>Discord:</strong> ${s.discord}<br>
      <strong>Idade:</strong> ${s.age}<br>
      <strong>Disponibilidade:</strong> ${s.availability}<br>
      <strong>Calls:</strong> ${s.calls}<br>
      <strong>Status:</strong> <span class="status-${s.status}">${s.status}</span><br>
      <button onclick="approve(${i})">Aprovar</button>
      <button onclick="reject(${i})">Reprovar</button>
    `;
    submissionsDiv.appendChild(div);
  });
}

function approve(i){
  submissions[i].status='approved';
  submissions[i].ticketCode=Math.floor(100000+Math.random()*900000);
  localStorage.setItem('submissions', JSON.stringify(submissions));
  renderSubmissions();
}

function reject(i){
  submissions[i].status='rejected';
  localStorage.setItem('submissions', JSON.stringify(submissions));
  renderSubmissions();
}
