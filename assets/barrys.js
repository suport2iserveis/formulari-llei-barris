(()=>{
  "use strict";

  const $=id=>document.getElementById(id);
  const launcher=$("barrys-launcher");
  const panel=$("barrys-panel");
  const close=$("barrys-close");
  const context=$("barrys-context");
  const answer=$("barrys-answer");
  const sources=$("barrys-sources");
  const status=$("barrys-status");
  const stage=$("barrys-stage");
  const llbRoot=$("llb-budget-form");
  const KB=window.BARRYS_KNOWLEDGE||{topics:[],fallback:"No disposo d’una resposta validada per a aquesta consulta."};
  const FIELDS=window.BARRYS_FIELDS||{byId:{},byClass:{},defaultSources:[]};
  const FACE_STATES=new Set(["attentive","thinking","explaining","happy","warning","curious","encouraging","guiding"]);

  let active=null;
  let pendingConfirmation=null;
  let collaboratorScopeAnnounced=false;
  let lastProblem=null;
  const deferredIssues=new Map();
  const motion={x:0,y:0,targetX:0,targetY:0,vx:0,vy:0,frame:0};

  const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const words=s=>new Set(norm(s).replace(/[^a-z0-9·]+/g," ").split(/\s+/).filter(w=>w.length>2));
  const unique=list=>[...new Set((list||[]).filter(Boolean))];
  const fieldYear=field=>(field?.id?.match(/(20\d{2})$/)||[])[1]||"";
  const fieldValue=field=>{
    if(!field)return"";
    if(field.type==="checkbox")return field.checked?"1":"";
    return String(field.value||"").trim();
  };
  const fieldKey=field=>{
    const actionCode=String(document.getElementById("llb-generated-code")?.value||"nova-fitxa").trim()||"nova-fitxa";
    if(field?.id)return `${actionCode}:${field.id}`;
    const className=field?.classList?.[0];
    if(className)return `${actionCode}:${className}:${[...document.querySelectorAll(`.${CSS.escape(className)}`)].indexOf(field)}`;
    return `${actionCode}:${field?.name||field?.tagName||"field"}:${validationFields().indexOf(field)}`;
  };
  const issueLabels={empty:"Buit",insufficient:"Insuficient",incoherent:"Incoherent"};
  const problemKind=(profile,field,issues=[])=>{
    if(!issues.length)return"insufficient";
    if(!fieldValue(field))return"empty";
    const incoherentRules=new Set(["pattern","patternUnlessNone","range","allocationSum","otherNotAboveAnnual","sameUnitAsCurrent","nonBinary"]);
    const failedRules=(profile?.rules||[]).filter(rule=>issues.includes(rule.message));
    return failedRules.some(rule=>incoherentRules.has(rule.type))?"incoherent":"insufficient";
  };
  const decorateProblem=(field,profile,title,issues,forcedKind)=>({
    field,profile,title,issues,
    kind:forcedKind||problemKind(profile,field,issues),
    key:fieldKey(field)
  });
  const problemCounts=problems=>(problems||[]).reduce((counts,problem)=>{
    counts[problem.kind]=(counts[problem.kind]||0)+1;
    return counts;
  },{empty:0,insufficient:0,incoherent:0});
  const countsText=problems=>{
    const counts=problemCounts(problems);
    return `${counts.empty} ${counts.empty===1?"buit":"buits"} · ${counts.insufficient} ${counts.insufficient===1?"insuficient":"insuficients"} · ${counts.incoherent} ${counts.incoherent===1?"incoherent":"incoherents"}`;
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
    const row=field?.closest?.(".llb-indicator-row, .llb-image-card");
    let position="";
    if(row){
      const selector=row.classList.contains("llb-image-card")?".llb-image-card":".llb-indicator-row";
      const rows=[...row.parentElement.querySelectorAll(`:scope > ${selector}`)];
      const index=rows.indexOf(row);
      if(index>=0)position=` · ${row.classList.contains("llb-image-card")?"imatge":"indicador"} ${index+1}`;
    }
    return `${profile?.title||label(field)}${year?` · ${year}`:""}${position}`;
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

  const reducedMotion=()=>Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const runStageMotion=()=>{
    if(!stage)return;
    if(reducedMotion()){
      motion.x=motion.targetX;
      motion.y=motion.targetY;
      motion.vx=0;
      motion.vy=0;
    }else{
      motion.vx=(motion.vx+(motion.targetX-motion.x)*.032)*.82;
      motion.vy=(motion.vy+(motion.targetY-motion.y)*.032)*.82;
      motion.x+=motion.vx;
      motion.y+=motion.vy;
    }
    stage.style.transform=`translate3d(${motion.x.toFixed(2)}px,${motion.y.toFixed(2)}px,0)`;
    const moving=Math.abs(motion.targetX-motion.x)>.15||Math.abs(motion.targetY-motion.y)>.15||Math.abs(motion.vx)>.08||Math.abs(motion.vy)>.08;
    stage.classList.toggle("is-gliding",moving);
    motion.frame=moving?requestAnimationFrame(runStageMotion):0;
  };
  const moveStage=(x,y,side)=>{
    motion.targetX=Number.isFinite(x)?x:0;
    motion.targetY=Number.isFinite(y)?y:0;
    if(side)stage?.classList.toggle("is-left",side==="left");
    if(!motion.frame)motion.frame=requestAnimationFrame(runStageMotion);
  };
  const restingPosition=()=>moveStage(0,0,"right");
  const glideNearField=(field,{guided=false}={})=>{
    if(!stage||!guided||reducedMotion())return;
    const rect=field?.getBoundingClientRect?.();
    if(!rect)return;
    const compact=window.matchMedia?.("(max-width: 620px)").matches;
    const stageHeight=stage.classList.contains("is-expanded")?(compact?110:127):(compact?87:100);
    const naturalTop=window.innerHeight-18-stageHeight;
    const desiredTop=Math.max(12,Math.min(window.innerHeight-stageHeight-12,rect.top+rect.height/2-stageHeight/2));
    const moveToLeft=rect.left+rect.width/2>window.innerWidth*.62;
    const stageWidth=stage.classList.contains("is-expanded")?(compact?106:122):(compact?84:96);
    const leftOffset=-(Math.max(0,window.innerWidth-stageWidth-44));
    moveStage(moveToLeft?leftOffset:0,desiredTop-naturalTop,moveToLeft?"left":"right");
  };
  const applyRigState=object=>{
    const rig=object?.contentDocument?.documentElement;
    if(!rig)return;
    const face=FACE_STATES.has(object.dataset.barrysFace)?object.dataset.barrysFace:"attentive";
    rig.removeAttribute("data-barry-state");
    if(!reducedMotion())void rig.getBoundingClientRect();
    rig.dataset.barryState=reducedMotion()?"attentive":face;
  };
  const setFace=(requested="attentive")=>{
    const face=FACE_STATES.has(requested)?requested:"attentive";
    panel.dataset.barrysState=face;
    document.querySelectorAll(".barrys-rig-object").forEach(object=>{
      object.dataset.barrysFace=face;
      applyRigState(object);
    });
  };
  const open=value=>{
    panel.classList.toggle("is-open",value);
    stage?.classList.toggle("is-expanded",value);
    panel.setAttribute("aria-hidden",String(!value));
    launcher.setAttribute("aria-expanded",String(value));
    if(value){
      restingPosition();
    }
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
  const clearFieldError=field=>{
    if(!field)return;
    field.classList.remove("barrys-field-invalid");
    field.removeAttribute("aria-invalid");
    const describedBy=(field.getAttribute("aria-describedby")||"").split(/\s+/).filter(id=>id&&!id.startsWith("barrys-error-"));
    if(describedBy.length)field.setAttribute("aria-describedby",describedBy.join(" "));
    else field.removeAttribute("aria-describedby");
    field.closest(".llb-field, label, .form-label, .llb-indicator-row, .llb-year-row")
      ?.querySelectorAll(":scope > .barrys-field-error")
      .forEach(node=>node.remove());
  };
  const markFieldError=(field,messages,kind="insufficient")=>{
    clearFieldError(field);
    const container=field.closest(".llb-field, label, .form-label, .llb-indicator-row, .llb-year-row")||field.parentElement;
    if(!container)return;
    const message=document.createElement("div");
    const errorId=`barrys-error-${field.id||Math.random().toString(36).slice(2)}`;
    message.id=errorId;
    message.className="barrys-field-error";
    message.dataset.barrysKind=kind;
    message.setAttribute("role","alert");
    message.innerHTML=`<strong>${issueLabels[kind]||"Revisió"} · Barry et demana que revisis aquest camp</strong><span>${messages.map(item=>String(item).replace(/[<>&]/g,char=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[char]))).join("<br>")}</span>`;
    container.append(message);
    field.classList.add("barrys-field-invalid");
    field.setAttribute("aria-invalid","true");
    field.setAttribute("aria-describedby",unique([...(field.getAttribute("aria-describedby")||"").split(/\s+/).filter(Boolean),errorId]).join(" "));
  };
  const validationFields=()=>[
    ...Object.keys(FIELDS.byId||{}).map(id=>document.getElementById(id)).filter(Boolean),
    ...Object.keys(FIELDS.byClass||{}).flatMap(className=>[...document.querySelectorAll(`.${CSS.escape(className)}`)])
  ].filter((field,index,array)=>array.indexOf(field)===index);
  const isEditableForValidation=field=>{
    if(!field||field.disabled)return false;
    if(llbRoot?.classList.contains("llb-collaborator-mode")){
      const panelElement=field.closest(".llb-tab-panel");
      if(panelElement?.classList.contains("is-readonly-section"))return false;
    }
    return !field.readOnly||field.classList.contains("llb-readonly");
  };
  const activateField=field=>{
    const panelElement=field.closest(".llb-tab-panel");
    if(panelElement?.hidden){
      const tab=document.querySelector(`.llb-tab[data-tab="${CSS.escape(panelElement.dataset.panel||"")}"]`);
      tab?.click();
    }
    open(true);
    updateActiveField(field);
    glideNearField(field,{guided:true});
    setFace("guiding");
    window.setTimeout(()=>{
      field.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
      window.setTimeout(()=>glideNearField(field,{guided:true}),260);
      if(!field.readOnly&&!field.disabled)field.focus({preventScroll:true});
    },80);
  };
  const inspectCurrent=()=>{
    const problems=[];
    validationFields().forEach(field=>{
      if(!isEditableForValidation(field))return;
      const profile=profileForField(field);
      const issues=ruleIssues(profile,field);
      if(issues.length){
        problems.push(decorateProblem(field,profile,profileTitle(profile,field),issues));
      }
    });
    const addIndicator=document.getElementById("llb-add-indicator");
    if(!document.querySelector(".llb-indicator-row")&&isEditableForValidation(addIndicator)){
      const field=document.getElementById("llb-add-indicator");
      const profile={title:"Indicadors de l’actuació",sources:FIELDS.defaultSources||[]};
      const issues=["Falta afegir almenys un indicador complet per mesurar l’execució o els resultats de l’actuació."];
      if(field){
        problems.push(decorateProblem(field,profile,profile.title,issues,"empty"));
      }
    }
    return{valid:problems.length===0,problems};
  };
  const validateCurrent=({focus=true,announce=true,mark=true}={})=>{
    validationFields().forEach(clearFieldError);
    const inspection=inspectCurrent();
    const problems=inspection.problems;
    if(mark)problems.forEach(problem=>markFieldError(problem.field,problem.issues,problem.kind));
    if(!announce)return inspection;
    if(!problems.length){
      show("La fitxa no presenta mancances ni incoherències segons les comprovacions configurades. Això no substitueix la revisió de la veracitat de les dades.","local");
      cite(FIELDS.defaultSources||[]);
      setFace("happy");
      return{valid:true,problems:[]};
    }
    const first=problems[0];
    lastProblem=first;
    const limited=llbRoot?.classList.contains("llb-collaborator-mode");
    const pending=problems.slice(0,30).map(problem=>`• ${issueLabels[problem.kind]} · ${problem.title}: ${problem.issues.join(" ")}`).join("\n");
    const omitted=problems.length>30?`\n• …i ${problems.length-30} camps més.`:"";
    show(
      `${limited?"He revisat només els apartats que tens habilitats en aquesta fitxa d’edició limitada.":"He revisat els camps editables de la fitxa."}\n\n`+
      `Hi ha ${problems.length} ${problems.length===1?"camp pendent":"camps pendents"} (${countsText(problems)}):\n${pending}${omitted}\n\n`+
      `Primer camp a corregir: «${first.title}».\n${bulletList(first.issues)}\n\n`+
      `${focus?"L’he ressaltat en groc i t’hi he portat. ":""}Revisa l’avís abans de decidir si vols continuar.`,
      "warning"
    );
    setFace("warning");
    cite(first.profile?.sources||FIELDS.defaultSources||[]);
    if(focus)activateField(first.field);
    return{valid:false,problems};
  };
  const clearConfirmation=resolution=>{
    const current=pendingConfirmation;
    pendingConfirmation=null;
    panel.querySelector(".barrys-confirmation")?.remove();
    if(current&&typeof resolution==="boolean")current.resolve(resolution);
  };
  const askConfirmation=(kind,result,extraProblems=[])=>{
    clearConfirmation(false);
    const isSend=kind==="send";
    const problemLines=result.problems.slice(0,8).map(problem=>`• ${issueLabels[problem.kind]} · ${problem.title}`).join("\n");
    const omitted=result.problems.length>8?`\n• …i ${result.problems.length-8} camps més.`:"";
    const globalLine=extraProblems.length?`\n\nAvisos d’altres fitxes o del projecte: ${extraProblems.length}.`:"";
    show(
      `${isSend?"Resum abans d’enviar":"Resum abans de desar"}: ${result.problems.length?countsText(result.problems):"cap camp pendent"}.`+
      `${problemLines?`\n\n${problemLines}${omitted}`:"\n\nLa fitxa supera les comprovacions locals configurades."}${globalLine}\n\n`+
      "Barry no ha modificat cap dada. Tu decideixes si continues o tornes al formulari.",
      result.problems.length||extraProblems.length?"warning":"local"
    );
    const box=document.createElement("div");
    box.className="barrys-confirmation";
    box.setAttribute("role","group");
    box.setAttribute("aria-label",isSend?"Confirmació de l’enviament":"Confirmació del desament");
    const question=document.createElement("p");
    question.textContent=isSend?"Segur que vols enviar les fitxes?":"Segur que vols desar la fitxa?";
    const actions=document.createElement("div");
    actions.className="barrys-confirmation-actions";
    const confirm=document.createElement("button");
    confirm.type="button";
    confirm.className="barrys-confirm-primary";
    confirm.textContent=isSend?"Sí, envia":"Sí, desa";
    const modify=document.createElement("button");
    modify.type="button";
    modify.className="barrys-confirm-secondary";
    modify.textContent="No, modifica";
    actions.append(confirm,modify);
    box.append(question,actions);
    answer.insertAdjacentElement("afterend",box);
    open(true);
    setFace("warning");
    return new Promise(resolve=>{
      pendingConfirmation={resolve,kind};
      confirm.addEventListener("click",()=>{
        pendingConfirmation=null;
        box.remove();
        setFace("happy");
        resolve(true);
      });
      modify.addEventListener("click",()=>{
        pendingConfirmation=null;
        box.remove();
        setFace("encouraging");
        const first=result.problems[0];
        lastProblem=first||lastProblem;
        if(first)activateField(first.field);
        resolve(false);
      });
      modify.focus({preventScroll:true});
    });
  };
  const guardCurrent=({kind="save",extraProblems=[],externalField=null,externalMessage=""}={})=>{
    const result=validateCurrent({focus:true,announce:true,mark:true});
    if(result.valid&&extraProblems.length){
      show(`Barry ha detectat ${extraProblems.length} ${extraProblems.length===1?"avís":"avisos"} en el conjunt de fitxes. Revisa’ls abans de continuar.`,"warning");
      setFace("warning");
      if(externalField){
        const issues=[externalMessage||extraProblems[0]||"Revisa aquest camp abans de continuar."];
        markFieldError(externalField,issues);
        result.problems.push(decorateProblem(
          externalField,
          profileForField(externalField),
          profileTitle(profileForField(externalField),externalField),
          issues,
          "incoherent"
        ));
        activateField(externalField);
      }
    }
    return askConfirmation(kind,result,extraProblems);
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
  const isFirstOfClass=(field,className)=>document.querySelector(`.${CSS.escape(className)}`)===field;
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
          failed=isFirstOfClass(field,"llb-structure-year")&&!document.querySelector(".llb-structure-year:checked");
          break;
        case"allocationSum":{
          const total=[...document.querySelectorAll(".llb-allocation")].reduce((sum,control)=>sum+(parseNumber(control.value)||0),0);
          failed=isFirstOfClass(field,"llb-allocation")&&Math.abs(total-100)>=0.001;
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
  const minimumLengthRule=profile=>(profile?.rules||[]).find(rule=>rule.type==="minLength"||rule.type==="minLengthIfValue");
  const requiredRules=profile=>(profile?.rules||[]).filter(rule=>
    ["required","positiveInteger","positiveNumber","atLeastOneYear","requiredIfAllocated","amountIfAllocated"].includes(rule.type)
  );
  const lengthField=({profile,field,title})=>{
    const technicalMaximum=field?.maxLength>0?field.maxLength:null;
    const minimum=minimumLengthRule(profile);
    const parts=[`Longitud de «${title}»:`,``];
    if(profile.lengthGuidance)parts.push(profile.lengthGuidance);
    else if(technicalMaximum)parts.push(`El formulari admet com a màxim ${technicalMaximum} caràcters.`);
    else parts.push("El formulari no fixa cap límit màxim de paraules o caràcters per a aquest camp.");
    if(minimum){
      parts.push(
        "",
        `La comprovació local avisa si ${minimum.type==="minLengthIfValue"?"l’emplenes amb menys de":"té menys de"} ${minimum.value} caràcters. És un llindar de control de qualitat de Barry, no un límit normatiu ni una extensió obligatòria.`
      );
    }
    if(!profile.lengthGuidance){
      parts.push("La resposta ha de ser tan breu com sigui possible, però prou completa per incorporar els elements exigits del camp.");
    }
    return parts.join("\n");
  };
  const requiredField=({profile,field,title})=>{
    const rules=requiredRules(profile);
    if(!rules.length)return `Obligatorietat de «${title}»:\n\nBarry no té configurada una obligació general per a aquest camp. Pot ser opcional o dependre del context de l’actuació.`;
    const conditional=rules.some(rule=>["requiredIfAllocated","amountIfAllocated"].includes(rule.type));
    if(conditional){
      const allocation=parseNumber(relatedAllocation(field)?.value||"0");
      return `Obligatorietat de «${title}»:\n\nÉs obligatori quan aquesta anualitat té pressupost assignat.${allocation>0?" En el formulari actual hi ha assignació, per tant l’has de completar.":" Ara mateix no hi detecto assignació pressupostària."}`;
    }
    return `Obligatorietat de «${title}»:\n\nSí, aquest camp està configurat com a obligatori per poder considerar completa la fitxa.`;
  };
  const formatField=({profile,title})=>{
    if(profile.structure)return `Format recomanat per a «${title}»:\n\n${profile.structure}`;
    if(profile.include?.length===1)return `Format de «${title}»:\n\n${profile.include[0]}`;
    return `Format recomanat per a «${title}»:\n\n${(profile.include||[]).map((item,index)=>`${index+1}. ${item}`).join("\n")}`;
  };
  const selectedText=id=>{
    const control=document.getElementById(id);
    return String(control?.selectedOptions?.[0]?.textContent||control?.value||"").trim();
  };
  const actionContext=()=>unique([selectedText("llb-area"),selectedText("llb-subarea"),selectedText("llb-type")].filter(value=>value&&!/^selecciona/i.test(value))).join(" · ");
  const contextualTemplate=title=>{
    const area=norm(selectedText("llb-area"));
    const isDiagnosis=/diagnosi/.test(norm(title));
    const isObjective=/objectiu/.test(norm(title));
    const isDescription=/descripcio|titol/.test(norm(title));
    if(!isDiagnosis&&!isObjective&&!isDescription)return"";
    if(/fisic|urban|habitatge/.test(area)){
      if(isDiagnosis)return"A [àmbit concret], [font i any] identifica [problema mesurable], que afecta [població o espai] i justifica intervenir sobre [element físic].";
      if(isObjective)return"Millorar [condició urbana o residencial mesurable] de [àmbit] abans de [data], passant de [valor inicial] a [valor objectiu].";
      return"Intervenció sobre [espai o edifici] que inclou [actuacions principals], beneficia [destinataris] i assoleix [resultat verificable].";
    }
    if(/ecologic|ambient|energet|clim/.test(area)){
      if(isDiagnosis)return"Les dades de [font i any] mostren [consum, emissió o risc climàtic] de [valor] a [àmbit], amb impacte sobre [col·lectiu o sistema].";
      if(isObjective)return"Reduir [consum, emissions o vulnerabilitat] de [valor inicial] a [valor objectiu] abans de [data].";
      return"Actuació de [renaturalització, eficiència o adaptació] a [àmbit], amb [accions] i mesura mitjançant [indicador].";
    }
    if(/social|comunit|socio/.test(area)){
      if(isDiagnosis)return"A [àmbit], [font i any] registra [necessitat social mesurable] en [col·lectiu], amb una cobertura actual de [valor].";
      if(isObjective)return"Augmentar [participació, cobertura o resultat social] de [valor inicial] a [valor objectiu] en [col·lectiu] abans de [data].";
      return"Programa adreçat a [col·lectiu] que desplega [activitats], amb [agents] i un resultat esperat de [valor mesurable].";
    }
    return"";
  };
  const exampleField=({profile,title})=>{
    const contextNow=actionContext();
    const template=contextualTemplate(title);
    const example=profile.example||template;
    if(example)return `Exemple orientatiu per a «${title}»${contextNow?`\nContext actual: ${contextNow}`:""}:\n\n${example}\n\nEls claudàtors indiquen dades que has de substituir. Adapta’l sempre a l’actuació real; Barry no inserirà ni modificarà el text.`;
    return `No tinc configurat un exemple validat específic per a «${title}». Puc explicar-te el contingut o l’estructura, però no inventaré dades ni una redacció que pugui semblar real.`;
  };
  const sourceField=({profile,title})=>{
    const used=unique(profile.sources||FIELDS.defaultSources||[]);
    return used.length
      ? `Fonts configurades per a «${title}»:\n\n${bulletList(used)}`
      : `No hi ha una font documental específica configurada per a «${title}».`;
  };
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
    if(/com de llarg|quina llargada|extensio|quantes paraules|nombre de paraules|quants caracters|limit de (paraules|caracters)|maxim de (paraules|caracters)|minim de (paraules|caracters)/.test(q))return"length";
    if(/obligatori|obligatoria|cal omplir|he d['’]?omplir|pot quedar buit|puc deixar.*buit/.test(q))return"required";
    if(/quin format|com ho (he de|haig de) presentar|en quin format|format ha de tenir/.test(q))return"format";
    if(/exemple|posa['’]?m un exemple|mostra['’]?m un exemple/.test(q))return"example";
    if(/quina font|quines fonts|d['’]?on surt|base normativa|normativa aplicable/.test(q))return"source";
    if(/que falta|què falta|manca|mancances|incomplet|pendent/.test(q))return"missing";
    if(/revisa|revisio|correcte|comprova|valida/.test(q))return"review";
    if(/estructura|ordre|organitza|esquema/.test(q))return"structure";
    return"explain";
  };
  const respondField=(fieldContext,intent)=>{
    if(intent==="length"){
      show(lengthField(fieldContext),"local");
      setFace("explaining");
      return;
    }
    if(intent==="required"){
      show(requiredField(fieldContext),"local");
      setFace("explaining");
      return;
    }
    if(intent==="format"){
      show(formatField(fieldContext),"local");
      setFace("explaining");
      return;
    }
    if(intent==="example"){
      show(exampleField(fieldContext),fieldContext.profile.example?"local":"warning");
      setFace(fieldContext.profile.example?"explaining":"warning");
      return;
    }
    if(intent==="source"){
      show(sourceField(fieldContext),"local");
      setFace("explaining");
      return;
    }
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
    const asksAll=requestedIntent==="all-missing"||/quins? camps|tots? els camps|camps? (buits|pendents|incomplets)|que em queda per omplir|què em queda per omplir/.test(norm(question));
    if(asksAll){
      validateCurrent({focus:false});
      panel.classList.remove("is-loading");
      status.textContent=llbRoot?.classList.contains("llb-collaborator-mode")
        ?"Revisió dels camps habilitats en l’edició limitada."
        :"Revisió completa dels camps editables.";
      return;
    }
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
  const currentProblem=()=>{
    const result=inspectCurrent();
    if(lastProblem){
      const refreshed=result.problems.find(problem=>problem.key===lastProblem.key);
      if(refreshed)return refreshed;
    }
    if(active){
      const matching=result.problems.find(problem=>problem.field===active);
      if(matching)return matching;
    }
    return result.problems.find(problem=>!deferredIssues.has(problem.key))||result.problems[0]||null;
  };
  const goToCurrentProblem=()=>{
    const problem=currentProblem();
    if(problem){
      lastProblem=problem;
      markFieldError(problem.field,problem.issues,problem.kind);
      show(`Et porto a «${problem.title}».\n\n${issueLabels[problem.kind]}: ${problem.issues.join(" ")}`,"warning");
      status.textContent="Navegació directa al camp que cal revisar.";
      activateField(problem.field);
      return;
    }
    if(active){
      show(`Et torno al camp actiu «${profileTitle(profileForField(active),active)}».`,"local");
      activateField(active);
      return;
    }
    showNextStep();
  };
  const deferCurrentProblem=()=>{
    const problem=currentProblem();
    if(!problem){
      show("No hi ha cap incidència pendent per ajornar.","local");
      setFace("happy");
      return;
    }
    deferredIssues.set(problem.key,{value:fieldValue(problem.field),title:problem.title});
    clearFieldError(problem.field);
    lastProblem=null;
    const remaining=inspectCurrent().problems.filter(item=>!deferredIssues.has(item.key));
    show(
      `He apartat temporalment «${problem.title}» de la cua guiada. Tornarà a aparèixer si modifiques el camp i sempre es revisarà abans de desar o enviar.`+
      `\n\nQueden ${remaining.length} ${remaining.length===1?"incidència activa":"incidències actives"}.`,
      "local"
    );
    status.textContent="Incidència ajornada només en la navegació guiada.";
    setFace("encouraging");
  };
  const guideToControl=(control)=>{
    if(!control)return;
    open(true);
    glideNearField(control,{guided:true});
    setFace("guiding");
    window.setTimeout(()=>{
      control.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"center"});
      window.setTimeout(()=>glideNearField(control,{guided:true}),260);
      if(!control.disabled)control.focus({preventScroll:true});
    },80);
  };
  const collaboratorCatalog={
    tecnica:{
      title:"Contingut tècnic",
      fields:"diagnosi, objectius, descripció, col·lectius destinataris, agents implicats, organisme responsable, entitats col·laboradores i observacions"
    },
    imatges:{
      title:"Emplaçament i imatges",
      fields:"descripció de l’emplaçament, imatges, peus de foto, autoria i text alternatiu"
    },
    pressupost:{
      title:"Calendari i pressupost",
      fields:"tipus d’actuació, anualitats, fases, percentatges, imports i fonts de finançament"
    },
    indicadors:{
      title:"Indicadors",
      fields:"tipus, fase, descripció, valor actual i valor objectiu de cada indicador"
    }
  };
  const readCollaboratorScope=()=>{
    try{return JSON.parse(llbRoot?.dataset?.barryCollaboratorScope||"null")}catch{return null}
  };
  const showCollaboratorScope=({autoOpen=false}={})=>{
    const scope=readCollaboratorScope();
    const button=panel.querySelector('[data-barrys-action="collaborator-fields"]');
    if(button)button.hidden=!scope;
    if(!scope)return;
    const code=scope.actionCode?` de la fitxa ${scope.actionCode}`:" d’aquesta fitxa";
    if(scope.status==="pendent_revisio"){
      show(`La versió${code} ja s’ha enviat a revisió. Ara els camps estan bloquejats fins que iServeis la revisi.`,"local");
      setFace("happy");
    }else if(!scope.editableBlocks?.length){
      show(`Aquesta és una vista de consulta${code}. iServeis no t’ha assignat cap camp editable.`,"local");
      setFace("attentive");
    }else{
      const rows=scope.editableBlocks.map(block=>{
        const item=collaboratorCatalog[block];
        return item?`• ${item.title}: ${item.fields}.`:`• ${block}.`;
      }).join("\n");
      show(
        `En l’edició limitada${code}, iServeis et demana que completis només:\n\n${rows}\n\n`+
        "La resta de camps són només de consulta i Barry no els inclourà en la revisió.",
        "local"
      );
      setFace("guiding");
    }
    cite([]);
    status.textContent="Permisos i camps a completar indicats per iServeis.";
    if(autoOpen)open(true);
  };
  const showNextStep=()=>{
    clearConfirmation(false);
    setFace("curious");
    const result=validateCurrent({focus:false,announce:false,mark:false});
    const outstanding=result.problems.filter(problem=>!deferredIssues.has(problem.key));
    if(outstanding.length){
      validationFields().forEach(clearFieldError);
      const first=outstanding[0];
      lastProblem=first;
      markFieldError(first.field,first.issues,first.kind);
      show(
        `El següent pas és completar «${first.title}».\n\nTipus: ${issueLabels[first.kind]}.\n${bulletList(first.issues)}\n\n`+
        "T’hi porto ara i el deixo remarcat en groc.",
        "warning"
      );
      cite(first.profile?.sources||FIELDS.defaultSources||[]);
      status.textContent="Següent pas: completar el primer camp pendent.";
      activateField(first.field);
      return;
    }
    if(!result.valid){
      show(
        `Has ajornat temporalment les ${result.problems.length} ${result.problems.length===1?"incidència pendent":"incidències pendents"}. `+
        "Pots continuar treballant, però Barry les tornarà a mostrar abans de desar o enviar.",
        "local"
      );
      status.textContent="No queden incidències actives a la cua guiada.";
      setFace("encouraging");
      return;
    }
    const scope=readCollaboratorScope();
    if(scope?.status==="pendent_revisio"){
      show("Ja has enviat aquesta versió a iServeis. El següent pas és esperar-ne la revisió a l’Studio.","local");
      setFace("happy");
      status.textContent="Versió pendent de revisió.";
      return;
    }
    const saveButton=document.getElementById("llb-save-action");
    const sendButton=document.getElementById("llb-send-project");
    const saveText=norm(document.getElementById("llb-save-status")?.textContent||"");
    const saved=/canvis desats|fitxa desada|projecte desat/.test(saveText);
    const actionCount=Number(document.getElementById("llb-project-count")?.textContent||0);
    if(!saved||actionCount<1){
      const labelText=saveButton?.textContent?.trim()||"Desar fitxa";
      show(`Aquesta fitxa ja supera les comprovacions configurades. El següent pas és prémer «${labelText}».`,"local");
      status.textContent="Següent pas: desar o actualitzar la fitxa.";
      guideToControl(saveButton);
      return;
    }
    show("La fitxa està desada. Si ja has completat totes les fitxes que et corresponen, el següent pas és prémer «Enviar a iServeis».","local");
    status.textContent="Següent pas: enviar les fitxes a iServeis.";
    guideToControl(sendButton);
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
  document.addEventListener("input",event=>{
    const field=event.target.closest?.("textarea,input,select");
    if(field){
      deferredIssues.delete(fieldKey(field));
      if(field.classList.contains("barrys-field-invalid"))clearFieldError(field);
    }
  });
  document.addEventListener("change",event=>{
    const field=event.target.closest?.("textarea,input,select");
    if(field){
      deferredIssues.delete(fieldKey(field));
      if(field.classList.contains("barrys-field-invalid"))clearFieldError(field);
    }
  });
  panel.addEventListener("click",event=>{
    const button=event.target.closest("[data-barrys-action]");
    if(!button)return;
    if(button.dataset.barrysAction==="next-step"){
      showNextStep();
      return;
    }
    if(button.dataset.barrysAction==="collaborator-fields"){
      showCollaboratorScope();
      return;
    }
    if(button.dataset.barrysAction==="goto"){
      goToCurrentProblem();
      return;
    }
    if(button.dataset.barrysAction==="defer"){
      deferCurrentProblem();
      return;
    }
    const prompts={explain:"què he de posar en aquest camp",example:"mostra’m un exemple orientatiu","all-missing":"quins camps em queden buits, insuficients o incoherents"};
    respond(prompts[button.dataset.barrysAction]||"ajuda",button.dataset.barrysAction);
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
  document.addEventListener("barry:collaborator-permissions",()=>{
    const autoOpen=!collaboratorScopeAnnounced;
    collaboratorScopeAnnounced=true;
    showCollaboratorScope({autoOpen});
  });

  document.querySelectorAll(".barrys-rig-object").forEach(object=>{
    object.addEventListener("load",()=>applyRigState(object));
    applyRigState(object);
  });
  status.textContent=`Base documental ${KB.version} · ajuda contextual ${FIELDS.version||""} · Barry definitiu articulat 6.0.1 · revisió local sense API.`;
  window.BARRYS_VALIDATOR=Object.freeze({validateCurrent,inspectCurrent,guardCurrent,clearFieldError,showNextStep,showCollaboratorScope,goToCurrentProblem,deferCurrentProblem});
  setFace("attentive");
  if(llbRoot?.classList.contains("llb-collaborator-mode")&&readCollaboratorScope()){
    collaboratorScopeAnnounced=true;
    showCollaboratorScope({autoOpen:true});
  }
  window.addEventListener("resize",()=>{
    if(!panel.classList.contains("is-open"))restingPosition();
  });
})();
