# 🍷 Adega Digital

> Wine Explorer powered by **Claude AI Sommelier** + Vivino API enrichment

![React](https://img.shields.io/badge/React-Artifact-61DAFB?style=flat&logo=react)
![Claude](https://img.shields.io/badge/Claude-AI-orange?style=flat)
![Vivino](https://img.shields.io/badge/Vivino-API-8B1A2E?style=flat)
![Three.js](https://img.shields.io/badge/Three.js-3D_Charts-black?style=flat)

---

## 📦 Arquivos do projeto

| Arquivo | Descrição |
|---|---|
| `wine-explorer.jsx` | App principal — busca vinhos com Claude AI + Vivino |
| `dashboard-charts.jsx` | Dashboard com 6 tipos de gráficos (Donut, Radar, Gauge...) |
| `chart-gallery.html` | Galeria com 14 gráficos — 6 em 3D (Three.js) + 8 avançados |

---

## 🚀 Como usar

Todos os arquivos `.jsx` funcionam como **React Artifacts no Claude.ai**:

1. Acesse [claude.ai](https://claude.ai)
2. Cole o conteúdo do arquivo em uma mensagem
3. O Claude renderiza o artifact interativo

---

## 🍷 Wine Explorer — Funcionalidades

- 🔍 **Busca livre** por nome, uva, região, safra, sabor, país
- 🤖 **Claude AI** como sommelier principal (sempre disponível)
- 🍇 **Vivino API** enriquece com rating real, imagem do rótulo e preço
- 📊 **Perfil de sabor** — acidez, taninos, corpo, frutado
- 🍽 **Harmonização** com sugestões de pratos
- 🌡 Temperatura de serviço, decantação, potencial de guarda
- 🔗 Link direto para a página do vinho na Vivino

### Como funciona a integração

```
Busca do usuário
      │
      ▼
Claude AI Sommelier ──► 5-6 vinhos reais com dados completos
      │
      ▼ (paralelo, não bloqueia)
Vivino API (corsproxy.io)
      │
      ├── ✅ Sucesso → adiciona imagem, rating real, badge 🍇
      └── ❌ Falha  → Claude já garantiu os dados, nada quebra
```

---

## 📊 Chart Gallery — Tipos de gráfico

### 🎲 3D (Three.js — rotação interativa)
- 3D Bar Chart
- 3D Scatter Plot
- 3D Surface / Terrain
- 3D Donut extrudado
- 3D Stacked Bars
- 3D Globe com pontos por país

### 📈 2D Avançados
- Heatmap
- Treemap
- Waterfall Chart
- Bubble Chart
- Step Area Chart
- Lollipop Chart
- Sankey Diagram
- Chord Diagram
- Gantt simplificado

---

## 🛠 Tecnologias

- **React** + Tailwind (artifacts claude.ai)
- **Recharts** — gráficos 2D do dashboard
- **Three.js r128** — gráficos 3D
- **Anthropic API** — `claude-sonnet-4-20250514`
- **Vivino API** (não-oficial) via `corsproxy.io`

---

## ⚠️ Observações

- A Vivino API é **não-oficial** e pode mudar sem aviso
- O `corsproxy.io` pode ser bloqueado dependendo do ambiente
- Para produção, recomenda-se **Wine-Searcher API** ou **WineVybe API**

---

## 📡 APIs de vinho recomendadas para produção

| API | Dados | Plano grátis |
|---|---|---|
| [Wine-Searcher](https://wine-searcher.com/trade/api) | Preço, score críticos, ABV | 100 calls/dia |
| [WineVybe](https://winevybe.com/wine-api) | Sabor, harmonização, regiões | Trial disponível |
| [Global Wine Score](https://www.globalwinescore.com) | Score agregado de críticos | Trial disponível |
| [api4.ai Wine Rec](https://api4.ai/apis/wine-rec) | Reconhecimento de rótulo por imagem | Demo gratuita |

---

*Desenvolvido com Claude.ai · Caxito01*
