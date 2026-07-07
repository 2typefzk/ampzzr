/* ============================================================
   AMPLI — Mock data
   ============================================================ */
import type {
  Model, ModelId, Voice, Trilha, LibraryAudio, Trecho, TrilhaGenre, Campaign,
} from "../types";
import spotDark from "../assets/spot-dark.png";
import spotLight from "../assets/spot-light.png";
import cdsDark from "../assets/cds-dark.png";
import cdsLight from "../assets/cds-light.png";

// Models available in step I
export const MODELS: Record<ModelId, Model> = {
  spot: {
    id: "spot",
    name: "Spot",
    color: "#e8602a",
    tagline: "Rádio / In-Store",
    desc: "Locução publicitária curta. Estrutura enxuta, com trilha de fundo e bloco único.",
    trechosLabel: ["Trecho Único"],
    illo: { dark: spotDark, light: spotLight },
    duration: "00:30",
    complexity: "Fácil",
  },
  carro: {
    id: "carro",
    name: "Carro de Som",
    color: "#d4a23a",
    tagline: "Itinerante / OOH",
    desc: "Locução repetitiva e marcante para carro de som. Frases curtas, alto impacto, looping contínuo.",
    trechosLabel: ["Múltiplos Trechos"],
    illo: { dark: cdsDark, light: cdsLight },
    duration: "01:00",
    complexity: "Intermediário",
  },
  novo: {
    id: "novo",
    name: "Novo Modelo",
    color: "#9b7ad6",
    tagline: "Comece do zero",
    desc: "Monte sua própria estrutura, livre de presets. Adicione quantos trechos quiser e defina a trilha.",
    trechosLabel: ["Trecho 1"],
    duration: "--:--",
    complexity: "Livre",
  },
};

// Voices (used as flavor in trechos / preview)
export const VOICES: Voice[] = [
  { id: "helena", name: "Helena", tone: "Quente · feminina" },
  { id: "rafael", name: "Rafael", tone: "Grave · masculina" },
  { id: "bia", name: "Bia", tone: "Jovem · feminina" },
  { id: "tom", name: "Tom", tone: "Locutor · masculina" },
];

// Background tracks (curated list used by the create-flow trilha picker)
export const TRILHAS: Trilha[] = [
  { id: "energia", name: "Energia Varejo", mood: "Animada · 124 BPM", dur: "00:32" },
  { id: "premium", name: "Premium Suave", mood: "Elegante · 90 BPM", dur: "00:40" },
  { id: "urgencia", name: "Urgência Oferta", mood: "Tensa · 140 BPM", dur: "00:28" },
  { id: "festa", name: "Festa Junina", mood: "Regional · 118 BPM", dur: "00:36" },
];

// Library of saved audios (Meus Áudios grid)
const SAMPLE_TEXT = {
  spot: "Aproveite a queima de estoque do Atacadão! Até 50% de desconto em toda linha de limpeza. Corre que é só essa semana!",
  carro: "Atenção, atenção! Chegou a feira do produtor aqui no bairro! Frutas, verduras e legumes fresquinhos, direto do campo pra sua mesa!",
  oferta: "Quarta-feira é dia de hortifruti no Assaí! Tomate, cebola e batata com preços que cabem no seu bolso. Venha conferir!",
};
export { SAMPLE_TEXT };

