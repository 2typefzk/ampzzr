/* ============================================================
   AMPLI — Lote de Áudios (do zero) · Etapa 1: Arquivos
   Duas drop areas: Roteiro (DOC/TXT) + Planilha (XLS/XLSX/CSV).
   Só avança quando ambos os arquivos forem importados.
   ============================================================ */
import { useState, useRef } from "react";
import { Icon } from "../../components/Icon";

function BatchFileDrop({ kind, file, onFile }: {
  kind: "rot" | "pla"; file: string | false; onFile: (f: string | false) => void;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRot = kind === "rot";
  const accept = isRot ? ".doc,.docx,.txt" : ".xls,.xlsx,.csv";
  const eyebrow = isRot ? "Importar roteiro" : "Importar planilha";
  const hint = isRot ? "DOC ou TXT" : "XLS ou CSV";
  const fallback = isRot ? "roteiro.docx" : "variaveis.xlsx";

  const ingest = (files: FileList | null | undefined) => {
    const list = Array.from(files || []);
    const name = list.length ? list[0].name : fallback;
    onFile(name);
  };
  const openPicker = () => { if (!file && inputRef.current) inputRef.current.click(); };

  return (
    <div className={"na-surface na-drop bf-drop" + (drag ? " dragover" : "") + (file ? " is-done" : "")}
      onClick={openPicker} role="button"
      onDragOver={(e) => { if (!file) { e.preventDefault(); setDrag(true); } }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer && e.dataTransfer.files); }}>
      <span className="na-surface-eyebrow">{eyebrow}</span>
      <div className="na-drop-center">
        <div className="na-tiles">
          {file
            ? <span className="na-file-tile" title={typeof file === "string" ? file : ""}>
              {(isRot ? Icon.doc : Icon.table)({ style: { width: 26, height: 26 } })}
              <span className="na-file-badge">{Icon.check({ style: { width: 12, height: 12 } })}</span>
            </span>
            : <span className="na-up-tile">{Icon.upload({ style: { width: 24, height: 24 } })}</span>}
        </div>
        {file
          ? <span className="bf-file-name mono">{typeof file === "string" ? file : "arquivo selecionado"}</span>
          : <>
            <span className="na-drop-cta" style={{ lineHeight: "1.05" }}><u>Arraste até aqui</u> ou selecione</span>
            <span className="na-drop-hint" style={{ lineHeight: "0.95" }}>{hint}</span>
          </>}
      </div>
      {file && <button className="bf-clear" onClick={(e) => { e.stopPropagation(); onFile(false); }} title="Remover">{Icon.close({ style: { width: 14, height: 14 } })}</button>}
      <input ref={inputRef} type="file" hidden accept={accept} onChange={(e) => ingest(e.target.files)} />
    </div>
  );
}

export function StepBatchFiles({ onReady, onClose }: { onReady: () => void; onClose: () => void }) {
  const [roteiro, setRoteiro] = useState<string | false>(false);
  const [planilha, setPlanilha] = useState<string | false>(false);
  const done = !!(roteiro && planilha);

  return (
    <div className="sm-wrap">
      <div className="diag-bg"></div>
      <button className="sm-close icon-btn" onClick={onClose} title="Fechar">{Icon.close()}</button>

      <div className="sm-head anim-up">
        <div className="u-label" style={{ marginBottom: 12 }}>Novo Lote de Áudios · Etapa 1 de 2</div>
        <h1 className="display sm-title">Importe os arquivos</h1>
        <p className="sm-sub">Envie o roteiro e a planilha de variáveis para começar um lote de áudios.</p>
      </div>

      <div className="bf-grid anim-up" style={{ animationDelay: ".08s" }}>
        <div className="bf-col">
          <div className="bf-col-head">
            <span className="bf-col-ic">{Icon.doc({ style: { width: 20, height: 20 } })}</span>
            <div>
              <h3 className="bf-col-title">Roteiro</h3>
              <p className="bf-col-sub">O texto-base do seu áudio</p>
            </div>
          </div>
          <BatchFileDrop kind="rot" file={roteiro} onFile={setRoteiro} />
        </div>
        <div className="bf-plus" aria-hidden="true">{Icon.plus({ style: { width: 22, height: 22 } })}</div>
        <div className="bf-col">
          <div className="bf-col-head">
            <span className="bf-col-ic">{Icon.table({ style: { width: 20, height: 20 } })}</span>
            <div>
              <h3 className="bf-col-title">Planilha de variáveis</h3>
              <p className="bf-col-sub">Cada linha gera uma variação</p>
            </div>
          </div>
          <BatchFileDrop kind="pla" file={planilha} onFile={setPlanilha} />
        </div>
      </div>

      <div className="bf-foot anim-up" style={{ animationDelay: ".14s" }}>
        <button className="btn btn-primary btn-lg" disabled={!done} onClick={() => onReady && onReady()}>
          Continuar {Icon.arrowRight({ style: { width: 16, height: 16 } })}
        </button>
      </div>
    </div>
  );
}
