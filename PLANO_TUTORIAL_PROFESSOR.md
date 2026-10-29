# Plano de Implementação: Tutorial Interativo & Didático Completo para o Professor Orientador (UFV)

## 1. Visão Geral e Propósito
O professor orientador da disciplina de Agricultura Digital da UFV está avaliando a plataforma em produção (`https://aplicativo-coleta.vercel.app`).
Para proporcionar uma experiência de acolhimento e avaliação acadêmica de altíssimo nível, adicionaremos um **Tutorial Completo, Didático e Interativo ("Guia do Professor Orientador")**.

O objetivo é que, ao acessar a plataforma (ou a qualquer momento através de atalhos evidentes na navegação), o professor tenha clareza imediata sobre:
1. **O que é o sistema e sua proposta pedagógica/científica** na cafeicultura e agricultura familiar da Zona da Mata mineira.
2. **Todas as funcionalidades que ele pode testar e operar na Workstation**.
3. **Como a experiência se conecta à ponta final (o produtor rural com o caderno digital e IA)**.
4. **Como exportar evidências para pesquisa acadêmica (.xlsx / CSV) e emitir pareceres com compartilhamento via WhatsApp**.

---

## 2. Estrutura da Experiência do Tutorial (Modos de Consumo)

Para atender tanto o professor que quer um **passo a passo guiado e imersivo** quanto aquele que prefere uma **consulta rápida ou checklist**, implementaremos 3 pontos de acesso complementares:

### A) Modal / Drawer de Boas-Vindas & Tour Guiado Interativo (Passo a Passo)
- **Acionador Principal**: Botão de destaque na Sidebar ("Guia Interativo / Tutorial") com badge comemorativo/pulsante e atalho na Topbar ("Como Funciona?").
- **Abertura Inteligente**: Opção de primeiro acesso guiado (com botão de pular e "não mostrar novamente", salvo em `localStorage`).
- **Navegação em 7 Etapas Didáticas** com barra de progresso (ex: "Passo 3 de 7"), ilustrações vetoriais/esquemas interativos e atalhos com ação direta ("Ir para esta aba agora"):
  - **Etapa 1: Visão Geral da Workstation AgTech** (Missão UFV, conexão entre docente e produtores cadastrados).
  - **Etapa 2: Workstation Analítica & Gráficos Interativos** (3 modos de visualização: Deep Dive univariado, Grid Overview multivariado e Benchmarking entre fazendas; KPIs clicáveis que focam variáveis).
  - **Etapa 3: Matriz de Dados & Inspeção Individual** (Busca universal, ordenação em qualquer coluna, pílulas de filtro rápido e gaveta lateral de auditoria de lançamentos com fotos e IA).
  - **Etapa 4: Construtor Visual de Coleta Dinâmica** (Catálogo de 7 tipos agronômicos, seleção do tipo de gráfico resultante, reordenação subir/descer e presets prontos de safra cafeeira).
  - **Etapa 5: Live Mobile Preview em Tempo Real** (Smartphone responsivo que simula instantaneamente o que o produtor vê no campo ao alterar qualquer variável).
  - **Etapa 6: Parecer Técnico & Exportação Acadêmica** (Recomendações fitotécnicas, tags de atenção e disparo formatado para WhatsApp do produtor; exportação bruta para Excel .xlsx e CSV).
  - **Etapa 7: Caderno Digital do Produtor Rural** (Como o cafeicultor lança dados, fotos de notas/talhões e o diário de campo com processamento de IA local).

### B) Nova Aba Dedicada na Sidebar: "Guia & Documentação Docente" (`GUIA`)
- Adicionada como um módulo oficial ao lado de *Visão Analítica*, *Produtores & Registros*, *Construtor de Coleta* e *Parecer do Orientador*.
- Oferece um hub centralizado e estruturado:
  - **Checklist Interativo de Avaliação ("Roteiro de Degustação da Plataforma")**: 7 missões práticas com caixas de seleção que o professor marca à medida que experimenta (ex: "[ ] Criar uma variável de Adubação", "[ ] Focar no gráfico de produtividade", "[ ] Exportar planilha .xlsx").
  - **Simulador de Jornadas Docente vs. Produtor**: Cards clicáveis com cenários reais de uso agronômico.
  - **Tabela Comparativa de Recursos**: O que o docente controla vs. o que o produtor visualiza.
  - **FAQ Didático para Avaliação de Estágio**: Respostas imediatas sobre arquitetura (Next.js Turbopack, Tailwind CSS, Local Data-Store reativo, geração vetorial SVG e exportação SheetJS).

### C) Pílula / Botão de Acesso Rápido na Tela de Login
- Para permitir que o professor ou avaliadores externos compreendam o escopo do projeto mesmo antes de digitar as credenciais de teste (`testeprofessor` / `1234`).
- Botão "Ver Guia Rápido & Funcionalidades" abaixo dos campos de login, abrindo o modal didático resumido.

