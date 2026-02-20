import { useState, useEffect, useRef, useCallback } from "react";

// ═══════ STORAGE (localStorage, no async blocking) ═══════
const STORE_KEY = "t13_data_v2";
function loadData() {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}
function saveData(d) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch(e) {}
}

// ═══════ TAX MATH ═══════
const BRACKETS = [
  { min:0,       max:237100,   base:0,      rate:0.18 },
  { min:237101,  max:370500,   base:42678,  rate:0.26 },
  { min:370501,  max:512800,   base:77362,  rate:0.31 },
  { min:512801,  max:673000,   base:121475, rate:0.36 },
  { min:673001,  max:857900,   base:179147, rate:0.39 },
  { min:857901,  max:1817000,  base:251258, rate:0.41 },
  { min:1817001, max:Infinity, base:644489, rate:0.45 },
];
const PRIMARY_REBATE = 17235;
const THRESHOLD = 95750;

function calcTax(annual) {
  if (annual <= THRESHOLD) return { tax:0, effectiveRate:0, marginalRate:0.18 };
  const b = BRACKETS.find(b => annual >= b.min && annual <= b.max) || BRACKETS[6];
  const gross = b.base + b.rate * (annual - b.min);
  const tax = Math.max(0, gross - PRIMARY_REBATE);
  return { tax, effectiveRate: tax/annual, marginalRate: b.rate };
}

