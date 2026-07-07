/* ============================================================
   AMPLI — Ampl.IA assistant
   A "spin-off" chat surface with its own identity: the
   lilac→cyan→green gradient, glassy dark canvas, animated orb.
   No light/dark theming — always its own look.

   NOTE: the original Claude Design prototype called
   `window.claude.complete()`, an API only available inside the
   Claude Design sandbox. Here we mock the assistant's replies
   locally so the full chat UI (voice, suggestions, composer)
   still works standalone.
   ============================================================ */
import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";

const SUGGESTIONS = [
  "Spot para promoção do final de semana",
  "Spot para campanha em várias cidades",
  "Carro de som com as ofertas do hortifruti",
  "Carro de som de inauguração de nova loja",
];

/* canned reply generator standing in for the real Ampl.IA persona */
const FOLLOWUPS = [
  "Adorei a ideia! Me conta: qual é a marca ou loja e qual a oferta principal que você quer destacar?",
  "Boa! E qual a duração que você imagina — um spot de 30 segundos ou algo mais curto?",
  "Legal, saca só: você quer um tom mais animado e urgente, ou algo mais elegante e tranquilo?",
  "Perfeito! Tem algum diferencial da loja (endereço, horário, parcelamento) que não pode ficar de fora?",
];
const CLOSERS = [
  "Curti o roteiro! Ficou redondo. É só clicar em “Novo Áudio” pra gente produzir 🎙️",
  "Show, ficou ótimo esse roteiro! Bora produzir — clica em “Novo Áudio” quando quiser.",
];

function mockReply(turnIndex: number, userText: string): string {
  const lower = userText.toLowerCase();
  const soundsReady = /roteiro pronto|pode produzir|ta bom assim|tá bom assim|ficou bom|gostei|perfeito|manda ver/.test(lower);
  if (soundsReady || turnIndex >= 3) {
    return CLOSERS[turnIndex % CLOSERS.length];
  }
  return FOLLOWUPS[turnIndex % FOLLOWUPS.length];
}

interface Message { role: "user" | "assistant"; content: string }

/* animated gradient orb — the Ampl.IA "face", with the Fuzzr mark at its core */
function Orb({ size = 40, thinking }: { size?: number; thinking?: boolean }) {
  return (
    <span className={"ai-orb" + (thinking ? " thinking" : "")} style={{ width: size, height: size }}>
      <span className="ai-orb-core"></span>
      <span className="ai-orb-glow"></span>
      <svg className="ai-orb-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M19.0761 0V18.3554L37.6526 10.4926L40 9.52785L17.5864 48V26.8126L0 36.3059L19.0761 0Z" fill="#fff" />
        <path d="M39.6304 26V33.6481L47.061 30.3719L48 29.9699L39.0345 46V37.1719L32 41.1275L39.6304 26Z" fill="#fff" />
      </svg>
    </span>
  );
}

function TypingDots() {
  return <span className="ai-typing"><i></i><i></i><i></i></span>;
}

