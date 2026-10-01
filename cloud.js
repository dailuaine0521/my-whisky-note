const SUPABASE_URL = "https://blpzbwzlxjxolwpavrzd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_BWlkLhSty51jVMZYRjowfg_ESb8oaDb";
const WHISKY_LOOKUP_FUNCTION = "whisky-lookup";
const CLOUD_MIGRATED_KEY = "my-whisky-note-cloud-migrated-v1";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

let cloudUser = null;
let cloudSyncTimer = null;
let cloudSyncing = false;
let lastCloudSyncAt = null;
const originalSave = save;

function injectCloudUI(){
  const brand = document.querySelector(".brand");
  if (brand && !document.querySelector("#cloudStatus")) {
    brand.insertAdjacentHTML("beforeend", '<div id="cloudStatus" class="cloud-status offline">로컬 저장</div>');
  }

  const settings = document.querySelector("#settingsView .settings-panel");
  if (settings && !document.querySelector("#accountPanel")) {
    settings.insertAdjacentHTML("afterbegin", `
      <div id="accountPanel" class="account-panel">
        <div class="section-title-row">
          <div>
            <h3>계정 · 클라우드 동기화</h3>
            <p class="muted">로그인하면 휴대폰과 PC에서 같은 기록을 사용합니다.</p>
          </div>
          <span id="accountBadge" class="pill">로그아웃 상태</span>
        </div>
        <div id="authLoggedOut">
          <div class="auth-grid">
            <label>이메일<input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com"></label>
            <label>비밀번호<input id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="6자 이상"></label>
          </div>
          <div class="settings-actions">
            <button id="signInBtn" class="primary-btn">로그인</button>
            <button id="signUpBtn" class="secondary-btn">계정 만들기</button>
          </div>
          <p class="muted">첫 가입 시 이메일 인증이 필요할 수 있습니다.</p>
        </div>
        <div id="authLoggedIn" hidden>
          <p><b id="signedInEmail"></b> 계정으로 동기화 중입니다.</p>
          <div class="settings-actions">
            <button id="syncNowBtn" class="secondary-btn">지금 동기화</button>
            <button id="pullCloudBtn" class="secondary-btn">클라우드에서 다시 불러오기</button>
            <button id="signOutBtn" class="danger-btn">로그아웃</button>
          </div>
          <p id="lastSyncText" class="muted"></p>
        </div>
      </div>
      <div class="notice-box">
        <b>AI 위스키 정보 검색</b>
        <p>Gemini는 Google Search 근거가 확인된 값만 제안합니다. 출처가 없거나 충돌하면 값을 비워둡니다.</p>
      </div>
    `);
  }

  const formTpl = document.querySelector("#whiskyFormTemplate");
  if (formTpl && !formTpl.content.querySelector("[data-ai-lookup]")) {
    const nameLabel = formTpl.content.querySelector('input[name="name"]')?.closest("label");
    if (nameLabel) {
      nameLabel.insertAdjacentHTML("beforeend", '<button type="button" class="secondary-btn inline-ai-btn" data-ai-lookup>AI로 정보 찾기</button><div class="ai-lookup-status" data-ai-status></div>');
    }
  }
}

function setCloudStatus(text, state="offline"){
  const el = document.querySelector("#cloudStatus");
  if (!el) return;
  el.textContent = text;
  el.className = "cloud-status " + state;
}

function updateAccountUI(){
  const loggedOut = document.querySelector("#authLoggedOut");
  const loggedIn = document.querySelector("#authLoggedIn");
  const badge = document.querySelector("#accountBadge");
  const email = document.querySelector("#signedInEmail");
  if (!loggedOut || !loggedIn || !badge) return;

  if (cloudUser) {
    loggedOut.hidden = true;
    loggedIn.hidden = false;
    badge.textContent = "클라우드 연결됨";
    badge.classList.add("gold");
    if (email) email.textContent = cloudUser.email || "로그인 사용자";
    setCloudStatus("클라우드 동기화", "online");
  } else {
    loggedOut.hidden = false;
    loggedIn.hidden = true;
    badge.textContent = "로그아웃 상태";
    badge.classList.remove("gold");
    setCloudStatus("로컬 저장", "offline");
  }
  updateLastSyncText();
}

