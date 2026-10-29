"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  BarChart3,
  Sliders,
  Database,
  Smartphone,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export interface ProfessorTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES" | "GUIA") => void;
}

interface TutorialStep {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  targetTab?: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES" | "GUIA";
  targetTabLabel?: string;
  icon: any;
  accentColor: string;
  content: {
    highlight: string;
    description: string;
    keyPoints: { title: string; desc: string }[];
    practicalTip: string;
    academicContext: string;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    badge: "Visão Institucional & Pedagógica",
    title: "Workstation AgroColeta UFV",
    subtitle: "Conectando a pesquisa acadêmica de Agricultura Digital à realidade do cafeicultor familiar",
    targetTab: "GUIA",
    targetTabLabel: "Abrir Guia & Documentação",
    icon: GraduationCap,
    accentColor: "emerald",
    content: {
      highlight: "Plataforma desenvolvida para monitoramento agronômico da Zona da Mata Mineira.",
      description:
        "O sistema articula duas pontas vitais: o Caderno Digital simplificado para o produtor rural no campo e a Workstation Analítica para o professor orientador e pesquisadores da Universidade Federal de Viçosa (UFV).",
      keyPoints: [
        {
          title: "Protocolos Flexíveis",
          desc: "O docente define as variáveis fitotécnicas sem depender de programadores.",
        },
        {
          title: "Inteligência de Campo",
          desc: "Caderno com transcrição e extração de métricas estruturadas de notas e talhões.",
        },
        {
          title: "Rigência Científica",
          desc: "Dados 100% auditáveis com cálculos de desvio-padrão regional e exportação imediata.",
        },
      ],
      practicalTip:
        "Você pode alternar entre a visão do Professor e do Produtor a qualquer instante utilizando as credenciais de teste 'testeprofessor' ou 'testeprodutor'.",
      academicContext:
        "Projeto alinhado às diretrizes de extensão tecnológica e pesquisa aplicada em cafeicultura de montanha da UFV.",
    },
  },
  {
    id: 2,
    badge: "Módulo Analítico & Gráficos",
    title: "Gráficos Vetoriais & Estatística Regional",
    subtitle: "3 modos de visualização dinâmica com interatividade direta nos KPIs de topo",
    targetTab: "GRAFICOS",
    targetTabLabel: "Ir para Visão Analítica agora",
    icon: BarChart3,
    accentColor: "blue",
    content: {
      highlight: "Visualizações SVG nativas ultra-rápidas sem bibliotecas externas pesadas.",
      description:
        "Permite ao docente explorar a dispersão de variáveis como área plantada, produtividade em sacas/ha e custos operacionais com alto nível de detalhe.",
      keyPoints: [
        {
          title: "KPIs de Topo Interativos",
          desc: "Ao clicar em 'Área Trabalhada' ou 'Volume de Produção', o gráfico foca instantaneamente na variável correspondente.",
        },
        {
          title: "3 Modos de Exibição",
          desc: "Deep Dive (análise aprofundada de uma variável), Grid Overview (todas em tela) e Benchmarking comparativo.",
        },
        {
          title: "Estatística Robusta",
          desc: "Cálculo em tempo real de média, desvio-padrão regional, valores mínimos e máximos por talhão.",
        },
      ],
      practicalTip:
        "Experimente alternar entre os modos 'Foco Univariado' e 'Grade Completa' no seletor acima dos gráficos para uma visão panorâmica.",
      academicContext:
        "Facilita a identificação de outliers e padrões de adoção de tecnologias de manejo entre diferentes microclimas.",
    },
  },
  {
    id: 3,
    badge: "Módulo de Auditoria & Dados",
    title: "Matriz de Produtores & Inspeção",
    subtitle: "Busca universal, ordenação em qualquer coluna e gaveta de auditoria com IA",
    targetTab: "TABELA",
    targetTabLabel: "Ir para Produtores & Registros",
    icon: Database,
    accentColor: "indigo",
    content: {
      highlight: "Controle tabular rigoroso com filtro instantâneo por produtor, talhão ou notas.",
      description:
        "A tabela centraliza todos os lançamentos recebidos das propriedades rurais, permitindo inspeção cirúrgica de cada variável enviada.",
      keyPoints: [
        {
          title: "Busca Universal & Filtros Rápidos",
          desc: "Pílulas para 'Com Arquivo/Foto', 'Com Métricas de IA' e 'Safra 2026', além de busca textual completa.",
        },
        {
          title: "Ordenação Multicoluna",
          desc: "Ordene por data, nome do produtor, propriedade ou qualquer variável numérica (sacas, área, custo).",
        },
        {
          title: "Slide-over Drawer de Auditoria",
          desc: "Clique em 'Ver Detalhes' para abrir o painel lateral com histórico completo, anexos e IA do lançamento.",
        },
      ],
      practicalTip:
        "Abra o drawer lateral de um registro para inspecionar os chips de métricas extraídos automaticamente do diário de campo.",
      academicContext:
        "Garante a rastreabilidade total da coleta para compor relatórios científicos, teses e dissertações.",
    },
  },
  {
    id: 4,
    badge: "Módulo de Parametrização",
    title: "Construtor de Coleta Dinâmica",
    subtitle: "Catálogo de 7 tipos agronômicos, seleção de tipo de gráfico e templates UFV",
    targetTab: "CONFIGURAR",
    targetTabLabel: "Ir para Construtor de Coleta",
    icon: Sliders,
    accentColor: "amber",
    content: {
      highlight: "Crie novas perguntas e variáveis que chegam instantaneamente ao celular do produtor.",
      description:
        "O orientador tem autonomia para desenhar formulários para safras específicas sem necessidade de novas compilações de software.",
      keyPoints: [
        {
          title: "7 Tipos de Dados Agronômicos",
          desc: "Numérico Contínuo, Moeda (R$), Área (ha), Múltipla Escolha, Texto Livre, Data de Colheita e Fotos.",
        },
        {
          title: "Gráfico Resultante Associado",
          desc: "Defina como a variável será exibida aos pesquisadores: Barras, Distribuição, KPI de topo ou Tabela.",
        },
        {
          title: "Reordenação & Templates Prontos",
          desc: "Suba ou desça perguntas com botões de seta e aplique presets prontos (ex: Protocolo Cafeeiro Completo UFV).",
        },
      ],
      practicalTip:
        "Clique em 'Adicionar Campo', crie uma variável como 'Teor de Umidade (%)' e observe o emulador móvel atualizar na hora.",
      academicContext:
        "Permite testar hipóteses acadêmicas sazonais (ex: incidência de broca-do-café ou custo com bioinsumos).",
    },
  },
  {
    id: 5,
    badge: "Simulação de Experiência",
    title: "Live Mobile Preview em Tempo Real",
    subtitle: "Emulador interativo responsivo ao lado do formulário do construtor",
    targetTab: "CONFIGURAR",
    targetTabLabel: "Ver Simulador Mobile",
    icon: Smartphone,
    accentColor: "emerald",
    content: {
      highlight: "O que o orientador configura na esquerda é renderizado ao vivo no smartphone à direita.",
      description:
        "Garante que o formulário final tenha usabilidade impecável para o produtor rural que usa telas sensíveis ao toque em campo.",
      keyPoints: [
        {
          title: "Interatividade no Emulador",
          desc: "Você pode clicar nos campos, selecionar opções e digitar valores diretamente na tela do smartphone simulado.",
        },
        {
          title: "Validação Visual Imediata",
          desc: "Detecte antecipadamente textos longos, unidades incorretas ou ordem confusa de perguntas de manejo.",
        },
        {
          title: "Design Touch-Friendly",
          desc: "Botões grandes, contrastes calibrados e inputs dimensionados para o trabalho agrícola.",
        },
      ],
      practicalTip:
        "Ao mover um campo para cima no construtor, repare como o card na tela do celular sobe instantaneamente com animação suave.",
      academicContext:
        "Reflete o compromisso com a ergonomia de software e a inclusão digital do homem do campo.",
    },
  },
  {
    id: 6,
    badge: "Orientação & Evidências",
    title: "Parecer Técnico & Exportação",
    subtitle: "Emissão de pareceres, tags de atenção, disparo via WhatsApp e exportação Excel (.xlsx)",
    targetTab: "SUGESTOES",
    targetTabLabel: "Ir para Parecer do Orientador",
    icon: Share2,
    accentColor: "purple",
    content: {
      highlight: "Fechando o ciclo pedagógico: do diagnóstico regional ao retorno prático ao agricultor.",
      description:
        "O orientador pode redigir recomendações fitotécnicas, selecionar tags temáticas e disparar relatórios estruturados para o WhatsApp do produtor ou exportar toda a base em Excel e CSV.",
      keyPoints: [
        {
          title: "Disparo Formatado para WhatsApp",
          desc: "Gera mensagem pronta com saudação institucional, indicadores de safra e recomendações personalizadas.",
        },
        {
          title: "Exportação Acadêmica Completa",
          desc: "Gere planilhas .xlsx e .csv limpas e pré-formatadas para análise estatística avançada em R ou Python.",
        },
        {
          title: "Histórico de Avaliações",
          desc: "Registro cronológico de pareceres emitidos para acompanhamento evolutivo das turmas de estágio.",
        },
      ],
      practicalTip:
        "Na aba 'Parecer', clique em 'Compartilhar no WhatsApp' para visualizar a prévia da mensagem gerada com emojis e quebras estruturadas.",
      academicContext:
        "Transfere o conhecimento gerado na universidade diretamente para a melhoria de produtividade das famílias cafeicultoras.",
    },
  },
  {
    id: 7,
    badge: "Ponta de Campo",
    title: "Caderno Digital do Produtor Rural",
    subtitle: "Acesso simplificado, fotos de comprovantes e transcrição inteligente de anotações",
    targetTab: "GUIA",
    targetTabLabel: "Explorar Comparativo Docente vs. Produtor",
    icon: Sparkles,
    accentColor: "rose",
    content: {
      highlight: "Projetado para eliminar a barreira do preenchimento complexo.",
      description:
        "O produtor faz login simplificado, visualiza apenas o formulário parametrizado e a linha do tempo histórica de sua própria propriedade.",
      keyPoints: [
        {
          title: "Diário de Campo Assistido",
          desc: "O produtor pode digitar notas livres (ex: 'colheita no talhão 3 com 40 sacas') e o sistema extrai métricas.",
        },
        {
          title: "Upload de Comprovantes",
          desc: "Envio de fotos do talhão, notas fiscais de adubos ou laudos de análise química do solo.",
        },
        {
          title: "Linha do Tempo Pessoal",
          desc: "Feed cronológico que permite ao cafeicultor relembrar o que foi feito na safra anterior.",
        },
      ],
      practicalTip:
        "Para testar o ambiente do produtor, clique em 'Encerrar Sessão' e faça login com 'testeprodutor' (senha: 1234).",
      academicContext:
        "Estimula a transição da caderneta de papel para registros digitais auditáveis sem atrito de uso.",
    },
  },
];