// kind: "single" (áudio unitário) | "batch" (lote de variações).
export const LIBRARY: LibraryAudio[] = [
  { id: "a1", name: "Atacadão · Queima de Estoque", model: "spot", kind: "single", campaign: "Semana do Cliente", trechos: 1, dur: "00:30", ts: Date.parse("2026-06-06T11:42"), text: SAMPLE_TEXT.spot, date: "Hoje, 11:42", status: "pronto", plays: 128 },
  { id: "a2", name: "Feira do Produtor · Volante", model: "carro", kind: "single", campaign: "Semana do Cliente", trechos: 3, dur: "00:45", ts: Date.parse("2026-06-06T09:15"), text: SAMPLE_TEXT.carro, date: "Hoje, 09:15", status: "pronto", plays: 54 },
  { id: "a3", name: "Assaí · Quarta do Hortifruti", model: "spot", kind: "batch", campaign: "Semana do Cliente", variations: 6, trechos: 1, dur: "00:30", ts: Date.parse("2026-06-05T17:03"), text: SAMPLE_TEXT.oferta, date: "Ontem, 17:03", status: "pronto", plays: 301 },
  { id: "a4", name: "Casas Bahia · Liquida Total", model: "spot", kind: "single", campaign: "Liquida Total", trechos: 1, dur: "00:20", ts: Date.parse("2026-06-05T14:20"), text: "É a Liquida Total Casas Bahia! Móveis, eletro e celular com até 12x sem juros. Tá esperando o quê?", date: "Ontem, 14:20", status: "pronto", plays: 210 },
  { id: "a5", name: "Hyundai · Feirão de Usados", model: "spot", kind: "single", campaign: "Feirão de Usados", trechos: 1, dur: "00:40", ts: Date.parse("2026-06-03T16:10"), text: "No Feirão Hyundai você sai de carro novo hoje! Entrada facilitada e taxa zero nas primeiras parcelas.", date: "3 jun", status: "pronto", plays: 88 },
  { id: "a6", name: "Padaria do Zé · Promoção Pão", model: "carro", kind: "single", campaign: "Volta às Aulas", trechos: 2, dur: "00:35", ts: Date.parse("2026-06-03T08:30"), text: "Olha o pãozinho quentinho da Padaria do Zé! Pão francês a um e noventa o quilo só hoje, aproveite!", date: "3 jun", status: "pronto", plays: 42 },
  { id: "a7", name: "Pulse + Assaí · Campanha Mãe", model: "spot", kind: "batch", campaign: "Dia das Mães", variations: 9, trechos: 1, dur: "00:30", ts: Date.parse("2026-06-02T13:00"), text: "Neste Dia das Mães, o Assaí preparou ofertas especiais pra você presentear quem mais ama. Confira!", date: "2 jun", status: "rascunho", plays: 0 },
  { id: "a8", name: "Acelerai · Black do Meio do Ano", model: "spot", kind: "batch", campaign: "Black do Meio do Ano", variations: 12, trechos: 1, dur: "00:25", ts: Date.parse("2026-06-01T10:05"), text: "Chegou a Black do Meio de Ano Acelerai! Descontos de verdade em tudo que você procura. Vem!", date: "1 jun", status: "pronto", plays: 165 },
  { id: "a9", name: "Festa Junina · Arraiá da Cidade", model: "carro", kind: "single", campaign: "Arraiá da Cidade", trechos: 3, dur: "00:50", ts: Date.parse("2026-05-30T19:20"), text: "Ô da casa! Tá chegando o maior arraiá da cidade! Quadrilha, comida típica e muito forró pra família toda!", date: "30 mai", status: "pronto", plays: 73 },
];

// Default trechos content when starting a new audio per model
export const DEFAULT_TRECHOS: Record<ModelId, Trecho[]> = {
  spot: [
    { id: "t1", label: "Chamada", content: "Chegou a grande promoção que você esperava! Só essa semana, condições imperdíveis em toda a loja — é a sua marca de confiança, sempre com o melhor preço!" },
  ],
  carro: [
    { id: "t1", label: "Abertura", content: "Atenção, atenção! Chegou a grande liquidação aqui no seu bairro!" },
    { id: "t2", label: "Oferta", content: "São ofertas imperdíveis em todos os departamentos, com preços que cabem no seu bolso." },
    { id: "t3", label: "Endereço", content: "É só aqui, na avenida principal, número mil e duzentos." },
    { id: "t4", label: "Fechamento", content: "Corre que é por tempo limitado! Aproveite hoje mesmo. Você não vai querer ficar de fora." },
  ],
  novo: [
    { id: "t1", label: "Trecho 1", content: "" },
  ],
};

// A "processed" roteiro returned by the (simulated) import pipeline
export const SAMPLE_IMPORT: string[] = [
  "Chegou a Semana do Cliente nas Lojas Marabraz! São milhares de ofertas pra deixar a sua casa com a sua cara, do jeitinho que você sempre quis.",
  "Sofá retrátil em até dez vezes de noventa e nove reais. Guarda-roupa de casal com quarenta por cento de desconto. E o colchão king a partir de cento e noventa e nove à vista!",
  "É muito mais por muito menos, e só essa semana! Corre pra Marabraz. Lojas Marabraz — a sua casa começa aqui.",
];

// ---- Trilhas (background music library) — CRUD screen ----
export const TRILHA_GENRES: Record<string, TrilhaGenre> = {
  varejo: { id: "varejo", name: "Varejo", color: "#e8602a" },
  premium: { id: "premium", name: "Premium", color: "#9b7ad6" },
  urgencia: { id: "urgencia", name: "Urgência", color: "#d96a4a" },
  regional: { id: "regional", name: "Regional", color: "#d4a23a" },
  institucional: { id: "institucional", name: "Institucional", color: "#5aa6c9" },
  sem: { id: "sem", name: "Sem categoria", color: "#7d7689" },
};

