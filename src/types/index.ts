/* ============================================================
   AMPLI — shared domain types
   ============================================================ */

export type ModelId = "spot" | "carro" | "novo";

export interface Model {
  id: ModelId;
  name: string;
  color: string;
  tagline: string;
  desc: string;
  trechosLabel: string[];
  illo?: { dark: string; light: string };
  duration: string;
  complexity: string;
}

export interface Voice {
  id: string;
  name: string;
  tone: string;
}

export interface Trilha {
  id: string;
  name: string;
  mood?: string;
  dur?: string;
  campaign?: string;
  genre?: string;
  bpm?: number | null;
  durSec?: number;
  bytes?: number;
  usedIn?: number;
  ts?: number;
  date?: string;
  url?: string;
  isNew?: boolean;
}

export type AudioKind = "single" | "batch";
export type AudioStatus = "pronto" | "rascunho";

export interface LibraryAudio {
  id: string;
  name: string;
  model: ModelId;
  kind: AudioKind;
  campaign?: string;
  variations?: number;
  trechos: number;
  dur: string;
  ts: number;
  text: string;
  date: string;
  status: AudioStatus;
  plays: number;
  voice?: string;
}

export interface TrilhaGenre {
  id: string;
  name: string;
  color: string;
}

export interface Campaign {
  id: string;
  title: string;
  start: string;
  end: string;
  desc: string;
  ts: number;
}

export type TrechoTipo = "texto" | "audio" | "variavel";

export interface TrechoAudio {
  id: string;
  name: string;
  durSec: number;
  bars?: number[];
}

export interface Trecho {
  id: string;
  label: string;
  content?: string;
  tipo?: TrechoTipo;
  voice?: string;
  audio?: TrechoAudio | null;
  variacoes?: string[];
}

export interface TweakSettings {
  accent: string;
  theme: "escuro" | "claro";
  bg: "berinjela" | "grafite" | "petroleo";
  radius: "suave" | "medio" | "reto";
  amplia: "on" | "off";
  modelos: "on" | "off";
  modelillos: "on" | "off";
  novoaudio: "on" | "off";
  heroanim: "on" | "off";
}

export interface BatchRow {
  id: string;
  name: string;
  status: "pronto" | "aprovado" | "modificado";
}
