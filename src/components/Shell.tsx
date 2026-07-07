/* ============================================================
   AMPLI — App shell: top bar, sidebar, user menu, notifications
   ============================================================ */
import { Fragment, useState } from "react";
import { Icon, type IconRenderer } from "./Icon";
import pulseLogo from "../assets/pulse-logo.svg";
import lucianaAvatar from "../assets/luciana.jpeg";
import type { TweakSettings } from "../types";

interface Notification {
  id: string;
  icon: IconRenderer;
  tone: "ok" | "info" | "warn";
  title: string;
  body: string;
  time: string;
}

const NOTIFICATIONS: Notification[] = [
  { id: "n4", icon: Icon.check, tone: "ok", title: "Áudio aprovado", body: "“Casas Bahia — Semana do Cliente” foi aprovado pelo cliente.", time: "agora" },
  { id: "n3", icon: Icon.waveform, tone: "info", title: "Renderização concluída", body: "Seu spot de 30s está pronto para download.", time: "há 2 h" },
  { id: "n2", icon: Icon.chat, tone: "warn", title: "Resposta no chamado #1820", body: "A equipe Fuzzr respondeu sua solicitação de apoio.", time: "ontem" },
  { id: "n1", icon: Icon.music, tone: "info", title: "Nova trilha disponível", body: "Adicionamos 12 trilhas à biblioteca de fundo musical.", time: "há 3 dias" },
];

