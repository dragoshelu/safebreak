const vaults = [
  { name: "Iron Safe", hp: 10000 },
  { name: "Bank Vault", hp: 25000 },
  { name: "Casino Vault", hp: 50000 },
  { name: "Diamond Vault", hp: 90000 },
  { name: "Fort Knox", hp: 150000 },
  { name: "Alien Vault", hp: 250000 },
  { name: "Secret Core", hp: 400000 },
  { name: "Space Vault", hp: 650000 }
];

const drops = [
  { rarity: "COMMON DROP", icon: "💰", name: "Cash Stack", chance: 58 },
  { rarity: "RARE DROP", icon: "🪙", name: "Gold Rain", chance: 25 },
  { rarity: "EPIC DROP", icon: "👑", name: "Royal Crown", chance: 11 },
  { rarity: "LEGENDARY DROP", icon: "💎", name: "Diamond Core", chance: 5 },
  { rarity: "MYTHIC DROP", icon: "🐉", name: "Dragon Egg", chance: 1 }
];

let level = 1;
let vaultIndex = 0;
let maxHp = 0;
let hp = 0;
let damageByUser = {};
let currentKing = "";
let combo = 0;
let comboTimer = null;
let locked = false;

const $ = (id) => document.getElementById(id);

function startVault() {
  const v = vaults[vaultIndex % vaults.length];
  maxHp = Math.round(v.hp * (1 + (level - 1) * 0.38));
  hp = maxHp;
  locked = false;
  damageByUser = {};
  currentKing = "";

  $("vaultName").textContent = v.name.toUpperCase();
  $("levelLabel").textContent = `LEVEL ${level} • ${v.name}`;
  $("lastHit").textContent = "Trimite un cadou si loveste seiful";
  $("combo").textContent = "";
  $("kingName").textContent = "Asteptam primul atac";
  $("kingDamage").textContent = "0 damage";
  $("vault").className = "vault";

  updateHp();
  updateTopDamage();
}

function updateHp() {
  const pct = Math.max(0, hp / maxHp * 100);
  $("hpBar").style.width = pct + "%";
  $("hpText").textContent = `${hp.toLocaleString("ro-RO")} / ${maxHp.toLocaleString("ro-RO")} HP`;

  $("vault").classList.toggle("crack-1", pct <= 70);
  $("vault").classList.toggle("crack-2", pct <= 42);
  $("vault").classList.toggle("crack-3", pct <= 18);
}

function receiveGift(giftName, coinValue, username) {
  if (locked) return;

  const user = username || "Anonim";
  const coins = Number(coinValue || 1);
  const damage = Math.max(100, coins * 100);

  hp = Math.max(0, hp - damage);
  damageByUser[user] = (damageByUser[user] || 0) + damage;

  $("lastHit").textContent = `💥 ${user} • ${giftName} • -${damage.toLocaleString("ro-RO")} HP`;

  updateCombo();
  hitEffects(damage);
  updateHp();
  updateTopDamage();
  updateKing();

  if (hp <= 0) openVault();
}

function updateCombo() {
  combo++;
  $("combo").textContent = combo >= 2 ? `COMBO x${combo}` : "";
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => {
    combo = 0;
    $("combo").textContent = "";
  }, 4500);
}

function updateKing() {
  const [name, dmg] = getMvp();
  if (!name || name === "Nimeni") return;

  if (name !== currentKing) {
    currentKing = name;
    showNewKing();
  }

  $("kingName").textContent = name;
  $("kingDamage").textContent = `${Number(dmg).toLocaleString("ro-RO")} damage`;
}

function showNewKing() {
  const el = $("newKing");
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 900);
}

function hitEffects(damage) {
  const vault = $("vault");
  vault.classList.add("hit");

  if (damage >= 5000) {
    vault.classList.add("big-hit");
    $("app").classList.add("screen-shake");
  }

  floatDamage(`-${damage.toLocaleString("ro-RO")}`);
  particles(damage >= 5000 ? 90 : 32);

  setTimeout(() => vault.classList.remove("hit"), 180);
  setTimeout(() => vault.classList.remove("big-hit"), 520);
  setTimeout(() => $("app").classList.remove("screen-shake"), 450);
}

function floatDamage(text) {
  const d = document.createElement("div");
  d.className = "float-damage";
  d.textContent = text;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1000);
}

function particles(count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = (50 + Math.random() * 18 - 9) + "vw";
    p.style.top = (44 + Math.random() * 16 - 8) + "vh";
    p.style.setProperty("--x", (Math.random() * 520 - 260) + "px");
    p.style.setProperty("--y", (Math.random() * 380 - 190) + "px");
    if (Math.random() > .72) p.style.background = "#00eaff";
    if (Math.random() > .86) p.style.background = "#ff2f7d";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

function moneyRain() {
  for (let i = 0; i < 80; i++) {
    const m = document.createElement("div");
    m.className = "money";
    m.textContent = Math.random() > .5 ? "💸" : "💰";
    m.style.left = Math.random() * 100 + "vw";
    m.style.animationDelay = Math.random() * 1.2 + "s";
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 4700);
  }
}

function updateTopDamage() {
  const sorted = Object.entries(damageByUser).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const medals = ["🥇", "🥈", "🥉", "4.", "5."];
  $("topDamage").innerHTML = sorted.length
    ? sorted.map(([name, dmg], i) =>
        `<div class="damage-row"><span>${medals[i]} ${escapeHtml(name)}</span><b>${Number(dmg).toLocaleString("ro-RO")}</b></div>`
      ).join("")
    : `<div class="damage-row"><span>🥇 Asteptam primul atac</span><b>0</b></div>`;
}

function getMvp() {
  const sorted = Object.entries(damageByUser).sort((a, b) => b[1] - a[1]);
  return sorted[0] || ["Nimeni", 0];
}

function randomDrop() {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const d of drops) {
    acc += d.chance;
    if (roll <= acc) return d;
  }
  return drops[0];
}

function openVault() {
  locked = true;
  $("app").classList.add("screen-shake");
  particles(150);
  moneyRain();

  const [mvp, dmg] = getMvp();
  const drop = randomDrop();

  $("dropRarity").textContent = drop.rarity;
  $("dropIcon").textContent = drop.icon;
  $("dropName").textContent = drop.name;
  $("mvpName").textContent = mvp;
  $("mvpDamage").textContent = `${Number(dmg).toLocaleString("ro-RO")} damage`;
  $("resultPanel").classList.remove("hidden");

  let countdown = 8;
  $("nextVault").textContent = `Next vault in ${countdown}...`;

  const interval = setInterval(() => {
    countdown--;
    $("nextVault").textContent = `Next vault in ${countdown}...`;
    if (countdown <= 0) {
      clearInterval(interval);
      $("resultPanel").classList.add("hidden");
      $("app").classList.remove("screen-shake");
      nextVault();
    }
  }, 1000);
}

function nextVault() {
  vaultIndex++;
  if (vaultIndex >= vaults.length) {
    vaultIndex = 0;
    level++;
  }
  startVault();
}

function resetGame() {
  level = 1;
  vaultIndex = 0;
  damageByUser = {};
  combo = 0;
  startVault();
}

function simulateGift(giftName, coinValue, username) {
  receiveGift(giftName, coinValue, username);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}

window.receiveGift = receiveGift;
window.simulateGift = simulateGift;
window.resetGame = resetGame;

startVault();
