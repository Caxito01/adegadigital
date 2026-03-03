import { useState, useRef, useEffect } from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#100a0a;--card:#1a0f0f;--card2:#1f1212;
      --border:#2e1a1a;--border2:#3d2020;
      --text:#f0e8e0;--text2:#c4a882;--muted:#7a5c4a;
      --accent:#c9793a;--accent2:#e8a86a;
      --wine:#8b1a2e;--wine2:#a82840;
      --gold:#c8a84b;--green:#4a7c59;
    }
    body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;min-height:100vh}
    .serif{font-family:'Cormorant Garamond',serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
    .search-input{
      background:transparent;border:none;outline:none;color:var(--text);
      font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:300;
      font-style:italic;width:100%;caret-color:var(--accent)
    }
    .search-input::placeholder{color:var(--muted)}
    .tag{display:inline-block;padding:2px 9px;border-radius:100px;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase}
    @keyframes cardReveal{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .card-reveal{animation:cardReveal .4s ease-out forwards}
    @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes barFill{from{width:0}to{}}
    .bar-fill{animation:barFill .9s ease-out forwards}
    .chip{padding:5px 13px;border:1px solid var(--border2);border-radius:100px;font-size:.62rem;
      color:var(--muted);cursor:pointer;transition:all .2s;background:transparent;font-family:'DM Mono',monospace}
    .chip:hover{border-color:var(--accent);color:var(--accent2);background:rgba(201,121,58,.08)}
    .btn{background:var(--wine);color:var(--text);border:none;border-radius:8px;padding:10px 22px;
      font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;
      font-family:'DM Mono',monospace;transition:background .2s;white-space:nowrap;flex-shrink:0}
    .btn:hover:not(:disabled){background:var(--wine2)}
    .btn:disabled{opacity:.4;cursor:not-allowed}
  `}</style>
);

/* ─── CLAUDE API ──────────────────────────── */
async function callClaude(query) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Você é sommelier especialista. Busca: "${query}"

IMPORTANTE: Responda SOMENTE com JSON puro. Nenhum texto antes ou depois. Nenhum markdown. Apenas o objeto JSON.

{"vinhos":[
  {
    "nome":"Nome do vinho",
    "produtor":"Vinícola",
    "pais":"País",
    "regiao":"Região",
    "ano":2019,
    "tipo":"Tinto",
    "uvas":["Uva1"],
    "pontuacao":92,
    "preco":"R$ 180",
    "alcool":"14%",
    "temperatura":"16-18°C",
    "decantacao":"1h",
    "guarda":"10-15 anos",
    "descricao":"Frase curta elegante",
    "notas":"Notas detalhadas de degustação em 2-3 frases",
    "perfil":{"acidez":68,"taninos":88,"corpo":92,"frutado":76},
    "harmonizacao":["Carne vermelha","Queijo curado"]
  }
]}

Retorne 5 vinhos reais e relevantes para a busca. Tipos válidos: Tinto, Branco, Rosé, Espumante, Sobremesa. Pontuações entre 82-97. Preços realistas em BRL.`
      }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText = data?.content?.[0]?.text || "";

  // Parse robusto — extrai qualquer JSON válido da resposta
  // Tenta 1: texto direto
  try { return JSON.parse(rawText).vinhos; } catch {}

  // Tenta 2: extrai bloco JSON
  const match = rawText.match(/\{[\s\S]*"vinhos"[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]).vinhos; } catch {}
  }

  // Tenta 3: extrai array diretamente
  const arrMatch = rawText.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }

  throw new Error(`Não foi possível parsear a resposta. Raw: ${rawText.slice(0, 300)}`);
}