function updateLastSyncText(){
  const el = document.querySelector("#lastSyncText");
  if (!el) return;
  el.textContent = lastCloudSyncAt ? "마지막 동기화: " + new Date(lastCloudSyncAt).toLocaleString("ko-KR") : "아직 동기화하지 않았습니다.";
}

function normalizeLocalIds(){
  const idMap = new Map();
  data.whiskies.forEach(w => {
    const old = w.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(old)) {
      w.id = crypto.randomUUID();
    }
    idMap.set(old, w.id);
  });
  data.tastings.forEach(t => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t.id)) {
      t.id = crypto.randomUUID();
    }
    if (t.whiskyId) t.whiskyId = idMap.get(t.whiskyId) || t.whiskyId;
    if (!t.whiskyName && t.whiskyId) {
      t.whiskyName = data.whiskies.find(w=>w.id===t.whiskyId)?.name || "";
    }
  });
  if (selectedWhiskyId) selectedWhiskyId = idMap.get(selectedWhiskyId) || selectedWhiskyId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function whiskyToDb(w){
  const ageText = String(w.age ?? "").trim();
  const nas = /^nas$/i.test(ageText);
  const ageNum = nas || !ageText ? null : Number.parseInt(ageText, 10);
  return {
    id:w.id,
    user_id:cloudUser.id,
    name:w.name,
    name_ko:w.nameKo || null,
    distillery:w.distillery || null,
    country:w.country || null,
    region:w.region || null,
    age_years:Number.isFinite(ageNum) ? ageNum : null,
    is_nas:nas,
    abv:w.abv || null,
    cask:w.cask || null,
    market_price:w.marketPrice || null,
    purchase_price:w.purchasePrice || null,
    purchase_date:w.purchaseDate || null,
    status:w.status || "보유",
    opened_at:w.openedAt || null,
    remaining_percent:w.remainingPercent === null || w.remainingPercent === undefined || w.remainingPercent === "" ? null : Number(w.remainingPercent),
    image_path:w.imagePath || null,
    bottling_type:w.bottlingType || "unknown",
    bottler:w.bottler || null,
    series_name:w.seriesName || null,
    vintage_year:w.vintageYear || null,
    bottling_year:w.bottlingYear || null,
    cask_number:w.caskNumber || null,
    single_cask:w.singleCask ?? null,
    bottle_count:w.bottleCount || null,
    cask_strength:w.caskStrength ?? null,
    batch_release:w.batchRelease || null,
    image_url:w.officialImageUrl || (!w.imagePath ? (w.imageUrl || null) : null),
    official_product_url:w.officialProductUrl || null,
    reference_url:w.referenceUrl || null,
    source_name:w.sourceName || null,
    source_checked_at:w.sourceCheckedAt || null,
    updated_at:new Date().toISOString()
  };
}

function tastingToDb(t){
  return {
    id:t.id,
    user_id:cloudUser.id,
    whisky_id:t.whiskyId || null,
    whisky_name:t.whiskyName || data.whiskies.find(w=>w.id===t.whiskyId)?.name || "Unknown",
    tasting_date:t.date || new Date().toISOString().slice(0,10),
    nose_score:t.nose ?? null,
    palate_score:t.palate ?? null,
    finish_score:t.finish ?? null,
    balance_score:t.balance ?? null,
    overall_score:t.overall,
    value_score:t.value ?? null,
    repurchase_intent:t.repurchaseIntent || null,
    nose_note:t.noseNote || null,
    palate_note:t.palateNote || null,
    finish_note:t.finishNote || null,
    overall_note:t.overallNote || null,
    tags:Array.isArray(t.tags) ? t.tags : [],
    updated_at:new Date().toISOString()
  };
}