---

## 3. Arquitetura de Componentes & Arquivos

```
src/
├── components/
│   ├── ProfessorTutorialModal.tsx    <-- Componente de Tour Guiado Passo a Passo (7 etapas com preview gráfico e ações)
│   ├── ProfessorGuideTab.tsx          <-- Aba dedicada completa com checklist interativo, diagramas e guia de operações
│   ├── AnalyticalCharts.tsx          <-- Integração visual de tooltips pedagógicos
│   └── ...
├── types/
│   └── producer.ts                   <-- Tipo para checklist/progresso do tutorial (se aplicável)
└── app/
    └── page.tsx                      <-- Integração da aba 'GUIA', modal flutuante e botões de disparo
```

---

## 4. Detalhamento do Conteúdo Pedagógico de Cada Módulo

### 1. Workstation Analítica (Gráficos)
- Explicar os 3 modos do seletor:
  - **Foco Univariado (Deep Dive)**: Histograma, barras por fazenda, desvio-padrão regional e boxplot/estatísticas.
  - **Visão Geral em Grade (Grid Overview)**: Todos os gráficos de todas as variáveis simultaneamente na tela.
  - **Benchmarking Comparativo**: Tabela dinâmica ranqueando propriedades de maior produtividade para menor custo.
- Explicar que os **KPIs de topo são interativos**: clicar em "Área Trabalhada" foca a variável `area_ha`; clicar em "Volume de Produção" foca `producao`; clicar em "Registros no Escopo" abre o benchmarking.

### 2. Matriz de Produtores & Registros
- Como pesquisar em tempo real (`searchQuery` filtra produtor, talhão, observações e números).
- Como ordenar clicando nos cabeçalhos (`sortKey` e `sortDir`).
- Uso dos botões de pílula (Com Foto, Com Métricas IA, Safra 2026).
- Como inspecionar detalhes completos e fotos clicando em "Ver Detalhes" (abertura do Drawer lateral com timeline).

### 3. Construtor de Coleta
- Apresentação do catálogo dos 7 tipos agronômicos:
  1. *Numérico Contínuo* (sc, kg, sacas)
  2. *Moeda / Financeiro* (R$)
  3. *Área / Hectares* (ha)
  4. *Opções / Categorias* (com chips de cores)
  5. *Texto Descritivo*
  6. *Data / Ciclo de Safra*
  7. *Foto / Comprovante*
- Como definir o gráfico resultante (Barras, Donut, KPI ou Tabela).
- Como mover variáveis para cima/baixo (`ChevronUp` / `ChevronDown`).
- Como aplicar templates prontos em 1 clique (ex: Protocolo Cafeeiro Completo UFV).

### 4. Live Mobile Preview
- Demonstração visual de como o smartphone emulado à direita reage instantaneamente a cada adição, renomeação ou reordenação de campo.
- Possibilidade de digitar valores no mock e testar a usabilidade móvel.

### 5. Exportação e Parecer Técnico
- Exportação para Excel (.xlsx com formatação de cabeçalho e colunas dimensionadas) e CSV.
- Registro de parecer com seleção de tags temáticas e botão "Exportar para WhatsApp", gerando mensagem estruturada pronta para envio.

### 6. Visão do Produtor Rural
- Explicar a simplicidade do formulário de campo, o upload de fotos de talhões/notas fiscais e a transcrição/extração automática de notas por IA.

---

## 5. Plano de Execução & Validação

1. **Criação do Componente `ProfessorTutorialModal.tsx`**:
   - Estados: `isOpen`, `currentStep`, `completedSteps`.
   - Layout responsivo, navegação anterior/próximo, botões de ação rápida ("Ir para a aba agora").
   - Ilustrações e cards didáticos de alta fidelidade visual (Tailwind CSS, ícones Lucide).
2. **Criação do Componente `ProfessorGuideTab.tsx`**:
   - Seção de checklist prático com persistência em `localStorage`.
   - Seção com os 6 tópicos estruturados com diagramas explicativos de cada tela.
   - Botão para reiniciar ou reabrir o Tour Guiado a qualquer momento.
3. **Integração no `page.tsx`**:
   - Adicionar estado `activeProfTab: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES" | "GUIA"`.
   - Inserir botão de destaque "Guia do Professor" na Sidebar e na Topbar.
   - Adicionar botão de "Guia Rápido" na tela de login inicial.
4. **Verificação & Testes**:
   - Validação da compilação com `npm run build` (Turbopack + TypeScript).
   - Teste de fluxo: avanço e retrocesso dos passos do tutorial, persistência de checklist, navegação direta para abas correspondentes.
   - Teste de responsividade em desktop e telas menores.
