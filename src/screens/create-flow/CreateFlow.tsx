/* ============================================================
   AMPLI — Create-flow orchestration (Novo Áudio wizard)
   ============================================================ */
import { useState, useEffect } from "react";
import { StepRail } from "../../components/Shell";
import { StepModel } from "./StepModel";
import { StepRoteiro, ProcessingModal } from "./StepRoteiro";
import { StepStructure } from "./StepStructure";
import { StepPreview } from "./StepPreview";
import { StepBatchFiles } from "./StepBatchFiles";
import { BatchEdit } from "./StepBatch";
import { DEFAULT_TRECHOS, SAMPLE_IMPORT } from "../../data/mockData";
import type { HelpTarget, LibraryAudio, ModelId, Trecho, Trilha } from "../../types";

export type ImportKind = "file" | "paste" | "batch" | "batch-scratch" | null;

export interface CreateFlowProps {
  onClose: () => void;
  onComplete: (result: { title?: string; model?: ModelId; trechos?: Trecho[]; trilha?: Trilha | null; batch?: boolean }) => void;
  onTrilhaUsed?: (t: Trilha | null) => void;
  onRequestHelp?: (target: HelpTarget) => void;
  startAudio: LibraryAudio | null;
  importText?: string | null;
  importKind: ImportKind;
  modelosEnabled?: boolean;
  illosEnabled?: boolean;
  trilhas: Trilha[];
}

let flowTimers: ReturnType<typeof setTimeout>[] = [];

