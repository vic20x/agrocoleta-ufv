"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckSquare,
  Square,
  Sparkles,
  BarChart3,
  Database,
  Sliders,
  MessageSquarePlus,
  Smartphone,
  Share2,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Layers,
  ShieldCheck,
  Cpu,
  Zap,
  Code,
  FileCode,
  Users,
  Compass,
  Lightbulb,
  Check,
} from "lucide-react";

interface MissionItem {
  id: string;
  category: string;
  title: string;
  actionText: string;
  tabTarget: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES";
  howToTest: string;
}

const MISSIONS: MissionItem[] = [
  {
    id: "mission_kpi",
    category: "Visão Analítica",
    title: "Interagir com os KPIs e alternar modos de gráfico",
    actionText: "Ver Gráficos",
    tabTarget: "GRAFICOS",
    howToTest:
      "Clique nos cards de topo ('Área Trabalhada' ou 'Volume de Produção') para focar variáveis, ou alterne no seletor para 'Grade Multivariada' e 'Benchmarking'.",
  },
  {
    id: "mission_inspect",
    category: "Base de Registros",
    title: "Filtrar por 'Com Foto' e inspecionar lançamento no Drawer",
    actionText: "Ver Registros",
    tabTarget: "TABELA",
    howToTest:
      "Clique na pílula 'Com Arquivo / Foto', ordene por qualquer coluna e clique em 'Ver Detalhes' para abrir a gaveta lateral com timeline.",
  },
  {
    id: "mission_field",
    category: "Parametrização",
    title: "Adicionar uma nova variável e ver no Live Mobile Preview",
    actionText: "Abrir Construtor",
    tabTarget: "CONFIGURAR",
    howToTest:
      "Crie um campo do tipo 'Número Contínuo' ou 'Opções' e observe o mock do smartphone à direita renderizar instantaneamente.",
  },
  {
    id: "mission_reorder",
    category: "Parametrização",
    title: "Reordenar perguntas do protocolo com as setas subir/descer",
    actionText: "Ajustar Ordem",
    tabTarget: "CONFIGURAR",
    howToTest:
      "Nos cards de variáveis existentes, clique em ChevronUp ou ChevronDown para alterar a ordem lógica do caderno.",
  },
  {
    id: "mission_template",
    category: "Parametrização",
    title: "Aplicar o template oficial de Protocolo Cafeeiro UFV",
    actionText: "Testar Template",
    tabTarget: "CONFIGURAR",
    howToTest:
      "Na barra de templates rápidos, clique em 'Protocolo Cafeeiro Completo UFV' para carregar a matriz recomendada.",
  },
  {
    id: "mission_feedback",
    category: "Parecer Técnico",
    title: "Registrar parecer fitotécnico e simular envio para WhatsApp",
    actionText: "Emitir Parecer",
    tabTarget: "SUGESTOES",
    howToTest:
      "Escreva uma recomendação, selecione tags temáticas e clique em 'Compartilhar no WhatsApp' para conferir a formatação automática.",
  },
  {
    id: "mission_export",
    category: "Evidência Científica",
    title: "Exportar base de dados completa em planilha Excel (.xlsx)",
    actionText: "Exportar .xlsx",
    tabTarget: "GRAFICOS",
    howToTest:
      "Clique no botão 'Excel (.xlsx)' na barra superior ou lateral e confira o arquivo gerado com cabeçalhos e colunas dimensionadas.",
  },
];

interface ProfessorGuideTabProps {
  onNavigateTab: (tab: "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES") => void;
  onOpenTutorialModal: () => void;
}

