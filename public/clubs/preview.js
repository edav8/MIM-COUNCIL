const form=document.querySelector('#ask'),input=document.querySelector('#question'),send=document.querySelector('#send'),status=document.querySelector('#status'),chat=document.querySelector('#conversation');
// Keep the content the reader is looking at stationary when messages grow above it.
function preserveReadingPosition(change){
 const anchor=document.elementFromPoint(Math.min(window.innerWidth-1,window.innerWidth/2),16);
 const before=anchor?.getBoundingClientRect().top;
 change();
 if(anchor?.isConnected&&Number.isFinite(before)){
  const shift=anchor.getBoundingClientRect().top-before;
  if(shift)window.scrollBy({top:shift,behavior:'instant'});
 }
}
function article(label,text,kind){const a=document.createElement('article');a.className=kind;const h=document.createElement('strong');h.textContent=label;a.append(h);if(text){const p=document.createElement('p');p.textContent=text;a.append(p);}chat.append(a);return a;}
form.addEventListener('submit',async e=>{
 e.preventDefault();const question=input.value.trim();if(!question||send.disabled)return;
 let answerCard;
 preserveReadingPosition(()=>{article('You',question,'question');answerCard=article('Clubs assistant','Checking the guidance…','answer');});
 input.value='';send.disabled=true;status.textContent='Checking the guidance…';
 try{
  const response=await fetch('/clubs/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});const data=await response.json();
  preserveReadingPosition(()=>{
   answerCard.replaceChildren();const label=document.createElement('strong');label.textContent='Clubs assistant';answerCard.append(label);
   if(data.message){const p=document.createElement('p');p.textContent=data.message;answerCard.append(p);}
   for(const answer of data.answers||[]){const p=document.createElement('p');p.textContent=answer.text;answerCard.append(p);const cite=document.createElement('small');cite.textContent='Source: '+answer.citation;answerCard.append(cite);}
   if(data.status==='handoff'){const b=document.createElement('button');b.className='ask-tim';b.textContent='Ask Tim directly ↗';b.addEventListener('click',()=>openContact(question));answerCard.append(b);}
  });
 }catch{preserveReadingPosition(()=>{answerCard.querySelector('p').textContent='I couldn’t connect just now. Please try again.';});}
 finally{send.disabled=false;status.textContent='Response ready above.';}
});
document.querySelectorAll('.suggestions button').forEach(b=>b.addEventListener('click',()=>{if(send.disabled)return;input.value=b.textContent;form.requestSubmit();}));
document.querySelector('#contact').addEventListener('click',()=>openContact());
document.querySelector('#clear').addEventListener('click',()=>{if(send.disabled)return;preserveReadingPosition(()=>chat.replaceChildren());input.value='';status.textContent='';input.focus({preventScroll:true});});

const dialog=document.querySelector('#contact-dialog'),summary=document.querySelector('#forward-summary'),reply=document.querySelector('#forward-contact'),consent=document.querySelector('#forward-consent'),forwardStatus=document.querySelector('#forward-status'),forwardSend=document.querySelector('#forward-send');
const recoveryKey='mim28-clubs-pending-contact-v1';
let pendingHandoff=null,completedHandoff=false,terminalHandoff=false,recoveredHandoff=false;
function saveRecovery(state='uncertain'){try{sessionStorage.setItem(recoveryKey,JSON.stringify({payload:pendingHandoff,state}));return true;}catch{return false;}}
function clearRecovery(){try{sessionStorage.removeItem(recoveryKey);}catch{}}
try{
 const saved=JSON.parse(sessionStorage.getItem(recoveryKey)||'null'),p=saved?.payload;
 if(p&&typeof p.id==='string'&&/^\w[\w-]{19,79}$/.test(p.id)&&typeof p.summary==='string'&&p.summary.length<=3000&&typeof p.contact==='string'&&p.contact.length<=200&&p.consent?.confirmed===true&&p.consent.summary===p.summary&&p.consent.contact===p.contact){pendingHandoff=p;recoveredHandoff=true;terminalHandoff=saved.state==='terminal';}
 else if(saved)clearRecovery();
}catch{clearRecovery();}
function showPending(){
 summary.value=pendingHandoff.summary;reply.value=pendingHandoff.contact;summary.readOnly=true;reply.readOnly=true;consent.checked=false;consent.disabled=terminalHandoff;forwardSend.disabled=terminalHandoff;forwardSend.textContent=terminalHandoff?'Contact Tim by email':'Retry this same request';
 forwardStatus.textContent=terminalHandoff?'This request needs a manual check. Please email Tim using the link below.': 'A previous request has not been confirmed. Review it and confirm before retrying the same request. Nothing is sent automatically.';
}
function openContact(question=''){
 if(completedHandoff){pendingHandoff=null;completedHandoff=false;summary.readOnly=false;reply.readOnly=false;reply.value='';consent.disabled=false;forwardSend.disabled=false;forwardSend.textContent='Send to Tim';forwardStatus.textContent='';}
 if(pendingHandoff&&recoveredHandoff){showPending();recoveredHandoff=false;}
 else if(!pendingHandoff){summary.value=question;consent.checked=false;}
 if(!dialog.open)dialog.showModal();
}
document.querySelector('#open-forward').addEventListener('click',()=>openContact());
document.querySelector('#close-contact').addEventListener('click',()=>dialog.close());
[summary,reply].forEach(el=>el.addEventListener('input',()=>{consent.checked=false;summary.setCustomValidity('');}));
document.querySelector('#forward-form').addEventListener('submit',async e=>{
 e.preventDefault();if(forwardSend.disabled||!consent.checked||terminalHandoff)return;
 if(!summary.value.trim()){summary.setCustomValidity('Please enter your question.');summary.reportValidity();return;}
 if(!pendingHandoff)pendingHandoff={id:crypto.randomUUID(),summary:summary.value,contact:reply.value,consent:{confirmed:true,summary:summary.value,contact:reply.value}};
 const saved=saveRecovery();
 summary.readOnly=true;reply.readOnly=true;consent.disabled=true;forwardSend.disabled=true;forwardStatus.textContent=saved?'Sending your question…':'Sending your question… Keep this tab open: retry recovery is unavailable in this browser.';
 try{
  const r=await fetch('/clubs/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingHandoff)});const result=await r.json();forwardStatus.textContent=result.message||'We could not confirm forwarding. Retry this same request or email Tim directly.';
  if(result.accepted===true&&result.status==='accepted'){clearRecovery();completedHandoff=true;forwardSend.textContent='Accepted for forwarding';return;}
  if(result.status==='invalid'){clearRecovery();pendingHandoff=null;summary.readOnly=false;reply.readOnly=false;consent.disabled=false;consent.checked=false;forwardSend.disabled=false;forwardSend.textContent='Send to Tim';return;}
  if(['needs_review','conflict'].includes(result.status)){terminalHandoff=true;saveRecovery('terminal');forwardSend.textContent='Contact Tim by email';return;}
 }catch{forwardStatus.textContent='We could not confirm forwarding. Retry this same request or email Tim directly.';}
 consent.disabled=false;forwardSend.textContent='Retry this same request';forwardSend.disabled=false;
});
