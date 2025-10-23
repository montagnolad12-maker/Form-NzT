// ----- COLOQUE SUA CONFIG DO FIREBASE AQUI -----
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

if (!window.firebaseApp) {
  firebase.initializeApp(firebaseConfig);
  window.firebaseApp = firebase.app();
}

const db = firebase.firestore();
const auth = firebase.auth();

function $id(id){ return document.getElementById(id); }
function uidShort(){ return Math.random().toString(36).slice(2,9); }
function genTicketCode(){ return Math.floor(100000 + Math.random()*900000).toString(); }

// ----------------- FORMULÁRIO -----------------
if($id('nzt-form')){
  const form = $id('nzt-form');
  const result = $id('result');
  const checkId = $id('checkId');
  const btnCheck = $id('btnCheck');
  const statusResult = $id('statusResult');

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      discord: form.discord.value.trim(),
      age: parseInt(form.age.value,10),
      availability: form.availability.value.trim(),
      calls: form.calls.value,
      agree: !!form.agree.checked,
      status:'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try{
      const docRef = await db.collection('submissions').add(data);
      result.classList.remove('hidden');
      result.innerHTML=`Inscrição enviada! Seu submissionId é: <code>${docRef.id}</code>`;
    }catch(err){ console.error(err); result.classList.remove('hidden'); result.textContent='Erro ao enviar.'; }
  });

  btnCheck.addEventListener('click', ()=>{
    const id = checkId.value.trim();
    if(!id) return alert('Cole seu submissionId');
    db.collection('submissions').doc(id).onSnapshot(doc=>{
      if(!doc.exists){ statusResult.classList.remove('hidden'); statusResult.textContent='ID não encontrado'; return; }
      const d = doc.data();
      statusResult.classList.remove('hidden');
      if(d.status==='pending') statusResult.textContent='Seu formulário está em análise pela NzT...';
      else if(d.status==='approved') statusResult.innerHTML=`Você foi aprovado na NzT!<br>Abra um ticket no nosso Discord: <a href="https://discord.gg/XnkKDrhwAs" target="_blank">Discord NzT</a><br>Senha: <strong>${d.ticketCode}</strong>`;
      else statusResult.textContent='Infelizmente você não foi aprovado desta vez.';
    });
  });
}

// ----------------- DASHBOARD -----------------
if($id('btnLogin')){
  const emailI = $id('email');
  const passI = $id('password');
  const btnLogin = $id('btnLogin');
  const btnLogout = $id('btnLogout');
  const authMsg = $id('authMsg');
  const panel = $id('panel');
  const submissionsDiv = $id('submissions');

  btnLogin.addEventListener('click', async ()=>{
    try{
      await auth.signInWithEmailAndPassword(emailI.value, passI.value);
    }catch(err){ authMsg.textContent=err.message; }
  });

  btnLogout.addEventListener('click', ()=>{ auth.signOut(); });

  auth.onAuthStateChanged(async user=>{
    if(user){
      authMsg.textContent=`Logado como ${user.email}`;
      btnLogout.classList.remove('hidden');
      btnLogin.classList.add('hidden');
      emailI.classList.add('hidden'); passI.classList.add('hidden');
      panel.classList.remove('hidden');

      // Load submissions
      db.collection('submissions').orderBy('createdAt','desc').onSnapshot(snapshot=>{
        submissionsDiv.innerHTML='';
        snapshot.forEach(doc=>{
          const d = doc.data();
          const div = document.createElement('div');
          div.style.border='1px solid #ffcc00'; div.style.padding='8px'; div.style.margin='8px 0'; div.style.borderRadius='8px';
          div.innerHTML=`
            <strong>ID:</strong> ${doc.id}<br>
            <strong>Nome:</strong> ${d.name}<br>
            <strong>Discord:</strong> ${d.discord}<br>
            <strong>Idade:</strong> ${d.age}<br>
            <strong>Disponibilidade:</strong> ${d.availability}<br>
            <strong>Calls:</strong> ${d.calls}<br>
            <strong>Status:</strong> ${d.status}<br>
            <button onclick="approve('${doc.id}')">Aprovar</button>
            <button onclick="reject('${doc.id}')">Reprovar</button>
          `;
          submissionsDiv.appendChild(div);
        });
      });

    }else{
      authMsg.textContent='Não logado';
      panel.classList.add('hidden');
      btnLogout.classList.add('hidden');
      btnLogin.classList.remove('hidden');
      emailI.classList.remove('hidden'); passI.classList.remove('hidden');
    }
  });
}

// ----------------- FUNÇÕES DE APROVAR/REPROVAR -----------------
async function approve(docId){
  const ticket = genTicketCode();
  await db.collection('submissions').doc(docId).update({status:'approved', ticketCode: ticket});
  alert(`Aprovado! Ticket gerado: ${ticket}`);
}

async function reject(docId){
  await db.collection('submissions').doc(docId).update({status:'rejected'});
  alert('Reprovado!');
}
