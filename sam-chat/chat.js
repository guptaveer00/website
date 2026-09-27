(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input=$('message'), log=$('messages'), status=$('status'), error=$('error');
  const greeting=log.firstElementChild.cloneNode(true);
  let history=[], busy=false;
  function bubble(role,text){
    const article=document.createElement('article'); article.className=`bubble ${role}`;
    const label=document.createElement('small');label.textContent=role==='user'?'YOU':'AI SIMULATION';
    const paragraph=document.createElement('p');paragraph.textContent=text;
    article.append(label,paragraph);log.append(article);log.scrollTop=log.scrollHeight;return article;
  }
  function setBusy(value){busy=value;input.disabled=value;for(const button of document.querySelectorAll('button'))button.disabled=value;}
  function showError(text){error.textContent=text;error.hidden=false;}
  function trimHistory(){while(history.length>10||history.reduce((n,m)=>n+m.content.length,0)>12000)history.splice(0,2);}
  $('chat-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const message=input.value.trim();if(!message){showError('Type a message first.');return;}
    const base=(window.SAM_CHAT_API||'').replace(/\/$/,'');
    if(!base){showError('This demo is waiting for its backend connection. Please check back soon.');return;}
    error.hidden=true;const userBubble=bubble('user',message);input.value='';setBusy(true);status.textContent='Thinking…';
    const controller=new AbortController();
    const waking=setTimeout(()=>{status.textContent='Still connecting… the demo server may be waking up.';},8000);
    const timeout=setTimeout(()=>controller.abort(),110000);
    try{
      const response=await fetch(`${base}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history}),signal:controller.signal});
      let data;try{data=await response.json();}catch{throw new Error('The server returned an unexpected response. Please try again.');}
      if(!response.ok)throw new Error(data.error||'The server could not complete your request.');
      if(typeof data.reply!=='string'||!data.reply.trim())throw new Error('No reply was received. Please try again.');
      bubble('assistant',data.reply);history.push({role:'user',content:message},{role:'assistant',content:data.reply});trimHistory();
    }catch(err){
      userBubble.remove();input.value=message;
      showError(err.name==='AbortError'?'The request timed out. The server may still be waking up; please try again.':err instanceof TypeError?'Could not connect to the chat server. Check your connection and try again.':err.message);
    }finally{clearTimeout(waking);clearTimeout(timeout);status.textContent='';setBusy(false);input.focus();}
  });
  input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chat-form').requestSubmit();}});
  $('clear').addEventListener('click',()=>{if(busy)return;history=[];log.replaceChildren(greeting.cloneNode(true));input.value='';error.hidden=true;status.textContent='';input.focus();});
  document.querySelectorAll('.starters button').forEach(button=>button.addEventListener('click',()=>{input.value=button.textContent;input.focus();}));
})();
