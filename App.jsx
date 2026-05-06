import { useState, useEffect, useRef } from "react";

// ---- FIREBASE CONFIG ----
const FB_CFG = {
  apiKey: "AIzaSyDXTzEBteKCXYNMaAoU2KRxvX5ZxgKHqd0",
  authDomain: "test-911-c0009.firebaseapp.com",
  databaseURL: "https://test-911-c0009-default-rtdb.firebaseio.com",
  projectId: "test-911-c0009",
  storageBucket: "test-911-c0009.firebasestorage.app",
  messagingSenderId: "870900239049",
  appId: "1:870900239049:web:d163397051ae12e44a9b18"
};

const LOANS = ["CL","MTK","AEON","X","BANK","CARSOME"];

// ---- SEED DATA (used immediately, no waiting) ----
const INIT_STAFF = [
  { id:"S001", name:"Ahmad Faizal",  baseSalary:1800, role:"salesperson", username:"ahmad",  password:"1234" },
  { id:"S002", name:"Lim Wei Xian",  baseSalary:1800, role:"salesperson", username:"lim",    password:"1234" },
  { id:"S003", name:"Priya Nair",    baseSalary:1800, role:"salesperson", username:"priya",  password:"1234" },
  { id:"ADMIN",name:"Admin Boss",    baseSalary:0,    role:"admin",       username:"admin",  password:"admin123" }
];

const INIT_SALES = [
  { id:"r1",  plate:"WXY 1234", year:2019, make:"Toyota Vios",   salePrice:48000,  costPrice:38000,  repairCost:500,  txType:"cash",  loanChannel:"",       staffId:"S001", date:"2024-05-03", status:"sold" },
  { id:"r2",  plate:"VKL 5678", year:2020, make:"Honda City",    salePrice:62000,  costPrice:51000,  repairCost:800,  txType:"loan",  loanChannel:"CL",     staffId:"S002", date:"2024-05-07", status:"sold" },
  { id:"r3",  plate:"BNM 9012", year:2018, make:"Perodua Myvi",  salePrice:28500,  costPrice:22000,  repairCost:300,  txType:"loan",  loanChannel:"AEON",   staffId:"S001", date:"2024-05-10", status:"sold" },
  { id:"r4",  plate:"JHB 3456", year:2021, make:"Proton X50",    salePrice:75000,  costPrice:61000,  repairCost:1200, txType:"loan",  loanChannel:"MTK",    staffId:"S003", date:"2024-05-12", status:"sold" },
  { id:"r5",  plate:"PJY 7890", year:2017, make:"Mazda 3",       salePrice:55000,  costPrice:44000,  repairCost:700,  txType:"trade", loanChannel:"",       staffId:"S002", date:"2024-05-15", status:"sold" },
  { id:"r6",  plate:"SGR 1122", year:2022, make:"BMW 320i",      salePrice:185000, costPrice:162000, repairCost:2000, txType:"loan",  loanChannel:"BANK",   staffId:"S001", date:"2024-05-18", status:"sold" },
  { id:"r7",  plate:"KLM 3344", year:2019, make:"Perodua Bezza", salePrice:32000,  costPrice:25000,  repairCost:400,  txType:"cash",  loanChannel:"",       staffId:"S003", date:"2024-05-20", status:"sold" },
  { id:"r8",  plate:"MLK 5566", year:2020, make:"Honda HR-V",    salePrice:88000,  costPrice:73000,  repairCost:1500, txType:"loan",  loanChannel:"CARSOME",staffId:"S002", date:"2024-05-22", status:"sold" },
  { id:"r9",  plate:"TRG 7788", year:2016, make:"Toyota Hilux",  salePrice:72000,  costPrice:60000,  repairCost:900,  txType:"loan",  loanChannel:"X",      staffId:"S001", date:"2024-05-25", status:"pending" },
  { id:"r10", plate:"KDH 9900", year:2023, make:"Proton Saga",   salePrice:38000,  costPrice:30000,  repairCost:200,  txType:"trade", loanChannel:"",       staffId:"S003", date:"2024-05-28", status:"sold" }
];

// ---- CALC ----
function calcProfit(s) {
  const sp = Number(s.salePrice)||0, cp = Number(s.costPrice)||0, rc = Number(s.repairCost)||0;
  if (s.txType === "trade") { const n = sp-cp-rc; return { net:n, misc:0, fee:0, staff:0, co:n }; }
  const fee = s.txType === "cash" ? 1000 : 1600;
  const n = sp-cp-rc-100-fee;
  return { net:n, misc:100, fee, staff:n*0.7, co:n*0.3 };
}

function rm(n) { return "RM " + Number(n).toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}); }

const AC = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
const aclr = n => AC[(n||"A").charCodeAt(0) % AC.length];

// ---- LANG ----
const EN = { title:"AutoPay Pro", sub:"Car Dealership Payroll", hi:"Welcome back", desc:"Sign in to your account", uname:"Username", pw:"Password", signin:"Sign In", fail:"Invalid credentials", logout:"Logout", sport:"Staff Portal (Read-only)", aport:"Admin Panel", dash:"Dashboard", sales:"Sales", staff:"Staff", rep:"Reports", tveh:"Vehicles Sold", trev:"Total Revenue", tnet:"Net Profit", team:"Staff Earnings", psum:"Payroll Summary", plate:"Plate", yr:"Year", mk:"Make/Model", sp:"Sale Price", cp:"Cost Price", rc:"Repair Cost", tx:"Type", lc:"Loan", mf:"Misc", hf:"Fee", np:"Net Profit", ss:"Staff 70%", co:"Co 30%", slp:"Salesperson", dt:"Date", sts:"Status", act:"Actions", addsale:"New Sale", editsale:"Edit Sale", save:"Save", cancel:"Cancel", fname:"Full Name", sid:"Staff ID", bsal:"Allowance", totale:"Total Earnings", addst:"Add Staff", editst:"Edit Staff", adm:"Administrator", rol:"Sales Staff", sold:"Sold", pend:"Pending", cash:"Cash", loan:"Loan", trade:"Trade-In", all:"All Staff", norec:"No records", delmsg:"This cannot be undone.", deltitle:"Delete?", yes:"Delete", no:"Cancel", exp:"Export", earn:"Earnings", bsal2:"Allowance", comm:"Commission", pbk:"Profit Breakdown", tnote:"Trade-in: Company 100%, no fees", live:"Live", offline:"Offline", fees:"Fee Rules", retail:"Retail", trades:"Trade-ins", rev:"Revenue", company:"Company", lbk:"Loan Breakdown", delerr:"Cannot delete: staff has sales records.", saving:"Saving..." };
const ZH = { title:"AutoPay Pro", sub:"二手车行薪资系统", hi:"欢迎回来", desc:"请登录您的账户", uname:"用户名", pw:"密码", signin:"登录", fail:"用户名或密码错误", logout:"登出", sport:"员工页面（只读）", aport:"管理后台", dash:"仪表盘", sales:"销售", staff:"员工", rep:"报表", tveh:"已售车辆", trev:"总成交额", tnet:"净利润", team:"员工总收入", psum:"薪资汇总", plate:"车牌", yr:"年份", mk:"品牌/型号", sp:"成交价", cp:"本钱", rc:"维修费", tx:"类型", lc:"贷款渠道", mf:"杂费", hf:"手续费", np:"净利润", ss:"员工70%", co:"公司30%", slp:"销售员", dt:"日期", sts:"状态", act:"操作", addsale:"新增", editsale:"编辑", save:"保存", cancel:"取消", fname:"姓名", sid:"员工编号", bsal:"Allowance", totale:"总收入", addst:"添加员工", editst:"编辑员工", adm:"管理员", rol:"销售员工", sold:"已售", pend:"待定", cash:"现金", loan:"贷款", trade:"割车", all:"全部", norec:"没有记录", delmsg:"此操作无法撤销。", deltitle:"删除？", yes:"确认删除", no:"取消", exp:"导出", earn:"收入", bsal2:"Allowance", comm:"佣金", pbk:"利润明细", tnote:"割车：公司100%，不扣费用", live:"实时", offline:"离线", fees:"费用规则", retail:"零售", trades:"割车", rev:"成交额", company:"公司", lbk:"贷款渠道明细", delerr:"无法删除：该员工有销售记录。", saving:"保存中..." };

