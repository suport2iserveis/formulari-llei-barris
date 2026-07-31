window.BARRYS_KNOWLEDGE=Object.freeze({
  version:"1.0 · documents 2025-2026",
  fallback:"No disposo d’una resposta prou fonamentada per a aquesta consulta. Utilitza una de les opcions d’ajuda guiada o consulta directament la documentació oficial. Barry no completarà buits amb informació inventada.",
  topics:[
    {
      id:"aae requisits delimitacio",
      title:"Àrea d’atenció especial: requisits i delimitació",
      keywords:["aae","àrea atenció especial","delimitació","perímetre","continuïtat","homogeneïtat","secció censal","agrupació censal","50 punts","renda"],
      guidance:"L’ÀAE ha de tenir una renda neta mitjana per persona inferior a la mitjana de Catalunya i assolir com a mínim 50 punts sobre 150 en els indicadors d’avaluació objectiva. Ha de presentar homogeneïtat i continuïtat espacial en termes físics, morfològics o socioeconòmics, i una dimensió poblacional raonable que permeti actuacions integrals viables. El perímetre el defineix l’ens local; per facilitar els càlculs, la guia recomana fer-lo coincidir amb una o més seccions censals o agrupacions censals, tot i que admet delimitacions parcials justificades.",
      structure:"1. Delimitació i continuïtat espacial.\n2. Població inclosa.\n3. Renda neta mitjana per persona i comparació amb Catalunya.\n4. Puntuació dels indicadors objectius.\n5. Justificació de la dimensió i viabilitat d’una intervenció integral.",
      checks:[
        {pattern:"renda|rnmp",message:"Falta justificar la renda neta mitjana per persona."},
        {pattern:"50|punts|indicador",message:"Falta acreditar la puntuació mínima dels indicadors."},
        {pattern:"continu|homog|coher|secció|agrupació",message:"Falta justificar la continuïtat i coherència espacial."}
      ],
      sources:["Decret 163/2025, annex I","Guia pràctica de sol·licitud, apartats 1-4","Guia del Pla de barris i viles 2026, apartats 1-4"]
    },
    {
      id:"renda sur seccions parcials",
      title:"Renda, SUR i seccions censals parcials",
      keywords:["renda","rnmp","sur","sòl ús residencial","secció parcial","ponderació","tcr","cobertes sòl","ine","idescat"],
      guidance:"La renda neta mitjana per persona s’ha de calcular amb la taula oficial i amb dades coherents amb el seccionat de referència. Si l’ÀAE incorpora parcialment una secció censal, la guia estableix l’ús del percentatge de sòl d’ús residencial inclòs per ponderar-la. Cal delimitar el polígon, identificar les cobertes de sòl residencials i documentar el càlcul. No s’ha d’aplicar una ponderació per superfície total sense distingir el sòl d’ús residencial.",
      structure:"1. Any i font de la renda.\n2. Codis territorials utilitzats.\n3. Seccions completes i parcials.\n4. Càlcul del SUR de cada secció parcial.\n5. Ponderació i resultat de l’ÀAE.\n6. Comparació amb la mitjana de Catalunya.",
      checks:[
        {pattern:"ine|idescat|font",message:"Falta identificar la font i l’any de les dades de renda."},
        {pattern:"sur|sòl d.ús residencial|residencial",message:"En una secció parcial cal explicitar el SUR utilitzat."},
        {pattern:"catalunya|mitjana",message:"Falta comparar el resultat amb la mitjana de Catalunya."}
      ],
      sources:["Guia pràctica de sol·licitud, apartat 3","Guia del Pla de barris i viles 2026, apartat 3"]
    },
    {
      id:"programa memoria pmii contingut",
      title:"Contingut del programa memòria d’intervenció integral",
      keywords:["pmii","programa memòria","memòria","contingut","estructura","documentació","fitxes"],
      guidance:"El PMII ha de definir i justificar l’ÀAE; formular l’estratègia, els objectius i les actuacions; explicar la coherència integral entre diagnosi i proposta; incloure fitxes d’actuació, pressupost global, pla financer i cronograma; definir governança, participació, seguiment i avaluació; i incorporar l’impacte de gènere i la igualtat de tracte i no-discriminació. Les actuacions s’han de concretar amb emplaçament, gestió, calendari, pressupost, finançament i indicadors.",
      structure:"1. ÀAE i diagnosi.\n2. Estratègia i objectius.\n3. Actuacions dels tres àmbits.\n4. Coherència i integralitat.\n5. Governança i participació.\n6. Pressupost, pla financer i cronograma.\n7. Indicadors, seguiment i avaluació.\n8. Impacte de gènere i no-discriminació.",
      checks:[
        {pattern:"diagnosi|problem",message:"Falta relacionar el PMII amb la diagnosi."},
        {pattern:"governança|particip",message:"Falta concretar governança o participació."},
        {pattern:"pressupost|cronograma|calendari",message:"Falta la planificació econòmica o temporal."}
      ],
      sources:["Decret 163/2025, article 13","Guia pràctica de sol·licitud, apartats 5-6"]
    },
    {
      id:"tres ambits integralitat",
      title:"Tres àmbits i caràcter integral",
      keywords:["tres àmbits","transformacions físiques","transició ecològica","acció sociocomunitària","integral","transversal","coherència"],
      guidance:"El PMII ha d’articular un conjunt coherent d’actuacions en els tres àmbits de la Llei: transformacions físiques, transició ecològica i acció sociocomunitària. No n’hi ha prou amb enumerar projectes: cal mostrar com cada actuació respon a una problemàtica diagnosticada, com es complementen entre elles i com contribueixen als objectius comuns de reducció de desigualtats, equitat territorial i adaptació climàtica.",
      structure:"Per a cada problema: problema diagnosticat → objectiu mesurable → actuacions coordinades dels àmbits A, B i C → indicadors de resultat i impacte.",
      checks:[
        {pattern:"físic|urban|habitat|equipament",message:"No es reconeix l’àmbit de transformacions físiques."},
        {pattern:"ecol|clim|verd|energia|mobilitat",message:"No es reconeix l’àmbit de transició ecològica."},
        {pattern:"social|comunit|educ|salut|ocupació",message:"No es reconeix l’àmbit d’acció sociocomunitària."}
      ],
      sources:["Decret 163/2025, article 2 i annex II","Convocatòria 2026, apartat 8","Paraules, frases clau i objectius d’iServeis"]
    },
    {
      id:"diagnosi necessitat problematica",
      title:"Diagnosi, necessitat i problemàtica",
      keywords:["diagnosi","necessitat","problema","context","situació actual","vulnerabilitat","desigualtat","dades"],
      guidance:"Descriu les problemàtiques amb dades verificables i territorialitzades, compara l’ÀAE amb el municipi i Catalunya quan sigui possible, identifica les fonts i explica els col·lectius afectats. La diagnosi ha de permetre entendre per què cal intervenir i ha d’enllaçar directament amb els objectius i les actuacions. Evita afirmacions genèriques que no estiguin acreditades.",
      structure:"1. Problema concret.\n2. Dada quantitativa, any i font.\n3. Comparació territorial.\n4. Incidència dins l’ÀAE.\n5. Col·lectius afectats.\n6. Conseqüències de no actuar.\n7. Resposta prevista.",
      checks:[
        {pattern:"\\d",message:"Falta almenys una dada quantitativa."},
        {pattern:"font|segons|dades de|registre|idescat|ine",message:"No s’identifica la font de les dades."},
        {pattern:"catalunya|municipi|mitjana|compar",message:"Falta una comparació territorial quan sigui possible."}
      ],
      sources:["Decret 163/2025, annexos I-II","Guia pràctica de sol·licitud","Paraules, frases clau i objectius d’iServeis"]
    },
    {
      id:"objectius",
      title:"Objectius del PMII i de les actuacions",
      keywords:["objectiu","finalitat","resultat","assolir","millorar","incrementar","reduir","quantificable"],
      guidance:"Formula els objectius com a canvis o resultats que es volen assolir, no com una mera llista de tasques. Han de respondre a la diagnosi, ser coherents amb els objectius de la Llei i permetre mesurar-ne l’assoliment. Sempre que sigui possible, concreta magnitud, població o territori destinatari i termini.",
      structure:"Verb de resultat + canvi esperat + població o territori destinatari + magnitud objectiu + termini + indicador associat.",
      checks:[
        {pattern:"millor|increment|redu|augment|garant|promou|afavor|assol|facilit",message:"L’objectiu no expressa clarament un canvi o resultat."},
        {pattern:"\\d|%|nombre|persones|m²|m2|termini|any",message:"L’objectiu no incorpora cap element mesurable o temporal."}
      ],
      sources:["Decret 163/2025, annex II","Paraules, frases clau i objectius d’iServeis"]
    },
    {
      id:"descripcio actuacio fitxa",
      title:"Descripció i fitxa de l’actuació",
      keywords:["descripció","actuació","proposta","treballs","fases","ubicació","destinataris","fitxa"],
      guidance:"La fitxa ha d’explicar què es farà, on, amb quin abast, per a qui, mitjançant quines fases i amb quins resultats. Ha de contenir dades identificatives, informació gràfica, detall tècnic, informació econòmica, calendari i indicadors. Diferencia clarament l’objectiu, les activitats o treballs i els resultats esperats.",
      structure:"1. Objecte i necessitat.\n2. Treballs i abast.\n3. Emplaçament.\n4. Població destinatària.\n5. Fases i forma de gestió.\n6. Calendari.\n7. Pressupost i finançament.\n8. Resultats i indicadors.",
      checks:[
        {pattern:"barri|aae|carrer|equipament|municipi|àmbit|zona",message:"Falta concretar l’emplaçament."},
        {pattern:"fase|primer|posterior|execució|redacció|licitació|obra|servei",message:"No es reconeixen les fases o els treballs."},
        {pattern:"resultat|indicador|objectiu",message:"Falta explicitar el resultat o la forma de mesurar-lo."}
      ],
      sources:["Decret 163/2025, article 13 i annex II","Guia pràctica de sol·licitud, apartat 6","Guia del Pla de barris i viles 2026, apartat 6"]
    },
    {
      id:"indicadors actuacions",
      title:"Indicadors de seguiment, resultat i impacte",
      keywords:["indicador","valor inicial","valor objectiu","unitat","seguiment","resultat","impacte","verificació","periodicitat"],
      guidance:"Cada indicador ha de ser quantificable i estar vinculat a un objectiu i una actuació. Defineix nom, tipus, fórmula o unitat, valor inicial, valor objectiu, font o mitjà de verificació i periodicitat. Distingeix els indicadors d’execució, que mesuren productes o activitats, dels de resultat o impacte, que mesuren canvis. Evita indicadors binaris de tipus Sí/No.",
      structure:"Nom · tipus (execució/resultat/impacte) · fórmula o unitat · valor inicial · valor objectiu · font de verificació · periodicitat · actuació i objectiu vinculats.",
      checks:[
        {pattern:"\\d",message:"No hi ha cap valor numèric."},
        {pattern:"%|nombre|número|persones|m²|m2|euros|€|hores|dies|unitats|índex",message:"Falta una unitat de mesura."},
        {pattern:"font|registre|certificat|informe|enquesta|acta|comptador",message:"Falta el mitjà de verificació."},
        {pattern:"inicial|base",message:"Falta el valor inicial o línia de base."},
        {pattern:"objectiu|meta",message:"Falta el valor objectiu."}
      ],
      sources:["Guia d’indicadors LLB 2026","Guia pràctica de sol·licitud, apartats 4 i 6","Guia del Pla de barris i viles 2026, apartat 7"]
    },
    {
      id:"pressupost pla financer",
      title:"Pressupost global i pla financer",
      keywords:["pressupost","pla financer","finançament","cofinançament","aportació municipal","cost","import","percentatge"],
      guidance:"El pressupost ha de ser realista, coherent amb les fitxes i el cronograma i ha de distingir les fonts de finançament. El percentatge concedit s’aplica a cadascuna de les actuacions. A la convocatòria 2026, el Fons finança el 50% per a municipis de més de 50.000 habitants; el 60% entre 20.000 i 50.000; el 70% entre 5.000 i 19.999; i el 75% per sota de 5.000. Excepcionalment, els municipis de menys de 5.000 habitants amb dificultats acreditades o condició rural poden sol·licitar el 90%.",
      structure:"1. Cost per actuació i capítol.\n2. Cost per anualitat.\n3. Percentatge i import del Fons.\n4. Aportació municipal.\n5. Altres fonts.\n6. Comprovació de coherència amb fitxes i cronograma.",
      checks:[
        {pattern:"€|euro|import|cost|pressupost",message:"Falta expressar l’import."},
        {pattern:"fons|generalitat|subvenció",message:"Falta la part finançada pel Fons."},
        {pattern:"municipal|ajuntament|cofinanç",message:"Falta l’aportació municipal o el cofinançament."}
      ],
      sources:["Convocatòria 2026, apartat 6","Decret 163/2025, article 6","Guia pràctica de sol·licitud, apartat 5"]
    },
    {
      id:"despeses subvencionables capitols oficina",
      title:"Despeses subvencionables i oficina local",
      keywords:["despesa","subvencionable","capítol 1","capítol 2","capítol 4","capítol 6","capítol 7","oficina local","8%","personal"],
      guidance:"Són subvencionables les despeses directament vinculades al PMII: capítol 1 per al personal de l’oficina local dedicat a la gestió i execució; capítol 2 per a béns i serveis; capítol 4 per a subvencions corrents; capítol 6 per a inversions, obres, adquisicions i redacció de projectes; i capítol 7 per a subvencions de capital. L’actuació d’oficina local pot incloure gestió, coordinació, comunicació, funcionament i equipament, però no pot superar el 8% del pressupost total del PMII.",
      structure:"Per a cada despesa: actuació vinculada · naturalesa · capítol pressupostari · import · anualitat · justificació de necessitat i relació directa amb el PMII.",
      checks:[
        {pattern:"capítol|capitol|1|2|4|6|7",message:"Falta identificar el capítol pressupostari."},
        {pattern:"actuació|pmii|direct",message:"Falta justificar la vinculació directa amb una actuació."}
      ],
      sources:["Convocatòria 2026, apartat 9","Decret 163/2025, article 7"]
    },
    {
      id:"cronograma termini execucio",
      title:"Cronograma i termini d’execució",
      keywords:["cronograma","calendari","termini","anualitat","execució","5 anys","8 anys","50%"],
      guidance:"Les actuacions s’han d’executar dins els cinc anys comptats des de la notificació de la resolució de concessió. El termini es pot ampliar fins a vuit anys si, al cap de quatre anys, s’ha executat el 50% del pressupost global del PMII. El cronograma ha de ser coherent amb les fases tècniques, la contractació, les anualitats pressupostàries i els indicadors d’execució.",
      structure:"Per actuació: preparació/projecte → contractació → execució → posada en servei → seguiment; indica inici, final, anualitat, fites i percentatge pressupostari executat.",
      checks:[
        {pattern:"any|mes|trimestre|inici|final",message:"Falta una referència temporal."},
        {pattern:"licitació|contractació|projecte|execució|servei",message:"Falten fases executables."}
      ],
      sources:["Convocatòria 2026, apartat 13","Decret 163/2025, article 3","Guia pràctica de sol·licitud, apartat 5"]
    },
    {
      id:"participacio ciutadana",
      title:"Participació ciutadana i acció comunitària",
      keywords:["participació","ciutadania","veïnat","entitats","coparticipació","empoderament","taula comunitària","retorn"],
      guidance:"La participació s’ha de concretar en agents, fases, canals, capacitat d’incidència i retorn. Cal explicar com el veïnat i els agents socials han participat en la diagnosi i el disseny i com mantindran un paper actiu durant l’execució, el seguiment i l’avaluació. Pot existir com a metodologia transversal i també com a actuació pròpia d’empoderament comunitari.",
      structure:"1. Agents i col·lectius, especialment vulnerables.\n2. Participació prèvia.\n3. Espais i tècniques durant l’execució.\n4. Decisions en què poden incidir.\n5. Retorn dels resultats.\n6. Indicadors de participació.",
      checks:[
        {pattern:"entitat|veïnat|ciutad|agent|col·lectiu",message:"Falta identificar qui participa."},
        {pattern:"taller|sessió|taula|enquesta|comissió|espai|canal",message:"Falten mecanismes concrets de participació."},
        {pattern:"retorn|seguiment|avaluació|decisió",message:"Falta explicar la incidència o el retorn."}
      ],
      sources:["Decret 163/2025, article 13 i annex II","Paraules, frases clau i objectius d’iServeis"]
    },
    {
      id:"governanca gestio",
      title:"Governança, gestió i capacitat d’execució",
      keywords:["governança","gestió","coordinació","responsable","oficina","comitè","seguiment","experiència","organigrama"],
      guidance:"Defineix una estructura de governança operativa: lideratge polític i tècnic, oficina local, responsables per actuació, coordinació interdepartamental, participació d’agents i mecanismes de decisió, seguiment i rendició de comptes. La valoració considera la qualitat tècnica, l’eficàcia, la viabilitat econòmica, l’experiència, la planificació, la governança, la participació i la col·laboració administrativa.",
      structure:"Òrgan · composició · funcions · periodicitat · decisions · informació que rep · relació amb altres òrgans · responsable de seguiment.",
      checks:[
        {pattern:"responsable|coordinador|oficina|equip",message:"Falta assignar responsabilitats."},
        {pattern:"reunió|periodicitat|mensual|trimestral|seguiment",message:"Falta concretar el funcionament."},
        {pattern:"decisió|funció|competència|tasca",message:"Falten funcions o mecanismes de decisió."}
      ],
      sources:["Decret 163/2025, articles 13, 15 i 16 i annex II","Guia pràctica de sol·licitud"]
    },
    {
      id:"genere igualtat discriminacio",
      title:"Impacte de gènere, igualtat i no-discriminació",
      keywords:["gènere","igualtat","dona","discriminació","interseccional","accessibilitat","inclusió","vulnerable"],
      guidance:"El PMII ha d’incloure un apartat específic sobre l’impacte de gènere i sobre la igualtat de tracte i no-discriminació. No ho limitis a una declaració genèrica: identifica desigualtats d’ús de l’espai, accés a serveis, seguretat, cures o participació; incorpora mesures correctores a les actuacions; i defineix indicadors desagregats quan sigui pertinent.",
      structure:"1. Desigualtat detectada.\n2. Col·lectius afectats.\n3. Impacte previst de l’actuació.\n4. Mesura correctora o preventiva.\n5. Participació dels col·lectius.\n6. Indicador de seguiment.",
      checks:[
        {pattern:"dona|gènere|sexe|col·lectiu|discrimin",message:"Falta identificar la desigualtat o el col·lectiu afectat."},
        {pattern:"mesura|acció|adapt|criteri",message:"Falta una mesura concreta."},
        {pattern:"indicador|%|nombre|desagreg",message:"Falta una forma de seguiment."}
      ],
      sources:["Decret 163/2025, article 13.2 i annex II","Paraules, frases clau i objectius d’iServeis"]
    },
    {
      id:"criteris valoracio puntuacio",
      title:"Criteris de valoració i puntuació",
      keywords:["valoració","puntuació","35 punts","100 punts","30 punts","50 punts","20 punts","innovació","qualitat"],
      guidance:"La valoració màxima del PMII és de 100 punts i cal assolir-ne com a mínim 35. Les característiques de l’ÀAE aporten fins a 30 punts; les actuacions, fins a 50 punts —15 per cadascun dels tres àmbits i 5 per coherència dels objectius amb la problemàtica i innovació—; i la metodologia, execució i gestió, fins a 20 punts. La redacció ha de facilitar la traçabilitat entre criteri, evidència i apartat de la memòria.",
      structure:"Per cada criteri: requisit o aspecte valorat → evidència concreta → apartat/document on consta → indicador o dada que l’acredita.",
      checks:[
        {pattern:"diagnosi|problem",message:"Falta evidenciar la coherència amb la problemàtica."},
        {pattern:"innov",message:"Falta explicar el grau d’innovació quan sigui aplicable."},
        {pattern:"viabil|pressupost|calendari|governança",message:"Falta acreditar metodologia o capacitat d’execució."}
      ],
      sources:["Decret 163/2025, article 14 i annex II","Convocatòria 2026, apartat 11"]
    },
    {
      id:"convocatoria 2026 termini sollicitud",
      title:"Convocatòria 2026: presentació i terminis",
      keywords:["convocatòria","2026","termini sol·licitud","eacat","presentació","6 juliol","17 juliol","bdns"],
      guidance:"La convocatòria anticipada 2026, referència BDNS 908285, estableix que les sol·licituds es presenten telemàticament mitjançant EACAT. El termini va del 6 al 17 de juliol de 2026. Aquesta dada correspon exclusivament a la convocatòria 2026 i s’ha de revisar si es treballa amb una convocatòria posterior.",
      structure:"Comprova: convocatòria i any · ens sol·licitant · formulari EACAT · documentació de l’article 9 del Decret · signatura competent · presentació dins termini.",
      checks:[
        {pattern:"eacat|telemàtic",message:"Falta indicar el canal de presentació."},
        {pattern:"6|17|juliol|termini",message:"Falta identificar el termini de la convocatòria 2026."}
      ],
      sources:["Resolució TER/1647/2026, termini i forma de presentació","Convocatòria 2026, apartat 7"]
    },
    {
      id:"pagaments bestreta justificacio",
      title:"Bestreta, pagaments i justificació",
      keywords:["bestreta","pagament","justificació","7,5%","15 març","15 setembre","compte justificatiu","liquidació"],
      guidance:"La convocatòria 2026 permet una bestreta de fins al 7,5% de la subvenció, que cal sol·licitar al formulari. Es poden presentar una o dues justificacions parcials anuals, abans del 15 de març i del 15 de setembre. La justificació final s’ha de presentar dins els tres mesos posteriors al final del període d’execució mitjançant compte justificatiu sense aportació inicial de justificants, sens perjudici del mostreig i dels requeriments de comprovació.",
      structure:"1. Bestreta sol·licitada.\n2. Calendari de justificacions parcials.\n3. Relació de despeses i memòria de resultats.\n4. Declaració d’Intervenció o Secretaria-Intervenció.\n5. Evidències de publicitat.\n6. Justificació final dins els tres mesos.",
      checks:[
        {pattern:"data|març|setembre|mes",message:"Falta planificar els terminis de justificació."},
        {pattern:"memòria|resultat|despesa|declaració",message:"Falta identificar la documentació justificativa."}
      ],
      sources:["Convocatòria 2026, apartats 14-15","Decret 163/2025, articles 27-28"]
    }
  ]
});