function dbToWhisky(w){
  return {
    id:w.id,
    name:w.name,
    nameKo:w.name_ko || "",
    distillery:w.distillery || "",
    country:w.country || "",
    region:w.region || "",
    age:w.is_nas ? "NAS" : (w.age_years ? String(w.age_years) : ""),
    abv:w.abv == null ? null : Number(w.abv),
    cask:w.cask || "",
    marketPrice:w.market_price == null ? null : Number(w.market_price),
    purchasePrice:w.purchase_price == null ? null : Number(w.purchase_price),
    purchaseDate:w.purchase_date || "",
    status:w.status || "보유",
    openedAt:w.opened_at || "",
    remainingPercent:w.remaining_percent ?? null,
    imagePath:w.image_path || "",
    bottlingType:w.bottling_type || "unknown",
    bottler:w.bottler || "",
    seriesName:w.series_name || "",
    vintageYear:w.vintage_year ?? null,
    bottlingYear:w.bottling_year ?? null,
    caskNumber:w.cask_number || "",
    singleCask:w.single_cask ?? null,
    bottleCount:w.bottle_count ?? null,
    caskStrength:w.cask_strength ?? null,
    batchRelease:w.batch_release || "",
    imageUrl:w.image_url || "",
    officialImageUrl:w.image_url || "",
    officialProductUrl:w.official_product_url || "",
    referenceUrl:w.reference_url || "",
    sourceName:w.source_name || "",
    sourceCheckedAt:w.source_checked_at || "",
    visual:"amber"
  };
}

function dbToTasting(t){
  return {
    id:t.id,
    whiskyId:t.whisky_id || null,
    whiskyName:t.whisky_name || "",
    date:t.tasting_date,
    nose:t.nose_score,
    palate:t.palate_score,
    finish:t.finish_score,
    balance:t.balance_score,
    overall:t.overall_score,
    value:t.value_score,
    repurchaseIntent:t.repurchase_intent || "",
    noseNote:t.nose_note || "",
    palateNote:t.palate_note || "",
    finishNote:t.finish_note || "",
    overallNote:t.overall_note || "",
    tags:Array.isArray(t.tags) ? t.tags : []
  };
}

async function signedWhiskyImageUrl(path){
  if(!path) return "";
  const {data:res,error}=await sb.storage.from("whisky-images").createSignedUrl(path,60*60*24*7);
  if(error){ console.warn("Signed image URL failed",error); return ""; }
  return res?.signedUrl || "";
}

async function refreshPrivateImageUrls(){
  const targets=data.whiskies.filter(w=>w.imagePath);
  await Promise.all(targets.map(async w=>{
    const url=await signedWhiskyImageUrl(w.imagePath);
    if(url) w.imageUrl=url;
    else if(w.officialImageUrl) w.imageUrl=w.officialImageUrl;
  }));
}

window.cloudUploadWhiskyImage=async function(file,whiskyId,oldPath=""){
  if(!file) return null;
  if(!cloudUser) throw new Error("사진 업로드는 로그인 후 사용할 수 있습니다.");
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.");
  if(file.size>5*1024*1024) throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");

  const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
  const path=`${cloudUser.id}/${whiskyId}/${Date.now()}.${ext}`;
  const {error}=await sb.storage.from("whisky-images").upload(path,file,{upsert:false,contentType:file.type});
  if(error) throw error;

  if(oldPath && oldPath!==path){
    const {error:delError}=await sb.storage.from("whisky-images").remove([oldPath]);
    if(delError) console.warn("Old image delete failed",delError);
  }

  const url=await signedWhiskyImageUrl(path);
  return {path,url};
};

async function pushCloud(){
  if (!cloudUser || cloudSyncing) return;
  cloudSyncing = true;
  setCloudStatus("동기화 중…","syncing");
  try {
    normalizeLocalIds();
    if (data.whiskies.length) {
      const { error } = await sb.from("whiskies").upsert(data.whiskies.map(whiskyToDb));
      if (error) throw error;
    }
    if (data.tastings.length) {
      const { error } = await sb.from("tasting_sessions").upsert(data.tastings.map(tastingToDb));
      if (error) throw error;
    }
    lastCloudSyncAt = new Date().toISOString();
    setCloudStatus("클라우드 동기화","online");
    updateLastSyncText();
  } catch (e) {
    console.error("Cloud push failed", e);
    setCloudStatus("동기화 오류","error");
  } finally {
    cloudSyncing = false;
  }
}

