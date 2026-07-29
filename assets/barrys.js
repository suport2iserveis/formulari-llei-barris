(()=>{
  "use strict";

  const $=id=>document.getElementById(id);
  const launcher=$("barrys-launcher");
  const panel=$("barrys-panel");
  const close=$("barrys-close");
  const context=$("barrys-context");
  const answer=$("barrys-answer");
  const sources=$("barrys-sources");
  const form=$("barrys-question");
  const input=$("barrys-input");
  const status=$("barrys-status");
  const KB=window.BARRYS_KNOWLEDGE||{topics:[],fallback:"No disposo d’una resposta validada per a aquesta consulta."};
  const FIELDS=window.BARRYS_FIELDS||{byId:{},byClass:{},defaultSources:[]};
  const FACE_URLS={
    attentive:"assets/barrys/attentive.png?v=4.8.0",
    thinking:"assets/barrys/thinking.png?v=4.8.0",
    explaining:"assets/barrys/explaining.png?v=4.8.0",
    happy:"assets/barrys/happy.png?v=4.8.0",
    warning:"assets/barrys/warning.png?v=4.8.0"
  };

  let active=null;
  let faceAnimationTimer=0;
  let idleReturnTimer=0;

  Object.values(FACE_URLS).forEach(src=>{const image=new Image();image.src=src});

  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const words=s=>new Set(norm(s).replace(/[^a-z0-9·]+/g," ").split(/\s+/).filter(w=>w.length>2));
  const unique=list=>[...new Set((list||[]).filter(Boolean))];
  const fieldYear=field=>(field?.id?.match(/(20\d{2})$/)||[])[1]||"";
  const fieldValue=field=>{
    if(!field)return"";
    if(field.type==="checkbox")return field.checked?"1":"";
    return String(field.value||"").trim();
  };
  const parseNumber=value=>{
    const clean=String(value||"").replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".").replace(/[^\d.-]/g,"");
    const number=Number(clean);
    return Number.isFinite(number)?number:NaN;
  };
  const label=field=>{
    if(!field)return"Cap camp seleccionat";
    const direct=field.id?document.querySelector(`label[for="${CSS.escape(field.id)}"]`):null;
    const raw=(direct||field.closest("label"))?.childNodes?.[0]?.textContent||(direct||field.closest("label"))?.textContent||field.placeholder||field.name||"Camp del formulari";
    return String(raw).replace(/\s+/g," ").trim().replace(/\*$/,"").slice(0,160);
  };
  const profileForField=field=>{
    if(!field)return null;
    if(field.id&&FIELDS.byId?.[field.id])return FIELDS.byId[field.id];
    const classNames=Object.keys(FIELDS.byClass||{});
    for(const className of classNames)if(field.classList?.contains(className))return FIELDS.byClass[className];
    return null;
  };
  const profileTitle=(profile,field)=>{
    const year=fieldYear(field);
    return `${profile?.title||label(field)}${year?` · ${year}`:""}`;
  };
  const profileFromQuestion=query=>{
    const q=norm(query);
    const profiles=[...Object.values(FIELDS.byId||{}),...Object.values(FIELDS.byClass||{})];
    return profiles.find(profile=>[profile.title,...(profile.aliases||[])].some(alias=>q.includes(norm(alias))))||null;
  };
  const activeFieldContext=query=>{
    const direct=profileForField(active);
    if(direct)return{profile:direct,field:active,title:profileTitle(direct,active)};
    const mentioned=profileFromQuestion(query);
    return mentioned?{profile:mentioned,field:null,title:mentioned.title}:null;
  };

  const setFace=(requested="attentive")=>{
    const face=FACE_URLS[requested]?requested:"attentive";
    panel.dataset.barrysState=face;
    document.querySelectorAll(".barrys-sprite").forEach(element=>{
      if(element.dataset.barrysFace===face)return;
      element.dataset.barrysFace=face;
      element.src=FACE_URLS[face];
      element.classList.remove("is-face-changing");
      void element.offsetWidth;
      element.classList.add("is-face-changing");
    });
    clearTimeout(faceAnimationTimer);
    faceAnimationTimer=setTimeout(()=>{
      document.querySelectorAll(".barrys-sprite").forEach(element=>element.classList.remove("is-face-changing"));
    },320);
  };
  const open=value=>{
    panel.classList.toggle("is-open",value);
    panel.setAttribute("aria-hidden",String(!value));
    launcher.setAttribute("aria-expanded",String(value));
    if(value)setTimeout(()=>input?.focus(),80);
  };
  const show=(text,kind="local")=>{
    answer.hidden=false;
    answer.className=`barrys-answer is-${kind}`;
    answer.textContent=text;
  };
  const cite=list=>{
    sources.replaceChildren();
    if(!list?.length){sources.hidden=true;return}
    const strong=document.createElement("strong");
    strong.textContent="Base utilitzada";
    sources.append(strong);
    const ul=document.createElement("ul");
    unique(list).forEach(item=>{
      const li=document.createElement("li");
      li.textContent=item;
      ul.append(li);
    });
    sources.append(ul);
    sources.hidden=false;
  };
  const topicScore=(topic,text)=>{
    const q=words(text);
    const keys=words([topic.id,topic.title,...(topic.keywords||[])].join(" "));
    let score=0;
    q.forEach(word=>{if(keys.has(word))score+=2;if(norm(topic.title).includes(word))score+=1});
    return score;
  };
  const findTopic=query=>(KB.topics||[])
    .map(topic=>({topic,score:topicScore(topic,query)}))
    .sort((a,b)=>b.score-a.score)[0];

  const relatedAllocation=field=>{
    const year=fieldYear(field);
    return year?document.getElementById(`llb-allocation-${year}`):null;
  };
  const relatedAnnualAmount=field=>{
    const year=fieldYear(field);
    return year?document.getElementById(`llb-amount-${year}`):null;
  };
  const explicitUnit=value=>{
    const text=norm(value);
    if(text.includes("%")||text.includes("percent"))return"%";
    if(text.includes("€")||text.includes("euro"))return"€";
    if(/m²|m2/.test(text))return"m²";
    if(text.includes("persona")||text.includes("participant"))return"persones";
    if(text.includes("hora"))return"hores";
    if(text.includes("dia"))return"dies";
    if(text.includes("unitat"))return"unitats";
    return"";
  };
  const ruleIssues=(profile,field)=>{
    const value=fieldValue(field);
    const issues=[];
    (profile?.rules||[]).forEach(rule=>{
      let failed=false;
      switch(rule.type){
        case"required":failed=!value;break;
        case"minLength":failed=!!value&&value.length<rule.value;break;
        case"minLengthIfValue":failed=!!value&&value.length<rule.value;break;
        case"pattern":failed=!!value&&!new RegExp(rule.pattern,"i").test(value);break;
        case"patternUnlessNone":
          failed=!!value&&!/^(cap|no n['’]?hi ha|no se['’]n preveuen|sense col·labor)/i.test(value)&&!new RegExp(rule.pattern,"i").test(value);
          break;
        case"positiveInteger":{
          const number=parseNumber(value);
          failed=!Number.isInteger(number)||number<=0;
          break;
        }
        case"positiveNumber":{
          const number=parseNumber(value);
          failed=!Number.isFinite(number)||number<=0;
          break;
        }
        case"range":{
          const number=parseNumber(value);
          failed=!!value&&(!Number.isFinite(number)||number<rule.min||number>rule.max);
          break;
        }
        case"nonNegative":{
          const number=parseNumber(value||"0");
          failed=!Number.isFinite(number)||number<0;
          break;
        }
        case"nonBinary":failed=/^(si|sí|no|s\/n)$/i.test(value);break;
        case"atLeastOneYear":
          failed=!document.querySelector(".llb-structure-year:checked");
          break;
        case"allocationSum":{
          const total=[...document.querySelectorAll(".llb-allocation")].reduce((sum,control)=>sum+(parseNumber(control.value)||0),0);
          failed=Math.abs(total-100)>=0.001;
          break;
        }
        case"requiredIfAllocated":{
          const allocation=parseNumber(relatedAllocation(field)?.value||"0");
          failed=allocation>0&&!value;
          break;
        }
        case"amountIfAllocated":{
          const allocation=parseNumber(relatedAllocation(field)?.value||"0");
          const amount=parseNumber(value);
          failed=allocation>0&&(!Number.isFinite(amount)||amount<=0);
          break;
        }
        case"otherNotAboveAnnual":{
          const other=parseNumber(value||"0");
          const annual=parseNumber(relatedAnnualAmount(field)?.value||"0");
          failed=Number.isFinite(other)&&Number.isFinite(annual)&&other>annual;
          break;
        }
        case"sameUnitAsCurrent":{
          const row=field?.closest?.(".llb-indicator-row");
          const current=row?.querySelector(".llb-indicator-current")?.value||"";
          const currentUnit=explicitUnit(current);
          const targetUnit=explicitUnit(value);
          failed=!!currentUnit&&!!targetUnit&&currentUnit!==targetUnit;
          break;
        }
      }
      if(failed)issues.push(rule.message);
    });
    return unique(issues);
  };
  const bulletList=items=>items.map(item=>`• ${item}`).join("\n");
  const explainField=({profile,title})=>{
    let text=`Camp concret: ${title}\n\nQuè s’hi ha de posar:\n${bulletList(profile.include||[])}`;
    if(profile.structure)text+=`\n\nEstructura recomanada:\n${profile.structure}`;
    if(profile.avoid?.length)text+=`\n\nEvita:\n${bulletList(profile.avoid)}`;
    if(profile.readonly)text+=`\n\nAquest camp és automàtic: si és buit, corregeix primer el camp del qual depèn.`;
    return text;
  };
  const missingField=({profile,field,title},review=false)=>{
    const issues=ruleIssues(profile,field);
    const value=fieldValue(field);
    if(!field){
      return `Per revisar «${title}», selecciona primer aquest camp al formulari. Mentrestant, el contingut que ha d’incloure és:\n\n${bulletList(profile.include||[])}`;
    }
    if(!issues.length){
      if(!value)return `En el context actual, «${title}» pot quedar buit o a zero. Comprova, però, aquesta indicació:\n\n${bulletList(profile.include||[])}`;
      return `${review?"Revisió":"Comprovació"} del camp «${title}»:\n\nNo hi detecto cap mancança segons les regles configurades per a aquest camp. Això no valida la veracitat de les dades; comprova que siguin certes, coherents amb la resta de la fitxa i acreditables.`;
    }
    const requiredContent=!value&&profile.include?.length?`\n\nPer completar-lo, incorpora concretament:\n${bulletList(profile.include)}`:"";
    return `${review?"Aspectes a revisar":"Què falta"} al camp «${title}»:\n\n${bulletList(issues)}${requiredContent}\n\nAquesta revisió afecta només el camp seleccionat, no tota la fitxa.`;
  };
  const structureField=({profile,title})=>{
    if(profile.structure)return `Estructura específica per a «${title}»:\n\n${profile.structure}`;
    return `Ordre recomanat per completar «${title}»:\n\n${(profile.include||[]).map((item,index)=>`${index+1}. ${item}`).join("\n")}`;
  };
  const inferIntent=(question,requested)=>{
    if(requested&&requested!=="question")return requested;
    const q=norm(question);
    if(/que falta|què falta|manca|mancances|incomplet|pendent/.test(q))return"missing";
    if(/revisa|revisio|correcte|comprova|valida/.test(q))return"review";
    if(/estructura|ordre|organitza|esquema/.test(q))return"structure";
    return"explain";
  };
  const respondField=(fieldContext,intent)=>{
    if(intent==="missing"||intent==="review"){
      const text=missingField(fieldContext,intent==="review");
      const issues=fieldContext.field?ruleIssues(fieldContext.profile,fieldContext.field):[];
      show(text,issues.length?"warning":"local");
      setFace(issues.length?"warning":"happy");
      return;
    }
    if(intent==="structure"){
      show(structureField(fieldContext),"local");
      setFace("explaining");
      return;
    }
    show(explainField(fieldContext),"local");
    setFace("explaining");
  };
  const respondTopic=query=>{
    const match=findTopic(query);
    if(!match||match.score<2){
      show(KB.fallback,"warning");
      cite([]);
      setFace("warning");
      status.textContent="Consulta sense base documental suficient.";
      return;
    }
    show(match.topic.guidance,"local");
    cite(match.topic.sources||FIELDS.defaultSources||[]);
    setFace("explaining");
    status.textContent=`Resposta general: ${match.topic.title}.`;
  };
  const respond=async(question,requestedIntent="question")=>{
    panel.classList.add("is-loading");
    setFace("thinking");
    status.textContent="Analitzant el camp seleccionat…";
    await new Promise(resolve=>setTimeout(resolve,430));
    const fieldContext=activeFieldContext(question);
    if(fieldContext){
      const intent=inferIntent(question,requestedIntent);
      respondField(fieldContext,intent);
      cite(fieldContext.profile.sources||FIELDS.defaultSources||[]);
      status.textContent=`Ajuda específica per a «${fieldContext.title}» · base local ${FIELDS.version||""}.`;
    }else if(active){
      show(`He detectat el camp «${label(active)}», però encara no té una regla específica configurada. No et donaré una explicació general de tota la fitxa com si fos una resposta d’aquest camp.`,"warning");
      cite([]);
      setFace("warning");
      status.textContent="Camp sense regla específica.";
    }else{
      respondTopic(question);
    }
    panel.classList.remove("is-loading");
  };
  const updateActiveField=field=>{
    active=field;
    const profile=profileForField(field);
    context.textContent=profile?`Camp actiu: ${profileTitle(profile,field)}`:`Camp actiu: ${label(field)}`;
    setFace("attentive");
  };
  const scheduleIdleExpression=()=>{
    clearInterval(window.__barrysIdleInterval);
    window.__barrysIdleInterval=setInterval(()=>{
      if(panel.classList.contains("is-open")||document.hidden||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
      setFace("thinking");
      clearTimeout(idleReturnTimer);
      idleReturnTimer=setTimeout(()=>setFace("attentive"),1100);
    },8500);
  };

  launcher.addEventListener("click",()=>{
    const willOpen=!panel.classList.contains("is-open");
    open(willOpen);
    setFace(willOpen?"attentive":"happy");
    if(!willOpen)setTimeout(()=>setFace("attentive"),900);
  });
  close.addEventListener("click",()=>{
    open(false);
    setFace("happy");
    setTimeout(()=>setFace("attentive"),900);
  });
  document.addEventListener("focusin",event=>{
    const field=event.target.closest?.("textarea,input:not([type=hidden]):not([type=button]):not([type=submit]),select");
    if(field&&!panel.contains(field))updateActiveField(field);
  });
  panel.addEventListener("click",event=>{
    const button=event.target.closest("[data-barrys-action]");
    if(!button)return;
    const prompts={explain:"què he de posar en aquest camp",missing:"què falta en aquest camp",structure:"estructura del camp",review:"revisió del camp"};
    respond(prompts[button.dataset.barrysAction]||"ajuda",button.dataset.barrysAction);
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const question=input.value.trim();
    if(!question)return;
    input.value="";
    respond(question,"question");
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      open(false);
      setFace("attentive");
    }
  });
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)setFace(panel.classList.contains("is-open")?"attentive":"attentive");
  });

  status.textContent=`Base documental ${KB.version} · ajuda contextual ${FIELDS.version||""} · sense API.`;
  setFace("attentive");
  scheduleIdleExpression();
})();
