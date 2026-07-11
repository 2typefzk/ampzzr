/* ============================================================
   AMPLI — App root
   ============================================================ */
import { useState, useEffect } from "react";
import { TopBar, Sidebar } from "./components/Shell";
import { AmpliaWindow, AmpliaLauncher } from "./components/Amplia";
import { LoginScreen, WelcomeModal, TourGuide } from "./screens/Auth";
import { Dashboard } from "./screens/Dashboard";
import { MyAudios } from "./screens/MyAudios";
import { Trilhas } from "./screens/Trilhas";
import { Chamados } from "./screens/Chamados";
import { Campaigns, CampaignDetail, CampaignModal } from "./screens/Campaigns";
import { Settings } from "./screens/Settings";
import { CreateFlow, type ImportKind } from "./screens/create-flow/CreateFlow";
import { HelpTicketModal, ChamadoChat, createChamado } from "./components/Chamados";
import { nextProtocolo } from "./screens/Chamados";
import { TRILHA_LIB, CAMPAIGN_LIB, CHAMADO_LIB } from "./data/mockData";
import type { Campaign, Chamado, ChamadoMessage, ChamadoOption, HelpTarget, LibraryAudio, Trilha, TweakSettings } from "./types";

const USER_NAME = "Luciana Zappala";

const TWEAK_DEFAULTS: TweakSettings = {
  accent: "#e8602a",
  theme: "escuro",
  bg: "grafite",
  radius: "suave",
  amplia: "off",
  modelos: "off",
  modelillos: "on",
  novoaudio: "off",
  heroanim: "on",
};

type Route = "dashboard" | "audios" | "trilhas" | "chamados" | "campanhas" | "campanha" | "settings";