export function ProfessorTutorialModal({
  isOpen,
  onClose,
  onNavigateTab,
}: ProfessorTutorialModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agro_tutorial_completed_steps");
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch {
      // Ignora erro no localStorage
    }
  }, []);

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const next = [...completedSteps, stepId];
      setCompletedSteps(next);
      try {
        localStorage.setItem("agro_tutorial_completed_steps", JSON.stringify(next));
      } catch {
        // Ignora
      }
    }
  };

  const handleNext = () => {
    const currentId = TUTORIAL_STEPS[currentStepIndex].id;
    markStepCompleted(currentId);
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleFinish = () => {
    try {
      localStorage.setItem("agro_tutorial_has_seen", "true");
    } catch {
      // Ignora
    }
    onClose();
  };

  const handleActionClick = (tab?: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES" | "GUIA") => {
    if (tab && onNavigateTab) {
      markStepCompleted(TUTORIAL_STEPS[currentStepIndex].id);
      onNavigateTab(tab);
      onClose();
    }
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const progressPercent = Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 relative z-10">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Superior com Identidade Institucional */}
          <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center text-emerald-300">
                <GraduationCap className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider text-emerald-400 font-mono uppercase">
                    Guia do Professor Orientador
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/70 rounded">
                    UFV
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight mt-0.5">
                  Tour Guiado pelas Funcionalidades da Plataforma
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Etapa {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar tutorial"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Barra de Progresso Superior e Navegação Rápida entre Passos */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Progresso Geral do Roteiro
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold tabular-nums">
                {progressPercent}% Concluído
              </span>
            </div>

            {/* Barra contínua */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pílulas de Passos Clicáveis */}
            <div className="grid grid-cols-7 gap-1.5">
              {TUTORIAL_STEPS.map((s, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = completedSteps.includes(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => handleJumpToStep(idx)}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all text-center truncate cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-700 text-white font-semibold ring-1 ring-emerald-400"
                        : isDone
                        ? "bg-slate-800 text-emerald-300 hover:bg-slate-700"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
                    }`}
                    title={`Passo ${s.id}: ${s.title}`}
                  >
                    <span className="hidden sm:inline">Passo </span>{s.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo Central da Etapa */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            {/* Cabeçalho da Etapa Atual */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                <StepIcon className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-900 text-[11px] font-mono font-medium mb-1">
                  <span>{step.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Destaque Conceitual */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                {step.content.highlight}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.content.description}
              </p>
            </div>

            {/* Grid de 3 Pontos-Chave */}
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />
                <span>O que você pode observar e testar nesta funcionalidade:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {step.content.keyPoints.map((kp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                      <h5 className="text-xs font-semibold text-slate-900 truncate">
                        {kp.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {kp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Duplo: Dica Prática de Teste + Relevância Acadêmica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" strokeWidth={1.75} />
                  <span>Dica Prática para Avaliação</span>
                </div>
                <p className="text-amber-950 text-[11px] leading-relaxed">
                  {step.content.practicalTip}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={1.75} />
                  <span>Contexto Científico & Extensão</span>
                </div>
                <p className="text-emerald-950 text-[11px] leading-relaxed">
                  {step.content.academicContext}
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé com Navegação, Ação Direta e Fechamento */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStepIndex > 0 ? (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Etapa Anterior</span>
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
                >
                  Pular Tutorial
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {step.targetTab && (
                <button
                  onClick={() => handleActionClick(step.targetTab)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer w-full sm:w-auto"
                >
                  <span>{step.targetTabLabel || "Ir para esta aba agora"}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#064E3B] hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer w-full sm:w-auto"
              >
                <span>
                  {currentStepIndex === TUTORIAL_STEPS.length - 1
                    ? "Concluir Guia & Começar"
                    : "Próxima Etapa"}
                </span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
