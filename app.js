/************ DADOS MOCK ************/
const PROFESSIONALS = [
  {
    id: 1,
    name: "Dra. Juliana Santos",
    crp: "CRP 06/123456",
    price: 120,
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=400&auto=format&fit=crop",
    langs: ["pt","en"],
    specs: ["ansiedade","depressao"],
    tags: ["Terapia Cognitivo-Comportamental","Adultos","Online"],
    online: true
  },
  {
    id: 2,
    name: "Dr. Davide Penter",
    crp: "CRP 08/998877",
    price: 150,
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=400&auto=format&fit=crop",
    langs: ["pt","es"],
    specs: ["casal","luto"],
    tags: ["Casal e Família","Mediação de Conflitos"],
    online: true
  },
  {
    id: 3,
    name: "Dra. Careme Jorinso",
    crp: "CRP 04/223344",
    price: 90,
    rating: 4.7,
    avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
    langs: ["pt"],
    specs: ["tdah","ansiedade"],
    tags: ["Neuropsicologia","Adolescentes"],
    online: false
  },
  {
    id: 4,
    name: "Dr. Auariac Rab",
    crp: "CRP 02/556677",
    price: 200,
    rating: 5.0,
    avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop",
    langs: ["pt","en","es"],
    specs: ["burnout","depressao"],
    tags: ["Executivos","Alta performance"],
    online: true
  }
];

/************ HELPERS ************/
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const getParams = () => Object.fromEntries(new URLSearchParams(location.search));
const fmtStars = v => "★".repeat(Math.round(v));
const ls = {
  get:(k,def=null)=>{try{return JSON.parse(localStorage.getItem(k)) ?? def}catch{return def}},
  set:(k,v)=>localStorage.setItem(k, JSON.stringify(v)),
  del:(k)=>localStorage.removeItem(k)
};

/************ HOME ************/
function initHome(){
  const cardsEl = $("#cards");
  const chipsEl = $("#chips");
  const selectEsp = $("#selectEspecializacao");
  const priceRange = $("#priceRange");
  const priceOut = $("#priceOut");
  const searchInput = $("#searchInput");

  function currentLangs(){
    return $$(".toggle input:checked").map(i=>i.value);
  }

  function createCard(p){
    const card = document.createElement("div");
    card.className = "card glass";
    card.innerHTML = `
      <span class="badge-online" style="display:${p.online?'inline-flex':'none'}">AO VIVO</span>
      <div class="top">
        <div class="avatar" style="background-image:url('${p.avatar}')"></div>
        <div>
          <div class="name">${p.name}</div>
          <div class="sub">${p.crp}</div>
        </div>
      </div>
      <div class="tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <div class="row">
        <div class="price">R$ ${p.price}</div>
        <div class="rating"><i class='bx bxs-star'></i> ${p.rating.toFixed(1)}</div>
      </div>
      <div class="row">
        <div class="actions">
          <button class="btn ghost icon" title="Favoritar"><i class='bx bx-heart'></i></button>
          <button class="btn ghost icon" title="Chat"><i class='bx bx-message-rounded-dots'></i></button>
        </div>
        <a class="btn book" href="agenda.html?id=${p.id}"><i class='bx bx-calendar-plus'></i> Agendar</a>
      </div>
    `;
    // efeito glow direcional
    card.addEventListener("pointermove",(e)=>{
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left)/r.width)*100;
      const y = ((e.clientY - r.top)/r.height)*100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
    return card;
  }

  function apply(){
    const chipEsp = $(".chip.active")?.dataset.value || "todos";
    const select = selectEsp.value;
    const esp = select!=="todos" ? select : chipEsp;

    const maxPrice = +priceRange.value; priceOut.textContent = maxPrice;
    const langs = currentLangs();
    const q = searchInput.value.trim().toLowerCase();

    const res = PROFESSIONALS.filter(p=>{
      const okEsp = esp==="todos" ? true : p.specs.includes(esp);
      const okPrice = p.price <= maxPrice;
      const okLang = p.langs.some(l=>langs.includes(l));
      const okSearch = q ? (p.name.toLowerCase().includes(q) || p.crp.toLowerCase().includes(q) || p.tags.join(" ").toLowerCase().includes(q)) : true;
      return okEsp && okPrice && okLang && okSearch;
    });
    cardsEl.innerHTML = res.length ? "" : `<div class="glass" style="padding:16px;border-radius:16px">Nenhum profissional encontrado.</div>`;
    res.forEach(p => cardsEl.appendChild(createCard(p)));
  }

  chipsEl.addEventListener("click",(e)=>{
    const b = e.target.closest(".chip"); if(!b) return;
    $$(".chip", chipsEl).forEach(c=>c.classList.remove("active")); b.classList.add("active");
    selectEsp.value="todos"; apply();
  });
  selectEsp.addEventListener("change", ()=>{$$(".chip", chipsEl).forEach(c=>c.classList.remove("active")); apply();});
  priceRange.addEventListener("input", apply);
  searchInput.addEventListener("input", apply);
  $$(".toggle input").forEach(i=>i.addEventListener("change", apply));
  $("#clearFilters").addEventListener("click", ()=>{
    $$(".chip", chipsEl).forEach((c,i)=>c.classList.toggle("active", i===0));
    selectEsp.value="todos"; priceRange.value=300; priceOut.textContent=300;
    $$(".toggle input").forEach((i,idx)=> i.checked = idx===0);
    searchInput.value=""; apply();
  });

  apply();
}

