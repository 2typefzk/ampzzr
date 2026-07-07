/* ============================================================
   AMPLI — Auth: Login screen + Welcome modal
   ============================================================ */
import { useState, useLayoutEffect } from "react";
import { Icon } from "../components/Icon";
import welcomeImg from "../assets/welcome.png";

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.6 27 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.4 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("luciana.zappala@pullse.online");
  const [pass, setPass] = useState("");
  const submit = (e?: React.FormEvent) => { e && e.preventDefault(); onLogin(); };

  return (
    <div className="lg-wrap">
      <div className="lg-brand">
        <div className="lg-brand-top">
          <span className="tb-wordmark lg-wordmark">AMPLI</span>
          <span className="tb-by">by Fuzzr</span>
        </div>
        <div className="lg-brand-mid">
          <h1 className="display lg-headline">Áudio <span className="lt">que</span> vende,<br /><span className="lg-accent">pronto em segundos.</span></h1>
          <p className="lg-tagline">Produção de Áudio rápida, qualidade consistente e praticidade sem esforço.</p>
        </div>
        <div className="lg-brand-foot">© 2026 Ampli · uma plataforma Fuzzr</div>
      </div>

      <div className="lg-form-side">
        <form className="lg-card" onSubmit={submit}>
          <div className="u-label lg-eyebrow">Bem-vindo de volta</div>
          <h2 className="lg-title">Entrar na sua conta</h2>
          <p className="lg-sub">Acesse o estúdio e continue produzindo.</p>

          <button type="button" className="lg-google" onClick={onLogin}>
            <GoogleG /> Continuar com o Google
          </button>

          <div className="lg-divider"><span>ou com e-mail</span></div>

          <label className="lg-field-label">E-mail</label>
          <input className="field lg-input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" />

          <label className="lg-field-label">Senha</label>
          <div className="lg-pass">
            <input className="field lg-input" type="password" value={pass}
              onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          </div>

          <div className="lg-row">
            <label className="lg-check">
              <input type="checkbox" defaultChecked /> <span>Manter conectado</span>
            </label>
            <button type="button" className="lg-link" onClick={onLogin}>Esqueci minha senha</button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg lg-submit">Entrar {Icon.arrowRight({ style: { width: 17, height: 17 } })}</button>

          <p className="lg-foot">Não tem conta? <button type="button" className="lg-link" onClick={onLogin}>Fale com o seu gestor</button></p>
        </form>
      </div>
    </div>
  );
}

export function WelcomeModal({ onTour, onExplore }: { onTour: () => void; onExplore: () => void }) {
  return (
    <div className="wm-scrim" onClick={onExplore}>
      <div className="wm-box" onClick={(e) => e.stopPropagation()}>
        <button className="wm-close icon-btn" onClick={onExplore} aria-label="Fechar">{Icon.close({ style: { width: 18, height: 18 } })}</button>
        <div className="wm-art-wrap">
          <img className="wm-art" src={welcomeImg} alt="Ilustração Ampli" draggable="false" />
        </div>
        <div className="u-label wm-eyebrow">AMPLI</div>
        <h2 className="display wm-title">Boas-Vindas</h2>
        <p className="wm-sub">Conecte sua ideia e deixe a gente amplificar. Faça um tour rápido para conhecer os principais recursos da plataforma.</p>
        <div className="wm-actions">
          <button className="btn btn-primary btn-lg wm-tour" onClick={onTour}>Fazer o tour {Icon.arrowRight({ style: { width: 17, height: 17 } })}</button>
          <button className="btn btn-ghost btn-lg" onClick={onExplore}>Explorar por conta própria</button>
        </div>
      </div>
    </div>
  );
}

const TOUR_STEPS = [
  { sel: ".sb-top", title: "Navegação", text: "Acesse seus Áudios, Trilhas, Campanhas e o Dashboard por aqui. O menu expande ao passar o mouse.", place: "right" },
  { sel: ".tb .btn-primary", title: "Criar um áudio", text: "Comece um novo áudio a qualquer momento: escolha o modelo, monte o roteiro e gere a prévia.", place: "bottom" },
  { sel: ".ma-search", title: "Encontre rápido", text: "Filtre sua biblioteca por nome, modelo, voz ou trecho do texto.", place: "bottom" },
  { sel: ".ma-viewbtn", title: "Visualização", text: "Alterne entre grade e tabela, e defina quantos itens ver por página.", place: "bottom" },
  { sel: ".tb-userbtn", title: "Sua conta", text: "Acesse Configurações para personalizar a aparência e ligar o assistente Ampl.IA.", place: "bottom" },
] as const;

export function TourGuide({ onFinish }: { onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [, setTick] = useState(0);
  const step = TOUR_STEPS[i];

  useLayoutEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("resize", bump);
    window.addEventListener("scroll", bump, true);
    return () => { window.removeEventListener("resize", bump); window.removeEventListener("scroll", bump, true); };
  }, []);

  const el = typeof document !== "undefined" ? document.querySelector(step.sel) : null;
  const rect = el ? el.getBoundingClientRect() : null;

  const next = () => { i < TOUR_STEPS.length - 1 ? setI(i + 1) : onFinish(); };
  const prev = () => { if (i > 0) setI(i - 1); };

  const pad = 8;
  const spot = rect ? {
    top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
  } : null;

  let popStyle: React.CSSProperties = {};
  if (rect) {
    const vw = window.innerWidth, vh = window.innerHeight, pw = 300, gap = 16;
    if (step.place === "right") {
      popStyle = { top: Math.min(Math.max(16, rect.top), vh - 220), left: rect.left + rect.width + gap };
    } else {
      const below = rect.top + rect.height + gap;
      const top = below + 200 > vh ? Math.max(16, rect.top - 200 - gap) : below;
      let left = rect.left + rect.width / 2 - pw / 2;
      left = Math.min(Math.max(16, left), vw - pw - 16);
      popStyle = { top, left };
    }
  }

  return (
    <div className="tour-layer">
      <div className="tour-scrim" onClick={() => {}}></div>
      {spot && <div className="tour-spot" style={spot}></div>}
      {rect && (
        <div className="tour-pop" style={popStyle}>
          <div className="tour-step">Passo {i + 1} de {TOUR_STEPS.length}</div>
          <h3 className="tour-title">{step.title}</h3>
          <p className="tour-text">{step.text}</p>
          <div className="tour-nav">
            <div className="tour-dots">
              {TOUR_STEPS.map((_, k) => <span key={k} className={"tour-dot" + (k === i ? " on" : "")}></span>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {i > 0 && <button className="tour-skip" onClick={prev}>Voltar</button>}
              <button className="tour-skip" onClick={onFinish}>Pular</button>
              <button className="btn btn-primary btn-sm" onClick={next}>{i < TOUR_STEPS.length - 1 ? "Próximo" : "Concluir"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
