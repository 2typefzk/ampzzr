/* ============================================================
   AMPLI — Etapa II (entrada): Roteiro
   Escolha entre importar um documento ou começar do zero,
   + modal de processamento do arquivo importado.
   ============================================================ */
import { useState } from "react";
import { Icon, type IconRenderer } from "../../components/Icon";

export function StepRoteiro({ onImport, onNovo, onBack, onClose }: {
  onImport: () => void; onNovo: () => void; onBack: () => void; onClose: () => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const cards: { id: string; name: string; label: string; icon: IconRenderer; desc: string; foot: string }[] = [
    {
      id: "import",
      name: "Importar",
      label: "DOC, TXT ou PLANILHA / CSV",
      icon: Icon.upload,
      desc: "Envie um arquivo que nós processaremos seu roteiro e iremos gerar os trechos pra você.",
      foot: "Reconhecimento automático",
    },
    {
      id: "novo",
      name: "Novo",
      label: "Editor",
      icon: Icon.pencil,
      desc: "Comece do zero ou cole um roteiro pronto, compondo trecho por trecho.",
      foot: "Controle total",
    },
  ];

  return (
    <div className="sm-wrap">
      <div className="diag-bg"></div>
      <button className="sm-back icon-btn" onClick={onBack} title="Voltar">{Icon.chevLeft({ style: { width: 18, height: 18 } })}</button>
      <button className="sm-close icon-btn" onClick={onClose} title="Fechar">{Icon.close()}</button>

      <div className="sm-head anim-up">
        <div className="u-label" style={{ marginBottom: 12 }}>Novo Áudio · Etapa 2 de 3</div>
        <h1 className="display sm-title">Roteiro</h1>
        <p className="sm-sub">Como você quer escrever o roteiro deste áudio? Iremos revisar com você.</p>
      </div>

      <div className="sm-grid sm-grid-2">
        {cards.map((c, i) => (
          <button key={c.id}
            className={"sm-card anim-up" + (c.id === "novo" ? " sm-novo" : "")}
            style={{ animationDelay: (0.08 + i * 0.07) + "s", ["--mc" as any]: "var(--orange)" }}
            onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}
            onClick={() => c.id === "import" ? onImport() : onNovo()}>

            <div className="sm-card-top">
              <span className="sm-cardlabel" style={{ color: "var(--orange)" }}>{c.label}</span>
            </div>

            <div className="sm-icon" style={{ borderColor: hover === c.id ? "var(--orange)" : "var(--line)" }}>
              {c.icon({ style: { width: 32, height: 32 } })}
            </div>

            <h2 className="display sm-card-name">{c.name}</h2>
            <p className="sm-card-desc">{c.desc}</p>

            <div className="sm-card-foot">
              <span className="sm-dur" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10.5, fontWeight: 700, color: "var(--tx-faint)" }}>{c.foot}</span>
              <span className="sm-go" style={{ color: "var(--orange)" }}>
                Selecionar {Icon.arrowRight({ style: { width: 16, height: 16 } })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Processing modal shown while the imported file is "understood" */
export function ProcessingModal({ phase, batch }: { phase: "working" | "done" | null; batch?: boolean }) {
  return (
    <div className="md-scrim anim-in">
      <div className="proc-box anim-up">
        {phase === "working" ? (
          <>
            <div className="proc-spinner"></div>
            <h3 className="proc-title">{batch ? "Processando seu Lote…" : "Processando seu Roteiro…"}</h3>
            <p className="proc-sub">{batch ? "Estamos lendo o roteiro e cruzando com as variáveis da planilha." : "Estamos lendo o documento e entendendo a estrutura do seu roteiro."}</p>
            <div className="proc-steps">
              <span className="proc-step done">{Icon.check({ style: { width: 13, height: 13 } })} {batch ? "Lendo roteiro e planilha" : "Lendo documento"}</span>
              <span className="proc-step active"><span className="proc-dot"></span> {batch ? "Gerando variações…" : "Identificando trechos…"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="proc-check anim-pop">{Icon.check({ style: { width: 32, height: 32 } })}</div>
            <h3 className="proc-title">Tudo certo!</h3>
            <p className="proc-sub">{batch ? "Seu lote foi processado e as variações foram geradas." : "Seu roteiro foi processado e organizado em trechos. Confira a composição."}</p>
          </>
        )}
      </div>
    </div>
  );
}