export function CreateFlow({ onClose, onComplete, onTrilhaUsed, onRequestHelp, startAudio, importText, importKind, modelosEnabled, illosEnabled, trilhas }: CreateFlowProps) {
  const [step, setStep] = useState(importKind === "batch-scratch" ? 8 : importKind ? 0 : 1);
  const [model, setModel] = useState<ModelId>("spot");
  const [title, setTitle] = useState("Novo Áudio");
  const [trechos, setTrechos] = useState<Trecho[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [varLabels, setVarLabels] = useState<string[]>([]);
  const [imported, setImported] = useState(false);
  const [processing, setProcessing] = useState<"working" | "done" | null>(null);

  const railStep = step === 1 ? 1 : step <= 3 ? 2 : 3;

  useEffect(() => {
    if (importKind === "batch-scratch") return;
    if (startAudio) {
      const md = startAudio.model;
      setModel(md);
      setTitle(startAudio.name);
      const base = (DEFAULT_TRECHOS[md] || DEFAULT_TRECHOS.spot).map((t, i) => ({ ...t, id: "t" + i + Date.now(), voice: "helena" }));
      base[0] = { ...base[0], content: startAudio.text };
      setTrechos(base); setSelId(base[0].id);
      setStep(3);
      return;
    }
    if (importKind === "batch") {
      setProcessing("working");
      const bA = setTimeout(() => {
        setProcessing("done");
        const bB = setTimeout(() => { setProcessing(null); setStep(9); }, 1300);
        flowTimers.push(bB);
      }, 2300);
      flowTimers = [bA];
      return () => { flowTimers.forEach(clearTimeout); };
    }
    if (importKind) {
      setModel("spot");
      setTitle(importKind === "paste" ? "Roteiro colado" : "Roteiro importado");
      setProcessing("working");
      const tA = setTimeout(() => {
        setProcessing("done");
        const tB = setTimeout(() => {
          let base: Trecho[];
          if (importKind === "paste" && importText && importText.trim()) {
            const blocks = importText.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
            const src = blocks.length > 1 ? blocks : importText.split(/\n/).map((s) => s.trim()).filter(Boolean);
            const arr = src.length ? src : [importText.trim()];
            base = arr.map((c, i) => ({ id: "t" + i + Date.now(), label: "Trecho " + (i + 1), content: c, voice: "helena" }));
          } else {
            base = mkTrechos("spot", true);
          }
          setTrechos(base); setSelId(base[0].id);
          setImported(true);
          setProcessing(null);
          setStep(3);
        }, 1300);
        flowTimers.push(tB);
      }, 2300);
      flowTimers = [tA];
      return () => { flowTimers.forEach(clearTimeout); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickModel = (id: ModelId) => {
    setModel(id);
    setTitle("Novo Áudio");
    setStep(2);
  };

  const changeModel = (id: ModelId) => {
    setModel(id);
    if (!trechos.length) {
      const base = mkTrechos(id, false);
      setTrechos(base); setSelId(base[0].id);
    }
  };

  const mkTrechos = (id: ModelId, filled: boolean): Trecho[] => {
    const base = DEFAULT_TRECHOS[id] || DEFAULT_TRECHOS.novo;
    let labels = base.map((t) => t.label);
    if (filled && labels.length < 3) labels = ["Abertura", "Oferta", "Assinatura"];
    return labels.map((label, i) => ({
      id: "t" + i + Date.now(),
      label,
      content: filled ? SAMPLE_IMPORT[i] || "" : "",
      voice: "helena"
    }));
  };

  const chooseNovo = () => {
    const base = mkTrechos(model, false);
    setTrechos(base); setSelId(base[0].id);
    setImported(false);
    setStep(3);
  };

  const chooseImport = () => {
    setProcessing("working");
    setTimeout(() => {
      setProcessing("done");
      setTimeout(() => {
        const base = mkTrechos(model, true);
        setTrechos(base); setSelId(base[0].id);
        setTitle("Roteiro importado");
        setImported(true);
        setProcessing(null);
        setStep(3);
      }, 1300);
    }, 2300);
  };

  const startBatchProcessing = () => {
    setProcessing("working");
    setTimeout(() => {
      setProcessing("done");
      setTimeout(() => { setProcessing(null); setStep(9); }, 1300);
    }, 2300);
  };

  const isBatchFlow = importKind === "batch-scratch" || importKind === "batch";
  const batchRailStep = step === 9 ? 2 : 1;

  return (
    <div className="cf-overlay anim-in">
      {isBatchFlow
        ? (step === 8 || step === 9) &&
        <div className="cf-railwrap"><StepRail railStep={batchRailStep} steps={[{ n: 1, l: "Arquivos" }, { n: 2, l: "Revisão" }]} /></div>
        : step > 1 && step !== 9 && <div className="cf-railwrap"><StepRail railStep={railStep} /></div>}

      {step === 8 && <StepBatchFiles onReady={startBatchProcessing} onClose={onClose} />}

      {step === 1 && <StepModel onSelect={pickModel} onClose={onClose} showNovo={modelosEnabled} illos={illosEnabled} />}

      {step === 2 &&
        <StepRoteiro
          onImport={chooseImport}
          onNovo={chooseNovo}
          onBack={() => setStep(1)}
          onClose={onClose} />
      }

      {step === 3 &&
        <StepStructure
          model={model} setModel={changeModel}
          modelosEnabled={modelosEnabled}
          title={title} setTitle={setTitle}
          trechos={trechos} setTrechos={setTrechos}
          selId={selId} setSelId={setSelId}
          trilha={trilha} setTrilha={setTrilha}
          trilhas={trilhas}
          varLabels={varLabels} setVarLabels={setVarLabels}
          showQuality={imported}
          onGenerate={() => setStep(4)}
          onBack={() => setStep(2)}
          onRequestHelp={onRequestHelp}
          onClose={onClose} />
      }

      {step === 4 &&
        <StepPreview
          title={title} model={model} trechos={trechos} trilha={trilha}
          varLabels={varLabels}
          onBack={() => setStep(3)}
          onClose={onClose}
          onTrilhaUsed={() => onTrilhaUsed && onTrilhaUsed(trilha)}
          onFinish={() => onComplete({ title, model, trechos, trilha })} />
      }

      {step === 9 && <BatchEdit onClose={onClose} onComplete={() => onComplete({ batch: true })} onRequestHelp={onRequestHelp} />}

      {processing && <ProcessingModal phase={processing} batch={importKind === "batch"} />}
    </div>);
}
