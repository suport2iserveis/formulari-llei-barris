const CORE_SOURCE_PATTERNS = [
  /20250110.*proposta.*decret/i,
  /20250903.*guia.*practica.*sollicitud/i
];
const INTENTS = new Set(["question", "explain", "missing", "structure", "review"]);
const MAX_BODY_BYTES = 30000;
const MAX_QUESTION_CHARS = 1200;
const MIN_RETRIEVAL_SCORE = 0.12;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return json({ ok: true, configured: Boolean(env.OPENAI_API_KEY && env.OPENAI_VECTOR_STORE_ID) }, 200, cors);
    }
    if (url.pathname !== "/v1/ask" || request.method !== "POST") return json({ message: "Ruta no disponible." }, 404, cors);
    if (!originAllowed(origin, env.ALLOWED_ORIGIN)) return json({ message: "Origen no autoritzat." }, 403, cors);
    if (!env.OPENAI_API_KEY || !env.OPENAI_VECTOR_STORE_ID) {
      return json({ message: "Barrys encara no té configurats la clau API i el repositori documental." }, 503, cors);
    }
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) return json({ message: "La consulta és massa extensa." }, 413, cors);

    let payload;
    try { payload = await request.json(); } catch { return json({ message: "La consulta no té un format vàlid." }, 400, cors); }
    const question = clean(payload.question, MAX_QUESTION_CHARS);
    const intent = INTENTS.has(payload.intent) ? payload.intent : "question";
    const context = normalizeContext(payload.context);
    if (!question) return json({ message: "Escriu una pregunta." }, 400, cors);

    try {
      const query = buildRetrievalQuery(question, intent, context);
      const [specific, core] = await Promise.all([
        searchVectorStore(env, query),
        searchVectorStore(env, `Guia pràctica i proposta de decret: ${question}`)
      ]);
      const chunks = dedupeChunks([...specific, ...core])
        .filter(item => item.score >= MIN_RETRIEVAL_SCORE)
        .slice(0, 10);
      const coreChunks = chunks.filter(item => CORE_SOURCE_PATTERNS.some(pattern => pattern.test(item.filename)));
      if (!chunks.length || !coreChunks.length) {
        return json({
          answer: "No disposo d’una base documental suficient per respondre aquesta consulta amb garanties. Reformula-la o demana que es revisin els documents de coneixement de Barrys.",
          grounded: false,
          sources: []
        }, 200, cors);
      }

      const result = await createGroundedResponse(env, { question, intent, context, chunks });
      if (!result.grounded || !Array.isArray(result.source_ids) || !result.source_ids.length) {
        return json({
          answer: "La documentació recuperada no permet donar una resposta prou fonamentada. No completaré la informació amb criteris no documentats.",
          grounded: false,
          sources: []
        }, 200, cors);
      }
      const used = new Set(result.source_ids);
      const sources = chunks
        .filter(item => used.has(item.id))
        .map(item => ({ filename: item.filename, page: item.page || null }))
        .filter((item, index, all) => all.findIndex(other => other.filename === item.filename && other.page === item.page) === index);
      if (!sources.some(source => CORE_SOURCE_PATTERNS.some(pattern => pattern.test(source.filename)))) {
        return json({
          answer: "No he pogut vincular la resposta a la proposta de decret o a la guia pràctica. Per prudència, no dono aquesta orientació.",
          grounded: false,
          sources: []
        }, 200, cors);
      }
      return json({ answer: result.answer, grounded: true, sources }, 200, cors);
    } catch (error) {
      console.error("Barrys error", error);
      return json({ message: "Ara mateix Barrys no pot consultar la base documental. Torna-ho a provar més tard." }, 502, cors);
    }
  }
};

function normalizeContext(value) {
  const source = value && typeof value === "object" ? value : {};
  const field = source.field && typeof source.field === "object" ? source.field : {};
  return {
    municipality: clean(source.municipality, 160),
    actionCode: clean(source.actionCode, 80),
    actionTitle: clean(source.actionTitle, 240),
    field: {
      id: clean(field.id, 120),
      name: clean(field.name, 120),
      label: clean(field.label, 180),
      value: clean(field.value, 8000)
    }
  };
}

