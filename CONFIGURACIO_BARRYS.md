# Configuració de Barrys IA

La versió 4.5.0 separa la interfície pública del motor d’IA. La clau d’OpenAI
no s’ha de posar mai a `index.html` ni a `assets/barrys.config.js`.

## Documents pendents

Abans d’activar Barrys, crea un vector store a la plataforma d’OpenAI i
incorpora-hi, com a mínim:

1. `20250110-text-proposta-decret (1).pdf`
2. `20250903-guia-practica-sollicitud.pdf`

Es poden afegir com a coneixement auxiliar:

- `PARAULES, FRASES CLAU, OBJECTIUS (4).docx`
- `indicadors argumentació.docx`
- les cinc memòries validades, només com a exemples.

No activis el servei si els dos primers documents no han acabat de processar-se.

## Desplegament del servei segur

1. Obre una consola dins de `barrys-worker`.
2. Executa `npm install`.
3. Revisa `wrangler.jsonc` i posa a `ALLOWED_ORIGIN` l’origen exacte del
   formulari publicat.
4. Executa `npx wrangler secret put OPENAI_API_KEY` i enganxa la clau quan es
   demani.
5. Executa `npx wrangler secret put OPENAI_VECTOR_STORE_ID` i enganxa
   l’identificador del vector store.
6. Executa `npm run deploy`.
7. Copia l’URL retornada pel desplegament.
8. Obre `assets/barrys.config.js` i enganxa l’URL al valor `endpoint`.
9. Publica a GitHub `index.html`, la carpeta `assets` i la resta de fitxers del
   formulari.

## Regles aplicades

- Cap clau queda exposada al navegador.
- No hi ha cerca web.
- Una resposta ha d’utilitzar fragments recuperats dels documents.
- Una orientació normativa ha de citar el decret o la guia.
- Les memòries són exemples, no normes.
- Barrys rebutja la resposta quan no hi ha suport documental suficient.
- Els textos de l’usuari no es modifiquen ni s’insereixen automàticament.
- Les peticions a Responses API es fan amb `store: false`.

## Abans de considerar-lo validat

Cal preparar una bateria de preguntes amb resposta esperada i casos en què
Barrys s’ha de negar a respondre. Les respostes s’han de revisar per un tècnic
d’iServeis abans de publicar l’assistent per a col·laboradors externs.
