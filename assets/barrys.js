(()=>{
  "use strict";
  const $=id=>document.getElementById(id);
  const launcher=$("barrys-launcher"),panel=$("barrys-panel"),close=$("barrys-close");
  const context=$("barrys-context"),answer=$("barrys-answer"),sources=$("barrys-sources");
  const form=$("barrys-question"),input=$("barrys-input"),send=$("barrys-send"),status=$("barrys-status");
  const config=window.BARRYS_CONFIG||{};
  let active=null,busy=false,history=[];

  const label=field=>{
    if(!field)return"Cap camp seleccionat";
    const direct=field.id?document.querySelector(`label[for="${CSS.escape(field.id)}"]`):null;
    const wrapping=field.closest("label");
    return((direct||wrapping)?.textContent||field.placeholder||field.name||"Camp del formulari").replace(/\s+/g," ").trim().replace(/\*$/,"").slice(0,160);
  };
  const fieldValue=()=>String(active?.value||"").trim().slice(0,8000);
  const pageContext=()=>({
    title:document.title,
    field:{id:active?.id||"",name:active?.name||"",label:label(active),value:fieldValue()},
    municipality:String(document.querySelector('[name="municipality"],#municipality')?.value||"").trim().slice(0,160),
    actionCode:String(document.querySelector('[name="actionCode"],#actionCode')?.value||"").trim().slice(0,80),
    actionTitle:String(document.querySelector('[name="actionTitle"],#actionTitle')?.value||"").trim().slice(0,240)
  });
  const localHelp=(name,action)=>{
    const key=name.toLowerCase();
    if(/diagnosi|necessitat|problem/.test(key))return action==="structure"?"1. Problema concret.\n2. Dades i font.\n3. Incidència dins l’AAE.\n4. Col·lectius afectats.\n5. Necessitat d’intervenció.":action==="missing"?"Comprova si hi consten una dada quantificada, la font, l’àmbit territorial afectat, els col·lectius implicats i la connexió directa amb l’actuació.":"Descriu el problema actual amb dades, explica com es manifesta a l’AAE i justifica per què l’actuació és necessària.";
    if(/objectiu/.test(key))return"Formula el resultat que es vol assolir, no només la tasca. Utilitza un verb d’acció i concreta, si és possible, magnitud i termini.";
    if(/indicador/.test(key))return"Defineix un indicador numèric, amb unitat, valor inicial, valor objectiu, font de verificació i periodicitat. Evita indicadors binaris de tipus Sí/No.";
    if(/descripció|actuació|proposta/.test(key))return action==="structure"?"1. Objecte.\n2. Treballs previstos.\n3. Ubicació i abast.\n4. Persones destinatàries.\n5. Fases.\n6. Resultats.":"Explica què es farà, on, amb quin abast, mitjançant quines fases i per a quina població.";
    return"Explica la informació pròpia d’aquest apartat amb dades verificables, l’encaix amb la necessitat detectada i els resultats esperats.";
  };
  const open=value=>{panel.classList.toggle("is-open",value);panel.setAttribute("aria-hidden",String(!value));launcher.setAttribute("aria-expanded",String(value));if(value)setTimeout(()=>input?.focus(),80)};
  const showAnswer=(text,kind="assistant")=>{answer.hidden=false;answer.className=`barrys-answer is-${kind}`;answer.textContent=text};
  const showSources=list=>{
    sources.replaceChildren();
    if(!Array.isArray(list)||!list.length){sources.hidden=true;return}
    const title=document.createElement("strong");title.textContent="Fonts consultades";sources.append(title);
    const ul=document.createElement("ul");
    list.forEach(item=>{const li=document.createElement("li");li.textContent=[item.filename,item.page?`p. ${item.page}`:""].filter(Boolean).join(" · ");ul.append(li)});
    sources.append(ul);sources.hidden=false;
  };
  const setBusy=value=>{busy=value;send.disabled=value;input.disabled=value;panel.classList.toggle("is-loading",value);send.textContent=value?"Consultant…":"Envia"};
  const ask=async(question,intent="question")=>{
    const endpoint=String(config.endpoint||"").trim();
    if(!endpoint){showAnswer("La connexió segura de Barrys encara no està configurada. L’ajuda guiada funciona, però per fer consultes documentals cal completar assets/barrys.config.js i desplegar el servei inclòs al paquet.","warning");return}
    if(busy)return;
    setBusy(true);showSources([]);
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Number(config.requestTimeoutMs)||45000);
    try{
      const response=await fetch(endpoint.replace(/\/+$/,"")+"/v1/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,intent,context:pageContext(),history:history.slice(-4),assistantVersion:config.assistantVersion||"1.0.0"}),signal:controller.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.message||"No s’ha pogut obtenir una resposta.");
      const text=String(data.answer||"No he pogut formular una resposta.");
      showAnswer(text,data.grounded===false?"warning":"assistant");showSources(data.sources);
      history=[...history,{role:"user",text:question},{role:"assistant",text}].slice(-8);
    }catch(error){showAnswer(error.name==="AbortError"?"La consulta ha trigat massa. Torna-ho a provar.":String(error.message||error),"error")}
    finally{clearTimeout(timer);setBusy(false)}
  };
  launcher.addEventListener("click",()=>open(!panel.classList.contains("is-open")));
  close.addEventListener("click",()=>open(false));
  document.addEventListener("focusin",event=>{const field=event.target.closest?.("textarea,input:not([type=hidden]):not([type=button]):not([type=submit]),select");if(field&&!panel.contains(field)){active=field;context.textContent=`Camp actiu: ${label(field)}`}});
  panel.addEventListener("click",event=>{
    const button=event.target.closest("[data-barrys-action]");if(!button)return;
    const intent=button.dataset.barrysAction,value=fieldValue();
    if(!config.endpoint){let text=localHelp(label(active),intent);if(intent==="review"&&!value)text="Aquest camp encara és buit. Introdueix un primer text i després podré orientar-ne la revisió.";else if(intent==="review"&&value.length<80)text+="\n\nEl text actual és molt breu; probablement necessita més concreció o dades.";showAnswer(text,"local");showSources([]);return}
    const prompts={explain:"Explica què s’ha d’incloure en aquest camp.",missing:"Detecta quina informació rellevant falta en el text actual.",structure:"Proposa una estructura orientativa per completar aquest camp.",review:"Revisa el text actual i indica millores concretes sense inventar dades."};
    ask(prompts[intent]||prompts.explain,intent);
  });
  form.addEventListener("submit",event=>{event.preventDefault();const q=input.value.trim();if(!q)return;input.value="";ask(q,"question")});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")open(false)});
  status.textContent=config.endpoint?"IA documental preparada.":"Mode local: connexió d’IA pendent.";
})();