function App() {
  const [t, setT] = useState<TweakSettings>(TWEAK_DEFAULTS);
  const setTweak = <K extends keyof TweakSettings>(key: K, value: TweakSettings[K]) =>
    setT((prev) => ({ ...prev, [key]: value }));

  const [creating, setCreating] = useState(false);
  const [editAudio, setEditAudio] = useState<LibraryAudio | null>(null);
  const [importRoteiro, setImportRoteiro] = useState<{ text: string | null; kind: ImportKind } | null>(null);
  const [trilhas, setTrilhas] = useState<Trilha[]>(() => TRILHA_LIB);
  const [chamados, setChamados] = useState<Chamado[]>(() => CHAMADO_LIB);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => CAMPAIGN_LIB);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignModal, setCampaignModal] = useState<Campaign | {} | null>(null);
  const [route, setRoute] = useState<Route>("dashboard");
  const [ampliaOpen, setAmpliaOpen] = useState(false);
  const ampliaEnabled = t.amplia === "on";
  const [authed, setAuthed] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [tour, setTour] = useState(false);

  // ---- Chamados de ajuda ("Preciso de ajuda" nos editores) ----
  // Compartilham o mesmo estado `chamados` da tela CRUD.
  const [helpTarget, setHelpTarget] = useState<HelpTarget | null>(null);
  const [activeChamadoId, setActiveChamadoId] = useState<string | null>(null);

  const requestHelp = (target: HelpTarget) => setHelpTarget(target);
  const submitHelp = (text: string) => {
    if (!helpTarget) return;
    const ch = createChamado(helpTarget, text, USER_NAME, nextProtocolo(chamados));
    setChamados((list) => [ch, ...list]);
    setHelpTarget(null);
    setActiveChamadoId(ch.id);
  };
  const chooseChamadoOption = (chamadoId: string, msgId: string, option: ChamadoOption) => {
    setChamados((list) => list.map((c) => {
      if (c.id !== chamadoId) return c;
      const now = Date.now();
      const reply: ChamadoMessage[] = [
        { id: "u" + now, role: "cliente", author: c.requester, body: option.label, time: "Agora", ts: now },
        { id: "f" + now, role: "suporte", author: "Equipe Fuzzr", body: option.reply, time: "Agora", ts: now + 1 },
      ];
      const messages = c.messages
        .map((m) => m.id === msgId ? { ...m, options: undefined } : m)
        .concat(reply);
      return { ...c, messages, updatedTs: now, date: "Agora" };
    }));
  };
  const activeChamado = chamados.find((c) => c.id === activeChamadoId) || null;

  const onLogin = () => { setAuthed(true); setWelcome(true); };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.style.setProperty("--orange", t.accent);
    if (t.theme === "claro") root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
    if (t.bg === "berinjela") root.removeAttribute("data-bg"); else root.setAttribute("data-bg", t.bg);
    if (t.radius === "medio") root.removeAttribute("data-radius"); else root.setAttribute("data-radius", t.radius);
    const t1 = setTimeout(() => root.classList.remove("theme-switching"), 450);
    return () => clearTimeout(t1);
  }, [t.accent, t.theme, t.bg, t.radius]);

  const startNew = () => { setEditAudio(null); setImportRoteiro(null); setCreating(true); };
  const openAudio = (a: LibraryAudio) => { setEditAudio(a); setImportRoteiro(null); setCreating(true); };
  const startFromRoteiro = (text: string | null, kind?: string) => { setEditAudio(null); setImportRoteiro({ text, kind: (kind || "paste") as ImportKind }); setCreating(true); };
  const startBatch = () => { setEditAudio(null); setImportRoteiro({ text: null, kind: "batch" }); setCreating(true); };
  const startBatchScratch = () => { setEditAudio(null); setImportRoteiro({ text: null, kind: "batch-scratch" }); setCreating(true); };
  const close = () => { setCreating(false); setEditAudio(null); setImportRoteiro(null); };

  const openCampaign = (c: Campaign) => { setCampaignId(c.id); setRoute("campanha"); };
  const openCampaignByName = (name: string) => {
    const c = campaigns.find((x) => x.title === name);
    if (c) { setCampaignId(c.id); setRoute("campanha"); }
  };
  const saveCampaign = (c: Campaign) => {
    setCampaigns((list) => list.some((x) => x.id === c.id) ? list.map((x) => x.id === c.id ? c : x) : [c, ...list]);
    setCampaignModal(null);
    setCampaignId(c.id);
  };
  const currentCampaign = campaigns.find((x) => x.id === campaignId) || null;

  if (!authed) return <LoginScreen onLogin={onLogin} />;

  return (
    <div className="app-root">
      <TopBar t={t} onNew={startNew} onOpenSettings={() => setRoute("settings")} onLogout={() => { setAuthed(false); setWelcome(false); setTour(false); setRoute("audios"); setAmpliaOpen(false); }} />
      <div className="app-body">
        <Sidebar route={route} onNavigate={(id) => { if (id === "audios" || id === "dashboard" || id === "trilhas" || id === "chamados" || id === "campanhas") setRoute(id as Route); }} onOpenAmplia={() => setAmpliaOpen(true)} ampliaEnabled={ampliaEnabled} />
        {route === "settings" ?
          <Settings t={t} setTweak={setTweak} onClose={() => setRoute("audios")} /> :
          route === "dashboard" ?
            <Dashboard userName="Luciana" heroAnim={t.heroanim !== "off"} onNew={startNew} onStartRoteiro={startFromRoteiro} onStartBatch={startBatch} onOpen={openAudio} onNavigate={(r) => setRoute(r as Route)} /> :
            route === "trilhas" ?
              <Trilhas theme={t.theme} items={trilhas} setItems={setTrilhas}
                onOpenCampaign={openCampaignByName} /> :
              route === "chamados" ?
                <Chamados items={chamados} setItems={setChamados} /> :
              route === "campanhas" ?
                <Campaigns campaigns={campaigns} onOpen={openCampaign} onCreate={() => setCampaignModal({})} /> :
                route === "campanha" ?
                  <CampaignDetail campaign={currentCampaign} theme={t.theme}
                    campaigns={campaigns} onCreateCampaign={() => setCampaignModal({})}
                    onBack={() => setRoute("campanhas")} onEdit={(c) => setCampaignModal(c)}
                    onNew={startNew} onStartBatch={startBatchScratch} onOpen={openAudio} /> :
                  <MyAudios onNew={startNew} onStartBatch={startBatchScratch} onOpen={openAudio} theme={t.theme}
                    campaigns={campaigns} onCreateCampaign={() => setCampaignModal({})} />}
      </div>
      {creating &&
        <CreateFlow
          startAudio={editAudio}
          importText={importRoteiro && importRoteiro.text}
          importKind={importRoteiro ? importRoteiro.kind : null}
          modelosEnabled={t.modelos === "on"}
          illosEnabled={t.modelillos !== "off"}
          trilhas={trilhas}
          onClose={close}
          onRequestHelp={requestHelp}
          onTrilhaUsed={(tr) => {
            if (tr && tr.id) {
              setTrilhas((list) => list.map((x) => x.id === tr.id ? { ...x, usedIn: (x.usedIn || 0) + 1 } : x));
            }
          }}
          onComplete={() => { close(); }} />
      }

      {ampliaEnabled && !creating && ampliaOpen && <AmpliaWindow onClose={() => setAmpliaOpen(false)} />}
      {ampliaEnabled && !creating && <AmpliaLauncher open={ampliaOpen} onToggle={() => setAmpliaOpen((o) => !o)} />}

      {welcome && <WelcomeModal onTour={() => { setWelcome(false); setRoute("audios"); setTimeout(() => setTour(true), 350); }} onExplore={() => setWelcome(false)} />}
      {tour && <TourGuide onFinish={() => setTour(false)} />}

      {campaignModal && <CampaignModal campaign={"id" in campaignModal ? (campaignModal as Campaign) : null}
        onClose={() => setCampaignModal(null)} onSave={saveCampaign} />}

      {helpTarget && <HelpTicketModal target={helpTarget} onClose={() => setHelpTarget(null)} onSubmit={submitHelp} />}
      {activeChamado && <ChamadoChat chamado={activeChamado}
        onClose={() => setActiveChamadoId(null)}
        onChoose={(msgId, option) => chooseChamadoOption(activeChamado.id, msgId, option)} />}
    </div>);
}

export default App;
