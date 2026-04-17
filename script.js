let gender = "female";
let currentPart = "";
let currentChar = null;
let characters = [];

function setGender(g) {
  gender = g;

  // เปิดเลือก skin แทนปุ่ม skin เดิม
  openSkinPicker();
}

function openSkinPicker() {

  let picker = document.getElementById("picker");
  picker.innerHTML = "";
  picker.classList.remove("hidden");

  for (let i = 1; i <= 3; i++) {
    let img = document.createElement("img");
    img.src = `assets/${gender}/skin${i}.png`;

    img.onclick = () => {
      if (!currentChar) return;

      let target = currentChar.querySelector("#skin");
      target.src = img.src;

      picker.classList.add("hidden");
    };

    picker.appendChild(img);
  }
}
// =====================
// ADD CHARACTER
// =====================
function addCharacter() {

  if (characters.length >= 5) return;

  let div = document.createElement("div");
  div.className = "character";

  let parts = ["skin","hair","pants","shirt","shoes"];
  parts.forEach(p=>{
    let img = document.createElement("img");
    img.id = p;

    // 👇 เพิ่มตรงนี้
    if (p === "skin") {
      img.src = `assets/${gender}/skin1.png`;
    }

    div.appendChild(img);
  });

  div.onclick = () => currentChar = div;

  document.getElementById("characters").appendChild(div);
  characters.push(div);
  currentChar = div;

  // 👇 เปิด drag
  enableDrag(div);
}

// =====================
// DELETE
// =====================
function deleteCharacter() {
  if (!currentChar) return;

  currentChar.remove();
  characters = characters.filter(c => c !== currentChar);
  currentChar = null;
}

// =====================
// PICKER (สำคัญ)
// =====================
function openPicker(part) {

  currentPart = part;

  let picker = document.getElementById("picker");
  picker.innerHTML = "";
  picker.classList.remove("hidden");

  for (let i = 1; i <= 2; i++) {
    let img = document.createElement("img");
    img.src = `assets/${gender}/${part}${i}.png`;

    img.onclick = () => {
      if (!currentChar) return;

      let target = currentChar.querySelector(`#${part}`);
      target.src = img.src;

      picker.classList.add("hidden");
    };

    picker.appendChild(img);
  }
}

// =====================
// BG
// =====================
function toggleBG() {

  let picker = document.getElementById("picker");
  picker.innerHTML = "";
  picker.classList.remove("hidden");

  ["bg1.png","bg2.png","bg3.png"].forEach(src => {
    let img = document.createElement("img");
    img.src = src;

    img.onclick = () => {
      document.getElementById("bg").src = src;
      picker.classList.add("hidden");
    };

    picker.appendChild(img);
  });
}

// =====================
// PREVIEW
// =====================
function showPreview() {

  html2canvas(document.getElementById("canvas")).then(c => {

    document.getElementById("previewImg").src = c.toDataURL();

    document.getElementById("preview").classList.remove("hidden");
  });
}

function back() {
  document.getElementById("preview").classList.add("hidden");
}

window.onload = () => {
  if (characters.length === 0) {
    addCharacter();
  }
};

function enableDrag(el) {

  let startX = 0, startY = 0;
  let x = 0, y = 0;

  function clamp() {

    let rect = el.getBoundingClientRect();
    let parent = document.getElementById("canvas").getBoundingClientRect();

    // กันหลุดซ้าย/บน
    if (rect.left < parent.left) x += parent.left - rect.left;
    if (rect.top < parent.top) y += parent.top - rect.top;

    // กันหลุดขวา/ล่าง
    if (rect.right > parent.right) x -= rect.right - parent.right;
    if (rect.bottom > parent.bottom) y -= rect.bottom - parent.bottom;
  }

  function update() {
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = "translate(0,0)";
  }

  // ===== DESKTOP =====
  el.addEventListener("mousedown", (e) => {

    startX = e.clientX - x;
    startY = e.clientY - y;

    function move(e) {
      x = e.clientX - startX;
      y = e.clientY - startY;

      update();
      clamp();   // 👈 เพิ่มตรงนี้
      update();
    }

    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });

  // ===== MOBILE =====
  el.addEventListener("touchstart", (e) => {

    let t = e.touches[0];
    startX = t.clientX - x;
    startY = t.clientY - y;

    function move(e) {
      let t = e.touches[0];

      x = t.clientX - startX;
      y = t.clientY - startY;

      update();
      clamp();   // 👈 เพิ่มตรงนี้
      update();
    }

    function end() {
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    }

    document.addEventListener("touchmove", move);
    document.addEventListener("touchend", end);
  });
}

function addLogo(src) {

  let img = document.createElement("img");
  img.src = src;
  img.className = "logo";

  document.getElementById("previewCanvas").appendChild(img);

  enableTransform(img);
}

function enableTransform(el) {

  let x = 200, y = 200;
  let scale = 1;

  let startX = 0, startY = 0;
  let startDist = 0;

  // ================= DRAG =================
  el.addEventListener("mousedown", (e) => {

    startX = e.clientX - x;
    startY = e.clientY - y;

    function move(e) {
      x = e.clientX - startX;
      y = e.clientY - startY;

      update();
    }

    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });

  // ================= TOUCH =================
  el.addEventListener("touchstart", (e) => {

    if (e.touches.length === 1) {
      let t = e.touches[0];
      startX = t.clientX - x;
      startY = t.clientY - y;
    }

    if (e.touches.length === 2) {
      startDist = getDistance(e.touches);
    }

    function move(e) {

      if (e.touches.length === 1) {
        let t = e.touches[0];
        x = t.clientX - startX;
        y = t.clientY - startY;
      }

      if (e.touches.length === 2) {
        let newDist = getDistance(e.touches);
        scale *= newDist / startDist;
        startDist = newDist;
      }

      update();
    }

    function end() {
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    }

    document.addEventListener("touchmove", move);
    document.addEventListener("touchend", end);
  });

  function update() {
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = `scale(${scale})`;
  }

  function getDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

function back() {
  document.getElementById("preview").classList.add("hidden");
}

function download() {
  html2canvas(document.getElementById("previewCanvas")).then(c => {
    let link = document.createElement("a");
    link.download = "final.png";
    link.href = c.toDataURL();
    link.click();
  });
}