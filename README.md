# Ampli

Plataforma de produção de áudio publicitário (spots de rádio, carro de som) da **Fuzzr**. Implementado em React + TypeScript + Vite a partir de um handoff de design (Claude Design).

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- CSS puro, com design tokens via custom properties (tema escuro/claro, cores, raio de borda)
- Web Audio API para simular a locução e trilha gerada (não há geração de voz real / backend nesta versão)

## Rodando localmente

```bash
npm install
npm run dev      # inicia o servidor de desenvolvimento (Vite)
npm run build    # type-check (tsc -b) + build de produção
npm run preview  # serve o build de produção localmente
npm run lint     # oxlint
```

## Estrutura

```
src/
  App.tsx                  # shell raiz: auth, rotas, tema, orquestra os modais globais
  main.tsx                 # entrypoint + imports globais de CSS

  components/
    Icon.tsx                # conjunto de ícones SVG inline
    Shell.tsx                # TopBar, Sidebar, menu do usuário, notificações
    Waveform.tsx             # visualização de forma de onda (canvas)
    Amplia.tsx               # assistente "Ampl.IA" (chat com respostas mockadas)

  screens/
    Auth.tsx                 # login, modal de boas-vindas, tour guiado
    Dashboard.tsx             # tela inicial (hero animado, atalhos de criação, big numbers)
    MyAudios.tsx              # biblioteca "Meus Áudios" (grid/tabela, busca, campanhas)
    Trilhas.tsx               # biblioteca de trilhas de fundo (upload, CRUD)
    Campaigns.tsx             # campanhas (lista, detalhe, criar/editar)
    Settings.tsx              # configurações (aparência, recursos, Ampl.IA)
    create-flow/              # wizard de criação de áudio
      CreateFlow.tsx           # orquestra os passos abaixo
      StepModel.tsx            # Etapa 1 — escolha do modelo (Spot / Carro de Som)
      StepRoteiro.tsx          # Etapa 2 — importar ou começar do zero
      StepStructure.tsx        # Etapa 2 — composição dos trechos do roteiro
      StepPreview.tsx          # Etapa 3 — prévia, ajustes e aprovação/download
      StepBatchFiles.tsx       # Lote — importação de roteiro + planilha
      StepBatch.tsx            # Lote — edição em massa das variações geradas

  data/mockData.ts           # dados mockados (modelos, vozes, biblioteca, trilhas, campanhas)
  lib/audioEngine.ts         # sintetizador Web Audio (áudio + trilha "fake" para demo)
  types/index.ts             # tipos de domínio compartilhados
  styles/                    # CSS global (tokens, telas, componentes)
  assets/                    # imagens/ilustrações usadas pela UI
```

## Notas de implementação

- **Sem backend**: toda a persistência é em memória (estado do React), reiniciando ao recarregar a página.
- **Ampl.IA**: a UI do assistente é completa (chat, sugestões, gravação de voz simulada), mas as respostas são geradas localmente por um mock — o protótipo original dependia de uma API interna do Claude Design que não existe fora daquele ambiente.
- **Áudio**: play/pause, velocidade e volume da trilha são reais (Web Audio API), mas o conteúdo sonoro é sintetizado — não há TTS real.