function NotificationsPopover({ items, newId, isRead, onOpenNew, onClose }: {
  items: Notification[]; newId: string; isRead: boolean; onOpenNew: () => void; onClose: () => void;
}) {
  const toneClass = (tone: string) => "nt-ic nt-" + (tone || "info");
  return (
    <>
      <div className="ss-pop-scrim" onClick={onClose}></div>
      <div className="nt-pop anim-up">
        <div className="nt-head">
          <span className="nt-head-title">Notificações</span>
          {!isRead && <span className="nt-head-count">1 nova</span>}
        </div>
        <div className="nt-list">
          {items.map((n) => {
            const unread = n.id === newId && !isRead;
            return (
              <button
                key={n.id}
                className={"nt-item" + (unread ? " unread" : "")}
                onClick={() => { if (n.id === newId) onOpenNew(); }}>
                <span className={toneClass(n.tone)}>{n.icon({ style: { width: 17, height: 17 } })}</span>
                <span className="nt-body">
                  <span className="nt-row">
                    <span className="nt-title">{n.title}</span>
                    {unread && <span className="nt-dot"></span>}
                  </span>
                  <span className="nt-text">{n.body}</span>
                  <span className="nt-time">{n.time}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>);
}

export function TopBar({ t, onNew, onOpenSettings, onLogout }: {
  t: TweakSettings; onNew: () => void; onOpenSettings: () => void; onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const newId = NOTIFICATIONS[0].id;
  const [read, setRead] = useState(false);
  const markRead = () => setRead(true);
  const showNovo = t && t.novoaudio === "on";
  return (
    <header className="tb">
      <div className="tb-left">
        <div className="tb-logo">
          <span className="tb-wordmark">AMPLI</span>
          <span className="tb-by">by Fuzzr</span>
        </div>
      </div>
      <div className="tb-center" title="Pulse">
        <img className="tb-pulse" src={pulseLogo} alt="Pulse" draggable="false" style={{ height: "22px" }} />
        <span className="tb-logo-sep"></span>
        <label className="tb-cliente">
          <span className="tb-cliente-label">Cliente</span>
          <span className="tb-cliente-field">
            <select className="tb-cliente-select" defaultValue="casasbahia">
              <option value="casasbahia">Casas Bahia</option>
            </select>
            {Icon.chevDown({ className: "tb-cliente-caret" })}
          </span>
        </label>
      </div>
      <div className="tb-right">
        {showNovo && <button className="btn btn-primary btn-sm" onClick={onNew}>{Icon.plus({ style: { width: 15, height: 15 } })} Novo Áudio</button>}
        <div className="tb-notif">
          <button className={"tb-bell" + (notifOpen ? " active" : "")} onClick={() => setNotifOpen((o) => !o)} aria-label="Notificações">
            {Icon.bell({ style: { width: 20, height: 20 } })}
            {!read && <span className="tb-badge">1</span>}
          </button>
          {notifOpen &&
            <NotificationsPopover
              items={NOTIFICATIONS}
              newId={newId}
              isRead={read}
              onOpenNew={markRead}
              onClose={() => setNotifOpen(false)} />}
        </div>
        <div className="tb-user">
          <button className="tb-userbtn" onClick={() => setMenuOpen((o) => !o)}>
            <span className="tb-greet"><b>Luciana</b></span>
            <img className="tb-avatar" src={lucianaAvatar} alt="Luciana Zappala" draggable="false" />
          </button>
          {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} onOpenSettings={onOpenSettings} onLogout={onLogout} />}
        </div>
      </div>
    </header>);
}

function UserMenu({ onClose, onOpenSettings, onLogout }: {
  onClose: () => void; onOpenSettings: () => void; onLogout: () => void;
}) {
  const opts = [
    { id: "conta", label: "Minha Conta", icon: Icon.user, onClick: onClose },
    { id: "ajuda", label: "Central de Ajuda", icon: Icon.help, onClick: onClose },
    { id: "config", label: "Configurações", icon: Icon.cog, onClick: () => { onClose(); onOpenSettings(); } }];

  return (
    <>
      <div className="ss-pop-scrim" onClick={onClose}></div>
      <div className="um-pop anim-up">
        <div className="um-card">
          <img className="um-avatar" src={lucianaAvatar} alt="Luciana Zappala" draggable="false" />
          <div className="um-id">
            <div className="um-name">Luciana Zappala</div>
            <div className="um-dept"><span className="tag">CEO</span></div>
            <div className="um-email">luciana.zappala@pullse.online</div>
          </div>
        </div>
        <div className="um-sep"></div>
        <nav className="um-nav">
          {opts.map((o) =>
            <button key={o.id} className="um-item" onClick={o.onClick || onClose}>
              <span className="um-ic">{o.icon({ style: { width: 18, height: 18 } })}</span>{o.label}
            </button>
          )}
        </nav>
        <div className="um-sep"></div>
        <button className="um-item um-exit" onClick={() => { onClose(); onLogout(); }}>
          <span className="um-ic">{Icon.logout({ style: { width: 18, height: 18 } })}</span>Sair
        </button>
      </div>
    </>);
}

export function Sidebar({ route, onNavigate, onOpenAmplia, ampliaEnabled }: {
  route: string; onNavigate: (id: string) => void; onOpenAmplia: () => void; ampliaEnabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Icon.grid },
    { id: "audios", label: "Áudios", icon: Icon.waveform },
    { id: "campanhas", label: "Campanhas", icon: Icon.flag },
    { id: "trilhas", label: "Trilhas", icon: Icon.music },
    { id: "chamados", label: "Chamados", icon: Icon.chat }];

  return (
    <aside className={"sb" + (expanded ? " expanded" : "")}>
      <div className="sb-top">
        {ampliaEnabled &&
          <button className="sb-link sb-ai" onClick={onOpenAmplia}>
            <span className="sb-ic">{Icon.amplia({ style: { width: 21, height: 21 } })}</span>
            <span className="sb-label">Ampl.IA</span>
            <span className="sb-tip">Ampl.IA</span>
          </button>
        }
        {ampliaEnabled && <div className="sb-sep"></div>}
        <nav className="sb-nav">
          {items.map((it) =>
            <button key={it.id} className={"sb-link" + (route === it.id ? " active" : "")}
              onClick={() => onNavigate(it.id)}>
              <span className="sb-ic">{it.icon({ style: { width: 20, height: 20 } })}</span>
              <span className="sb-label">{it.label}</span>
              <span className="sb-tip">{it.label}</span>
            </button>
          )}
        </nav>
      </div>

      <div className="sb-bottom">
        <div className="sb-sep"></div>
        <button className="sb-link sb-toggle" onClick={() => setExpanded((e) => !e)}>
          <span className="sb-ic">{expanded ? Icon.chevLeft({ style: { width: 20, height: 20 } }) : Icon.chevRight({ style: { width: 20, height: 20 } })}</span>
          <span className="sb-label">{expanded ? "Recolher" : "Expandir"}</span>
          <span className="sb-tip">Expandir</span>
        </button>
      </div>
    </aside>);
}

export function StepRail({ railStep, steps }: { railStep: number; steps?: { n: number; l: string }[] }) {
  const list = steps || [{ n: 1, l: "Modelo" }, { n: 2, l: "Roteiro" }, { n: 3, l: "Prévia" }];
  return (
    <div className="cf-rail">
      {list.map((s, i) =>
        <Fragment key={s.n}>
          <div className={"cf-step" + (railStep === s.n ? " active" : "") + (railStep > s.n ? " done" : "")}>
            <span className="cf-step-dot">{railStep > s.n ? Icon.check({ style: { width: 13, height: 13 } }) : s.n}</span>
            <span className="cf-step-lbl">{s.l}</span>
          </div>
          {i < list.length - 1 && <span className={"cf-step-line" + (railStep > s.n ? " done" : "")}></span>}
        </Fragment>
      )}
    </div>);
}