function getMarginal(annual) { return calcTax(annual).marginalRate; }
function fmtR(n) { return "R " + Math.round(Math.abs(n)).toLocaleString("en-ZA"); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function todayStr() { return new Date().toISOString().slice(0,10); }
function thisMonthStr() { return todayStr().slice(0,7); }
function daysLeft() {
  const n = new Date();
  const yr = n.getMonth() <= 1 ? n.getFullYear() : n.getFullYear()+1;
  return Math.max(0, Math.ceil((new Date(yr,1,28) - n)/86400000));
}
function taxYearPct() {
  const n = new Date();
  const yr = n.getMonth() <= 1 ? n.getFullYear()-1 : n.getFullYear();
  const s = new Date(yr,2,1), e = new Date(yr+1,1,28);
  return Math.min(100, Math.round((n-s)/(e-s)*100));
}

// ═══════ DATA ═══════
const TAX_CATS = {
  phone_internet:       { name:"Phone & Internet",       icon:"📱", desc:"Work portion of mobile & data" },
  equipment_software:   { name:"Equipment & Software",   icon:"💻", desc:"Computers, tools, software" },
  professional_services:{ name:"Professional Services",  icon:"📋", desc:"Accountant, legal, consulting" },
  bank_charges:         { name:"Bank Charges",           icon:"🏦", desc:"Monthly fees & transactions" },
  work_travel:          { name:"Work Travel",             icon:"🚗", desc:"Business travel (not commuting)" },
  home_office_rent:     { name:"Home Office (Rent)",     icon:"🏠", desc:"Office share of rent/bond" },
  home_office_utilities:{ name:"Home Office (Utilities)",icon:"💡", desc:"Office share of electricity" },
  training:             { name:"Training & Education",   icon:"📚", desc:"Courses, conferences, books" },
  marketing:            { name:"Marketing",              icon:"📣", desc:"Ads, website, branding" },
  stationery:           { name:"Stationery & Supplies",  icon:"📝", desc:"Paper, ink, office supplies" },
  subscriptions:        { name:"Subscriptions",          icon:"📰", desc:"Work software & memberships" },
  client_entertainment: { name:"Client Entertainment",  icon:"🍽️", desc:"Business meals & hosting" },
  other_work:           { name:"Other Work Expenses",    icon:"📦", desc:"Any other work cost" },
};

const DEFAULT_BUDGET = [
  { id:"groceries",    name:"Groceries",    limit:5000, icon:"🛒" },
  { id:"eating_out",   name:"Eating Out",   limit:1800, icon:"☕" },
  { id:"fuel",         name:"Fuel",         limit:3000, icon:"⛽" },
  { id:"entertainment",name:"Entertainment",limit:2000, icon:"🎬" },
  { id:"clothing",     name:"Clothing",     limit:1500, icon:"👕" },
  { id:"medical",      name:"Medical",      limit:1000, icon:"💊" },
  { id:"other",        name:"Other",        limit:2000, icon:"📦" },
];

const DREAMS = [
  { icon:"✈️", label:"Return flights to Cape Town", cost:3200 },
  { icon:"🏖️", label:"Weekend away for two",        cost:4500 },
  { icon:"📚", label:"Three months school fees",    cost:6000 },
  { icon:"🛒", label:"Six months of groceries",     cost:9000 },
  { icon:"💻", label:"New laptop",                  cost:12000 },
  { icon:"🏠", label:"Two months rent",             cost:14000 },
  { icon:"🚗", label:"Six months car payments",     cost:18000 },
];

const BLANK = {
  profile:    { name:"", occupation:"", income:0, employmentType:"", savingsGoal:0 },
  taxCats:    {},
  budget:     DEFAULT_BUDGET,
  expenses:   [],
  setupDone:  false,
};

// ═══════ COLORS ═══════
const C = {
  bg:"#07101D", bg2:"#0D1929", card:"#111F33", card2:"#162338",
  border:"rgba(255,255,255,0.07)", gold:"#F0B429", goldDim:"rgba(240,180,41,0.13)",
  green:"#10B981", greenDim:"rgba(16,185,129,0.12)", red:"#EF4444",
  text:"#EEF2FF", muted:"rgba(180,200,240,0.45)", faint:"rgba(180,200,240,0.18)",
  purple:"#818CF8",
};

// ═══════ CSS ═══════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;background:#030810;font-family:'DM Sans',sans-serif}
.shell{width:390px;height:844px;background:${C.bg};border-radius:44px;overflow:hidden;position:relative;border:5px solid #030810;box-shadow:0 60px 140px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.04)}
.notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:110px;height:30px;background:#030810;border-radius:0 0 16px 16px;z-index:40}
.sbar{height:46px;padding:14px 22px 0;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:600;color:${C.muted};z-index:30;position:relative;flex-shrink:0}
.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scroll::-webkit-scrollbar{display:none}
.p{padding:14px 18px}
.nav{height:70px;background:rgba(13,25,41,.98);backdrop-filter:blur(20px);border-top:1px solid ${C.border};display:flex;align-items:center;justify-content:space-around;padding:0 6px;flex-shrink:0}
.nb{background:none;border:none;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 10px;color:${C.faint};font-family:'DM Sans';font-size:8px;font-weight:600;cursor:pointer;transition:color .15s;letter-spacing:.03em;text-transform:uppercase}
.nb.on{color:${C.gold}}
.card{background:linear-gradient(145deg,${C.card},${C.card2});border:1px solid ${C.border};border-radius:16px;overflow:hidden;position:relative}
.card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);pointer-events:none}
.gcard{background:linear-gradient(145deg,rgba(240,180,41,.11),rgba(220,140,20,.05));border:1px solid rgba(240,180,41,.22)}
.grcard{background:linear-gradient(145deg,rgba(16,185,129,.09),rgba(16,185,129,.03));border:1px solid rgba(16,185,129,.18)}
.inp{width:100%;background:rgba(255,255,255,.05);border:1px solid ${C.border};border-radius:12px;padding:11px 14px;font-family:'DM Sans';font-size:14px;color:${C.text};outline:none;transition:border-color .2s}
.inp:focus{border-color:rgba(240,180,41,.35)}
.inp::placeholder{color:${C.faint}}
select.inp{-webkit-appearance:none}
.btn{border:none;border-radius:13px;padding:13px 18px;font-family:'Sora';font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;width:100%;margin-top:10px}
.btnG{background:linear-gradient(135deg,${C.gold},#D4900A);color:#000;box-shadow:0 4px 18px rgba(240,180,41,.28)}
.btnG:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(240,180,41,.38)}
.btnS{background:rgba(255,255,255,.04);color:${C.muted};border:1px solid ${C.border}}
.row{display:flex;align-items:center;padding:11px 14px;border-bottom:1px solid ${C.border};gap:11px}
.row:last-child{border-bottom:none}
.bar{height:4px;border-radius:100px;background:rgba(255,255,255,.05);overflow:hidden}
.fill{height:100%;border-radius:100px;transition:width .5s cubic-bezier(.34,1.56,.64,1)}
.fab{width:50px;height:50px;border-radius:15px;background:linear-gradient(135deg,${C.gold},#C98000);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#000;box-shadow:0 4px 14px rgba(240,180,41,.32);transition:all .18s;margin-top:-12px}
.fab:hover{transform:scale(1.06)}
.chip{background:rgba(255,255,255,.04);border:1px solid ${C.border};border-radius:12px;padding:13px 15px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px}
.chip.on{background:${C.goldDim};border-color:rgba(240,180,41,.32);color:${C.gold}}
.tip{background:linear-gradient(135deg,rgba(240,180,41,.07),rgba(240,180,41,.02));border:1px solid rgba(240,180,41,.12);border-radius:13px;padding:11px 13px;display:flex;gap:9px;align-items:flex-start}
.fade{animation:fadeIn .28s ease-out both}
`;

// ═══════ ICONS ═══════
const Ico = ({d,s=20,c="currentColor",w=1.8}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const I = {
  home: s=><Ico s={s} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
  zap:  s=><Ico s={s} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  plus: s=><Ico s={s} d="M12 5v14M5 12h14" w={2.5}/>,
  pie:  s=><Ico s={s} d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/>,
  chat: s=><Ico s={s} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
  back: s=><Ico s={s} d="M15 18l-6-6 6-6"/>,
  chk:  s=><Ico s={s} d="M20 6L9 17l-5-5" w={2.5}/>,
  send: s=><Ico s={s} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
  gear: s=><Ico s={s} d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>,
  trash:s=><Ico s={s} d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>,
};

// ═══════ SMALL HELPERS ═══════
const SBar = () => (
  <div className="sbar"><span>9:41</span><span style={{letterSpacing:3}}>▲▲▲ ▲ ▐▐</span></div>
);
const Bar = ({pct, color}) => (
  <div className="bar"><div className="fill" style={{width:`${Math.min(100,pct||0)}%`, background:color||C.gold}}/></div>
);
const TopBar = ({title,back,right}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px 6px"}}>
    <button onClick={back} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4,display:"flex"}}>{I.back(22)}</button>
    <span style={{fontFamily:"'Sora'",fontSize:15,fontWeight:700}}>{title}</span>
    <div style={{width:30}}>{right}</div>
  </div>
);
const Tjommie = ({msg,onTap}) => (
  <div className="tip fade" style={{margin:"0 0 14px",cursor:onTap?"pointer":"default"}} onClick={onTap}>
    <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${C.gold},#C98000)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#000",flexShrink:0}}>T</div>
    <p style={{fontSize:12,color:"rgba(240,180,41,.82)",lineHeight:1.55}}>{msg}</p>
  </div>
);

function AnimNum({val,prefix="R ",dur=1100}) {
  const [n,setN] = useState(0);
  useEffect(()=>{
    const target = typeof val==="number"?val:0;
    if(target===0){setN(0);return;}
    const start=Date.now();
    const tick=()=>{ const p=Math.min((Date.now()-start)/dur,1); const e=1-Math.pow(1-p,3); setN(Math.round(e*target)); if(p<1)requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  },[val]);
  return <span style={{fontVariantNumeric:"tabular-nums"}}>{prefix}{n.toLocaleString("en-ZA")}</span>;
}

// ═══════════════════════════════════════
// SETUP SCREENS
// ═══════════════════════════════════════

function S_Lang({next}) {
  const langs = [
    {code:"en",name:"English",avail:true},
    {code:"af",name:"Afrikaans",avail:false},
    {code:"zu",name:"isiZulu",avail:false},
    {code:"xh",name:"isiXhosa",avail:false},
    {code:"st",name:"Sesotho",avail:false},
  ];
  return (
    <div className="scroll p fade">
      <div style={{height:60}}/>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:44,marginBottom:14}}>🇿🇦</div>
        <h1 style={{fontFamily:"'Sora'",fontSize:26,fontWeight:800,marginBottom:8}}>Choose your language</h1>
        <p style={{color:C.muted,fontSize:13}}>More languages coming soon</p>
      </div>
      {langs.map(l=>(
        <button key={l.code} onClick={()=>l.avail&&next()} disabled={!l.avail}
          style={{width:"100%",background:l.avail?C.goldDim:"rgba(255,255,255,.03)",border:`1px solid ${l.avail?"rgba(240,180,41,.3)":C.border}`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:l.avail?"pointer":"default",marginBottom:8,opacity:l.avail?1:.4,transition:"all .18s"}}>
          <span style={{fontSize:22}}>🇿🇦</span>
          <span style={{fontFamily:"'Sora'",fontWeight:700,fontSize:14,color:l.avail?C.gold:C.muted,flex:1,textAlign:"left"}}>{l.name}</span>
          {!l.avail&&<span style={{fontSize:9,color:C.faint,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>Coming soon</span>}
          {l.avail&&<span style={{color:C.gold}}>{I.chk(16)}</span>}
        </button>
      ))}
    </div>
  );
}

function S_Promise({next}) {
  const [n,setN]=useState(0);
  useEffect(()=>{
    const t=18400,s=Date.now();
    const tick=()=>{ const p=Math.min((Date.now()-s)/2200,1); setN(Math.round((1-Math.pow(1-p,3))*t)); if(p<1)requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  },[]);
  return (
    <div className="scroll fade" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"30px 24px",minHeight:"100%"}}>
      <p style={{fontSize:12,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600,marginBottom:18}}>SARS owes the average South African</p>
      <div style={{fontFamily:"'Sora'",fontSize:62,fontWeight:800,color:C.gold,lineHeight:1,marginBottom:8,textShadow:`0 0 50px rgba(240,180,41,.28)`}}>
        R {n.toLocaleString("en-ZA")}
      </div>
      <p style={{fontSize:14,color:C.muted,marginBottom:40}}>Every year. Unclaimed.</p>
      <div className="card gcard" style={{padding:"18px 20px",marginBottom:40,textAlign:"left"}}>
        <p style={{fontSize:14,lineHeight:1.65,color:"rgba(240,210,120,.85)"}}>
          It's called your <strong style={{color:C.gold}}>13th Cheque</strong> — the tax refund most people don't realise they're owed. We're going to help you find yours and build it up all year long.
        </p>
      </div>
      <button className="btn btnG" onClick={next} style={{width:"100%",fontSize:15}}>Show me mine →</button>
    </div>
  );
}

function S_EmpType({next}) {
  const [sel,setSel]=useState("");
  const types=[
    {id:"freelancer",icon:"🧾",title:"I work for myself",sub:"Freelancer, sole proprietor, contractor"},
    {id:"commission",icon:"💰",title:"I earn commission",sub:"Variable or performance-based pay"},
    {id:"salaried",  icon:"🏢",title:"I get a salary",   sub:"Fixed monthly, employer deducts PAYE"},
  ];
  return (
    <div className="scroll p fade">
      <p style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Step 1 of 4</p>
      <h2 style={{fontFamily:"'Sora'",fontSize:22,fontWeight:700,marginBottom:8}}>How do you earn your money?</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.6}}>This is the most important question — it changes what SARS will let you claim.</p>
      <Tjommie msg="Hey, I'm Tjommie. This first question matters most. Be honest — it can only help you." />
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
        {types.map(t=>(
          <div key={t.id} className={`chip ${sel===t.id?"on":""}`} onClick={()=>setSel(t.id)}>
            <span style={{fontSize:24}}>{t.icon}</span>
            <div style={{flex:1}}>
              <p style={{fontWeight:600,fontSize:14}}>{t.title}</p>
              <p style={{fontSize:11,color:sel===t.id?C.gold:C.muted,marginTop:2}}>{t.sub}</p>
            </div>
            {sel===t.id&&<span style={{color:C.gold}}>{I.chk(18)}</span>}
          </div>
        ))}
      </div>
      {sel==="salaried"&&(
        <div className="card fade" style={{padding:"12px 14px",marginBottom:14,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.14)"}}>
          <p style={{fontSize:12,color:"rgba(239,100,100,.8)",lineHeight:1.6}}>⚠️ Salaried employees have stricter rules — SARS expects your employer to cover most work costs. We'll guide you through exactly what you can and can't claim.</p>
        </div>
      )}
      <button className="btn btnG" onClick={()=>sel&&next(sel)} style={{opacity:sel?1:.4}}>Continue →</button>
    </div>
  );
}

function S_Money({empType,next}) {
  const [name,setName]=useState("");
  const [occ,setOcc]=useState("");
  const [income,setIncome]=useState(25000);
  const annual=income*12;
  const {marginalRate}=calcTax(annual);
  const estimate=Math.round(annual*0.1*marginalRate);
  return (
    <div className="scroll p fade">
      <p style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Step 2 of 4</p>
      <h2 style={{fontFamily:"'Sora'",fontSize:22,fontWeight:700,marginBottom:6}}>Your money</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:18}}>We need three things to calculate your 13th Cheque.</p>
      <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Your first name</label>
      <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="First name" style={{marginBottom:12}}/>
      <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>What do you do?</label>
      <input className="inp" value={occ} onChange={e=>setOcc(e.target.value)} placeholder="e.g. Designer, teacher, driver..." style={{marginBottom:12}}/>
      <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Monthly gross income</label>
      <input className="inp" type="number" value={income} onChange={e=>setIncome(Number(e.target.value)||0)} placeholder="Monthly gross" style={{marginBottom:8}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,padding:"0 2px"}}>
        <span style={{fontSize:11,color:C.muted}}>Tax bracket: <strong style={{color:C.text}}>{Math.round(calcTax(annual).marginalRate*100)}%</strong></span>
        <span style={{fontSize:11,color:C.muted}}>Monthly tax: <strong style={{color:C.red}}>~{fmtR(calcTax(annual).tax/12)}</strong></span>
      </div>
      {income>0&&(
        <div className="card gcard fade" style={{padding:"15px",marginBottom:16}}>
          <p style={{fontSize:11,color:"rgba(240,180,41,.55)",marginBottom:4}}>Estimated 13th Cheque</p>
          <div style={{fontFamily:"'Sora'",fontSize:34,fontWeight:800,color:C.gold}}><AnimNum val={estimate}/></div>
          <p style={{fontSize:11,color:C.muted,marginTop:4}}>based on typical deductions at your income</p>
        </div>
      )}
      <button className="btn btnG" onClick={()=>(name&&income>0)&&next({name,occupation:occ,income})} style={{opacity:(name&&income>0)?1:.4}}>Continue →</button>
    </div>
  );
}

function S_Deductions({empType,next}) {
  const isSal=empType==="salaried";
  const [on,setOn]=useState(()=>{
    if(isSal) return {professional_services:true,work_travel:true,bank_charges:true};
    return {phone_internet:true,equipment_software:true,bank_charges:true,stationery:true,subscriptions:true};
  });
  const toggle=k=>setOn(p=>({...p,[k]:!p[k]}));
  const cats=Object.entries(TAX_CATS);
  const restricted=new Set(isSal?["phone_internet","stationery","subscriptions","marketing","client_entertainment"]:[]);
  return (
    <div className="scroll p fade">
      <p style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Step 3 of 4</p>
      <h2 style={{fontFamily:"'Sora'",fontSize:22,fontWeight:700,marginBottom:6}}>What do you spend on work?</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:14,lineHeight:1.6}}>Switch on the categories that apply to you. You can change these any time.</p>
      {isSal&&<div className="card fade" style={{padding:"11px 13px",marginBottom:14,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.14)"}}><p style={{fontSize:12,color:"rgba(239,100,100,.8)",lineHeight:1.55}}>⚠️ Greyed-out categories can't be claimed by salaried employees — SARS expects your employer to cover these.</p></div>}
      <Tjommie msg="Don't overthink this. Start with what you know, and add more later. I'll remind you as you go." />
      <div className="card" style={{padding:0,marginBottom:14}}>
        {cats.map(([k,cat],j)=>{
          const dis=restricted.has(k);
          const isOn=on[k]&&!dis;
          return (
            <div key={k} className="row" onClick={()=>!dis&&toggle(k)} style={{cursor:dis?"default":"pointer",opacity:dis?.3:1,borderBottom:j<cats.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:20,width:24,textAlign:"center"}}>{cat.icon}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:500}}>{cat.name}</p>
                <p style={{fontSize:10,color:C.muted,marginTop:1}}>{cat.desc}</p>
              </div>
              <div style={{width:36,height:21,borderRadius:10.5,background:isOn?"rgba(240,180,41,.3)":C.faint,padding:2,flexShrink:0,transition:"all .2s",cursor:dis?"default":"pointer"}} onClick={e=>{e.stopPropagation();!dis&&toggle(k)}}>
                <div style={{width:17,height:17,borderRadius:8.5,background:isOn?C.gold:"rgba(180,200,240,.2)",transform:isOn?"translateX(15px)":"none",transition:"all .2s"}}/>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn btnG" onClick={()=>next(on)}>Almost there →</button>
    </div>
  );
}

function S_Budget({profile,next}) {
  const annual=profile.income*12;
  const {tax}=calcTax(annual);
  const netMonthly=profile.income-Math.round(tax/12);
  const [goal,setGoal]=useState(1000);
  const [cats,setCats]=useState(DEFAULT_BUDGET);
  const total=cats.reduce((s,c)=>s+c.limit,0);
  const over=total>netMonthly;
  const upd=(id,v)=>setCats(p=>p.map(c=>c.id===id?{...c,limit:Math.max(0,v)}:c));
  return (
    <div className="scroll p fade">
      <p style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Step 4 of 4</p>
      <h2 style={{fontFamily:"'Sora'",fontSize:22,fontWeight:700,marginBottom:6}}>Budget & savings</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.6}}>After tax, you have <strong style={{color:C.green}}>{fmtR(netMonthly)}</strong>/month to live on. Let's plan it.</p>
      <div className="card grcard" style={{padding:"14px",marginBottom:16}}>
        <p style={{fontSize:11,color:"rgba(16,185,129,.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Monthly savings goal</p>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:C.green,fontSize:13,fontWeight:600}}>R</span>
          <input className="inp" type="number" value={goal} onChange={e=>setGoal(Number(e.target.value)||0)} style={{flex:1,borderColor:"rgba(16,185,129,.25)"}}/>
        </div>
        {goal>0&&<p style={{fontSize:11,color:"rgba(16,185,129,.7)",marginTop:8}}>Tjommie will coach you toward saving {fmtR(Math.round(goal/30))}/day 💪</p>}
      </div>
      <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Monthly limits</p>
      <div className="card" style={{padding:0,marginBottom:8}}>
        {cats.map((c,j)=>(
          <div key={c.id} className="row" style={{borderBottom:j<cats.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:18,width:24,textAlign:"center"}}>{c.icon}</span>
            <span style={{flex:1,fontSize:13}}>{c.name}</span>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:11,color:C.muted}}>R</span>
              <input type="number" value={c.limit} onChange={e=>upd(c.id,Number(e.target.value)||0)}
                style={{width:68,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 8px",color:C.text,fontFamily:"'DM Sans'",fontSize:12,textAlign:"right",outline:"none"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"4px 2px",marginBottom:14}}>
        <span style={{fontSize:11,color:C.muted}}>Budgeted</span>
        <span style={{fontSize:11,fontWeight:600,color:over?C.red:C.green}}>{fmtR(total)} / {fmtR(netMonthly)}</span>
      </div>
      <button className="btn btnG" onClick={()=>next(goal,cats)}>Find my 13th Cheque ⚡</button>
    </div>
  );
}

// ═══════════════════════════════════════
// APP SCREENS
// ═══════════════════════════════════════

function S_Ready({profile,taxCats,onDone}) {
  const annual=profile.income*12;
  const marginal=getMarginal(annual);
  const enabled=Object.values(taxCats).filter(Boolean).length;
  const est=Math.round(annual*0.09*marginal*Math.max(enabled,1)/4);
  const dreams=DREAMS.filter(d=>d.cost<=est*1.3).slice(-3);
  return (
    <div className="scroll p fade" style={{textAlign:"center"}}>
      <div style={{height:20}}/>
      <div style={{fontSize:52,marginBottom:14}}>🎯</div>
      <h1 style={{fontFamily:"'Sora'",fontSize:26,fontWeight:800,marginBottom:8}}>You're set, {profile.name}!</h1>
      <div className="card gcard" style={{padding:"20px",marginBottom:18,textAlign:"center"}}>
        <p style={{fontSize:11,color:"rgba(240,180,41,.55)",marginBottom:6}}>Your potential 13th Cheque</p>
        <div style={{fontFamily:"'Sora'",fontSize:44,fontWeight:800,color:C.gold,lineHeight:1}}><AnimNum val={est}/></div>
        <p style={{fontSize:11,color:C.muted,marginTop:6}}>{daysLeft()} days left in the tax year to build it</p>
      </div>
      {dreams.length>0&&(
        <div style={{textAlign:"left",marginBottom:18}}>
          <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Your 13th Cheque could cover...</p>
          {dreams.map(d=>(
            <div key={d.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:20}}>{d.icon}</span>
              <span style={{fontSize:13,color:C.muted}}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
      <Tjommie msg={`Right — every rand you spend on work this year, I'll track it. The tax year ends 28 Feb. Snap your slips as you go and let's find that money.`} />
      <button className="btn btnG" onClick={onDone} style={{fontSize:15}}>Start building my 13th Cheque ⚡</button>
    </div>
  );
}

function S_Home({data,go}) {
  const {profile,expenses,budget}=data;
  const annual=profile.income*12;
  const {tax,marginalRate}=calcTax(annual);
  const mTax=Math.round(tax/12);
  const living=profile.income-mTax;
  const workExp=expenses.filter(e=>e.type==="work");
  const cheque=Math.round(workExp.reduce((s,e)=>s+e.amount,0)*marginalRate);
  const thisM=expenses.filter(e=>monthKey(e.date)===thisMonthStr());
  const personalSpent=thisM.filter(e=>e.type==="personal").reduce((s,e)=>s+e.amount,0);
  const livingLeft=living-personalSpent;
  const pct=taxYearPct();
  const dream=DREAMS.filter(d=>d.cost<=cheque).slice(-1)[0];
  const recent=[...expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
  const monthKey=(d)=>d.slice(0,7);
  const savGoal=profile.savingsGoal||0;
  return (
    <div className="scroll p">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <p style={{fontSize:12,color:C.muted}}>Good {new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"},</p>
          <h2 style={{fontFamily:"'Sora'",fontSize:20,fontWeight:700}}>{profile.name} 👋</h2>
        </div>
        <button onClick={()=>go("settings")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer"}}>{I.gear(22)}</button>
      </div>

      {/* 13th Cheque */}
      <div className="card gcard fade" style={{padding:"18px",marginBottom:11,cursor:"pointer"}} onClick={()=>go("cheque")}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <p style={{fontSize:10,color:"rgba(240,180,41,.55)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>Your 13th Cheque</p>
            <div style={{fontFamily:"'Sora'",fontSize:38,fontWeight:800,color:C.gold,lineHeight:1}}><AnimNum val={cheque}/></div>
            <p style={{fontSize:11,color:"rgba(240,180,41,.45)",marginTop:4}}>estimated SARS refund</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:10,color:C.muted}}>{daysLeft()} days left</p>
            <p style={{fontSize:10,color:"rgba(240,180,41,.5)",marginTop:2}}>28 Feb →</p>
          </div>
        </div>
        <Bar pct={pct} color={`linear-gradient(90deg,${C.gold},#D4900A)`}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          <p style={{fontSize:10,color:C.muted}}>Tax year {pct}% complete</p>
          {dream&&<p style={{fontSize:10,color:"rgba(240,180,41,.5)"}}>{dream.icon} {dream.label}</p>}
        </div>
      </div>

      {/* Two mini cards */}
      <div style={{display:"flex",gap:10,marginBottom:11}}>
        <div className="card grcard fade" style={{flex:1,padding:"13px",cursor:"pointer"}} onClick={()=>go("spending")}>
          <p style={{fontSize:10,color:"rgba(16,185,129,.55)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Living Money</p>
          <p style={{fontFamily:"'Sora'",fontSize:20,fontWeight:700,color:livingLeft<0?C.red:C.green}}>{fmtR(livingLeft)}</p>
          <p style={{fontSize:10,color:C.muted,marginTop:3}}>left this month</p>
          <div style={{marginTop:8}}><Bar pct={personalSpent/living*100} color={personalSpent>living?C.red:C.green}/></div>
        </div>
        {savGoal>0&&(
          <div className="card fade" style={{flex:1,padding:"13px",border:"1px solid rgba(129,140,248,.2)",background:"rgba(99,102,241,.06)"}}>
            <p style={{fontSize:10,color:"rgba(129,140,248,.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Savings</p>
            <p style={{fontFamily:"'Sora'",fontSize:20,fontWeight:700,color:C.purple}}>{fmtR(savGoal)}</p>
            <p style={{fontSize:10,color:C.muted,marginTop:3}}>goal this month</p>
            <div style={{marginTop:8}}><Bar pct={Math.max(0,livingLeft)/savGoal*100} color={C.purple}/></div>
          </div>
        )}
      </div>

      {/* Tjommie */}
      {expenses.length===0
        ?<Tjommie msg="No expenses logged yet. Every work slip you add grows your 13th Cheque. Tap + to start." onTap={()=>go("add","work")}/>
        :cheque>0?<Tjommie msg={`Every R100 you claim saves you R${Math.round(marginalRate*100)} in tax. You've already found ${fmtR(cheque)} this year.`} onTap={()=>go("tjommie")}/>
        :null}

      {/* Recent */}
      {recent.length>0&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".08em"}}>Recent</p>
            <button onClick={()=>go("history")} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer"}}>See all</button>
          </div>
          <div className="card" style={{padding:0}}>
            {recent.map((e,j)=>(
              <div key={e.id} className="row" style={{borderBottom:j<recent.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:32,height:32,borderRadius:9,background:e.type==="work"?C.goldDim:C.greenDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{e.type==="work"?"⚡":"💳"}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:500}}>{e.merchant||e.category||"Expense"}</p>
                  <p style={{fontSize:10,color:C.muted}}>{e.date}</p>
                </div>
                <span style={{fontFamily:"'Sora'",fontSize:13,fontWeight:600,color:e.type==="work"?C.gold:C.text}}>{fmtR(e.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function S_Cheque({data,go}) {
  const {profile,expenses,taxCats}=data;
  const annual=profile.income*12;
  const {marginalRate}=calcTax(annual);
  const workExp=expenses.filter(e=>e.type==="work");
  const workTotal=workExp.reduce((s,e)=>s+e.amount,0);
  const cheque=Math.round(workTotal*marginalRate);
  const byCat={};
  workExp.forEach(e=>{ const k=e.taxCategory||"other_work"; byCat[k]=(byCat[k]||0)+e.amount; });
  const dreams=DREAMS.filter(d=>d.cost<=cheque*1.2&&cheque>0);
  const thisM=workExp.filter(e=>e.date.slice(0,7)===thisMonthStr());
  const thisMTotal=thisM.reduce((s,e)=>s+e.amount,0);
  return (
    <div className="scroll p">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontFamily:"'Sora'",fontSize:20,fontWeight:700}}>Your 13th Cheque</h2>
        <button onClick={()=>go("add","work")} style={{background:C.goldDim,border:`1px solid rgba(240,180,41,.22)`,borderRadius:10,padding:"6px 12px",color:C.gold,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ Add work expense</button>
      </div>
      <div className="card gcard" style={{padding:"20px",marginBottom:12}}>
        <p style={{fontSize:10,color:"rgba(240,180,41,.55)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Estimated refund from SARS</p>
        <div style={{fontFamily:"'Sora'",fontSize:48,fontWeight:800,color:C.gold,lineHeight:1,textShadow:"0 0 40px rgba(240,180,41,.25)"}}><AnimNum val={cheque}/></div>
        <p style={{fontSize:12,color:C.muted,marginTop:6,marginBottom:14}}>from {fmtR(workTotal)} in work deductions · {Math.round(marginalRate*100)}% marginal rate</p>
        <Bar pct={taxYearPct()} color={`linear-gradient(90deg,${C.gold},#D4900A)`}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          <span style={{fontSize:10,color:C.muted}}>Tax year {taxYearPct()}% done</span>
          <span style={{fontSize:10,color:C.muted}}>{daysLeft()} days · 28 Feb</span>
        </div>
      </div>
      <div className="card" style={{padding:"13px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:12,fontWeight:600}}>This month</span>
          <span style={{fontFamily:"'Sora'",fontSize:13,fontWeight:700,color:C.gold}}>{fmtR(Math.round(thisMTotal*marginalRate))} earned</span>
        </div>
        <p style={{fontSize:11,color:C.muted}}>{fmtR(thisMTotal)} in expenses · {thisM.length} items logged</p>
      </div>
      {Object.keys(byCat).length>0&&(
        <>
          <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>By category</p>
          <div className="card" style={{padding:0,marginBottom:12}}>
            {Object.entries(byCat).map(([k,amt],j,arr)=>{
              const cat=TAX_CATS[k]||{name:k,icon:"📦"};
              return (
                <div key={k} className="row" style={{borderBottom:j<arr.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>{cat.icon}</span>
                  <div style={{flex:1}}><p style={{fontSize:13}}>{cat.name}</p><p style={{fontSize:10,color:C.muted}}>{fmtR(amt)}</p></div>
                  <span style={{fontFamily:"'Sora'",fontSize:12,fontWeight:700,color:C.gold}}>+{fmtR(Math.round(amt*marginalRate))}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      {dreams.length>0&&(
        <>
          <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Your 13th Cheque could cover...</p>
          <div className="card" style={{padding:0,marginBottom:12}}>
            {dreams.map((d,j)=>(
              <div key={d.label} className="row" style={{borderBottom:j<dreams.length-1?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:22}}>{d.icon}</span>
                <span style={{flex:1,marginLeft:4,fontSize:13,color:C.muted}}>{d.label}</span>
                <span style={{fontSize:11,color:C.green,fontWeight:600}}>{fmtR(d.cost)}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{background:"rgba(240,180,41,.04)",border:`1px solid rgba(240,180,41,.1)`,borderRadius:12,padding:"11px 13px",marginBottom:14}}>
        <p style={{fontSize:12,color:"rgba(240,180,41,.65)",lineHeight:1.6}}>💡 Every extra R100 you claim adds <strong style={{color:C.gold}}>R{Math.round(marginalRate*100)}</strong> to your 13th Cheque. What work expenses haven't you logged yet?</p>
      </div>
      {workExp.length===0&&<Tjommie msg="Nothing logged yet. Start with your phone contract — it's usually the biggest deduction most people miss."/>}
    </div>
  );
}

function S_Add({data,update,go,back,defaultType}) {
  const [type,setType]=useState(defaultType||"personal");
  const [amount,setAmount]=useState("");
  const [merchant,setMerchant]=useState("");
  const [date,setDate]=useState(todayStr());
  const [taxCat,setTaxCat]=useState("other_work");
  const [budCat,setBudCat]=useState("other");
  const [saved,setSaved]=useState(false);
  const {profile,taxCats,budget}=data;
  const annual=profile.income*12;
  const {marginalRate}=calcTax(annual);
  const chequeAdd=type==="work"?Math.round((Number(amount)||0)*marginalRate):0;
  const enabledCats=Object.entries(taxCats||{}).filter(([,v])=>v).map(([k])=>k);
  const handleSave=()=>{
    update(d=>({...d,expenses:[...d.expenses,{id:uid(),amount:Number(amount)||0,merchant:merchant||(type==="work"?TAX_CATS[taxCat]?.name:budCat),date,type,taxCategory:type==="work"?taxCat:null,budgetCategory:type==="personal"?budCat:null,createdAt:Date.now()}]}));
    setSaved(true);
  };
  if(saved) return (
    <div className="scroll" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:12,animation:"pop .4s ease-out"}}>✅</div>
      <h2 style={{fontFamily:"'Sora'",fontSize:22,fontWeight:700,marginBottom:10}}>Logged!</h2>
      {type==="work"&&chequeAdd>0&&(
        <div className="card gcard fade" style={{padding:"16px",marginBottom:20,width:"100%"}}>
          <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Added to your 13th Cheque</p>
          <p style={{fontFamily:"'Sora'",fontSize:32,fontWeight:800,color:C.gold}}>+{fmtR(chequeAdd)}</p>
          <p style={{fontSize:11,color:C.muted,marginTop:4}}>from {fmtR(Number(amount))} in work expenses</p>
        </div>
      )}
      {type==="personal"&&<p style={{color:C.muted,fontSize:13,marginBottom:24}}>{fmtR(Number(amount)||0)} logged against your {budCat} budget.</p>}
      <div style={{display:"flex",gap:10,width:"100%"}}>
        <button className="btn btnS" onClick={()=>{setSaved(false);setAmount("");setMerchant("");}} style={{flex:1,marginTop:0}}>Add another</button>
        <button className="btn btnG" onClick={()=>go("home")} style={{flex:1,marginTop:0}}>Done</button>
      </div>
    </div>
  );
  return (
    <div className="scroll fade">
      <TopBar title="Add Expense" back={back}/>
      <div className="p" style={{paddingTop:4}}>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[{id:"work",label:"⚡ Work",sub:"Builds 13th Cheque"},{id:"personal",label:"💳 Personal",sub:"Tracks budget"}].map(t=>(
            <div key={t.id} onClick={()=>setType(t.id)}
              style={{flex:1,padding:"11px",borderRadius:13,border:`1px solid ${type===t.id?(t.id==="work"?"rgba(240,180,41,.38)":"rgba(16,185,129,.28)"):C.border}`,background:type===t.id?(t.id==="work"?C.goldDim:C.greenDim):"transparent",cursor:"pointer",textAlign:"center",transition:"all .18s"}}>
              <p style={{fontWeight:600,fontSize:13,color:type===t.id?(t.id==="work"?C.gold:C.green):C.muted}}>{t.label}</p>
              <p style={{fontSize:10,color:C.faint,marginTop:2}}>{t.sub}</p>
            </div>
          ))}
        </div>
        <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Amount</label>
        <div style={{position:"relative",marginBottom:type==="work"&&Number(amount)>0?4:12}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:14}}>R</span>
          <input className="inp" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={{paddingLeft:30}}/>
        </div>
        {type==="work"&&Number(amount)>0&&<p style={{fontSize:11,color:C.gold,marginBottom:12}}>⚡ Adds {fmtR(chequeAdd)} to your 13th Cheque</p>}
        <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Description</label>
        <input className="inp" value={merchant} onChange={e=>setMerchant(e.target.value)} placeholder="Merchant or description" style={{marginBottom:12}}/>
        <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Date</label>
        <input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)} style={{marginBottom:12}}/>
        <label style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",display:"block",marginBottom:6}}>Category</label>
        {type==="work"?(
          <select className="inp" value={taxCat} onChange={e=>setTaxCat(e.target.value)} style={{marginBottom:18}}>
            {(enabledCats.length>0?enabledCats:Object.keys(TAX_CATS)).map(k=>(
              <option key={k} value={k}>{TAX_CATS[k]?.icon} {TAX_CATS[k]?.name||k}</option>
            ))}
          </select>
        ):(
          <select className="inp" value={budCat} onChange={e=>setBudCat(e.target.value)} style={{marginBottom:18}}>
            {budget.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        )}
        <button className="btn btnG" onClick={handleSave} style={{opacity:amount&&Number(amount)>0?1:.4}}>Save expense</button>
      </div>
    </div>
  );
}

function S_Spending({data,go}) {
  const {profile,expenses,budget}=data;
  const annual=profile.income*12;
  const {tax}=calcTax(annual);
  const mTax=Math.round(tax/12);
  const living=profile.income-mTax;
  const thisM=expenses.filter(e=>e.date.slice(0,7)===thisMonthStr());
  const personalSpent=thisM.filter(e=>e.type==="personal").reduce((s,e)=>s+e.amount,0);
  const workSpent=thisM.filter(e=>e.type==="work").reduce((s,e)=>s+e.amount,0);
  const remaining=living-personalSpent;
  const savGoal=profile.savingsGoal||0;
  const getSpent=id=>thisM.filter(e=>e.type==="personal"&&e.budgetCategory===id).reduce((s,e)=>s+e.amount,0);
  return (
    <div className="scroll p">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontFamily:"'Sora'",fontSize:20,fontWeight:700}}>My Spending</h2>
        <span style={{fontSize:11,color:C.muted,background:"rgba(255,255,255,.05)",padding:"4px 10px",borderRadius:100,border:`1px solid ${C.border}`}}>{new Date().toLocaleString("en-ZA",{month:"short",year:"numeric"})}</span>
      </div>
      <div className="card" style={{padding:"14px",marginBottom:12}}>
        <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Money flow this month</p>
        {[
          {label:"Gross income",        amt:profile.income,   c:C.green},
          {label:"Tax (PAYE estimate)", amt:-mTax,            c:C.red},
          {label:"Work expenses",       amt:-workSpent,       c:C.gold},
          {label:"Living money",        amt:living-workSpent, c:C.purple},
          {label:"Spent so far",        amt:-personalSpent,   c:"#F59E0B"},
          {label:"Remaining",           amt:remaining,        c:remaining<0?C.red:C.green},
        ].map(r=>(
          <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,color:C.muted}}>{r.label}</span>
            <span style={{fontSize:12,fontWeight:600,color:r.c,fontFamily:"'Sora'"}}>{r.amt<0?`-${fmtR(-r.amt)}`:fmtR(r.amt)}</span>
          </div>
        ))}
      </div>
      {savGoal>0&&(
        <div className="card fade" style={{padding:"13px",marginBottom:12,border:"1px solid rgba(129,140,248,.2)",background:"rgba(99,102,241,.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <p style={{fontSize:12,fontWeight:600,color:C.purple}}>Savings goal</p>
            <span style={{fontSize:12,fontFamily:"'Sora'",fontWeight:700,color:C.purple}}>{fmtR(savGoal)}/month</span>
          </div>
          <Bar pct={Math.max(0,remaining/savGoal*100)} color={C.purple}/>
          <p style={{fontSize:11,color:C.muted,marginTop:6}}>{remaining>=savGoal?"✅ On track!":remaining>0?`${fmtR(remaining)} available — save ${fmtR(savGoal-remaining)} more to hit goal`:`Over budget by ${fmtR(-remaining)}`}</p>
        </div>
      )}
      <p style={{fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Budget</p>
      <div className="card" style={{padding:0,marginBottom:14}}>
        {budget.map((c,j)=>{
          const spent=getSpent(c.id);
          const pct=c.limit>0?Math.min(100,Math.round(spent/c.limit*100)):0;
          const over=spent>c.limit;
          return (
            <div key={c.id} style={{padding:"11px 14px",borderBottom:j<budget.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:13,display:"flex",alignItems:"center",gap:7}}><span>{c.icon}</span>{c.name}</span>
                <span style={{fontSize:11,fontFamily:"'Sora'",fontWeight:600,color:over?C.red:pct>80?"#F59E0B":C.muted}}>{fmtR(spent)}/{fmtR(c.limit)}</span>
              </div>
              <Bar pct={pct} color={over?C.red:pct>80?"#F59E0B":C.purple}/>
              {over&&<p style={{fontSize:10,color:C.red,marginTop:3}}>{fmtR(spent-c.limit)} over budget</p>}
            </div>
          );
        })}
      </div>
      {thisM.filter(e=>e.type==="personal").length===0&&(
        <Tjommie msg="No personal expenses this month yet. Log your everyday spending to see where your money goes." onTap={()=>go("add","personal")}/>
      )}
    </div>
  );
}

function S_Tjommie({data,back}) {
  const {profile,expenses,taxCats,budget}=data;
  const annual=profile.income*12;
  const {tax,marginalRate}=calcTax(annual);
  const workTotal=expenses.filter(e=>e.type==="work").reduce((s,e)=>s+e.amount,0);
  const cheque=Math.round(workTotal*marginalRate);
  const enabledNames=Object.entries(taxCats||{}).filter(([,v])=>v).map(([k])=>TAX_CATS[k]?.name).filter(Boolean);
  const sysPrompt=`You are Tjommie, a warm South African financial assistant inside "The 13th Cheque" app. Speak like a knowledgeable friend — direct, warm, plain South African English. No corporate speak. Keep answers short (mobile screen). Always be specific to the user's real numbers.

User details:
- Name: ${profile.name}, Occupation: ${profile.occupation}
- Employment type: ${profile.employmentType}
- Monthly income: R${profile.income} (annual: R${annual})
- Monthly tax: ~R${Math.round(tax/12)}, Marginal rate: ${Math.round(marginalRate*100)}%
- Tracked deduction categories: ${enabledNames.join(", ")||"none yet"}
- Total work expenses logged: R${workTotal}
- Estimated 13th Cheque: R${cheque}
- Tax year: ${daysLeft()} days until 28 Feb deadline

SARS 2025/26 key facts (verified):
- Primary rebate: R17,235; Tax threshold: R95,750
- Brackets: 18%→R237,100 / 26%→R370,500 / 31%→R512,800 / 36%→R673,000 / 39%→R857,900 / 41%→R1,817,000 / 45%+
- Salaried employees: Section 23(m) limits claims — no phone/internet, no stationery (employer must provide)
- Freelancers: Section 11(a) — broad deduction rights
- Home office: must be EXCLUSIVE work use, dedicated room only
- Equipment <R7k: full deduction; >R7k: depreciate over 3 years
- RA contributions: up to 27.5% of income, max R350k/year — huge deduction
- Never guarantee a refund — always say "estimate". Recommend a tax practitioner for complex situations.`;
  const [msgs,setMsgs]=useState([{r:"a",t:`Hey ${profile.name}! I know your numbers — ${fmtR(cheque)} estimated so far, ${daysLeft()} days left. What do you want to know?`}]);
  const [inp,setInp]=useState("");
  const [loading,setLoading]=useState(false);
  const end=useRef(null);
  useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const quick=[`How do I claim more?`,`Am I on track?`,`What's my marginal rate?`,`What can a ${profile.employmentType||"freelancer"} claim?`];
  const send=async(text)=>{
    const q=text||inp; if(!q.trim()||loading)return;
    setInp(""); setMsgs(m=>[...m,{r:"u",t:q}]); setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:350,system:sysPrompt,messages:[...msgs.filter(m=>m.r==="u"||m.r==="a").slice(-6).map(m=>({role:m.r==="u"?"user":"assistant",content:m.t})),{role:"user",content:q}]})});
      const d=await res.json();
      setMsgs(m=>[...m,{r:"a",t:d.content?.[0]?.text||"Ag, something went wrong. Try again?"}]);
    }catch(e){setMsgs(m=>[...m,{r:"a",t:"Connection problem — try again in a sec."}]);}
    setLoading(false);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <TopBar title="Tjommie" back={back}/>
      <div className="scroll" style={{padding:"6px 14px",flex:1}}>
        {msgs.length===1&&(
          <div style={{marginBottom:14}}>
            <p style={{fontSize:10,color:C.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Quick questions</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {quick.map(q=><button key={q} onClick={()=>send(q)} style={{background:C.goldDim,border:`1px solid rgba(240,180,41,.18)`,borderRadius:100,padding:"5px 11px",fontSize:11,color:C.gold,cursor:"pointer",fontFamily:"'DM Sans'"}}>{q}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{marginBottom:10,display:"flex",flexDirection:"column",alignItems:m.r==="u"?"flex-end":"flex-start"}}>
            {m.r==="a"&&(
              <div style={{display:"flex",gap:7,alignItems:"flex-start",maxWidth:"88%"}}>
                <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${C.gold},#C98000)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#000",flexShrink:0}}>T</div>
                <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:"4px 13px 13px 13px",padding:"9px 12px"}}><p style={{fontSize:13,lineHeight:1.6}}>{m.t}</p></div>
              </div>
            )}
            {m.r==="u"&&<div style={{background:C.goldDim,border:`1px solid rgba(240,180,41,.18)`,borderRadius:"13px 4px 13px 13px",padding:"9px 12px",maxWidth:"88%"}}><p style={{fontSize:13,color:C.gold,lineHeight:1.5}}>{m.t}</p></div>}
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:10}}>
            <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${C.gold},#C98000)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#000",flexShrink:0}}>T</div>
            <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:"4px 13px 13px 13px",padding:"10px 13px",display:"flex",gap:4}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,animation:`dot 1.2s ${i*.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={end}/>
      </div>
      <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,background:C.bg2}}>
        <input className="inp" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask Tjommie anything..." style={{flex:1,borderRadius:100,padding:"9px 15px",fontSize:13}}/>
        <button onClick={()=>send()} disabled={loading||!inp.trim()} style={{width:40,height:40,borderRadius:"50%",background:inp.trim()?`linear-gradient(135deg,${C.gold},#C98000)`:"rgba(255,255,255,.05)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:inp.trim()?"#000":C.faint,flexShrink:0,transition:"all .18s"}}>
          {I.send(15)}
        </button>
      </div>
    </div>
  );
}

function S_Settings({data,update,back}) {
  const {profile,expenses}=data;
  const [reset,setReset]=useState(false);
  const doReset=()=>{ localStorage.removeItem(STORE_KEY); update({...BLANK}); };
  return (
    <div className="scroll">
      <TopBar title="Settings" back={back}/>
      <div className="p" style={{paddingTop:4}}>
        <div className="card" style={{padding:0,marginBottom:14}}>
          {[
            {l:"Name",              v:profile.name||"—"},
            {l:"Occupation",        v:profile.occupation||"—"},
            {l:"Monthly income",    v:fmtR(profile.income)},
            {l:"Employment type",   v:profile.employmentType||"—"},
            {l:"Marginal tax rate", v:`${Math.round(getMarginal(profile.income*12)*100)}%`},
            {l:"Savings goal",      v:`${fmtR(profile.savingsGoal||0)}/month`},
            {l:"Expenses logged",   v:String(expenses.length)},
          ].map((r,j,arr)=>(
            <div key={r.l} className="row" style={{borderBottom:j<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:13,color:C.muted,flex:1}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:600}}>{r.v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:"13px",marginBottom:18}}>
          <p style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
            <strong style={{color:C.text}}>The 13th Cheque</strong> provides estimates for guidance only and does not constitute professional tax advice. Consult a registered SARS tax practitioner for your specific situation.
          </p>
          <p style={{fontSize:11,color:C.faint,marginTop:8}}>SARS 2025/26 · Last verified Feb 2026</p>
        </div>
        {!reset
          ?<button className="btn btnS" onClick={()=>setReset(true)} style={{color:"rgba(239,68,68,.5)",borderColor:"rgba(239,68,68,.14)"}}>Reset all data</button>
          :<div style={{background:"rgba(239,68,68,.05)",border:`1px solid rgba(239,68,68,.14)`,borderRadius:13,padding:14}}>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(239,68,68,.7)",marginBottom:4}}>Are you sure?</p>
            <p style={{fontSize:12,color:C.muted,marginBottom:12}}>Deletes everything. Can't be undone.</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={doReset} style={{flex:1,padding:11,border:"none",borderRadius:10,background:"rgba(239,68,68,.15)",color:C.red,fontFamily:"'Sora'",fontSize:13,fontWeight:700,cursor:"pointer"}}>Yes, reset</button>
              <button onClick={()=>setReset(false)} className="btn btnS" style={{flex:1,marginTop:0}}>Cancel</button>
            </div>
          </div>}
      </div>
    </div>
  );
}

function S_History({data,update,back}) {
  const {expenses}=data;
  const [f,setF]=useState("all");
  const sorted=[...expenses].sort((a,b)=>b.date.localeCompare(a.date)).filter(e=>f==="all"||e.type===f);
  const del=id=>update(d=>({...d,expenses:d.expenses.filter(e=>e.id!==id)}));
  return (
    <div className="scroll">
      <TopBar title="All Expenses" back={back}/>
      <div className="p" style={{paddingTop:4}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["all","All"],["work","Work ⚡"],["personal","Personal 💳"]].map(([v,l])=>(
            <button key={v} onClick={()=>setF(v)} style={{flex:1,padding:"7px",borderRadius:10,border:`1px solid ${f===v?"rgba(240,180,41,.28)":C.border}`,background:f===v?C.goldDim:"transparent",color:f===v?C.gold:C.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {sorted.length===0?<p style={{textAlign:"center",padding:"40px 0",color:C.muted,fontSize:14}}>No expenses here yet.</p>:(
          <div className="card" style={{padding:0}}>
            {sorted.map((e,j)=>(
              <div key={e.id} className="row" style={{borderBottom:j<sorted.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:32,height:32,borderRadius:9,background:e.type==="work"?C.goldDim:C.greenDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{e.type==="work"?"⚡":"💳"}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:500}}>{e.merchant||"Expense"}</p>
                  <p style={{fontSize:10,color:C.muted}}>{e.date}</p>
                </div>
                <span style={{fontFamily:"'Sora'",fontSize:13,fontWeight:600,color:e.type==="work"?C.gold:C.text,marginRight:8}}>{fmtR(e.amount)}</span>
                <button onClick={()=>del(e.id)} style={{background:"none",border:"none",color:"rgba(239,68,68,.4)",cursor:"pointer",padding:4}}>{I.trash(14)}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  // Load data synchronously
  const initial=loadData()||BLANK;
  const [data,setData]=useState(initial);
  const [screen,setScreen]=useState(initial.setupDone?"home":"setup");
  const [navStack,setNavStack]=useState([]);
  const [addType,setAddType]=useState("personal");

  // Setup flow
  const [step,setStep]=useState("lang");
  const [empType,setEmpType]=useState("");
  const [tempProfile,setTempProfile]=useState({});
  const [tempTaxCats,setTempTaxCats]=useState({});

  const update=useCallback(fn=>{
    setData(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      saveData(next);
      return next;
    });
  },[]);

  const go=(s,ctx)=>{
    if(s==="add") setAddType(ctx||"personal");
    setNavStack(h=>[...h,screen]);
    setScreen(s);
  };
  const back=()=>{
    if(navStack.length){ setScreen(navStack[navStack.length-1]); setNavStack(h=>h.slice(0,-1)); }
  };

  const finishSetup=(savGoal,budgetCats)=>{
    const d={
      profile:{...tempProfile,employmentType:empType,savingsGoal:savGoal},
      taxCats:tempTaxCats,
      budget:budgetCats,
      expenses:[],
      setupDone:true,
    };
    saveData(d);
    setData(d);
    setScreen("ready");
  };

  const NAV=!["setup","ready","add","settings","history","tjommie"].includes(screen);
  const TAB={home:"home",cheque:"cheque",spending:"spending"}[screen]||null;

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#030810"}}>
      <style>{CSS}</style>
      <div className="shell" style={{display:"flex",flexDirection:"column"}}>
        <div className="notch"/>
        <SBar/>

        {/* SETUP FLOW */}
        {screen==="setup"&&(
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {step==="lang"      &&<S_Lang    next={()=>setStep("promise")}/>}
            {step==="promise"   &&<S_Promise next={()=>setStep("emptype")}/>}
            {step==="emptype"   &&<S_EmpType next={et=>{setEmpType(et);setStep("money");}}/>}
            {step==="money"     &&<S_Money   empType={empType} next={p=>{setTempProfile(p);setStep("deductions");}}/>}
            {step==="deductions"&&<S_Deductions empType={empType} next={c=>{setTempTaxCats(c);setStep("budget");}}/>}
            {step==="budget"    &&<S_Budget  profile={{...tempProfile,employmentType:empType}} next={finishSetup}/>}
          </div>
        )}

        {/* READY SCREEN */}
        {screen==="ready"&&(
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <S_Ready profile={{...tempProfile,employmentType:empType}} taxCats={tempTaxCats}
              onDone={()=>{setScreen("home");setNavStack([]);}}/>
          </div>
        )}

        {/* MAIN APP */}
        {screen!=="setup"&&screen!=="ready"&&(
          <>
            <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              {screen==="home"     &&<S_Home     data={data} go={go}/>}
              {screen==="cheque"   &&<S_Cheque   data={data} go={go}/>}
              {screen==="spending" &&<S_Spending data={data} go={go}/>}
              {screen==="add"      &&<S_Add      data={data} update={update} go={go} back={back} defaultType={addType}/>}
              {screen==="tjommie"  &&<S_Tjommie  data={data} back={back}/>}
              {screen==="settings" &&<S_Settings data={data} update={update} back={back}/>}
              {screen==="history"  &&<S_History  data={data} update={update} back={back}/>}
            </div>
            {NAV&&(
              <div className="nav">
                <button className={`nb ${TAB==="home"?"on":""}`}    onClick={()=>go("home")}>  {I.home(20)}<span>Home</span></button>
                <button className={`nb ${TAB==="cheque"?"on":""}`}  onClick={()=>go("cheque")}>{I.zap(20)}<span>13th</span></button>
                <button onClick={()=>go("add")} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><div className="fab">{I.plus(22)}</div></button>
                <button className={`nb ${TAB==="spending"?"on":""}`}onClick={()=>go("spending")}>{I.pie(20)}<span>Spending</span></button>
                <button className="nb"                               onClick={()=>go("tjommie")}>{I.chat(20)}<span>Tjommie</span></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