async function pullCloud(){
  if (!cloudUser) return false;
  setCloudStatus("불러오는 중…","syncing");
  const [{data:ws,error:we},{data:ts,error:te}] = await Promise.all([
    sb.from("whiskies").select("*").order("created_at",{ascending:false}),
    sb.from("tasting_sessions").select("*").order("tasting_date",{ascending:false})
  ]);
  if (we || te) {
    console.error("Cloud pull failed", we || te);
    setCloudStatus("동기화 오류","error");
    return false;
  }
  if (!ws?.length && !ts?.length) {
    setCloudStatus("클라우드 비어 있음","online");
    return false;
  }
  data = { whiskies:(ws||[]).map(dbToWhisky), tastings:(ts||[]).map(dbToTasting) };
  selectedWhiskyId = data.whiskies[0]?.id || null;
  await refreshPrivateImageUrls();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
  lastCloudSyncAt = new Date().toISOString();
  setCloudStatus("클라우드 동기화","online");
  updateLastSyncText();
  return true;
}

function scheduleCloudSync(){
  if (!cloudUser) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(pushCloud, 600);
}

save = function(){
  originalSave();
  scheduleCloudSync();
};

async function firstCloudHandshake(){
  if (!cloudUser) return;
  const { count, error } = await sb.from("whiskies").select("*",{count:"exact",head:true});
  if (error) return console.error(error);

  if ((count||0) > 0) {
    await pullCloud();
    return;
  }

  if (!localStorage.getItem(CLOUD_MIGRATED_KEY)) {
    const hasLocal = data.whiskies?.length || data.tastings?.length;
    if (hasLocal) {
      const ok = confirm("이 브라우저의 현재 위스키 기록을 클라우드로 가져올까요?\n\n확인을 누르면 휴대폰/PC에서 같은 기록을 사용할 수 있습니다.");
      if (ok) await pushCloud();
    }
    localStorage.setItem(CLOUD_MIGRATED_KEY,"1");
  }
}

async function signIn(){
  const email = document.querySelector("#authEmail")?.value.trim();
  const password = document.querySelector("#authPassword")?.value;
  if (!email || !password) return alert("이메일과 비밀번호를 입력해 주세요.");
  const { error } = await sb.auth.signInWithPassword({email,password});
  if (error) alert("로그인 실패: " + error.message);
}

async function signUp(){
  const email = document.querySelector("#authEmail")?.value.trim();
  const password = document.querySelector("#authPassword")?.value;
  if (!email || !password) return alert("이메일과 비밀번호를 입력해 주세요.");
  const { data:res, error } = await sb.auth.signUp({
    email,password,
    options:{ emailRedirectTo: window.location.origin + window.location.pathname }
  });
  if (error) return alert("가입 실패: " + error.message);
  if (res.session) alert("계정 생성과 로그인이 완료됐습니다.");
  else alert("가입 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.");
}

async function signOut(){
  await sb.auth.signOut();
}

