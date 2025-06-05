const birthYear = 1998;
const startYear = 2016;
const endYear = 2025;
const currentMonth = 6;
const monthNames = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const mcVers = ["1.0.0","1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8","1.9","1.10","1.11","1.12","1.14","1.16","1.18"];
const menu = document.getElementById("menu-container");
const tbodyElem = document.getElementById("table-body");
buildMenuTable(); bindSearch(); bindNavLinks(); initTheme(); initResizer();

function buildMenuTable() {
  for (let year = startYear; year <= endYear; year++) {
    const age = year - birthYear;
    const yearBtn = document.createElement("div");
    yearBtn.className = "year";
    yearBtn.innerHTML = `${year} · ${age} anni`;
    yearBtn.setAttribute("role","button");
    yearBtn.setAttribute("aria-expanded","false");
    const ul = document.createElement("ul"); ul.className = "months";
    const limit = year === endYear ? currentMonth : 12;
    for (let m = 0; m < limit; m++) {
      const baseIndex = age - (startYear - birthYear);
      const baseVer = mcVers[baseIndex] || mcVers.at(-1);
      const cleanVer = baseVer.replace(/\.0$/,'');
      const version = `${age} ${cleanVer}.${m+1}`;
      const id = `ver-${age}_${cleanVer.replace(/\./g,'_')}_${m+1}`;
      const li = document.createElement("li");
      li.innerHTML = `<a class='link' href='#${id}'>${monthNames[m]}</a>`;
      ul.appendChild(li);

      const tr = document.createElement("tr");
      tr.id = id;
      tr.innerHTML = `<td>${version}</td><td>Descrizione per la versione ${version}</td><td><a class='download' href='info/${id}.html' target='_blank'><i data-lucide='file-text'></i> Dettagli</a></td>`;
      tbodyElem.appendChild(tr);
    }
    yearBtn.addEventListener("click", () => {
      ul.classList.toggle("show");
      yearBtn.classList.toggle("open");
      yearBtn.setAttribute("aria-expanded", ul.classList.contains("show"));
    });
    const wrapper = document.createElement("div"); wrapper.append(yearBtn, ul);
    menu.appendChild(wrapper);
  }
  if (window.lucide) lucide.createIcons();
}
function bindNavLinks() {
  document.addEventListener("click", e => {
    if (e.target.matches(".months a")) {
      e.preventDefault();
      scrollToRow(e.target.getAttribute("href").slice(1), true);
    }
  });
  if (location.hash.slice(1)) scrollToRow(location.hash.slice(1));
}
function scrollToRow(id, smooth = false) {
  const row = document.getElementById(id);
  if (!row) return;
  const container = document.querySelector(".content-area");
  const top = row.offsetTop - container.clientHeight/2 + row.clientHeight/2;
  container.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  row.classList.remove("highlight");
  void row.offsetWidth;
  row.classList.add("highlight");
  history.replaceState(null, "", `#${id}`);
}
function bindSearch() {
  document.getElementById("search-input").addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    [...tbodyElem.rows].forEach(r => r.style.display = r.textContent.toLowerCase().includes(term) ? "" : "none");
  });
}
function initTheme() {
  const checkbox = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme");
  const initial = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(initial);
  checkbox.checked = (initial === "dark");
  checkbox.addEventListener("change", () => setTheme(checkbox.checked ? "dark" : "light"));
  function setTheme(mode) {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("theme", mode);
    lucide.createIcons();
  }
}
function initResizer() {
  const res = document.getElementById("resizer");
  const sidebar = document.querySelector("aside");
  const main = document.querySelector("main");
  const headerHeight = document.querySelector("header").offsetHeight;
  const resizerHeight = res.offsetHeight;
  const MIN_DESKTOP = 180;
  let dragging = false;
  res.addEventListener("mousedown", e => {
    if (window.innerWidth <= 600) return;
    dragging = true;
    document.body.style.cursor = "col-resize";
  });
  document.addEventListener("mousemove", e => {
    if (!dragging || window.innerWidth <= 600) return;
    const width = Math.max(MIN_DESKTOP, Math.min(e.clientX, window.innerWidth - MIN_DESKTOP));
    document.documentElement.style.setProperty("--divider-width", width + "px");
  });
  document.addEventListener("mouseup", () => { dragging = false; document.body.style.cursor = ""; });

  const MIN_MOBILE = 120;
  let startY = 0, startHeight = 0;
  res.addEventListener("touchstart", e => {
    if (window.innerWidth > 600) return;
    const touch = e.touches[0];
    startY = touch.clientY;
    startHeight = sidebar.offsetHeight;
    document.body.style.cursor = "row-resize";
  }, { passive: true });
  res.addEventListener("touchmove", e => {
    if (window.innerWidth > 600) return;
    const touch = e.touches[0];
    const delta = touch.clientY - startY;
    let newHeight = startHeight + delta;
    const maxHeight = window.innerHeight - headerHeight - resizerHeight - MIN_MOBILE;
    newHeight = Math.max(MIN_MOBILE, Math.min(newHeight, maxHeight));
    sidebar.style.height = newHeight + "px";
    main.style.height = `calc(100% - ${newHeight}px - ${resizerHeight}px)`;
  }, { passive: false });
  res.addEventListener("touchend", () => { document.body.style.cursor = ""; });
}
