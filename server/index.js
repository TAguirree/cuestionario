import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// ===== EDITÁ TUS PREGUNTAS ACÁ =====
// q: enunciado · op: opciones · ok: índice de la correcta (0 = primera). Borrá "ok" si no hay correcta.
const TITULO = "Cierre del TP · Base de Datos 2";
const PREGUNTAS = [
  {
    q: "¿Qué propiedad ACID garantiza que una transacción se ejecute completa o no se ejecute?",
    op: ["Atomicidad", "Consistencia", "Aislamiento", "Durabilidad"],
    ok: 0,
  },
  {
    q: "¿Qué mejora más la velocidad de una búsqueda por una columna?",
    op: ["Una vista", "Un índice", "Un trigger", "Una clave foránea"],
    ok: 1,
  },
  {
    q: "¿Qué parte del TP te resultó más difícil?",
    op: ["Modelado", "Consultas SQL", "Procedimientos y triggers", "Optimización"],
  },
];

// ===== Persistencia simple en archivo =====
const FILE = "./respuestas.json";
let respuestas = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {};
const guardar = () => fs.writeFileSync(FILE, JSON.stringify(respuestas));

const puntaje = (r) => {
  const conOk = PREGUNTAS.filter((p) => p.ok != null);
  const aciertos = conOk.filter((p) => r[PREGUNTAS.indexOf(p)] === p.ok).length;
  return { aciertos, total: conOk.length };
};

// ===== Rutas =====

// Preguntas para el celular (sin la respuesta correcta)
app.get("/api/preguntas", (req, res) => {
  res.json({
    titulo: TITULO,
    preguntas: PREGUNTAS.map(({ q, op }) => ({ q, op })),
  });
});

// ¿Este dispositivo ya respondió?
app.get("/api/estado/:uid", (req, res) => {
  const r = respuestas[req.params.uid];
  res.json(r ? { enviado: true, ...puntaje(r) } : { enviado: false });
});

// Guardar respuestas
app.post("/api/respuestas", (req, res) => {
  const { uid, r } = req.body;
  const valido =
    typeof uid === "string" &&
    uid.length > 0 &&
    Array.isArray(r) &&
    r.length === PREGUNTAS.length &&
    r.every((v, i) => Number.isInteger(v) && v >= 0 && v < PREGUNTAS[i].op.length);

  if (!valido) return res.status(400).json({ error: "Datos inválidos" });
  if (respuestas[uid]) return res.status(409).json({ error: "Ya respondiste", ...puntaje(respuestas[uid]) });

  respuestas[uid] = r;
  guardar();
  res.json(puntaje(r));
});

// Resultados para el proyector
app.get("/api/resultados", (req, res) => {
  const todas = Object.values(respuestas);
  res.json({
    titulo: TITULO,
    total: todas.length,
    preguntas: PREGUNTAS.map((p, qi) => ({
      q: p.q,
      op: p.op,
      ok: p.ok ?? null,
      votos: p.op.map((_, k) => todas.filter((r) => r[qi] === k).length),
    })),
  });
});
app.use(express.static(path.join(__dirname, "../dist")));
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`API lista en http://localhost:${PORT}`));