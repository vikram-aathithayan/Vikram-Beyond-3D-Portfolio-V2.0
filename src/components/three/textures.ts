import * as THREE from "three";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconType } from "react-icons";

const cache = new Map<string, THREE.Texture>();

/** A rounded "chip" with a tech logo, for orbiting icons. */
export function chipTexture(Icon: IconType, key: string, color = "#f6f3ec") {
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const r = 48;
  ctx.beginPath();
  ctx.roundRect(10, 10, S - 20, S - 20, r);
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "rgba(28,25,18,0.95)");
  g.addColorStop(1, "rgba(8,9,12,0.95)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(245,196,81,0.7)";
  ctx.stroke();

  let svg = renderToStaticMarkup(createElement(Icon, { size: 130, color }));
  if (!svg.includes("xmlns=")) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, (S - 130) / 2, (S - 130) / 2, 130, 130);
    tex.needsUpdate = true;
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  cache.set(key, tex);
  return tex;
}

// Node.js code that scrolls on the laptop and desktop screens.
const CODE: [string, string][] = [
  ["#c9a24a", "import express from \"express\";"],
  ["#c9a24a", "import { pool } from \"./db.js\";"],
  ["", ""],
  ["#e8e2d4", "const app = express();"],
  ["#e8e2d4", "app.use(express.json());"],
  ["", ""],
  ["#7a7468", "// GET /api/companies/:id"],
  ["#f5c451", "app.get(\"/api/companies/:id\", async (req, res) => {"],
  ["#e8e2d4", "  const { rows } = await pool.query("],
  ["#a8d08d", "    \"SELECT * FROM companies WHERE id = $1\","],
  ["#e8e2d4", "    [req.params.id]"],
  ["#e8e2d4", "  );"],
  ["#e8e2d4", "  if (!rows.length) return res.sendStatus(404);"],
  ["#e8e2d4", "  res.json(rows[0]);"],
  ["#f5c451", "});"],
  ["", ""],
  ["#7a7468", "// POST /api/auth/login"],
  ["#f5c451", "app.post(\"/api/auth/login\", login);"],
  ["", ""],
  ["#e8e2d4", "app.listen(3000, () =>"],
  ["#a8d08d", "  console.log(\"API ready on :3000\")"],
  ["#e8e2d4", ");"],
];

/** A dark editor with Node.js code typing and scrolling. Call `tick` each frame. */
export function codeScreenTexture() {
  const W = 512;
  const H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const LINE = 19;
  const total = CODE.reduce((n, [, l]) => n + l.length + 3, 0);
  let typed = 0;
  let acc = 0;

  const draw = () => {
    ctx.fillStyle = "#0b0a08";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#16140f";
    ctx.fillRect(0, 0, W, 26);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(16 + i * 16, 13, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = "13px ui-monospace, Consolas, monospace";
    ctx.fillStyle = "#b0aa9e";
    ctx.fillText("server.js", 72, 17);

    // Scroll so the line being typed stays in view.
    let left = typed;
    let current = 0;
    for (let i = 0; i < CODE.length; i++) {
      left -= CODE[i][1].length + 3;
      if (left <= 0) {
        current = i;
        break;
      }
      current = i;
    }
    const visible = Math.floor((H - 40) / LINE);
    const first = Math.max(0, current - visible + 2);
    left = typed;
    ctx.font = "14px ui-monospace, Consolas, monospace";
    CODE.forEach(([col, line], i) => {
      const shown = line.slice(0, Math.max(0, left));
      left -= line.length + 3;
      if (i < first || i >= first + visible) return;
      const y = 46 + (i - first) * LINE;
      ctx.fillStyle = "#4a463d";
      ctx.fillText(String(i + 1).padStart(2, " "), 10, y);
      ctx.fillStyle = col || "#e8e2d4";
      ctx.fillText(shown, 40, y);
      if (i === current && Math.floor(performance.now() / 450) % 2 === 0) {
        ctx.fillStyle = "#f5c451";
        ctx.fillRect(40 + ctx.measureText(shown).width + 1, y - 12, 7, 15);
      }
    });
    tex.needsUpdate = true;
  };

  draw();
  return {
    texture: tex,
    tick(dt: number) {
      acc += dt;
      if (acc < 0.06) return;
      typed += 2;
      if (typed > total + 40) typed = 0;
      acc = 0;
      draw();
    },
  };
}

const TERMINAL: [string, string][] = [
  ["#b0aa9e", "$ npm test"],
  ["#7a7468", ""],
  ["#e8e2d4", " PASS  api/companies.test.js"],
  ["#a8d08d", "   ✓ GET /api/companies/:id (14 ms)"],
  ["#a8d08d", "   ✓ returns 404 for unknown id (6 ms)"],
  ["#e8e2d4", " PASS  api/auth.test.js"],
  ["#a8d08d", "   ✓ POST /api/auth/login (21 ms)"],
  ["#a8d08d", "   ✓ rejects a bad password (9 ms)"],
  ["#7a7468", ""],
  ["#f5c451", " Tests: 4 passed, 4 total"],
  ["#7a7468", ""],
  ["#b0aa9e", "$ npm run deploy"],
  ["#e8e2d4", " building… done in 3.2s"],
  ["#a8d08d", " ✓ live on production"],
];

/** A terminal printing test results line by line, then starting over. */
export function terminalTexture() {
  const W = 512;
  const H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  let shown = 0;
  let acc = 0;
  const draw = () => {
    ctx.fillStyle = "#070706";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#16140f";
    ctx.fillRect(0, 0, W, 26);
    ctx.font = "13px ui-monospace, Consolas, monospace";
    ctx.fillStyle = "#b0aa9e";
    ctx.fillText("terminal — zsh", 14, 17);
    ctx.font = "15px ui-monospace, Consolas, monospace";
    TERMINAL.slice(0, shown).forEach(([col, line], i) => {
      ctx.fillStyle = col;
      ctx.fillText(line, 14, 50 + i * 19);
    });
    if (Math.floor(performance.now() / 450) % 2 === 0) {
      ctx.fillStyle = "#f5c451";
      ctx.fillRect(14, 50 + shown * 19 - 13, 8, 16);
    }
    tex.needsUpdate = true;
  };
  draw();
  return {
    texture: tex,
    tick(dt: number) {
      acc += dt;
      if (acc < 0.45) return;
      acc = 0;
      shown = shown >= TERMINAL.length + 4 ? 0 : shown + 1;
      draw();
    },
  };
}

/** Soft round glow for additive sprites. */
export function glowTexture(inner = "rgba(245,196,81,1)", outer = "rgba(201,150,58,0)") {
  const key = `glow:${inner}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}