export function ProfessorGuideTab({
  onNavigateTab,
  onOpenTutorialModal,
}: ProfessorGuideTabProps) {
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agro_professor_guide_missions");
      if (saved) {
        setCompletedMissions(JSON.parse(saved));
      }
    } catch {
      // Ignora erro no localStorage
    }
  }, []);

  const toggleMission = (id: string) => {
    const next = completedMissions.includes(id)
      ? completedMissions.filter((m) => m !== id)
      : [...completedMissions, id];
    setCompletedMissions(next);
    try {
      localStorage.setItem("agro_professor_guide_missions", JSON.stringify(next));
    } catch {
      // Ignora erro
    }
  };

  const resetMissions = () => {
    setCompletedMissions([]);
    try {
      localStorage.removeItem("agro_professor_guide_missions");
    } catch {
      // Ignora
    }
  };

  const progressCount = completedMissions.length;
  const progressPct = Math.round((progressCount / MISSIONS.length) * 100);

  const faqs = [
    {
      q: "Como o sistema garante a integridade de dados para uso em teses e publicações?",
      a: "Todos os lançamentos gravados mantêm identificador imutável de lote, carimbo de data/hora (ISO), autoria do produtor e geolocalização do município. A exportação em Excel (.xlsx) e CSV preserva tipagem numérica exata (sem corrupção de separadores decimais) para importação direta em R, Python (Pandas) ou SPSS.",
    },
    {
      q: "O que acontece quando o orientador cria ou remove um campo no Construtor?",
      a: "A alteração reflete imediatamente no formulário do produtor e no emulador mobile. Os lançamentos históricos anteriores que não continham a nova variável permanecem íntegros na base; na inspeção detalhada e na planilha, campos não preenchidos são identificados como nulos ou traço ('-') sem quebrar a consistência.",
    },
    {
      q: "Como funciona a extração de métricas por Inteligência Artificial no diário do cafeicultor?",
      a: "Ao digitar notas textuais livres ou enviar comprovantes, o motor de análise identifica termos-chave fitotécnicos (ex: 'sacas', 'NPK', 'adubação', 'broca', 'talhão') e sintetiza chips de métricas estruturadas que aparecem com destaque na tabela e no drawer de auditoria.",
    },
    {
      q: "Qual a arquitetura técnica utilizada e por que ela não requer servidor de banco pesado para a avaliação?",
      a: "A aplicação foi construída com Next.js (App Router, Turbopack) e Tailwind CSS, contando com uma camada reativa 'Local Data-Store' com sincronização por CustomEvents do navegador. Isso garante testes ultra-rápidos, sem latência de rede, com persistência e isolamento completo por sessão de teste.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* BANNER PRINCIPAL DE BOAS-VINDAS & ROTEIRO DOCENTE */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono">
              <GraduationCap className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
              <span>Painel de Avaliação Acadêmica • Disciplina de Agricultura Digital UFV</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Guia Metodológico & Roteiro de Degustação da Plataforma
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bem-vindo, professor orientador. Este ambiente foi estruturado para demonstrar a
              viabilidade prática de conectar a coleta simplificada de dados no campo (Agricultura
              Familiar da Zona da Mata) a uma central analítica docente de alto rigor fitotécnico e
              científico.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onOpenTutorialModal}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" strokeWidth={1.75} />
              <span>Iniciar Tour Guiado em 7 Passos</span>
            </button>

            <button
              onClick={() => onNavigateTab("GRAFICOS")}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Explorar Visão Analítica</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* CHECKLIST INTERATIVO: 7 MISSÕES PRÁTICAS PARA O ORIENTADOR */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-800" strokeWidth={1.75} />
              <h3 className="text-base font-semibold text-slate-900">
                Roteiro de Degustação da Plataforma (Checklist de Avaliação)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Marque as missões à medida que testar as ferramentas. Seu progresso fica salvo no
              navegador.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">
                Progresso
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
                {progressCount} de {MISSIONS.length} ({progressPct}%)
              </span>
            </div>

            {progressCount > 0 && (
              <button
                onClick={resetMissions}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reiniciar checklist"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso visual */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Lista de Missões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {MISSIONS.map((m) => {
            const isDone = completedMissions.includes(m.id);

            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-300"
                    : "bg-[#F8FAFC] border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => toggleMission(m.id)}
                      className="flex items-start gap-2.5 text-left group cursor-pointer"
                    >
                      <div className="mt-0.5 shrink-0 text-emerald-800">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          {m.category}
                        </span>
                        <h4
                          className={`text-xs font-semibold ${
                            isDone ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                          }`}
                        >
                          {m.title}
                        </h4>
                      </div>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                    {m.howToTest}
                  </p>
                </div>

                <div className="pl-7 pt-1 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateTab(m.tabTarget)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                  >
                    <span>{m.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>

                  {isDone && (
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">
                      ✓ Realizado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPARATIVO DE JORNADAS: DOCENTE (WORKSTATION) VS. PRODUTOR RURAL (CADERNO) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" strokeWidth={1.75} />
            <h3 className="text-base font-semibold text-slate-900">
              Arquitetura de Jornadas: Docente Pesquisador vs. Produtor Familiar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Como os dois ambientes se complementam para viabilizar extensão universitária com rigor
            de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Docente */}
          <div className="p-5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Workstation do Orientador</h4>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Acesso: testeprofessor
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Modo Gestão / Pesquisa
              </span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Parametrização Dinâmica:</strong> Criação, edição e reordenação de
                  variáveis de coleta sem escrever uma linha de código.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Benchmarking Regional:</strong> Visualização de médias, desvios e
                  ranqueamento de produtividade (sacas/ha) entre propriedades.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Auditoria e Slide-over:</strong> Inspeção de fotos anexadas, notas
                  originais e métricas interpretadas por IA.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Retorno ao Agricultor:</strong> Geração de pareceres técnicos e disparo
                  formatado direto para WhatsApp.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Intercâmbio Científico:</strong> Exportação instantânea em planilhas Excel
                  (.xlsx) e CSV pré-formatadas.
                </span>
              </li>
            </ul>
          </div>

          {/* Card Produtor */}
          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Caderno Digital do Produtor</h4>
                  <span className="text-[10px] font-mono text-emerald-700 font-medium">
                    Acesso: testeprodutor
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100/70 text-emerald-900 border border-emerald-300">
                Modo Campo / Simplificado
              </span>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Interface Touch Direta:</strong> Sem menus complexos ou gráficos densos,
                  focada apenas no formulário de manejo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Diário Assistido:</strong> Campo aberto de observações onde o produtor
                  digita livremente como foi o dia na roça.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Comprovantes Visuais:</strong> Envio de fotos de notas de corretivos,
                  laudos de solo ou registros de talhão.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Linha do Tempo Pessoal:</strong> Visualização cronológica dos envios
                  anteriores de sua propriedade.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Recebimento de Orientações:</strong> Leitura das recomendações da UFV
                  enviadas pelos canais cotidianos (WhatsApp).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* DESTAQUES DE ENGENHARIA & TECNOLOGIAS UTILIZADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <Cpu className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
            <span>Next.js Turbopack & React 19</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Renderização instantânea e reatividade em milissegundos sem reloads lentos de página.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <Zap className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
            <span>Gráficos Vetoriais Nativos SVG</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Gráficos responsivos leves sem Canvas pesado, com tooltips calculados diretamente na DOM.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
            <span>Exportação Real (.xlsx & CSV)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Geração de arquivos binários Excel compatíveis com Microsoft Office, LibreOffice e Google
            Sheets.
          </p>
        </div>
      </div>

      {/* FAQ METODOLÓGICO PARA AVALIAÇÃO DE ESTÁGIO */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-800" strokeWidth={1.75} />
          <h3 className="text-base font-semibold text-slate-900">
            Perguntas Frequentes & Aspectos Metodológicos
          </h3>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-900 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-mono text-sm">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-200 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
