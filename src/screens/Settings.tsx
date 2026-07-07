/* ============================================================
   AMPLI — Settings page (Configurações)
   ============================================================ */
import { useState } from "react";
import { Icon } from "../components/Icon";
import type { TweakSettings } from "../types";

function hexValid(v: string) { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v); }

function SettingRow({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="st-row">
      <div className="st-row-info">
        <div className="st-row-title">{title}</div>
        {desc && <div className="st-row-desc">{desc}</div>}
      </div>
      <div className="st-row-control">{children}</div>
    </div>
  );
}

function Segmented({ value, options, onChange }: {
  value: string; options: { value: string; label: string; icon?: React.ReactNode }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="st-seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab"
          className={"st-seg-btn" + (value === o.value ? " active" : "")}
          onClick={() => onChange(o.value)}>
          {o.icon && <span className="st-seg-ic">{o.icon}</span>}{o.label}
        </button>
      ))}
    </div>
  );
}

function ThemeColorControl({ accent, setTweak }: { accent: string; setTweak: (k: string, v: string) => void }) {
  const isCustom = accent.toLowerCase() !== "#e8602a";
  const [draft, setDraft] = useState(isCustom ? accent : "#2a6fdb");

  const applyDraft = (v: string) => {
    setDraft(v);
    if (hexValid(v)) setTweak("accent", v.length === 4
      ? "#" + v.slice(1).split("").map((c) => c + c).join("")
      : v);
  };

  return (
    <div className="st-color">
      <div className="st-color-opts">
        <button className={"st-coloropt" + (!isCustom ? " active" : "")}
          onClick={() => setTweak("accent", "#e8602a")}>
          <span className="st-swatch" style={{ background: "#e8602a" }}></span>
          <span className="st-coloropt-lbl">Laranja Ampli</span>
          {!isCustom && <span className="st-check">{Icon.check({ style: { width: 15, height: 15 } })}</span>}
        </button>
        <button className={"st-coloropt" + (isCustom ? " active" : "")}
          onClick={() => setTweak("accent", hexValid(draft) ? draft : "#2a6fdb")}>
          <span className="st-swatch checker" style={{ background: isCustom ? accent : draft }}></span>
          <span className="st-coloropt-lbl">Customizar</span>
          {isCustom && <span className="st-check">{Icon.check({ style: { width: 15, height: 15 } })}</span>}
        </button>
      </div>
      {isCustom && (
        <div className="st-hexrow">
          <label className="st-hex-well" style={{ background: hexValid(draft) ? draft : "transparent" }}>
            <input type="color" value={hexValid(draft) ? (draft.length === 4 ? "#" + draft.slice(1).split("").map((c) => c + c).join("") : draft) : "#2a6fdb"}
              onChange={(e) => applyDraft(e.target.value)} />
          </label>
          <div className="st-hex-field">
            <span className="st-hex-hash">#</span>
            <input className="st-hex-input" value={draft.replace(/^#/, "")} maxLength={6}
              spellCheck={false} placeholder="2A6FDB"
              onChange={(e) => applyDraft("#" + e.target.value.replace(/[^0-9a-fA-F]/g, ""))} />
          </div>
          {!hexValid(draft) && <span className="st-hex-warn">Hex inválido</span>}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={"st-switch" + (on ? " on" : "")} role="switch" aria-checked={on}
      onClick={() => onChange(!on)}>
      <span className="st-switch-knob"></span>
      <span className="st-switch-txt">{on ? "Ativado" : "Desativado"}</span>
    </button>
  );
}

export interface SettingsProps {
  t: TweakSettings;
  setTweak: <K extends keyof TweakSettings>(key: K, value: TweakSettings[K]) => void;
  onClose: () => void;
}

export function Settings({ t, setTweak, onClose }: SettingsProps) {
  const [cat, setCat] = useState("aparencia");
  const ampliaOn = t.amplia === "on";
  const cats = [
    { id: "aparencia", label: "Aparência", icon: Icon.sparkle({ style: { width: 17, height: 17 } }) },
    { id: "recursos", label: "Recursos", icon: Icon.grid({ style: { width: 17, height: 17 } }) },
    { id: "amplia", label: "Ampl.IA", icon: Icon.amplia({ style: { width: 18, height: 18 } }) },
  ];
  return (
    <div className="st-page">
      <div className="ma-inner st-inner">
        <div className="st-head anim-up">
          <button className="st-back" onClick={onClose}>{Icon.chevLeft({ style: { width: 16, height: 16 } })} Voltar</button>
          <div className="u-label" style={{ marginBottom: 10, marginTop: 14 }}>Preferências</div>
          <h1 className="display st-title">Configurações</h1>
          <p className="ma-sub">Personalize a sua experiência na Ampli.</p>
        </div>

        <div className="st-layout anim-up" style={{ animationDelay: ".05s" }}>
          <aside className="st-rail">
            {cats.map((c) => (
              <button key={c.id} className={"st-cat" + (cat === c.id ? " active" : "")} onClick={() => setCat(c.id)}>
                <span className="st-cat-ic">{c.icon}</span>{c.label}
              </button>
            ))}
          </aside>

          <section className="st-content">
            {cat === "aparencia" && (
              <div className="st-block">
                <div className="st-block-head">
                  <h2 className="st-block-title">Aparência</h2>
                  <p className="st-block-sub">Ajuste o visual da interface do jeito que você prefere.</p>
                </div>

                <div className="st-rows">
                  <SettingRow title="Modo de Cor" desc="Escolha entre tema escuro ou claro.">
                    <Segmented value={t.theme}
                      onChange={(v) => setTweak("theme", v as TweakSettings["theme"])}
                      options={[
                        { value: "escuro", label: "Dark Mode", icon: MoonIcon() },
                        { value: "claro", label: "Light Mode", icon: SunIcon() },
                      ]} />
                  </SettingRow>

                  <SettingRow title="Cor do Tema" desc="A cor de destaque usada em botões e ações.">
                    <ThemeColorControl accent={t.accent} setTweak={setTweak as any} />
                  </SettingRow>

                  <SettingRow title="Cantos" desc="O raio das bordas de cards, botões e campos.">
                    <Segmented value={t.radius === "reto" ? "reto" : "suave"}
                      onChange={(v) => setTweak("radius", v as TweakSettings["radius"])}
                      options={[
                        { value: "suave", label: "Arredondado", icon: RoundIcon() },
                        { value: "reto", label: "Quadrado", icon: SquareIcon() },
                      ]} />
                  </SettingRow>

                  <SettingRow title="Ilustrações de Modelo"
                    desc="Quando ativado, os cards de “Escolha o Modelo” exibem ilustrações no lugar do ícone de onda. Ativado por padrão.">
                    <ToggleSwitch on={t.modelillos !== "off"} onChange={(v) => setTweak("modelillos", v ? "on" : "off")} />
                  </SettingRow>
                </div>
              </div>
            )}

            {cat === "recursos" && (
              <div className="st-block">
                <div className="st-block-head">
                  <h2 className="st-block-title">Recursos</h2>
                  <p className="st-block-sub">Ative ou desative funcionalidades da plataforma.</p>
                </div>
                <div className="st-rows">
                  <SettingRow title="Botão Novo Áudio"
                    desc="Quando ativado, exibe o botão de atalho “Novo Áudio” na barra superior. Desativado por padrão.">
                    <ToggleSwitch on={t.novoaudio === "on"} onChange={(v) => setTweak("novoaudio", v ? "on" : "off")} />
                  </SettingRow>
                  <SettingRow title="Modelos"
                    desc="Quando ativado, permite criar e salvar modelos próprios de áudio (opção “Novo Modelo”). Desativado por padrão.">
                    <ToggleSwitch on={t.modelos === "on"} onChange={(v) => setTweak("modelos", v ? "on" : "off")} />
                  </SettingRow>
                </div>
              </div>
            )}

            {cat === "amplia" && (
              <div className="st-block">
                <div className="st-block-head">
                  <h2 className="st-block-title">Ampl.IA</h2>
                  <p className="st-block-sub">O assistente de produção que ajuda a criar e refinar seus áudios por chat ou voz.</p>
                </div>
                <div className="st-rows">
                  <SettingRow title="Assistente Ampl.IA"
                    desc="Quando ativado, o Ampl.IA aparece no menu lateral e como botão flutuante. Desativado por padrão.">
                    <ToggleSwitch on={ampliaOn} onChange={(v) => setTweak("amplia", v ? "on" : "off")} />
                  </SettingRow>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* tiny inline glyphs for the segmented controls */
const MoonIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
const SunIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const RoundIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12V8a4 4 0 0 1 4-4h4" strokeLinecap="round" /></svg>;
const SquareIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12V4h8" strokeLinecap="round" /></svg>;
