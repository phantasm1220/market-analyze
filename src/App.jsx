import { useState, useEffect, useCallback, useRef } from "react";

// ── CONSTANTS
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const PROXY        = "https://market-proxy.yuusuke19960624.workers.dev";

// ── SECTOR DEFINITIONS
const SECTORS = [
  { id:"quantum",        name:"量子コンピューティング",     icon:"⬡", color:"#00f5d4", tickers:["IONQ","RGTI","QUBT","IBM","GOOGL"],    etf:"QTUM",  category:"テクノロジー"   },
  { id:"humanoid",       name:"ヒューマノイドロボット",     icon:"◈", color:"#f72585", tickers:["TSLA","PATH","FARO","ABB","TER"],        etf:"ROBO",  category:"ロボティクス"   },
  { id:"biotech_ai",     name:"AI創薬・バイオテック",       icon:"⬢", color:"#a855f7", tickers:["RXRX","SDGR","EXAI","BEAM","CRSP"],      etf:"ARKG",  category:"バイオ・医療"   },
  { id:"energy_storage", name:"次世代エネルギー貯蔵",       icon:"◇", color:"#f8961e", tickers:["QS","SLDP","FLUX","FREY","AMPS"],        etf:"LIT",   category:"エネルギー"     },
  { id:"spatial",        name:"空間コンピューティング",     icon:"◉", color:"#4cc9f0", tickers:["AAPL","META","SNAP","VUZI","MVIS"],      etf:"METV",  category:"テクノロジー"   },
  { id:"nuclear_smr",    name:"次世代原子力（SMR）",        icon:"✦", color:"#90e0ef", tickers:["CCJ","NNE","SMR","OKLO","UUUU"],         etf:"NLR",   category:"エネルギー"     },
  { id:"defense_tech",   name:"防衛・宇宙テック",           icon:"▲", color:"#e63946", tickers:["PLTR","RKLB","KTOS","AXON","LHX"],      etf:"ITA",   category:"防衛・宇宙"     },
  { id:"agri_tech",      name:"アグリテック・フードテック", icon:"❋", color:"#52b788", tickers:["AGFY","APPH","AVO","VITL","BYND"],      etf:"DIET",  category:"農業・食料"     },
  { id:"cyber_security", name:"サイバーセキュリティ",       icon:"⬛", color:"#ff6b6b", tickers:["CRWD","PANW","ZS","S","CYBR"],          etf:"CIBR",  category:"テクノロジー"   },
  { id:"climate_tech",   name:"気候テック・カーボン",       icon:"◎", color:"#06d6a0", tickers:["FSLR","ENPH","RUN","PLUG","BE"],        etf:"ICLN",  category:"エネルギー"     },
  { id:"fintech_defi",   name:"フィンテック・DeFi",         icon:"◆", color:"#ffd60a", tickers:["COIN","SQ","AFRM","SOFI","UPST"],       etf:"FINX",  category:"金融"           },
  { id:"longevity",      name:"長寿・アンチエイジング",     icon:"◑", color:"#ff9e00", tickers:["UNITY","SENS","NVTA","ILMN","TMO"],     etf:"ARKG",  category:"バイオ・医療"   },
  { id:"autonomous",     name:"自動運転・モビリティ",       icon:"⊕", color:"#3a86ff", tickers:["TSLA","LAZR","INVZ","OUST","MBLY"],     etf:"DRIV",  category:"モビリティ"     },
  { id:"edge_ai",        name:"エッジAI・AIチップ",         icon:"▣", color:"#fb5607", tickers:["NVDA","AMD","INTC","QCOM","MRVL"],      etf:"SOXQ",  category:"半導体"         },
  { id:"water_tech",     name:"水・資源テック",             icon:"〇", color:"#48cae4", tickers:["XYL","AWK","ECL","FELE","NLC"],         etf:"PHO",   category:"資源"           },
  { id:"mental_health",  name:"デジタルヘルス・メンタル",   icon:"♡", color:"#ff85a1", tickers:["TDOC","ACCD","PHR","GDRX","HIMS"],      etf:"EDOC",  category:"バイオ・医療"   },
  { id:"supply_chain",   name:"サプライチェーンAI",         icon:"⊞", color:"#aacc00", tickers:["GTLB","TIVE","CEVA","SMAR","AVAV"],     etf:"THNQ",  category:"ロジスティクス" },
  { id:"space_economy",  name:"宇宙経済・衛星",             icon:"★", color:"#c77dff", tickers:["RKLB","ASTS","MNTS","SPIR","SATL"],     etf:"UFO",   category:"防衛・宇宙"     },
  { id:"industrial_iot", name:"産業IoT・スマート工場",      icon:"⊟", color:"#b7e4c7", tickers:["ROK","PTC","ITRI","OLED","ZBRA"],       etf:"ARKQ",  category:"製造"           },
  { id:"ai_infra",       name:"AIインフラ・データセンター", icon:"▦", color:"#ff9f1c", tickers:["EQIX","DLR","SMCI","VRT","DELL"],       etf:"BOTZ",  category:"テクノロジー"   },
];
const CATEGORIES = ["すべて", ...Array.from(new Set(SECTORS.map((s) => s.category)))];

