const STORAGE_KEY = "my-whisky-note-v1";

const sample = {
  whiskies: [
    {id:"w1",name:"Ardbeg Uigeadail",nameKo:"아드벡 우거다일",distillery:"Ardbeg",country:"Scotland",region:"Islay",age:"NAS",abv:54.2,cask:"Bourbon, Sherry",marketPrice:150000,purchasePrice:135000,purchaseDate:"2026-08-17",status:"개봉",visual:"green"},
    {id:"w2",name:"Lagavulin 16",nameKo:"라가불린 16년",distillery:"Lagavulin",country:"Scotland",region:"Islay",age:"16",abv:43,cask:"Oak",marketPrice:130000,purchasePrice:119000,purchaseDate:"2026-07-20",status:"보유",visual:"amber"},
    {id:"w3",name:"The Macallan 12 Double Cask",nameKo:"맥캘란 12 더블캐스크",distillery:"The Macallan",country:"Scotland",region:"Speyside",age:"12",abv:40,cask:"American & European Sherry Oak",marketPrice:115000,purchasePrice:98000,purchaseDate:"2026-06-15",status:"보유",visual:"amber"},
    {id:"w4",name:"Glenfiddich 15 Solera",nameKo:"글렌피딕 15 솔레라",distillery:"Glenfiddich",country:"Scotland",region:"Speyside",age:"15",abv:40,cask:"Solera Vat",marketPrice:98000,purchasePrice:89000,purchaseDate:"2026-05-12",status:"보유",visual:"green"},
    {id:"w5",name:"Talisker 10",nameKo:"탈리스커 10년",distillery:"Talisker",country:"Scotland",region:"Isle of Skye",age:"10",abv:45.8,cask:"Ex-Bourbon",marketPrice:72000,purchasePrice:65000,purchaseDate:"2026-04-20",status:"완병",visual:"amber"},
    {id:"w6",name:"Bowmore 12",nameKo:"보모어 12년",distillery:"Bowmore",country:"Scotland",region:"Islay",age:"12",abv:40,cask:"Ex-Bourbon, Sherry",marketPrice:67000,purchasePrice:59000,purchaseDate:"2026-03-14",status:"보유",visual:"amber"},
    {id:"w7",name:"Laphroaig 10",nameKo:"라프로익 10년",distillery:"Laphroaig",country:"Scotland",region:"Islay",age:"10",abv:40,cask:"Ex-Bourbon",marketPrice:69000,purchasePrice:61000,purchaseDate:"2026-02-11",status:"개봉",visual:"green"},
    {id:"w8",name:"Highland Park 12",nameKo:"하이랜드 파크 12년",distillery:"Highland Park",country:"Scotland",region:"Orkney",age:"12",abv:40,cask:"Sherry Seasoned Oak",marketPrice:78000,purchasePrice:72000,purchaseDate:"2026-01-18",status:"위시리스트",visual:"amber"}
  ],
  tastings: [
    {id:"t1",whiskyId:"w1",date:"2026-09-24",nose:92,palate:90,finish:91,balance:88,overall:91,value:4,noseNote:"강렬한 피트, 달콤한 셰리, 다크초콜릿, 말린 과일.",palateNote:"묵직한 바디감과 스모키함, 검은 과일과 스파이스.",finishNote:"길고 따뜻한 여운. 피트와 셰리 잔향이 오래 남음.",overallNote:"강렬하면서도 밸런스가 뛰어나 다시 찾게 되는 위스키.",tags:["스모키","셰리","다크초콜릿","묵직한"]},
    {id:"t2",whiskyId:"w2",date:"2026-09-10",nose:89,palate:90,finish:90,balance:87,overall:89,value:4,noseNote:"바닷바람, 피트, 은은한 단향.",palateNote:"스모키함과 몰트의 단맛.",finishNote:"길고 드라이한 피니시.",overallNote:"정석적인 아일라의 매력.",tags:["피트","스모키","몰트"]},
    {id:"t3",whiskyId:"w3",date:"2026-08-28",nose:88,palate:88,finish:87,balance:89,overall:88,value:3,noseNote:"건포도, 바닐라, 오렌지 껍질.",palateNote:"부드러운 셰리 단맛.",finishNote:"중간 길이, 오크와 스파이스.",overallNote:"균형은 좋지만 가격은 조금 아쉽다.",tags:["셰리","바닐라","건과일"]},
    {id:"t4",whiskyId:"w4",date:"2026-08-03",nose:86,palate:87,finish:85,balance:87,overall:86,value:4,noseNote:"배, 꿀, 몰트.",palateNote:"과실과 부드러운 향신료.",finishNote:"깔끔하고 중간 정도.",overallNote:"편하게 마시기 좋은 밸런스.",tags:["과일","꿀","몰트"]},
    {id:"t5",whiskyId:"w5",date:"2026-07-11",nose:87,palate:86,finish:88,balance:86,overall:87,value:5,noseNote:"바다, 후추, 연기.",palateNote:"짭짤함과 스파이시함.",finishNote:"후추와 연기가 오래 지속.",overallNote:"가격대비 개성이 확실하다.",tags:["스모키","후추","짭짤함"]},
    {id:"t6",whiskyId:"w6",date:"2026-06-07",nose:84,palate:85,finish:84,balance:86,overall:85,value:4,noseNote:"가벼운 피트와 레몬.",palateNote:"몰트, 카라멜.",finishNote:"짧고 깔끔함.",overallNote:"부담 없이 즐기기 좋음.",tags:["피트","레몬","카라멜"]},
    {id:"t7",whiskyId:"w7",date:"2026-05-22",nose:87,palate:86,finish:87,balance:84,overall:86,value:4,noseNote:"요오드, 약품, 피트.",palateNote:"강한 스모크와 약간의 단맛.",finishNote:"드라이하고 강한 피트.",overallNote:"호불호는 강하지만 개성이 명확하다.",tags:["요오드","피트","스모키"]}
  ]
};