/* ─── VIVINO ENRICH (opcional) ───────────── */
async function enrichVivino(nome) {
  try {
    const target = `https://www.vivino.com/api/explore/explore?q=${encodeURIComponent(nome)}&language=pt&currency_code=BRL&per_page=1`;
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(target)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return null;
    const json = await res.json();
    const m = json?.explore_vintage?.matches?.[0];
    if (!m) return null;
    const v = m.vintage || {}, w = v.wine || {};
    const stats = v.statistics || {}, struct = w.taste?.structure || {};
    return {
      rating: stats.ratings_average,
      count: stats.ratings_count,
      img: v.image?.location ? `https:${v.image.location}` : null,
      url: v.id ? `https://www.vivino.com/w/${v.id}` : null,
      preco: m.price?.amount ? `${m.price.currency || "R$"} ${Number(m.price.amount).toFixed(2)}` : null,
      perfil: {
        ...(struct.acidity   ? { acidez:  Math.round(struct.acidity * 20) }   : {}),
        ...(struct.tannin    ? { taninos: Math.round(struct.tannin * 20) }    : {}),
        ...(struct.intensity ? { corpo:   Math.round(struct.intensity * 20) } : {}),
      }
    };
  } catch { return null; }
}

/* ─── UI HELPERS ──────────────────────────── */
function Loading() {
  return (
    <div style={{ textAlign:"center", padding:"4rem 0" }}>
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:"1.2rem" }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width:5, height:24, borderRadius:3,
            background: i%2 ? "var(--wine2)" : "var(--wine)",
            animation:`pulse 1.2s ease-in-out ${i*.15}s infinite`
          }}/>
        ))}
      </div>
      <p className="serif" style={{ fontStyle:"italic", color:"var(--muted)", fontSize:".9rem" }}>
        Consultando o sommelier...
      </p>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 38, c = 2*Math.PI*r;
  const col = score>=93?"var(--gold)":score>=88?"var(--accent2)":score>=83?"var(--accent)":"var(--muted)";
  return (
    <div style={{ position:"relative", width:90, height:90 }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="5"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${(score/100)*c} ${c}`} strokeDashoffset={c/4}
          strokeLinecap="round" style={{ transition:"stroke-dasharray 1s" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span className="serif" style={{ fontSize:"1.6rem", fontWeight:300, color:col, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:".4rem", letterSpacing:".15em", color:"var(--muted)", textTransform:"uppercase" }}>pts</span>
      </div>
    </div>
  );
}

function FlavorBar({ label, value, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:".7rem" }}>
      <span style={{ fontSize:".58rem", color:"var(--muted)", width:72, textTransform:"capitalize", letterSpacing:".08em", flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:3, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
        <div className="bar-fill" style={{ height:"100%", width:`${value}%`, background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:".58rem", color:"var(--muted)", width:24, textAlign:"right" }}>{value}</span>
    </div>
  );
}

function WineCard({ wine, index, selected, onSelect }) {
  const viv = wine._viv;
  const tc = wine.tipo==="Tinto"?"var(--wine2)":wine.tipo==="Branco"?"var(--gold)":wine.tipo==="Rosé"?"#d4688a":"var(--accent)";

  return (
    <div className="card-reveal" onClick={() => onSelect(wine)} style={{
      animationDelay:`${index*.06}s`, opacity:0, cursor:"pointer",
      background: selected ? "var(--card2)" : "var(--card)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      borderRadius:12, padding:"1.1rem 1.3rem",
      display:"flex", gap:"1rem", alignItems:"flex-start",
      transition:"border-color .2s, background .2s",
      boxShadow: selected ? "0 0 24px rgba(201,121,58,.15)" : "none"
    }}>
      {/* Thumb */}
      <div style={{ width:42, height:42, borderRadius:8, background:`${tc}18`,
        border:`1px solid ${tc}30`, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
        {viv?.img
          ? <img src={viv.img} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }}
              onError={e => { e.target.style.display="none"; }}/>
          : <span style={{ fontSize:"1.1rem" }}>🍷</span>}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:".5rem", flexWrap:"wrap" }}>
          <div>
            <p className="serif" style={{ fontSize:"1.05rem", fontWeight:600, color:"var(--text)", lineHeight:1.2 }}>{wine.nome}</p>
            <p style={{ fontSize:".58rem", color:"var(--muted)", marginTop:2, letterSpacing:".08em" }}>
              {wine.produtor} · {wine.regiao}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:.4, flexShrink:0 }}>
            <span className="serif" style={{ fontSize:"1.2rem", color:"var(--gold)" }}>{wine.pontuacao}</span>
            <span style={{ fontSize:".48rem", color:"var(--muted)", letterSpacing:".1em", marginLeft:3 }}>pts</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:".35rem", marginTop:".5rem", flexWrap:"wrap", alignItems:"center" }}>
          <span className="tag" style={{ background:`${tc}20`, color:tc, border:`1px solid ${tc}40` }}>{wine.tipo}</span>
          <span className="tag" style={{ background:"var(--border)", color:"var(--muted)" }}>{wine.ano}</span>
          {wine.uvas?.slice(0,1).map(u => (
            <span key={u} className="tag" style={{ background:"var(--border)", color:"var(--muted)" }}>{u}</span>
          ))}
          {viv?.rating && (
            <span style={{ fontSize:".52rem", padding:"2px 8px", borderRadius:100,
              background:"rgba(120,20,40,.25)", border:"1px solid rgba(200,60,80,.3)",
              color:"#f99", letterSpacing:".08em" }}>
              🍇 {viv.rating.toFixed(1)}★
            </span>
          )}
        </div>

        <p style={{ fontSize:".62rem", color:"var(--muted)", marginTop:".5rem", lineHeight:1.5,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {wine.descricao}
        </p>
      </div>
    </div>
  );
}

function DetailPanel({ wine, onClose }) {
  const viv = wine._viv;
  const tc = wine.tipo==="Tinto"?"var(--wine2)":wine.tipo==="Branco"?"var(--gold)":wine.tipo==="Rosé"?"#d4688a":"var(--accent)";
  const perfil = (viv?.perfil && Object.keys(viv.perfil).length > 0) ? viv.perfil : wine.perfil;

  return (
    <div className="card-reveal" style={{
      opacity:0, background:"var(--card)", border:"1px solid var(--border2)",
      borderRadius:16, overflow:"hidden", position:"sticky", top:"1rem"
    }}>
      {/* Header */}
      <div style={{ padding:"1.6rem 1.6rem 1.1rem", borderBottom:"1px solid var(--border)",
        background:"linear-gradient(135deg,var(--card2),var(--card))", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12,
          background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:".85rem", padding:"4px 8px" }}>✕</button>

        <p style={{ fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase", color:tc, marginBottom:5 }}>
          {wine.pais} · {wine.regiao}
        </p>
        <h2 className="serif" style={{ fontSize:"1.6rem", fontWeight:600, lineHeight:1.15, color:"var(--text)" }}>{wine.nome}</h2>
        <p style={{ fontSize:".65rem", color:"var(--muted)", marginTop:".2rem", letterSpacing:".05em" }}>
          {wine.produtor} · {wine.ano}
        </p>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.1rem" }}>
          <ScoreRing score={wine.pontuacao}/>
          <div style={{ textAlign:"right" }}>
            <p className="serif" style={{ fontSize:"1.5rem", color:"var(--accent2)", lineHeight:1 }}>
              {viv?.preco || wine.preco}
            </p>
            <p style={{ fontSize:".52rem", color:"var(--muted)", letterSpacing:".1em" }}>preço médio</p>
            {viv?.count && (
              <p style={{ fontSize:".58rem", color:"var(--muted)", marginTop:4 }}>
                📊 {(viv.count/1000).toFixed(1)}k avaliações Vivino
              </p>
            )}
            {viv?.url && (
              <a href={viv.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:".58rem", color:"var(--accent)", textDecoration:"none", display:"block", marginTop:5 }}>
                🔗 Ver na Vivino →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"1.3rem 1.6rem", display:"flex", flexDirection:"column",
        gap:"1.3rem", maxHeight:"58vh", overflowY:"auto" }}>

        <div>
          <p style={{ fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:".5rem" }}>
            Notas de Degustação
          </p>
          <p className="serif" style={{ fontStyle:"italic", fontSize:".98rem", color:"var(--text2)", lineHeight:1.75 }}>
            {wine.notas}
          </p>
        </div>

        {perfil && Object.keys(perfil).length > 0 && (
          <div>
            <p style={{ fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:".7rem" }}>
              Perfil de Sabor
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
              {Object.entries(perfil).map(([k,v]) => (
                <FlavorBar key={k} label={k} value={v} color={tc}/>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".5rem" }}>
          {[
            ["Uvas",        wine.uvas?.join(", ")],
            ["Álcool",      wine.alcool],
            ["Temperatura", wine.temperatura],
            ["Decantação",  wine.decantacao],
            ["Guarda",      wine.guarda],
            ["País",        wine.pais],
          ].filter(([,v]) => v).map(([l,v]) => (
            <div key={l} style={{ background:"var(--bg)", borderRadius:8, padding:".65rem .85rem", border:"1px solid var(--border)" }}>
              <p style={{ fontSize:".48rem", color:"var(--muted)", letterSpacing:".15em", textTransform:"uppercase", marginBottom:2 }}>{l}</p>
              <p style={{ fontSize:".72rem", color:"var(--text2)" }}>{v}</p>
            </div>
          ))}
        </div>

        {wine.harmonizacao?.length > 0 && (
          <div>
            <p style={{ fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:".5rem" }}>
              Harmonização
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
              {wine.harmonizacao.map(h => (
                <span key={h} style={{ padding:"3px 11px",
                  background:"rgba(74,124,89,.15)", border:"1px solid rgba(74,124,89,.4)",
                  borderRadius:100, fontSize:".58rem", color:"var(--green)" }}>
                  🍽 {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP ─────────────────────────────────── */
export default function App() {
  const [query,    setQuery]    = useState("");
  const [wines,    setWines]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [state,    setState]    = useState("idle");
  const [debugErr, setDebugErr] = useState("");
  const inputRef = useRef(null);

  const chips = [
    "Malbec Argentino","Bordeaux","Chianti Classico","Pinot Noir",
    "Barolo","Vinho Verde","vinho brasileiro","Champagne",
    "Cabernet Sauvignon","Rosé provençal"
  ];

  async function search(q) {
    if (!q.trim() || state === "loading") return;
    setState("loading");
    setDebugErr("");
    setWines([]);
    setSelected(null);

    let list = [];
    try {
      list = await callClaude(q);
      if (!Array.isArray(list) || list.length === 0) throw new Error("Array vazio ou inválido");
      setWines(list.map(w => ({ ...w, _viv: null })));
      setState("enriching");
    } catch(e) {
      setDebugErr(e.message);
      setState("error");
      return;
    }

    // Enriquecer com Vivino em paralelo (não bloqueia)
    const enriched = await Promise.all(
      list.map(async w => ({ ...w, _viv: await enrichVivino(w.nome) }))
    );
    setWines(enriched);
    setState("done");
  }

  useEffect(() => { inputRef.current?.focus(); }, []);

  const busy = state === "loading" || state === "enriching";

  return (
    <>
      <GlobalStyles/>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", padding:"0 1.5rem 4rem" }}>

        <header style={{ maxWidth:960, margin:"0 auto", padding:"2.5rem 0 0" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"1rem", marginBottom:".3rem" }}>
            <h1 className="serif" style={{ fontSize:"2.2rem", fontWeight:300, fontStyle:"italic", color:"var(--text)" }}>
              Adega Digital
            </h1>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--wine2)", marginBottom:4 }}/>
          </div>
          <p style={{ fontSize:".58rem", color:"var(--muted)", letterSpacing:".18em", textTransform:"uppercase" }}>
            Claude AI Sommelier · Enriquecido com Vivino
          </p>
          <div style={{ height:1, background:"linear-gradient(90deg,var(--border2),transparent)", margin:"1.1rem 0" }}/>

          {/* Search bar */}
          <div style={{ display:"flex", alignItems:"center", gap:"1rem",
            background:"var(--card)", border:"1px solid var(--border2)",
            borderRadius:12, padding:".9rem 1.3rem", boxShadow:"0 4px 24px rgba(0,0,0,.3)" }}>
            <span style={{ fontSize:"1rem", opacity:.5 }}>🔍</span>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Buscar — nome, uva, região, safra, sabor..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search(query)}
            />
            <button className="btn" onClick={() => search(query)} disabled={busy || !query.trim()}>
              {busy ? "..." : "Buscar"}
            </button>
          </div>

          {/* Chips */}
          {wines.length === 0 && state !== "loading" && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem", marginTop:"1rem" }}>
              {chips.map(s => (
                <button key={s} className="chip" onClick={() => { setQuery(s); search(s); }}>{s}</button>
              ))}
            </div>
          )}
        </header>

        <main style={{ maxWidth:960, margin:"2rem auto 0" }}>

          {/* Loading */}
          {state === "loading" && <Loading/>}

          {/* Erro com debug */}
          {state === "error" && (
            <div style={{ textAlign:"center", padding:"3rem 0" }}>
              <p className="serif" style={{ fontStyle:"italic", color:"var(--muted)", fontSize:"1rem", marginBottom:"1rem" }}>
                Algo deu errado. Tente novamente.
              </p>
              {debugErr && (
                <details style={{ cursor:"pointer", maxWidth:600, margin:"0 auto" }}>
                  <summary style={{ fontSize:".58rem", color:"var(--muted)", letterSpacing:".1em" }}>
                    Ver detalhes do erro
                  </summary>
                  <pre style={{ marginTop:".7rem", padding:".8rem", background:"var(--card)",
                    border:"1px solid var(--border)", borderRadius:8, fontSize:".58rem",
                    color:"#f88", textAlign:"left", overflowX:"auto", whiteSpace:"pre-wrap" }}>
                    {debugErr}
                  </pre>
                </details>
              )}
              <button className="chip" style={{ marginTop:"1.2rem" }}
                onClick={() => { setState("idle"); search(query); }}>
                Tentar novamente
              </button>
            </div>
          )}

          {/* Empty idle */}
          {state === "idle" && (
            <div style={{ textAlign:"center", padding:"5rem 0 3rem" }}>
              <p style={{ fontSize:"3.5rem", opacity:.07 }}>🍷</p>
              <p className="serif" style={{ fontStyle:"italic", color:"var(--muted)", fontSize:"1.05rem", marginTop:"1rem" }}>
                Busque qualquer vinho do mundo
              </p>
            </div>
          )}

          {/* Results */}
          {wines.length > 0 && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:"1rem", flexWrap:"wrap", gap:".5rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:".8rem", flexWrap:"wrap" }}>
                  <p style={{ fontSize:".58rem", color:"var(--muted)", letterSpacing:".15em", textTransform:"uppercase" }}>
                    {wines.length} vinhos · "{query}"
                  </p>
                  {state === "enriching" && (
                    <span style={{ fontSize:".52rem", color:"#e88", padding:"2px 9px", borderRadius:100,
                      background:"rgba(120,20,40,.25)", border:"1px solid rgba(200,60,80,.25)",
                      animation:"pulse 1.4s ease-in-out infinite" }}>
                      🍇 buscando Vivino...
                    </span>
                  )}
                  {state === "done" && wines.some(w => w._viv) && (
                    <span style={{ fontSize:".52rem", color:"#e88", padding:"2px 9px", borderRadius:100,
                      background:"rgba(120,20,40,.25)", border:"1px solid rgba(200,60,80,.25)" }}>
                      🍇 {wines.filter(w => w._viv).length} com dados Vivino
                    </span>
                  )}
                </div>
                <button className="chip" onClick={() => {
                  setState("idle"); setWines([]); setSelected(null); setQuery(""); setDebugErr("");
                }}>
                  Nova busca
                </button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr",
                gap:"1.4rem", alignItems:"start" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:".65rem" }}>
                  {wines.map((w, i) => (
                    <WineCard key={w.nome + i} wine={w} index={i}
                      selected={selected?.nome === w.nome}
                      onSelect={w2 => setSelected(selected?.nome === w2.nome ? null : w2)}
                    />
                  ))}
                </div>
                {selected && <DetailPanel wine={selected} onClose={() => setSelected(null)}/>}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
