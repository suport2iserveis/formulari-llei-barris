(()=>{
  "use strict";
  const $=id=>document.getElementById(id);
  const launcher=$("barrys-launcher"),panel=$("barrys-panel"),close=$("barrys-close");
  const context=$("barrys-context"),answer=$("barrys-answer"),sources=$("barrys-sources");
  const form=$("barrys-question"),input=$("barrys-input"),status=$("barrys-status");
  const KB=window.BARRYS_KNOWLEDGE||{topics:[],fallback:"No disposo d’una resposta validada per a aquesta consulta."};
  let active=null;
  let expressionTimer=0;

  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const words=s=>new Set(norm(s).replace(/[^a-z0-9·]+/g," ").split(/\s+/).filter(w=>w.length>2));
  const label=field=>{
    if(!field)return"Cap camp seleccionat";
    const direct=field.id?document.querySelector(`label[for="${CSS.escape(field.id)}"]`):null;
    return((direct||field.closest("label"))?.textContent||field.placeholder||field.name||"Camp del formulari").replace(/\s+/g," ").trim().replace(/\*$/,"").slice(0,160);
  };
  const value=()=>String(active?.value||"").trim();
  const setFace=(face="neutral",temporary=false)=>{
    clearTimeout(expressionTimer);
    document.querySelectorAll("[data-barrys-face]").forEach(el=>el.dataset.barrysFace=face);
    panel.dataset.barrysState=face;
    if(temporary)expressionTimer=setTimeout(()=>setFace(panel.classList.contains("is-open")?"attentive":"neutral"),2200);
  };
  const open=v=>{panel.classList.toggle("is-open",v);panel.setAttribute("aria-hidden",String(!v));launcher.setAttribute("aria-expanded",String(v));if(v)setTimeout(()=>input?.focus(),80)};
  const show=(text,kind="local")=>{answer.hidden=false;answer.className=`barrys-answer is-${kind}`;answer.textContent=text};
  const cite=list=>{
    sources.replaceChildren();
    if(!list?.length){sources.hidden=true;return}
    const strong=document.createElement("strong");strong.textContent="Base utilitzada";sources.append(strong);
    const ul=document.createElement("ul");
    [...new Set(list)].forEach(x=>{const li=document.createElement("li");li.textContent=x;ul.append(li)});
    sources.append(ul);sources.hidden=false;
  };
  const topicScore=(topic,text)=>{
    const q=words(text),keys=words([topic.id,topic.title,...(topic.keywords||[])].join(" "));
    let score=0;q.forEach(w=>{if(keys.has(w))score+=2;if(norm(topic.title).includes(w))score+=1});
    return score;
  };
  const findTopic=query=>{
    const combined=[query,label(active),active?.name,active?.id].filter(Boolean).join(" ");
    return (KB.topics||[]).map(t=>({t,s:topicScore(t,combined)})).sort((a,b)=>b.s-a.s)[0];
  };
  const checks=(text,topic)=>{
    const missing=[];
    const required=topic?.checks||[];
    required.forEach(c=>{if(!new RegExp(c.pattern,"i").test(text))missing.push(c.message)});
    if(text&&text.length<80)missing.push("El text és molt breu; concreta millor la informació.");
    if(/\b(si|no)\b/i.test(text)&&/indicador/.test(norm(label(active))))missing.push("L’indicador sembla binari. Formula’l amb una unitat i un valor numèric.");
    return [...new Set(missing)];
  };
  const respond=async(question,intent="question")=>{
    panel.classList.add("is-loading");
    setFace("thinking");
    status.textContent="Consultant la base documental local…";
    await new Promise(resolve=>setTimeout(resolve,260));
    const match=findTopic(question);
    if(!match||match.s<2){
      show(KB.fallback,"warning");cite([]);
      panel.classList.remove("is-loading");setFace("warning",true);
      status.textContent="Consulta sense base documental suficient.";
      return;
    }
    const t=match.t,current=value();
    let text="";
    let face="explaining";
    if(intent==="missing"||intent==="review"){
      if(!current){text="Aquest camp encara és buit. "+t.guidance}
      else{
        const issues=checks(current,t);
        text=issues.length?`Aspectes a revisar:\n\n• ${issues.join("\n• ")}`:"El text supera les comprovacions bàsiques configurades. Revisa igualment que totes les dades siguin certes i acreditables.";
        face=issues.length?"warning":"happy";
      }
    }else if(intent==="structure") text=t.structure||t.guidance;
    else text=t.guidance;
    show(text,"local");cite(t.sources||["Criteris interns validats d’iServeis"]);
    panel.classList.remove("is-loading");setFace(face,true);
    status.textContent=`Base documental ${KB.version} · sense API ni cost per consulta.`;
  };

  launcher.addEventListener("click",()=>{const willOpen=!panel.classList.contains("is-open");open(willOpen);setFace(willOpen?"attentive":"neutral")});
  close.addEventListener("click",()=>{open(false);setFace("neutral")});
  document.addEventListener("focusin",e=>{const f=e.target.closest?.("textarea,input:not([type=hidden]):not([type=button]):not([type=submit]),select");if(f&&!panel.contains(f)){active=f;context.textContent=`Camp actiu: ${label(f)}`;setFace("attentive",true)}});
  panel.addEventListener("click",e=>{
    const b=e.target.closest("[data-barrys-action]");if(!b)return;
    const prompts={explain:"què he de posar",missing:"què falta",structure:"estructura",review:"revisió"};
    respond(prompts[b.dataset.barrysAction]||"ajuda",b.dataset.barrysAction);
  });
  form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value="";respond(q,"question")});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){open(false);setFace("neutral")}});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)setFace(panel.classList.contains("is-open")?"attentive":"neutral")});
  status.textContent=`Base documental ${KB.version} activa · sense API ni cost per consulta.`;
  setFace("neutral");
})();