function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){ localStorage.setItem(STORAGE_KEY, JSON.stringify(sample)); return structuredClone(sample); }
  try{return JSON.parse(raw)}catch{return structuredClone(sample)}
}
let data = loadData();
let selectedWhiskyId = data.whiskies[0]?.id || null;
let collectionFilter = "all";

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const won = n => n ? new Intl.NumberFormat("ko-KR").format(n)+"원" : "-";

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); renderAll(); }

function whiskyScore(id){
  const ts = data.tastings.filter(t=>t.whiskyId===id);
  if(!ts.length) return null;
  return Math.round(ts.reduce((a,b)=>a+b.overall,0)/ts.length);
}
function whiskyLatestTasting(id){
  return data.tastings.filter(t=>t.whiskyId===id).sort((a,b)=>b.date.localeCompare(a.date))[0] || null;
}
function bottleClass(w){ return w.visual==="amber"?"amber":w.visual==="clear"?"clear":""; }

function summary(){
  const scored = data.whiskies.map(w=>whiskyScore(w.id)).filter(v=>v!==null);
  const avg = scored.length ? Math.round(scored.reduce((a,b)=>a+b,0)/scored.length) : 0;
  return [
    ["🥃","보유한 위스키",data.whiskies.filter(w=>["보유","개봉"].includes(w.status)).length,"병"],
    ["🍷","시음한 횟수",data.tastings.length,"회"],
    ["★","평균 평점",avg,"/100"],
    ["🔖","위시리스트",data.whiskies.filter(w=>w.status==="위시리스트").length,"개"]
  ]
}
function renderSummary(){
  $("#summaryCards").innerHTML = summary().map(([icon,label,val,unit])=>\`
    <div class="stat-card"><div class="stat-label">\${icon} &nbsp;\${label}</div><div class="stat-value">\${val} <small>\${unit}</small></div></div>
  \`).join("");
}
function cardHTML(w){
  const score = whiskyScore(w.id);
  return \`<article class="whisky-card \${selectedWhiskyId===w.id?"active":""}" data-whisky="\${w.id}">
    <div class="bottle-visual"><div class="bottle-shape \${bottleClass(w)}"></div></div>
    <div class="card-body">
      <div class="card-name">\${w.name}</div>
      <div class="card-sub">\${w.nameKo||""}</div>
      <div class="card-sub">\${w.country||""}\${w.region?" · "+w.region:""}</div>
      <div class="card-meta"><span class="status-dot">\${w.status}</span><span class="score"><span class="star">★</span> \${score ?? "-"}</span></div>
    </div>
  </article>\`;
}
function filteredWhiskies(){
  const q = ($("#searchInput")?.value || "").trim().toLowerCase();
  let arr = data.whiskies.filter(w => [w.name,w.nameKo,w.distillery,w.country,w.region].join(" ").toLowerCase().includes(q));
  const sort = $("#sortSelect")?.value || "recent";
  if(sort==="score") arr.sort((a,b)=>(whiskyScore(b.id)||0)-(whiskyScore(a.id)||0));
  if(sort==="name") arr.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="price") arr.sort((a,b)=>(b.purchasePrice||0)-(a.purchasePrice||0));
  if(sort==="recent") arr.sort((a,b)=>(b.purchaseDate||"").localeCompare(a.purchaseDate||""));
  return arr;
}
function renderGrid(){
  const arr = filteredWhiskies();
  $("#whiskyGrid").innerHTML = arr.length ? arr.map(cardHTML).join("") : \`<div class="empty">검색 결과가 없습니다.</div>\`;
}
function infoRow(label,value){return \`<div class="info-row"><span>\${label}</span><span>\${value||"-"}</span></div>\`}
function renderDetail(){
  const w = data.whiskies.find(x=>x.id===selectedWhiskyId) || data.whiskies[0];
  if(!w){$("#detailPanel").innerHTML=\`<div class="empty">위스키를 추가해 주세요.</div>\`;return}
  selectedWhiskyId = w.id;
  const t = whiskyLatestTasting(w.id);
  const score = whiskyScore(w.id);
  const ratings = t ? [["향",t.nose],["맛",t.palate],["피니시",t.finish],["밸런스",t.balance],["총평",t.overall]] : [["향","-"],["맛","-"],["피니시","-"],["밸런스","-"],["총평","-"]];
  $("#detailPanel").innerHTML = \`
    <div class="detail-top">
      <div class="detail-bottle"><div class="bottle-shape \${bottleClass(w)}"></div></div>
      <div>
        <div class="detail-title-row">
          <div>
            <h2 class="detail-title">\${w.name}</h2>
            <div class="card-sub">\${w.nameKo||""}</div>
          </div>
          <div class="detail-score"><span class="star">★</span> \${score ?? "-"} <small>/100</small></div>
        </div>
        <div class="pills"><span class="pill">\${w.status}</span><span class="pill gold">\${w.age||"NAS"}</span></div>
        <div class="info-table">
          \${infoRow("증류소",w.distillery)}
          \${infoRow("지역",[w.country,w.region].filter(Boolean).join(" · "))}
          \${infoRow("숙성연수",w.age)}
          \${infoRow("도수",w.abv ? w.abv+"%" : "-")}
          \${infoRow("캐스크",w.cask)}
          \${infoRow("예상 가격",won(w.marketPrice))}
          \${infoRow("구매 가격",won(w.purchasePrice))}
          \${infoRow("구매일",w.purchaseDate)}
        </div>
      </div>
    </div>
    <div class="rating-strip">
      <div class="section-title-row"><h3>평가 점수</h3><button class="text-btn" id="quickTasting">✎ 시음 추가</button></div>
      <div class="rating-circles">
        \${ratings.map(([k,v])=>\`<div class="rating-item"><div class="rating-circle">\${v}</div><div>\${k}</div></div>\`).join("")}
      </div>
    </div>\`;
  $("#quickTasting")?.addEventListener("click",()=>openTastingModal(w.id));
}
function renderRecent(){
  const arr = [...data.tastings].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  $("#recentNotes").innerHTML = arr.map(t=>{
    const w=data.whiskies.find(x=>x.id===t.whiskyId);
    return \`<div class="note-mini"><div class="note-mini-top"><span>\${t.date} · \${w?.name||""}</span><b>★ \${t.overall}</b></div><p>\${t.overallNote||"-"}</p></div>\`
  }).join("") || \`<div class="empty">아직 시음 기록이 없습니다.</div>\`;
}
function renderTopFive(){
  const ranked=data.whiskies.map(w=>({...w,score:whiskyScore(w.id)})).filter(w=>w.score!==null).sort((a,b)=>b.score-a.score).slice(0,5);
  $("#topFive").innerHTML=ranked.map((w,i)=>\`<div class="top-row"><span class="rank-num">\${i+1}</span><span>\${w.name}</span><b>★ \${w.score}</b></div>\`).join("");
}
function renderCollection(){
  let arr = data.whiskies;
  if(collectionFilter!=="all") arr=arr.filter(w=>w.status===collectionFilter);
  $("#collectionGrid").innerHTML = arr.length?arr.map(cardHTML).join(""):\`<div class="empty">해당 상태의 위스키가 없습니다.</div>\`;
}
function renderTastings(){
  const arr=[...data.tastings].sort((a,b)=>b.date.localeCompare(a.date));
  $("#tastingList").innerHTML=arr.map(t=>{
    const w=data.whiskies.find(x=>x.id===t.whiskyId);
    return \`<article class="tasting-card">
      <div>
        <div class="tasting-title">\${w?.name||"Unknown"}</div>
        <div class="tasting-meta">\${t.date} · 가성비 \${"★".repeat(Number(t.value||0))}</div>
        <div class="note-columns">
          <div class="note-box"><b>향 \${t.nose}</b><p>\${t.noseNote||"-"}</p></div>
          <div class="note-box"><b>맛 \${t.palate}</b><p>\${t.palateNote||"-"}</p></div>
          <div class="note-box"><b>피니시 \${t.finish}</b><p>\${t.finishNote||"-"}</p></div>
          <div class="note-box"><b>총평</b><p>\${t.overallNote||"-"}</p></div>
        </div>
        <div class="pills">\${(t.tags||[]).map(x=>\`<span class="pill gold">\${x}</span>\`).join("")}</div>
      </div>
      <div class="score-badge">\${t.overall}<small>/100</small></div>
    </article>\`;
  }).join("") || \`<div class="empty panel">시음 기록이 없습니다.</div>\`;
}
function renderWishlist(){
  const arr=data.whiskies.filter(w=>w.status==="위시리스트");
  $("#wishlistGrid").innerHTML=arr.length?arr.map(cardHTML).join(""):\`<div class="empty">위시리스트가 비어 있습니다.</div>\`;
}
function renderRanking(){
  const arr=data.whiskies.map(w=>({...w,score:whiskyScore(w.id)})).filter(w=>w.score!==null).sort((a,b)=>b.score-a.score);
  $("#rankingList").innerHTML=arr.map((w,i)=>\`<div class="ranking-row">
    <div class="rank-big">\${i+1}</div>
    <div><div class="r-name">\${w.name}</div><div class="r-sub">\${w.distillery} · \${w.region||w.country||""}</div></div>
    <div class="r-sub">\${w.cask||"-"}</div>
    <div class="r-score">\${w.score}</div>
  </div>\`).join("") || \`<div class="empty">평가된 위스키가 없습니다.</div>\`;
}
function renderStats(){
  const scored=data.whiskies.map(w=>({w,score:whiskyScore(w.id)})).filter(x=>x.score!==null);
  const byRegion={};
  scored.forEach(({w,score})=>{const k=w.region||w.country||"기타"; if(!byRegion[k])byRegion[k]=[]; byRegion[k].push(score)});
  const regionRows=Object.entries(byRegion).map(([k,v])=>[k,Math.round(v.reduce((a,b)=>a+b,0)/v.length),v.length]).sort((a,b)=>b[1]-a[1]);
  const tagCount={}; data.tastings.forEach(t=>(t.tags||[]).forEach(tag=>tagCount[tag]=(tagCount[tag]||0)+1));
  const tags=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const avg = scored.length?Math.round(scored.reduce((a,b)=>a+b.score,0)/scored.length):0;
  const spend = data.whiskies.filter(w=>w.status!=="위시리스트").reduce((a,b)=>a+(Number(b.purchasePrice)||0),0);
  $("#statsContent").innerHTML=\`
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">평가 평균</div><div class="stat-value">\${avg}<small>/100</small></div></div>
      <div class="stat-card"><div class="stat-label">총 구매금액</div><div class="stat-value">\${new Intl.NumberFormat("ko-KR",{notation:"compact"}).format(spend)}<small>원</small></div></div>
      <div class="stat-card"><div class="stat-label">시음 기록</div><div class="stat-value">\${data.tastings.length}<small>회</small></div></div>
      <div class="stat-card"><div class="stat-label">등록 위스키</div><div class="stat-value">\${data.whiskies.length}<small>병</small></div></div>
    </div>
    <div class="stats-grid">
      <div class="panel stats-card" style="grid-column:span 2"><h3>지역별 평균 점수</h3>
        \${regionRows.map(([k,score,count])=>\`<div class="bar-row"><span>\${k}</span><div class="bar-track"><div class="bar-fill" style="width:\${score}%"></div></div><b>\${score}</b></div>\`).join("")}
      </div>
      <div class="panel stats-card"><h3>자주 쓴 향미 태그</h3>
        \${tags.map(([k,v])=>\`<div class="top-row"><span>\${k}</span><b>\${v}회</b></div>\`).join("")||"<div class='empty'>태그 없음</div>"}
      </div>
    </div>\`;
}

function renderAll(){
  renderSummary();renderGrid();renderDetail();renderRecent();renderTopFive();renderCollection();renderTastings();renderWishlist();renderRanking();renderStats();
}

function setView(name){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+name+"View")?.classList.add("active");
  $$(".nav-item[data-view], .mobile-nav button[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
$$("[data-view-target]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.viewTarget)));

document.addEventListener("click",e=>{
  const card=e.target.closest("[data-whisky]");
  if(card){
    selectedWhiskyId=card.dataset.whisky;
    renderGrid();renderDetail();renderCollection();
    if(window.innerWidth<760) setView("home");
  }
  if(e.target.matches("[data-close]")) closeModal();
});

$("#searchInput").addEventListener("input",renderGrid);
$("#sortSelect").addEventListener("change",renderGrid);
$("#statusFilters").addEventListener("click",e=>{
  if(!e.target.matches("button"))return;
  $$("#statusFilters button").forEach(b=>b.classList.remove("active")); e.target.classList.add("active");
  collectionFilter=e.target.dataset.filter; renderCollection();
});

const modalBackdrop=$("#modalBackdrop"), modalContent=$("#modalContent");
function closeModal(){modalBackdrop.classList.remove("open");modalContent.innerHTML=""}
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)closeModal()})

function openWhiskyModal(){
  const tpl=$("#whiskyFormTemplate").content.cloneNode(true);
  modalContent.innerHTML="";modalContent.append(tpl);modalBackdrop.classList.add("open");
  const form=$("#whiskyForm");
  form.purchaseDate.value = new Date().toISOString().slice(0,10);
  form.addEventListener("submit",e=>{
    e.preventDefault(); const f=new FormData(form);
    const w={id:"w"+Date.now(),name:f.get("name").trim(),nameKo:f.get("nameKo").trim(),distillery:f.get("distillery").trim(),country:f.get("country").trim(),region:f.get("region").trim(),age:f.get("age").trim()||"NAS",abv:Number(f.get("abv"))||null,cask:f.get("cask").trim(),marketPrice:Number(f.get("marketPrice"))||null,purchasePrice:Number(f.get("purchasePrice"))||null,purchaseDate:f.get("purchaseDate"),status:f.get("status"),visual:"amber"};
    data.whiskies.unshift(w); selectedWhiskyId=w.id; save(); closeModal();
  })
}
$("#openAddWhisky").addEventListener("click",openWhiskyModal);
$("#openAddWhisky2").addEventListener("click",openWhiskyModal);

function openTastingModal(preselect=selectedWhiskyId){
  if(!data.whiskies.length){openWhiskyModal();return}
  const tpl=$("#tastingFormTemplate").content.cloneNode(true);
  modalContent.innerHTML="";modalContent.append(tpl);modalBackdrop.classList.add("open");
  const form=$("#tastingForm"), select=$("#tastingWhiskySelect");
  select.innerHTML=data.whiskies.map(w=>\`<option value="\${w.id}">\${w.name} \${w.nameKo?"· "+w.nameKo:""}</option>\`).join("");
  if(preselect) select.value=preselect;
  form.date.value=new Date().toISOString().slice(0,10);
  const range=$("#overallRange"), preview=$("#overallPreview");
  range.addEventListener("input",()=>preview.textContent=range.value);
  form.addEventListener("submit",e=>{
    e.preventDefault(); const f=new FormData(form);
    const t={id:"t"+Date.now(),whiskyId:f.get("whiskyId"),date:f.get("date"),nose:Number(f.get("nose")),palate:Number(f.get("palate")),finish:Number(f.get("finish")),balance:Number(f.get("balance")),overall:Number(f.get("overall")),value:Number(f.get("value")),noseNote:f.get("noseNote").trim(),palateNote:f.get("palateNote").trim(),finishNote:f.get("finishNote").trim(),overallNote:f.get("overallNote").trim(),tags:f.get("tags").split(",").map(x=>x.trim()).filter(Boolean)};
    data.tastings.unshift(t); selectedWhiskyId=t.whiskyId; save(); closeModal(); setView("tasting");
  })
}
$("#openAddTasting").addEventListener("click",()=>openTastingModal());
$("#mobileQuickTasting").addEventListener("click",()=>openTastingModal());

$("#exportData").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="my-whisky-note-backup.json"; a.click(); URL.revokeObjectURL(a.href);
});
$("#importData").addEventListener("change",async e=>{
  const file=e.target.files[0]; if(!file)return;
  try{data=JSON.parse(await file.text());localStorage.setItem(STORAGE_KEY,JSON.stringify(data));selectedWhiskyId=data.whiskies?.[0]?.id||null;renderAll();alert("가져오기가 완료되었습니다.")}catch{alert("올바른 JSON 백업 파일이 아닙니다.")}
});
$("#resetData").addEventListener("click",()=>{
  if(confirm("현재 데이터를 샘플 데이터로 초기화할까요?")){
    data=structuredClone(sample);selectedWhiskyId=data.whiskies[0].id;save();
  }
});

renderAll();