function buildRetrievalQuery(question, intent, context) {
  return [
    `Intenció: ${intent}`,
    `Pregunta: ${question}`,
    context.field.label ? `Camp: ${context.field.label}` : "",
    context.actionTitle ? `Actuació: ${context.actionTitle}` : "",
    context.field.value ? `Text a revisar: ${context.field.value.slice(0, 1600)}` : ""
  ].filter(Boolean).join("\n");
}

async function searchVectorStore(env, query) {
  const response = await fetch(`https://api.openai.com/v1/vector_stores/${encodeURIComponent(env.OPENAI_VECTOR_STORE_ID)}/search`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, max_num_results: 8, rewrite_query: true })
  });
  if (!response.ok) throw new Error(`Retrieval ${response.status}`);
  const data = await response.json();
  return (data.data || []).map((item, index) => ({
    id: `${item.file_id || "file"}:${item.chunk_id || index}`,
    fileId: item.file_id || "",
    filename: item.filename || "Document sense nom",
    score: Number(item.score || 0),
    page: item.attributes?.page_number || null,
    text: (item.content || []).map(part => part.text || "").join("\n").slice(0, 7000)
  })).filter(item => item.text);
}

function dedupeChunks(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.fileId}|${item.text.slice(0, 160)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function createGroundedResponse(env, input) {
  const evidence = input.chunks.map(item => `FONT_ID: ${item.id}\nFITXER: ${item.filename}\nFRAGMENT:\n${item.text}`).join("\n\n---\n\n");
  const instructions = [
    "Ets Barrys, l’assistent tècnic d’iServeis per emplenar els formularis de la Llei de Barris 2025.",
    "MARC TANCAT: respon exclusivament amb els fragments documentals aportats en aquesta petició.",
    "La proposta de decret i la guia pràctica són les úniques fonts normatives i operatives autoritzades.",
    "Les memòries només són exemples: no converteixis el seu contingut en requisits ni copiïs dades, municipis o actuacions.",
    "Els documents de paraules clau i indicadors són criteris interns auxiliars i mai prevalen sobre decret o guia.",
    "No utilitzis coneixement general, memòria del model, internet ni suposicions.",
    "No inventis dades, imports, terminis, puntuacions, articles, criteris o obligacions.",
    "Si els fragments no permeten respondre, posa grounded=false i explica breument què falta.",
    "Diferencia sempre requisit, recomanació i exemple orientatiu.",
    "Respon en català clar, professional i directe. No afirmis que una proposta garanteix puntuació o concessió.",
    "Quan revisis un text, conserva els fets aportats per l’usuari i assenyala els buits amb claudàtors; no els omplis.",
    "Retorna només el JSON exigit. source_ids ha d’incloure únicament identificadors FONT_ID realment utilitzats."
  ].join("\n");
  const userInput = [
    `INTENCIÓ: ${input.intent}`,
    `PREGUNTA: ${input.question}`,
    `CONTEXT DEL FORMULARI: ${JSON.stringify(input.context)}`,
    "FRAGMENTS AUTORITZATS:",
    evidence
  ].join("\n\n");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5.6",
      store: false,
      instructions,
      input: userInput,
      text: {
        format: {
          type: "json_schema",
          name: "barrys_grounded_answer",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              answer: { type: "string" },
              grounded: { type: "boolean" },
              source_ids: { type: "array", items: { type: "string" } }
            },
            required: ["answer", "grounded", "source_ids"]
          }
        }
      }
    })
  });
  if (!response.ok) throw new Error(`Responses ${response.status}`);
  const data = await response.json();
  const text = data.output_text || (data.output || []).flatMap(item => item.content || []).find(part => part.type === "output_text")?.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
}

function clean(value, max) {
  return String(value || "").replace(/\u0000/g, "").trim().slice(0, max);
}

function originAllowed(origin, allowed) {
  if (!origin) return false;
  const values = String(allowed || "").split(",").map(value => value.trim()).filter(Boolean);
  return values.some(value => origin === value || origin.startsWith(`${value}/`) || (value.endsWith("*") && origin.startsWith(value.slice(0, -1))));
}

function corsHeaders(origin, allowed) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Vary": "Origin", "Cache-Control": "no-store" };
  if (originAllowed(origin, allowed)) headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  return headers;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers });
}