// ---- STYLES ----
const C = { bg:"#070b12", card:"rgba(255,255,255,0.04)", bdr:"rgba(255,255,255,0.07)", text:"#f1f5f9", t2:"#64748b", t3:"#334155", grn:"#34d399", amb:"#fbbf24", red:"#f87171", blu:"#38bdf8", ind:"#818cf8", pur:"#a78bfa" };
const iSt = { padding:"11px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:11, color:C.text, fontSize:14, outline:"none", width:"100%", fontFamily:"inherit" };
const sSt = { ...iSt, cursor:"pointer" };
const bP = { display:"flex", alignItems:"center", gap:6, padding:"10px 18px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap" };
const bG = { display:"flex", alignItems:"center", gap:6, padding:"10px 18px", background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap" };
const TH = { padding:"11px 14px", textAlign:"left", fontSize:10.5, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"0.8px", background:"rgba(255,255,255,0.025)", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" };
const TD = { padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"middle" };

// ---- SMALL COMPONENTS ----
function Chip({ type, ch, t }) {
  const m = { cash:{ bg:"rgba(56,189,248,0.1)", c:"#38bdf8" }, loan:{ bg:"rgba(99,102,241,0.12)", c:C.ind }, trade:{ bg:"rgba(245,158,11,0.1)", c:C.amb } };
  const s = m[type] || m.cash;
  const lbl = type === "loan" ? (ch && ch.trim() ? ch : t.loan) : (t[type] || type);
  return <span style={{ background:s.bg, color:s.c, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{lbl}</span>;
}

function PR({ l, v, c, bold }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
      <span style={{ color:C.t2, fontSize:12 }}>{l}</span>
      <span style={{ fontFamily:"monospace", color:c||C.text, fontWeight:bold?800:600, fontSize:12 }}>{v}</span>
    </div>
  );
}

function ProfitTip({ s, t }) {
  const [on, setOn] = useState(false);
  const p = calcProfit(s);
  const iT = s.txType === "trade";
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ fontFamily:"monospace", fontWeight:800, fontSize:13, color:p.net>=0?C.grn:C.red }}>{rm(p.net)}</span>
      <button onMouseEnter={()=>setOn(true)} onMouseLeave={()=>setOn(false)} onClick={()=>setOn(v=>!v)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", color:C.t3, fontSize:10, padding:"1px 5px", borderRadius:4, lineHeight:1.5, fontFamily:"inherit" }}>i</button>
      {on && (
        <div style={{ position:"absolute", top:"100%", left:0, zIndex:999, marginTop:6, background:"#0d1421", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"14px 16px", minWidth:220, boxShadow:"0 12px 40px rgba(0,0,0,0.7)" }}>
          <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:9, paddingBottom:7, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>{t.pbk}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <PR l={t.sp} v={rm(s.salePrice)} c={C.text} />
            <PR l={"- "+t.cp} v={"-"+rm(s.costPrice)} c={C.red} />
            <PR l={"- "+t.rc} v={"-"+rm(s.repairCost)} c={C.red} />
            {!iT && <PR l="- Misc (RM100)" v={"-"+rm(p.misc)} c={C.red} />}
            {!iT && <PR l={"- Fee ("+(s.txType==="cash"?"RM1,000":"RM1,600")+")"} v={"-"+rm(p.fee)} c={C.red} />}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:4, paddingTop:6 }}>
              <PR l={t.np} v={rm(p.net)} c={p.net>=0?C.grn:C.red} bold />
            </div>
            {!iT && <PR l={t.ss} v={rm(p.staff)} c={C.amb} />}
            {!iT && <PR l={t.co} v={rm(p.co)} c={C.blu} />}
            {iT && <div style={{ color:C.amb, fontSize:11, marginTop:4 }}>{t.tnote}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Dlg({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)", padding:16 }} onClick={onClose}>
      <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 30px 80px rgba(0,0,0,0.7)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontWeight:800, fontSize:16, color:C.text }}>{title}</span>
          <button style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:C.t2, cursor:"pointer", padding:"5px 10px", borderRadius:9, fontSize:14, fontFamily:"inherit" }} onClick={onClose}>X</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  );
}

function Confirm({ open, title, msg, t, onYes, onNo }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#0d1117", border:"1px solid rgba(239,68,68,0.2)", borderRadius:20, maxWidth:360, width:"100%", padding:36, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div style={{ fontWeight:800, fontSize:18, color:C.text }}>! {title}</div>
        <div style={{ fontSize:14, color:C.t2, textAlign:"center", lineHeight:1.6 }}>{msg}</div>
        <div style={{ display:"flex", gap:10, width:"100%" }}>
          <button style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }} onClick={onYes}>{t.yes}</button>
          <button style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }} onClick={onNo}>{t.no}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { if (msg) { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); } }, [msg]);
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:"12px 18px", display:"flex", alignItems:"center", gap:10, zIndex:400, maxWidth:360 }}>
      <span style={{ color:C.red, fontWeight:700 }}>!</span>
      <span style={{ color:"#fca5a5", fontSize:13, fontWeight:500 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", marginLeft:"auto", fontFamily:"inherit", fontSize:14 }}>X</button>
    </div>
  );
}

function FL({ label, wide, children }) {
  return (
    <label style={{ display:"flex", flexDirection:"column", gap:6, fontSize:11, fontWeight:700, color:C.t2, textTransform:"uppercase", letterSpacing:"0.7px", gridColumn:wide?"1/-1":undefined }}>
      {label}{children}
    </label>
  );
}