export function AmpliaWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const empty = messages.length === 0;
  const turnRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const grow = () => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(100, Math.min(200, ta.scrollHeight)) + "px";
  };

  const send = async (text?: string) => {
    const content = (text !== undefined ? text : input).trim();
    if (!content || busy) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }
    setBusy(true);
    const turn = turnRef.current++;
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: mockReply(turn, content) }]);
      setBusy(false);
    }, 700 + Math.random() * 500);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // --- voice: pure visual simulation ---
  const toggleRecord = () => {
    if (recording) {
      if (recTimer.current) clearTimeout(recTimer.current);
      setRecording(false);
      setTranscribing(true);
      setTimeout(() => {
        setTranscribing(false);
        const dictated = "Quero um spot de 30 segundos pra liquidação de inverno, tom animado e com senso de urgência.";
        setInput((prev) => (prev ? prev + " " : "") + dictated);
        setTimeout(() => { grow(); taRef.current && taRef.current.focus(); }, 20);
      }, 1700);
    } else {
      setRecording(true);
      recTimer.current = setTimeout(() => toggleRecord(), 12000);
    }
  };

  const clearChat = () => { if (!busy) { setMessages([]); setInput(""); turnRef.current = 0; } };

  return (
    <>
      <div className="ai-overlay" onClick={onClose}></div>
      <div className="ai-win" role="dialog" aria-label="Ampl.IA">
        <div className="ai-aura"></div>

        <header className="ai-head">
          <div className="ai-head-id">
            <Orb size={34} thinking={busy} />
            <div className="ai-head-txt">
              <div className="ai-head-name">Ampl.IA</div>
              <div className="ai-head-status">{busy ? "pensando…" : "Assistente de Produção"}</div>
            </div>
          </div>
          <div className="ai-head-actions">
            <button className="ai-iconbtn" title="Limpar conversa" onClick={clearChat} disabled={empty || busy}>
              {Icon.refresh({ style: { width: 17, height: 17 } })}
            </button>
            <button className="ai-iconbtn" title="Fechar" onClick={onClose}>
              {Icon.close({ style: { width: 18, height: 18 } })}
            </button>
          </div>
        </header>

        <div className="ai-body" ref={scrollRef}>
          {empty ? (
            <div className="ai-welcome">
              <Orb size={64} />
              <h2 className="ai-greet">Olá, Luciana! 👋</h2>
              <p className="ai-pitch">Qual Áudio vamos produzir hoje?</p>
              <div className="ai-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="ai-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-thread">
              {messages.map((m, i) => (
                <div key={i} className={"ai-msg " + m.role}>
                  {m.role === "assistant" && <Orb size={28} />}
                  <div className="ai-bubble">{m.content}</div>
                </div>
              ))}
              {busy && (
                <div className="ai-msg assistant">
                  <Orb size={28} thinking />
                  <div className="ai-bubble ai-bubble-typing"><TypingDots /></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ai-composer">
          {recording && (
            <div className="ai-recbar">
              <span className="ai-rec-dot"></span>
              <div className="ai-rec-wave">
                {Array.from({ length: 28 }).map((_, i) => <span key={i} style={{ animationDelay: (i * 0.05) + "s" }}></span>)}
              </div>
              <span className="ai-rec-label">Ouvindo… toque pra parar</span>
            </div>
          )}
          {transcribing && (
            <div className="ai-recbar transcribing">
              <TypingDots />
              <span className="ai-rec-label">Transcrevendo seu áudio…</span>
            </div>
          )}
          <div className={"ai-inputrow" + (recording || transcribing ? " muted" : "")}>
            <textarea ref={taRef} className="ai-input" rows={1}
              placeholder="Escreva sua ideia, cole um roteiro…"
              value={input} disabled={busy}
              onChange={(e) => { setInput(e.target.value); grow(); }}
              onKeyDown={onKey} />
            <div className="ai-tools">
              <button className="ai-tool" title="Importar roteiro (upload)" disabled={busy}>
                {Icon.upload({ style: { width: 18, height: 18 } })}
              </button>
              <button className={"ai-tool" + (recording ? " rec" : "")} title="Gravar voz" onClick={toggleRecord} disabled={busy || transcribing}>
                {Icon.mic({ style: { width: 18, height: 18 } })}
              </button>
              <button className="ai-send" title="Enviar" onClick={() => send()} disabled={!input.trim() || busy}>
                {Icon.arrowRight({ style: { width: 18, height: 18 } })}
              </button>
            </div>
          </div>
          <div className="ai-disclaimer">Chega mais por texto ou por voz que a gente desenrola. Já tem um roteiro? É só fazer upload!<br />O Ampl.IA pode cometer erros. Confira informações importantes.</div>
        </div>
      </div>
    </>
  );
}

export function AmpliaLauncher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button className={"ai-fab" + (open ? " open" : "")} onClick={onToggle}
      title={open ? "Fechar Ampl.IA" : "Abrir Ampl.IA"} aria-label="Ampl.IA">
      <span className="ai-fab-inner">
        {open ? Icon.close({ style: { width: 22, height: 22 } }) : <Orb size={30} />}
      </span>
    </button>
  );
}

export { Orb };
