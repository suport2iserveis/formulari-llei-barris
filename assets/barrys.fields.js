window.BARRYS_FIELDS=Object.freeze({
  version:"5.0",
  defaultSources:["Decret 163/2025, article 13.1.b","Guia pràctica de sol·licitud, apartat 6. Fitxes d’actuacions"],
  byId:{
    "llb-municipality":{
      title:"Municipi",
      include:["Selecciona el municipi sol·licitant de la llista desplegable; no n’hi ha prou d’escriure un text lliure.","Comprova que és el mateix ens local que consta a la resta de documents de la sol·licitud."],
      avoid:["Abreviatures, nuclis de població o noms que no coincideixin amb el municipi oficial."],
      rules:[{type:"required",message:"Falta seleccionar un municipi de la llista."}]
    },
    "llb-population":{
      title:"Població del municipi",
      readonly:true,
      include:["Aquest valor s’emplena automàticament després de seleccionar correctament el municipi.","Serveix per determinar el percentatge ordinari de finançament aplicable."],
      avoid:["No intentis introduir manualment una xifra en aquest camp."],
      rules:[{type:"required",message:"No s’ha carregat la població; torna a seleccionar el municipi."}]
    },
    "llb-standard-rate":{
      title:"Percentatge ordinari de finançament",
      readonly:true,
      include:["El formulari calcula automàticament el percentatge segons la població del municipi.","Verifica que el municipi seleccionat i la població mostrada siguin correctes."],
      avoid:["No confonguis el percentatge ordinari amb una eventual excepció, que requereix justificació específica."],
      rules:[{type:"required",message:"No s’ha calculat el percentatge; comprova el municipi."}]
    },
    "llb-area":{
      title:"Àmbit de l’actuació",
      include:["Selecciona un dels tres àmbits al qual correspon principalment l’actuació: transformacions físiques, transició ecològica o acció sociocomunitària.","Tria l’àmbit pel contingut real de l’actuació, no només pel servei municipal que la gestiona."],
      avoid:["Classificar una mateixa actuació en diversos àmbits dins d’aquesta fitxa."],
      rules:[{type:"required",message:"Falta seleccionar l’àmbit principal de l’actuació."}]
    },
    "llb-subarea":{
      title:"Subàmbit de l’actuació",
      include:["Selecciona el subàmbit que concreta la naturalesa de l’actuació dins de l’àmbit escollit.","Comprova que sigui coherent amb les activitats descrites i el pressupost."],
      avoid:["Escollir un subàmbit només per millorar la distribució del programa si no correspon al contingut real."],
      rules:[{type:"required",message:"Falta seleccionar el subàmbit."}]
    },
    "llb-action-field":{
      title:"Camp d’actuació",
      include:["Selecciona el camp d’actuació concret previst dins del subàmbit.","Ha de coincidir amb la classificació de la taula de pressupost i amb el codi de l’actuació."],
      avoid:["Triar un camp genèric que no descrigui l’objecte principal de la intervenció."],
      rules:[{type:"required",message:"Falta seleccionar el camp d’actuació."}]
    },
    "llb-action-number":{
      title:"Número de l’actuació",
      include:["Introdueix un número enter superior a zero.","Ha de coincidir amb el número assignat a aquesta actuació a la taula de pressupost."],
      avoid:["Repetir un número ja utilitzat dins del mateix codi d’àmbit, subàmbit i camp."],
      rules:[{type:"positiveInteger",message:"Falta un número d’actuació enter i superior a zero."}]
    },
    "llb-generated-code":{
      title:"Codi de l’actuació",
      readonly:true,
      include:["Es genera automàticament a partir de l’àmbit, el subàmbit, el camp i el número d’actuació.","Comprova que coincideixi amb el codi utilitzat a la taula de pressupost."],
      avoid:["No l’editis manualment."],
      rules:[{type:"required",message:"El codi encara no s’ha generat; completa la classificació i el número d’actuació."}]
    },
    "llb-title":{
      title:"Títol de l’actuació",
      aliases:["títol","nom de l’actuació","descripció breu"],
      lengthGuidance:"No hi ha un nombre normatiu de paraules configurat. Com a criteri orientatiu, fes servir una frase breu que habitualment càpiga en una o dues línies.",
      example:"Rehabilitació energètica i ampliació del centre cívic del barri de [nom del barri].",
      include:["Un nom breu, específic i inequívoc que identifiqui què es farà.","Si ajuda a diferenciar-la, incorpora l’espai, equipament o col·lectiu principal.","Mantén-lo prou curt per cabre en un màxim orientatiu de dues línies."],
      avoid:["Títols genèrics com «Millora del barri», codis sense descripció o una explicació extensa de l’actuació."],
      structure:"Acció principal + objecte o espai d’intervenció + ubicació o col·lectiu, si és necessari.",
      rules:[
        {type:"required",message:"Falta el títol."},
        {type:"minLength",value:8,message:"El títol és massa genèric o breu; concreta l’acció principal."}
      ]
    },
    "llb-diagnosis":{
      title:"Diagnosi",
      aliases:["diagnosi","problemàtica","necessitat"],
      lengthGuidance:"No hi ha un límit normatiu de paraules configurat ni un màxim tècnic al formulari. Prioritza una diagnosi concreta i completa, sense repetir la descripció de l’actuació.",
      include:["La problemàtica o situació actual concreta que motiva aquesta actuació.","L’àmbit territorial i les persones o col·lectius afectats.","Dades o evidències verificables, amb any i font quan sigui possible.","Les causes i conseqüències principals del problema.","La relació directa entre la necessitat detectada i l’actuació proposada."],
      avoid:["Descriure les obres o activitats que es faran; això correspon a la descripció de l’actuació.","Afirmacions genèriques sense dades, font ni referència territorial.","Copiar la diagnosi general del PMII sense concretar-la per a aquesta actuació."],
      structure:"1. Situació actual.\n2. Problema o dèficit concret.\n3. Dada, any i font.\n4. Territori i col·lectius afectats.\n5. Causes i conseqüències.\n6. Necessitat d’intervenir.",
      rules:[
        {type:"required",message:"El camp és buit."},
        {type:"minLength",value:120,message:"La diagnosi és massa breu per acreditar la necessitat de l’actuació."},
        {type:"pattern",pattern:"\\d",message:"Falta almenys una dada, magnitud o referència temporal concreta."},
        {type:"pattern",pattern:"font|segons|dades|registre|estudi|enquesta|idescat|ine|padró|particip",message:"No s’identifica cap font o evidència."},
        {type:"pattern",pattern:"barri|àae|àrea|carrer|equipament|zona|municipi|població|persones|col·lectiu",message:"Falta concretar el territori o la població afectada."},
        {type:"pattern",pattern:"problema|dèficit|necessitat|manca|insufici|vulnerab|desigual|dificultat|risc",message:"No queda prou explícita la problemàtica o necessitat."}
      ]
    },
    "llb-action-description":{
      title:"Descripció de l’actuació",
      aliases:["descripció de l’actuació","actuació","intervenció"],
      lengthGuidance:"No hi ha un límit normatiu de paraules configurat ni un màxim tècnic al formulari. L’extensió ha de permetre entendre què es farà, on, per a qui, com i amb quins resultats.",
      include:["L’objecte i la finalitat concreta de la intervenció.","Les activitats, serveis, obres o mesures que s’executaran i el seu abast.","On es desenvoluparà i a quines persones o col·lectius s’adreça.","La metodologia, els recursos principals i les fases d’execució.","Els resultats esperats i com responen a la diagnosi.","La coordinació amb altres actuacions, si és rellevant."],
      avoid:["Repetir només la diagnosi sense explicar què es farà.","Enumerar objectius sense concretar activitats, abast, procés o resultats.","Introduir dades pressupostàries detallades que ja tenen camps específics."],
      structure:"1. En què consisteix.\n2. Accions i abast.\n3. Ubicació i destinataris.\n4. Metodologia i fases.\n5. Resultats esperats.\n6. Relació amb la diagnosi i altres actuacions.",
      rules:[
        {type:"required",message:"El camp és buit."},
        {type:"minLength",value:150,message:"La descripció és massa breu per concretar l’execució de l’actuació."},
        {type:"pattern",pattern:"es preveu|consisteix|execut|realitz|implant|crea|rehabilit|millor|desenvolup|organitz|contract",message:"Falta explicar amb verbs concrets què es farà."},
        {type:"pattern",pattern:"barri|àae|àrea|carrer|equipament|zona|municipi|població|persones|col·lectiu|destin",message:"Falta la ubicació o la població destinatària."},
        {type:"pattern",pattern:"fase|primer|posterior|projecte|licitació|execució|posada en servei|seguiment|metodologia",message:"Falta explicar el procés, la metodologia o les fases."},
        {type:"pattern",pattern:"resultat|permetrà|assolir|reduir|incrementar|millorar|benefici",message:"Falta concretar els resultats esperats."}
      ]
    },
    "llb-collaborating-entities":{
      title:"Entitats col·laboradores",
      aliases:["entitats col·laboradores","organisme responsable","col·laboradors"],
      lengthGuidance:"No hi ha un límit de paraules configurat. Dedica una entrada breu a cada entitat i concreta’n la funció; no cal desenvolupar informació aliena a la col·laboració.",
      include:["El nom de cada administració, servei, entitat social o agent que intervé.","El paper i les funcions concretes de cadascun.","En quina fase participa: disseny, execució, derivació, comunicació, seguiment o avaluació.","El compromís o instrument de col·laboració previst, si existeix.","Si no hi ha entitats col·laboradores, indica-ho expressament."],
      avoid:["Llistes de noms sense explicar funcions.","Atribuir compromisos que no estiguin confirmats."],
      structure:"Entitat o agent — funció — fase de participació — compromís o instrument previst.",
      rules:[
        {type:"required",message:"Falta identificar les entitats o indicar expressament que no se’n preveuen."},
        {type:"patternUnlessNone",pattern:"funció|responsab|coordina|execut|particip|col·labor|seguiment|comunic|deriv",message:"S’han esmentat agents, però no queda clara la funció de cadascun."}
      ]
    },
    "llb-location-description":{
      title:"Emplaçament de l’actuació",
      aliases:["emplaçament","ubicació","adreça","carrers","lloc de l’actuació"],
      lengthGuidance:"No hi ha un límit normatiu de paraules configurat. Identifica l’emplaçament amb prou precisió perquè es pugui localitzar i relacionar amb l’AAE.",
      include:["L’adreça, els carrers, l’equipament, l’espai públic o l’àmbit concret on es desenvolupa l’actuació.","Si afecta diversos punts, enumera’ls o descriu clarament l’abast territorial.","Indica la relació amb l’AAE quan l’emplaçament no sigui evident."],
      avoid:["Referències genèriques com «al barri» sense carrer, equipament, àmbit o delimitació.","Ubicacions que no coincideixin amb la diagnosi o la descripció de l’actuació."],
      structure:"Emplaçament principal + adreça o carrers + abast territorial + relació amb l’AAE.",
      rules:[
        {type:"required",message:"Falta descriure l’emplaçament de l’actuació."},
        {type:"minLength",value:12,message:"L’emplaçament és massa genèric; concreta l’adreça, els carrers, l’equipament o l’àmbit afectat."}
      ]
    },
    "llb-action-total":{
      title:"Import total de l’actuació",
      include:["Introdueix el cost total estimat de l’actuació en euros.","Ha de coincidir amb la suma de les anualitats i amb la taula de pressupost."],
      avoid:["Introduir només la subvenció sol·licitada o només l’aportació municipal."],
      rules:[{type:"positiveNumber",message:"Falta un import total superior a zero."}]
    },
    "llb-type":{
      title:"Tipus principal d’actuació",
      include:["Selecciona el patró que millor descriu la manera com s’executarà l’actuació.","Aquesta selecció genera només una proposta orientativa de fases i indicadors, que s’ha d’adaptar al cas real."],
      avoid:["Acceptar la proposta automàtica sense revisar fases, percentatges i indicadors."],
      rules:[{type:"required",message:"Falta seleccionar el tipus principal d’actuació."}]
    },
    "llb-exception":{
      title:"Finançament excepcional del 90%",
      include:["Activa’l només quan el municipi compleixi els requisits aplicables i la dificultat de finançament quedi acreditada documentalment.","La selecció no substitueix la justificació que s’hagi d’aportar."],
      avoid:["Aplicar automàticament el 90% pel sol fet de tenir menys de 5.000 habitants."],
      rules:[]
    }
  },
  byClass:{
    "llb-structure-year":{
      title:"Anualitats d’execució",
      include:["Marca tots els anys en què aquesta actuació tindrà execució física, tècnica o econòmica.","Les anualitats seleccionades han de ser coherents amb el cronograma i el pla financer."],
      avoid:["Marcar anys sense cap acció ni pressupost associat."],
      rules:[{type:"atLeastOneYear",message:"Falta seleccionar almenys una anualitat."}]
    },
    "llb-action":{
      title:"Acció prevista a l’anualitat",
      include:["Descriu la fase o les tasques concretes que s’executaran durant l’any indicat.","Utilitza fites verificables: redacció, contractació, execució, posada en servei, dinamització o seguiment, segons correspongui.","Fes que el contingut sigui coherent amb el percentatge i l’import assignats a aquell any."],
      avoid:["Expressions genèriques com «continuació de l’actuació» sense concretar què es farà."],
      structure:"Fase + tasca o fita concreta + resultat anual esperat.",
      rules:[
        {type:"requiredIfAllocated",message:"Hi ha pressupost assignat a aquesta anualitat però falta descriure l’acció prevista."},
        {type:"minLengthIfValue",value:12,message:"La descripció anual és massa genèrica; concreta la fase o fita."}
      ]
    },
    "llb-allocation":{
      title:"Percentatge anual",
      include:["Indica quina part del cost total s’executarà en aquesta anualitat.","El conjunt de les anualitats ha de sumar exactament el 100%."],
      avoid:["Percentatges negatius, superiors al 100% o sense correspondència amb les accions previstes."],
      rules:[
        {type:"range",min:0,max:100,message:"El percentatge ha d’estar entre el 0% i el 100%."},
        {type:"allocationSum",message:"La suma de totes les anualitats no és exactament del 100%."}
      ]
    },
    "llb-annual-amount":{
      title:"Import anual",
      readonly:true,
      include:["El formulari calcula aquest import a partir del cost total i del percentatge de l’anualitat.","Comprova que sigui coherent amb la fase que s’executarà aquell any."],
      avoid:["No intentis modificar-lo manualment; corregeix el cost total o el percentatge."],
      rules:[{type:"amountIfAllocated",message:"Hi ha percentatge assignat però l’import anual no s’ha calculat correctament."}]
    },
    "llb-other":{
      title:"Altres fonts de finançament de l’anualitat",
      include:["Introdueix l’import anual que prové de fonts diferents del Fons i de l’aportació pròpia ordinària.","Si no hi ha altres fonts, deixa-hi 0,00.","L’import no pot superar el cost total de l’anualitat."],
      avoid:["Incloure imports no confirmats o comptar dues vegades una mateixa font."],
      rules:[
        {type:"nonNegative",message:"L’import no pot ser negatiu."},
        {type:"otherNotAboveAnnual",message:"Les altres fonts superen l’import total de l’anualitat."}
      ]
    },
    "llb-indicator-type":{
      title:"Tipus d’indicador",
      include:["Selecciona si mesura recursos, activitat, producte, execució, resultat o impacte, segons el desplegable.","El tipus ha de correspondre exactament a allò que mesura la descripció."],
      avoid:["Classificar com a impacte un simple recompte d’activitats o productes."],
      rules:[{type:"required",message:"Falta seleccionar el tipus d’indicador."}]
    },
    "llb-indicator-phase":{
      title:"Fase de l’indicador",
      include:["Selecciona la fase en què l’indicador es calcularà o utilitzarà.","Ha de ser coherent amb el tipus d’indicador i amb el calendari de l’actuació."],
      avoid:["Assignar una fase d’avaluació final a un indicador que només controla l’execució inicial."],
      rules:[{type:"required",message:"Falta seleccionar la fase."}]
    },
    "llb-indicator-description":{
      title:"Descripció de l’indicador",
      lengthGuidance:"No hi ha un límit normatiu de paraules configurat. Formula’l preferentment en una sola frase clara, amb la magnitud i la unitat de mesura.",
      example:"Nombre de persones participants en les activitats comunitàries durant l’any.",
      include:["Defineix exactament què es mesurarà.","Expressa una magnitud quantificable i, quan sigui possible, la unitat o fórmula.","Vincula’l a una actuació o resultat concret."],
      avoid:["Indicadors binaris de tipus «Sí/No».","Formulacions vagues com «millora del servei» sense magnitud ni unitat."],
      structure:"Magnitud mesurada + unitat o fórmula + població/espai de referència + moment de mesura.",
      rules:[
        {type:"required",message:"Falta la descripció de l’indicador."},
        {type:"minLength",value:12,message:"La descripció és massa genèrica."},
        {type:"nonBinary",message:"L’indicador sembla binari; reformula’l com una magnitud quantificable."},
        {type:"pattern",pattern:"nombre|número|%|percentatge|taxa|índex|m²|m2|euros|€|hores|dies|persones|participants|unitats|reducció|increment",message:"No s’identifica clarament la magnitud o unitat de mesura."}
      ]
    },
    "llb-indicator-current":{
      title:"Valor actual de l’indicador",
      include:["Introdueix la línia de base abans d’executar l’actuació.","Utilitza la mateixa unitat que al valor objectiu.","Si el valor és qualitatiu, defineix una categoria o escala inequívoca i verificable."],
      avoid:["«Sí/No», «pendent» o «no disponible» sense justificar com s’obtindrà la línia de base."],
      rules:[
        {type:"required",message:"Falta el valor actual o línia de base."},
        {type:"nonBinary",message:"El valor actual és binari; utilitza una xifra o una escala definida."}
      ]
    },
    "llb-indicator-target":{
      title:"Valor objectiu de l’indicador",
      include:["Indica la meta que es preveu assolir amb l’actuació.","Utilitza la mateixa unitat o escala que al valor actual.","La fita ha de ser concreta, assolible i coherent amb el pressupost i el termini."],
      avoid:["«Sí/No», «assolit» o expressions sense magnitud objectiu."],
      rules:[
        {type:"required",message:"Falta el valor objectiu."},
        {type:"nonBinary",message:"El valor objectiu és binari; concreta una xifra o una escala definida."},
        {type:"sameUnitAsCurrent",message:"Comprova que el valor actual i l’objectiu utilitzin la mateixa unitat o escala."}
      ]
    },
    "llb-image-caption":{
      title:"Peu de foto",
      include:["Descriu breument què mostra la imatge i la seva relació amb l’actuació o l’emplaçament."],
      avoid:["Peus genèrics com «imatge de la zona» que no permetin interpretar-ne el contingut."],
      rules:[{type:"required",message:"Falta el peu de foto d’aquesta imatge."}]
    },
    "llb-image-source":{
      title:"Font o autoria de la imatge",
      include:["Indica l’autoria, l’organisme d’origen o «elaboració pròpia», segons correspongui."],
      avoid:["Deixar la imatge sense una font identificable."],
      rules:[{type:"required",message:"Falta indicar la font o autoria d’aquesta imatge."}]
    },
    "llb-image-alt":{
      title:"Text alternatiu de la imatge",
      include:["Descriu en una frase breu la informació visual essencial perquè la imatge sigui accessible."],
      avoid:["Repetir només «imatge» o copiar un nom de fitxer sense significat."],
      rules:[
        {type:"required",message:"Falta el text alternatiu d’aquesta imatge."},
        {type:"minLength",value:8,message:"El text alternatiu és massa breu per descriure la imatge."}
      ]
    }
  }
});
