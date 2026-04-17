let gender = "female";
let currentPart = "";
let currentChar = null;
let characters = [];

// =====================
// GENDER
// =====================
function setGender(g) {
  gender = g;
  openSkinPicker();
}

// =====================
// SKIN PICKER
// =====================
function openSkinPicker() {

  let picker = document.getElementById("picker");
  picker.innerHTML = "";
  picker.classList.remove("hidden");

  for (let i = 1; i <= 3; i++) {
    let img = document.createElement("img");
    img.src = `assets/${gender}/skin${i}.png`;

    img.onclick = () => {

      if (!currentChar) {
        alert("กรุณาเลือกตัวละครก่อน");
        return;
      }

      let target = currentChar.querySelector(".skin");
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

  const char = document.createElement("div");
  char.className = "character";

  char.innerHTML = `
    <img class="skin" src="assets/${gender}/skin1.png">
    <img class="hair">
    <img class="shirt">
    <img class="pants">
    <img class="shoes">
  `;

  char.style.position = "absolute";
  char.style.left = "50%";
  char.style.top = "50%";
  char.style.transform = "translate(-50%, -50%)"; // ✅ แก้แล้ว
  char.dataset.scale = 1;

  // 👉 คลิกเลือกตัวละคร
  char.addEventListener("click", (e) => {
    e.stopPropagation();

    currentChar = char;

    document.querySelectorAll(".character").forEach(c => {
      c.style.outline = "none";
    });

    char.style.outline = "3px solid yellow";
  });

  enableDrag(char);
  enableGesture(char);

  document.getElementById("characterLayer").appendChild(char);

  currentChar = char;
  characters.push(char);
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
// PICKER
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

      if (!currentChar) {
        alert("กรุณาเลือกตัวละครก่อน");
        return;
      }

      let target = currentChar.querySelector(`.${part}`);
      if (!target) return;

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

function download() {
  html2canvas(document.getElementById("previewCanvas")).then(c => {
    let link = document.createElement("a");
    link.download = "final.png";
    link.href = c.toDataURL();
    link.click();
  });
}

// =====================
// AUTO ADD FIRST CHAR
// =====================
window.onload = () => {
  if (characters.length === 0) {
    addCharacter();
  }
};

// =====================
// DRAG
// =====================
function enableDrag(el) {

  let startX = 0, startY = 0;
  let x = 0, y = 0;

  function clamp() {

    let rect = el.getBoundingClientRect();
    let parent = document.getElementById("canvas").getBoundingClientRect();

    if (rect.left < parent.left) x += parent.left - rect.left;
    if (rect.top < parent.top) y += parent.top - rect.top;
    if (rect.right > parent.right) x -= rect.right - parent.right;
    if (rect.bottom > parent.bottom) y -= rect.bottom - parent.bottom;
  }

  function update() {
    el.style.left = x + "px";
    el.style.top = y + "px";
  }

  // ===== DESKTOP =====
  el.addEventListener("mousedown", (e) => {

    startX = e.clientX - x;
    startY = e.clientY - y;

    function move(e) {
      x = e.clientX - startX;
      y = e.clientY - startY;

      update();
      clamp();
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

    if (e.touches.length > 1) return;

    let t = e.touches[0];
    startX = t.clientX - x;
    startY = t.clientY - y;

    function move(e) {

      if (e.touches.length > 1) return;

      let t = e.touches[0];

      x = t.clientX - startX;
      y = t.clientY - startY;

      update();
      clamp();
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

// =====================
// PINCH ZOOM
// =====================
function enableGesture(el) {

  let startDist = 0;
  let startScale = 1;

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  el.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      startDist = getDistance(e.touches);
      startScale = parseFloat(el.dataset.scale || 1);
    }
  });

  el.addEventListener("touchmove", (e) => {

    if (e.touches.length === 2) {
      e.preventDefault();

      const newDist = getDistance(e.touches);

      let scale = startScale * (newDist / startDist);

      scale = Math.max(0.5, Math.min(scale, 3));

      el.dataset.scale = scale;

      el.style.transform = `scale(${scale})`; // ✅ ไม่ชน drag
    }
  });
}

// =====================
// LOGO
// =====================
function addLogo(src) {

  let img = document.createElement("img");
  img.src = src;
  img.className = "logo";

  document.getElementById("previewCanvas").appendChild(img);

  enableTransform(img);
}

// =====================
// LOGO TRANSFORM
// =====================
function enableTransform(el) {

  let x = 200, y = 200;
  let scale = 1;

  let startX = 0, startY = 0;
  let startDist = 0;

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

// =====================
// CLICK BG = UNSELECT
// =====================
document.getElementById("canvas").addEventListener("click", () => {
  currentChar = null;

  document.querySelectorAll(".character").forEach(c => {
    c.style.outline = "none";
  });
});