/************ AGENDA ************/
function initAgenda(){
  const params = getParams();
  const id = Number(params.id) || 1;
  const p = PROFESSIONALS.find(x=>x.id===id) || PROFESSIONALS[0];

  $("#agAvatar").style.backgroundImage = `url('${p.avatar}')`;
  $("#agName").textContent = p.name;
  $("#agSub").textContent = `${p.crp} • ${p.tags[0]||""}`;
  $("#agStars").textContent = fmtStars(p.rating);

  const cal = $("#calendar");
  const times = $("#times");
  let selectedDate = null;
  let selectedSlot = null;

  function buildSlots(){
    const base = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","19:00"];
    times.innerHTML = "";
    base.forEach(t=>{
      const b = document.createElement("button");
      b.className = "slot"; b.textContent = t;
      b.onclick = ()=>{ $$(".slot",times).forEach(s=>s.classList.remove("active")); b.classList.add("active"); selectedSlot=t; };
      times.appendChild(b);
    });
  }

  function buildCalendar(date){
    cal.innerHTML = "";
    const head = document.createElement("div");
    head.className = "cal-head";
    head.innerHTML = `
      <div></div>
      <div class="cal-nav">
        <button id="prevM"><i class='bx bx-chevron-left'></i></button>
        <h4 style="margin:0 4px; text-transform:capitalize">${date.toLocaleDateString("pt-BR",{month:"long", year:"numeric"})}</h4>
        <button id="nextM"><i class='bx bx-chevron-right'></i></button>
      </div>`;
    head.style.gridColumn = "1 / -1";
    cal.appendChild(head);

    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = first.getDay() || 7;
    const days = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();

    for(let i=1;i<startDay;i++){
      const d = document.createElement("div");
      d.className="day muted glass"; cal.appendChild(d);
    }
    for(let d=1; d<=days; d++){
      const el = document.createElement("button");
      el.className = "day"; el.textContent = d;
      el.onclick = ()=>{ $$(".day",cal).forEach(x=>x.classList.remove("selected")); el.classList.add("selected"); selectedDate = new Date(date.getFullYear(), date.getMonth(), d); };
      cal.appendChild(el);
    }
    $("#prevM").onclick = ()=>{ date.setMonth(date.getMonth()-1); buildCalendar(date); };
    $("#nextM").onclick = ()=>{ date.setMonth(date.getMonth()+1); buildCalendar(date); };
  }

  buildCalendar(new Date());
  buildSlots();

  $("#confirmAg").onclick = ()=>{
    if(!selectedDate || !selectedSlot) return alert("Escolha data e horário.");
    const apt = {
      proId: p.id,
      name: p.name,
      avatar: p.avatar,
      crp: p.crp,
      date: selectedDate.toISOString(),
      time: selectedSlot
    };
    const list = ls.get("appointments", []);
    list.push(apt);
    ls.set("appointments", list);
    alert(`✅ Consulta confirmada com ${p.name} em ${selectedDate.toLocaleDateString("pt-BR")} às ${selectedSlot}`);
    location.href = "perfil.html";
  };
}

