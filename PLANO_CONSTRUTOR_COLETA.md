# Plano de Implementação: Construtor de Coleta Visual, Intuitivo & Configurável + Data Grid Analítico

## 1. Visão Geral da Solução
O objetivo é transformar a aba **"Construtor de Coleta & Parametrização"** na experiência mais fluida, visual e intuitiva possível para o professor orientador da UFV, garantindo que ele defina com precisão e facilidade:
1. **O que coletar** (com catálogo visual de tipos agronômicos ricos, tags/badges personalizáveis e ordenação intuitiva);
2. **Como vai aparecer no app do produtor** (com Live Mobile Preview instantâneo e interativo em smartphone moderno, refletindo na hora cada tipo de campo e ordem);
3. **Como vai aparecer na visualização analítica** (configuração direta no campo: Gráfico de Barras Comparativo, Donut Proporcional, Indicador KPI de Topo ou Apenas Tabela);
4. **Visualização superior dos dados coletados** (busca em tempo real com highlight, ordenação direta clicando em qualquer coluna da tabela, e filtros rápidos por tags/status com um único clique).

---

## 2. Mudanças Estruturais nos Tipos e Modelos (`types/producer.ts` & `lib/data-store.ts`)

### 2.1 Expansão dos Tipos de Campo (`FieldType`)
Atualmente: `"number" | "text" | "select" | "date"`.
Novos tipos suportados com UX personalizada:
- `number`: Numérico Contínuo (produtividade, sacas, dosagens)
- `currency`: Moeda / Financeiro (R$, com formatação monetária automática)
- `area`: Área / Hectares (ha, com conversão e unidade fixa)
- `select`: Opções / Categorias (com badges coloridos customizáveis)
- `text`: Texto Descritivo Curto
- `date`: Data / Ciclo de Safra (seletor de data e safra agronômica)
- `photo`: Foto / Comprovante (upload de evidência fotográfica no formulário do produtor)

### 2.2 Configuração Analítica no Campo (`AnalyticalDisplayMode`)
- `chartType`: `"bar" | "distribution" | "kpi" | "table"`
  - `bar`: Gráfico de Barras Comparativo
  - `distribution`: Gráfico Donut Proporcional
  - `kpi`: Indicador KPI de Cartão no Topo
  - `table`: Apenas Matriz Tabular

### 2.3 Suporte a Badges Customizáveis para Opções
- Opções com tags/chips coloridos editáveis (ex: Café Arábica [Verde], Milho [Âmbar], etc.).

---

## 3. Catálogo Visual de Tipos no Construtor de Coleta

Em vez de um `<select>` simples e escondido:
- **Grade Visual de Cards de Tipos (7 tipos agronômicos)**:
  - Cada tipo com ícone representativo (`DollarSign`, `MapPin`/`Landmark`, `Hash`, `Tag`, `FileText`, `Calendar`, `Camera`);
  - Badge de "Visualização Padrão Sugerida" (ex: Moeda -> KPI / Barras; Opções -> Donut);
  - Seleção em 1 clique com borda ativa emerald e feedback tátil;
- **Reorganização de Campos (Subir / Descer)**:
  - Botões intuitivos `ChevronUp` e `ChevronDown` em cada variável da lista;
  - Reordena instantaneamente tanto no protocolo quanto no Live Mobile Preview e na tabela de dados;
- **Edição & Remoção Inline Rápida**:
  - Modal ou inline drawer para ajustar rótulo, unidade, obrigatoriedade e tipo de gráfico sem perder dados.

---

## 4. Live Mobile Preview Interativo e Instantâneo

- Smartphone realista com notch, status bar da fazenda e atualização reativa a cada tecla digitada;
- Renderização visual específica para cada tipo:
  - Moeda: prefixo `R$` com visual financeiro;
  - Área: sufixo `ha` com ícone de gleba;
  - Opções: badges clicáveis ou select estilizado;
  - Foto: botão de câmera/anexo com prévia de upload;
  - Data: picker com ícone de calendário;
- Permite que o professor teste preencher valores no mock do celular e veja o comportamento do produtor em tempo real.

---

## 5. Melhorias na Visualização dos Dados Coletados (Aba Tabela & Análise)

### 5.1 Ordenação Direta por Cabeçalhos da Tabela
- Clique em qualquer cabeçalho de coluna (Data, Produtor, Propriedade, ou qualquer campo dinâmico criado);
- Indicadores visuais de ordenação (`ArrowUpDown`, `ArrowUp`, `ArrowDown`);
- Suporte a ordenação numérica, textual e cronológica.

### 5.2 Filtros Rápidos Contextuais (1 Clique)
- Barra de pílulas rápidas no topo da tabela:
  - "Com Foto / Anexo", "Com Métricas IA", "Safra 2026", "Pendentes de Parecer", "Todas as Propriedades";
- Botão "Limpar Filtros" ativo quando houver filtros aplicados.

### 5.3 Busca Rápida Universal com Destaque
- Campo de busca refinado que filtra instantaneamente por nome do produtor, propriedade, município, texto do diário e valores dos campos.

---

## 6. Plano de Execução & Arquivos Impactados

1. **`src/types/producer.ts`**:
   - Atualizar `FieldType` com `"number" | "currency" | "area" | "select" | "text" | "date" | "photo"`;
   - Atualizar `CollectionField` com `chartType: "bar" | "distribution" | "kpi" | "table"` e suporte a badges/cores;
2. **`src/lib/mock-data.ts` & `src/lib/data-store.ts`**:
   - Adicionar funções de reordenação (`reorderFields(startIndex, endIndex)`);
   - Manter retrocompatibilidade total com dados existentes e templates;
3. **`src/app/page.tsx`**:
   - Redesenhar a interface da aba `CONFIGURAR`:
     - Catálogo visual de tipos com cartões;
     - Seletor visual de formato analítico com prévia de gráfico;
     - Controles de subir/descer na lista de variáveis ativas;
     - Suporte no Live Mobile Preview para todos os 7 tipos (incluindo moeda, área e upload de fotos);
   - Redesenhar e aprimorar a aba `TABELA`:
     - Cabeçalhos ordenáveis com estado `sortKey` e `sortDirection`;
     - Pílulas de filtros rápidos de 1 clique;
     - Barra de pesquisa integrada;
   - Suporte no formulário do Produtor para os novos tipos de campo (renderização correta quando o produtor logar);
4. **Verificação & Build**:
   - Executar `npm run build` e validar compilação estática Next.js 16 / Turbopack e tipagem TypeScript sem erros.