function SaleForm({ initial, staffList, onSave, onClose, t, busy }) {
  const first = staffList.find(s => s.role !== "admin");
  const blank = { plate:"", year:new Date().getFullYear(), make:"", salePrice:"", costPrice:"", repairCost:"", txType:"cash", loanChannel:"CL", staffId:first?first.id:"", date:new Date().toISOString().slice(0,10), status:"sold" };
  const [f, setF] = useState(initial || blank);
  const up = (k,v) => setF(p=>({...p,[k]:v}));
  const pv = (f.salePrice && f.costPrice) ? calcProfit(f) : null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
      <FL label={t.plate}><input style={iSt} value={f.plate} onChange={e=>up("plate",e.target.value)} placeholder="e.g. WXY 1234" /></FL>
      <FL label={t.yr}><input style={iSt} type="number" value={f.year} onChange={e=>up("year",e.target.value)} /></FL>
      <FL label={t.mk} wide><input style={iSt} value={f.make} onChange={e=>up("make",e.target.value)} placeholder="e.g. Toyota Vios" /></FL>
      <FL label={t.sp+" (RM)"}><input style={iSt} type="number" value={f.salePrice} onChange={e=>up("salePrice",e.target.value)} placeholder="0.00" /></FL>
      <FL label={t.cp+" (RM)"}><input style={iSt} type="number" value={f.costPrice} onChange={e=>up("costPrice",e.target.value)} placeholder="0.00" /></FL>
      <FL label={t.rc+" (RM)"}><input style={iSt} type="number" value={f.repairCost} onChange={e=>up("repairCost",e.target.value)} placeholder="0.00" /></FL>
      <FL label={t.tx}><select style={sSt} value={f.txType} onChange={e=>up("txType",e.target.value)}><option value="cash">{t.cash}</option><option value="loan">{t.loan}</option><option value="trade">{t.trade}</option></select></FL>
      <FL label={t.lc}><select style={{...sSt, opacity:f.txType==="loan"?1:0.4}} disabled={f.txType!=="loan"} value={f.loanChannel||"CL"} onChange={e=>up("loanChannel",e.target.value)}>{LOANS.map(c=><option key={c} value={c}>{c}</option>)}</select></FL>
      <FL label={t.slp}><select style={sSt} value={f.staffId} onChange={e=>up("staffId",e.target.value)}>{staffList.filter(s=>s.role!=="admin").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></FL>
      <FL label={t.dt}><input style={iSt} type="date" value={f.date} onChange={e=>up("date",e.target.value)} /></FL>
      <FL label={t.sts}><select style={sSt} value={f.status} onChange={e=>up("status",e.target.value)}><option value="sold">{t.sold}</option><option value="pending">{t.pend}</option></select></FL>
      <div style={{ gridColumn:"1/-1" }} />
      {pv && (
        <div style={{ gridColumn:"1/-1", background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.18)", borderRadius:12, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:10 }}>{t.pbk}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" }}>
            <PR l={t.sp} v={rm(f.salePrice)} c={C.text} />
            <PR l={"- "+t.cp} v={"-"+rm(f.costPrice)} c={C.red} />
            <PR l={"- "+t.rc} v={"-"+rm(f.repairCost)} c={C.red} />
            {f.txType!=="trade" && <PR l="- Misc (RM100)" v={"-"+rm(pv.misc)} c={C.red} />}
            {f.txType!=="trade" && <PR l={"- Fee ("+(f.txType==="cash"?"RM1,000":"RM1,600")+")"} v={"-"+rm(pv.fee)} c={C.red} />}
            <div style={{ gridColumn:"1/-1", borderTop:"1px dashed rgba(255,255,255,0.08)", marginTop:4, paddingTop:6, display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.t2, fontWeight:700, fontSize:12 }}>{t.np}</span>
              <span style={{ fontFamily:"monospace", fontWeight:900, fontSize:14, color:pv.net>=0?C.grn:C.red }}>{rm(pv.net)}</span>
            </div>
            {f.txType!=="trade" && <PR l={t.ss} v={rm(pv.staff)} c={C.amb} />}
            {f.txType!=="trade" && <PR l={t.co} v={rm(pv.co)} c={C.blu} />}
            {f.txType==="trade" && <div style={{ gridColumn:"1/-1", color:C.amb, fontSize:11, marginTop:2 }}>{t.tnote}</div>}
          </div>
        </div>
      )}
      <div style={{ gridColumn:"1/-1", display:"flex", gap:10, marginTop:4 }}>
        <button style={{...bP, flex:1, justifyContent:"center", padding:"13px", opacity:busy?0.7:1}} onClick={()=>onSave(f)} disabled={busy}>{busy?t.saving:t.save}</button>
        <button style={{...bG, flex:1, justifyContent:"center", padding:"13px"}} onClick={onClose}>{t.cancel}</button>
      </div>
    </div>
  );
}

function StaffForm({ initial, onSave, onClose, t, busy }) {
  const blank = { name:"", username:"", password:"", baseSalary:1800, role:"salesperson" };
  const [f, setF] = useState(initial || blank);
  const up = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
      <FL label={t.fname} wide><input style={iSt} value={f.name} onChange={e=>up("name",e.target.value)} /></FL>
      <FL label={t.uname}><input style={iSt} value={f.username} onChange={e=>up("username",e.target.value)} /></FL>
      <FL label={t.pw}><input style={iSt} value={f.password} onChange={e=>up("password",e.target.value)} /></FL>
      <FL label={t.bsal+" (RM)"}><input style={iSt} type="number" value={f.baseSalary} onChange={e=>up("baseSalary",+e.target.value)} /></FL>
      <FL label={t.rol}><select style={sSt} value={f.role} onChange={e=>up("role",e.target.value)}><option value="salesperson">{t.rol}</option><option value="admin">{t.adm}</option></select></FL>
      <div style={{ gridColumn:"1/-1", display:"flex", gap:10, marginTop:4 }}>
        <button style={{...bP, flex:1, justifyContent:"center", padding:"13px", opacity:busy?0.7:1}} onClick={()=>onSave(f)} disabled={busy}>{busy?t.saving:t.save}</button>
        <button style={{...bG, flex:1, justifyContent:"center", padding:"13px"}} onClick={onClose}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ---- FIREBASE HOOK (background, non-blocking) ----
function useFirebase(staff, setStaff, sales, setSales) {
  const [db, setDb] = useState(null);
  const [online, setOnline] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    const load = src => new Promise((res,rej) => {
      if (document.querySelector('script[src="'+src+'"]')) { res(); return; }
      const el = document.createElement("script");
      el.src = src; el.onload = res; el.onerror = rej;
      document.head.appendChild(el);
    });

    load("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js")
      .then(()=>load("https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"))
      .then(()=>{
        let app;
        try {
          app = window.firebase.apps && window.firebase.apps.length
            ? window.firebase.app()
            : window.firebase.initializeApp(FB_CFG);
        } catch(e) { app = window.firebase.app(); }

        const database = window.firebase.database(app);
        setDb(database);

        database.ref(".info/connected").on("value", snap => setOnline(snap.val()===true));

        // Sync local data TO Firebase on first connect
        database.ref("staff").once("value", snap => {
          if (!snap.val() && !synced.current) {
            synced.current = true;
            INIT_STAFF.forEach(s => database.ref("staff/"+s.id).set(s));
          } else if (snap.val()) {
            // Update local state with Firebase data
            setStaff(Object.entries(snap.val()).map(([k,v])=>({...v, fbKey:k})));
          }
        });

        database.ref("sales").once("value", snap => {
          if (!snap.val() && !synced.current) {
            INIT_SALES.forEach(s => { const {id,...rest}=s; database.ref("sales").push(rest); });
          } else if (snap.val()) {
            setSales(Object.entries(snap.val()).map(([k,v])=>({...v, fbKey:k})));
          }
        });

        // Live listeners
        database.ref("staff").on("value", snap => {
          if (snap.val()) setStaff(Object.entries(snap.val()).map(([k,v])=>({...v, fbKey:k})));
        });
        database.ref("sales").on("value", snap => {
          if (snap.val()) setSales(Object.entries(snap.val()).map(([k,v])=>({...v, fbKey:k})));
        });
      })
      .catch(e => console.log("Firebase unavailable, using local data:", e));
  }, []);

  return { db, online };
}