// ── JAPAN STOCKS
const JP_STOCKS = {
  quantum:        [{name:"富士通",code:"6702",note:"量子コンピュータ開発・商用化推進"},{name:"NEC",code:"6701",note:"量子暗号通信の研究開発"},{name:"東芝",code:"6502",note:"量子通信・暗号技術の実用化"}],
  humanoid:       [{name:"ファナック",code:"6954",note:"産業用ロボット世界トップクラス"},{name:"安川電機",code:"6506",note:"サービスロボット・協働ロボット"},{name:"ソフトバンクG",code:"9984",note:"Pepper等ヒューマノイドロボット投資"}],
  biotech_ai:     [{name:"第一三共",code:"4568",note:"AI活用した新薬開発を推進"},{name:"武田薬品",code:"4502",note:"AIプラットフォームで創薬加速"},{name:"塩野義製薬",code:"4507",note:"AI創薬スタートアップへの投資"}],
  energy_storage: [{name:"パナソニックHD",code:"6752",note:"EV用全固体電池開発・Tesla供給"},{name:"TDK",code:"6762",note:"次世代電池材料・全固体電池"},{name:"村田製作所",code:"6981",note:"小型二次電池・全固体電池開発"}],
  spatial:        [{name:"ソニーG",code:"6758",note:"XRヘッドセット・空間映像技術"},{name:"スタートトゥデイ",code:"3092",note:"空間コンピューティングで試着体験"},{name:"凸版印刷",code:"7911",note:"メタバース・XRコンテンツ事業"}],
  nuclear_smr:    [{name:"日立製作所",code:"6501",note:"SMR（小型モジュール炉）開発参画"},{name:"三菱重工",code:"7011",note:"次世代原子炉の設計・建設"},{name:"東京電力HD",code:"9501",note:"SMR導入検討・原子力再稼働"}],
  defense_tech:   [{name:"三菱重工",code:"7011",note:"防衛装備品・ドローン・ミサイル"},{name:"川崎重工",code:"7012",note:"防衛省向け航空機・潜水艦"},{name:"NEC",code:"6701",note:"防衛向けシステム・サイバーセキュリティ"}],
  agri_tech:      [{name:"クボタ",code:"6326",note:"スマート農業・自動農機"},{name:"デンソー",code:"6902",note:"農業ロボット・精密農業技術"},{name:"イノチオHD",code:"1732",note:"農業ICT・植物工場"}],
  cyber_security: [{name:"NRI（野村総研）",code:"4307",note:"セキュリティ診断・SOCサービス"},{name:"KDDI",code:"9433",note:"法人向けセキュリティ事業拡大"},{name:"FFRIセキュリティ",code:"3692",note:"国産EDR・サイバーセキュリティ専業"}],
  climate_tech:   [{name:"三菱商事",code:"8058",note:"洋上風力・再エネ事業を積極展開"},{name:"東レ",code:"3402",note:"風力ブレード・水処理膜素材"},{name:"シャープ",code:"6753",note:"太陽電池・ペロブスカイト開発"}],
  fintech_defi:   [{name:"SBI HD",code:"8473",note:"暗号資産・DeFi事業を国内主導"},{name:"マネックスG",code:"8698",note:"コインチェック保有・暗号資産取引"},{name:"GMOインターネット",code:"9449",note:"暗号資産マイニング・取引所運営"}],
  longevity:      [{name:"ロート製薬",code:"4527",note:"再生医療・アンチエイジング研究"},{name:"富士フイルムHD",code:"4901",note:"再生医療・細胞治療事業"},{name:"テルモ",code:"4543",note:"医療機器・再生医療デバイス"}],
  autonomous:     [{name:"トヨタ自動車",code:"7203",note:"自動運転プラットフォーム・Woven City"},{name:"アイシン",code:"7259",note:"自動運転向けADAS部品"},{name:"デンソー",code:"6902",note:"自動運転センサー・制御システム"}],
  edge_ai:        [{name:"ルネサスエレクトロ",code:"6723",note:"車載・産業向けAIチップ"},{name:"ソシオネクスト",code:"6526",note:"エッジAI向けカスタムSoC"},{name:"東京エレクトロン",code:"8035",note:"半導体製造装置・AIチップ製造支援"}],
  water_tech:     [{name:"栗田工業",code:"6370",note:"水処理システム・純水装置"},{name:"オルガノ",code:"6368",note:"超純水製造・水処理設備"},{name:"日東電工",code:"6988",note:"逆浸透膜・水処理フィルター"}],
  mental_health:  [{name:"エムスリー",code:"2413",note:"医師向けプラットフォーム・デジタル治療"},{name:"メドレー",code:"4480",note:"オンライン診療・医療DX"},{name:"ウェルスナビ",code:"7342",note:"デジタル資産・メンタルウェルネス"}],
  supply_chain:   [{name:"日立製作所",code:"6501",note:"サプライチェーンDX・Lumada"},{name:"オービック",code:"4684",note:"ERPシステム・SCM最適化"},{name:"富士通",code:"6702",note:"AI活用サプライチェーン可視化"}],
  space_economy:  [{name:"三菱電機",code:"6503",note:"人工衛星・宇宙システム開発"},{name:"IHI",code:"7013",note:"ロケットエンジン・宇宙関連"},{name:"スカパーJSAT",code:"9412",note:"衛星通信・宇宙デブリ除去"}],
  industrial_iot: [{name:"オムロン",code:"6645",note:"産業IoT・スマートファクトリー"},{name:"キーエンス",code:"6861",note:"センサー・FAシステム世界トップ"},{name:"横河電機",code:"6841",note:"プラントIoT・デジタルツイン"}],
  ai_infra:       [{name:"さくらインターネット",code:"3778",note:"国産AIクラウド・GPU提供"},{name:"NTTデータG",code:"9613",note:"AIインフラ・クラウド移行支援"},{name:"富士通",code:"6702",note:"生成AI基盤・データセンター事業"}],
};

