/* ============================================================
   AMPLI — Etapa I: Modelo
   ============================================================ */
import { useState } from "react";
import { Icon } from "../../components/Icon";
import { MODELS } from "../../data/mockData";
import type { ModelId } from "../../types";

export function StepModel({ onSelect, onClose, showNovo, illos }: {
  onSelect: (id: ModelId) => void; onClose: () => void; showNovo?: boolean; illos?: boolean;
}) {
  const [hover, setHover] = useState<ModelId | null>(null);
  const order: ModelId[] = showNovo ? ["spot", "carro", "novo"] : ["spot", "carro"];

  return (
    <div className="sm-wrap">
      <div className="diag-bg"></div>
      <button className="sm-close icon-btn" onClick={onClose} title="Fechar">{Icon.close()}</button>

      <div className="sm-head anim-up">
        <div className="u-label" style={{ marginBottom: 12 }}>Novo Áudio · Etapa 1 de 3</div>
        <h1 className="display sm-title">Escolha o modelo</h1>
        <p className="sm-sub">Cada modelo traz uma estrutura e complexidade próprias. Clique para começar.</p>
      </div>

      <div className={"sm-grid" + (showNovo ? "" : " sm-grid-2")}>
        {order.map((id, i) => {
          const m = MODELS[id];
          const isNovo = id === "novo";
          return (
            <button key={id}
              className={"sm-card anim-up" + (isNovo ? " sm-novo" : "")}
              style={{ animationDelay: (0.08 + i * 0.07) + "s", ["--mc" as any]: m.color }}
              onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(id)}>

              <div className="sm-card-top">
                <span className="sm-cardlabel" style={{ color: m.color }}>{m.tagline}</span>
                <span className="sm-complex">{m.complexity}</span>
              </div>

              {illos && m.illo && !isNovo ? (
                <div className="sm-illo">
                  <img className="sm-illo-img sm-illo-dark" src={m.illo.dark} alt="" draggable="false" />
                  <img className="sm-illo-img sm-illo-light" src={m.illo.light} alt="" draggable="false" />
                </div>
              ) : (
                <div className="sm-icon" style={{ borderColor: hover === id ? m.color : "var(--line)" }}>
                  {isNovo ? Icon.plus({ style: { width: 34, height: 34 } }) : Icon.waveform({ style: { width: 34, height: 34 } })}
                </div>
              )}

              <h2 className="display sm-card-name">{m.name}</h2>
              <p className="sm-card-desc">{m.desc}</p>

              {!isNovo && (
                <div className="sm-chips">
                  {m.trechosLabel.map((t) => <span key={t} className="sm-trecho-chip">{t}</span>)}
                </div>
              )}

              <div className="sm-card-foot">
                {!isNovo && <span className="sm-dur mono">~ {m.duration}</span>}
                <span className="sm-go" style={{ color: m.color }}>
                  Selecionar {Icon.arrowRight({ style: { width: 16, height: 16 } })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