// ---- MAIN APP ----
export default function App() {
  const [lang, setLang] = useState("en");
  const [uid, setUid] = useState(null);
  // Start with local data immediately - no waiting for Firebase
  const [staff, setStaff] = useState(INIT_STAFF);
  const [sales, setSales] = useState(INIT_SALES);
  const [page, setPage] = useState("dash");
  const [lf, setLf] = useState({ u:"", p:"" });
  const [lerr, setLerr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [eSale, setESale] = useState(null);
  const [eSt, setESt] = useState(null);
  const [addSale, setAddSale] = useState(false);
  const [addSt, setAddSt] = useState(false);
  const [cdel, setCdel] = useState(null);
  const [filt, setFilt] = useState("all");
  const [side, setSide] = useState(false);
  const [mob, setMob] = useState(false);
  const [tab, setTab] = useState(false);

  const { db, online } = useFirebase(staff, setStaff, sales, setSales);
  const t = lang === "zh" ? ZH : EN;
  const me = uid ? (staff.find(s=>s.id===uid)||null) : null;
  const isAdm = me && me.role === "admin";

  useEffect(() => {
    const chk = () => { setMob(window.innerWidth<640); setTab(window.innerWidth>=640&&window.innerWidth<1024); };
    chk(); window.addEventListener("resize",chk); return ()=>window.removeEventListener("resize",chk);
  }, []);

  // ---- AUTH ----
  const login = () => {
    const f = staff.find(s=>s.username===lf.u && s.password===lf.p);
    if (f) { setUid(f.id); setLerr(""); setPage("dash"); }
    else setLerr(t.fail);
  };

  const quickLogin = (u, p) => {
    const f = staff.find(s=>s.username===u && s.password===p);
    if (f) { setUid(f.id); setLerr(""); setPage("dash"); }
    else { setLf({u,p}); setLerr(t.fail); }
  };

  // ---- CRUD (local + Firebase) ----
  const genId = () => "L"+Date.now();

  const saveSale = d => {
    setBusy(true);
    if (d.fbKey) {
      // Edit
      setSales(prev => prev.map(s => (s.fbKey===d.fbKey||s.id===d.id) ? {...d} : s));
      if (db) { const {fbKey,...rest}=d; db.ref("sales/"+fbKey).update(rest).catch(e=>console.error(e)); }
    } else {
      // Add
      const newId = genId();
      const newSale = {...d, id:newId};
      setSales(prev => [...prev, newSale]);
      if (db) { const {id,...rest}=newSale; db.ref("sales").push({...rest, loanChannel:rest.loanChannel||""}).then(ref=>{ setSales(prev=>prev.map(s=>s.id===newId?{...s,fbKey:ref.key}:s)); }).catch(e=>console.error(e)); }
    }
    setBusy(false); setESale(null); setAddSale(false);
  };

  const delSale = key => {
    setSales(prev => prev.filter(s => s.fbKey!==key && s.id!==key));
    if (db) db.ref("sales/"+key).remove().catch(e=>console.error(e));
    setCdel(null);
  };

  const saveStaff = d => {
    setBusy(true);
    if (d.id && staff.find(s=>s.id===d.id)) {
      setStaff(prev => prev.map(s=>s.id===d.id?{...s,...d}:s));
      if (db) { const {fbKey,...rest}=d; db.ref("staff/"+d.id).update(rest).catch(e=>console.error(e)); }
    } else {
      const nid = "S"+String(Date.now()).slice(-4);
      const ns = {...d, id:nid};
      setStaff(prev => [...prev, ns]);
      if (db) { const {fbKey,...rest}=ns; db.ref("staff/"+nid).set(rest).catch(e=>console.error(e)); }
    }
    setBusy(false); setESt(null); setAddSt(false);
  };

  const tryDel = id => {
    if (sales.some(s=>s.staffId===id)) { setToast(t.delerr); return; }
    setCdel({type:"staff",id});
  };

  const delStaff = id => {
    setStaff(prev => prev.filter(s=>s.id!==id));
    if (db) db.ref("staff/"+id).remove().catch(e=>console.error(e));
    setCdel(null);
    if (id===uid) setUid(null);
  };

  const myS = isAdm ? sales : sales.filter(s=>s.staffId===uid);
  const shown = filt==="all" ? sales : sales.filter(s=>s.staffId===filt);
  const earn = sid => {
    const s = staff.find(x=>x.id===sid);
    const c = sales.filter(x=>x.staffId===sid&&x.status==="sold"&&x.txType!=="trade").reduce((a,x)=>a+Math.max(0,calcProfit(x).staff),0);
    return { base:s?s.baseSalary:0, comm:c, total:(s?s.baseSalary:0)+c };
  };

  const navs = [
    { k:"dash",  l:t.dash },
    { k:"sales", l:t.sales },
    ...(isAdm ? [{ k:"staff", l:t.staff },{ k:"rep", l:t.rep }] : [])
  ];
  const go = k => { setPage(k); setSide(false); };
  const SW = mob ? 0 : (tab ? 60 : 240);

  // ---- LOGIN PAGE ----
  if (!me) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", fontFamily:"'Plus Jakarta Sans','Noto Sans SC',system-ui,sans-serif" }}>
        {!mob && (
          <div style={{ flex:"0 0 44%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 52px" }}>
            <div style={{ fontSize:32, fontWeight:900, color:C.text, lineHeight:1.2, marginBottom:14, letterSpacing:"-1px" }}>{t.sub}</div>
            <div style={{ fontSize:14, color:C.t2, lineHeight:1.7, marginBottom:32 }}>Complete payroll and commission management with Firebase real-time sync.</div>
            <div style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:"16px 18px", fontSize:12, color:C.t2, lineHeight:2.1 }}>
              <div style={{ fontWeight:700, color:C.ind, marginBottom:6, fontSize:13 }}>{t.fees}</div>
              <div>Cash: RM100 misc + RM1,000 handling</div>
              <div>Loan (CL/MTK/AEON/X/BANK/CARSOME): RM100 + RM1,600</div>
              <div>Trade-in: No fees, 100% company</div>
              <div>Staff share: 70% of net profit</div>
            </div>
            <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:online?C.grn:"#475569" }} />
              <span style={{ color:online?C.grn:"#475569", fontWeight:600 }}>{online?"Firebase Connected":"Local Mode (Firebase connecting...)"}</span>
            </div>
          </div>
        )}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 22px" }}>
          <div style={{ width:"100%", maxWidth:420, background:"rgba(13,17,23,0.9)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:mob?26:40 }}>
            {mob && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <div style={{ fontWeight:900, fontSize:18, color:C.text }}>AutoPay Pro</div>
                <div style={{ fontSize:11, color:online?C.grn:"#475569", fontWeight:600 }}>{online?"Live":"Local"}</div>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color:C.text, marginBottom:5 }}>{t.hi}</div>
                <div style={{ fontSize:13, color:C.t2 }}>{t.desc}</div>
              </div>
              <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", border:"1px solid "+C.bdr, borderRadius:11, padding:3, gap:2 }}>
                {["en","zh"].map(l=>(
                  <button key={l} style={{ padding:"6px 13px", border:"none", borderRadius:8, background:lang===l?"linear-gradient(135deg,#6366f1,#8b5cf6)":"none", color:lang===l?"#fff":C.t3, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 }} onClick={()=>setLang(l)}>
                    {l==="en"?"EN":"ZH"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.t3, fontSize:13, fontWeight:600 }}>U</span>
                <input style={{...iSt, paddingLeft:44}} placeholder={t.uname} value={lf.u} onChange={e=>setLf({...lf,u:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} />
              </div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.t3, fontSize:13, fontWeight:600 }}>P</span>
                <input style={{...iSt, paddingLeft:44, paddingRight:52}} type={showPw?"text":"password"} placeholder={t.pw} value={lf.p} onChange={e=>setLf({...lf,p:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} />
                <button style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.t3, cursor:"pointer", fontSize:12, fontFamily:"inherit" }} onClick={()=>setShowPw(v=>!v)}>
                  {showPw?"Hide":"Show"}
                </button>
              </div>
              {lerr && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#f87171" }}>{lerr}</div>}
              <button style={{...bP, width:"100%", justifyContent:"center", padding:"14px", fontSize:15, marginTop:2}} onClick={login}>{t.signin}</button>
            </div>
            <div style={{ marginTop:20, padding:"14px 16px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>
              <div style={{ fontSize:10, color:C.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>Quick Login</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {[{u:"admin",p:"admin123",l:"Admin"},{u:"ahmad",p:"1234",l:"Ahmad"},{u:"lim",p:"1234",l:"Lim"},{u:"priya",p:"1234",l:"Priya"}].map(a=>(
                  <button key={a.u} style={{ padding:"5px 13px", borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:C.t2, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600 }} onClick={()=>quickLogin(a.u,a.p)}>
                    {a.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD ----
  const renderDash = () => {
    const active = (isAdm?sales:myS).filter(s=>s.status==="sold");
    const trev = active.reduce((a,s)=>a+Number(s.salePrice),0);
    const tnet = active.reduce((a,s)=>a+calcProfit(s).net,0);
    const tstf = active.filter(s=>s.txType!=="trade").reduce((a,s)=>a+Math.max(0,calcProfit(s).staff),0);
    const cards = isAdm ? [
      { l:t.tveh, v:active.length, c:"#6366f1", bg:"rgba(99,102,241,0.1)", mn:false },
      { l:t.trev, v:rm(trev), c:"#0ea5e9", bg:"rgba(14,165,233,0.1)", mn:true },
      { l:t.tnet, v:rm(tnet), c:"#10b981", bg:"rgba(16,185,129,0.1)", mn:true },
      { l:t.team, v:rm(tstf), c:"#f59e0b", bg:"rgba(245,158,11,0.1)", mn:true }
    ] : [
      { l:t.tveh, v:active.length, c:"#6366f1", bg:"rgba(99,102,241,0.1)", mn:false },
      { l:t.team, v:rm(tstf), c:"#f59e0b", bg:"rgba(245,158,11,0.1)", mn:true }
    ];
    return (
      <div>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:23, fontWeight:900, color:C.text, letterSpacing:"-0.5px", marginBottom:4 }}>{t.dash}</div>
          <div style={{ color:C.t2, fontSize:14 }}>{t.hi}, <strong style={{ color:"#94a3b8" }}>{me.name}</strong></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:13, marginBottom:24 }}>
          {cards.map((c,i)=>(
            <div key={i} style={{ background:C.card, border:"1px solid "+C.bdr, borderRadius:18, padding:"20px 18px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:90, height:90, borderRadius:"50%", background:"radial-gradient(circle,"+c.c+"30 0%,transparent 70%)", transform:"translate(18px,-18px)" }} />
              <div style={{ width:42, height:42, borderRadius:13, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", color:c.c, marginBottom:12, fontSize:18, fontWeight:800 }}>
                {["V","$","#","*"][i]}
              </div>
              <div style={{ fontSize:11, color:C.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{c.l}</div>
              <div style={{ fontSize:c.mn?17:32, fontWeight:900, color:C.text, fontFamily:c.mn?"monospace":"inherit" }}>{c.v}</div>
            </div>
          ))}
        </div>
        {isAdm && (
          <div style={{ background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:13, padding:"13px 17px", marginBottom:20, display:"flex", gap:14, flexWrap:"wrap", fontSize:12, color:C.t2 }}>
            <strong style={{ color:C.ind }}>{t.fees}:</strong>
            <span>Cash: +RM100 +RM1,000</span>
            <span>Loan: +RM100 +RM1,600</span>
            <span>Trade-in: No fees</span>
            <span>Staff 70% / Co 30%</span>
          </div>
        )}
        {isAdm && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:11 }}>{t.psum}</div>
            <div style={{ overflowX:"auto", borderRadius:15, border:"1px solid "+C.bdr }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr>{[t.fname,t.bsal2,t.comm,t.totale,t.tveh].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {staff.filter(s=>s.role!=="admin").map(s=>{
                    const e=earn(s.id); const cnt=sales.filter(x=>x.staffId===s.id&&x.status==="sold").length;
                    return (
                      <tr key={s.id} style={{ borderBottom:"1px solid "+C.bdr }}>
                        <td style={TD}><div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:32, height:32, borderRadius:"50%", background:aclr(s.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:13 }}>{s.name[0]}</div><div><div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{s.name}</div><div style={{ fontSize:11, color:C.t3 }}>{s.id}</div></div></div></td>
                        <td style={TD}><span style={{ fontFamily:"monospace", color:"#94a3b8" }}>{rm(e.base)}</span></td>
                        <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:700, color:C.grn }}>{rm(e.comm)}</span></td>
                        <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:900, fontSize:14, color:C.amb }}>{rm(e.total)}</span></td>
                        <td style={TD}><span style={{ background:"rgba(255,255,255,0.06)", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, color:"#94a3b8" }}>{cnt}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!isAdm && (()=>{
          const e=earn(uid);
          return (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:11 }}>{t.earn}</div>
              <div style={{ borderRadius:14, border:"1px solid "+C.bdr, overflow:"hidden" }}>
                {[{l:t.bsal2,v:e.base,c:"#94a3b8"},{l:t.comm+" (70%)",v:e.comm,c:C.grn},{l:t.totale,v:e.total,c:C.amb,bold:true}].map((r,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"15px 20px", background:r.bold?"rgba(245,158,11,0.04)":"rgba(255,255,255,0.02)", borderBottom:i<2?"1px solid "+C.bdr:"none" }}>
                    <span style={{ fontSize:14, color:C.t2 }}>{r.l}</span>
                    <span style={{ fontFamily:"monospace", fontSize:r.bold?20:15, fontWeight:r.bold?900:600, color:r.c }}>{rm(r.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ---- SALES ----
  const renderSales = () => {
    const list = isAdm ? shown : myS;
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div style={{ fontSize:23, fontWeight:900, color:C.text }}>{t.sales}</div>
          <div style={{ display:"flex", gap:9, alignItems:"center", flexWrap:"wrap" }}>
            {isAdm && <select style={{...sSt, width:"auto", minWidth:130, fontSize:13, padding:"9px 13px"}} value={filt} onChange={e=>setFilt(e.target.value)}><option value="all">{t.all}</option>{staff.filter(s=>s.role!=="admin").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
            {isAdm && <button style={bP} onClick={()=>setAddSale(true)}>+ {t.addsale}</button>}
          </div>
        </div>
        {mob ? (
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {list.length===0 ? <div style={{ textAlign:"center", color:C.t3, padding:"48px 20px", fontSize:14 }}>{t.norec}</div> : list.map(s=>{
              const sp=staff.find(x=>x.id===s.staffId); const pv=calcProfit(s);
              return (
                <div key={s.id||s.fbKey} style={{ background:C.card, border:"1px solid "+C.bdr, borderRadius:17, padding:15 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:11 }}>
                    <div><div style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color:C.ind, letterSpacing:1 }}>{s.plate}</div><div style={{ fontSize:13, color:C.t2, marginTop:3 }}>{s.year} - {s.make}</div></div>
                    <Chip type={s.txType} ch={s.loanChannel} t={t} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:isAdm?"1fr 1fr 1fr":"1fr", gap:8, marginBottom:11 }}>
                    {(isAdm
                      ? [{l:t.sp,v:rm(s.salePrice),c:C.text},{l:t.np,v:rm(pv.net),c:pv.net>=0?C.grn:C.red},{l:t.ss,v:s.txType==="trade"?"--":rm(pv.staff),c:C.amb}]
                      : [{l:t.ss,v:s.txType==="trade"?"--":rm(pv.staff),c:C.amb}]
                    ).map((it,i)=>(
                      <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"9px 11px" }}>
                        <div style={{ fontSize:9.5, color:C.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{it.l}</div>
                        <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:12, color:it.c }}>{it.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:12, color:C.t3 }}>{sp?sp.name:"--"} - {s.date}</div>
                    {isAdm && <div style={{ display:"flex", gap:5 }}>
                      <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, color:C.t2, cursor:"pointer", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"inherit" }} onClick={()=>setESale(s)}>Edit</button>
                      <button style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:C.red, cursor:"pointer", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"inherit" }} onClick={()=>setCdel({type:"sale",fbKey:s.fbKey||s.id})}>Del</button>
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ overflowX:"auto", borderRadius:17, border:"1px solid "+C.bdr }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
              <thead><tr>{(isAdm?[t.plate,t.yr,t.mk,t.sp,t.tx,t.mf,t.hf,t.np,t.ss,t.co,t.slp,t.dt,t.sts,t.act]:[t.plate,t.yr,t.mk,t.tx,t.lc,t.ss,t.slp,t.dt,t.sts]).map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {list.length===0 ? <tr><td colSpan={isAdm?14:9} style={{...TD, textAlign:"center", color:C.t3, padding:"48px"}}>{t.norec}</td></tr> : list.map(s=>{
                  const sp=staff.find(x=>x.id===s.staffId); const pv=calcProfit(s);
                  return (
                    <tr key={s.id||s.fbKey} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={TD}><span style={{ fontFamily:"monospace", fontSize:12, background:"rgba(99,102,241,0.1)", color:C.ind, padding:"3px 9px", borderRadius:7, letterSpacing:"1px", fontWeight:700 }}>{s.plate}</span></td>
                      <td style={{...TD, color:C.t2}}>{s.year}</td>
                      <td style={{...TD, fontWeight:600, color:C.text, maxWidth:120, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{s.make}</td>
                      {isAdm && <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:700, color:C.text }}>{rm(s.salePrice)}</span></td>}
                      <td style={TD}><Chip type={s.txType} ch={s.loanChannel} t={t} /></td>
                      {isAdm && <td style={{...TD, color:C.t3, fontFamily:"monospace", fontSize:12}}>{pv.misc>0?rm(pv.misc):"--"}</td>}
                      {isAdm && <td style={{...TD, color:C.t3, fontFamily:"monospace", fontSize:12}}>{pv.fee>0?rm(pv.fee):"--"}</td>}
                      {isAdm && <td style={TD}><ProfitTip s={s} t={t} /></td>}
                      {!isAdm && <td style={TD}><span style={{ fontFamily:"monospace", fontSize:12, color:C.ind }}>{s.loanChannel && s.loanChannel.trim() ? s.loanChannel : "--"}</span></td>}
                      <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:700, fontSize:12, color:s.txType==="trade"?C.t3:C.amb }}>{s.txType==="trade"?"--":rm(pv.staff)}</span></td>
                      {isAdm && <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:700, fontSize:12, color:C.blu }}>{rm(pv.co)}</span></td>}
                      <td style={TD}><div style={{ display:"flex", alignItems:"center", gap:7 }}><div style={{ width:25, height:25, borderRadius:"50%", background:aclr(sp?sp.name:"A"), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:10 }}>{sp?sp.name[0]:"?"}</div><span style={{ fontSize:12, color:C.t2 }}>{sp?sp.name:"--"}</span></div></td>
                      <td style={{...TD, color:C.t3, fontSize:12}}>{s.date}</td>
                      <td style={TD}><span style={{ background:s.status==="sold"?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)", color:s.status==="sold"?C.grn:C.amb, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{s.status==="sold"?t.sold:t.pend}</span></td>
                      {isAdm && <td style={TD}><div style={{ display:"flex", gap:5 }}>
                        <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, color:C.t2, cursor:"pointer", padding:"5px 9px", borderRadius:8, fontSize:11, fontFamily:"inherit" }} onClick={()=>setESale(s)}>Edit</button>
                        <button style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:C.red, cursor:"pointer", padding:"5px 9px", borderRadius:8, fontSize:11, fontFamily:"inherit" }} onClick={()=>setCdel({type:"sale",fbKey:s.fbKey||s.id})}>Del</button>
                      </div></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ---- STAFF ----
  const renderStaff = () => (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:23, fontWeight:900, color:C.text }}>{t.staff}</div>
        <button style={bP} onClick={()=>setAddSt(true)}>+ {t.addst}</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        {staff.map(s=>{
          const e=earn(s.id); const rc=sales.filter(x=>x.staffId===s.id&&x.status==="sold"&&x.txType!=="trade").length; const tc=sales.filter(x=>x.staffId===s.id&&x.status==="sold"&&x.txType==="trade").length; const has=sales.some(x=>x.staffId===s.id);
          return (
            <div key={s.id} style={{ background:C.card, border:"1px solid "+C.bdr, borderRadius:19, padding:19 }}>
              <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:15 }}>
                <div style={{ width:50, height:50, borderRadius:"50%", background:aclr(s.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:21, flexShrink:0 }}>{s.name[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"monospace", fontSize:11, color:C.t3 }}>{s.id}</span>
                    <span style={{ background:s.role==="admin"?"rgba(139,92,246,0.15)":"rgba(99,102,241,0.12)", color:s.role==="admin"?C.pur:C.ind, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700 }}>{s.role==="admin"?t.adm:t.rol}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, color:C.t2, cursor:"pointer", padding:"5px 9px", borderRadius:8, fontSize:11, fontFamily:"inherit" }} onClick={()=>setESt(s)}>Edit</button>
                  {s.role!=="admin" && <button style={{ background:has?"rgba(255,255,255,0.03)":"rgba(239,68,68,0.08)", border:"1px solid "+(has?"rgba(255,255,255,0.06)":"rgba(239,68,68,0.15)"), color:has?C.t3:C.red, cursor:"pointer", padding:"5px 9px", borderRadius:8, fontSize:11, fontFamily:"inherit" }} onClick={()=>tryDel(s.id)}>Del</button>}
                </div>
              </div>
              {s.role!=="admin" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:9 }}>
                    {[{l:t.bsal2,v:rm(e.base),c:"#94a3b8"},{l:t.comm,v:rm(e.comm),c:C.grn},{l:t.totale,v:rm(e.total),c:C.amb}].map((it,i)=>(
                      <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 11px" }}>
                        <div style={{ fontSize:9.5, color:C.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:4 }}>{it.l}</div>
                        <div style={{ fontFamily:"monospace", fontSize:11.5, fontWeight:800, color:it.c }}>{it.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:10, fontSize:11, color:C.t3 }}>
                    <span>{t.retail}: <strong style={{ color:C.t2 }}>{rc}</strong></span>
                    <span>{t.trades}: <strong style={{ color:C.amb }}>{tc}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- REPORTS ----
  const renderRep = () => {
    const sold=sales.filter(s=>s.status==="sold"); const retail=sold.filter(s=>s.txType!=="trade"); const trades=sold.filter(s=>s.txType==="trade"); const cashT=sold.filter(s=>s.txType==="cash"); const loanT=sold.filter(s=>s.txType==="loan");
    const trev=sold.reduce((a,s)=>a+Number(s.salePrice),0); const tnet=sold.reduce((a,s)=>a+calcProfit(s).net,0); const tstf=retail.reduce((a,s)=>a+Math.max(0,calcProfit(s).staff),0); const tco=sold.reduce((a,s)=>a+calcProfit(s).co,0);
    const byCh=LOANS.map(ch=>({ch,cnt:loanT.filter(s=>s.loanChannel===ch).length,rev:loanT.filter(s=>s.loanChannel===ch).reduce((a,s)=>a+Number(s.salePrice),0)})).filter(x=>x.cnt>0);
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div style={{ fontSize:23, fontWeight:900, color:C.text }}>{t.rep}</div>
          <button style={bG} onClick={()=>window.print()}>Print {t.exp}</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
          {[{l:"Vehicles",v:sold.length,c:"#6366f1"},{l:t.retail,v:retail.length,c:"#0ea5e9"},{l:t.trades,v:trades.length,c:"#f59e0b"},{l:t.rev,v:rm(trev),c:"#10b981"},{l:t.np,v:rm(tnet),c:C.grn},{l:t.earn,v:rm(tstf),c:C.amb},{l:t.company,v:rm(tco),c:C.blu}].map((c,i)=>(
            <div key={i} style={{ background:C.card, border:"1px solid "+C.bdr, borderRadius:15, padding:"16px" }}>
              <div style={{ fontSize:10.5, color:C.t3, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:7 }}>{c.l}</div>
              <div style={{ fontFamily:"monospace", fontSize:typeof c.v==="number"?26:14, fontWeight:900, color:c.c }}>{c.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:12, marginBottom:20 }}>
          <div style={{ background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:13, padding:"15px 17px" }}><div style={{ fontWeight:700, color:"#38bdf8", marginBottom:6, fontSize:13 }}>{t.cash} ({cashT.length})</div><div style={{ fontSize:12, color:C.t2 }}>Misc RM100 + Handling RM1,000</div><div style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color:C.text, marginTop:5 }}>{rm(cashT.reduce((a,s)=>a+Number(s.salePrice),0))}</div></div>
          <div style={{ background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:13, padding:"15px 17px" }}><div style={{ fontWeight:700, color:C.ind, marginBottom:6, fontSize:13 }}>{t.loan} ({loanT.length})</div><div style={{ fontSize:12, color:C.t2 }}>Misc RM100 + Handling RM1,600</div><div style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color:C.text, marginTop:5 }}>{rm(loanT.reduce((a,s)=>a+Number(s.salePrice),0))}</div></div>
        </div>
        {byCh.length>0 && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>{t.lbk}</div>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap", marginBottom:20 }}>
              {byCh.map(x=><div key={x.ch} style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.18)", borderRadius:12, padding:"12px 16px", minWidth:100 }}><div style={{ fontWeight:800, fontSize:15, color:C.ind, marginBottom:3 }}>{x.ch}</div><div style={{ fontSize:12, color:C.t2 }}>{x.cnt} sale{x.cnt>1?"s":""}</div><div style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:C.text, marginTop:3 }}>{rm(x.rev)}</div></div>)}
            </div>
          </div>
        )}
        <div style={{ fontSize:11, fontWeight:700, color:C.t3, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>{t.earn}</div>
        <div style={{ overflowX:"auto", borderRadius:15, border:"1px solid "+C.bdr }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
            <thead><tr>{[t.fname,t.retail,t.trades,t.rev,t.bsal2,t.comm,t.totale].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {staff.filter(s=>s.role!=="admin").map(s=>{
                const ms=sold.filter(x=>x.staffId===s.id); const mr=ms.filter(x=>x.txType!=="trade"); const mt=ms.filter(x=>x.txType==="trade"); const rev=ms.reduce((a,x)=>a+Number(x.salePrice),0); const e=earn(s.id);
                return (
                  <tr key={s.id} style={{ borderBottom:"1px solid "+C.bdr }}>
                    <td style={TD}><div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:30, height:30, borderRadius:"50%", background:aclr(s.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:12 }}>{s.name[0]}</div><span style={{ fontWeight:700, color:C.text, fontSize:13 }}>{s.name}</span></div></td>
                    <td style={TD}><span style={{ background:"rgba(56,189,248,0.08)", color:"#38bdf8", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{mr.length}</span></td>
                    <td style={TD}><span style={{ background:"rgba(245,158,11,0.08)", color:C.amb, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{mt.length}</span></td>
                    <td style={TD}><span style={{ fontFamily:"monospace", fontSize:12, color:"#94a3b8" }}>{rm(rev)}</span></td>
                    <td style={TD}><span style={{ fontFamily:"monospace", fontSize:12, color:"#94a3b8" }}>{rm(e.base)}</span></td>
                    <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:700, color:C.grn, fontSize:13 }}>{rm(e.comm)}</span></td>
                    <td style={TD}><span style={{ fontFamily:"monospace", fontWeight:900, fontSize:14, color:C.amb }}>{rm(e.total)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ---- SHELL ----
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:"'Plus Jakarta Sans','Noto Sans SC',system-ui,sans-serif" }}>
      {mob && side && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:40 }} onClick={()=>setSide(false)} />}
      <aside style={{ width:mob?268:SW, background:"rgba(10,13,22,0.97)", borderRight:"1px solid "+C.bdr, display:"flex", flexDirection:"column", position:"fixed", top:0, bottom:0, left:0, zIndex:50, transform:mob?(side?"translateX(0)":"translateX(-100%)"):"none", transition:"transform 0.3s ease", overflowX:"hidden" }}>
        <div style={{ padding:tab&&!mob?"16px 0":"16px 18px", borderBottom:"1px solid "+C.bdr, display:"flex", alignItems:"center", gap:10, justifyContent:tab&&!mob?"center":"flex-start" }}>
          <div style={{ width:36, height:36, borderRadius:11, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0, fontSize:14, fontWeight:900 }}>AP</div>
          {(!tab||mob) && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:900, fontSize:15, color:C.text }}>AutoPay Pro</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:online?C.grn:"#475569" }} />
                <span style={{ fontSize:10, color:online?C.grn:"#475569", fontWeight:600 }}>{online?t.live:"Local"}{busy?" ...":""}</span>
              </div>
            </div>
          )}
        </div>
        {(!tab||mob) && (
          <div style={{ padding:"12px 18px", borderBottom:"1px solid "+C.bdr, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:aclr(me.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:15, flexShrink:0 }}>{me.name[0]}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{me.name}</div>
              <div style={{ fontSize:11, color:C.t3, marginTop:1 }}>{isAdm?t.adm:t.rol}</div>
            </div>
            <span style={{ background:isAdm?"rgba(139,92,246,0.15)":"rgba(99,102,241,0.12)", color:isAdm?C.pur:C.ind, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700 }}>{isAdm?"A":"S"}</span>
          </div>
        )}
        <nav style={{ flex:1, padding:tab&&!mob?"10px 0":"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {navs.map(item=>{
            const act=page===item.k;
            return (
              <button key={item.k} onClick={()=>go(item.k)} style={{ display:"flex", alignItems:"center", gap:10, padding:tab&&!mob?"13px 0":"10px 13px", justifyContent:tab&&!mob?"center":"flex-start", borderRadius:tab&&!mob?0:10, border:"none", cursor:"pointer", background:act?"rgba(99,102,241,0.1)":"none", color:act?C.ind:C.t3, fontFamily:"inherit", fontSize:13.5, fontWeight:act?700:500, transition:"all 0.15s", width:"100%", boxShadow:act&&!tab?"inset 3px 0 0 #6366f1":"none" }}>
                <span style={{ fontSize:16, fontWeight:700 }}>{item.k==="dash"?"D":item.k==="sales"?"S":item.k==="staff"?"P":"R"}</span>
                {(!tab||mob) && <span>{item.l}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:tab&&!mob?"10px 0":"10px 8px", borderTop:"1px solid "+C.bdr, display:"flex", flexDirection:"column", gap:8 }}>
          {(!tab||mob) && (
            <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, borderRadius:10, padding:3, gap:2 }}>
              {["en","zh"].map(l=><button key={l} style={{ flex:1, padding:"6px", border:"none", borderRadius:7, background:lang===l?"linear-gradient(135deg,#6366f1,#8b5cf6)":"none", color:lang===l?"#fff":C.t3, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 }} onClick={()=>setLang(l)}>{l==="en"?"EN":"ZH"}</button>)}
            </div>
          )}
          <button onClick={()=>{setUid(null);setLf({u:"",p:""});setSide(false);}} style={{ display:"flex", alignItems:"center", gap:8, padding:tab&&!mob?"13px 0":"9px 13px", justifyContent:tab&&!mob?"center":"flex-start", border:"none", borderRadius:10, cursor:"pointer", background:"none", color:C.t3, fontFamily:"inherit", fontSize:13, fontWeight:500, width:"100%" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";e.currentTarget.style.color=C.red;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=C.t3;}}>
            <span style={{ fontSize:14, fontWeight:600 }}>Out</span>
            {(!tab||mob) && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>
      <main style={{ flex:1, display:"flex", flexDirection:"column", marginLeft:mob?0:SW, minWidth:0, transition:"margin-left 0.3s" }}>
        <div style={{ height:56, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(7,11,18,0.94)", borderBottom:"1px solid "+C.bdr, position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            {mob && <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, color:"#475569", cursor:"pointer", padding:"7px 10px", borderRadius:10, fontSize:14, fontWeight:700, fontFamily:"inherit" }} onClick={()=>setSide(v=>!v)}>=</button>}
            <span style={{ fontSize:12, color:C.t3, fontWeight:600 }}>{isAdm?"[A] "+t.aport:"[S] "+t.sport}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:online?C.grn:"#475569", fontWeight:600 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:online?C.grn:"#475569", boxShadow:online?"0 0 8px "+C.grn:"none" }} />
              {!mob && (online?t.live:"Local")}
            </div>
            {mob && (
              <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", border:"1px solid "+C.bdr, borderRadius:10, padding:3, gap:2 }}>
                {["en","zh"].map(l=><button key={l} style={{ padding:"4px 10px", border:"none", borderRadius:7, background:lang===l?"linear-gradient(135deg,#6366f1,#8b5cf6)":"none", color:lang===l?"#fff":C.t3, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700 }} onClick={()=>setLang(l)}>{l==="en"?"EN":"ZH"}</button>)}
              </div>
            )}
          </div>
        </div>
        <div style={{ flex:1, padding:mob?"14px":"26px 28px", paddingBottom:mob?82:26, overflowY:"auto" }}>
          {page==="dash"  && renderDash()}
          {page==="sales" && renderSales()}
          {page==="staff" && isAdm && renderStaff()}
          {page==="rep"   && isAdm && renderRep()}
        </div>
        {mob && (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(8,11,18,0.98)", borderTop:"1px solid "+C.bdr, display:"flex", zIndex:30, paddingTop:8, paddingBottom:"max(10px,env(safe-area-inset-bottom))" }}>
            {navs.map(item=>{
              const act=page===item.k;
              return (
                <button key={item.k} onClick={()=>go(item.k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, border:"none", background:"none", color:act?C.ind:C.t3, cursor:"pointer", padding:"4px", fontFamily:"inherit", fontSize:10, fontWeight:act?800:500 }}>
                  <div style={{ width:36, height:36, borderRadius:11, background:act?"rgba(99,102,241,0.12)":"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700 }}>
                    {item.k==="dash"?"D":item.k==="sales"?"S":item.k==="staff"?"P":"R"}
                  </div>
                  <span>{item.l}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <Dlg open={addSale||!!eSale} title={eSale?t.editsale:t.addsale} onClose={()=>{setAddSale(false);setESale(null);}}>
        <SaleForm initial={eSale} staffList={staff} onSave={saveSale} onClose={()=>{setAddSale(false);setESale(null);}} t={t} busy={busy} />
      </Dlg>
      <Dlg open={addSt||!!eSt} title={eSt?t.editst:t.addst} onClose={()=>{setAddSt(false);setESt(null);}}>
        <StaffForm initial={eSt} onSave={saveStaff} onClose={()=>{setAddSt(false);setESt(null);}} t={t} busy={busy} />
      </Dlg>
      <Confirm open={!!cdel} title={t.deltitle} msg={t.delmsg} t={t} onYes={()=>cdel.type==="sale"?delSale(cdel.fbKey):delStaff(cdel.id)} onNo={()=>setCdel(null)} />
      <Toast msg={toast} onClose={()=>setToast("")} />
    </div>
  );
}
