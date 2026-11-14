import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

export default function Resultados() {
  const [res, setRes] = useState(null);
  const [error, setError] = useState(false);
  // URL que abren los celulares (la raíz de la app)
  const [url, setUrl] = useState(`${window.location.origin}${window.location.pathname}#/`);

  useEffect(() => {
    const cargar = () =>
      fetch("/api/resultados")
        .then((r) => r.json())
        .then((d) => { setRes(d); setError(false); })
        .catch(() => setError(true));
    cargar();
    const t = setInterval(cargar, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="wide">
      <section className="card top">
        <div className="qr"><QRCodeSVG value={url} size={200} /></div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1>{res ? res.titulo : "Cuestionario"}</h1>
          <p className="mu">Escaneá el QR para responder</p>
          <div className="big">{res ? res.total : 0}</div>
          <div className="mu">respuestas recibidas</div>
          <input
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </section>

      {error && (
        <section className="card mu">
          No se pudo conectar con el servidor. Revisá que esté corriendo (<code>npm start</code> en la carpeta <code>server</code>).
        </section>
      )}

      {res && res.preguntas.map((p, qi) => {
        const data = p.op.map((o, k) => ({
          name: o,
          votos: p.votos[k],
          correcta: p.ok === k,
        }));
        return (
          <section className="card" key={qi}>
            <h2>{qi + 1}. {p.q}</h2>
            <ResponsiveContainer width="100%" height={60 + data.length * 44}>
              <BarChart data={data} layout="vertical" margin={{ right: 30 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: "currentColor", fontSize: 13 }} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="votos" radius={6} isAnimationActive={false}>
                  {data.map((d, k) => (
                    <Cell key={k} fill={d.correcta ? "#16a34a" : "#6366f1"} />
                  ))}
                  <LabelList dataKey="votos" position="right" fill="currentColor" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {p.ok != null && <p className="mu">En verde: respuesta correcta.</p>}
          </section>
        );
      })}
    </main>
  );
}