/************ PERFIL + LOGIN ************/
function initPerfil(){
  const root = $("#perfilContainer");
  const user = ls.get("user");

  function renderLogin(){
    root.innerHTML = `
      <section class="glass" style="padding:18px">
        <h2>Entrar</h2>
        <p class="sub">Faça login rápido para gerenciar suas consultas.</p>
        <form id="loginForm" class="grid2">
          <input class="inp" type="text" id="name" placeholder="Seu nome" required />
          <input class="inp" type="email" id="email" placeholder="Seu e-mail" required />
          <button class="btn primary" type="submit"><i class='bx bx-log-in'></i> Entrar</button>
        </form>
      </section>
    `;
    $("#loginForm").onsubmit = (e)=>{
      e.preventDefault();
      const u = { name: $("#name").value.trim(), email: $("#email").value.trim() };
      if(!u.name || !u.email) return;
      ls.set("user", u);
      renderPerfil();
    };
  }

  function renderPerfil(){
    const u = ls.get("user");
    if(!u) return renderLogin();
    const apts = ls.get("appointments", []);
    root.innerHTML = `
      <section class="glass" style="padding:18px; display:grid; gap:12px">
        <div style="display:flex; align-items:center; gap:12px">
          <div class="avatar" style="background-image:url('https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop'); width:64px; height:64px"></div>
          <div>
            <h2 style="margin:0">${u.name}</h2>
            <div class="sub">${u.email}</div>
          </div>
          <span style="flex:1"></span>
          <button id="logout" class="btn ghost sm"><i class='bx bx-log-out'></i> Sair</button>
        </div>

        <div class="divider"></div>

        <h3>Minhas consultas</h3>
        <div class="cards" id="aptList"></div>

        <div class="row" style="justify-content:flex-end">
          <a href="agenda.html" class="btn primary"><i class='bx bx-calendar-plus'></i> Agendar nova</a>
        </div>
      </section>
    `;
    $("#logout").onclick = ()=>{ ls.del("user"); location.reload(); };

    const list = $("#aptList");
    if(!apts.length){
      list.innerHTML = `<div class="glass" style="padding:16px;border-radius:16px">Você ainda não possui consultas. <a href="agenda.html">Agende agora</a>.</div>`;
    }else{
      apts.forEach(a=>{
        const d = new Date(a.date);
        const card = document.createElement("div");
        card.className = "card glass";
        card.innerHTML = `
          <div class="top">
            <div class="avatar" style="background-image:url('${a.avatar}')"></div>
            <div>
              <div class="name">${a.name}</div>
              <div class="sub">${a.crp}</div>
            </div>
          </div>
          <div class="row">
            <div class="tag">📅 ${d.toLocaleDateString("pt-BR")} • ${a.time}</div>
            <div class="tag">Online</div>
          </div>
          <div class="row">
            <a class="btn ghost icon" href="agenda.html?id=${a.proId}" title="Remarcar"><i class='bx bx-refresh'></i></a>
            <button class="btn ghost icon del" title="Cancelar"><i class='bx bx-x'></i></button>
          </div>
        `;
        card.querySelector(".del").onclick = ()=>{
          const all = ls.get("appointments", []);
          const idx = all.findIndex(x=>x === a);
          if(idx>-1){ all.splice(idx,1); ls.set("appointments", all); renderPerfil(); }
        };
        list.appendChild(card);
      });
    }
  }

  user ? renderPerfil() : renderLogin();
}

/************ ENTRYPOINT ************/
const page = document.body.dataset.page;
if(page === "home") initHome();
if(page === "agenda") initAgenda();
if(page === "perfil") initPerfil();