// Campanhas pré-existentes (combobox do upload) — nomes
export const CAMPAIGNS: string[] = [
  "Semana do Cliente",
  "Liquida Total",
  "Black do Meio do Ano",
  "Dia das Mães",
  "Feirão de Usados",
  "Arraiá da Cidade",
  "Volta às Aulas",
];

// Campanhas como entidade — agrupam Áudios, Lotes e Trilhas.
export const CAMPAIGN_LIB: Campaign[] = [
  { id: "cmp1", title: "Semana do Cliente", start: "2026-06-01", end: "2026-06-15", desc: "Campanha guarda-chuva de ofertas da Semana do Cliente para o varejo alimentar. Tom enérgico, foco em urgência e preço.", ts: Date.parse("2026-05-28T09:00") },
  { id: "cmp2", title: "Liquida Total", start: "2026-06-03", end: "2026-06-10", desc: "Queima de estoque de móveis e eletro. Destaque para parcelamento sem juros.", ts: Date.parse("2026-05-30T14:00") },
  { id: "cmp3", title: "Dia das Mães", start: "2026-04-25", end: "2026-05-11", desc: "Campanha sazonal de Dia das Mães. Tom emocional e sofisticado.", ts: Date.parse("2026-04-20T10:00") },
  { id: "cmp4", title: "Black do Meio do Ano", start: "2026-06-01", end: "2026-06-30", desc: "Mega promoção de meio de ano com descontos agressivos em todas as categorias.", ts: Date.parse("2026-05-25T11:00") },
  { id: "cmp5", title: "Feirão de Usados", start: "", end: "", desc: "Feirão de veículos seminovos e usados com condições especiais de entrada.", ts: Date.parse("2026-05-29T16:00") },
  { id: "cmp6", title: "Arraiá da Cidade", start: "2026-06-20", end: "2026-06-29", desc: "", ts: Date.parse("2026-05-31T08:00") },
];

// Seeded library of trilhas (durSec + bytes drive the numeric sorting; usedIn = nº de áudios)
export const TRILHA_LIB: Trilha[] = [
  { id: "tr1", name: "Energia Varejo", campaign: "Semana do Cliente", genre: "varejo", bpm: 124, durSec: 32, bytes: 2_516_582, usedIn: 12, ts: Date.parse("2026-06-08T10:30"), date: "Hoje, 10:30" },
  { id: "tr2", name: "Premium Suave", campaign: "Dia das Mães", genre: "premium", bpm: 90, durSec: 40, bytes: 3_250_586, usedIn: 7, ts: Date.parse("2026-06-08T09:05"), date: "Hoje, 09:05" },
  { id: "tr3", name: "Urgência Oferta", campaign: "Liquida Total", genre: "urgencia", bpm: 140, durSec: 28, bytes: 2_202_009, usedIn: 21, ts: Date.parse("2026-06-07T16:42"), date: "Ontem, 16:42" },
  { id: "tr4", name: "Festa Junina", campaign: "Arraiá da Cidade", genre: "regional", bpm: 118, durSec: 36, bytes: 2_831_155, usedIn: 4, ts: Date.parse("2026-06-07T11:20"), date: "Ontem, 11:20" },
  { id: "tr5", name: "Pop Verão Drive", campaign: "Semana do Cliente", genre: "varejo", bpm: 128, durSec: 30, bytes: 2_411_724, usedIn: 9, ts: Date.parse("2026-06-05T14:10"), date: "5 jun" },
  { id: "tr6", name: "Corporativo Clean", campaign: "Volta às Aulas", genre: "institucional", bpm: 100, durSec: 45, bytes: 3_565_158, usedIn: 3, ts: Date.parse("2026-06-04T17:55"), date: "4 jun" },
  { id: "tr7", name: "Black do Meio do Ano", campaign: "Black do Meio do Ano", genre: "urgencia", bpm: 150, durSec: 25, bytes: 2_044_723, usedIn: 18, ts: Date.parse("2026-06-03T08:30"), date: "3 jun" },
  { id: "tr8", name: "Sertanejo Promo", campaign: "Feirão de Usados", genre: "regional", bpm: 112, durSec: 38, bytes: 2_988_441, usedIn: 6, ts: Date.parse("2026-06-02T13:00"), date: "2 jun" },
  { id: "tr9", name: "Lounge Sofisticado", campaign: "Dia das Mães", genre: "premium", bpm: 84, durSec: 50, bytes: 3_932_160, usedIn: 2, ts: Date.parse("2026-05-30T19:20"), date: "30 mai" },
];