function verifiedValue(field){
  return field?.status === "verified" ? field.value : null;
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function safeHttpUrl(value){
  try{
    const u=new URL(String(value||""));
    return ["http:","https:"].includes(u.protocol) ? u.href : "";
  }catch{return ""}
}

function sourceDomain(url){
  try{return new URL(url).hostname.replace(/^www\./,"")}catch{return ""}
}

function buildSourceList(res,result){
  const all = Array.isArray(res?.sources) ? res.sources : [];
  const used = new Set();

  Object.values(result?.fields || {}).forEach(field=>{
    if(field?.status==="verified"){
      const u=safeHttpUrl(field?.source_url);
      if(u) used.add(u);
    }
  });

  (Array.isArray(result?.price_candidates) ? result.price_candidates : []).forEach(p=>{
    if(p?.status==="verified"){
      const u=safeHttpUrl(p?.source_url);
      if(u) used.add(u);
    }
  });

  const official=safeHttpUrl(result?.official_product_url);
  if(official) used.add(official);

  const items = all.map((src,i)=>{
    const url=safeHttpUrl(src?.url);
    if(!url) return "";
    const title=escapeHtml(src?.title || sourceDomain(url) || ("출처 "+(i+1)));
    const domain=escapeHtml(sourceDomain(url));
    const verified=used.has(url);
    return `<li class="ai-source-item ${verified?"verified":""}">
      <span class="ai-source-mark">${verified?"✓":"·"}</span>
      <div>
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${title}</a>
        <div class="ai-source-domain">${domain}${verified?" · 직접 검증에 사용":""}</div>
      </div>
    </li>`;
  }).filter(Boolean).join("");

  return {
    usedCount: used.size,
    totalCount: all.length,
    html: items ? `<details class="ai-sources">
      <summary>출처 ${all.length}개 보기</summary>
      <div class="ai-sources-note">✓ 표시는 실제 자동입력 값의 검증 근거로 사용된 출처입니다.</div>
      <ol class="ai-source-list">${items}</ol>
    </details>` : ""
  };
}

async function runWhiskyLookup(form){
  if (!cloudUser) return alert("AI 검색은 로그인 후 사용할 수 있습니다.");
  const name = form.elements.name.value.trim();
  if (!name) return alert("먼저 위스키 이름을 입력해 주세요.");
  const status = form.querySelector("[data-ai-status]");
  const btn = form.querySelector("[data-ai-lookup]");
  btn.disabled = true;
  status.textContent = "공식/신뢰 출처를 검색하고 있습니다…";

  try {
    const { data:res, error } = await sb.functions.invoke(WHISKY_LOOKUP_FUNCTION,{body:{query:name}});
    if (error) throw error;
    if (res?.error) throw new Error(res.error + (res.detail ? ": "+res.detail : ""));

    const result = res.result || {};
    const f = result.fields || {};
    const values = {
      nameKo: result.name_ko || "",
      bottlingType: verifiedValue(f.bottling_type) || "unknown",
      bottler: verifiedValue(f.bottler),
      distillery: verifiedValue(f.distillery),
      seriesName: verifiedValue(f.series_name),
      country: verifiedValue(f.country),
      region: verifiedValue(f.region),
      vintageYear: verifiedValue(f.vintage_year),
      bottlingYear: verifiedValue(f.bottling_year),
      age: verifiedValue(f.is_nas) === true ? "NAS" : verifiedValue(f.age_years),
      abv: verifiedValue(f.abv),
      cask: verifiedValue(f.cask),
      caskNumber: verifiedValue(f.cask_number),
      singleCask: verifiedValue(f.single_cask),
      bottleCount: verifiedValue(f.bottle_count),
      caskStrength: verifiedValue(f.cask_strength),
      batchRelease: verifiedValue(f.batch_release),
      officialImageUrl: res.image_url || "",
      imageUrl: res.image_url || "",
      officialProductUrl: result.official_product_url || "",
      referenceUrl: result.reference_url || res.reference_url || "",
      sourceName: result.source_name || (result.official_product_url ? "Official source" : "")
    };

    Object.entries(values).forEach(([key,val])=>{
      if (val === null || val === undefined || val === "") return;
      const input=form.elements[key];
      if (key==="imageUrl" && form.elements.imagePath?.value) return;
      if (input) {
        if (typeof val === "boolean") input.value = val ? "true" : "false";
        else input.value=String(val);
      }
    });

    const prices = Array.isArray(result.price_candidates) ? result.price_candidates : [];
    const krw = prices.find(p=>p.currency==="KRW");
    if (krw && form.elements.marketPrice) form.elements.marketPrice.value = Math.round(krw.price);

    const imgUrl=safeHttpUrl(res.image_url);
    const img = imgUrl ? `<div class="ai-image-preview"><img src="${escapeHtml(imgUrl)}" alt="제품 이미지" referrerpolicy="no-referrer"></div>` : "";
    const officialUrl=safeHttpUrl(result.official_product_url);
    const referenceUrl=safeHttpUrl(result.reference_url || res.reference_url);
    const official = officialUrl ? ` · <a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer">공식 출처</a>` : "";
    const reference = referenceUrl ? ` · <a href="${escapeHtml(referenceUrl)}" target="_blank" rel="noopener noreferrer">Whiskybase 참고 검색</a>` : "";
    const sourceInfo=buildSourceList(res,result);
    const resolvedSearch = res.resolved_query_en
      ? `<div class="ai-resolved-query">해외 검색명: <b>${escapeHtml(res.resolved_query_en)}</b></div>`
      : "";
    status.innerHTML = res.grounded
      ? `검색 완료 · 검색 출처 <b>${sourceInfo.totalCount}개</b> · 직접 검증 <b>${sourceInfo.usedCount}개</b> · 확인된 값만 자동 입력${official}${reference}${resolvedSearch}${sourceInfo.html}${img}`
      : "검색 근거를 확보하지 못해 값을 자동 입력하지 않았습니다.";

    const { error:logError } = await sb.from("ai_lookup_runs").insert({
      user_id:cloudUser.id,
      query_text:name,
      model:res.model || null,
      status:res.grounded ? "completed" : "partial",
      result:res,
      source_count:res.sources?.length || 0
    });
    if (logError) console.warn(logError);
  } catch(e) {
    console.error(e);
    let message = e.message || "알 수 없는 오류";
    try {
      if (e.context && typeof e.context.json === "function") {
        const body = await e.context.json();
        message = body?.detail || body?.error || message;
      }
    } catch {}
    status.textContent = "AI 검색 실패: " + message;
  } finally {
    btn.disabled=false;
  }
}

window.cloudDeleteWhisky = async function(id){
  if (!id) return;
  const removedBefore = data.whiskies.find(w=>w.id===id);
  if (cloudUser) {
    if(removedBefore?.imagePath){
      const {error:imageDeleteError}=await sb.storage.from("whisky-images").remove([removedBefore.imagePath]);
      if(imageDeleteError) console.warn(imageDeleteError);
    }
    const { error } = await sb.from("whiskies").delete().eq("id",id).eq("user_id",cloudUser.id);
    if (error) {
      console.error(error);
      alert("클라우드 삭제 실패: " + error.message);
      return;
    }
  }
  const removed = data.whiskies.find(w=>w.id===id);
  data.tastings = data.tastings.map(t=>t.whiskyId===id
    ? {...t, whiskyId:null, whiskyName:t.whiskyName || removed?.name || "Unknown"}
    : t);
  data.whiskies = data.whiskies.filter(w=>w.id!==id);
  selectedWhiskyId = data.whiskies[0]?.id || null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
};

document.addEventListener("click", e=>{
  if (e.target.id==="signInBtn") signIn();
  if (e.target.id==="signUpBtn") signUp();
  if (e.target.id==="signOutBtn") signOut();
  if (e.target.id==="syncNowBtn") pushCloud();
  if (e.target.id==="pullCloudBtn") {
    if (confirm("현재 브라우저 데이터를 클라우드 데이터로 교체할까요?")) pullCloud();
  }
  if (e.target.matches("[data-ai-lookup]")) {
    const form=e.target.closest("form");
    if(form) runWhiskyLookup(form);
  }
});

(async function initCloud(){
  injectCloudUI();
  const {data:{session}}=await sb.auth.getSession();
  cloudUser=session?.user || null;
  updateAccountUI();
  if(cloudUser) await firstCloudHandshake();

  sb.auth.onAuthStateChange(async (_event,session)=>{
    const before=cloudUser?.id;
    cloudUser=session?.user || null;
    updateAccountUI();
    if(cloudUser && cloudUser.id!==before) await firstCloudHandshake();
  });
})();