// ── HELPERS
const nowISO  = () => new Date().toISOString();
const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};
const lsGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ── PROXY FETCH HELPERS
async function proxyFetch(params) {
  const qs  = new URLSearchParams(params).toString();
  const res = await fetch(`${PROXY}/?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchYahooData(symbol) {
  const json   = await proxyFetch({ symbol, mode:"chart", type:"chart" });
  const result = json?.chart?.result?.[0];
  if (!result) return null;
  const meta    = result.meta;
  const ts      = result.timestamp    || [];
  const q       = result.indicators?.quote?.[0] || {};
  const closes  = q.close   || [];
  const volumes = q.volume  || [];
  const opens   = q.open    || [];
  const highs   = q.high    || [];
  const lows    = q.low     || [];
  const last    = closes.length - 1;
  const price   = meta.regularMarketPrice ?? closes[last];
  const prev    = meta.chartPreviousClose  ?? closes[last-1] ?? price;
  const chg     = price - prev;
  const chgPct  = prev ? (chg / prev) * 100 : 0;
  const days    = ts.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0,10),
    close: closes[i] ?? 0, open: opens[i] ?? 0,
    high: highs[i]  ?? 0, low:  lows[i]  ?? 0,
    volume: volumes[i] ?? 0,
  })).reverse();
  return {
    quote: { symbol, price: +price.toFixed(2), change: +chg.toFixed(2),
      changePct: +chgPct.toFixed(2), volume: meta.regularMarketVolume ?? volumes[last] ?? 0,
      prevClose: +prev.toFixed(2), high: meta.regularMarketDayHigh ?? highs[last] ?? 0,
      low: meta.regularMarketDayLow ?? lows[last] ?? 0,
      week52High: meta.fiftyTwoWeekHigh ?? 0, fetchedAt: nowISO() },
    days,
  };
}

async function fetchSpy() {
  try {
    const json   = await proxyFetch({ symbol:"SPY", mode:"spy" });
    const result = json?.chart?.result?.[0];
    if (!result) return null;
    const closes = result.indicators?.quote?.[0]?.close || [];
    const last   = closes.length - 1;
    const prev   = result.meta?.chartPreviousClose ?? closes[last-1] ?? closes[last];
    return { changePct: prev ? ((closes[last] - prev) / prev) * 100 : 0 };
  } catch { return null; }
}

// ── GEMINI API
async function callGemini(apiKey, prompt, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
      }),
    });
  } catch (e) { throw new Error(`Gemini接続エラー: ${e.message}`); }
  if (!res.ok) { const b = await res.text().catch(()=>""); throw new Error(`Gemini ${res.status}: ${b.slice(0,200)}`); }
  const reader = res.body.getReader();
  const dec    = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if (!d || d==="[DONE]") continue;
      try {
        const p = JSON.parse(d);
        const t = p.candidates?.[0]?.content?.parts?.filter((x)=>x.text)?.map((x)=>x.text)?.join("")||"";
        if (t) onChunk(t);
      } catch {}
    }
  }
}

// ── VOLUME ANALYSIS (Approach A)
function analyzeVolume(days) {
  if (!days || days.length < 5) return null;
  const n    = days.length;
  const avg20 = days.reduce((s,d)=>s+d.volume,0) / n;
  const avg5  = days.slice(0,5).reduce((s,d)=>s+d.volume,0) / 5;
  const vr    = days[0].volume / avg20;
  const p5d   = ((days[0].close - days[Math.min(4,n-1)].close) / days[Math.min(4,n-1)].close) * 100;
  const p20d  = n>=20 ? ((days[0].close-days[19].close)/days[19].close)*100 : p5d;
  const surgeDays = days.filter((d)=>d.volume > avg20*1.5).length;

  // ── Approach A: 仕手ノイズ除去 ──────────────────────────────────────────
  // 連続蓄積日数
  let consecutiveAboveAvg = 0;
  for (const d of days) { if (d.volume > avg20) consecutiveAboveAvg++; else break; }

  // 1日スパイク: 直近1日だけ2倍超で前後は平均以下
  const oneDaySpike = days[0].volume > avg20*2 &&
    (days[1]?.volume ?? 0) < avg20 * 1.2 &&
    (days[2]?.volume ?? 0) < avg20 * 1.2;

  // 急騰後の出来高増加 = 売り圧力シグナル
  const postRallySurge = p5d > 5 && vr > 1.8;

  // 静かな蓄積: 出来高増加なのに価格変動が小さく3日以上継続
  const isSteadyAccumulation = avg5 > avg20 * 1.2 && Math.abs(p5d) < 3 && consecutiveAboveAvg >= 3;

  return {
    volumeRatio: vr.toFixed(2), avg20: Math.round(avg20), avg5: Math.round(avg5),
    priceChange5d: p5d.toFixed(2), priceChange20d: p20d.toFixed(2), surgeDays,
    consecutiveAboveAvg, oneDaySpike, postRallySurge,
    isVolumeBreakout:     vr > 2.0 && !oneDaySpike,
    isSteadyAccumulation,
    recentVolumes: days.slice(0,21).map((d)=>({date:d.date.slice(5),vol:d.volume,close:d.close})).reverse(),
  };
}

// ── TECHNICAL INDICATORS (A+B+D)
function calcRSI(days, period=14) {
  if (!days || days.length < period + 1) return null;
  // days[0] = newest, reverse for calculation
  const closes = [...days].reverse().map((d) => d.close);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains  += diff;
    else           losses -= diff;
  }
  let avgGain = gains  / period;
  let avgLoss = losses / period;
  // Smooth for remaining candles
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain  = (avgGain  * (period - 1) + Math.max(diff, 0))  / period;
    avgLoss  = (avgLoss  * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function calcMA(days, period) {
  if (!days || days.length < period) return null;
  return days.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
}

function calcTechnicalScore(days, week52High) {
  if (!days || days.length < 21) return { score: 0, rsi: null, proximity: null, maOrder: null, bonus: false };

  // A. RSI (最大7点)
  const rsi = calcRSI(days);
  let rsiScore = 0;
  if (rsi !== null) {
    if      (rsi >= 60 && rsi < 70) rsiScore = 7;  // 買いゾーン
    else if (rsi >= 50 && rsi < 60) rsiScore = 3;  // 上昇始まり
    else if (rsi >= 70)             rsiScore = 2;  // 過熱
    else                            rsiScore = 0;  // 下降
  }

  // B. 52週高値接近度 (最大7点)
  const currentPrice = days[0].close;
  const high52 = week52High || Math.max(...days.map((d) => d.high));
  const proximity = high52 > 0 ? (currentPrice / high52) * 100 : 0;
  let proximityScore = 0;
  if      (proximity >= 85 && proximity < 95) proximityScore = 7;  // ブレイクアウト直前
  else if (proximity >= 75 && proximity < 85) proximityScore = 5;  // 仕込み局面
  else if (proximity >= 60 && proximity < 75) proximityScore = 2;
  else if (proximity >= 95)                   proximityScore = 3;  // 高値圏

  // D. 移動平均線の並び順 (最大6点)
  const ma5  = calcMA(days, 5);
  const ma10 = calcMA(days, 10);
  const ma20 = calcMA(days, 20);
  let maScore = 0;
  let maOrder = "neutral";
  if (ma5 && ma10 && ma20) {
    if (ma5 > ma10 && ma10 > ma20)      { maScore = 6; maOrder = "perfect"; }   // パーフェクトオーダー
    else if (ma5 > ma20)                { maScore = 3; maOrder = "partial"; }   // 部分的
    else if (ma20 > ma10 && ma10 > ma5) { maScore = 0; maOrder = "bearish"; }   // 逆順
  }

  // 複合ボーナス
  const bonus = rsiScore >= 6 && proximityScore >= 5 && maScore >= 5;
  const bonusScore = bonus ? 3 : 0;

  const score = Math.min(20, rsiScore + proximityScore + maScore + bonusScore);
  return {
    score,
    rsi:       rsi ? rsi.toFixed(1) : null,
    rsiScore,
    proximity: proximity ? proximity.toFixed(1) : null,
    proximityScore,
    ma5, ma10, ma20,
    maScore, maOrder,
    bonus,
  };
}

// ── COMPREHENSIVE SCORING (A+B+D+ETF)
function calcSectorScore(sqs, vd, etfQuote, etfDays, spyChangePct) {
  const valid = sqs.filter(Boolean);
  if (!valid.length) return { total:50, breakdown:{ price:0, vol:0, etf:0, insider:0, relative:0 } };

  // ① 価格モメンタム (±20点)
  const avgChg     = valid.reduce((a,q)=>a+q.changePct,0) / valid.length;
  const priceScore = Math.max(-20, Math.min(20, avgChg * 2));

  // ② 出来高蓄積 (最大30点、仕手ノイズ除去済み)
  let volRaw = 0;
  valid.forEach((q) => {
    const va = analyzeVolume(vd[q.symbol]);
    if (!va) return;
    let pts = 0;
    if (va.isSteadyAccumulation)               pts += 12;
    else if (va.isVolumeBreakout)              pts += 8;
    else if (parseFloat(va.volumeRatio) > 1.5) pts += 4;
    pts += Math.min(va.consecutiveAboveAvg, 5);
    if (va.oneDaySpike)    pts -= 8;
    if (va.postRallySurge) pts -= 6;
    volRaw += pts;
  });
  const volScore = Math.max(0, Math.min(30, volRaw / valid.length));

  // ③ ETF資金流入 (最大20点)
  let etfScore = 0;
  if (etfQuote && etfDays) {
    const va = analyzeVolume(etfDays);
    etfScore += Math.max(0, Math.min(10, (etfQuote.changePct||0) * 2));
    if (va?.isSteadyAccumulation)              etfScore += 10;
    else if (va?.isVolumeBreakout)             etfScore += 7;
    else if (parseFloat(va?.volumeRatio||0) > 1.3) etfScore += 4;
    if (va?.oneDaySpike) etfScore -= 5;
    etfScore = Math.max(0, Math.min(20, etfScore));
  }

  // ④ テクニカル複合 (最大20点) — RSI + 52週高値 + MA並び
  let techScore = 0;
  valid.forEach((q) => {
    techScore += calcTechnicalScore(vd[q.symbol], q.week52High||0).score;
  });
  const techScoreNorm = valid.length ? Math.min(20, techScore / valid.length) : 0;

  // ⑤ 相対強度 (最大10点) — SPY比
  let relScore = 0;
  if (spyChangePct != null) {
    relScore = Math.max(0, Math.min(10, (avgChg - spyChangePct) * 1.5));
  }

  // raw: -20〜80 → 0〜100にマップ
  const raw    = priceScore + volScore + etfScore + techScoreNorm + relScore;
  const mapped = Math.round(((raw + 20) / 100) * 100);

  return {
    total: Math.max(0, Math.min(100, mapped)),
    breakdown: {
      price:    Math.round(priceScore),
      vol:      Math.round(volScore),
      etf:      Math.round(etfScore),
      technical:Math.round(techScoreNorm),
      relative: Math.round(relScore),
    },
  };
}

// ── UI COMPONENTS
function VolumeChart({ data, avgVol, color }) {
  if (!data) return null;
  const max = Math.max(...data.map((d)=>d.vol), 1);
  const getColor = (vol) => {
    if (vol >= avgVol * 2.0) return "#ff6b6b";
    if (vol >= avgVol * 1.5) return "#facc15";
    if (vol >= avgVol)       return color;
    return `${color}33`;
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:"32px" }}>
        {data.map((d,i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end", height:"100%" }}>
            <div style={{ width:"100%", borderRadius:"2px", minHeight:"2px",
              height:`${(d.vol/max)*100}%`, background:getColor(d.vol) }}
              title={`${d.date}: ${(d.vol/1e6).toFixed(1)}M (avg比×${(d.vol/avgVol).toFixed(2)})`} />
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"4px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)" }}>出来高 (直近21日 / 左:古い→右:最新)</span>
        {[
          [`${color}33`,"平均以下"],
          [color,       "平均超"],
          ["#facc15",   "×1.5倍超"],
          ["#ff6b6b",   "×2倍超"],
        ].map(([c,l])=>(
          <span key={l} style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"9px", color:c }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"1px", background:c, display:"inline-block" }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreBreakdown({ breakdown, color }) {
  if (!breakdown) return null;
  const items = [
    { label:"価格モメンタム", val:breakdown.price,     max:20, tip:"平均騰落率から算出" },
    { label:"出来高蓄積",     val:breakdown.vol,       max:30, tip:"仕手ノイズ除去済みの本物の蓄積スコア" },
    { label:"ETF資金流入",    val:breakdown.etf,       max:20, tip:"セクターETFへの機関投資家の資金フロー" },
    { label:"テクニカル複合", val:breakdown.technical, max:20, tip:"RSI(過熱感) + 52週高値接近度 + MA並び順の複合スコア" },
    { label:"市場相対強度",   val:breakdown.relative,  max:10, tip:"S&P500比のアウトパフォーム度" },
  ];
  return (
    <div style={{ marginTop:"12px", padding:"12px", borderRadius:"10px", background:"rgba(0,0,0,0.3)", border:`1px solid ${color}20` }}>
      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.1em" }}>
        スコア内訳
      </div>
      {items.map(({ label, val, max, tip }) => (
        <div key={label} style={{ marginBottom:"6px" }} title={tip}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)" }}>{label}</span>
            <span style={{ fontSize:"11px", fontFamily:"monospace", color: val > 0 ? color : val < 0 ? "#f87171" : "rgba(255,255,255,0.3)" }}>
              {val > 0 ? "+" : ""}{val} / {max}
            </span>
          </div>
          <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"999px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.max(0,(val/max))*100}%`, background: val >= 0 ? color : "#f87171", borderRadius:"999px", transition:"width 0.7s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScanDateBadge({ isoDate, color }) {
  if (!isoDate) return null;
  const c = color || "rgba(255,255,255,0.4)";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"11px",
      padding:"2px 8px", borderRadius:"999px", background:`${c}18`, border:`1px solid ${c}28`, color:c }}>
      🕐 最終スキャン: {fmtDate(isoDate)}
    </span>
  );
}

