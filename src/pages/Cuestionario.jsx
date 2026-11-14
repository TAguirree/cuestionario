import { useEffect, useState } from "react";

function getUid() {
  let id = localStorage.getItem("bd2_uid");
  if (!id) {
    id =
      (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
      Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("bd2_uid", id);
  }
  return id;
}
export default function Cuestionario() {
  const [data, setData] = useState(null); // { titulo, preguntas }
  const [i, setI] = useState(0);
  const [resp, setResp] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | respondiendo | enviado | error
  const [nota, setNota] = useState(null); // { aciertos, total }
  const uid = getUid();

  useEffect(() => {
    Promise.all([
      fetch("/api/preguntas").then((r) => r.json()),
      fetch(`/api/estado/${uid}`).then((r) => r.json()),
    ])
      .then(([pregs, est]) => {
        setData(pregs);
        if (est.enviado) {
          setNota({ aciertos: est.aciertos, total: est.total });
          setEstado("enviado");
        } else setEstado("respondiendo");
      })
      .catch(() => setEstado("error"));
  }, [uid]);

  const enviar = async () => {
    try {
      const res = await fetch("/api/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, r: resp }),
      });
      const json = await res.json();
      if (res.ok || res.status === 409) {
        setNota({ aciertos: json.aciertos, total: json.total });
        setEstado("enviado");
      } else setEstado("error");
    } catch {
      setEstado("error");
    }
  };

  if (estado === "cargando") return <main className="card center">Cargando…</main>;
  if (estado === "error" && !data)
    return <main className="card center">No se pudo conectar con el servidor.</main>;

  if (estado === "enviado") {
    return (
      <main className="card center">
        <div style={{ fontSize: "2.5rem" }}>✅</div>
        <h1>¡Gracias por responder!</h1>
        {nota && nota.total > 0 && (
          <>
            <p className="big">{nota.aciertos} / {nota.total}</p>
            <p className="mu">respuestas correctas</p>
          </>
        )}
        <p className="mu">Mirá la pantalla del aula para ver los resultados del grupo.</p>
      </main>
    );
  }

  const p = data.preguntas[i];
  const n = data.preguntas.length;
  const ultima = i === n - 1;

  return (
    <main className="card">
      <h1>{data.titulo}</h1>
      <div className="mu">Pregunta {i + 1} de {n}</div>
      <div className="progress"><i style={{ width: `${(i / n) * 100}%` }} /></div>
      <h2>{p.q}</h2>

      {p.op.map((o, k) => (
        <button
          key={k}
          className={`opt ${resp[i] === k ? "sel" : ""}`}
          onClick={() => setResp((r) => { const x = [...r]; x[i] = k; return x; })}
        >
          {o}
        </button>
      ))}

      <button
        className="btn"
        disabled={resp[i] == null}
        onClick={() => (ultima ? enviar() : setI(i + 1))}
      >
        {ultima ? "Enviar respuestas" : "Siguiente"}
      </button>
      {estado === "error" && <p className="mu">No se pudo enviar. Probá de nuevo.</p>}
    </main>
  );
}