"use strict";

const FutLife = (() => {
  const VERSION = "0.4";
  const STORAGE_KEY = "bitlife-futebol-v01-career";
  const START_YEAR = 2026;

  const POSITION_LABELS = {
    ATA: "Atacante", PE: "Ponta Esquerda", PD: "Ponta Direita", MEI: "Meia ofensivo", MC: "Meio-campista",
    VOL: "Volante", LE: "Lateral Esquerdo", LD: "Lateral Direito", ZAG: "Zagueiro", GOL: "Goleiro"
  };
  const ATTRIBUTE_LABELS = { shooting: "Chute", passing: "Passe", dribbling: "Drible", tackling: "Desarme", goalkeeping: "Defesa" };

  // A ponderação existe somente no código. O jogador vê apenas o OVR resultante.
  const OVR_WEIGHTS = {
    ATA: { shooting: .40, passing: .15, dribbling: .35, tackling: .10 },
    PE: { shooting: .30, passing: .20, dribbling: .40, tackling: .10 },
    PD: { shooting: .30, passing: .20, dribbling: .40, tackling: .10 },
    MEI: { shooting: .20, passing: .35, dribbling: .35, tackling: .10 },
    MC: { shooting: .15, passing: .40, dribbling: .25, tackling: .20 },
    VOL: { shooting: .10, passing: .35, dribbling: .15, tackling: .40 },
    LE: { shooting: .10, passing: .30, dribbling: .25, tackling: .35 },
    LD: { shooting: .10, passing: .30, dribbling: .25, tackling: .35 },
    ZAG: { shooting: .05, passing: .20, dribbling: .10, tackling: .65 },
    GOL: { goalkeeping: .85, passing: .15 }
  };

  const GROWTH_WEIGHTS = {
    ATA: { shooting: 4, passing: 1.5, dribbling: 3.5, tackling: .5 },
    PE: { shooting: 3, passing: 2, dribbling: 4, tackling: .5 },
    PD: { shooting: 3, passing: 2, dribbling: 4, tackling: .5 },
    MEI: { shooting: 2, passing: 4, dribbling: 4, tackling: .75 },
    MC: { shooting: 1.25, passing: 4, dribbling: 2.5, tackling: 2 },
    VOL: { shooting: .75, passing: 3.5, dribbling: 1.5, tackling: 4 },
    LE: { shooting: .75, passing: 3, dribbling: 2.5, tackling: 3.5 },
    LD: { shooting: .75, passing: 3, dribbling: 2.5, tackling: 3.5 },
    ZAG: { shooting: .5, passing: 2, dribbling: .75, tackling: 5 },
    GOL: { goalkeeping: 5, passing: 1.5 }
  };

  const POSITION_GOAL_RATE = { ATA:.42, PE:.28, PD:.28, MEI:.18, MC:.09, VOL:.045, LE:.035, LD:.035, ZAG:.03, GOL:0 };
  const POSITION_ASSIST_RATE = { ATA:.13, PE:.21, PD:.21, MEI:.25, MC:.19, VOL:.10, LE:.13, LD:.13, ZAG:.045, GOL:.008 };
  const POSITION_TACKLE_RATE = { ATA:.45, PE:.65, PD:.65, MEI:.80, MC:1.30, VOL:2.05, LE:1.85, LD:1.85, ZAG:1.75, GOL:.05 };
  const POSITION_ADJACENCY = {
    ATA:["PE","PD"], PE:["ATA","MEI"], PD:["ATA","MEI"], MEI:["PE","PD","MC"], MC:["MEI","VOL"],
    VOL:["MC","ZAG"], LE:["PE","VOL"], LD:["PD","VOL"], ZAG:["VOL"], GOL:[]
  };

  // Mundo do futebol da V0.4. As ligas são modelos de jogo; o save pode promover/rebaixar clubes entre divisões conectadas.
  const LEAGUES = {
    "bra-a": { leagueName:"Campeonato Brasileiro — Série A", division:"1ª divisão", country:"Brasil", flag:"🇧🇷", leagueGames:38, leagueSize:20, cupName:"Copa do Brasil", yellowThreshold:3, continental:"CONMEBOL" },
    "bra-b": { leagueName:"Campeonato Brasileiro — Série B", division:"2ª divisão", country:"Brasil", flag:"🇧🇷", leagueGames:38, leagueSize:20, cupName:"Copa do Brasil", yellowThreshold:3, continental:null },
    "bra-c": { leagueName:"Campeonato Brasileiro — Série C", division:"3ª divisão", country:"Brasil", flag:"🇧🇷", leagueGames:19, leagueSize:20, cupName:"Copa do Brasil", yellowThreshold:3, continental:null },
    "arg-a": { leagueName:"Primera División Argentina", division:"1ª divisão", country:"Argentina", flag:"🇦🇷", leagueGames:30, leagueSize:30, cupName:"Copa Argentina", yellowThreshold:5, continental:"CONMEBOL" },
    "por-a": { leagueName:"Primeira Liga", division:"1ª divisão", country:"Portugal", flag:"🇵🇹", leagueGames:34, leagueSize:18, cupName:"Taça de Portugal", yellowThreshold:5, continental:"UEFA" },
    "por-b": { leagueName:"Liga Portugal 2", division:"2ª divisão", country:"Portugal", flag:"🇵🇹", leagueGames:34, leagueSize:18, cupName:"Taça de Portugal", yellowThreshold:5, continental:null },
    "esp-a": { leagueName:"LaLiga", division:"1ª divisão", country:"Espanha", flag:"🇪🇸", leagueGames:38, leagueSize:20, cupName:"Copa del Rey", yellowThreshold:5, continental:"UEFA" },
    "esp-b": { leagueName:"LaLiga 2", division:"2ª divisão", country:"Espanha", flag:"🇪🇸", leagueGames:42, leagueSize:22, cupName:"Copa del Rey", yellowThreshold:5, continental:null },
    "eng-a": { leagueName:"Premier League", division:"1ª divisão", country:"Inglaterra", flag:"🏴", leagueGames:38, leagueSize:20, cupName:"FA Cup", yellowThreshold:5, continental:"UEFA" },
    "eng-b": { leagueName:"EFL Championship", division:"2ª divisão", country:"Inglaterra", flag:"🏴", leagueGames:46, leagueSize:24, cupName:"FA Cup", yellowThreshold:5, continental:null },
    "ita-a": { leagueName:"Serie A", division:"1ª divisão", country:"Itália", flag:"🇮🇹", leagueGames:38, leagueSize:20, cupName:"Coppa Italia", yellowThreshold:5, continental:"UEFA" },
    "ita-b": { leagueName:"Serie B", division:"2ª divisão", country:"Itália", flag:"🇮🇹", leagueGames:38, leagueSize:20, cupName:"Coppa Italia", yellowThreshold:5, continental:null },
    "ger-a": { leagueName:"Bundesliga", division:"1ª divisão", country:"Alemanha", flag:"🇩🇪", leagueGames:34, leagueSize:18, cupName:"DFB-Pokal", yellowThreshold:5, continental:"UEFA" },
    "ger-b": { leagueName:"2. Bundesliga", division:"2ª divisão", country:"Alemanha", flag:"🇩🇪", leagueGames:34, leagueSize:18, cupName:"DFB-Pokal", yellowThreshold:5, continental:null },
    "fra-a": { leagueName:"Ligue 1", division:"1ª divisão", country:"França", flag:"🇫🇷", leagueGames:34, leagueSize:18, cupName:"Coupe de France", yellowThreshold:5, continental:"UEFA" },
    "fra-b": { leagueName:"Ligue 2", division:"2ª divisão", country:"França", flag:"🇫🇷", leagueGames:34, leagueSize:18, cupName:"Coupe de France", yellowThreshold:5, continental:null },
    "ned-a": { leagueName:"Eredivisie", division:"1ª divisão", country:"Países Baixos", flag:"🇳🇱", leagueGames:34, leagueSize:18, cupName:"KNVB Beker", yellowThreshold:5, continental:"UEFA" },
    "sau-a": { leagueName:"Saudi Pro League", division:"1ª divisão", country:"Arábia Saudita", flag:"🇸🇦", leagueGames:34, leagueSize:18, cupName:"King's Cup", yellowThreshold:4, continental:"AFC" }
  };

  const LEAGUE_UP = {"bra-b":"bra-a","bra-c":"bra-b","por-b":"por-a","esp-b":"esp-a","eng-b":"eng-a","ita-b":"ita-a","ger-b":"ger-a","fra-b":"fra-a"};
  const LEAGUE_DOWN = Object.fromEntries(Object.entries(LEAGUE_UP).map(([down,up])=>[up,down]));

  const CLUBS = [
    // Brasil
    {id:"guarani",name:"Guarani",shortName:"GUA",strength:59,prestige:52,rivalId:"ponte-preta",leagueKey:"bra-c",salaryBaseBRL:45000},
    {id:"ponte-preta",name:"Ponte Preta",shortName:"PON",strength:61,prestige:57,rivalId:"guarani",leagueKey:"bra-b",salaryBaseBRL:55000},
    {id:"botafogo-sp",name:"Botafogo-SP",shortName:"BSP",strength:62,prestige:54,rivalId:"ituano",leagueKey:"bra-b",salaryBaseBRL:60000},
    {id:"ituano",name:"Ituano",shortName:"ITU",strength:59,prestige:51,rivalId:"botafogo-sp",leagueKey:"bra-c",salaryBaseBRL:40000},
    {id:"coritiba",name:"Coritiba",shortName:"CFC",strength:70,prestige:76,rivalId:"athletico-pr",leagueKey:"bra-b",salaryBaseBRL:130000},
    {id:"athletico-pr",name:"Athletico-PR",shortName:"CAP",strength:79,prestige:86,rivalId:"coritiba",leagueKey:"bra-a",salaryBaseBRL:300000},
    {id:"bahia",name:"Bahia",shortName:"BAH",strength:80,prestige:87,rivalId:"vitoria",leagueKey:"bra-a",salaryBaseBRL:340000},
    {id:"vitoria",name:"Vitória",shortName:"VIT",strength:74,prestige:80,rivalId:"bahia",leagueKey:"bra-a",salaryBaseBRL:220000},
    {id:"santos",name:"Santos",shortName:"SAN",strength:77,prestige:88,rivalId:"sao-paulo",leagueKey:"bra-a",salaryBaseBRL:280000},
    {id:"sao-paulo",name:"São Paulo",shortName:"SAO",strength:83,prestige:93,rivalId:"santos",leagueKey:"bra-a",salaryBaseBRL:430000},
    {id:"corinthians",name:"Corinthians",shortName:"COR",strength:82,prestige:94,rivalId:"palmeiras",leagueKey:"bra-a",salaryBaseBRL:460000},
    {id:"palmeiras",name:"Palmeiras",shortName:"PAL",strength:88,prestige:96,rivalId:"corinthians",leagueKey:"bra-a",salaryBaseBRL:680000},
    {id:"flamengo",name:"Flamengo",shortName:"FLA",strength:89,prestige:98,rivalId:"vasco",leagueKey:"bra-a",salaryBaseBRL:740000},
    {id:"vasco",name:"Vasco da Gama",shortName:"VAS",strength:79,prestige:90,rivalId:"flamengo",leagueKey:"bra-a",salaryBaseBRL:320000},
    {id:"fluminense",name:"Fluminense",shortName:"FLU",strength:82,prestige:90,rivalId:"flamengo",leagueKey:"bra-a",salaryBaseBRL:390000},
    {id:"botafogo",name:"Botafogo",shortName:"BOT",strength:85,prestige:91,rivalId:"flamengo",leagueKey:"bra-a",salaryBaseBRL:470000},
    {id:"gremio",name:"Grêmio",shortName:"GRE",strength:81,prestige:90,rivalId:"internacional",leagueKey:"bra-a",salaryBaseBRL:370000},
    {id:"internacional",name:"Internacional",shortName:"INT",strength:82,prestige:91,rivalId:"gremio",leagueKey:"bra-a",salaryBaseBRL:400000},
    {id:"cruzeiro",name:"Cruzeiro",shortName:"CRU",strength:83,prestige:91,rivalId:"atletico-mg",leagueKey:"bra-a",salaryBaseBRL:430000},
    {id:"atletico-mg",name:"Atlético-MG",shortName:"CAM",strength:85,prestige:92,rivalId:"cruzeiro",leagueKey:"bra-a",salaryBaseBRL:500000},

    // Argentina
    {id:"river",name:"River Plate",shortName:"RIV",strength:87,prestige:95,rivalId:"boca",leagueKey:"arg-a",salaryBaseBRL:650000},
    {id:"boca",name:"Boca Juniors",shortName:"BOC",strength:86,prestige:95,rivalId:"river",leagueKey:"arg-a",salaryBaseBRL:620000},
    {id:"racing",name:"Racing Club",shortName:"RAC",strength:80,prestige:87,rivalId:"independiente",leagueKey:"arg-a",salaryBaseBRL:340000},
    {id:"independiente",name:"Independiente",shortName:"IND",strength:78,prestige:88,rivalId:"racing",leagueKey:"arg-a",salaryBaseBRL:320000},
    {id:"estudiantes",name:"Estudiantes",shortName:"EST",strength:80,prestige:85,rivalId:"gimnasia",leagueKey:"arg-a",salaryBaseBRL:330000},
    {id:"gimnasia",name:"Gimnasia LP",shortName:"GEL",strength:72,prestige:73,rivalId:"estudiantes",leagueKey:"arg-a",salaryBaseBRL:180000},

    // Portugal
    {id:"benfica",name:"Benfica",shortName:"BEN",strength:87,prestige:93,rivalId:"sporting",leagueKey:"por-a",salaryBaseBRL:780000},
    {id:"porto",name:"FC Porto",shortName:"POR",strength:86,prestige:92,rivalId:"benfica",leagueKey:"por-a",salaryBaseBRL:740000},
    {id:"sporting",name:"Sporting CP",shortName:"SCP",strength:87,prestige:92,rivalId:"benfica",leagueKey:"por-a",salaryBaseBRL:760000},
    {id:"braga",name:"SC Braga",shortName:"BRA",strength:80,prestige:84,rivalId:"guimaraes",leagueKey:"por-a",salaryBaseBRL:360000},
    {id:"guimaraes",name:"Vitória de Guimarães",shortName:"VSC",strength:75,prestige:79,rivalId:"braga",leagueKey:"por-a",salaryBaseBRL:240000},
    {id:"maritimo",name:"Marítimo",shortName:"MAR",strength:67,prestige:69,rivalId:"nacional",leagueKey:"por-b",salaryBaseBRL:120000},
    {id:"nacional",name:"Nacional",shortName:"NAC",strength:68,prestige:68,rivalId:"maritimo",leagueKey:"por-b",salaryBaseBRL:125000},

    // Espanha
    {id:"real-madrid",name:"Real Madrid",shortName:"RMA",strength:95,prestige:99,rivalId:"barcelona",leagueKey:"esp-a",salaryBaseBRL:2700000},
    {id:"barcelona",name:"Barcelona",shortName:"BAR",strength:93,prestige:99,rivalId:"real-madrid",leagueKey:"esp-a",salaryBaseBRL:2400000},
    {id:"atletico-madrid",name:"Atlético de Madrid",shortName:"ATM",strength:89,prestige:95,rivalId:"real-madrid",leagueKey:"esp-a",salaryBaseBRL:1550000},
    {id:"athletic-bilbao",name:"Athletic Club",shortName:"ATH",strength:84,prestige:89,rivalId:"real-sociedad",leagueKey:"esp-a",salaryBaseBRL:830000},
    {id:"real-sociedad",name:"Real Sociedad",shortName:"RSO",strength:83,prestige:86,rivalId:"athletic-bilbao",leagueKey:"esp-a",salaryBaseBRL:720000},
    {id:"sevilla",name:"Sevilla",shortName:"SEV",strength:80,prestige:88,rivalId:"betis",leagueKey:"esp-a",salaryBaseBRL:650000},
    {id:"betis",name:"Real Betis",shortName:"BET",strength:81,prestige:86,rivalId:"sevilla",leagueKey:"esp-a",salaryBaseBRL:620000},
    {id:"deportivo",name:"Deportivo La Coruña",shortName:"DEP",strength:71,prestige:80,rivalId:"zaragoza",leagueKey:"esp-b",salaryBaseBRL:260000},
    {id:"zaragoza",name:"Real Zaragoza",shortName:"ZAR",strength:70,prestige:79,rivalId:"deportivo",leagueKey:"esp-b",salaryBaseBRL:240000},

    // Inglaterra
    {id:"man-city",name:"Manchester City",shortName:"MCI",strength:93,prestige:97,rivalId:"man-united",leagueKey:"eng-a",salaryBaseBRL:2500000},
    {id:"man-united",name:"Manchester United",shortName:"MUN",strength:87,prestige:99,rivalId:"man-city",leagueKey:"eng-a",salaryBaseBRL:2200000},
    {id:"liverpool",name:"Liverpool",shortName:"LIV",strength:92,prestige:98,rivalId:"everton",leagueKey:"eng-a",salaryBaseBRL:2300000},
    {id:"arsenal",name:"Arsenal",shortName:"ARS",strength:92,prestige:97,rivalId:"tottenham",leagueKey:"eng-a",salaryBaseBRL:2200000},
    {id:"chelsea",name:"Chelsea",shortName:"CHE",strength:88,prestige:96,rivalId:"arsenal",leagueKey:"eng-a",salaryBaseBRL:1900000},
    {id:"tottenham",name:"Tottenham",shortName:"TOT",strength:86,prestige:93,rivalId:"arsenal",leagueKey:"eng-a",salaryBaseBRL:1600000},
    {id:"newcastle",name:"Newcastle United",shortName:"NEW",strength:86,prestige:90,rivalId:"sunderland",leagueKey:"eng-a",salaryBaseBRL:1500000},
    {id:"everton",name:"Everton",shortName:"EVE",strength:78,prestige:86,rivalId:"liverpool",leagueKey:"eng-a",salaryBaseBRL:800000},
    {id:"leeds",name:"Leeds United",shortName:"LEE",strength:76,prestige:84,rivalId:"sheffield-wed",leagueKey:"eng-b",salaryBaseBRL:520000},
    {id:"sunderland",name:"Sunderland",shortName:"SUN",strength:74,prestige:81,rivalId:"newcastle",leagueKey:"eng-b",salaryBaseBRL:440000},
    {id:"sheffield-wed",name:"Sheffield Wednesday",shortName:"SHW",strength:69,prestige:75,rivalId:"leeds",leagueKey:"eng-b",salaryBaseBRL:300000},

    // Itália
    {id:"inter",name:"Inter",shortName:"INT",strength:92,prestige:97,rivalId:"milan",leagueKey:"ita-a",salaryBaseBRL:2000000},
    {id:"milan",name:"Milan",shortName:"MIL",strength:88,prestige:98,rivalId:"inter",leagueKey:"ita-a",salaryBaseBRL:1750000},
    {id:"juventus",name:"Juventus",shortName:"JUV",strength:89,prestige:98,rivalId:"milan",leagueKey:"ita-a",salaryBaseBRL:1850000},
    {id:"napoli",name:"Napoli",shortName:"NAP",strength:88,prestige:92,rivalId:"roma",leagueKey:"ita-a",salaryBaseBRL:1450000},
    {id:"roma",name:"Roma",shortName:"ROM",strength:84,prestige:93,rivalId:"lazio",leagueKey:"ita-a",salaryBaseBRL:1200000},
    {id:"lazio",name:"Lazio",shortName:"LAZ",strength:82,prestige:89,rivalId:"roma",leagueKey:"ita-a",salaryBaseBRL:980000},
    {id:"atalanta",name:"Atalanta",shortName:"ATA",strength:86,prestige:87,rivalId:"milan",leagueKey:"ita-a",salaryBaseBRL:1100000},
    {id:"palermo",name:"Palermo",shortName:"PAL",strength:72,prestige:79,rivalId:"sampdoria",leagueKey:"ita-b",salaryBaseBRL:310000},
    {id:"sampdoria",name:"Sampdoria",shortName:"SAM",strength:70,prestige:82,rivalId:"palermo",leagueKey:"ita-b",salaryBaseBRL:290000},

    // Alemanha
    {id:"bayern",name:"Bayern de Munique",shortName:"FCB",strength:94,prestige:98,rivalId:"dortmund",leagueKey:"ger-a",salaryBaseBRL:2300000},
    {id:"dortmund",name:"Borussia Dortmund",shortName:"BVB",strength:88,prestige:94,rivalId:"bayern",leagueKey:"ger-a",salaryBaseBRL:1500000},
    {id:"leverkusen",name:"Bayer Leverkusen",shortName:"B04",strength:90,prestige:91,rivalId:"frankfurt",leagueKey:"ger-a",salaryBaseBRL:1600000},
    {id:"leipzig",name:"RB Leipzig",shortName:"RBL",strength:86,prestige:86,rivalId:"leverkusen",leagueKey:"ger-a",salaryBaseBRL:1250000},
    {id:"frankfurt",name:"Eintracht Frankfurt",shortName:"SGE",strength:82,prestige:86,rivalId:"bayern",leagueKey:"ger-a",salaryBaseBRL:800000},
    {id:"schalke",name:"Schalke 04",shortName:"S04",strength:70,prestige:84,rivalId:"dortmund",leagueKey:"ger-b",salaryBaseBRL:320000},
    {id:"hamburg",name:"Hamburgo",shortName:"HSV",strength:73,prestige:84,rivalId:"schalke",leagueKey:"ger-b",salaryBaseBRL:390000},

    // França
    {id:"psg",name:"Paris Saint-Germain",shortName:"PSG",strength:94,prestige:98,rivalId:"marseille",leagueKey:"fra-a",salaryBaseBRL:2600000},
    {id:"marseille",name:"Olympique de Marseille",shortName:"OM",strength:85,prestige:92,rivalId:"psg",leagueKey:"fra-a",salaryBaseBRL:1250000},
    {id:"monaco",name:"Monaco",shortName:"ASM",strength:84,prestige:88,rivalId:"psg",leagueKey:"fra-a",salaryBaseBRL:1100000},
    {id:"lyon",name:"Lyon",shortName:"OL",strength:82,prestige:91,rivalId:"saint-etienne",leagueKey:"fra-a",salaryBaseBRL:920000},
    {id:"lille",name:"Lille",shortName:"LIL",strength:82,prestige:84,rivalId:"psg",leagueKey:"fra-a",salaryBaseBRL:820000},
    {id:"saint-etienne",name:"Saint-Étienne",shortName:"ASSE",strength:72,prestige:86,rivalId:"lyon",leagueKey:"fra-b",salaryBaseBRL:300000},

    // Países Baixos
    {id:"ajax",name:"Ajax",shortName:"AJA",strength:84,prestige:92,rivalId:"feyenoord",leagueKey:"ned-a",salaryBaseBRL:700000},
    {id:"psv",name:"PSV",shortName:"PSV",strength:86,prestige:89,rivalId:"ajax",leagueKey:"ned-a",salaryBaseBRL:760000},
    {id:"feyenoord",name:"Feyenoord",shortName:"FEY",strength:85,prestige:89,rivalId:"ajax",leagueKey:"ned-a",salaryBaseBRL:720000},
    {id:"az",name:"AZ Alkmaar",shortName:"AZ",strength:79,prestige:80,rivalId:"ajax",leagueKey:"ned-a",salaryBaseBRL:420000},

    // Arábia Saudita
    {id:"al-hilal",name:"Al-Hilal",shortName:"HIL",strength:87,prestige:91,rivalId:"al-nassr",leagueKey:"sau-a",salaryBaseBRL:2200000},
    {id:"al-nassr",name:"Al-Nassr",shortName:"NAS",strength:85,prestige:91,rivalId:"al-hilal",leagueKey:"sau-a",salaryBaseBRL:2300000},
    {id:"al-ittihad",name:"Al-Ittihad",shortName:"ITT",strength:84,prestige:88,rivalId:"al-ahli",leagueKey:"sau-a",salaryBaseBRL:1900000},
    {id:"al-ahli",name:"Al-Ahli",shortName:"AHL",strength:83,prestige:87,rivalId:"al-ittihad",leagueKey:"sau-a",salaryBaseBRL:1800000}
  ];

  const SMALL_BRAZIL = ["guarani","ponte-preta","botafogo-sp","ituano","coritiba"];
  const MID_BRAZIL = ["santos","vasco","bahia","vitoria","athletico-pr"];
  const BIG_BRAZIL = ["sao-paulo","corinthians","palmeiras","flamengo","fluminense","botafogo","gremio","internacional","cruzeiro","atletico-mg"];

  let career;

  function clubById(id) {
    const base=CLUBS.find(x=>x.id===id); if(!base) throw new Error(`Clube não encontrado: ${id}`);
    const ctx=career; const leagueKey=ctx?.clubLeagueState?.[id]||base.leagueKey; const l=LEAGUES[leagueKey]||LEAGUES[base.leagueKey];
    return {...base,...l,leagueKey};
  }
  function baseClubById(id){const base=CLUBS.find(x=>x.id===id);if(!base)throw new Error(`Clube não encontrado: ${id}`);return base;}
  function clubWithCareer(c,id){const base=baseClubById(id),leagueKey=c?.clubLeagueState?.[id]||base.leagueKey,l=LEAGUES[leagueKey]||LEAGUES[base.leagueKey];return{...base,...l,leagueKey};}
  function allClubsForCareer(c){return CLUBS.map(x=>clubWithCareer(c,x.id));}
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function round1(v){ return Math.round(v*10)/10; }
  function round2(v){ return Math.round(v*100)/100; }
  function hashSeed(text){ let h=2166136261>>>0; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
  function nextRandom(c){ let x=c.rngState||123456789; x^=x<<13; x^=x>>>17; x^=x<<5; c.rngState=x>>>0; return (c.rngState%1000000)/1000000; }
  function rand(c,min,max){ return min+(max-min)*nextRandom(c); }
  function randInt(c,min,max){ return Math.floor(rand(c,min,max+1)); }
  function pick(c,arr){ return arr[Math.min(arr.length-1,Math.floor(nextRandom(c)*arr.length))]; }
  function weightedPick(c,items,weights){ const t=weights.reduce((a,b)=>a+b,0); let r=nextRandom(c)*t; for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i];}return items[items.length-1]; }
  function escapeHtml(s){ return String(s??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch])); }

  function attrsForPosition(position){ return position==="GOL"?["goalkeeping","passing"]:["shooting","passing","dribbling","tackling"]; }
  function calculateOverall(position,a){ const w=OVR_WEIGHTS[position]; let t=0; Object.keys(w).forEach(k=>t+=(a[k]??0)*w[k]); return Math.round(t); }
  function attrValue(a,k){ return a[k]??0; }
  function applyAttr(a,k,d){ a[k]=clamp((a[k]??0)+d,1,99); }
  function currentClubLegacy(c,clubId){
    c.clubLegacy=c.clubLegacy||{}; if(!c.clubLegacy[clubId])c.clubLegacy[clubId]={seasons:0,titles:0,fanAffinity:30,captain:false,bestRating:0}; return c.clubLegacy[clubId];
  }
  function legacyLabel(l){const score=(l.seasons||0)*6+(l.titles||0)*8+(l.fanAffinity||30)*.45+(l.captain?10:0);return score>=85?"Lenda do clube":score>=65?"Ídolo":score>=48?"Queridinho da torcida":score>=30?"Respeitado":"Chegando agora";}
  function updateClubLegacy(c,stats,effects){const l=currentClubLegacy(c,stats.clubId);l.seasons++;l.titles+=(stats.titles||[]).length;l.fanAffinity=clamp(Math.round((l.fanAffinity||30)+(effects?.fanAffinityDelta||0)+(stats.rating-6.8)*3+(stats.titles||[]).length*3),0,100);l.bestRating=Math.max(l.bestRating||0,stats.rating);return l;}
  function maybeCaptain(c,stats,club){const l=currentClubLegacy(c,club.id);if(l.captain)return true;if(c.age>=25&&l.seasons>=3&&c.coachTrust>=68&&c.reputation>=55&&["Importante","Estrela"].includes(stats.nextRole||stats.role)&&nextRandom(c)<.38){l.captain=true;c.captainClubId=club.id;return true;}return false;}

  function initialAllocation(position){
    if(position==="GOL") return { base:{goalkeeping:40,passing:35,shooting:10,dribbling:15,tackling:20}, points:30, max:75 };
    return { base:{shooting:35,passing:35,dribbling:35,tackling:35}, points:100, max:75 };
  }

  function potentialHint(p){ if(p>=92)return"Estrela mundial"; if(p>=88)return"Grande talento"; if(p>=84)return"Joia"; if(p>=80)return"Tem futuro"; return"Sem indicação especial"; }
  function randomRivalName(c){ return `${pick(c,["Mateo","Lucas","Gabriel","Thiago","Enzo","Nicolás","Bruno","Rafael","Tomás","Diego","Martín","João"])} ${pick(c,["Rodríguez","Ferreira","Silva","Mendes","Almeida","Costa","Santos","Pereira","García","Romero","Oliveira","Torres"])}`; }

  function developmentBiasFromAllocation(position,alloc){
    const attrs=attrsForPosition(position), total=Math.max(1,attrs.reduce((s,a)=>s+(alloc[a]||0),0)); const out={};
    attrs.forEach(a=>out[a]=1+(alloc[a]||0)/total*.45); return out;
  }

  function createCareer(name,position,attributes,allocation,currencyPreference="BRL"){
    const seed=hashSeed(`${name}-${Date.now()}-${Math.random()}`), temp={rngState:seed||123456789};
    const ovr=calculateOverall(position,attributes);
    const potential=clamp(ovr+randInt(temp,17,32),78,96);
    const rivalAlloc={}; attrsForPosition(position).forEach(a=>rivalAlloc[a]=randInt(temp,8,35));
    const rivalBase=initialAllocation(position).base, rivalAttrs={...rivalBase};
    let rivalPoints=initialAllocation(position).points;
    const rattrs=attrsForPosition(position);
    while(rivalPoints-->0){ const a=weightedPick(temp,rattrs,rattrs.map(x=>(GROWTH_WEIGHTS[position][x]||1))); if(rivalAttrs[a]<75)rivalAttrs[a]++; }
    const rivalOvr=calculateOverall(position,rivalAttrs);
    const rival={name:randomRivalName(temp),age:16,position,secondaryPosition:null,attributes:rivalAttrs,allocation:rivalAlloc,developmentBias:developmentBiasFromAllocation(position,rivalAlloc),overall:rivalOvr,potential:clamp(potential+randInt(temp,-4,4),78,96),form:50,morale:50,reputation:10,coachTrust:50,lastRating:6.9,clubId:pick(temp,SMALL_BRAZIL),history:[]};
    const trialScenario=makeTrialScenario({position,rngState:temp.rngState,attributes,overall:ovr});
    return { id:`career-${seed}`,version:VERSION,name:(name||"Jogador").trim(),age:16,position,secondaryPosition:null,attributes:{...attributes},allocation:{...allocation},developmentBias:developmentBiasFromAllocation(position,allocation),overall:ovr,potential,potentialHint:potentialHint(potential+randInt(temp,-2,2)),form:50,morale:50,reputation:10,coachTrust:50,lastRating:6.9,clubId:"guarani",rngState:temp.rngState,seasonIndex:0,history:[],rival,introStage:"trial",trialScenario,trialOffers:[],trialResult:"",salaryMonthlyBRL:0,careerEarningsBRL:0,sponsorshipEarningsBRL:0,contractYearsLeft:0,currencyPreference,careerLog:[],lastEventKeys:[],retired:false,freeAgent:false,clubLeagueState:Object.fromEntries(CLUBS.map(x=>[x.id,x.leagueKey])),memories:{},fanAffinity:35,clubLegacy:{},captain:false,milestones:[],transferListed:false };
  }

  const TRIAL_FIELD = [
    {key:"trial-small-sided",title:"Jogo em campo reduzido",text:"Os observadores montam um 6 contra 6. Há pouco espaço e cada decisão aparece muito.",choices:[
      ["shooting","Buscar finalizações sempre que houver espaço"],["passing","Circular a bola e encontrar passes verticais"],["dribbling","Tentar quebrar linhas no um contra um"],["tackling","Pressionar e recuperar a bola rapidamente"]]},
    {key:"trial-final-play",title:"Último lance da peneira",text:"O coletivo está empatado e faltam poucos minutos. Uma boa ação pode marcar a avaliação.",choices:[
      ["shooting","Atacar a área e procurar o chute"],["passing","Tentar construir a jogada decisiva"],["dribbling","Assumir a responsabilidade e partir para cima"],["tackling","Garantir equilíbrio e recuperar a segunda bola"]]},
    {key:"trial-coach-request",title:"Pedido do avaliador",text:"Um dos treinadores pede que você mostre personalidade e escolha como quer participar do próximo bloco.",choices:[
      ["shooting","Jogar mais perto do gol"],["passing","Ser o organizador das jogadas"],["dribbling","Receber aberto e desafiar o marcador"],["tackling","Atuar agressivamente na recuperação"]]},
    {key:"trial-pressure",title:"Peneira sob pressão",text:"Dois atletas da sua posição já fizeram boas avaliações. Você tem poucos minutos para deixar sua impressão.",choices:[
      ["shooting","Ser direto e procurar o gol"],["passing","Mostrar leitura e qualidade no passe"],["dribbling","Criar lances individuais"],["tackling","Mostrar segurança sem a bola"]]},
    {key:"trial-scrimmage",title:"Coletivo contra a base",text:"O último teste é contra uma equipe de base já entrosada. Os observadores querem ver como você reage.",choices:[
      ["shooting","Aproveitar qualquer espaço para finalizar"],["passing","Acelerar o jogo com poucos toques"],["dribbling","Tentar desequilibrar nas situações individuais"],["tackling","Competir em cada disputa e recuperar bolas"]]}
  ];
  const TRIAL_GK = [
    {key:"trial-gk-penalties",title:"Série de pênaltis",text:"A avaliação termina com cobranças de pênalti. Os observadores estão atentos aos detalhes.",choices:[["goalkeeping","Confiar nos reflexos e esperar o chute"],["passing","Usar as reposições para mostrar qualidade com os pés"]]},
    {key:"trial-gk-crosses",title:"Bolas aéreas e saída",text:"A comissão testa cruzamentos, finalizações e reposições em sequência.",choices:[["goalkeeping","Priorizar segurança e defesas difíceis"],["passing","Iniciar rapidamente os contra-ataques"]]},
    {key:"trial-gk-pressure",title:"Jogo sob pressão",text:"Seu time é pressionado durante todo o coletivo. Você terá muito trabalho.",choices:[["goalkeeping","Assumir a responsabilidade nas defesas"],["passing","Ajudar a equipe a sair da pressão com os pés"]]}
  ];
  function makeTrialScenario(c){ const src=c.position==="GOL"?TRIAL_GK:TRIAL_FIELD; const t=pick(c,src); const allowed=attrsForPosition(c.position); return {...t,choices:t.choices.filter(x=>allowed.includes(x[0])).map((x,i)=>({id:`trial-${t.key}-${i}`,attribute:x[0],label:x[1]}))}; }

  function resolveTrial(c,choiceId){
    if(c.introStage!=="trial")return;
    const sc=c.trialScenario, choice=sc.choices.find(x=>x.id===choiceId); if(!choice)return;
    const val=attrValue(c.attributes,choice.attribute), chance=clamp(.22+val*.008+(c.overall-55)*.006,.42,.91); const success=nextRandom(c)<chance;
    const performance=clamp(Math.round(val*.60+c.overall*.28+(success?18:4)+rand(c,-7,7)),30,100);
    c.trialScore=performance; c.form=clamp(c.form+(success?3:0),0,100); c.reputation=clamp(c.reputation+(performance>=78?3:performance>=60?2:1),0,100);
    c.trialResult=performance>=85?"Você faz uma peneira excelente e chama atenção de clubes de diferentes níveis.":performance>=70?"Sua atuação é consistente e os observadores enxergam potencial claro.":performance>=55?"Você alterna bons lances e erros, mas consegue despertar interesse.":"A peneira não encaixa como você esperava, porém alguns clubes enxergam margem para evolução.";
    c.trialOffers=generateTrialOffers(c,performance); c.introStage="offers";
  }

  function determineRole(ovr,club,lastRating=6.9,trust=50,age=24){
    const effective=ovr+(lastRating-6.9)*3+(trust-50)*.025;
    let role=effective>=club.strength+3?"Estrela":effective>=club.strength?"Importante":effective>=club.strength-4?"Titular":effective>=club.strength-9?"Rotação":"Reserva";
    if(age<=18 && club.strength>=82 && ["Titular","Importante","Estrela"].includes(role)) role="Rotação";
    return role;
  }

  function salaryFor(player,club,role){
    const roleMult={Reserva:.24,Rotação:.48,Titular:1,Importante:1.45,Estrela:2.05}[role]||1;
    const quality=clamp(.72+Math.max(0,player.overall-55)*.018+(player.reputation||10)*.006,.70,1.75);
    return Math.max(6000,Math.round(club.salaryBaseBRL*roleMult*quality/1000)*1000);
  }

  function generateTrialOffers(c,score){
    let eligible=[...SMALL_BRAZIL];
    if(score>=60||c.overall>=60) eligible.push(...MID_BRAZIL);
    if(score>=75||c.overall>=64) eligible.push("sao-paulo","corinthians");
    if(score>=88&&c.overall>=62) eligible.push("palmeiras","flamengo");
    const unique=[...new Set(eligible)].map(clubById);
    const ranked=unique.map(club=>{
      const role=determineRole(c.overall,club,6.9,50,16);
      const fit=score+(70-Math.abs((c.overall+7)-club.strength))*1.1+rand(c,-8,8);
      return {club,role,fit};
    }).sort((a,b)=>b.fit-a.fit);
    const selected=[];
    if(score>=82){ const big=ranked.filter(x=>x.club.strength>=82); if(big.length)selected.push(big[0]); }
    ranked.forEach(x=>{ if(selected.length<3&&!selected.some(s=>s.club.id===x.club.id))selected.push(x); });
    return selected.slice(0,3).map(x=>({clubId:x.club.id,projectedRole:x.role,salaryMonthlyBRL:salaryFor(c,x.club,x.role)}));
  }

  function chooseStartingClub(c,clubId){
    const o=c.trialOffers.find(x=>x.clubId===clubId); if(!o)return;
    c.clubId=clubId; c.introStage="complete"; c.salaryMonthlyBRL=o.salaryMonthlyBRL; c.contractYearsLeft=Math.min(3,41-c.age);
    c.coachTrust=o.projectedRole==="Reserva"?42:50; if(c.rival.clubId===clubId)c.rival.clubId=pick(c,SMALL_BRAZIL.filter(x=>x!==clubId));
    c.careerLog.push({type:"start",year:START_YEAR,text:`Primeiro contrato profissional com ${clubById(clubId).name}.`});
  }

  function isClubWorldCupYear(year){return year>=2029&&(year-2029)%4===0;}
  function recentClubHistory(c,clubId,n=4){return (c.history||[]).filter(h=>h.clubId===clubId).slice(-n);}
  function qualifiedForClubWorldCup(c,club,year){
    if(!isClubWorldCupYear(year))return false;
    const recent=recentClubHistory(c,club.id,4),continental=["Copa Libertadores","UEFA Champions League","AFC Champions League Elite"];
    if(recent.some(h=>(h.titles||[]).some(t=>continental.includes(t))))return true;
    return club.prestige>=96||recent.some(h=>(h.competitions||[]).some(x=>["Copa Libertadores","UEFA Champions League","AFC Champions League Elite"].includes(x))&&club.prestige>=90);
  }
  function competitionsFor(c,club,year=START_YEAR+c.seasonIndex){
    club=clubWithCareer(c,club.id);
    const comps=[club.leagueName,club.cupName], previous=[...(c.history||[])].reverse().find(h=>h.clubId===club.id), pos=previous?.leaguePosition;
    if(club.continental==="CONMEBOL"){
      const p=pos??(club.strength>=84?4:club.strength>=78?9:14); if(p<=6)comps.push("Copa Libertadores"); else if(p<=12)comps.push("Copa Sul-Americana");
    } else if(club.continental==="UEFA"){
      const p=pos??(club.strength>=89?3:club.strength>=82?5:8); if(p<=4)comps.push("UEFA Champions League"); else if(p<=6)comps.push("UEFA Europa League"); else if(p<=7)comps.push("UEFA Conference League");
    } else if(club.continental==="AFC"){
      const p=pos??(club.strength>=84?2:5); if(p<=3)comps.push("AFC Champions League Elite");
    }
    if(qualifiedForClubWorldCup(c,club,year))comps.push("Mundial de Clubes FIFA");
    return comps;
  }

  function seasonObjective(role){ return {Estrela:"Ser protagonista e disputar os principais prêmios individuais.",Importante:"Ser decisivo e consolidar seu protagonismo.",Titular:"Manter regularidade e terminar entre os destaques.",Rotação:"Ganhar minutos e brigar por uma vaga entre os titulares.",Reserva:"Aproveitar as oportunidades e conquistar espaço."}[role]||"Fazer uma boa temporada."; }

  function startSeason(c){
    if(c.pendingSeason||c.retired||c.freeAgent)return;
    if(c.age>=41){ retireCareer(c,true); return; }
    const club=clubWithCareer(c,c.clubId), year=START_YEAR+c.seasonIndex, role=determineRole(c.overall,club,c.lastRating,c.coachTrust,c.age);
    const eventCount=club.prestige>=94?9:club.prestige>=84?8:club.prestige>=65?7:6;
    const competitions=competitionsFor(c,club,year),events=buildSeasonEvents(c,eventCount,competitions);
    const legacy=currentClubLegacy(c,club.id);
    c.pendingSeason={yearLabel:`${year}/${String((year+1)%100).padStart(2,"0")}`,calendarYear:year,clubIdAtStart:club.id,overallStart:c.overall,reputationStart:c.reputation,roleAtStart:role,objective:seasonObjective(role),competitions,events,currentEvent:0,effects:{goals:0,assists:0,tackles:0,ratingBonus:0,reputationDelta:0,formDelta:0,moraleDelta:0,coachTrustDelta:0,fanAffinityDelta:0,gamesMissed:0,developmentPenalty:0,extraIncomeBRL:0},trainingGains:{},salaryAtStart:c.salaryMonthlyBRL,fanAffinityStart:legacy.fanAffinity};
    c.lastEventKeys=events.map(e=>e.templateKey); c.lastSummary=null; c.pendingOffer=null;c.pendingOffers=[];
  }

  function buildSeasonEvents(c,count,competitions=[]){
    const events=[preseasonEvent(c)], used=new Set([events[0].templateKey]), recent=new Set(c.lastEventKeys||[]);
    const add=(factory)=>{for(let i=0;i<12;i++){const e=factory(c);if(e&&!used.has(e.templateKey)&&(!recent.has(e.templateKey)||i>=8)){used.add(e.templateKey);events.push(e);return true;}}return false;};
    if(nextRandom(c)<.14&&events.length<count)add(injuryEvent);
    const club=clubWithCareer(c,c.clubId);
    if(club.rivalId&&nextRandom(c)<.58&&events.length<count)add(derbyEvent);
    if(competitions.some(x=>["Copa Libertadores","UEFA Champions League","AFC Champions League Elite","Mundial de Clubes FIFA"].includes(x))&&events.length<count)add(continentalEvent);
    if(hasMatureMemory(c)&&nextRandom(c)<.45&&events.length<count)add(memoryEvent);
    const pool=[matchEventNormal,offFieldEvent,offFieldEvent,careerEvent,agentEvent,sponsorshipEvent,coachEvent,matchEventNormal,offFieldEvent,legacyEvent];
    while(events.length<count){const f=pick(c,pool);if(!add(f))add(offFieldEvent);}
    return events.slice(0,count);
  }

  function preseasonEvent(c){
    const attrs=attrsForPosition(c.position),picks=[...attrs].sort(()=>nextRandom(c)-.5).slice(0,Math.min(3,attrs.length));
    const variants=[
      {key:"preseason-camp",title:"Início da pré-temporada",text:"A comissão oferece alguns caminhos para a primeira semana de preparação."},
      {key:"preseason-break",title:"Primeira semana com o elenco",text:"Antes dos jogos oficiais, você pode escolher como aproveitar parte da preparação."},
      {key:"preseason-focus",title:"Preparação para o novo ano",text:"O calendário ainda não começou. É a melhor hora para definir sua prioridade."},
      {key:"preseason-altitude",title:"Temporada em altitude",text:"O clube leva o elenco para uma preparação curta em condições diferentes."},
      {key:"preseason-tour",title:"Excursão de pré-temporada",text:"Uma viagem internacional mistura amistosos, mídia e sessões de treino."},
      {key:"preseason-newcoach",title:"Novo método de trabalho",text:"A comissão altera a rotina e pede que cada jogador escolha onde concentrar energia."},
      {key:"preseason-gym",title:"Semana de carga alta",text:"Os treinos começam intensos e você precisa decidir como administrar a carga."},
      {key:"preseason-friendly",title:"Amistosos de preparação",text:"Os primeiros amistosos serão usados para definir hierarquia e funções no elenco."},
      {key:"preseason-leadership",title:"Reunião do elenco",text:"O grupo se reúne antes do início do calendário para alinhar objetivos e responsabilidades."},
      {key:"preseason-personal",title:"Plano individual",text:"O departamento de desempenho oferece um plano individual antes da primeira rodada."}
    ];const v=pick(c,variants),choices=picks.map(a=>({id:`train-${a}-${c.rngState}`,label:`Treinar ${ATTRIBUTE_LABELS[a]}`,effect:"train",attribute:a}));
    choices.push({id:`integrate-${c.rngState}`,label:"Priorizar integração com o elenco",effect:"social"},{id:`rest-${c.rngState}`,label:"Administrar a carga e descansar",effect:"discipline"});
    return {...v,id:`${v.key}-${c.rngState}`,templateKey:v.key,kind:"life",choices};
  }

  const OFFFIELD_TEMPLATES=[
    {key:"night-out",title:"Convite do elenco",text:"Alguns companheiros organizam uma festa numa noite livre.",choices:[["Ir à festa com o elenco","social"],["Ficar em casa e descansar","discipline"]]},
    {key:"family-problem",title:"Problema familiar",text:"Uma situação em casa exige atenção durante uma semana importante.",choices:[["Viajar para ficar com a família","family"],["Permanecer com o time","professional"]]},
    {key:"media-interview",title:"Entrevista após o treino",text:"Um repórter pergunta se você já deveria ser protagonista do time.",choices:[["Dizer que está pronto","bold-media"],["Valorizar o grupo e o treinador","humble-media"]]},
    {key:"community",title:"Evento com a torcida",text:"O clube organiza uma ação com torcedores no seu dia de folga.",choices:[["Participar do evento","community"],["Usar o tempo para treino extra","train-bias"]]},
    {key:"locker-room",title:"Tensão no vestiário",text:"Um companheiro critica publicamente uma jogada sua.",choices:[["Conversar em particular","private-talk"],["Responder na frente do grupo","public-reply"],["Ignorar e seguir trabalhando","ignore-conflict"]]},
    {key:"fan-criticism",title:"Cobrança da torcida",text:"Após uma sequência ruim do time, torcedores cobram o elenco na saída do treino.",choices:[["Parar para conversar","fan-talk"],["Evitar o contato e ir embora","avoid-fans"]]},
    {key:"social-media",title:"Postagem polêmica",text:"Uma brincadeira sua nas redes sociais é interpretada de formas diferentes pelos torcedores.",choices:[["Apagar e explicar","apologize"],["Manter a postagem","double-down"]]},
    {key:"late-training",title:"Atraso inesperado",text:"Um problema no trânsito pode fazer você chegar atrasado ao treino.",choices:[["Avisar a comissão imediatamente","warn-coach"],["Chegar e fingir que nada aconteceu","hide-delay"]]},
    {key:"charity",title:"Convite beneficente",text:"Uma instituição local convida você para visitar um projeto social.",choices:[["Participar da ação","community"],["Recusar para descansar","discipline"]]},
    {key:"teammate-support",title:"Companheiro em baixa",text:"Um jovem do elenco está sendo muito criticado e procura você para conversar.",choices:[["Apoiar e aconselhar","mentor"],["Evitar se envolver","neutral"]]},
    {key:"family-celebration",title:"Data importante em família",text:"Uma comemoração familiar coincide com uma atividade opcional do clube.",choices:[["Ir à comemoração","family-light"],["Ficar para a atividade do clube","professional"]]},
    {key:"commercial-day",title:"Dia de gravações",text:"O clube pede sua presença em uma longa sessão comercial.",choices:[["Participar com entusiasmo","media-day"],["Pedir para reduzir a agenda","protect-rest"]]},
    {key:"school-friends",title:"Amigos de infância",text:"Amigos antigos visitam a cidade e querem comemorar sua nova fase.",choices:[["Encontrar os amigos","social"],["Manter a rotina profissional","discipline"]]},
    {key:"new-house",title:"Mudança de casa",text:"A rotina de mudança começa a atrapalhar sono e logística de treino.",choices:[["Resolver tudo pessoalmente","family-light"],["Contratar ajuda e focar no futebol","professional"]]},
    {key:"online-criticism",title:"Críticas nas redes",text:"Uma sequência de comentários negativos começa a afetar sua semana.",choices:[["Responder aos críticos","double-down"],["Ignorar as redes por alguns dias","discipline"]]},
    {key:"fan-shirt",title:"Pedido de um jovem torcedor",text:"Após o treino, uma criança espera por você para pedir uma camisa e alguns minutos de atenção.",choices:[["Ficar e conversar","community"],["Seguir rapidamente para casa","protect-rest"]]},
    {key:"captain-advice",title:"Conselho do capitão",text:"O capitão chama você para uma conversa sobre postura e rotina.",choices:[["Ouvir e ajustar hábitos","discipline"],["Dizer que prefere seu próprio método","bold-media"]]},
    {key:"restaurant-photo",title:"Foto fora de hora",text:"Uma foto sua em um restaurante na véspera de treino circula entre torcedores.",choices:[["Explicar a situação","apologize"],["Não alimentar a história","neutral"]]},
    {key:"club-party",title:"Evento oficial do clube",text:"Patrocinadores e dirigentes estarão em um jantar oficial do clube.",choices:[["Participar e circular pelo evento","media-day"],["Comparecer brevemente e sair cedo","protect-rest"]]},
    {key:"neighbor-noise",title:"Noite mal dormida",text:"Barulho no prédio atrapalha seu descanso antes de uma semana cheia.",choices:[["Adaptar o treino e recuperar o sono","protect-rest"],["Manter a programação normal","professional"]]},
    {key:"family-move",title:"Família pensa em se mudar",text:"Pessoas próximas cogitam mudar de cidade para acompanhar sua carreira.",choices:[["Incentivar a mudança","family-light"],["Pedir que mantenham a própria rotina","professional"]]},
    {key:"fan-chant",title:"A torcida cria um canto para você",text:"Seu nome começa a aparecer com frequência nas arquibancadas.",choices:[["Agradecer publicamente","fan-talk"],["Evitar exposição e manter o foco","humble-media"]]},
    {key:"teammate-party",title:"Aniversário de um companheiro",text:"Um dos líderes do elenco convida todo o grupo para comemorar.",choices:[["Ir e fortalecer o vínculo","social"],["Enviar uma mensagem e descansar","discipline"]]},
    {key:"podcast",title:"Convite para podcast",text:"Um programa esportivo popular quer uma entrevista longa e descontraída.",choices:[["Aceitar o convite","bold-media"],["Recusar e manter perfil baixo","humble-media"]]},
    {key:"documentary",title:"Minidocumentário",text:"Uma produtora quer acompanhar sua rotina por alguns dias.",choices:[["Abrir as portas","media-day"],["Recusar a exposição","protect-rest"]]},
    {key:"gaming-night",title:"Madrugada online",text:"Companheiros convidam você para uma sessão de videogame que pode atravessar a madrugada.",choices:[["Entrar na resenha","social"],["Dormir cedo","discipline"]]},
    {key:"nutrition",title:"Mudança na alimentação",text:"O nutricionista sugere uma rotina mais rígida durante um mês.",choices:[["Seguir o plano à risca","discipline"],["Manter seus hábitos atuais","neutral"]]},
    {key:"language",title:"Aulas de idioma",text:"Em um país novo, o clube oferece aulas para acelerar sua adaptação.",choices:[["Fazer as aulas","professional"],["Aprender aos poucos com o elenco","social"]]},
    {key:"homesick",title:"Saudade de casa",text:"A distância da família pesa mais do que você esperava.",choices:[["Viajar numa folga curta","family-light"],["Ficar e se aproximar do elenco","social"]]},
    {key:"press-conference",title:"Coletiva tensa",text:"Após uma derrota, a imprensa procura um jogador para falar em nome do grupo.",choices:[["Assumir a responsabilidade","bold-media"],["Dividir a responsabilidade com o grupo","humble-media"]]},
    {key:"academy-visit",title:"Visita à base",text:"O clube convida você para conversar com atletas das categorias de base.",choices:[["Participar e contar sua história","mentor"],["Priorizar recuperação física","protect-rest"]]},
    {key:"city-award",title:"Homenagem municipal",text:"A cidade oferece uma pequena homenagem pelo seu momento no clube.",choices:[["Comparecer à cerimônia","community"],["Enviar representante e treinar","train-bias"]]},
    {key:"locker-prank",title:"Brincadeira no vestiário",text:"Uma brincadeira com você vira assunto entre os companheiros.",choices:[["Entrar na brincadeira","social"],["Pedir mais respeito","private-talk"]]},
    {key:"fan-protest",title:"Protesto no CT",text:"Torcedores protestam contra a fase do clube antes do treino.",choices:[["Conversar com representantes","fan-talk"],["Entrar sem parar","avoid-fans"]]},
    {key:"personal-coach",title:"Treinador particular",text:"Um profissional externo oferece acompanhamento técnico individual.",choices:[["Contratar e trabalhar em folgas","train-bias"],["Confiar apenas na comissão do clube","professional"]]},
    {key:"vacation-choice",title:"Folga inesperada",text:"A comissão libera dois dias extras no meio da temporada.",choices:[["Viajar e desligar do futebol","family-light"],["Ficar e fazer trabalho leve","discipline"]]}
  ];
  function offFieldEvent(c){ const t=pick(c,OFFFIELD_TEMPLATES); return {id:`${t.key}-${c.rngState}`,templateKey:t.key,kind:"life",title:t.title,text:t.text,choices:t.choices.map((x,i)=>({id:`${t.key}-${i}-${c.rngState}`,label:x[0],effect:x[1]}))}; }

  function agentEvent(c){
    const variants=[
      {key:"agent-playing-time",title:"Conversa com o empresário",text:"Seu empresário acha que você deveria pressionar o clube por mais minutos.",choices:[["Autorizar a cobrança pública","agent-pressure"],["Pedir discrição e seguir trabalhando","agent-calm"]]},
      {key:"agent-rumor",title:"Rumor de transferência",text:"Seu empresário diz que pode vazar o interesse de outro clube para valorizar seu contrato.",choices:[["Aceitar a estratégia","agent-rumor"],["Recusar e evitar ruído","agent-calm"]]},
      {key:"agent-change",title:"Desentendimento com o empresário",text:"Vocês discordam sobre o próximo passo da carreira.",choices:[["Manter a parceria","agent-stay"],["Romper e buscar outro agente","agent-break"]]},
      {key:"agent-renewal",title:"Renovação no radar",text:"O empresário quer iniciar conversas de renovação antes da reta final do contrato.",choices:[["Autorizar conversas agora","agent-renew"],["Esperar a temporada terminar","agent-calm"]]},
      {key:"agent-europe",title:"Interesse no exterior",text:"Seu representante diz que sondagens de outro país podem aparecer se você se expuser mais.",choices:[["Buscar entrevistas internacionais","bold-media"],["Deixar o futebol falar","humble-media"]]},
      {key:"agent-salary",title:"Discussão sobre salário",text:"Seu empresário considera seu salário abaixo do mercado.",choices:[["Pedir valorização ao clube","agent-pressure"],["Não mexer no contrato agora","agent-calm"]]},
      {key:"agent-loan",title:"Possível empréstimo",text:"Seu representante acredita que uma temporada em outro clube pode significar mais minutos.",choices:[["Autorizar sondagens por empréstimo","loan-interest"],["Querer disputar espaço aqui","agent-calm"]]},
      {key:"agent-brand",title:"Imagem pessoal",text:"Seu empresário sugere investir mais tempo em construção de marca pessoal.",choices:[["Aumentar exposição","media-day"],["Manter foco esportivo","professional"]]},
      {key:"agent-clause",title:"Cláusula contratual",text:"O representante sugere negociar uma saída mais fácil em um contrato futuro.",choices:[["Priorizar liberdade de carreira","agent-rumor"],["Priorizar estabilidade","agent-calm"]]},
      {key:"agent-family",title:"Decisão de carreira",text:"Seu empresário pergunta se a família deveria pesar na escolha do próximo país.",choices:[["Família será prioridade","family-light"],["Projeto esportivo vem primeiro","professional"]]},
      {key:"agent-request",title:"Pedido de transferência",text:"Uma fase de pouco espaço faz seu empresário perguntar se deve procurar uma saída.",choices:[["Autorizar busca por outro clube","request-transfer"],["Continuar brigando por espaço","agent-calm"]]},
      {key:"agent-bonus",title:"Bônus de desempenho",text:"O empresário quer negociar bônus maiores em vez de salário fixo.",choices:[["Gostar da ideia","agent-renew"],["Preferir salário garantido","agent-calm"]]}
    ];const t=pick(c,variants);return{id:`${t.key}-${c.rngState}`,templateKey:t.key,kind:"life",title:t.title,text:t.text,choices:t.choices.map((x,i)=>({id:`${t.key}-${i}-${c.rngState}`,label:x[0],effect:x[1]}))};
  }

  function sponsorshipEvent(c){
    const variants=[
      ["Chuteira e material esportivo","Uma marca esportiva quer associar seu nome a uma nova linha."],
      ["Campanha de bebida esportiva","Uma marca de hidratação procura atletas em ascensão."],
      ["Publicidade automotiva","Uma montadora oferece uma campanha curta nas redes e eventos."],
      ["Banco digital","Uma empresa financeira quer você em uma ação voltada a jovens torcedores."],
      ["Campanha de videogame","Uma marca de games quer usar sua imagem em lançamento esportivo."],
      ["Moda casual","Uma grife propõe ensaio e presença em lançamento."],
      ["Telefonia","Uma operadora prepara campanha nacional com jogadores de futebol."],
      ["Relógios","Uma marca premium procura um rosto para ações de imagem."],
      ["Alimentação","Uma empresa de alimentos oferece contrato de embaixador."],
      ["Campanha internacional","Uma marca global quer aproveitar sua crescente reputação fora do país."]
    ],idx=randInt(c,0,variants.length-1),[title,text]=variants[idx],value=Math.round((12000+(c.reputation||10)*3900+c.overall*850)*rand(c,.7,1.35)/1000)*1000;
    return{id:`sponsor-${idx}-${c.rngState}`,templateKey:`sponsor-${idx}`,kind:"life",title,text:`${text} O contrato vale cerca de ${formatMoney(value,c.currencyPreference)}.`,sponsorValue:value,choices:[{id:`sponsor-yes-${c.rngState}`,label:"Aceitar o patrocínio",effect:"sponsor-yes"},{id:`sponsor-no-${c.rngState}`,label:"Recusar para preservar tempo e imagem",effect:"sponsor-no"}]};
  }

  const INJURIES=[
    {key:"bruise",name:"Contusão muscular",weight:28,min:1,max:2,penalty:.02,setback:.10},
    {key:"ankle",name:"Entorse de tornozelo",weight:20,min:3,max:6,penalty:.08,setback:.22},
    {key:"hamstring",name:"Lesão muscular posterior",weight:17,min:4,max:8,penalty:.12,setback:.28},
    {key:"adductor",name:"Lesão de adutor",weight:11,min:3,max:7,penalty:.10,setback:.25},
    {key:"calf",name:"Lesão na panturrilha",weight:8,min:3,max:8,penalty:.11,setback:.25},
    {key:"shoulder",name:"Lesão no ombro",weight:5,min:5,max:10,penalty:.16,setback:.30},
    {key:"concussion",name:"Concussão",weight:4,min:1,max:4,penalty:.05,setback:.08},
    {key:"fracture",name:"Fratura",weight:3,min:10,max:18,penalty:.30,setback:.25},
    {key:"meniscus",name:"Lesão meniscal",weight:2.5,min:8,max:15,penalty:.24,setback:.30},
    {key:"knee",name:"Lesão ligamentar no joelho",weight:1.5,min:14,max:24,penalty:.42,setback:.35}
  ];

  function injuryEvent(c){ const inj=weightedPick(c,INJURIES,INJURIES.map(x=>x.weight)); return {id:`inj-${inj.key}-${c.rngState}`,templateKey:`injury-${inj.key}`,kind:"injury",injury:inj,title:inj.name,text:`O departamento médico confirma ${inj.name.toLowerCase()}. O prazo pode afetar uma parte importante da temporada.`,choices:[{id:`rehab-${c.rngState}`,label:"Cumprir todo o tratamento",effect:"rehab"},{id:`rush-${c.rngState}`,label:"Tentar antecipar o retorno",effect:"rush-return"}]}; }

  const MATCH_TEMPLATES=[
    {key:"match-tied-late",title:"Jogo empatado na reta final",text:"Aos 82 minutos, o placar está 0–0 e surge uma jogada importante.",state:"tied",score:"0–0"},
    {key:"match-trailing",title:"Tentativa de reação",text:"Seu time perde por 1–0 aos 76 minutos e precisa buscar o empate.",state:"trailing",score:"0–1"},
    {key:"match-leading",title:"Segurar a vantagem",text:"Seu time vence por 1–0 aos 86 minutos. O adversário aumenta a pressão.",state:"leading",score:"1–0"},
    {key:"match-cup",title:"Mata-mata equilibrado",text:"O confronto eliminatório está empatado e entra nos minutos finais.",state:"tied",score:"1–1"},
    {key:"match-counter",title:"Contra-ataque decisivo",text:"Com o jogo em 1–1, seu time recupera a bola em velocidade aos 88 minutos.",state:"tied",score:"1–1"},
    {key:"match-pressure",title:"Pressão no fim do jogo",text:"O placar está 0–0 e o adversário avança suas linhas nos minutos finais.",state:"tied",score:"0–0"},
    {key:"match-big",title:"Noite de jogo grande",text:"O estádio está cheio. Aos 80 minutos, a partida segue empatada em 1–1.",state:"tied",score:"1–1"},
    {key:"match-comeback",title:"Última chance para empatar",text:"Seu time perde por 2–1 e chega ao ataque aos 89 minutos.",state:"trailing",score:"1–2"},
    {key:"match-title-race",title:"Jogo pela liderança",text:"Uma vitória coloca seu clube na liderança. O placar está 1–1 aos 74 minutos.",state:"tied",score:"1–1"},
    {key:"match-relegation",title:"Jogo de seis pontos",text:"Contra um adversário direto na tabela, a partida chega empatada aos minutos finais.",state:"tied",score:"0–0"},
    {key:"match-cup-away",title:"Mata-mata fora de casa",text:"A torcida adversária pressiona e seu time precisa proteger um empate por 1–1.",state:"tied",score:"1–1"},
    {key:"match-cup-home",title:"Noite de copa em casa",text:"Seu clube empurra o adversário para trás, mas o placar segue 0–0.",state:"tied",score:"0–0"},
    {key:"match-extra-time",title:"Prorrogação",text:"Depois de 105 minutos, o confronto segue empatado em 1–1.",state:"tied",score:"1–1"},
    {key:"match-one-man-down",title:"Com um jogador a menos",text:"Seu time tem um expulso e tenta segurar o 1–0 nos minutos finais.",state:"leading",score:"1–0"},
    {key:"match-one-man-up",title:"Superioridade numérica",text:"O rival tem um jogador expulso. A partida está 1–1 e há espaço para atacar.",state:"tied",score:"1–1"},
    {key:"match-heavy-rain",title:"Jogo sob chuva forte",text:"O gramado está pesado e a partida chega 0–0 aos 78 minutos.",state:"tied",score:"0–0"},
    {key:"match-away-pressure",title:"Pressão fora de casa",text:"A torcida adversária aumenta o volume com o jogo empatado em 1–1.",state:"tied",score:"1–1"},
    {key:"match-first-start",title:"Chance entre os titulares",text:"Em uma rara oportunidade desde o início, o jogo está aberto na reta final.",state:"tied",score:"1–1"},
    {key:"match-return-injury",title:"Retorno importante",text:"Depois de semanas fora, você entra com o time buscando um gol no fim.",state:"trailing",score:"0–1"},
    {key:"match-derby-eve",title:"Véspera de clássico",text:"Uma partida difícil antes do clássico exige concentração. O placar está 1–0 para seu time.",state:"leading",score:"1–0"},
    {key:"match-top-opponent",title:"Contra o líder",text:"Seu time encara o líder da competição e segura um empate por 0–0.",state:"tied",score:"0–0"},
    {key:"match-bottom-opponent",title:"Obrigação de vencer",text:"Contra o último colocado, seu time não consegue sair do 1–1.",state:"tied",score:"1–1"},
    {key:"match-record",title:"Noite de recorde",text:"Uma boa atuação pode marcar um recorde pessoal. O jogo está 2–2.",state:"tied",score:"2–2"},
    {key:"match-final-minute",title:"Último minuto",text:"O árbitro sinaliza os acréscimos e o placar segue 0–0.",state:"tied",score:"0–0"},
    {key:"match-protect-draw",title:"Um ponto valioso",text:"Fora de casa, o empate por 1–1 vale muito para a campanha.",state:"tied",score:"1–1"},
    {key:"match-open-game",title:"Partida completamente aberta",text:"O jogo está 2–2, com chances dos dois lados e pouco tempo restante.",state:"tied",score:"2–2"},
    {key:"match-captain",title:"Responsabilidade extra",text:"Com o capitão fora, você recebe mais responsabilidade em um jogo empatado.",state:"tied",score:"1–1"},
    {key:"match-bad-streak",title:"Fim de uma sequência ruim",text:"O clube não vence há quatro partidas e está empatando por 0–0.",state:"tied",score:"0–0"},
    {key:"match-winning-streak",title:"Manter a sequência",text:"Seu time vem de quatro vitórias, mas encontra um jogo duro em 1–1.",state:"tied",score:"1–1"},
    {key:"match-farewell",title:"Último jogo em casa",text:"A temporada se aproxima do fim e o estádio está cheio. O placar é 1–1.",state:"tied",score:"1–1"}
  ];

  function matchChoices(c){
    if(c.position==="GOL")return [{label:"Esperar o chute e reagir",attribute:"goalkeeping"},{label:"Antecipar e iniciar o contra-ataque",attribute:"passing"}];
    if(["ZAG","VOL","LE","LD"].includes(c.position))return [{label:"Antecipar e recuperar a bola",attribute:"tackling"},{label:"Acelerar a saída com um passe",attribute:"passing"},{label:"Aparecer no ataque",attribute:"shooting"}];
    if(c.position==="MC")return [{label:"Buscar o passe decisivo",attribute:"passing"},{label:"Conduzir e quebrar a linha",attribute:"dribbling"},{label:"Antecipar e recuperar",attribute:"tackling"}];
    if(c.position==="MEI")return [{label:"Buscar o passe decisivo",attribute:"passing"},{label:"Partir para o drible",attribute:"dribbling"},{label:"Finalizar",attribute:"shooting"}];
    return [{label:"Finalizar",attribute:"shooting"},{label:"Partir para o drible",attribute:"dribbling"},{label:"Buscar o passe decisivo",attribute:"passing"}];
  }
  function matchEventNormal(c){ const t=pick(c,MATCH_TEMPLATES); return {id:`${t.key}-${c.rngState}`,templateKey:t.key,kind:"match",title:t.title,text:t.text,matchState:t.state,scoreBefore:t.score,choices:matchChoices(c).map((x,i)=>({id:`match-${t.key}-${i}-${c.rngState}`,label:x.label,attribute:x.attribute,effect:"match"}))}; }
  function derbyEvent(c){
    const club=clubWithCareer(c,c.clubId),rival=clubWithCareer(c,club.rivalId),defensive=c.position==="GOL"||["ZAG","VOL","LE","LD"].includes(c.position),variants=[
      ["Clássico travado","O clássico está 0–0 aos 79 minutos. Uma jogada pode mudar a noite.","tied","0–0"],
      ["Virada no clássico","Seu time perde por 1–0 e a torcida exige uma reação imediata.","trailing","0–1"],
      ["Defender a vantagem","Seu time vence por 1–0 aos 85 minutos e o rival se lança ao ataque.","leading","1–0"],
      ["Clássico eletrizante","Depois de quatro gols, o placar está 2–2 e ninguém aceita o empate.","tied","2–2"],
      ["Clássico de mata-mata","O confronto eliminatório está empatado em 1–1 perto do fim.","tied","1–1"],
      ["Hostilidade fora de casa","A torcida rival pressiona com o placar em 0–0.","tied","0–0"],
      ["Clássico pela liderança","Os dois clubes disputam as primeiras posições e empatam por 1–1.","tied","1–1"],
      ["Clássico de despedida","O último clássico da temporada chega aos minutos finais empatado.","tied","1–1"]
    ],idx=randInt(c,0,variants.length-1),[title,text,state,score]=variants[idx];
    return{id:`derby-${idx}-${c.rngState}`,templateKey:`derby-${idx}`,kind:"derby",title:`${club.name} × ${rival.name} · ${title}`,text,matchState:state,scoreBefore:score,rivalClubName:rival.name,choices:matchChoices(c).map((x,i)=>({id:`derby-${idx}-${i}-${c.rngState}`,label:x.label,attribute:x.attribute,effect:"match"}))};
  }

  function continentalEvent(c){
    const comps=c.pendingSeason?.competitions||competitionsFor(c,clubWithCareer(c,c.clubId));
    const tournament=comps.includes("Mundial de Clubes FIFA")?"Mundial de Clubes FIFA":comps.find(x=>["Copa Libertadores","Copa Sul-Americana","UEFA Champions League","UEFA Europa League","UEFA Conference League","AFC Champions League Elite"].includes(x))||"competição continental";
    const variants=[
      ["Quartas de final",`A eliminatória de ${tournament} está aberta e um lance pode definir a classificação.`],
      ["Semifinal",`Seu clube está a poucos minutos de uma final de ${tournament}.`],
      ["Noite continental",`O ambiente é diferente: estádio cheio e pressão máxima em ${tournament}.`],
      ["Jogo de volta",`Depois de um confronto equilibrado, a vaga em ${tournament} será decidida agora.`],
      ["Final internacional",`O título de ${tournament} está em jogo e o placar segue empatado.`]
    ],idx=randInt(c,0,variants.length-1),[title,text]=variants[idx],score=idx===4?"1–1":"0–0";
    return{id:`continental-${idx}-${c.rngState}`,templateKey:`continental-${tournament}-${idx}`,kind:"continental",title,text,competition:tournament,matchState:"tied",scoreBefore:score,choices:matchChoices(c).map((x,i)=>({id:`continental-${idx}-${i}-${c.rngState}`,label:x.label,attribute:x.attribute,effect:"match"}))};
  }

  function coachEvent(c){
    const variants=[
      ["Cobrança individual","O treinador considera que você pode entregar mais sem a bola.",[["Aceitar a cobrança e trabalhar mais","professional"],["Defender seu estilo de jogo","coach-challenge"]]],
      ["Mudança tática","A comissão quer alterar sua função em jogos grandes.",[["Aceitar o plano","professional"],["Pedir liberdade maior","coach-challenge"]]],
      ["Banco em jogo importante","O treinador cogita começar uma partida grande com você no banco.",[["Aceitar e esperar a chance","discipline"],["Questionar a decisão","coach-challenge"]]],
      ["Conversa reservada","O treinador pergunta como está sua confiança.",[["Ser aberto sobre as dificuldades","coach-open"],["Dizer que está tudo bem","neutral"]]],
      ["Responsabilidade no grupo","A comissão quer que você fale com jogadores mais jovens.",[["Assumir o papel","mentor"],["Preferir focar só em campo","neutral"]]],
      ["Treino fechado","O técnico pede intensidade máxima em um treino sem imprensa.",[["Dar tudo no treino","train-bias"],["Administrar o esforço","protect-rest"]]],
      ["Promessa da base","Uma jovem promessa começa a disputar minutos com você.",[["Ajudar o garoto","mentor"],["Deixar claro que a vaga é disputada","professional"]]],
      ["Conflito de ideias","Você e o treinador discordam sobre sua posição ideal.",[["Conversar em particular","private-talk"],["Levar o tema à imprensa","bold-media"]]],
      ["Reunião pós-derrota","A comissão cobra líderes após uma atuação ruim coletiva.",[["Assumir parte da responsabilidade","coach-open"],["Cobrar também os companheiros","public-reply"]]],
      ["Treinador sob pressão","Rumores de demissão cercam a comissão técnica.",[["Apoiar publicamente o treinador","humble-media"],["Evitar tomar lado","neutral"]]]
    ],idx=randInt(c,0,variants.length-1),[title,text,choices]=variants[idx];return{id:`coach-${idx}-${c.rngState}`,templateKey:`coach-${idx}`,kind:"career",title,text,choices:choices.map((x,i)=>({id:`coach-${idx}-${i}-${c.rngState}`,label:x[0],effect:x[1]}))};
  }

  function legacyEvent(c){
    const legacy=currentClubLegacy(c,c.clubId); if((legacy.seasons||0)<2)return offFieldEvent(c);
    const variants=[
      ["Mosaico da torcida","A torcida prepara um mosaico e seu nome aparece entre os jogadores mais queridos.",[["Ir ao setor depois do jogo","fan-talk"],["Agradecer nas redes","humble-media"]]],
      ["Camisa comemorativa","O clube prepara uma ação sobre sua trajetória no time.",[["Participar da campanha","community"],["Manter perfil discreto","humble-media"]]],
      ["Líder do vestiário","Jogadores mais jovens passam a procurar você com frequência.",[["Assumir a liderança","mentor"],["Evitar sobrecarga fora de campo","protect-rest"]]],
      ["Proposta para ser referência","A direção quer usar sua imagem como símbolo do projeto esportivo.",[["Aceitar o papel","legacy-embrace"],["Preferir menos exposição","protect-rest"]]],
      ["Torcida pede permanência","Rumores de mercado fazem torcedores iniciarem campanha para você ficar.",[["Dizer que se sente em casa","legacy-embrace"],["Não falar sobre futuro","neutral"]]],
      ["Aniversário do clube","Você é convidado para representar o elenco em uma cerimônia histórica.",[["Comparecer e discursar","community"],["Participar sem discurso","humble-media"]]]
    ],idx=randInt(c,0,variants.length-1),[title,text,choices]=variants[idx];return{id:`legacy-${idx}-${c.rngState}`,templateKey:`legacy-${idx}`,kind:"life",title,text,choices:choices.map((x,i)=>({id:`legacy-${idx}-${i}-${c.rngState}`,label:x[0],effect:x[1]}))};
  }

  function hasMatureMemory(c){return Object.values(c.memories||{}).some(v=>typeof v==="number"?c.seasonIndex-v>=1:!!v);}
  function memoryEvent(c){
    const mem=c.memories||{}, options=[];
    if(mem.helpedTeammate!==undefined&&c.seasonIndex-mem.helpedTeammate>=1)options.push({key:"memory-teammate",title:"Um velho gesto volta",text:"O jovem que você apoiou no passado agora vive boa fase e agradece publicamente sua ajuda.",choices:[["Retribuir o elogio","memory-positive"],["Minimizar sua participação","humble-media"]]});
    if(mem.changedAgent!==undefined&&c.seasonIndex-mem.changedAgent>=1)options.push({key:"memory-agent",title:"O novo empresário entrega resultado",text:"Depois da troca de representante, uma nova rede de contatos começa a abrir portas.",choices:[["Dar autonomia ao empresário","memory-market"],["Manter controle das decisões","agent-calm"]]});
    if(mem.coachClash!==undefined&&c.seasonIndex-mem.coachClash>=1)options.push({key:"memory-coach",title:"A discussão não foi esquecida",text:"Uma antiga divergência com a comissão volta à tona antes de um jogo importante.",choices:[["Procurar o treinador e encerrar o assunto","private-talk"],["Manter sua posição","coach-challenge"]]});
    if(mem.fanMoment!==undefined&&c.seasonIndex-mem.fanMoment>=1)options.push({key:"memory-fans",title:"A torcida lembra",text:"Uma atitude sua com os torcedores no passado reaparece em uma campanha nas arquibancadas.",choices:[["Agradecer e se aproximar","community"],["Manter foco apenas no jogo","neutral"]]});
    if(mem.sponsorDeal!==undefined&&c.seasonIndex-mem.sponsorDeal>=1)options.push({key:"memory-sponsor",title:"Renovação de patrocínio",text:"Uma marca que já trabalhou com você quer ampliar a parceria.",choices:[["Renovar a parceria","sponsor-memory"],["Encerrar em bons termos","sponsor-no"]]});
    if(!options.length)return offFieldEvent(c);const t=pick(c,options);return{id:`${t.key}-${c.rngState}`,templateKey:t.key,kind:"memory",title:t.title,text:t.text,choices:t.choices.map((x,i)=>({id:`${t.key}-${i}-${c.rngState}`,label:x[0],effect:x[1]}))};
  }

  function positionEvent(c){
    let targets=POSITION_ADJACENCY[c.position].filter(x=>x!==c.position&&x!==c.secondaryPosition);
    if(!targets.length)return offFieldEvent(c);
    const target=pick(c,targets); return {id:`pos-${target}-${c.rngState}`,templateKey:`position-${target}`,kind:"career",title:"Conversa com o treinador",text:`O treinador acredita que seu perfil pode render melhor como ${POSITION_LABELS[target]}.`,choices:[{id:`stay-pos-${c.rngState}`,label:`Continuar como ${POSITION_LABELS[c.position]}`,effect:"form"},{id:`change-pos-${c.rngState}`,label:`Aceitar a mudança para ${POSITION_LABELS[target]}`,effect:"position",positionTarget:target}]};
  }
  function careerEvent(c){ return POSITION_ADJACENCY[c.position].some(x=>x!==c.secondaryPosition)&&nextRandom(c)<.42?positionEvent(c):agentEvent(c); }

  function resultScore(c,event,success,offensive){
    const [a,b]=event.scoreBefore.split("–").map(Number); let ta=a,tb=b;
    if(success){ if(offensive)ta++; else if(event.matchState==="leading"||event.matchState==="tied"){} }
    else { if(!offensive||event.matchState==="leading")tb+=nextRandom(c)<.55?1:0; else if(nextRandom(c)<.35)tb++; }
    if(event.kind==="derby" && success && offensive && event.matchState==="tied") return `${ta}–${tb}`;
    return `${ta}–${tb}`;
  }

  function resolveEventChoice(c,choiceId){
    const p=c.pendingSeason; if(!p)return; const e=p.events[p.currentEvent]; if(!e||e.resolved)return;
    const ch=e.choices.find(x=>x.id===choiceId); if(!ch)return; let text="";
    switch(ch.effect){
      case "train": { const gain=nextRandom(c)<.08?2:1; applyAttr(c.attributes,ch.attribute,gain); c.overall=calculateOverall(c.position,c.attributes); p.trainingGains[ch.attribute]=(p.trainingGains[ch.attribute]||0)+gain; p.effects.moraleDelta-=1; text=`O treino rende evolução em ${ATTRIBUTE_LABELS[ch.attribute]}.`; break; }
      case "train-bias": { const a=weightedPick(c,attrsForPosition(c.position),attrsForPosition(c.position).map(x=>c.developmentBias?.[x]||1)); applyAttr(c.attributes,a,1); c.overall=calculateOverall(c.position,c.attributes); p.effects.reputationDelta-=1; text=`O trabalho extra melhora ${ATTRIBUTE_LABELS[a]}, embora você abra mão de parte da folga.`; break; }
      case "social": p.effects.moraleDelta+=6;p.effects.formDelta-=2;p.effects.reputationDelta+=1;text="A noite melhora sua integração com o elenco, mas o descanso não é perfeito.";break;
      case "discipline": p.effects.formDelta+=2;p.effects.coachTrustDelta+=2;text="Você chega inteiro à sequência de treinos e a comissão valoriza sua postura.";break;
      case "family": {const m=randInt(c,1,2);p.effects.gamesMissed+=m;p.effects.moraleDelta+=7;p.effects.coachTrustDelta-=1;text=`Você prioriza a família e perde ${m} jogo(s), mas volta mentalmente mais tranquilo.`;break;}
      case "family-light": p.effects.moraleDelta+=5;p.effects.coachTrustDelta-=1;text="A presença com a família melhora seu ânimo, embora você perca uma atividade opcional.";break;
      case "professional": p.effects.coachTrustDelta+=2;p.effects.moraleDelta-=4;p.effects.formDelta+=1;text="Você permanece com o time e ganha pontos com a comissão, mas sente o peso da decisão fora de campo.";break;
      case "bold-media":p.effects.reputationDelta+=3;p.effects.coachTrustDelta-=1;text="A fala ganha repercussão e aumenta sua exposição. A cobrança também sobe.";break;
      case "humble-media":p.effects.reputationDelta+=1;p.effects.coachTrustDelta+=2;text="A resposta é bem recebida pelo grupo e pelo treinador.";break;
      case "community":p.effects.reputationDelta+=3;p.effects.moraleDelta+=3;p.effects.fanAffinityDelta+=4;c.memories.fanMoment??=c.seasonIndex;text="Sua participação aproxima você da torcida e melhora sua imagem.";break;
      case "private-talk":p.effects.moraleDelta+=3;p.effects.coachTrustDelta+=2;text="A conversa resolve a tensão sem criar novas manchetes.";break;
      case "public-reply": if(nextRandom(c)<.45){p.effects.reputationDelta+=2;p.effects.coachTrustDelta-=2;text="Sua firmeza agrada parte da torcida, mas a comissão não gosta do conflito público.";}else{p.effects.reputationDelta-=2;p.effects.moraleDelta-=3;p.effects.coachTrustDelta-=2;text="A discussão cresce e o ambiente fica mais pesado.";}break;
      case "ignore-conflict":p.effects.formDelta+=1;p.effects.moraleDelta-=1;text="Você não alimenta a discussão e segue trabalhando.";break;
      case "fan-talk":p.effects.reputationDelta+=2;p.effects.moraleDelta+=1;p.effects.fanAffinityDelta+=5;c.memories.fanMoment??=c.seasonIndex;text="A conversa diminui a tensão e rende respeito de parte da torcida.";break;
      case "avoid-fans":p.effects.formDelta+=1;p.effects.reputationDelta-=1;p.effects.fanAffinityDelta-=3;text="Você evita o confronto, mas alguns torcedores interpretam a saída como distância.";break;
      case "apologize":p.effects.reputationDelta+=1;p.effects.coachTrustDelta+=1;text="A explicação encerra a maior parte da polêmica.";break;
      case "double-down":p.effects.reputationDelta+=nextRandom(c)<.5?2:-2;p.effects.moraleDelta+=1;text="Você mantém a posição. A atitude divide opiniões e amplia sua exposição.";break;
      case "warn-coach":p.effects.coachTrustDelta+=1;text="Você avisa com antecedência e a comissão entende a situação.";break;
      case "hide-delay":p.effects.coachTrustDelta-=3;text="A tentativa de disfarçar o atraso é percebida e gera cobrança interna.";break;
      case "mentor":p.effects.moraleDelta+=2;p.effects.coachTrustDelta+=1;c.memories.helpedTeammate??=c.seasonIndex;text="O gesto fortalece seu respeito dentro do elenco.";break;
      case "neutral":p.effects.formDelta+=1;text="Você evita se envolver e mantém foco na própria rotina.";break;
      case "media-day":p.effects.reputationDelta+=2;p.effects.moraleDelta-=1;text="A agenda é cansativa, mas sua exposição cresce.";break;
      case "protect-rest":p.effects.formDelta+=1;p.effects.coachTrustDelta-=1;text="Você preserva o descanso, embora o clube preferisse maior disponibilidade.";break;
      case "agent-pressure":p.effects.reputationDelta+=1;p.effects.coachTrustDelta-=3;text="A cobrança chega ao clube e aumenta a tensão pela disputa de minutos.";break;
      case "agent-calm":p.effects.coachTrustDelta+=1;p.effects.moraleDelta+=1;text="Você evita ruído e mantém a negociação nos bastidores.";break;
      case "agent-rumor":p.effects.reputationDelta+=3;p.effects.coachTrustDelta-=2;text="O rumor valoriza seu nome no mercado, mas incomoda a direção.";break;
      case "agent-stay":p.effects.moraleDelta-=1;text="Vocês seguem juntos, ainda que a relação fique um pouco desgastada.";break;
      case "agent-break":p.effects.reputationDelta+=1;p.effects.moraleDelta+=2;c.memories.changedAgent=c.seasonIndex;text="Você troca de representante e sente que retoma o controle da carreira.";break;
      case "sponsor-yes":p.effects.extraIncomeBRL+=e.sponsorValue||0;p.effects.reputationDelta+=2;c.memories.sponsorDeal=c.seasonIndex;text=`Você fecha a campanha e adiciona ${formatMoney(e.sponsorValue||0,c.currencyPreference)} aos ganhos da carreira.`;break;
      case "sponsor-no":p.effects.coachTrustDelta+=1;text="Você recusa a campanha e mantém foco total no futebol.";break;
      case "coach-challenge":p.effects.coachTrustDelta-=3;p.effects.moraleDelta+=1;c.memories.coachClash=c.seasonIndex;text="Você sustenta sua visão. A relação com a comissão fica mais tensa.";break;
      case "coach-open":p.effects.coachTrustDelta+=3;p.effects.moraleDelta+=2;text="A conversa franca aproxima você da comissão técnica.";break;
      case "agent-renew":c.earlyRenewalInterest=true;p.effects.reputationDelta+=1;text="Seu empresário abre conversas com a direção sobre uma renovação antecipada.";break;
      case "loan-interest":c.loanInterest=true;p.effects.moraleDelta+=1;text="Seu empresário fica autorizado a procurar um empréstimo que ofereça mais minutos.";break;
      case "request-transfer":c.transferListed=true;p.effects.coachTrustDelta-=4;p.effects.reputationDelta+=1;text="Seu empresário comunica ao clube que você está aberto a uma transferência.";break;
      case "legacy-embrace":p.effects.fanAffinityDelta+=7;p.effects.reputationDelta+=2;p.effects.coachTrustDelta+=1;text="Você abraça o papel de referência e fortalece ainda mais sua ligação com o clube.";break;
      case "memory-positive":p.effects.reputationDelta+=2;p.effects.fanAffinityDelta+=2;text="A história repercute bem e reforça sua imagem de liderança.";break;
      case "memory-market":c.transferListed=true;p.effects.reputationDelta+=2;text="O novo representante intensifica contatos e seu nome ganha força no mercado.";break;
      case "sponsor-memory":{const v=Math.round((20000+c.reputation*4200+c.overall*900)*rand(c,.8,1.25)/1000)*1000;p.effects.extraIncomeBRL+=v;p.effects.reputationDelta+=2;text=`A parceria é renovada e rende mais ${formatMoney(v,c.currencyPreference)}.`;break;}
      case "position": { const old=c.position, target=ch.positionTarget; c.position=target; c.secondaryPosition=old; c.overall=calculateOverall(c.position,c.attributes); p.effects.formDelta+=1;p.effects.moraleDelta+=1;text=`A mudança é efetivada: ${POSITION_LABELS[target]} passa a ser sua posição principal e ${old} fica como alternativa.`;break; }
      case "form":p.effects.formDelta+=1;p.effects.coachTrustDelta+=1;text="Você mantém o foco na função atual e reforça sua convicção com o treinador.";break;
      case "rehab": { const inj=e.injury,miss=randInt(c,inj.min,inj.max);p.effects.gamesMissed+=miss;p.effects.developmentPenalty=Math.max(p.effects.developmentPenalty,inj.penalty);p.effects.coachTrustDelta+=1;p.effects.moraleDelta-=1;text=`Você cumpre a recuperação e perde ${miss} jogo(s). O tempo parado reduz um pouco o ritmo de evolução desta temporada.`;break; }
      case "rush-return": { const inj=e.injury,base=Math.max(1,Math.round(randInt(c,inj.min,inj.max)*.45));p.effects.gamesMissed+=base; if(nextRandom(c)<inj.setback){const extra=randInt(c,Math.max(2,Math.round(inj.min*.6)),Math.max(3,Math.round(inj.max*.8)));p.effects.gamesMissed+=extra;p.effects.developmentPenalty=Math.max(p.effects.developmentPenalty,inj.penalty+.12);p.effects.formDelta-=5;const a=pick(c,attrsForPosition(c.position));if(inj.penalty>=.25)applyAttr(c.attributes,a,-1);c.overall=calculateOverall(c.position,c.attributes);text=`A volta antecipada cobra o preço: a lesão recidiva e você perde mais ${extra} jogo(s).`;}else{p.effects.developmentPenalty=Math.max(p.effects.developmentPenalty,inj.penalty*.45);p.effects.formDelta+=1;text=`A aposta funciona e você retorna após ${base} jogo(s) fora, sem nova lesão.`;}break; }
      case "match": { const val=attrValue(c.attributes,ch.attribute),chance=clamp(.16+val*.0073+(c.form-50)*.002+((c.morale||50)-50)*.0012-(e.kind==="derby"?.025:0),.24,.88),success=nextRandom(c)<chance; const offensive=["shooting","passing","dribbling"].includes(ch.attribute); let contribution="";
        if(success){const big=e.kind==="derby"||e.kind==="continental";p.effects.ratingBonus+=big?.06:.035;p.effects.reputationDelta+=e.kind==="continental"?3:e.kind==="derby"?2:1;p.effects.fanAffinityDelta+=big?2:0;p.effects.formDelta+=2;if(ch.attribute==="shooting"){p.effects.goals++;contribution="Você finaliza e marca.";}else if(ch.attribute==="passing"){p.effects.assists++;contribution=c.position==="GOL"?"A reposição inicia a jogada do gol.":"Seu passe deixa o companheiro em condições de marcar.";}else if(ch.attribute==="dribbling"){if(nextRandom(c)<.48){p.effects.goals++;contribution="Você vence no drible e marca.";}else{p.effects.assists++;contribution="Você elimina o marcador e cria o gol.";}}else if(ch.attribute==="tackling"){p.effects.tackles+=3;contribution="Você antecipa e corta a jogada decisiva.";}else contribution="Você faz uma grande defesa.";
        } else {p.effects.ratingBonus-=(e.kind==="derby"||e.kind==="continental")?.025:.015;p.effects.formDelta-=1;contribution="A tentativa não funciona.";}
        const score=resultScore(c,e,success,offensive),[sa,sb]=score.split("–").map(Number); const outcome=sa>sb?"Seu time vence.":sa===sb?"A partida termina empatada.":"Seu time é derrotado."; text=`${contribution} Placar final: ${score}. ${outcome}`; break; }
    }
    e.resolved=true;e.resultText=text;return text;
  }
  function advanceEvent(c){ if(!c.pendingSeason)return; const e=c.pendingSeason.events[c.pendingSeason.currentEvent]; if(!e?.resolved)return; c.pendingSeason.currentEvent++; }

  function minutesForRole(c,role,club){ const ranges={Estrela:[.92,.98,.90],Importante:[.82,.94,.82],Titular:[.72,.90,.75],Rotação:[.45,.72,.48],Reserva:[.20,.48,.25]}; const [glo,ghi,share]=ranges[role]; const games=Math.round(club.leagueGames*rand(c,glo,ghi)+Math.min(12,club.prestige/12)); const minutes=Math.round(games*90*share*rand(c,.94,1.04)); const starts=Math.min(games,Math.round(minutes/90*rand(c,.82,1.03))); return {games,starts,minutes}; }
  function applyAvailability(gm,missed){ if(!missed)return gm; const games=Math.max(0,gm.games-missed),ratio=gm.games?games/gm.games:0;return{games,starts:Math.min(games,Math.round(gm.starts*ratio)),minutes:Math.round(gm.minutes*ratio)}; }

  function simulateFieldStats(c,player,club,effects){
    const role=determineRole(player.overall,club,player.lastRating,player.coachTrust,player.age); let prelim=applyAvailability(minutesForRole(c,role,club),effects?.gamesMissed||0);
    const cardBase={ATA:.7,PE:.8,PD:.8,MEI:1,MC:2.2,VOL:4.1,LE:3,LD:3,ZAG:3.5};
    const yellowCards=Math.max(0,Math.round(cardBase[player.position]*(prelim.games/38)*rand(c,.72,1.30)*(1-(player.attributes.tackling-55)*.003))),redCards=nextRandom(c)<clamp(yellowCards*.016,0,.12)?1:0;
    const suspensionGames=Math.floor(yellowCards/club.yellowThreshold)+redCards; const gm=applyAvailability(prelim,suspensionGames),per90=gm.minutes/90;
    const offense=clamp(.82+(club.strength-58)*.0105,.78,1.25),defLoad=clamp(1.20-(club.strength-58)*.008,.72,1.20),formFactor=1+(player.form-50)*.0012+((player.morale||50)-50)*.0008;
    const shootSkill=(player.attributes.shooting*.76+player.attributes.dribbling*.24)/70,passSkill=(player.attributes.passing*.76+player.attributes.dribbling*.24)/70,tackleSkill=player.attributes.tackling/65;
    const goals=Math.max(0,Math.round(POSITION_GOAL_RATE[player.position]*per90*Math.pow(shootSkill,1.15)*offense*formFactor*rand(c,.91,1.09)))+(effects?.goals||0);
    const assists=Math.max(0,Math.round(POSITION_ASSIST_RATE[player.position]*per90*Math.pow(passSkill,1.10)*offense*formFactor*rand(c,.90,1.10)))+(effects?.assists||0);
    const tackles=Math.max(0,Math.round(POSITION_TACKLE_RATE[player.position]*per90*Math.pow(tackleSkill,1.02)*defLoad*rand(c,.94,1.06)))+(effects?.tackles||0);
    const csRate=clamp(.16+(club.strength-55)*.008+(player.attributes.tackling-55)*.0012,.12,.52),cleanSheets=Math.min(gm.games,Math.round(gm.games*csRate*rand(c,.90,1.08)));
    const quality=5.72+player.overall*.020,context=club.strength<68?(68-club.strength)*.004:0,output=(goals*Math.max(.02,POSITION_GOAL_RATE[player.position])+assists*.08+tackles*.003)/Math.max(1,per90);
    const rating=round2(clamp(quality+context+(player.form-50)*.004+((player.morale||50)-50)*.002+rand(c,-.15,.15)+(effects?.ratingBonus||0)+output*.04,5.8,8.55));
    return{role,...gm,goals,assists,tackles,cleanSheets,yellowCards,redCards,suspensionGames,rating};
  }
  function simulateGoalkeeperStats(c,player,club,effects){
    const role=determineRole(player.overall,club,player.lastRating,player.coachTrust,player.age); let prelim=applyAvailability(minutesForRole(c,role,club),effects?.gamesMissed||0);
    const yellowCards=nextRandom(c)<.30?randInt(c,1,3):0,redCards=nextRandom(c)<.025?1:0,suspensionGames=Math.floor(yellowCards/club.yellowThreshold)+redCards; const gm=applyAvailability(prelim,suspensionGames),per90=gm.minutes/90;
    const shotsPer90=clamp(4.7-(club.strength-58)*.035,3.1,4.8),shots=Math.round(shotsPer90*per90),savePct=clamp(.62+((player.attributes.goalkeeping||60)-60)*.0038+(player.form-50)*.001+rand(c,-.018,.018),.57,.84),saves=Math.round(shots*savePct),goalsConceded=Math.max(0,shots-saves),lambda=goalsConceded/Math.max(1,gm.games),csRate=clamp(Math.exp(-lambda)*.72,.10,.55),cleanSheets=Math.min(gm.games,Math.round(gm.games*csRate*rand(c,.90,1.08))),penaltiesSaved=Math.max(0,Math.round((player.attributes.goalkeeping||60)/100*rand(c,0,3))),assists=Math.max(0,Math.round(POSITION_ASSIST_RATE.GOL*per90*(player.attributes.passing/65)*rand(c,.7,1.3)))+(effects?.assists||0),rating=round2(clamp(5.72+player.overall*.020+(savePct-.68)*2.1+(player.form-50)*.004+((player.morale||50)-50)*.002+rand(c,-.15,.15)+(effects?.ratingBonus||0),5.8,8.55));
    return{role,...gm,goals:0,assists,tackles:0,cleanSheets,yellowCards,redCards,suspensionGames,saves,savePct:round1(savePct*100),goalsConceded,penaltiesSaved,rating};
  }

  function expectedLeaguePosition(club){
    if(club.division==="3ª divisão")return 11-(club.strength-58)*1.0;
    if(club.division==="2ª divisão")return 11-(club.strength-60)*1.1;
    if(club.country==="Portugal")return 9-(club.strength-76)*.7;
    return 11-(club.strength-76)*.55;
  }
  function leaguePosition(c,club,playerRating=6.9){const spread=club.division==="1ª divisão"?3.2:5.8,impact=clamp((playerRating-6.9)*1.6,-1.5,2.2);return clamp(Math.round(expectedLeaguePosition(club)+rand(c,-spread,spread)-impact),1,club.leagueSize);}
  function teamSeasonStats(c,club,pos){ const games=club.leagueGames, rankFactor=(club.leagueSize-pos)/(club.leagueSize-1), pointsPerGame=clamp(.90+rankFactor*1.35+rand(c,-.08,.08),.65,2.45),points=Math.round(pointsPerGame*games); let wins=clamp(Math.round((points-games*.75)/2.15),0,games),draws=clamp(points-wins*3,0,games-wins),losses=Math.max(0,games-wins-draws); while(wins+draws+losses>games&&draws>0){draws--;losses++;} const gf=Math.max(10,Math.round(games*(.82+rankFactor*.95+rand(c,-.08,.08)))),ga=Math.max(8,Math.round(games*(1.45-rankFactor*.85+rand(c,-.08,.08)))); return{games,wins,draws,losses,points,goalsFor:gf,goalsAgainst:ga}; }
  function updateLeagueMovement(c,club,pos){
    c.clubLeagueState=c.clubLeagueState||Object.fromEntries(CLUBS.map(x=>[x.id,x.leagueKey]));const key=c.clubLeagueState[club.id]||club.leagueKey,league=LEAGUES[key];let next=null,type=null;
    if(LEAGUE_UP[key]&&pos<=((league.country==="Brasil")?4:3)){next=LEAGUE_UP[key];type="promotion";}
    else if(LEAGUE_DOWN[key]&&pos>=league.leagueSize-((league.country==="Brasil")?3:2)){next=LEAGUE_DOWN[key];type="relegation";}
    if(!next)return null;c.clubLeagueState[club.id]=next;return{type,from:league.leagueName,to:LEAGUES[next].leagueName};
  }

  function titlesFor(c,club,pos,competitions,seasonIndex){
    const out=[];if(pos===1)out.push(club.leagueName);
    let cup=.008+Math.max(0,club.strength-60)*.004;if(club.strength<65)cup*=.45;if(seasonIndex===0&&club.strength<70)cup*=.55;if(nextRandom(c)<clamp(cup,.002,.18))out.push(club.cupName);
    if(competitions.includes("Copa Libertadores")&&nextRandom(c)<clamp(.018+(club.strength-80)*.009,.01,.18))out.push("Copa Libertadores");
    if(competitions.includes("Copa Sul-Americana")&&nextRandom(c)<clamp(.025+(club.strength-74)*.009,.015,.20))out.push("Copa Sul-Americana");
    if(competitions.includes("UEFA Champions League")&&nextRandom(c)<clamp(.015+(club.strength-84)*.012,.01,.19))out.push("UEFA Champions League");
    if(competitions.includes("UEFA Europa League")&&nextRandom(c)<clamp(.025+(club.strength-80)*.010,.015,.20))out.push("UEFA Europa League");
    if(competitions.includes("UEFA Conference League")&&nextRandom(c)<clamp(.035+(club.strength-76)*.010,.02,.22))out.push("UEFA Conference League");
    if(competitions.includes("AFC Champions League Elite")&&nextRandom(c)<clamp(.04+(club.strength-80)*.012,.025,.24))out.push("AFC Champions League Elite");
    if(competitions.includes("Mundial de Clubes FIFA")&&nextRandom(c)<clamp(.02+(club.strength-84)*.010,.015,.15))out.push("Mundial de Clubes FIFA");
    return out;
  }
  function awardsFor(c,p,stats,club,titles){ const out=[],tg=randInt(c,20,31),ta=randInt(c,11,18); if(stats.goals>=tg)out.push("Artilheiro");if(stats.assists>=ta)out.push("Líder de assistências");if(p.position==="GOL"&&stats.rating>=7.45)out.push("Goleiro do ano");if(stats.rating>=7.42)out.push("Time do campeonato");if(stats.rating>=7.72)out.push("Jogador do campeonato");if(stats.rating>=7.92&&club.prestige>=82&&(titles.length||p.reputation>=82))out.push("Bola de Ouro");return out; }

  function applyDevelopment(c,p,rating,minutes,penalty=0){
    const before={...p.attributes},beforeOvr=p.overall,gap=Math.max(0,p.potential-p.overall),age=p.age,attrs=attrsForPosition(p.position);
    if(age<=29&&gap>0){const rate=age<=18?.12:age<=20?.10:age<=22?.08:age<=24?.06:age<=26?.04:.022,perf=clamp(.72+(rating-6.6)*.24,.68,1.18),play=clamp(minutes/2600,.35,1.06),target=clamp(gap*rate*perf*play*(1-clamp(penalty,0,.65)),.05,4); const weights=attrs.map(a=>(GROWTH_WEIGHTS[p.position][a]||.5)*(p.developmentBias?.[a]||1)); let guard=0;while(calculateOverall(p.position,p.attributes)<Math.min(p.potential,beforeOvr+target)&&guard++<80){const a=weightedPick(c,attrs,weights);if(p.attributes[a]<99)applyAttr(p.attributes,a,1);}}
    else if(age>=30){let pts=Math.max(0,Math.round((age<=31?.35:age<=33?.65:age<=35?1:1.45)+rand(c,-.35,.55)));while(pts-->0){const a=pick(c,attrs);if(p.attributes[a]>30)applyAttr(p.attributes,a,-1);}}
    p.overall=calculateOverall(p.position,p.attributes);const txt=[];attrs.forEach(a=>{const d=p.attributes[a]-before[a];if(d)txt.push(`${ATTRIBUTE_LABELS[a]} ${d>0?"+":""}${d}`);});if(!txt.length)txt.push(penalty>.2?"A temporada interrompida limitou a evolução":"Sem alteração relevante de atributos");return txt;
  }

  function reputationAfter(r,rating,titles,awards,effects){let d=(rating-6.8)*2+titles.length*2+awards.length*1.8+(effects?.reputationDelta||0);if(rating<6.5)d-=1.5;return clamp(Math.round(r+d),0,100);}
  function coachTrustAfter(c,rating,titles,effects){return clamp(Math.round((c.coachTrust||50)+(rating-6.9)*10+titles.length*1.5+(effects?.coachTrustDelta||0)+rand(c,-2,2)),15,90);}

  function meaningfulOfferSalary(c,current,target,role){const raw=salaryFor(c,target,role),cur=Math.max(6000,c.salaryMonthlyBRL||raw);if(Math.abs(target.strength-current.strength)<=3)return Math.round(clamp(raw,cur*.90,cur*1.32)/1000)*1000;return Math.round(clamp(raw,cur*.90,cur*2.3)/1000)*1000;}
  function possibleOffers(c,stats){
    if(c.loanParentClubId)return[];
    if(stats.rating<6.85&&c.age<23&&!c.transferListed)return[];const current=clubWithCareer(c,c.clubId),amb=(stats.rating-6.8)*11+(c.overall-current.strength+4)*.45+(c.potential-c.overall)*.15+c.reputation*.06+(c.transferListed?6:0);
    if(amb<3||nextRandom(c)>clamp(.13+amb*.023+(c.transferListed?.18:0),.16,.78))return[];
    const candidates=allClubsForCareer(c).filter(x=>x.id!==current.id&&x.strength<=c.overall+14&&x.strength>=current.strength-(c.transferListed?7:1)).map(x=>{const role=determineRole(c.overall,x,stats.rating,50,c.age),salary=meaningfulOfferSalary(c,current,x,role),countryBonus=x.country!==current.country?2:0,step=(x.strength-current.strength)+(x.prestige-current.prestige)*.28+({Reserva:0,Rotação:1,Titular:3,Importante:5,Estrela:7}[role]||0)+countryBonus;return{x,role,salary,step};}).filter(o=>o.step>=1||o.salary>c.salaryMonthlyBRL*1.10).sort((a,b)=>b.step-a.step);
    const picked=[];for(const o of candidates.slice(0,12)){if(picked.length>=3)break;if(!picked.some(p=>p.x.country===o.x.country)||picked.length>=2) picked.push(o);}return picked.map(o=>({clubId:o.x.id,clubName:o.x.name,strength:o.x.strength,prestige:o.x.prestige,projectedRole:o.role,salaryMonthlyBRL:o.salary,reason:o.x.strength>current.strength+3?"Um clube de patamar superior acompanha sua evolução.":o.x.country!==current.country?"A proposta abre uma nova liga e um mercado diferente.":"A proposta combina espaço esportivo e valorização salarial."}));
  }
  function possibleLoanOffer(c,stats){
    const current=clubWithCareer(c,c.clubId);if(c.loanParentClubId||c.contractYearsLeft<=1||c.age>22||!["Reserva","Rotação"].includes(stats.nextRole)||(!c.loanInterest&&nextRandom(c)>.38))return null;
    const candidates=allClubsForCareer(c).filter(x=>x.id!==current.id&&x.strength>=Math.max(58,c.overall-4)&&x.strength<=c.overall+5&&determineRole(c.overall,x,stats.rating,55,c.age)!=="Reserva").sort((a,b)=>Math.abs(a.strength-c.overall)-Math.abs(b.strength-c.overall));if(!candidates.length)return null;const target=pick(c,candidates.slice(0,8)),role=determineRole(c.overall,target,stats.rating,55,c.age);return{clubId:target.id,clubName:target.name,projectedRole:role,text:`${target.name} quer você por uma temporada. A ideia é oferecer mais minutos sem romper seu contrato atual.`};
  }
  function freeAgentOffers(c,stats){
    const current=clubWithCareer(c,c.clubId),score=c.overall+(stats?.rating-6.8||0)*5+c.reputation*.08,candidates=allClubsForCareer(c).filter(x=>x.id!==current.id&&x.strength<=score+12&&x.strength>=Math.max(58,score-14)).map(x=>{const role=determineRole(c.overall,x,c.lastRating,50,c.age),salary=salaryFor(c,x,role);return{clubId:x.id,clubName:x.name,projectedRole:role,salaryMonthlyBRL:salary,fit:Math.abs(x.strength-(c.overall+4))+rand(c,0,6)};}).sort((a,b)=>a.fit-b.fit),chosen=[];candidates.forEach(x=>{if(chosen.length<4&&!chosen.some(y=>y.clubId===x.clubId))chosen.push(x);});return chosen;
  }
  function earlyRenewalOffer(c,stats,club){if(c.loanParentClubId||c.contractYearsLeft!==1||stats.rating<6.85||c.transferListed)return null;const role=stats.nextRole,salary=Math.round(clamp(salaryFor(c,club,role),c.salaryMonthlyBRL*1.04,c.salaryMonthlyBRL*(stats.rating>=7.4?1.42:1.25))/1000)*1000;return{clubId:club.id,clubName:club.name,salaryMonthlyBRL:salary,years:Math.max(2,Math.min(stats.rating>=7.35?4:3,41-c.age)),projectedRole:role};}

  function milestoneCheck(c,stats){
    const t=careerTotals(c.history),seen=new Set(c.milestones||[]),found=[],add=(key,text)=>{if(!seen.has(key)){seen.add(key);found.push(text);}};
    if(t.games>=100)add("games100","100 jogos na carreira");if(t.games>=250)add("games250","250 jogos na carreira");if(t.games>=500)add("games500","500 jogos na carreira");
    if(t.goals>=50)add("goals50","50 gols na carreira");if(t.goals>=100)add("goals100","100 gols na carreira");if(t.goals>=200)add("goals200","200 gols na carreira");
    const l=currentClubLegacy(c,stats.clubId);if(l.seasons>=5)add(`club5-${stats.clubId}`,`5 temporadas pelo ${stats.clubName}`);if(l.seasons>=10)add(`club10-${stats.clubId}`,`10 temporadas pelo ${stats.clubName}`);
    if((stats.titles||[]).some(x=>["Copa Libertadores","UEFA Champions League","AFC Champions League Elite"].includes(x)))add("continental-title","Primeiro grande título continental");if((stats.titles||[]).includes("Mundial de Clubes FIFA"))add("club-world","Campeão mundial de clubes");
    c.milestones=[...seen];return found;
  }

  function seasonVerdict(s){if(s.rating>=7.75)return{tone:"elite",title:"Temporada extraordinária",text:"Você foi um dos grandes nomes da temporada e elevou seu patamar."};if(s.rating>=7.35)return{tone:"great",title:"Excelente temporada",text:"Regularidade e impacto colocaram seu nome entre os destaques."};if(s.rating>=7)return{tone:"good",title:"Boa temporada",text:"Você cumpriu bem seu papel e saiu valorizado."};if(s.rating>=6.65)return{tone:"neutral",title:"Temporada regular",text:"Houve bons momentos, mas ainda existe espaço claro para crescer."};return{tone:"bad",title:"Temporada abaixo do esperado",text:"Seu espaço no elenco fica sob pressão."};}
  function clubPerformanceVerdict(s){if(s.titles.length)return{tone:"elite",title:"Temporada campeã",text:`${s.clubName} termina o ano com ${s.titles.length} título(s).`};if(s.leaguePosition<=3)return{tone:"great",title:"Grande temporada do clube",text:`${s.clubName} termina ${s.leagueName} na ${s.leaguePosition}ª posição.`};if(s.leaguePosition<=Math.ceil(s.leagueSize*.45))return{tone:"good",title:"Ano positivo do clube",text:"A equipe cumpre uma campanha competitiva."};if(s.leaguePosition>=s.leagueSize-3)return{tone:"bad",title:"Ano difícil para o clube",text:"A equipe passa a temporada próxima da parte inferior da tabela."};return{tone:"neutral",title:"Campanha intermediária",text:"O clube termina o ano sem grandes extremos."};}

  function clubDecision(c,stats,club){const trust=c.coachTrust||50;if(c.age>=19&&stats.rating<6.35&&["Reserva","Rotação"].includes(stats.role)&&trust<34)return{type:"release",title:"Fim de ciclo",text:`${club.name} decidiu não contar com você para o próximo ano.`};if(stats.rating<6.55&&trust<42)return{type:"warning",title:"Pressão por resultados",text:"Seu espaço já não é garantido."};if(stats.rating>=7.45)return{type:"praise",title:"Moral em alta",text:"A comissão considera você peça importante para a próxima temporada."};return{type:"stable",title:"Situação estável",text:"Você segue nos planos do clube."};}

  function simulateNpcSeason(c,rival,label){
    const oldClubId=rival.clubId,club=clubWithCareer(c,rival.clubId),start=rival.overall,raw=rival.position==="GOL"?simulateGoalkeeperStats(c,rival,club,{}):simulateFieldStats(c,rival,club,{}),pos=leaguePosition(c,club,raw.rating),comps=competitionsFor({history:rival.history,seasonIndex:c.seasonIndex,clubLeagueState:c.clubLeagueState},club,START_YEAR+c.seasonIndex),titles=titlesFor(c,club,pos,comps,c.seasonIndex),awards=awardsFor(c,rival,raw,club,titles);
    rival.reputation=reputationAfter(rival.reputation,raw.rating,titles,awards,{});rival.form=clamp(Math.round(rival.form+(raw.rating-6.9)*4+rand(c,-2,2)),35,75);rival.lastRating=raw.rating;applyDevelopment(c,rival,raw.rating,raw.minutes,0);rival.age++;
    if(raw.rating>=7.2&&nextRandom(c)<.38){const better=allClubsForCareer(c).filter(x=>x.strength>club.strength+1&&x.strength<=rival.overall+14);if(better.length)rival.clubId=pick(c,better.slice(0,12)).id;}
    const s={...raw,yearLabel:label,age:rival.age-1,clubId:club.id,clubName:club.name,overallStart:start,overallEnd:rival.overall,leaguePosition:pos,titles,awards,competitions:comps};rival.history.push(s);
    let news="";if(rival.clubId!==oldClubId)news=`${rival.name} deixa ${club.name} e acerta com ${clubWithCareer(c,rival.clubId).name}.`;else if(awards.includes("Bola de Ouro"))news=`${rival.name} conquista a Bola de Ouro.`;else if(titles.some(x=>["Copa Libertadores","UEFA Champions League","Mundial de Clubes FIFA"].includes(x)))news=`${rival.name} termina o ano celebrando ${titles.find(x=>["Copa Libertadores","UEFA Champions League","Mundial de Clubes FIFA"].includes(x))}.`;else if(raw.rating>=7.65)news=`${rival.name} vive uma das melhores temporadas da carreira.`;s.news=news;return s;
  }

  function finalizeSeason(c){
    const p=c.pendingSeason;if(!p||p.currentEvent<p.events.length)throw new Error("Temporada ainda não concluída");const club=clubWithCareer(c,p.clubIdAtStart),raw=c.position==="GOL"?simulateGoalkeeperStats(c,c,club,p.effects):simulateFieldStats(c,c,club,p.effects),pos=leaguePosition(c,club,raw.rating),team=teamSeasonStats(c,club,pos),titles=titlesFor(c,club,pos,p.competitions,c.seasonIndex),awards=awardsFor(c,c,raw,club,titles);
    c.reputation=reputationAfter(c.reputation,raw.rating,titles,awards,p.effects);c.form=clamp(Math.round(c.form+(raw.rating-6.9)*5+p.effects.formDelta+rand(c,-2,2)),30,80);c.morale=clamp(Math.round((c.morale||50)+p.effects.moraleDelta+(raw.rating-6.9)*2+rand(c,-2,2)),20,88);c.coachTrust=coachTrustAfter(c,raw.rating,titles,p.effects);c.lastRating=raw.rating;c.careerEarningsBRL+=(p.salaryAtStart||c.salaryMonthlyBRL||0)*12+(p.effects.extraIncomeBRL||0);c.sponsorshipEarningsBRL+=(p.effects.extraIncomeBRL||0);c.contractYearsLeft=Math.max(0,(c.contractYearsLeft||1)-1);
    const developmentText=applyDevelopment(c,c,raw.rating,raw.minutes,p.effects.developmentPenalty||0),nextRole=determineRole(c.overall,club,raw.rating,c.coachTrust,c.age),stats={...raw,yearLabel:p.yearLabel,age:c.age,clubId:club.id,clubName:club.name,leagueName:club.leagueName,leagueSize:club.leagueSize,overallStart:p.overallStart,overallEnd:c.overall,reputationStart:p.reputationStart,reputationEnd:c.reputation,leaguePosition:pos,competitions:p.competitions,titles,awards,roleAtStart:p.roleAtStart,nextRole,salaryMonthlyBRL:p.salaryAtStart||c.salaryMonthlyBRL,gamesMissedOther:p.effects.gamesMissed||0,team};c.history.push(stats);
    const legacy=updateClubLegacy(c,stats,p.effects),captain=maybeCaptain(c,stats,club),movement=updateLeagueMovement(c,club,pos),milestones=milestoneCheck(c,stats),rival=simulateNpcSeason(c,c.rival,p.yearLabel),decision=clubDecision(c,stats,club),verdict=seasonVerdict(stats),clubVerdict=clubPerformanceVerdict(stats);c.age++;c.seasonIndex++;
    let contractExpired=c.contractYearsLeft<=0,renewalOffer=null,faOffers=[];if(decision.type==="release"){contractExpired=true;c.contractYearsLeft=0;}
    if(contractExpired&&!c.retired){if(decision.type!=="release"&&raw.rating>=6.25){const salary=Math.round(clamp(salaryFor(c,club,nextRole),c.salaryMonthlyBRL*.92,c.salaryMonthlyBRL*(raw.rating>=7.35?1.45:1.22))/1000)*1000;renewalOffer={clubId:club.id,clubName:club.name,salaryMonthlyBRL:salary,years:Math.max(1,Math.min(raw.rating>=7.35?4:3,41-c.age)),projectedRole:nextRole};}faOffers=freeAgentOffers(c,stats);}
    const transferOffers=contractExpired?[]:possibleOffers(c,stats),loanOffer=contractExpired?null:possibleLoanOffer(c,stats),earlyRenewal=contractExpired?null:earlyRenewalOffer(c,stats,club);c.pendingOffers=transferOffers;c.pendingOffer=transferOffers[0]||null;
    const summary={player:stats,rival,verdict,clubVerdict,clubDecision:decision,developmentText,transferOffers,loanOffer,earlyRenewal,contractExpired,renewalOffer,freeAgentOffers:faOffers,leagueMovement:movement,legacy:{...legacy,label:legacyLabel(legacy)},captain,milestones};c.lastSummary=summary;c.pendingSeason=null;c.transferListed=false;c.loanInterest=false;c.earlyRenewalInterest=false;if(c.loanParentClubId)c.loanReturnPending=true;if(c.age>=41)retireCareer(c,true);return summary;
  }

  function signContract(c,clubId,salary,years,role){c.clubId=clubId;c.salaryMonthlyBRL=salary;c.contractYearsLeft=Math.max(1,Math.min(years,41-c.age));c.coachTrust=role==="Reserva"?43:50;c.freeAgent=false;c.pendingOffer=null;c.pendingOffers=[];c.lastSummary=null;c.transferListed=false;currentClubLegacy(c,clubId);c.careerLog.push({type:"contract",year:START_YEAR+c.seasonIndex,text:`Contrato com ${clubWithCareer(c,clubId).name}.`});}
  function acceptTransfer(c,clubId){const o=(c.pendingOffers||[]).find(x=>x.clubId===clubId)||c.pendingOffer;if(!o)return;signContract(c,o.clubId,o.salaryMonthlyBRL,c.age<=22?5:4,o.projectedRole);c.reputation=clamp(c.reputation+2,0,100);c.morale=clamp(c.morale+4,0,100);}
  function declineTransfers(c){c.pendingOffers=[];c.pendingOffer=null;if(c.lastSummary)c.lastSummary.transferOffers=[];}
  function acceptRenewal(c){const o=c.lastSummary?.renewalOffer;if(!o)return;signContract(c,o.clubId,o.salaryMonthlyBRL,o.years,o.projectedRole);}
  function acceptEarlyRenewal(c){const o=c.lastSummary?.earlyRenewal;if(!o)return;c.salaryMonthlyBRL=o.salaryMonthlyBRL;c.contractYearsLeft=o.years;c.lastSummary.earlyRenewal=null;saveCareer(c);}
  function declineEarlyRenewal(c){if(c.lastSummary)c.lastSummary.earlyRenewal=null;}
  function declineLoan(c){if(c.lastSummary)c.lastSummary.loanOffer=null;}
  function acceptLoan(c){const o=c.lastSummary?.loanOffer;if(!o)return;c.loanParentClubId=c.clubId;c.loanParentSalaryBRL=c.salaryMonthlyBRL;c.loanReturnSeasonIndex=c.seasonIndex+1;c.clubId=o.clubId;c.coachTrust=55;c.lastSummary=null;c.careerLog.push({type:"loan",year:START_YEAR+c.seasonIndex,text:`Empréstimo para ${clubWithCareer(c,o.clubId).name}.`});}
  function advanceAfterSummary(c){if(c.loanReturnPending&&c.loanParentClubId&&c.seasonIndex>=c.loanReturnSeasonIndex){const parent=c.loanParentClubId;c.clubId=parent;c.salaryMonthlyBRL=c.loanParentSalaryBRL||c.salaryMonthlyBRL;c.loanParentClubId=null;c.loanParentSalaryBRL=null;c.loanReturnSeasonIndex=null;c.loanReturnPending=false;c.coachTrust=50;c.careerLog.push({type:"loan-return",year:START_YEAR+c.seasonIndex,text:`Retorno de empréstimo ao ${clubWithCareer(c,parent).name}.`});}c.lastSummary=null;}
  function enterFreeAgency(c){const s=c.lastSummary;if(!s)return;c.freeAgent=true;c.contractYearsLeft=0;c.pendingFreeAgentOffers=s.freeAgentOffers?.length?s.freeAgentOffers:freeAgentOffers(c,s.player);c.lastSummary=null;}
  function chooseFreeAgent(c,clubId){const o=(c.pendingFreeAgentOffers||[]).find(x=>x.clubId===clubId);if(!o)return;signContract(c,o.clubId,o.salaryMonthlyBRL,c.age<=24?4:3,o.projectedRole);c.pendingFreeAgentOffers=[];}
  function requestTransfer(c){if(c.contractYearsLeft<=0)return;c.transferListed=true;c.coachTrust=clamp(c.coachTrust-5,15,90);c.morale=clamp(c.morale-1,20,88);saveCareer(c);}

  function retireCareer(c,forced=false){c.retired=true;c.forcedRetirement=forced;c.pendingSeason=null;c.lastSummary=null;c.pendingOffer=null;c.freeAgent=false;c.contractYearsLeft=0;saveCareer(c);}

  function saveCareer(c){localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}
  function loadCareer(){try{const r=localStorage.getItem(STORAGE_KEY);return r?JSON.parse(r):null;}catch{return null;}}
  function clearCareer(){localStorage.removeItem(STORAGE_KEY);}

  function migrateCareer(c){
    if(!c)return c;if(c.version===VERSION)return c;
    c.version=VERSION;c.currencyPreference=c.currencyPreference||"BRL";c.careerEarningsBRL=c.careerEarningsBRL??Math.round((c.careerEarningsEUR||0)*6.2);c.sponsorshipEarningsBRL=c.sponsorshipEarningsBRL||0;c.salaryMonthlyBRL=c.salaryMonthlyBRL??Math.round((c.salaryAnnualEUR||12000)*6.2/12);delete c.salaryAnnualEUR;delete c.careerEarningsEUR;
    c.allocation=c.allocation||Object.fromEntries(attrsForPosition(c.position).map(a=>[a,Math.max(0,(c.attributes?.[a]||35)-35)]));c.developmentBias=c.developmentBias||developmentBiasFromAllocation(c.position,c.allocation);c.retired=!!c.retired;c.freeAgent=!!c.freeAgent;c.introStage=c.introStage||"complete";c.morale=c.morale??50;c.coachTrust=c.coachTrust??50;c.lastRating=c.lastRating??6.9;c.lastEventKeys=[];c.pendingSeason=null;c.lastSummary=null;c.pendingOffer=null;c.pendingOffers=[];
    c.clubLeagueState=c.clubLeagueState||Object.fromEntries(CLUBS.map(x=>[x.id,x.leagueKey]));CLUBS.forEach(x=>{if(!c.clubLeagueState[x.id])c.clubLeagueState[x.id]=x.leagueKey;});c.memories=c.memories||{};c.clubLegacy=c.clubLegacy||{};c.milestones=c.milestones||[];c.transferListed=!!c.transferListed;c.loanInterest=false;c.earlyRenewalInterest=false;c.captainClubId=c.captainClubId||null;
    if(c.rival){c.rival.developmentBias=c.rival.developmentBias||{};c.rival.morale=c.rival.morale??50;c.rival.coachTrust=c.rival.coachTrust??50;c.rival.history=c.rival.history||[];}
    return c;
  }

  function currencySymbol(code){return code==="USD"?"US$":code==="EUR"?"€":"R$";}
  function convertedBRL(v,code){return code==="USD"?v/5.4:code==="EUR"?v/6.2:v;}
  function formatMoney(v,code="BRL"){const n=convertedBRL(Number(v||0),code),s=currencySymbol(code);if(n>=1000000)return`${s} ${(n/1000000).toFixed(n>=10000000?1:2)} mi`;if(n>=1000)return`${s} ${Math.round(n/1000)} mil`;return`${s} ${Math.round(n)}`;}

  const $=s=>document.querySelector(s), app=()=>$("#app");
  function brand(){return`<div class="brand">⚽ <strong>FutLife</strong><span>V${VERSION}</span></div>`;}
  function metric(l,v){return`<div class="metric"><span>${l}</span><strong>${v}</strong></div>`;}
  function positionOptions(){return Object.keys(POSITION_LABELS).map(p=>`<option value="${p}">${p} — ${POSITION_LABELS[p]}</option>`).join("");}
  function formLabel(v){return v>=65?"Excelente":v>=56?"Boa":v>=45?"Regular":"Baixa";}
  function moraleLabel(v){return v>=70?"Muito alta":v>=56?"Alta":v>=42?"Estável":v>=30?"Baixa":"Muito baixa";}
  function reputationLabel(v){return v>=90?"Ícone mundial":v>=75?"Estrela":v>=55?"Muito conhecido":v>=35?"Em ascensão":v>=18?"Promessa":"Início de carreira";}

  function playerHeader(minimal=false){if(!career)return"";const club=clubWithCareer(career,career.clubId),pos=career.secondaryPosition?`${career.position} / ${career.secondaryPosition}`:career.position;return`<header class="player-head ${minimal?"minimal":""}"><div><span class="eyebrow">${pos} · ${career.age} anos</span><h1>${escapeHtml(career.name)}</h1>${minimal?"":`<p>${club.flag} ${club.name} · ${club.leagueName} (${club.division})</p>`}</div><div class="ovr"><span>OVR</span><strong>${career.overall}</strong></div></header>`;}
  function attributeCards(p){return`<div class="attributes">${attrsForPosition(p.position).map(a=>`<div class="attr"><span>${ATTRIBUTE_LABELS[a]}</span><strong>${p.attributes[a]}</strong></div>`).join("")}</div>`;}

  function renderCreate(){
    const initial=initialAllocation("ATA");
    app().innerHTML=`<div class="shell narrow">${brand()}<section class="hero"><span class="eyebrow">SUA HISTÓRIA COMEÇA AQUI</span><h1>Crie seu jogador</h1><p>Distribua os pontos entre os atributos. O peso de cada qualidade no OVR depende da posição escolhida — essa ponderação fica escondida.</p></section>
    <section class="card form-card"><label>Nome do jogador<input id="name" maxlength="24" value="Vinicius Linhares"></label><div class="grid2"><label>Posição<select id="position">${positionOptions()}</select></label><label>Moeda<select id="currency"><option value="BRL">Real (R$)</option><option value="USD">Dólar (US$)</option><option value="EUR">Euro (€)</option></select></label></div>
    <div class="allocation-head"><div><span>Pontos disponíveis</span><strong id="points-left">${initial.points}</strong></div><div><span>Overall inicial</span><strong id="preview-ovr">35</strong></div></div><div id="allocator"></div><button id="create" class="primary wide" disabled>Ir para a peneira</button></section><p class="footnote">Os pontos distribuídos também influenciam discretamente a evolução futura dos atributos.</p></div>`;
    let state={position:"ATA",...initial,attrs:{...initial.base},allocation:{shooting:0,passing:0,dribbling:0,tackling:0}};
    function resetAllocator(pos){const cfg=initialAllocation(pos);state={position:pos,...cfg,attrs:{...cfg.base},allocation:Object.fromEntries(attrsForPosition(pos).map(a=>[a,0]))};drawAllocator();}
    function drawAllocator(){const attrs=attrsForPosition(state.position),used=attrs.reduce((s,a)=>s+(state.allocation[a]||0),0),left=state.points-used;$("#points-left").textContent=left;$("#preview-ovr").textContent=calculateOverall(state.position,state.attrs);$("#allocator").innerHTML=`<div class="allocation-list">${attrs.map(a=>`<div class="allocation-row"><div><span>${ATTRIBUTE_LABELS[a]}</span><strong>${state.attrs[a]}</strong></div><div class="allocation-controls"><button data-a="${a}" data-d="-5">−5</button><button data-a="${a}" data-d="-1">−</button><button data-a="${a}" data-d="1">+</button><button data-a="${a}" data-d="5">+5</button></div></div>`).join("")}</div>`;document.querySelectorAll(".allocation-controls button").forEach(b=>b.onclick=()=>{const a=b.dataset.a,d=Number(b.dataset.d),cur=state.allocation[a]||0;if(d>0&&left<=0)return;const actual=d>0?Math.min(d,left,state.max-state.attrs[a]):Math.max(d,-cur);state.allocation[a]+=actual;state.attrs[a]+=actual;drawAllocator();});$("#create").disabled=left!==0;}
    $("#position").onchange=e=>resetAllocator(e.target.value);drawAllocator();
    $("#create").onclick=()=>{career=createCareer($("#name").value,state.position,state.attrs,state.allocation,$("#currency").value);saveCareer(career);render();};
  }

  function renderIntro(){
    if(career.introStage==="trial"){const s=career.trialScenario;app().innerHTML=`<div class="shell narrow">${brand()}${playerHeader(true)}<section class="story-card"><span class="story-kicker">16 ANOS · PENEIRA</span><h2>${s.title}</h2><p>${s.text}</p><div class="choices">${s.choices.map(x=>`<button class="choice trial-choice" data-id="${x.id}"><strong>${x.label}</strong></button>`).join("")}</div></section></div>`;document.querySelectorAll(".trial-choice").forEach(b=>b.onclick=()=>{resolveTrial(career,b.dataset.id);saveCareer(career);render();});return;}
    const offers=career.trialOffers||[];app().innerHTML=`<div class="shell narrow">${brand()}<section class="hero compact"><span class="eyebrow">RESULTADO DA PENEIRA</span><h1>Chegaram propostas</h1><p>${escapeHtml(career.trialResult)}</p></section><section class="card"><span class="eyebrow">ESCOLHA SEU PRIMEIRO CLUBE</span><div class="club-offers">${offers.map(o=>{const c=clubById(o.clubId);return`<button class="club-offer" data-club="${c.id}"><div><strong>${c.flag} ${c.name}</strong><span>${c.leagueName} · ${c.division}</span></div><div class="offer-meta"><small>${formatMoney(o.salaryMonthlyBRL,career.currencyPreference)}/mês</small><b>${o.projectedRole}</b></div></button>`;}).join("")}</div></section><p class="footnote">Um clube maior pode oferecer menos minutos; um clube menor pode acelerar sua entrada no time.</p></div>`;document.querySelectorAll(".club-offer").forEach(b=>b.onclick=()=>{chooseStartingClub(career,b.dataset.club);saveCareer(career);render();});
  }

  function careerTotals(h){return h.reduce((a,s)=>{a.games+=s.games||0;a.goals+=s.goals||0;a.assists+=s.assists||0;a.titles+=(s.titles||[]).length;a.awards+=(s.awards||[]).length;return a;},{games:0,goals:0,assists:0,titles:0,awards:0});}
  function currentRole(){return determineRole(career.overall,clubWithCareer(career,career.clubId),career.lastRating,career.coachTrust,career.age);}
  function renderCurrencySelector(){return`<label class="currency-mini">Moeda <select id="currency-pref"><option value="BRL" ${career.currencyPreference==="BRL"?"selected":""}>R$</option><option value="USD" ${career.currencyPreference==="USD"?"selected":""}>US$</option><option value="EUR" ${career.currencyPreference==="EUR"?"selected":""}>€</option></select></label>`;}

  function renderDashboard(){
    if(career.freeAgent)return renderFreeAgency();const club=clubWithCareer(career,career.clubId),role=currentRole(),tot=careerTotals(career.history),season=`${START_YEAR+career.seasonIndex}/${String((START_YEAR+career.seasonIndex+1)%100).padStart(2,"0")}`,lastR=career.rival.history?.at(-1),rclub=clubWithCareer(career,career.rival.clubId),comps=competitionsFor(career,club),legacy=currentClubLegacy(career,club.id),isCaptain=legacy.captain||career.captainClubId===club.id;
    app().innerHTML=`<div class="shell">${brand()}${renderCurrencySelector()}${playerHeader()}${attributeCards(career)}<div class="status-grid six"><div><span>Potencial</span><strong>${career.potentialHint}</strong></div><div><span>Status</span><strong>${role}${isCaptain?" · Capitão":""}</strong></div><div><span>Forma</span><strong>${formLabel(career.form)}</strong><small>${career.form}/100</small></div><div><span>Moral</span><strong>${moraleLabel(career.morale)}</strong><small>${career.morale}/100</small></div><div><span>Reputação</span><strong>${reputationLabel(career.reputation)}</strong><small>${career.reputation}/100</small></div><div><span>Salário</span><strong>${formatMoney(career.salaryMonthlyBRL,career.currencyPreference)}/mês</strong><small>${career.contractYearsLeft} ano(s) de contrato</small></div></div>
    <section class="card next-season"><div class="section-title"><div><span class="eyebrow">TEMPORADA ${season}</span><h2>${club.flag} ${club.name}</h2><p>${club.leagueName} · ${club.division}</p></div><span class="role-badge">${role}</span></div><div class="competition-tags">${comps.map(x=>`<span>${x}</span>`).join("")}</div><div class="objective"><span>Meta da temporada</span><strong>${seasonObjective(role)}</strong></div><button id="start" class="primary wide">Começar temporada</button></section>
    <div class="grid2"><section class="card"><span class="eyebrow">RELAÇÃO COM O CLUBE</span><h2>${legacyLabel(legacy)}</h2><div class="career-numbers">${metric("Temporadas",legacy.seasons||0)}${metric("Títulos",legacy.titles||0)}${metric("Torcida",`${legacy.fanAffinity||30}/100`)}${metric("Capitão",isCaptain?"Sim":"Não")}</div></section><section class="card"><span class="eyebrow">MERCADO</span><h2>${career.transferListed?"Transferência solicitada":"Situação contratual"}</h2><p>${career.transferListed?"Seu empresário já sabe que você aceita ouvir propostas.":"Você pode pedir uma saída antes do fim do contrato, mas isso pode afetar sua relação com a comissão."}</p>${career.contractYearsLeft>0&&!career.transferListed&&!career.loanParentClubId&&career.age>=18?`<button id="request-transfer">Pedir transferência</button>`:""}</section></div>
    <section class="card"><span class="eyebrow">SUA CARREIRA</span><div class="career-numbers">${metric("Temporadas",career.history.length)}${metric("Jogos",tot.games)}${metric("Gols",tot.goals)}${metric("Assistências",tot.assists)}${metric("Títulos",tot.titles)}${metric("Ganhos",formatMoney(career.careerEarningsBRL,career.currencyPreference))}</div></section>
    <section class="card rival"><span class="eyebrow">SEU RIVAL</span><h2>${escapeHtml(career.rival.name)}</h2><p>${rclub.flag} ${rclub.name} · ${career.rival.position}${career.rival.secondaryPosition?` / ${career.rival.secondaryPosition}`:""} · OVR ${career.rival.overall}</p>${lastR?`<div class="rival-snapshot">${metric("Última nota",lastR.rating.toFixed(2))}${metric("Gols",lastR.goals)}${metric("Assistências",lastR.assists)}${metric("Clube",lastR.clubName)}</div>${lastR.news?`<p class="rival-news">📰 ${escapeHtml(lastR.news)}</p>`:""}`:""}</section>${career.history.length?historyHtml(career.history):""}<div class="actions">${career.age>=35?`<button id="retire" class="ghost">Aposentar agora</button>`:""}<button id="reset" class="ghost danger">Apagar carreira e recomeçar</button></div></div>`;
    $("#start").onclick=()=>{startSeason(career);saveCareer(career);render();};$("#reset").onclick=()=>{if(confirm("Apagar esta carreira?")){clearCareer();career=null;render();}};if($("#request-transfer"))$("#request-transfer").onclick=()=>{if(confirm("Pedir ao empresário para buscar uma transferência? Isso pode reduzir a confiança da comissão.")){requestTransfer(career);render();}};if($("#retire"))$("#retire").onclick=()=>{if(confirm("Encerrar a carreira profissional?")){retireCareer(career,false);render();}};$("#currency-pref").onchange=e=>{career.currencyPreference=e.target.value;saveCareer(career);render();};
  }

  function renderSeason(){
    const p=career.pendingSeason,e=p.events[p.currentEvent];if(!e){app().innerHTML=`<div class="shell narrow">${brand()}${playerHeader()}<section class="story-card end-season"><span class="story-kicker">FIM DE TEMPORADA</span><h2>O ano chegou ao fim</h2><p>Agora é hora de ver seu desempenho, o ano do clube e o mercado.</p><button id="finish" class="primary wide">Ver resumo da temporada</button></section></div>`;$("#finish").onclick=()=>{finalizeSeason(career);saveCareer(career);render();};return;}
    const n=p.currentEvent+1,kind=e.kind==="derby"?"CLÁSSICO":e.kind==="continental"?"NOITE INTERNACIONAL":e.kind==="memory"?"SUA HISTÓRIA":e.kind==="career"?"CARREIRA":e.kind==="life"?"FORA DE CAMPO":e.kind==="injury"?"DEPARTAMENTO MÉDICO":"JOGO IMPORTANTE";
    app().innerHTML=`<div class="shell narrow">${brand()}${playerHeader()}<div class="season-context"><span>${p.yearLabel}</span><strong>${p.roleAtStart}</strong><small>${escapeHtml(p.objective)}</small></div><div class="progress"><span style="width:${n/p.events.length*100}%"></span></div><p class="progress-label">Momento ${n} de ${p.events.length}</p><section class="card event-card"><span class="eyebrow">${kind}</span><h2>${e.title}</h2><p class="event-text">${e.text}</p>${e.resolved?`<div class="result"><strong>Resultado</strong><p>${e.resultText}</p></div><button id="continue" class="primary wide">Continuar</button>`:`<div class="choices">${e.choices.map(ch=>`<button class="choice" data-id="${ch.id}"><strong>${ch.label}</strong></button>`).join("")}</div>`}</section></div>`;document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{resolveEventChoice(career,b.dataset.id);saveCareer(career);render();});if($("#continue"))$("#continue").onclick=()=>{advanceEvent(career);saveCareer(career);render();};
  }

  function renderSummary(){
    const s=career.lastSummary,p=s.player,g=career.position==="GOL",contractBlock=s.contractExpired?contractDecisionHtml(s):"",offers=s.transferOffers||[],marketPending=!s.contractExpired&&(offers.length||s.loanOffer||s.earlyRenewal),movement=s.leagueMovement?`<section class="season-verdict ${s.leagueMovement.type==="promotion"?"great":"bad"}"><span class="eyebrow">${s.leagueMovement.type==="promotion"?"ACESSO":"REBAIXAMENTO"}</span><h1>${s.leagueMovement.type==="promotion"?"Subiu de divisão!":"Queda de divisão"}</h1><p>${s.leagueMovement.from} → ${s.leagueMovement.to}</p></section>`:"";
    app().innerHTML=`<div class="shell">${brand()}${playerHeader()}<section class="season-verdict ${s.verdict.tone}"><span class="eyebrow">TEMPORADA ${p.yearLabel}</span><h1>${s.verdict.title}</h1><div class="rating-big">${p.rating.toFixed(2)}</div><p>${s.verdict.text}</p><small>${p.clubName} · ${p.leaguePosition}º em ${p.leagueName}</small></section>
    <div class="metrics">${metric("Jogos",p.games)}${metric("Titular",p.starts)}${g?metric("Defesas",p.saves):metric("Gols",p.goals)}${g?metric("% defesas",`${p.savePct}%`):metric("Assistências",p.assists)}${g?metric("Gols sofridos",p.goalsConceded):metric("Desarmes",p.tackles)}${metric("Clean sheets",p.cleanSheets)}${metric("Amarelos",p.yellowCards)}${metric("Vermelhos",p.redCards)}</div>${p.suspensionGames?`<p class="muted">Suspensões disciplinares: ${p.suspensionGames} jogo(s).</p>`:""}${p.gamesMissedOther?`<p class="muted">Outras ausências: ${p.gamesMissedOther} jogo(s).</p>`:""}
    <section class="card"><span class="eyebrow">EVOLUÇÃO</span><h2>OVR ${p.overallStart} → ${p.overallEnd}</h2>${attributeCards(career)}<p class="muted">${s.developmentText.join(" · ")}</p></section>
    <section class="season-verdict ${s.clubVerdict.tone} club-season"><span class="eyebrow">TEMPORADA DO CLUBE</span><h1>${s.clubVerdict.title}</h1><p>${s.clubVerdict.text}</p><div class="team-stats">${metric("Pontos",p.team.points)}${metric("Vitórias",p.team.wins)}${metric("Empates",p.team.draws)}${metric("Derrotas",p.team.losses)}${metric("Gols pró",p.team.goalsFor)}${metric("Gols contra",p.team.goalsAgainst)}</div></section>${movement}
    <div class="grid2"><section class="card club-review"><span class="eyebrow">SEU LUGAR NO CLUBE</span><h2>${s.legacy.label}${s.captain?" · Capitão":""}</h2><p>${s.clubDecision.text}</p><div class="review-row"><span>Status projetado: ${p.nextRole}</span><strong>Torcida ${s.legacy.fanAffinity}/100</strong></div></section><section class="card"><span class="eyebrow">COMPETIÇÕES</span><div class="competition-tags">${(p.competitions||[]).map(x=>`<span>${x}</span>`).join("")}</div></section></div>
    <section class="card finance-card"><span class="eyebrow">FINANÇAS</span><div class="career-numbers">${metric("Salário",`${formatMoney(p.salaryMonthlyBRL,career.currencyPreference)}/mês`)}${metric("Ganhos acumulados",formatMoney(career.careerEarningsBRL,career.currencyPreference))}${metric("Patrocínios",formatMoney(career.sponsorshipEarningsBRL,career.currencyPreference))}${metric("Contrato",`${career.contractYearsLeft} ano(s)`)}</div></section>
    <div class="grid2"><section class="card"><span class="eyebrow">TÍTULOS</span>${p.titles.length?`<ul class="award-list">${p.titles.map(x=>`<li>🏆 ${x}</li>`).join("")}</ul>`:'<p class="muted">Nenhum título.</p>'}</section><section class="card"><span class="eyebrow">PRÊMIOS</span>${p.awards.length?`<ul class="award-list">${p.awards.map(x=>`<li>⭐ ${x}</li>`).join("")}</ul>`:'<p class="muted">Nenhum prêmio individual.</p>'}</section></div>
    ${s.milestones?.length?`<section class="card"><span class="eyebrow">MARCOS DA CARREIRA</span><ul class="award-list">${s.milestones.map(x=>`<li>🎖️ ${x}</li>`).join("")}</ul></section>`:""}
    <section class="card rival"><span class="eyebrow">SEU RIVAL · ${p.yearLabel}</span><h2>${escapeHtml(career.rival.name)}</h2>${s.rival.news?`<p class="rival-news">📰 ${escapeHtml(s.rival.news)}</p>`:""}<div class="compare"><div><strong>${escapeHtml(career.name)}</strong><span>OVR ${p.overallEnd}</span><b>${p.rating.toFixed(2)}</b><small>${p.goals} G · ${p.assists} A</small></div><div class="versus">VS</div><div><strong>${escapeHtml(career.rival.name)}</strong><span>OVR ${s.rival.overallEnd}</span><b>${s.rival.rating.toFixed(2)}</b><small>${s.rival.goals} G · ${s.rival.assists} A</small></div></div></section>
    ${contractBlock}${!s.contractExpired&&offers.length?transferOffersHtml(offers):""}${!s.contractExpired&&!offers.length&&s.loanOffer?loanOfferHtml(s.loanOffer):""}${!s.contractExpired&&!offers.length&&!s.loanOffer&&s.earlyRenewal?earlyRenewalHtml(s.earlyRenewal):""}${!s.contractExpired?`<button id="next" class="primary wide" ${marketPending?"disabled":""}>Seguir para a próxima temporada</button>`:""}${career.age>=35&&career.age<41?`<button id="retire" class="ghost wide">Aposentar agora</button>`:""}</div>`;
    if($("#next"))$("#next").onclick=()=>{advanceAfterSummary(career);saveCareer(career);render();};document.querySelectorAll(".accept-transfer").forEach(b=>b.onclick=()=>{acceptTransfer(career,b.dataset.club);saveCareer(career);render();});if($("#decline-transfers"))$("#decline-transfers").onclick=()=>{declineTransfers(career);saveCareer(career);render();};if($("#accept-loan"))$("#accept-loan").onclick=()=>{acceptLoan(career);saveCareer(career);render();};if($("#decline-loan"))$("#decline-loan").onclick=()=>{declineLoan(career);saveCareer(career);render();};if($("#accept-early"))$("#accept-early").onclick=()=>{acceptEarlyRenewal(career);saveCareer(career);render();};if($("#decline-early"))$("#decline-early").onclick=()=>{declineEarlyRenewal(career);saveCareer(career);render();};if($("#renew"))$("#renew").onclick=()=>{acceptRenewal(career);saveCareer(career);render();};if($("#free-agent"))$("#free-agent").onclick=()=>{enterFreeAgency(career);saveCareer(career);render();};if($("#retire"))$("#retire").onclick=()=>{if(confirm("Encerrar a carreira?")){retireCareer(career,false);render();}};
  }

  function transferOffersHtml(offers){return`<section class="card offer"><span class="eyebrow">MERCADO DA BOLA</span><h2>${offers.length} proposta(s) na mesa</h2><div class="club-offers">${offers.map(o=>{const c=clubWithCareer(career,o.clubId);return`<div class="club-offer-static"><div><strong>${c.flag} ${c.name}</strong><span>${c.leagueName} · ${c.division}</span></div><div class="offer-meta"><small>${formatMoney(o.salaryMonthlyBRL,career.currencyPreference)}/mês</small><b>${o.projectedRole}</b></div><button class="primary accept-transfer" data-club="${c.id}">Aceitar</button></div>`;}).join("")}</div><button id="decline-transfers">Recusar todas</button></section>`;}
  function loanOfferHtml(o){const c=clubWithCareer(career,o.clubId);return`<section class="card offer"><span class="eyebrow">EMPRÉSTIMO</span><h2>${c.flag} ${c.name}</h2><p>${o.text}</p><p>Papel projetado: <strong>${o.projectedRole}</strong></p><div class="actions"><button id="accept-loan" class="primary">Aceitar empréstimo</button><button id="decline-loan">Recusar</button></div></section>`;}
  function earlyRenewalHtml(o){return`<section class="card contract-choice"><span class="eyebrow">RENOVAÇÃO ANTECIPADA</span><h2>${o.clubName} quer prolongar seu contrato</h2><p>${o.years} ano(s), ${formatMoney(o.salaryMonthlyBRL,career.currencyPreference)}/mês · papel projetado: ${o.projectedRole}.</p><div class="actions"><button id="accept-early" class="primary">Renovar agora</button><button id="decline-early">Deixar para depois</button></div></section>`;}

  function contractDecisionHtml(s){const r=s.renewalOffer;return`<section class="card contract-choice"><span class="eyebrow">FIM DE CONTRATO</span><h2>Seu vínculo terminou</h2>${r?`<p>${r.clubName} oferece renovação por ${r.years} ano(s), ${formatMoney(r.salaryMonthlyBRL,career.currencyPreference)}/mês e papel projetado de ${r.projectedRole}.</p><div class="actions"><button id="renew" class="primary">Renovar</button><button id="free-agent">Não renovar e ficar livre</button></div>`:`<p>O clube não apresentou renovação. Você ficará livre para ouvir propostas.</p><button id="free-agent" class="primary wide">Ouvir propostas</button>`}</section>`;}

  function renderFreeAgency(){const offers=career.pendingFreeAgentOffers||[];app().innerHTML=`<div class="shell narrow">${brand()}${playerHeader(true)}<section class="hero compact"><span class="eyebrow">JOGADOR LIVRE</span><h1>Mercado aberto</h1><p>Sem contrato, você pode considerar clubes melhores ou piores de acordo com espaço, momento da carreira e salário.</p></section><section class="card"><div class="club-offers">${offers.map(o=>{const c=clubWithCareer(career,o.clubId);return`<button class="club-offer free-choice" data-club="${c.id}"><div><strong>${c.flag} ${c.name}</strong><span>${c.leagueName} · ${c.division}</span></div><div class="offer-meta"><small>${formatMoney(o.salaryMonthlyBRL,career.currencyPreference)}/mês</small><b>${o.projectedRole}</b></div></button>`;}).join("")}</div></section>${career.age>=35?`<button id="retire" class="ghost wide">Aposentar</button>`:""}</div>`;document.querySelectorAll(".free-choice").forEach(b=>b.onclick=()=>{chooseFreeAgent(career,b.dataset.club);saveCareer(career);render();});if($("#retire"))$("#retire").onclick=()=>{retireCareer(career,false);render();};}

  function historyHtml(h){const rows=[...h].reverse().map(s=>`<tr><td>${s.yearLabel}</td><td>${s.clubName}</td><td>${s.overallEnd}</td><td>${s.rating.toFixed(2)}</td><td>${s.leaguePosition}º</td><td>${(s.titles||[]).length?(s.titles||[]).join(", "):"—"}</td><td>${(s.awards||[]).length?(s.awards||[]).join(", "):"—"}</td></tr>`).join("");return`<section class="card"><span class="eyebrow">HISTÓRICO DA CARREIRA</span><div class="table-wrap"><table><thead><tr><th>Temporada</th><th>Clube</th><th>OVR</th><th>Nota</th><th>Liga</th><th>Títulos</th><th>Prêmios</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;}

  function renderRetirement(){const t=careerTotals(career.history),allTitles=career.history.flatMap(x=>x.titles||[]),allAwards=career.history.flatMap(x=>x.awards||[]),maxOvr=Math.max(career.overall,...career.history.map(x=>x.overallEnd||0)),best=Math.max(0,...career.history.map(x=>x.rating||0));app().innerHTML=`<div class="shell narrow">${brand()}<section class="season-verdict elite"><span class="eyebrow">FIM DA CARREIRA</span><h1>${career.forcedRetirement?"Aos 41, chegou a hora":"Você decidiu pendurar as chuteiras"}</h1><p>${escapeHtml(career.name)} encerra a carreira profissional aos ${career.age} anos.</p></section><section class="card"><div class="career-numbers">${metric("Temporadas",career.history.length)}${metric("Jogos",t.games)}${metric("Gols",t.goals)}${metric("Assistências",t.assists)}${metric("OVR máximo",maxOvr)}${metric("Melhor nota",best.toFixed(2))}</div></section><section class="card"><span class="eyebrow">LEGADO</span><p>🏆 ${allTitles.length} título(s) · ⭐ ${allAwards.length} prêmio(s)</p><p>Ganhos de carreira: <strong>${formatMoney(career.careerEarningsBRL,career.currencyPreference)}</strong></p>${historyHtml(career.history)}</section><button id="reset" class="primary wide">Começar uma nova carreira</button></div>`;$("#reset").onclick=()=>{clearCareer();career=null;render();};}

  function render(){if(!career)return renderCreate();if(career.retired)return renderRetirement();if(career.introStage!=="complete")return renderIntro();if(career.freeAgent)return renderFreeAgency();if(career.pendingSeason)return renderSeason();if(career.lastSummary)return renderSummary();return renderDashboard();}
  function init(){career=migrateCareer(loadCareer());if(career)saveCareer(career);render();}

  return { init, calculateOverall, createCareer, startSeason, finalizeSeason, resolveEventChoice, advanceEvent, migrateCareer, CLUBS, LEAGUES, _test:{competitionsFor,isClubWorldCupYear,qualifiedForClubWorldCup,updateLeagueMovement,possibleOffers,possibleLoanOffer,legacyLabel} };
})();

document.addEventListener("DOMContentLoaded",FutLife.init);