function TickerRow({ quote, volumeData, color }) {
  const st = { fontSize:"11px", borderBottom:"1px solid rgba(255,255,255,0.05)", paddingTop:"8px", paddingBottom:"8px" };
  if (!quote) return <div style={st}><span style={{ color:"rgba(255,255,255,0.4)" }}>取得中...</span></div>;
  const va   = analyzeVolume(volumeData);
  const isUp = quote.changePct >= 0;

  // 仕手シグナル警告
  const hasSpikeWarning    = va?.oneDaySpike;
  const hasPostRallyWarning= va?.postRallySurge;

  return (
    <div style={st}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
          <a href={`https://finance.yahoo.co.jp/quote/${quote.symbol}`} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:"monospace", fontWeight:"bold", color:"white", fontSize:"13px",
              textDecoration:"none", borderBottom:`1px solid ${color}60` }}
            title={`Yahoo!ファイナンス で ${quote.symbol} を開く`}>
            {quote.symbol} ↗
          </a>
          {va?.isSteadyAccumulation && <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:"999px", background:"rgba(234,179,8,0.2)", color:"#facc15" }}>📦 静かな蓄積</span>}
          {va?.isVolumeBreakout     && <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:"999px", background:`${color}30`, color }}>🔥 出来高急増</span>}
          {hasSpikeWarning          && <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:"999px", background:"rgba(248,113,113,0.2)", color:"#f87171" }}>⚠ 1日スパイク</span>}
          {hasPostRallyWarning      && <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:"999px", background:"rgba(248,113,113,0.15)", color:"#fca5a5" }}>⚠ 急騰後増</span>}
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"monospace", fontWeight:"bold", color:"white", fontSize:"13px" }}>${quote.price.toFixed(2)}</div>
          <div style={{ fontFamily:"monospace", fontSize:"11px", color:isUp?"#34d399":"#f87171" }}>{isUp?"▲":"▼"} {Math.abs(quote.changePct).toFixed(2)}%</div>
        </div>
      </div>
      {va && (
        <div style={{ marginTop:"8px" }}>
          <VolumeChart data={va.recentVolumes} avgVol={va.avg20} color={color} />
          <div style={{ display:"flex", gap:"16px", marginTop:"6px", flexWrap:"wrap" }}>
            {[
              { label:"出来高比", value:(
                <span style={{ color:parseFloat(va.volumeRatio)>=2?"#ff6b6b":parseFloat(va.volumeRatio)>=1.5?"#facc15":"rgba(255,255,255,0.6)", fontWeight:parseFloat(va.volumeRatio)>=1.5?"bold":"normal" }}>
                  {parseFloat(va.volumeRatio)>=2?"🔴 ":parseFloat(va.volumeRatio)>=1.5?"🟡 ":""}{va.volumeRatio}倍{parseFloat(va.volumeRatio)>=2?" (急増)":parseFloat(va.volumeRatio)>=1.5?" (注意)":""}
                </span>
              )},
              { label:"5日騰落",  value:<span style={{ color:parseFloat(va.priceChange5d)>0?"#34d399":"#f87171" }}>{va.priceChange5d}%</span> },
              { label:"連続蓄積", value:<span style={{ color:va.consecutiveAboveAvg>=3?"#34d399":"rgba(255,255,255,0.5)" }}>{va.consecutiveAboveAvg}日</span> },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px" }}>
                <span style={{ color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>{label}</span>
                <span style={{ color:"rgba(255,255,255,0.2)" }}>:</span>
                {value}
              </div>
            ))}
          </div>
        </div>
      )}
      {quote.fetchedAt && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginTop:"4px" }}>取得: {fmtDate(quote.fetchedAt)}</div>}
    </div>
  );
}

function JpStocksPanel({ sector }) {
  const stocks = JP_STOCKS[sector.id] || [];
  if (!stocks.length) return null;
  return (
    <div style={{ marginTop:"16px", marginBottom:"4px" }}>
      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>🇯🇵 日本の関連銘柄</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {stocks.map((s) => (
          <div key={s.code} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"10px 12px", borderRadius:"10px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                {s.code !== "非上場" && s.code !== "未上場" ? (
                  <a href={`https://finance.yahoo.co.jp/quote/${s.code}.T`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily:"monospace", fontWeight:"bold", color:"white", fontSize:"13px", textDecoration:"none", borderBottom:`1px solid ${sector.color}60` }}>
                    {s.name} ↗
                  </a>
                ) : (
                  <span style={{ fontFamily:"monospace", fontWeight:"bold", color:"white", fontSize:"13px" }}>{s.name}</span>
                )}
                <span style={{ fontSize:"11px", fontFamily:"monospace", padding:"1px 6px", borderRadius:"6px", background:`${sector.color}20`, color:sector.color }}>
                  {s.code !== "非上場" && s.code !== "未上場" ? `${s.code}.T` : s.code}
                </span>
              </div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", marginTop:"4px" }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderMd(text, accent) {
  return text.split("\n").map((line,i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const nodes = parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:accent }}>{p}</strong> : p);
    if (line.match(/^#{1,2} /))     return <div key={i} style={{ fontWeight:"bold", color:"white", fontSize:"13px", marginTop:"16px", marginBottom:"4px" }}>{nodes}</div>;
    if (line.match(/^\d\./))        return <div key={i} style={{ marginTop:"8px", fontSize:"13px", color:"rgba(255,255,255,0.8)", lineHeight:"1.6" }}>{nodes}</div>;
    if (line.match(/^[🔍📊⚡🚨]/)) return <div key={i} style={{ fontWeight:"bold", color:"white", marginTop:"16px", marginBottom:"4px", fontSize:"13px" }}>{nodes}</div>;
    if (!line.trim())               return <div key={i} style={{ height:"8px" }} />;
    return <div key={i} style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)", lineHeight:"1.6" }}>{nodes}</div>;
  });
}

