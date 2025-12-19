import express from "express";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

/* =======================
   KONFIGURASI AMAN
======================= */
const WIDTH = 800;
const HEIGHT = 600;

const ALLOWED_FONTS = [
  "Arial",
  "Verdana",
  "Courier New"
];

const ALLOWED_TEMPLATES = ["1", "2", "3"];

/* =======================
   STATIC FILE
======================= */
app.use(express.static(__dirname));

/* =======================
   API GENERATOR (SCRAPABLE)
   /api/generate?text=HALO&size=32&font=Arial&template=1
======================= */
app.get("/api/generate", async (req, res) => {
  try {
    // ===== TEXT =====
    const text =
      typeof req.query.text === "string" && req.query.text.trim()
        ? req.query.text.slice(0, 150)
        : "Halo Dunia";

    // ===== SIZE =====
    let size = parseInt(req.query.size);
    if (isNaN(size)) size = 32;
    size = Math.min(Math.max(size, 14), 72);

    // ===== FONT =====
    const font = ALLOWED_FONTS.includes(req.query.font)
      ? req.query.font
      : "Arial";

    // ===== TEMPLATE =====
    const template = ALLOWED_TEMPLATES.includes(req.query.template)
      ? req.query.template
      : "1";

    // ===== CANVAS =====
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // ===== LOAD IMAGE =====
    const imgPath = path.join(__dirname, `anime${template}.png`);
    const bg = await loadImage(imgPath);

    ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);

    // ===== TEXT STYLE (ANTI ERROR) =====
    ctx.font = `${size}px "${font}"`;
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    drawText(ctx, text, WIDTH / 2, HEIGHT * 0.7, WIDTH - 160, size + 8);

    // ===== RESPONSE =====
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    canvas.createPNGStream().pipe(res);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Generate failed" });
  }
});

/* =======================
   TEXT WRAP FUNCTION
======================= */
function drawText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y + offsetY);
      line = words[i] + " ";
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + offsetY);
}

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log("✅ SERVER RUNNING");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/generate`);
});
