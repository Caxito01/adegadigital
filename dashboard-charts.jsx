import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
  LineChart, Line
} from "recharts";

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#0e0808;--card:#180d0d;--card2:#1e1010;
      --border:#2a1515;--border2:#3a1c1c;
      --text:#f0e8e0;--text2:#c4a882;--muted:#7a5c4a;
      --accent:#c9793a;--accent2:#e8a86a;
      --wine:#8b1a2e;--wine2:#a82840;--wine3:#c93050;
      --gold:#c8a84b;--gold2:#e2c46a;
      --green:#4a7c59;--purple:#7c4a8b;
      --white-wine:#d4c070;--rose:#d4688a;--sparkling:#70aad4;
    }
    body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;min-height:100vh}
    .serif{font-family:'Cormorant Garamond',serif}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{animation:fadeUp .5s ease-out forwards}
    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1.3rem 1.5rem}
    .card-title{font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem}
    .stat-val{font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:300;line-height:1}
    .chip{padding:4px 12px;border:1px solid var(--border2);border-radius:100px;font-size:.6rem;color:var(--muted);cursor:pointer;transition:all .2s;background:transparent;font-family:'DM Mono',monospace}
    .chip.active,.chip:hover{border-color:var(--accent);color:var(--accent2);background:rgba(201,121,58,.1)}
  `}</style>
);

/* ─── DADOS ───────────────────────────────── */
const topVinhos = [
  { nome:"Penfolds Grange",       pais:"🇦🇺 Austrália", pts:98, preco:3200, tipo:"Tinto"    },
  { nome:"Opus One",              pais:"🇺🇸 EUA",        pts:97, preco:2800, tipo:"Tinto"    },
  { nome:"Catena Zapata Adrianna",pais:"🇦🇷 Argentina",  pts:97, preco:1800, tipo:"Tinto"    },
  { nome:"Dom Pérignon",          pais:"🇫🇷 França",     pts:96, preco:1400, tipo:"Espumante"},
  { nome:"Sassicaia",             pais:"🇮🇹 Itália",     pts:96, preco:1200, tipo:"Tinto"    },
  { nome:"Almaviva",              pais:"🇨🇱 Chile",      pts:95, preco:850,  tipo:"Tinto"    },
  { nome:"Barca Velha",           pais:"🇵🇹 Portugal",   pts:95, preco:780,  tipo:"Tinto"    },
  { nome:"Miolo Lote 43",         pais:"🇧🇷 Brasil",     pts:92, preco:320,  tipo:"Tinto"    },
];

const porTipo = [
  { name:"Tinto",      value:48, color:"var(--wine2)"     },
  { name:"Branco",     value:24, color:"var(--white-wine)" },
  { name:"Espumante",  value:14, color:"var(--sparkling)"  },
  { name:"Rosé",       value:10, color:"var(--rose)"       },
  { name:"Sobremesa",  value:4,  color:"var(--gold)"       },
];

const porRegiao = [
  { regiao:"Bordeaux",     vinhos:1240, media:91 },
  { regiao:"Toscana",      vinhos:980,  media:90 },
  { regiao:"Mendoza",      vinhos:860,  media:89 },
  { regiao:"Napa Valley",  vinhos:740,  media:92 },
  { regiao:"Borgonha",     vinhos:620,  media:93 },
  { regiao:"Serra Gaúcha", vinhos:480,  media:87 },
  { regiao:"Douro",        vinhos:390,  media:90 },
  { regiao:"Champagne",    vinhos:310,  media:91 },
];

const perfilUvas = [
  { uva:"Cabernet",  corpo:95, taninos:92, acidez:72, frutado:78, especiaria:80 },
  { uva:"Malbec",    corpo:88, taninos:78, acidez:68, frutado:90, especiaria:72 },
  { uva:"Pinot Noir",corpo:65, taninos:55, acidez:85, frutado:88, especiaria:60 },
  { uva:"Chardonnay",corpo:78, taninos:15, acidez:75, frutado:82, especiaria:55 },
  { uva:"Merlot",    corpo:80, taninos:68, acidez:65, frutado:85, especiaria:65 },
];

const precoScore = [
  { preco:80,  pts:85, nome:"Miolo Reserva",    tipo:"Tinto"    },
  { preco:150, pts:88, nome:"Salton Intenso",   tipo:"Tinto"    },
  { preco:320, pts:92, nome:"Miolo Lote 43",    tipo:"Tinto"    },
  { preco:480, pts:91, nome:"Casa Valduga 130", tipo:"Branco"   },
  { preco:850, pts:95, nome:"Almaviva",         tipo:"Tinto"    },
  { preco:1200,pts:96, nome:"Sassicaia",        tipo:"Tinto"    },
  { preco:1400,pts:96, nome:"Dom Pérignon",     tipo:"Espumante"},
  { preco:1800,pts:97, nome:"Catena Adrianna",  tipo:"Tinto"    },
  { preco:2800,pts:97, nome:"Opus One",         tipo:"Tinto"    },
  { preco:3200,pts:98, nome:"Penfolds Grange",  tipo:"Tinto"    },
  { preco:220, pts:89, nome:"Malbec Trapiche",  tipo:"Tinto"    },
  { preco:680, pts:93, nome:"Rutini Apartado",  tipo:"Tinto"    },
  { preco:120, pts:86, nome:"Prosecco DOC",     tipo:"Espumante"},
  { preco:560, pts:92, nome:"Barolo Borgogno",  tipo:"Tinto"    },
];

const tendencias = [
  { ano:"2018", tinto:88, branco:82, espumante:79 },
  { ano:"2019", tinto:90, branco:84, espumante:82 },
  { ano:"2020", tinto:87, branco:86, espumante:80 },
  { ano:"2021", tinto:91, branco:85, espumante:84 },
  { ano:"2022", tinto:93, branco:87, espumante:86 },
  { ano:"2023", tinto:92, branco:88, espumante:88 },
];

const TIPO_COLORS = {
  "Tinto":"var(--wine2)", "Branco":"var(--white-wine)",
  "Rosé":"var(--rose)", "Espumante":"var(--sparkling)", "Sobremesa":"var(--gold)"
};

/* ─── TOOLTIP CUSTOM ─────────────────────── */
const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:8,
      padding:".7rem .9rem", fontSize:".62rem", color:"var(--text2)" }}>
      {label && <p style={{ color:"var(--muted)", marginBottom:4 }}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color || "var(--text2)" }}>
          {p.name}: <span style={{ fontWeight:600 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── KPI CARD ────────────────────────────── */
function KPI({ label, value, sub, color = "var(--gold)" }) {
  return (
    <div className="card fade-up" style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
      <p className="card-title" style={{ marginBottom:".4rem" }}>{label}</p>
      <p className="stat-val" style={{ color }}>{value}</p>
      {sub && <p style={{ fontSize:".6rem", color:"var(--muted)" }}>{sub}</p>}
    </div>
  );
}

/* ─── MAIN ────────────────────────────────── */
export default function WineDashboard() {
  const [uvaSel, setUvaSel] = useState("Cabernet");
  const uvaData = perfilUvas.find(u => u.uva === uvaSel) || perfilUvas[0];
  const radarData = ["corpo","taninos","acidez","frutado","especiaria"].map(k => ({
    attr: k.charAt(0).toUpperCase() + k.slice(1),
    value: uvaData[k]
  }));

  return (
    <>
      <S/>
      <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"2rem 1.5rem 4rem" }}>

        {/* Header */}
        <div style={{ maxWidth:1100, margin:"0 auto 2rem" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"1rem", marginBottom:".3rem" }}>
            <h1 className="serif" style={{ fontSize:"2rem", fontWeight:300, fontStyle:"italic", color:"var(--text)" }}>
              Adega Digital
            </h1>
            <span style={{ fontSize:".55rem", color:"var(--muted)", letterSpacing:".2em", textTransform:"uppercase" }}>
              · Dashboard Analytics
            </span>
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,var(--border2),transparent)", marginTop:"1rem" }}/>
        </div>

        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexDirection:"column", gap:"1.5rem" }}>

          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"1rem" }}>
            <KPI label="Vinhos catalogados"  value="14.280"  sub="base global"          color="var(--gold)"/>
            <KPI label="Pontuação média"     value="88.4"    sub="escala 100 pts"        color="var(--accent2)"/>
            <KPI label="Regiões cobertas"    value="312"     sub="em 42 países"          color="var(--green)"/>
            <KPI label="Safra em destaque"   value="2019"    sub="ano excepcional"       color="var(--wine2)"/>
            <KPI label="Melhor custo-benef." value="R$320"   sub="Miolo Lote 43 · 92pts" color="var(--white-wine)"/>
          </div>

          {/* Row 2 — Donut + Barras por Região */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"1.2rem" }}>

            <div className="card">
              <p className="card-title">a) Distribuição por Tipo</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={porTipo} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {porTipo.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[`${v}%`]} contentStyle={{ background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text2)", fontSize:".62rem" }}/>
                  <Legend iconSize={8} wrapperStyle={{ fontSize:".6rem" }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <p className="card-title">b) Vinhos & Pontuação Média por Região</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porRegiao} layout="vertical" margin={{ left:10, right:30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                  <XAxis type="number" tick={{ fill:"var(--muted)", fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="regiao" tick={{ fill:"var(--text2)", fontSize:10 }} axisLine={false} tickLine={false} width={90}/>
                  <Tooltip content={<TT/>}/>
                  <Legend iconSize={8} wrapperStyle={{ fontSize:".6rem" }}/>
                  <Bar dataKey="vinhos" name="Qtd. vinhos" fill="var(--wine2)" radius={[0,4,4,0]} barSize={12}/>
                  <Bar dataKey="media"  name="Score médio" fill="var(--gold)"  radius={[0,4,4,0]} barSize={12}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3 — Radar perfil uva + Scatter preço vs score */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>

            <div className="card">
              <p className="card-title">c) Perfil Sensorial por Uva</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", marginBottom:".8rem" }}>
                {perfilUvas.map(u => (
                  <button key={u.uva} className={`chip ${uvaSel===u.uva?"active":""}`}
                    onClick={() => setUvaSel(u.uva)}>{u.uva}</button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)"/>
                  <PolarAngleAxis dataKey="attr" tick={{ fill:"var(--muted)", fontSize:10 }}/>
                  <PolarRadiusAxis angle={90} domain={[0,100]} tick={false} axisLine={false}/>
                  <Radar name={uvaSel} dataKey="value" stroke="var(--wine2)" fill="var(--wine2)" fillOpacity={0.25}/>
                  <Tooltip contentStyle={{ background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text2)", fontSize:".62rem" }}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <p className="card-title">d) Preço vs Pontuação</p>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top:10, right:20, bottom:10, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="preco" name="Preço (R$)" tick={{ fill:"var(--muted)", fontSize:9 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                    label={{ value:"Preço →", position:"insideBottomRight", fill:"var(--muted)", fontSize:9, offset:-5 }}
                  />
                  <YAxis dataKey="pts" name="Score" domain={[82,100]}
                    tick={{ fill:"var(--muted)", fontSize:9 }} axisLine={false} tickLine={false}/>
                  <ZAxis range={[40,200]}/>
                  <Tooltip cursor={{ strokeDasharray:"3 3" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:8, padding:".6rem .8rem", fontSize:".6rem", color:"var(--text2)" }}>
                          <p style={{ color:"var(--text)", marginBottom:3, fontFamily:"'Cormorant Garamond',serif", fontSize:".9rem" }}>{d.nome}</p>
                          <p>Score: <b style={{ color:"var(--gold)" }}>{d.pts}</b></p>
                          <p>Preço: <b style={{ color:"var(--accent2)" }}>R$ {d.preco}</b></p>
                          <p style={{ color: TIPO_COLORS[d.tipo] || "var(--muted)" }}>{d.tipo}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={precoScore} name="Vinhos"
                    fill="var(--wine2)"
                    shape={(props) => {
                      const c = TIPO_COLORS[props.tipo] || "var(--wine2)";
                      return <circle cx={props.cx} cy={props.cy} r={6} fill={c} fillOpacity={0.8} stroke={c} strokeWidth={1}/>;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", marginTop:".5rem" }}>
                {Object.entries(TIPO_COLORS).map(([t,c]) => (
                  <span key={t} style={{ display:"flex", alignItems:"center", gap:4, fontSize:".52rem", color:"var(--muted)" }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }}/>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4 — Top vinhos + Tendência de scores */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>

            <div className="card">
              <p className="card-title">e) Top Vinhos por Pontuação</p>
              <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                {topVinhos.map((v, i) => (
                  <div key={v.nome} style={{ display:"flex", alignItems:"center", gap:".8rem",
                    padding:".55rem .7rem", background:"var(--card2)", borderRadius:8,
                    border:"1px solid var(--border)" }}>
                    <span style={{ fontSize:".55rem", color:"var(--muted)", width:16, textAlign:"center" }}>
                      {i+1}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="serif" style={{ fontSize:".88rem", color:"var(--text)", lineHeight:1.2,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.nome}</p>
                      <p style={{ fontSize:".52rem", color:"var(--muted)", marginTop:1 }}>{v.pais}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:".5rem", flexShrink:0 }}>
                      <span style={{ fontSize:".55rem", padding:"2px 7px", borderRadius:100,
                        background: `${TIPO_COLORS[v.tipo]}22`,
                        color: TIPO_COLORS[v.tipo],
                        border: `1px solid ${TIPO_COLORS[v.tipo]}44` }}>
                        {v.tipo}
                      </span>
                      <span className="serif" style={{ fontSize:"1.1rem", color:"var(--gold)", minWidth:28, textAlign:"right" }}>
                        {v.pts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="card-title">f) Tendência de Score Médio por Safra</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendencias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="ano" tick={{ fill:"var(--muted)", fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis domain={[76,96]} tick={{ fill:"var(--muted)", fontSize:10 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<TT/>}/>
                  <Legend iconSize={8} wrapperStyle={{ fontSize:".6rem" }}/>
                  <Line type="monotone" dataKey="tinto"     name="Tinto"     stroke="var(--wine2)"      strokeWidth={2} dot={{ r:4, fill:"var(--wine2)" }}/>
                  <Line type="monotone" dataKey="branco"    name="Branco"    stroke="var(--white-wine)" strokeWidth={2} dot={{ r:4, fill:"var(--white-wine)" }}/>
                  <Line type="monotone" dataKey="espumante" name="Espumante" stroke="var(--sparkling)"  strokeWidth={2} dot={{ r:4, fill:"var(--sparkling)" }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign:"center", paddingTop:".5rem",
            fontSize:".5rem", color:"var(--muted)", letterSpacing:".15em", textTransform:"uppercase" }}>
            Adega Digital · Dashboard Analytics · Dados simulados para demonstração
          </div>

        </div>
      </div>
    </>
  );
}