// ── TECHNICAL PANEL
function TechnicalPanel({ quotes, volumeData, color }) {
  const items = quotes.filter(Boolean).map((q) => {
    const days = volumeData[q.symbol];
    const ts   = calcTechnicalScore(days, q.week52High || 0);
    return { symbol: q.symbol, ts };
  }).filter((x) => x.ts.rsi !== null);

  if (!items.length) return null;

  const maLabel = { perfect:"📈 パーフェクト", partial:"➡ 部分的", bearish:"📉 下降", neutral:"－" };
  const rsiLabel = (rsi) => {
    const r = parseFloat(rsi);
    if (r >= 70) return { text:"過熱", color:"#f87171" };
    if (r >= 60) return { text:"買いゾーン", color:"#34d399" };
    if (r >= 50) return { text:"上昇始まり", color:"#facc15" };
    return { text:"下降", color:"rgba(255,255,255,0.4)" };
  };

  return (
    <div style={{ marginTop:"12px", padding:"12px", borderRadius:"10px", background:"rgba(0,0,0,0.25)", border:`1px solid ${color}20` }}>
      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>
        テクニカル指標 (RSI · 52週高値比 · MA並び)
      </div>
      {items.map(({ symbol, ts }) => {
        const rl = rsiLabel(ts.rsi);
        return (
          <div key={symbol} style={{ marginBottom:"10px", paddingBottom:"10px", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
              <span style={{ fontFamily:"monospace", fontWeight:"bold", color:"white", fontSize:"12px" }}>{symbol}</span>
              {ts.bonus && <span style={{ fontSize:"10px", padding:"1px 6px", borderRadius:"999px", background:`${color}30`, color }}>⭐ 複合ボーナス</span>}
              <span style={{ fontSize:"11px", fontFamily:"monospace", marginLeft:"auto", color:color }}>{ts.score}/20点</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
              {/* RSI */}
              <div style={{ padding:"6px 8px", borderRadius:"8px", background:"rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", marginBottom:"2px" }}>RSI(14)</div>
                <div style={{ fontSize:"13px", fontFamily:"monospace", fontWeight:"bold", color:rl.color }}>{ts.rsi}</div>
                <div style={{ fontSize:"9px", color:rl.color }}>{rl.text} +{ts.rsiScore}pt</div>
              </div>
              {/* 52週高値比 */}
              <div style={{ padding:"6px 8px", borderRadius:"8px", background:"rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", marginBottom:"2px" }}>52週高値比</div>
                <div style={{ fontSize:"13px", fontFamily:"monospace", fontWeight:"bold", color: parseFloat(ts.proximity)>=85?"#34d399":parseFloat(ts.proximity)>=75?"#facc15":"rgba(255,255,255,0.6)" }}>{ts.proximity}%</div>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.4)" }}>
                  {parseFloat(ts.proximity)>=85&&parseFloat(ts.proximity)<95?"直前":parseFloat(ts.proximity)>=75?"仕込み局面":parseFloat(ts.proximity)>=95?"高値圏":"—"} +{ts.proximityScore}pt
                </div>
              </div>
              {/* MA並び */}
              <div style={{ padding:"6px 8px", borderRadius:"8px", background:"rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", marginBottom:"2px" }}>MA並び</div>
                <div style={{ fontSize:"11px", fontWeight:"bold", color: ts.maOrder==="perfect"?"#34d399":ts.maOrder==="partial"?"#facc15":"rgba(255,255,255,0.4)" }}>
                  {maLabel[ts.maOrder]||"－"}
                </div>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.4)" }}>{"5▶10▶20"} +{ts.maScore}pt</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AIAnalysis({ sector, quotes, volumeData, etfQuote, spyChangePct, geminiKey }) {
  const KEY = `nw_analysis_${sector.id}`;
  const [saved,    setSaved]   = useState(()=>lsGet(KEY));
  const [stream,   setStream]  = useState("");
  const [loading,  setLoading] = useState(false);
  const [expanded, setExpanded]= useState(false);
  useEffect(()=>{ setStream(""); setSaved(lsGet(KEY)); setExpanded(false); }, [sector.id]);

  const run = async () => {
    if (!geminiKey) return;
    setLoading(true); setStream("");
    const stockSummary = quotes.filter(Boolean).map((q) => {
      const va = analyzeVolume(volumeData[q.symbol]);
      const signals = [];
      if (va?.isSteadyAccumulation) signals.push("静かな蓄積");
      if (va?.isVolumeBreakout)     signals.push("出来高急増(本物)");
      if (va?.oneDaySpike)          signals.push("⚠1日スパイク(ノイズ)");
      if (va?.postRallySurge)       signals.push("⚠急騰後増(売り圧)");
      return `${q.symbol}: $${q.price.toFixed(2)} (${q.changePct>0?"+":""}${q.changePct.toFixed(2)}%) | 出来高比×${va?.volumeRatio||"N/A"} | 連続蓄積${va?.consecutiveAboveAvg||0}日 | シグナル:[${signals.join(",")||"なし"}]`;
    }).join("\n") || "株価データ未取得";

    // テクニカルサマリー
    const techSummary = quotes.filter(Boolean).map((q) => {
      const ts = calcTechnicalScore(volumeData[q.symbol], q.week52High||0);
      return `${q.symbol}: RSI=${ts.rsi||"N/A"} 52週高値比=${ts.proximity||"N/A"}% MA=${ts.maOrder} (${ts.score}/20点)${ts.bonus?" ⭐複合ボーナス":""}`;
    }).join("\n") || "テクニカルデータ未取得";

    const etfSummary = etfQuote
      ? `セクターETF(${sector.etf}): ${etfQuote.changePct>0?"+":""}${etfQuote.changePct?.toFixed(2)}% | 出来高比×${analyzeVolume(null)?.volumeRatio||"N/A"}`
      : "ETFデータ未取得";

    const spySummary = spyChangePct !== null
      ? `SPY(市場平均): ${spyChangePct>0?"+":""}${spyChangePct?.toFixed(2)}%`
      : "";

    const prompt = `あなたは世界トップクラスのヘッジファンドマネージャーです。
Google検索で最新情報を調べながら、以下のデータを基に投資分析を日本語で行ってください。

【セクター】${sector.name}

【株価・出来高データ（仕手ノイズ除去済みシグナル付き）】
${stockSummary}

【テクニカル指標（RSI・52週高値比・MA並び）】
${techSummary}

【ETF・市場動向】
${etfSummary}
${spySummary}

以下を分析してください：
1. **なぜ今このセクターが次のブームになるか** — 最新ニュース・カタリストを検索して3つの根拠
2. **出来高・テクニカルデータの解釈** — 「⚠ノイズシグナル」を除外した本物の蓄積局面を読む。RSI・MA・52週高値比の複合シグナルも考慮する
3. **最も有望な銘柄トップ2** — データに基づく具体的な理由とリスク
4. **投資タイミングの判断基準** — どのシグナルが揃ったら買い時か（複数条件の組み合わせ）
5. **6〜18ヶ月シナリオ** — 強気・中立・弱気（数値目標付き）

辛口・具体的・実用的に。ノイズと本物のシグナルを明確に区別して。`;

    let full = "";
    try {
      await callGemini(geminiKey, prompt, (c)=>{ full+=c; setStream(full); });
      const rec = { text:full, scannedAt:nowISO() };
      lsSet(KEY, rec); setSaved(rec);
    } catch(e) { setStream(`エラー: ${e.message}`); }
    setLoading(false);
  };

  const display = stream || saved?.text;
  const date    = saved?.scannedAt;

  return (
    <div style={{ marginTop:"16px" }}>
      {!display && !loading && (
        <button onClick={run} disabled={!geminiKey} style={{ width:"100%", padding:"12px", borderRadius:"12px", fontSize:"13px", fontWeight:"600", cursor:geminiKey?"pointer":"not-allowed", opacity:geminiKey?1:0.3, background:`linear-gradient(135deg,${sector.color}22,${sector.color}44)`, border:`1px solid ${sector.color}`, color:sector.color, fontFamily:"'DM Mono',monospace" }}>
          ⚡ Gemini Web検索×AI分析を実行（ノイズ除去済み）
        </button>
      )}
      {loading && (
        <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"11px", color:sector.color, marginBottom:"8px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:sector.color }} className="ping" />
          {GEMINI_MODEL} がリアルタイム検索中...
        </div>
      )}
      {display && (
        <div style={{ borderRadius:"12px", padding:"16px", background:"rgba(0,0,0,0.5)", border:`1px solid ${sector.color}25` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", paddingBottom:"8px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"11px", fontWeight:"bold", color:sector.color }}>AI分析レポート（出来高×ETF×テクニカル統合）</span>
            <ScanDateBadge isoDate={date} color={sector.color} />
          </div>
          <div style={{ maxHeight:expanded?"none":"320px", overflow:expanded?"visible":"hidden", position:"relative" }}>
            {renderMd(display, sector.color)}
            {!expanded && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"60px", background:"linear-gradient(transparent,rgba(0,0,0,0.9))" }} />}
          </div>
          {!expanded && (
            <button onClick={()=>setExpanded(true)} style={{ width:"100%", marginTop:"8px", padding:"6px", borderRadius:"8px", fontSize:"11px", color:sector.color, background:`${sector.color}12`, border:`1px solid ${sector.color}30`, cursor:"pointer" }}>
              続きを読む ▼
            </button>
          )}
          <div style={{ marginTop:"12px", display:"flex", gap:"12px", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:"12px" }}>
              <button onClick={run} disabled={loading} style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer" }}>🔄 再分析</button>
              {expanded && <button onClick={()=>setExpanded(false)} style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer" }}>▲ 折りたたむ</button>}
            </div>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)" }}>localStorageに保存済み</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketScanner({ geminiKey, allScores }) {
  const KEY = "nw_scanner_full";
  const [saved,   setSaved]  = useState(()=>lsGet(KEY));
  const [stream,  setStream] = useState("");
  const [loading, setLoading]= useState(false);

  const run = async () => {
    if (!geminiKey) return;
    setLoading(true); setStream("");
    const top = [...allScores].sort((a,b)=>b.score-a.score).slice(0,8)
      .map((s)=>`${s.name}(総合${s.score}点 / 出来高蓄積${s.vol}点 / ETF${s.etf}点 / テクニカル${s.technical}点)`).join("\n");

    const prompt = `あなたは伝説的なヘッジファンドマネージャーです。Google検索で最新情報を調べながら、次の10倍株が生まれるセクターを特定してください。

【A+B+SEC統合モメンタムスコア上位セクター】
${top}

スコアの意味:
- 出来高蓄積: 仕手ノイズを除去した本物の機関投資家の累積買い（最大30点）
- ETF: セクターETFへの資金流入度（最大20点）
- テクニカル: RSI(過熱感)+52週高値接近度+MA並び順の複合スコア（最大20点）

🔍 **マクロ環境スキャン** — 最新ニュースを検索して金利・地政学・政策が恩恵を与えるセクター
📊 **スコアデータ解釈** — インサイダー買いとETF流入が重なるセクターを特定
⚡ **今すぐ注目すべきトップ3セクター** — 6ヶ月以内に動く根拠付きで
🚨 **最大リスク要因** — 見落としがちな視点

辛口・具体的・数値根拠付きで。`;

    let full = "";
    try {
      await callGemini(geminiKey, prompt, (c)=>{ full+=c; setStream(full); });
      lsSet(KEY, { text:full, scannedAt:nowISO(), scores:allScores }); setSaved({ text:full, scannedAt:nowISO() });
    } catch(e) { setStream(`エラー: ${e.message}`); }
    setLoading(false);
  };

  const display = stream || saved?.text;
  return (
    <div style={{ borderRadius:"16px", padding:"20px", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h2 style={{ fontSize:"15px", fontWeight:"bold", color:"white", margin:0 }}>🛰 全市場スキャン（A+B+SEC統合）</h2>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"4px" }}>出来高蓄積 × ETF流入 × RSI/MA/52週高値テクニカル 3軸分析</p>
        </div>
        <button onClick={run} disabled={loading||!geminiKey} style={{ padding:"8px 16px", borderRadius:"12px", fontSize:"12px", fontWeight:"bold", border:"none", background:"linear-gradient(135deg,#f72585,#7209b7)", color:"white", cursor:geminiKey&&!loading?"pointer":"not-allowed", opacity:(!geminiKey||loading)?0.4:1 }}>
          {loading?"スキャン中...":display?"🔄 再スキャン":"全市場スキャン"}
        </button>
      </div>
      {loading && (
        <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"11px", color:"#f472b6", marginBottom:"12px" }}>
          <div style={{ display:"flex", gap:"4px" }}>{[0,1,2].map(i=><div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#ec4899" }} className={`bounce-${i}`}/>)}</div>
          Gemini が全セクターを統合スキャン中...
        </div>
      )}
      {display ? (
        <div style={{ borderRadius:"12px", padding:"16px", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(247,37,133,0.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px", paddingBottom:"8px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"11px", fontWeight:"bold", color:"#f472b6" }}>全市場スキャンレポート</span>
            <ScanDateBadge isoDate={saved?.scannedAt} color="#f72585" />
          </div>
          {renderMd(display, "#f472b6")}
          <button onClick={run} style={{ marginTop:"12px", fontSize:"11px", color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer" }}>🔄 再スキャン</button>
        </div>
      ) : !loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
          {[["📦","出来高蓄積\n(ノイズ除去)"],["🏛","ETF\n資金流入"],["📐","RSI/MA\n52週高値"]].map(([icon,label],i)=>(
            <div key={i} style={{ borderRadius:"10px", padding:"12px", border:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)", textAlign:"center" }}>
              <div style={{ fontSize:"20px", marginBottom:"4px" }}>{icon}</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", whiteSpace:"pre-line" }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP
export default function App() {
  const [geminiKey,  setGeminiKey]  = useState(()=>lsGet("nw_gemini_key")||"");
  const [keysSet,    setKeysSet]    = useState(()=>!!lsGet("nw_gemini_key"));
  const [tab,        setTab]        = useState("sectors");
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [categoryFilter, setCategoryFilter] = useState("すべて");

  const [quotes,       setQuotes]       = useState(()=>lsGet("nw_quotes")||{});
  const [volumeData,   setVolumeData]   = useState(()=>lsGet("nw_volume")||{});
  const [etfQuotes,    setEtfQuotes]    = useState(()=>lsGet("nw_etf_quotes")||{});
  const [etfVolume,    setEtfVolume]    = useState(()=>lsGet("nw_etf_volume")||{});
  const [spyData,      setSpyData]      = useState(()=>lsGet("nw_spy")||null);
  const [stockSavedAt, setStockSavedAt] = useState(()=>lsGet("nw_stock_ts")||null);
  const [sectorScores, setSectorScores] = useState({});
  const [fetchingAll,  setFetchingAll]  = useState(false);
  const [fetchStatus,  setFetchStatus]  = useState({});

  const fetchedRef        = useRef(new Set(Object.keys(lsGet("nw_quotes")||{})));
  const fetchedEtfRef     = useRef(new Set(Object.keys(lsGet("nw_etf_quotes")||{})));

  const saveKeys = () => { lsSet("nw_gemini_key", geminiKey); setKeysSet(true); };

  // Persist stock data
  useEffect(() => {
    if (!Object.keys(quotes).length) return;
    const ts = nowISO(); setStockSavedAt(ts);
    lsSet("nw_quotes",quotes); lsSet("nw_volume",volumeData); lsSet("nw_stock_ts",ts);
  }, [quotes, volumeData]);

  useEffect(()=>{ if(Object.keys(etfQuotes).length) { lsSet("nw_etf_quotes",etfQuotes); lsSet("nw_etf_volume",etfVolume); } }, [etfQuotes,etfVolume]);
  useEffect(()=>{ if(spyData) lsSet("nw_spy",spyData); }, [spyData]);

  // Recalc scores
  useEffect(() => {
    const s = {};
    SECTORS.forEach((sec) => {
      const sqs  = sec.tickers.map((t)=>quotes[t]);
      const eq   = etfQuotes[sec.etf]||null;
      const evd  = etfVolume[sec.etf]||null;
      const spy  = spyData?.changePct??null;
      s[sec.id]  = calcSectorScore(sqs, volumeData, eq, evd, spy);
    });
    setSectorScores(s);
  }, [quotes, volumeData, etfQuotes, etfVolume, spyData]);

  // Fetch ticker
  const fetchTicker = useCallback(async (symbol) => {
    if (fetchedRef.current.has(symbol)) return;
    fetchedRef.current.add(symbol);
    setFetchStatus((p)=>({...p,[symbol]:"loading"}));
    try {
      const r = await fetchYahooData(symbol);
      if (r) { setQuotes((p)=>({...p,[symbol]:r.quote})); setVolumeData((p)=>({...p,[symbol]:r.days})); setFetchStatus((p)=>({...p,[symbol]:"done"})); }
      else   { setFetchStatus((p)=>({...p,[symbol]:"error"})); }
    } catch { setFetchStatus((p)=>({...p,[symbol]:"error"})); }
  }, []);

  // Fetch ETF
  const fetchEtf = useCallback(async (etfSymbol) => {
    if (fetchedEtfRef.current.has(etfSymbol)) return;
    fetchedEtfRef.current.add(etfSymbol);
    try {
      const r = await fetchYahooData(etfSymbol);
      if (r) { setEtfQuotes((p)=>({...p,[etfSymbol]:r.quote})); setEtfVolume((p)=>({...p,[etfSymbol]:r.days})); }
    } catch {}
  }, []);

  // Fetch SPY once
  useEffect(() => {
    if (!spyData) fetchSpy().then((r)=>{ if(r) setSpyData(r); });
  }, []);

  // Auto-fetch selected sector
  useEffect(() => {
    if (!keysSet || !selectedSector) return;
    selectedSector.tickers.filter((s)=>!fetchedRef.current.has(s)).forEach(fetchTicker);
    fetchEtf(selectedSector.etf);
  }, [selectedSector, keysSet]);

  const fetchAllTickers = async () => {
    if (fetchingAll) return;
    setFetchingAll(true);
    const allTickers = [...new Set(SECTORS.flatMap((s)=>s.tickers))].filter((s)=>!fetchedRef.current.has(s));
    const allEtfs    = [...new Set(SECTORS.map((s)=>s.etf))].filter((s)=>!fetchedEtfRef.current.has(s));

    for (let i=0; i<allTickers.length; i+=5) {
      await Promise.all(allTickers.slice(i,i+5).map(fetchTicker));
      if (i+5<allTickers.length) await new Promise((r)=>setTimeout(r,500));
    }
    for (const e of allEtfs)  { await fetchEtf(e); await new Promise((r)=>setTimeout(r,300)); }
    setFetchingAll(false);
  };

  const filteredSectors  = categoryFilter==="すべて" ? SECTORS : SECTORS.filter((s)=>s.category===categoryFilter);
  const rankedSectors    = [...SECTORS].sort((a,b)=>(sectorScores[b.id]?.total||50)-(sectorScores[a.id]?.total||50));
  const allScoresForScan = rankedSectors.map((s)=>({ name:s.name, score:sectorScores[s.id]?.total||50, ...sectorScores[s.id]?.breakdown }));

  const card   = (a,c)=>({ borderRadius:"12px", padding:"12px", cursor:"pointer", border:`1px solid ${a?c:"rgba(255,255,255,0.07)"}`, background:a?`${c}10`:"rgba(255,255,255,0.02)", boxShadow:a?`0 0 20px ${c}20`:"none", transition:"all 0.2s" });
  const tabBtn = (a)=>({ padding:"6px 12px", borderRadius:"12px", fontSize:"11px", border:`1px solid ${a?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)"}`, background:a?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)", color:a?"white":"rgba(255,255,255,0.35)", cursor:"pointer", fontFamily:"'DM Mono',monospace" });
  const chip   = (a)=>({ padding:"4px 10px", borderRadius:"8px", fontSize:"11px", border:`1px solid ${a?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.05)"}`, background:a?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.03)", color:a?"white":"rgba(255,255,255,0.35)", cursor:"pointer", fontFamily:"'DM Mono',monospace" });

  if (!keysSet) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"#07090f" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>▲</div>
          <h1 style={{ fontSize:"24px", fontWeight:"800", color:"white", margin:"0 0 8px", fontFamily:"'Syne',sans-serif" }}>NEXT WAVE</h1>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", margin:0 }}>出来高蓄積 × ETF × テクニカル(RSI/MA/52週高値) 統合分析</p>
        </div>
        <div style={{ borderRadius:"16px", padding:"24px", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", display:"block", marginBottom:"6px" }}>Gemini API Key <span style={{ color:"#f472b6" }}>*必須</span></label>
            <input type="password" value={geminiKey} onChange={(e)=>setGeminiKey(e.target.value)} placeholder="AIza..."
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"10px 12px", fontSize:"13px", color:"white", outline:"none", fontFamily:"'DM Mono',monospace" }} />
          </div>
          <div style={{ marginBottom:"16px", padding:"12px", borderRadius:"12px", background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.2)" }}>
            <p style={{ fontSize:"11px", color:"rgba(0,245,212,0.8)", margin:0 }}>
              ✅ 株価・ETF・SEC EDGAR は自動取得。追加APIキー不要。
            </p>
          </div>
          <button onClick={saveKeys} disabled={!geminiKey} style={{ width:"100%", padding:"12px", borderRadius:"12px", fontWeight:"bold", fontSize:"14px", background:"linear-gradient(135deg,#f72585,#7209b7)", color:"white", border:"none", cursor:geminiKey?"pointer":"not-allowed", opacity:!geminiKey?0.3:1, fontFamily:"'Syne',sans-serif" }}>
            分析開始 →
          </button>
          <p style={{ fontSize:"11px", textAlign:"center", color:"rgba(255,255,255,0.2)", marginTop:"12px" }}>APIキーはlocalStorageのみ保存 • 分析結果もセッション間で保持</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", fontFamily:"'DM Mono',monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn 0.4s ease forwards}@keyframes pulseDot{0%,100%{opacity:0.3}50%{opacity:1}}.live{animation:pulseDot 2s ease-in-out infinite}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.bounce-0{animation:bounce 1s ease-in-out infinite 0s}.bounce-1{animation:bounce 1s ease-in-out infinite .15s}.bounce-2{animation:bounce 1s ease-in-out infinite .3s}@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}.ping{animation:ping 1s cubic-bezier(0,0,.2,1) infinite}`}</style>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:20, borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(7,9,15,0.96)", backdropFilter:"blur(16px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"900", background:"linear-gradient(135deg,#f72585,#7209b7)" }}>▲</div>
          <div>
            <span style={{ fontSize:"14px", fontWeight:"800", color:"white", letterSpacing:"-0.02em", fontFamily:"'Syne',sans-serif" }}>NEXT WAVE</span>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", marginLeft:"8px" }}>出来高×ETF×テクニカル統合分析</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>
            <div className="live" style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#34d399" }} />Live
          </div>
          <button onClick={()=>setKeysSet(false)} style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>キー変更</button>
        </div>
      </div>

      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:"20px" }}>

        {/* Ranking */}
        <div className="fade-in" style={{ borderRadius:"16px", padding:"16px", border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em" }}>総合モメンタムランキング</span>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              {stockSavedAt && <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)" }}>更新: {fmtDate(stockSavedAt)?.slice(5)}</span>}
              <button onClick={fetchAllTickers} disabled={fetchingAll} style={{ fontSize:"11px", padding:"4px 10px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", background:"none", cursor:fetchingAll?"not-allowed":"pointer", opacity:fetchingAll?0.4:1 }}>
                {fetchingAll?"取得中...":"全銘柄更新"}
              </button>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {rankedSectors.slice(0,10).map((s,i) => {
              const sc    = sectorScores[s.id];
              const score = sc?.total||50;
              const bd    = sc?.breakdown;
              const sq    = s.tickers.map((t)=>quotes[t]).filter(Boolean);
              const avgChg= sq.length ? sq.reduce((a,q)=>a+q.changePct,0)/sq.length : null;
              return (
                <div key={s.id} onClick={()=>{ setSelectedSector(s); setTab("sectors"); }} style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", width:"16px", flexShrink:0 }}>{i+1}</span>
                  <span style={{ fontSize:"14px", flexShrink:0, color:s.color }}>{s.icon}</span>
                  <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</span>
                  {bd && (
                    <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                      {[["📦",bd.vol,30],["🏛",bd.etf,20],["📐",bd.technical,20]].map(([icon,val,max])=>(
                        <span key={icon} title={`${icon}: ${val}/${max}点`} style={{ fontSize:"10px", padding:"1px 4px", borderRadius:"4px", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)" }}>
                          {icon}{val}
                        </span>
                      ))}
                    </div>
                  )}
                  {avgChg!==null && <span style={{ fontSize:"11px", fontFamily:"monospace", flexShrink:0, color:avgChg>=0?"#34d399":"#f87171" }}>{avgChg>=0?"+":""}{avgChg.toFixed(1)}%</span>}
                  <div style={{ width:"64px", height:"6px", background:"rgba(255,255,255,0.05)", borderRadius:"999px", overflow:"hidden", flexShrink:0 }}>
                    <div style={{ height:"100%", width:`${score}%`, background:s.color, borderRadius:"999px", transition:"width 0.7s" }} />
                  </div>
                  <span style={{ fontSize:"11px", fontFamily:"monospace", width:"24px", textAlign:"right", flexShrink:0, color:s.color }}>{score}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:"10px", display:"flex", gap:"12px", fontSize:"10px", color:"rgba(255,255,255,0.25)" }}>
            <span>📦 出来高蓄積</span><span>🏛 ETF流入</span><span>📐 テクニカル</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={()=>setTab("sectors")} style={tabBtn(tab==="sectors")}>📡 セクター詳細</button>
          <button onClick={()=>setTab("scanner")} style={tabBtn(tab==="scanner")}>🛰 全市場スキャン</button>
        </div>

        {tab==="scanner" && <MarketScanner geminiKey={geminiKey} allScores={allScoresForScan} />}

        {tab==="sectors" && <>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {CATEGORIES.map((cat)=>(
              <button key={cat} onClick={()=>setCategoryFilter(cat)} style={chip(cat===categoryFilter)}>{cat}</button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px" }}>
            {filteredSectors.map((s) => {
              const sc   = sectorScores[s.id];
              const score= sc?.total||50;
              const bd   = sc?.breakdown;
              const isSel= selectedSector?.id===s.id;
              const sq   = s.tickers.map((t)=>quotes[t]).filter(Boolean);
              const avgChg= sq.length ? sq.reduce((a,q)=>a+q.changePct,0)/sq.length : null;
              const fetchedAt= sq[0]?.fetchedAt||null;
              const isLoading= s.tickers.some((t)=>fetchStatus[t]==="loading");
              return (
                <div key={s.id} onClick={()=>setSelectedSector(s)} style={card(isSel,s.color)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <span style={{ fontSize:"20px", color:s.color }}>{s.icon}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                      {isLoading && <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>取得中</span>}
                      {avgChg!==null && <span style={{ fontSize:"11px", fontFamily:"monospace", color:avgChg>=0?"#34d399":"#f87171" }}>{avgChg>=0?"+":""}{avgChg.toFixed(1)}%</span>}
                      <span style={{ fontSize:"11px", fontFamily:"monospace", color:s.color }}>{score}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)", marginBottom:"8px", lineHeight:"1.4" }}>{s.name}</div>
                  <div style={{ height:"4px", background:"rgba(255,255,255,0.05)", borderRadius:"999px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${score}%`, background:s.color, opacity:0.7, borderRadius:"999px" }} />
                  </div>
                  {bd && (
                    <div style={{ display:"flex", gap:"4px", marginTop:"6px", flexWrap:"wrap" }}>
                      {[["📦",bd.vol],["🏛",bd.etf],["📐",bd.technical]].map(([icon,val])=>(
                        <span key={icon} style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>{icon}{val}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
                    <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)" }}>{s.category}</span>
                    {fetchedAt && <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)" }}>🕐 {fmtDate(fetchedAt)?.slice(5,16)}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedSector && (
            <div className="fade-in" style={{ borderRadius:"16px", padding:"20px", border:`1px solid ${selectedSector.color}30`, background:`${selectedSector.color}07` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0, background:`${selectedSector.color}20`, border:`1px solid ${selectedSector.color}40` }}>
                  {selectedSector.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ fontSize:"15px", fontWeight:"bold", color:"white", margin:"0 0 4px", fontFamily:"'Syne',sans-serif" }}>{selectedSector.name}</h2>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>{selectedSector.category} • 総合スコア {sectorScores[selectedSector.id]?.total||50}/100</span>
                    {quotes[selectedSector.tickers[0]]?.fetchedAt && <ScanDateBadge isoDate={quotes[selectedSector.tickers[0]].fetchedAt} color={selectedSector.color} />}
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <ScoreBreakdown breakdown={sectorScores[selectedSector.id]?.breakdown} color={selectedSector.color} />

              {/* Tickers */}
              <div style={{ marginTop:"16px", marginBottom:"12px" }}>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>
                  米国銘柄データ（出来高・仕手ノイズ除去シグナル付き）
                </div>
                {selectedSector.tickers.map((sym)=>(
                  <TickerRow key={sym} quote={quotes[sym]} volumeData={volumeData[sym]} color={selectedSector.color} />
                ))}
              </div>

              {/* Technical Panel */}
              <TechnicalPanel
                quotes={selectedSector.tickers.map((t)=>quotes[t]).filter(Boolean)}
                volumeData={volumeData}
                color={selectedSector.color}
              />

              {/* JP Stocks */}
              <JpStocksPanel sector={selectedSector} />

              {/* AI Analysis */}
              <AIAnalysis
                key={selectedSector.id}
                sector={selectedSector}
                quotes={selectedSector.tickers.map((t)=>quotes[t]).filter(Boolean)}
                volumeData={volumeData}
                etfQuote={etfQuotes[selectedSector.etf]||null}
                spyChangePct={spyData?.changePct??null}
                geminiKey={geminiKey}
              />
            </div>
          )}
        </>}

        <div style={{ textAlign:"center", fontSize:"11px", color:"rgba(255,255,255,0.15)", paddingBottom:"24px" }}>
          株価: Yahoo Finance（15分遅延）• テクニカル指標はYahooデータから算出 • 本ツールは情報提供のみ、投資助言ではありません。
        </div>
      </div>
    </div>
  );
}
