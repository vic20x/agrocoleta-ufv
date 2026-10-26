"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  setCurrentUser,
  login,
  registerProducer,
  getFields,
  addField,
  deleteField,
  saveFields,
  reorderFields,
  getSubmissions,
  addSubmission,
  getUsers,
  getProfessorFeedbacks,
  saveProfessorFeedback,
  resetToDefaults,
} from "@/lib/data-store";
import {
  AuthUser,
  CollectionField,
  FarmSubmission,
  ProfessorFeedback,
  FieldType,
  AnalyticalChartType,
} from "@/types/producer";
import { exportAnalysisToExcel, exportAnalysisToCSV } from "@/lib/export-utils";
import { PRESET_TEMPLATES } from "@/lib/mock-data";
import { AnalyticalCharts, AnalyticalViewMode } from "@/components/AnalyticalCharts";
import {
  Sprout,
  Mail,
  Lock,
  User,
  MapPin,
  Phone,
  Building2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  BarChart3,
  Database,
  Sliders,
  MessageSquarePlus,
  LogOut,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Copy,
  Sparkles,
  Paperclip,
  UploadCloud,
  Calendar,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  SlidersHorizontal,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Filter,
  Search,
  DollarSign,
  Landmark,
  Tag,
  Camera,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PieChart,
} from "lucide-react";

export default function MainPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fields, setFields] = useState<CollectionField[]>([]);
  const [submissions, setSubmissions] = useState<FarmSubmission[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);

  // Estados de Login / Cadastro
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLogin, setRegLogin] = useState("");
  const [regProperty, setRegProperty] = useState("");
  const [regCity, setRegCity] = useState("Viçosa - MG");
  const [regPhone, setRegPhone] = useState("");

  // Estados do Produtor
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [rawNotes, setRawNotes] = useState("");
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: "PHOTO" | "FILE";
  } | null>(null);
  const [producerSuccessMsg, setProducerSuccessMsg] = useState("");
  const [producerErrorMsg, setProducerErrorMsg] = useState("");

  // Estados do Professor
  const [activeProfTab, setActiveProfTab] = useState<
    "GRAFICOS" | "TABELA" | "CONFIGURAR" | "SUGESTOES"
  >("GRAFICOS");
  const [selectedProducerFilter, setSelectedProducerFilter] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubDetail, setSelectedSubDetail] = useState<FarmSubmission | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [activeAnalyticalField, setActiveAnalyticalField] = useState<string>("area_ha");
  const [analyticalViewMode, setAnalyticalViewMode] = useState<AnalyticalViewMode>("DEEP_DIVE");

  // Estados da Tabela de Registros (Ordenação e Filtros Rápidos)
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [quickFilter, setQuickFilter] = useState<"ALL" | "WITH_ATTACHMENT" | "WITH_AI" | "YEAR_2026">("ALL");

  // Estados do Construtor de Campos
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("number");
  const [newFieldChartType, setNewFieldChartType] = useState<AnalyticalChartType>("bar");
  const [newFieldUnit, setNewFieldUnit] = useState("");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [pendingTemplateName, setPendingTemplateName] = useState<string | null>(null);
  const [pendingDeleteFieldId, setPendingDeleteFieldId] = useState<string | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  // Estados de Parecer / Feedback do Orientador
  const [feedbacks, setFeedbacks] = useState<ProfessorFeedback[]>([]);
  const [newFeedbackComment, setNewFeedbackComment] = useState("");
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>([]);
  const [feedbackSentMsg, setFeedbackSentMsg] = useState("");
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const refreshAll = () => {
    setUser(getCurrentUser());
    setFields(getFields());
    setSubmissions(getSubmissions());
    setUsers(getUsers());
    setFeedbacks(getProfessorFeedbacks());
  };

  useEffect(() => {
    refreshAll();
    const handleAuth = () => refreshAll();
    const handleData = () => refreshAll();
    window.addEventListener("agro_auth_change", handleAuth);
    window.addEventListener("agro_data_change", handleData);
    window.addEventListener("agro_fields_change", handleData);
    window.addEventListener("agro_feedback_change", handleData);
    return () => {
      window.removeEventListener("agro_auth_change", handleAuth);
      window.removeEventListener("agro_data_change", handleData);
      window.removeEventListener("agro_fields_change", handleData);
      window.removeEventListener("agro_feedback_change", handleData);
    };
  }, []);

  // --- HANDLERS DE AUTENTICAÇÃO ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginInput.trim()) {
      setLoginError("Informe o usuário ou e-mail institucional para prosseguir.");
      return;
    }

    const res = login(loginInput, passwordInput);
    if (!res.success) {
      setLoginError(res.message || "Credenciais não localizadas.");
    } else {
      setLoginInput("");
      setPasswordInput("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!regName.trim() || !regProperty.trim() || !regLogin.trim()) {
      setLoginError("Preencha o nome completo, identificador de acesso e nome da propriedade.");
      return;
    }

    registerProducer({
      login: regLogin,
      name: regName,
      propertyName: regProperty,
      cityState: regCity,
      phone: regPhone,
    });
    setIsRegistering(false);
  };

  const quickLoginAs = (id: string, pass: string) => {
    setLoginError("");
    setLoginInput(id);
    setPasswordInput(pass);
    login(id, pass);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedSubDetail(null);
  };

  // --- HANDLERS DO PRODUTOR ---
  const handleProducerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProducerErrorMsg("");

    // Validação estrita de campos obrigatórios configurados
    for (const f of fields) {
      if (f.required) {
        const val = formValues[f.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          setProducerErrorMsg(`Por favor, preencha o campo obrigatório: "${f.label}".`);
          return;
        }
      }
    }

    addSubmission({
      producerId: user.id,
      producerName: user.name,
      propertyName: user.propertyName || "Propriedade Rural",
      cityState: user.cityState || "Viçosa - MG",
      values: formValues,
      rawNotes: rawNotes.trim(),
      attachment: attachedFile || undefined,
    });

    setFormValues({});
    setRawNotes("");
    setAttachedFile(null);
    setProducerErrorMsg("");
    setProducerSuccessMsg("Lançamento sincronizado com a base de pesquisa agronômica.");
    setTimeout(() => setProducerSuccessMsg(""), 4500);
    refreshAll();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      const sizeKb = (file.size / 1024).toFixed(0);
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${sizeKb} KB`;
      setAttachedFile({
        name: file.name,
        size: formattedSize,
        type: isImg ? "PHOTO" : "FILE",
      });
    }
  };

  // --- HANDLERS DO PROFESSOR (CONSTRUTOR DE CAMPOS) ---
  const handleSelectFieldType = (type: FieldType) => {
    setNewFieldType(type);
    if (type === "currency") {
      setNewFieldUnit("R$");
      setNewFieldChartType("bar");
    } else if (type === "area") {
      setNewFieldUnit("ha");
      setNewFieldChartType("bar");
    } else if (type === "number") {
      if (newFieldUnit === "R$" || newFieldUnit === "ha") {
        setNewFieldUnit("");
      }
      setNewFieldChartType("bar");
    } else if (type === "select") {
      setNewFieldUnit("");
      setNewFieldChartType("distribution");
    } else {
      setNewFieldUnit("");
      setNewFieldChartType("none");
    }
  };

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const optionsList = newFieldOptions
      ? newFieldOptions
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined;

    addField({
      label: newFieldLabel.trim(),
      type: newFieldType,
      unit: newFieldUnit.trim() || undefined,
      options: optionsList,
      required: newFieldRequired,
      chartType: newFieldChartType,
    });

    setNewFieldLabel("");
    setNewFieldUnit("");
    setNewFieldOptions("");
    setNewFieldRequired(false);
    setNewFieldType("number");
    setNewFieldChartType("bar");
    showToast("Novo parâmetro adicionado ao protocolo de coleta.");
    refreshAll();
  };

  const handleMoveFieldUp = (index: number) => {
    if (index <= 0) return;
    reorderFields(index, index - 1);
    refreshAll();
  };

  const handleMoveFieldDown = (index: number) => {
    if (index >= fields.length - 1) return;
    reorderFields(index, index + 1);
    refreshAll();
  };

  const handleConfirmTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
    saveFields(tpl.fields);
    setPendingTemplateName(null);
    showToast(`Protocolo "${tpl.name}" aplicado com sucesso.`);
    refreshAll();
  };

  const handleConfirmDeleteField = (id: string, label: string) => {
    deleteField(id);
    setPendingDeleteFieldId(null);
    showToast(`Campo "${label}" removido do formulário.`);
    refreshAll();
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setConfirmingReset(false);
    setSelectedProducerFilter("TODOS");
    showToast("Base de demonstração restaurada aos padrões originais.");
    refreshAll();
  };

  // --- HANDLERS DO PROFESSOR (PARECER DO ORIENTADOR) ---
  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackComment.trim() && selectedSuggestedTags.length === 0) return;

    saveProfessorFeedback({
      author: user?.name || "Prof. Orientador",
      comment: newFeedbackComment.trim(),
      suggestedChanges: selectedSuggestedTags,
    });

    setNewFeedbackComment("");
    setSelectedSuggestedTags([]);
    setFeedbackSentMsg("Parecer técnico arquivado no histórico do projeto.");
    setTimeout(() => setFeedbackSentMsg(""), 4000);
    refreshAll();
  };

  const toggleSuggestedTag = (tag: string) => {
    if (selectedSuggestedTags.includes(tag)) {
      setSelectedSuggestedTags(selectedSuggestedTags.filter((t) => t !== tag));
    } else {
      setSelectedSuggestedTags([...selectedSuggestedTags, tag]);
    }
  };

  const handleCopyWhatsAppFeedback = () => {
    const text = `Parecer Técnico — Projeto de Coleta & Gestão Rural:\n\n${
      selectedSuggestedTags.length > 0
        ? "Prioridades elencadas:\n- " + selectedSuggestedTags.join("\n- ") + "\n\n"
        : ""
    }${newFeedbackComment ? "Observações do Orientador:\n" + newFeedbackComment : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const producerUsers = users.filter((u) => u.role === "PRODUCER");

  // ============================================================================
  // 1º AMBIENTE — TELA DE LOGIN / CADASTRO SPLIT-SCREEN (user === null)
  // ============================================================================
  if (!user) {
    const totalArea = submissions.reduce((acc, s) => acc + (Number(s.values.area_ha) || 0), 0);

    return (
      <div className="min-h-screen grid lg:grid-cols-12 bg-[#F8FAFC]">
        {/* Coluna Esquerda: Identidade Visual Técnica AgTech (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#052e22] text-white flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-950">
          {/* Padrão Geométrico Topográfico / Grade Técnica em SVG de Fundo */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="agtech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#A7F3D0"
                  strokeWidth="0.75"
                />
                <circle cx="40" cy="40" r="1.2" fill="#A7F3D0" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#agtech-grid)" />
          </svg>

          {/* Brilho Radial Sutil */}
          <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Topo: Identidade Institucional */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-800/90 border border-emerald-600/40 flex items-center justify-center shadow-inner">
                <Sprout className="w-5 h-5 text-emerald-200" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-white block leading-none">
                  AGROCOLETA
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300/80 block mt-1">
                   Agricultura Digital • UFV
                </span>
              </div>
            </div>
          </div>

          {/* Centro: Apresentação Sóbria da Rede de Monitoramento */}
          <div className="relative z-10 my-12 lg:my-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-900/70 border border-emerald-700/50 text-emerald-200 text-[11px] font-mono mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Rede de Monitoramento Agronômico • Região de Viçosa / MG</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
              Infraestrutura de coleta estruturada e inteligência de campo.
            </h1>

            <p className="text-sm text-emerald-100/75 mt-4 leading-relaxed max-w-md">
              Ambiente integrado para registro de safra, acompanhamento fitotécnico de propriedades
              rurais, parametrização dinâmica de variáveis e exportação analítica para pesquisa.
            </p>

            <div className="mt-8 space-y-3 border-t border-emerald-800/60 pt-6 text-xs text-emerald-100/80">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <span>Gráficos comparativos vetoriais e estatísticas regionais em tempo real</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <span>Protocolos de coleta parametrizáveis pelo professor orientador</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <span>Extração automatizada de indicadores a partir do diário de campo</span>
              </div>
            </div>
          </div>

          {/* Base: Estatísticas Discretas com tabular-nums */}
          <div className="relative z-10 pt-6 border-t border-emerald-900/80 grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/70 block">
                Propriedades
              </span>
              <span className="text-lg font-semibold font-mono text-white tabular-nums mt-0.5 block">
                {producerUsers.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/70 block">
                Área Monitorada
              </span>
              <span className="text-lg font-semibold font-mono text-white tabular-nums mt-0.5 block">
                {totalArea.toFixed(1)} <span className="text-xs font-normal text-emerald-300">ha</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/70 block">
                Lançamentos
              </span>
              <span className="text-lg font-semibold font-mono text-white tabular-nums mt-0.5 block">
                {submissions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Autenticação Limpa (sem caixas de atalho nem seletores) (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Cabeçalho do Card */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                {isRegistering ? "Cadastrar Propriedade" : "Acesso ao Sistema"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegistering
                  ? "Informe os dados da propriedade rural para ingressar na rede."
                  : "Entre com seu usuário ou e-mail cadastrado."}
              </p>
            </div>

            {/* Card Principal de Formulário */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 shadow-2xs">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{loginError}</span>
                </div>
              )}

              {!isRegistering ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Usuário ou E-mail
                    </label>
                    <div className="relative">
                      <User
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        placeholder="Ex: professor@ufv.br ou seu usuário"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        Senha de Segurança
                      </label>
                    </div>
                    <div className="relative">
                      <Lock
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome Completo do Produtor *
                    </label>
                    <div className="relative">
                      <User
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        placeholder="Ex: João Ferreira da Silva"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Identificador de Login (sem espaços) *
                    </label>
                    <div className="relative">
                      <KeyRound
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        placeholder="Ex: joao"
                        value={regLogin}
                        onChange={(e) => setRegLogin(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Denominação da Propriedade Rural *
                    </label>
                    <div className="relative">
                      <Building2
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={1.75}
                      />
                      <input
                        type="text"
                        placeholder="Ex: Fazenda Boa Esperança"
                        value={regProperty}
                        onChange={(e) => setRegProperty(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Município / UF
                      </label>
                      <div className="relative">
                        <MapPin
                          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          strokeWidth={1.75}
                        />
                        <input
                          type="text"
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone
                          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          strokeWidth={1.75}
                        />
                        <input
                          type="text"
                          placeholder="(31) 99999-9999"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 mt-2 bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Registrar Propriedade & Acessar</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </form>
              )}

              {/* Alternância discreta entre Login e Cadastro */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setLoginError("");
                  }}
                  className="text-xs text-slate-600 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
                >
                  {isRegistering
                    ? "Já possui cadastro? Acessar conta existente"
                    : "Produtor novo? Cadastrar propriedade rural"}
                </button>
              </div>
            </div>

            {/* Dica discreta de demonstração em uma linha única e sutil */}
            <div className="text-center text-[11px] text-slate-400">
              Acessos de teste: <span className="font-mono text-slate-600 font-medium">testeprofessor</span> ou <span className="font-mono text-slate-600 font-medium">testeprodutor</span> (senha: <span className="font-mono text-slate-600 font-medium">1234</span>)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3º AMBIENTE — CADERNO DIGITAL DO PRODUTOR RURAL (user.role === 'PRODUCER')
  // ============================================================================
  if (user.role === "PRODUCER") {
    const producerSubs = submissions.filter((s) => s.producerId === user.id);

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        {/* Topbar Limpa e Profissional do Produtor */}
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#064E3B] text-white flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-slate-900 truncate">
                    {user.propertyName || "Propriedade Rural"}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <MapPin className="w-3 h-3" strokeWidth={1.75} />
                    {user.cityState || "Viçosa - MG"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Responsável: <span className="font-medium text-slate-700">{user.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono tabular-nums">
                <Database className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>{producerSubs.length} registros</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal em 2 Colunas no Desktop */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {producerSuccessMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={1.75} />
                <span className="font-medium">{producerSuccessMsg}</span>
              </div>
              <button
                onClick={() => setProducerSuccessMsg("")}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}

          {producerErrorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" strokeWidth={1.75} />
                <span className="font-medium">{producerErrorMsg}</span>
              </div>
              <button
                onClick={() => setProducerErrorMsg("")}
                className="text-red-700 hover:text-red-950 p-1"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Coluna Principal (lg:col-span-7): Novo Lançamento da Propriedade */}
            <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="pb-4 mb-5 border-b border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold block">
                    Protocolo Ativo de Coleta
                  </span>
                  <h2 className="text-base font-semibold text-slate-900 mt-0.5">
                    Novo Lançamento da Propriedade
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os indicadores técnicos solicitados pela coordenação do projeto.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[10px] tabular-nums">
                  {fields.length} campos
                </span>
              </div>

              <form onSubmit={handleProducerSubmit} className="space-y-5">
                {/* Campos Dinâmicos Configurados pelo Professor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      className={f.type === "text" && !f.unit ? "sm:col-span-2" : ""}
                    >
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        {f.label}
                        {f.required && <span className="text-red-600 ml-1">*</span>}
                      </label>

                      {f.type === "select" ? (
                        <select
                          required={f.required}
                          value={formValues[f.id] || ""}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [f.id]: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg bg-white text-slate-900 focus:outline-hidden focus:border-emerald-800 transition-colors"
                        >
                          <option value="">Selecionar opção...</option>
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "photo" ? (
                        <div className="p-3 bg-[#F8FAFC] border border-dashed border-slate-300 rounded-lg">
                          {formValues[f.id] ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-medium text-emerald-800 truncate">
                                📷 {formValues[f.id]}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...formValues };
                                  delete updated[f.id];
                                  setFormValues(updated);
                                }}
                                className="text-[11px] text-red-600 hover:underline ml-2"
                              >
                                Remover
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 py-2 cursor-pointer text-slate-600 hover:text-emerald-800 transition-colors">
                              <Camera className="w-4 h-4" strokeWidth={1.75} />
                              <span className="text-xs font-medium">Tirar foto ou anexar imagem</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormValues({ ...formValues, [f.id]: file.name });
                                    if (!attachedFile) {
                                      const isImg = file.type.startsWith("image/");
                                      const sizeKb = (file.size / 1024).toFixed(0);
                                      const formattedSize =
                                        file.size > 1024 * 1024
                                          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                          : `${sizeKb} KB`;
                                      setAttachedFile({
                                        name: file.name,
                                        size: formattedSize,
                                        type: isImg ? "PHOTO" : "FILE",
                                      });
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      ) : (
                        <div className="relative flex items-center">
                          {f.type === "currency" && (
                            <span className="absolute left-3 text-xs font-mono font-semibold text-emerald-800 select-none">
                              R$
                            </span>
                          )}
                          <input
                            type={
                              f.type === "number" || f.type === "currency" || f.type === "area"
                                ? "number"
                                : f.type === "date"
                                ? "date"
                                : "text"
                            }
                            required={f.required}
                            step={
                              f.type === "number" || f.type === "currency" || f.type === "area"
                                ? "any"
                                : undefined
                            }
                            placeholder={
                              f.type === "currency"
                                ? "0,00"
                                : f.type === "area"
                                ? "0.00"
                                : f.type === "number"
                                ? "0.00"
                                : f.unit
                                ? `Informe em ${f.unit}`
                                : "Digite o valor..."
                            }
                            value={formValues[f.id] !== undefined ? formValues[f.id] : ""}
                            onChange={(e) =>
                              setFormValues({ ...formValues, [f.id]: e.target.value })
                            }
                            className={`w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 transition-colors ${
                              f.type === "number" || f.type === "currency" || f.type === "area"
                                ? "font-mono tabular-nums"
                                : ""
                            } ${f.type === "currency" ? "pl-9" : ""} ${
                              (f.unit && f.type !== "currency") || f.type === "area" ? "pr-16" : ""
                            }`}
                          />
                          {((f.unit && f.type !== "currency") || f.type === "area") && (
                            <span className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-600 rounded border border-slate-200 pointer-events-none">
                              {f.type === "area" ? (f.unit || "ha") : f.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Diário / Anotações da Fazenda */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                      <span>Diário de Manejo & Observações de Campo</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                      Extração Automática IA
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Descreva ocorrências, chuvas (mm), dosagens de insumos, custos operacionais (R$) ou colheita em sacas..."
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-800 transition-colors"
                  />
                </div>

                {/* Dropzone Elegante para Fotos ou Planilhas */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Documentação Comprobatória (Foto da Lavoura, Laudo ou Planilha)
                  </label>
                  <div className="p-4 bg-[#F8FAFC] border border-dashed border-slate-300 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <UploadCloud className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div className="text-left">
                        {attachedFile ? (
                          <div>
                            <span className="text-xs font-semibold text-emerald-900 font-mono block">
                              {attachedFile.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                              Tamanho: {attachedFile.size} • Pronto para envio
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-medium text-slate-700 block">
                              Anexar imagem de campo, PDF de análise de solo ou planilha
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Formatos aceitos: JPG, PNG, PDF, XLSX, CSV
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        id="prod-file"
                        onChange={handleFileUpload}
                        accept="image/*,.xlsx,.xls,.csv,.pdf"
                        className="hidden"
                      />
                      <label
                        htmlFor="prod-file"
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 py-1.5 px-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                        <span>{attachedFile ? "Substituir" : "Selecionar Arquivo"}</span>
                      </label>
                      {attachedFile && (
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                          title="Remover anexo"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Check className="w-4 h-4" strokeWidth={1.75} />
                  <span>Registrar Lançamento no Caderno da Propriedade</span>
                </button>
              </form>
            </div>

            {/* Coluna Lateral (lg:col-span-5): Linha do Tempo Vertical (Timeline) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Linha do Tempo da Propriedade
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {producerSubs.length} envio(s)
                </span>
              </div>

              {producerSubs.length === 0 ? (
                <div className="p-8 bg-white border border-[#E2E8F0] rounded-xl text-center space-y-2">
                  <Calendar className="w-6 h-6 text-slate-300 mx-auto" strokeWidth={1.75} />
                  <p className="text-xs font-medium text-slate-600">
                    Nenhum registro histórico encontrado
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Os lançamentos enviados no formulário ao lado aparecerão cronologicamente aqui.
                  </p>
                </div>
              ) : (
                <div className="relative pl-5 border-l-2 border-slate-200 space-y-4">
                  {producerSubs.map((sub) => (
                    <div key={sub.id} className="relative group">
                      {/* Marcador da Timeline */}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 ring-4 ring-[#F8FAFC] absolute -left-[21px] top-4" />

                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">
                              {String(
                                sub.values.talhao ||
                                  sub.values.cultura ||
                                  "Registro Técnico de Manejo"
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {sub.propertyName}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 tabular-nums bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                            <Calendar className="w-3 h-3 text-slate-400" strokeWidth={1.75} />
                            {sub.createdAt}
                          </span>
                        </div>

                        {/* Valores em Grid Compacto */}
                        <div className="grid grid-cols-2 gap-2">
                          {fields.map((f) => {
                            const v = sub.values[f.id];
                            if (v === undefined || v === "") return null;
                            return (
                              <div
                                key={f.id}
                                className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/60"
                              >
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {f.label}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 font-mono tabular-nums mt-0.5 block">
                                  {v} {f.unit || ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {sub.rawNotes && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                            {sub.rawNotes}
                          </div>
                        )}

                        {sub.attachment && (
                          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-600">
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" strokeWidth={1.75} />
                              <span className="truncate">{sub.attachment.name}</span>
                            </span>
                            <span className="text-slate-400 tabular-nums shrink-0 ml-2">
                              {sub.attachment.size}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // 2º AMBIENTE — WORKSTATION ANALÍTICA DO PROFESSOR (user.role === 'PROFESSOR')
  // ============================================================================
  const filteredAndSortedSubs = submissions
    .filter((s) => {
      const matchesProducer =
        selectedProducerFilter === "TODOS" || s.producerId === selectedProducerFilter;
      if (!matchesProducer) return false;

      // Filtros Rápidos (Pílulas)
      if (quickFilter === "WITH_ATTACHMENT") {
        const hasAttachment = Boolean(s.attachment);
        const hasPhotoValue = fields.some(
          (f) => f.type === "photo" && Boolean(s.values[f.id])
        );
        if (!hasAttachment && !hasPhotoValue) return false;
      }
      if (quickFilter === "WITH_AI" && (!s.extractedMetrics || s.extractedMetrics.length === 0)) return false;
      if (quickFilter === "YEAR_2026" && !s.createdAt.startsWith("2026")) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const inBasic =
        s.producerName.toLowerCase().includes(q) ||
        s.propertyName.toLowerCase().includes(q) ||
        s.cityState.toLowerCase().includes(q) ||
        (s.rawNotes && s.rawNotes.toLowerCase().includes(q));
      const inValues = Object.values(s.values).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q)
      );
      return inBasic || inValues;
    })
    .sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortKey === "createdAt") {
        valA = a.createdAt;
        valB = b.createdAt;
      } else if (sortKey === "propertyName") {
        valA = a.propertyName;
        valB = b.propertyName;
      } else if (sortKey === "producerName") {
        valA = a.producerName;
        valB = b.producerName;
      } else {
        valA = a.values[sortKey] ?? "";
        valB = b.values[sortKey] ?? "";
      }

      const parseNum = (v: any) => {
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "") {
          const parsed = Number(v.replace(",", "."));
          return isNaN(parsed) ? NaN : parsed;
        }
        return NaN;
      };

      const numA = parseNum(valA);
      const numB = parseNum(valB);

      let cmp = 0;
      if (!isNaN(numA) && !isNaN(numB)) {
        cmp = numA - numB;
      } else {
        cmp = String(valA).localeCompare(String(valB), "pt-BR", { numeric: true });
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

  const filteredSubs = filteredAndSortedSubs;

  const totalAreaHa = filteredSubs.reduce((acc, s) => acc + (Number(s.values.area_ha) || 0), 0);
  const totalProducaoSacas = filteredSubs.reduce(
    (acc, s) => acc + (Number(s.values.producao) || Number(s.values.sacas_colhidas) || 0),
    0
  );
  const totalCustos = filteredSubs.reduce(
    (acc, s) => acc + (Number(s.values.custo_operacao) || 0),
    0
  );

  const tabMeta = {
    GRAFICOS: {
      title: "Visão Analítica & Gráficos Comparativos",
      description:
        "Estatísticas consolidadas, desvios de produtividade regional e distribuição de manejo em SVG.",
    },
    TABELA: {
      title: "Produtores Monitorados & Base de Registros",
      description:
        "Inspeção individualizada por propriedade rural, extração de métricas por IA e auditoria de lançamentos.",
    },
    CONFIGURAR: {
      title: "Construtor de Coleta & Parametrização",
      description:
        "Configure dinamicamente as variáveis exigidas dos produtores com visualização mobile em tempo real.",
    },
    SUGESTOES: {
      title: "Parecer Técnico do Orientador",
      description:
        "Diretrizes metodológicas, prioridades de evolução do sistema e exportação rápida para WhatsApp.",
    },
  }[activeProfTab];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* SIDEBAR LATERAL FIXA À ESQUERDA (w-64 bg-slate-950 text-slate-300) */}
      <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 lg:sticky lg:top-0 lg:h-screen">
        <div>
          {/* Marca Técnica no Topo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/90 border border-emerald-600/40 flex items-center justify-center text-emerald-200">
                <Sprout className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-white block leading-none">
                  AGROCOLETA
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  WORKSTATION v3.2
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded">
              UFV
            </span>
          </div>

          {/* Menu Vertical de Navegação */}
          <div className="p-3">
            <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Módulos de Pesquisa
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveProfTab("GRAFICOS")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeProfTab === "GRAFICOS"
                    ? "bg-emerald-950/90 text-white border border-emerald-800/70"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3
                    className={`w-4 h-4 ${
                      activeProfTab === "GRAFICOS" ? "text-emerald-400" : "text-slate-400"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>Visão Analítica & Gráficos</span>
                </span>
              </button>

              <button
                onClick={() => setActiveProfTab("TABELA")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeProfTab === "TABELA"
                    ? "bg-emerald-950/90 text-white border border-emerald-800/70"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Database
                    className={`w-4 h-4 ${
                      activeProfTab === "TABELA" ? "text-emerald-400" : "text-slate-400"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>Produtores & Registros</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 tabular-nums">
                  {submissions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveProfTab("CONFIGURAR")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeProfTab === "CONFIGURAR"
                    ? "bg-emerald-950/90 text-white border border-emerald-800/70"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Sliders
                    className={`w-4 h-4 ${
                      activeProfTab === "CONFIGURAR" ? "text-emerald-400" : "text-slate-400"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>Construtor de Coleta</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 tabular-nums">
                  {fields.length}
                </span>
              </button>

              <button
                onClick={() => setActiveProfTab("SUGESTOES")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeProfTab === "SUGESTOES"
                    ? "bg-emerald-950/90 text-white border border-emerald-800/70"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquarePlus
                    className={`w-4 h-4 ${
                      activeProfTab === "SUGESTOES" ? "text-emerald-400" : "text-slate-400"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>Parecer do Orientador</span>
                </span>
                {feedbacks.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 tabular-nums">
                    {feedbacks.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Base da Sidebar: Docente Logado + Exportar .xlsx + Encerrar Sessão */}
        <div className="p-3 border-t border-slate-800/80 space-y-2.5">
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
              Docente Responsável
            </span>
            <span className="text-xs font-semibold text-white block truncate mt-0.5">
              {user.name}
            </span>
            <span className="text-[11px] font-mono text-slate-400 block truncate">
              {user.login}
            </span>
          </div>

          <button
            onClick={() => exportAnalysisToExcel(filteredSubs, fields)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Exportar Planilha (.xlsx)</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (flex-1 bg-slate-50) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Topbar da Área Principal */}
        <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 sticky top-0 z-20">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                {tabMeta.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{tabMeta.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Busca Rápida & Seletor Global de Propriedade / Produtor */}
              {(activeProfTab === "GRAFICOS" || activeProfTab === "TABELA") && (
                <>
                  <div className="relative flex items-center">
                    <Search
                      className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none"
                      strokeWidth={1.75}
                    />
                    <input
                      type="text"
                      placeholder="Buscar fazenda, cultura, nota..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-7 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-800 w-48 sm:w-56 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 text-slate-400 hover:text-slate-700"
                        title="Limpar busca"
                      >
                        <X className="w-3 h-3" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                    <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                      Escopo:
                    </span>
                    <select
                      value={selectedProducerFilter}
                      onChange={(e) => setSelectedProducerFilter(e.target.value)}
                      className="text-xs font-medium text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                    >
                      <option value="TODOS">
                        Todas as Propriedades ({submissions.length} reg.)
                      </option>
                      {producerUsers.map((u) => {
                        const c = submissions.filter((s) => s.producerId === u.id).length;
                        return (
                          <option key={u.id} value={u.id}>
                            {u.propertyName} — {u.name.split(" ")[0]} ({c})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}

              {/* Botão de Restaurar Dados Padrão com Confirmação Inline Elegante */}
              {!confirmingReset ? (
                <button
                  onClick={() => setConfirmingReset(true)}
                  title="Restaurar base padrão de demonstração"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Restaurar Padrão</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <span className="text-amber-900 font-medium text-[11px]">
                    Confirmar restauração?
                  </span>
                  <button
                    onClick={handleConfirmReset}
                    className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmingReset(false)}
                    className="px-1.5 py-0.5 text-slate-600 hover:text-slate-900 text-[11px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Botões de Exportação CSV e Excel .xlsx */}
              <button
                onClick={() => exportAnalysisToCSV(filteredSubs, fields)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>CSV</span>
              </button>

              <button
                onClick={() => exportAnalysisToExcel(filteredSubs, fields)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast Inline */}
          {toastMsg && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={1.75} />
                <span className="font-medium">{toastMsg}</span>
              </div>
              <button onClick={() => setToastMsg("")} className="text-emerald-700">
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </header>

        {/* Corpo Principal da Workstation */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {/* =============================================================== */}
          {/* ABA 1: VISÃO ANALÍTICA & GRÁFICOS VETORIAIS EM SVG              */}
          {/* =============================================================== */}
          {activeProfTab === "GRAFICOS" && (
            <div className="space-y-6">
              {/* KPIs Superiores com tabular-nums e Ação Rápida de Foco */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setAnalyticalViewMode("BENCHMARK_PROPERTIES");
                    showToast("Exibindo matriz comparativa e benchmarking por propriedade.");
                  }}
                  title="Clique para alternar para a visão de benchmarking por propriedade"
                  className={`bg-white border rounded-xl p-4 shadow-2xs cursor-pointer transition-all hover:border-emerald-700/60 hover:shadow-xs group ${
                    analyticalViewMode === "BENCHMARK_PROPERTIES"
                      ? "border-emerald-800 ring-2 ring-emerald-800/20"
                      : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      Registros no Escopo
                    </span>
                    <Database className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {filteredSubs.length}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>em {producerUsers.length} propriedades</span>
                    <span className="text-[10px] text-emerald-800 font-medium group-hover:underline">
                      Ver por fazenda →
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveAnalyticalField("area_ha");
                    setAnalyticalViewMode("DEEP_DIVE");
                    showToast("Focando gráfico de Área Trabalhada (ha).");
                  }}
                  title="Clique para focar no gráfico analítico de Área Trabalhada"
                  className={`bg-white border rounded-xl p-4 shadow-2xs cursor-pointer transition-all hover:border-emerald-700/60 hover:shadow-xs group ${
                    analyticalViewMode === "DEEP_DIVE" && activeAnalyticalField === "area_ha"
                      ? "border-emerald-800 ring-2 ring-emerald-800/20"
                      : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      Área Total Trabalhada
                    </span>
                    <MapPin className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totalAreaHa.toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    <span className="text-xs font-normal text-slate-500">ha</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>soma dos talhões</span>
                    <span className="text-[10px] text-emerald-800 font-medium group-hover:underline">
                      Focar variável →
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    // Seleciona producao ou sacas_colhidas
                    const prodField = fields.find((f) => f.id === "producao" || f.id === "sacas_colhidas");
                    if (prodField) {
                      setActiveAnalyticalField(prodField.id);
                    }
                    setAnalyticalViewMode("DEEP_DIVE");
                    showToast("Focando gráfico de Volume de Produção.");
                  }}
                  title="Clique para focar no gráfico analítico de Produção"
                  className={`bg-white border rounded-xl p-4 shadow-2xs cursor-pointer transition-all hover:border-emerald-700/60 hover:shadow-xs group ${
                    analyticalViewMode === "DEEP_DIVE" && (activeAnalyticalField === "producao" || activeAnalyticalField === "sacas_colhidas")
                      ? "border-emerald-800 ring-2 ring-emerald-800/20"
                      : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      Volume de Produção
                    </span>
                    <Sprout className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totalProducaoSacas.toLocaleString("pt-BR")}{" "}
                    <span className="text-xs font-normal text-slate-500">sc / un</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>volume acumulado</span>
                    <span className="text-[10px] text-emerald-800 font-medium group-hover:underline">
                      Focar variável →
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const costField = fields.find((f) => f.id === "custo_operacao" || f.id.includes("custo"));
                    if (costField) {
                      setActiveAnalyticalField(costField.id);
                    }
                    setAnalyticalViewMode("DEEP_DIVE");
                    showToast("Focando gráfico de Custo Operacional.");
                  }}
                  title="Clique para focar no gráfico analítico de Custos"
                  className={`bg-white border rounded-xl p-4 shadow-2xs cursor-pointer transition-all hover:border-emerald-700/60 hover:shadow-xs group ${
                    analyticalViewMode === "DEEP_DIVE" && activeAnalyticalField === "custo_operacao"
                      ? "border-emerald-800 ring-2 ring-emerald-800/20"
                      : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      Custo Operacional
                    </span>
                    <BarChart3 className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    R$ {totalCustos.toLocaleString("pt-BR")}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>dispêndio reportado</span>
                    <span className="text-[10px] text-emerald-800 font-medium group-hover:underline">
                      Focar variável →
                    </span>
                  </div>
                </div>
              </div>

              {/* Componente Dedicado de Gráficos Vetoriais Reais em SVG */}
              <AnalyticalCharts
                fields={fields}
                submissions={filteredSubs}
                activeFieldId={activeAnalyticalField}
                onSelectField={(id) => setActiveAnalyticalField(id)}
                viewMode={analyticalViewMode}
                onViewModeChange={(mode) => setAnalyticalViewMode(mode)}
              />
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 2: PRODUTORES & REGISTROS (DATA GRID + SLIDE-OVER DRAWER)   */}
          {/* =============================================================== */}
          {activeProfTab === "TABELA" && (
            <div className="space-y-6">
              {/* Cards Selecionáveis de Propriedades Rurais Monitoradas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Propriedades Rurais Monitoradas ({producerUsers.length})
                  </span>
                  {(selectedProducerFilter !== "TODOS" || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedProducerFilter("TODOS");
                        setSearchQuery("");
                      }}
                      className="text-xs font-medium text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Limpar filtros ativos</span>
                      <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {producerUsers.map((u) => {
                    const count = submissions.filter((s) => s.producerId === u.id).length;
                    const isSelected = selectedProducerFilter === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() =>
                          setSelectedProducerFilter(isSelected ? "TODOS" : u.id)
                        }
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-800 bg-emerald-50/40 ring-2 ring-emerald-800/15 shadow-2xs"
                            : "border-[#E2E8F0] bg-white hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 leading-snug">
                              {u.propertyName}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                                isSelected ? "bg-emerald-700" : "bg-slate-300"
                              }`}
                            />
                          </div>
                          <span className="text-[11px] text-slate-600 block mt-1">
                            {u.name}
                          </span>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                            {u.cityState}
                          </span>
                          <span className="font-mono font-semibold text-emerald-800 tabular-nums shrink-0">
                            {count} envios
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pílulas de Filtros Rápidos (1 Clique) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                  <span>Filtros rápidos:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setQuickFilter("ALL")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    quickFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Todos os Registros
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter("WITH_ATTACHMENT")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    quickFilter === "WITH_ATTACHMENT"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-800 hover:text-emerald-900"
                  }`}
                >
                  <Paperclip className="w-3 h-3" strokeWidth={1.75} />
                  <span>Com Foto / Anexo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter("WITH_AI")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    quickFilter === "WITH_AI"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-800 hover:text-emerald-900"
                  }`}
                >
                  <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                  <span>Com Métricas IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter("YEAR_2026")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    quickFilter === "YEAR_2026"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-800 hover:text-emerald-900"
                  }`}
                >
                  <Calendar className="w-3 h-3" strokeWidth={1.75} />
                  <span>Safra 2026</span>
                </button>

                {(quickFilter !== "ALL" || selectedProducerFilter !== "TODOS" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickFilter("ALL");
                      setSelectedProducerFilter("TODOS");
                      setSearchQuery("");
                    }}
                    className="ml-auto text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Limpar todos os filtros</span>
                  </button>
                )}
              </div>

              {/* Data Grid Estilo Linear / Airtable com Cabeçalho Fixo (sticky top-0) */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-slate-800">
                      Matriz de Dados Agronômicos
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {filteredSubs.length} registro(s) listado(s) • Clique em qualquer cabeçalho para ordenar
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-[#F8FAFC] shadow-[0_1px_0_0_#E2E8F0]">
                      <tr className="text-[11px] font-mono uppercase text-slate-500 select-none">
                        <th
                          onClick={() => {
                            if (sortKey === "createdAt") {
                              setSortDir(sortDir === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("createdAt");
                              setSortDir("desc");
                            }
                          }}
                          className="py-2.5 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Data / Hora</span>
                            {sortKey === "createdAt" ? (
                              sortDir === "asc" ? (
                                <ArrowUp className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50" strokeWidth={1.5} />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => {
                            if (sortKey === "propertyName") {
                              setSortDir(sortDir === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("propertyName");
                              setSortDir("asc");
                            }
                          }}
                          className="py-2.5 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Propriedade & Produtor</span>
                            {sortKey === "propertyName" ? (
                              sortDir === "asc" ? (
                                <ArrowUp className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50" strokeWidth={1.5} />
                            )}
                          </div>
                        </th>
                        {fields.map((f) => (
                          <th
                            key={f.id}
                            onClick={() => {
                              if (sortKey === f.id) {
                                setSortDir(sortDir === "asc" ? "desc" : "asc");
                              } else {
                                setSortKey(f.id);
                                setSortDir(
                                  f.type === "number" || f.type === "currency" || f.type === "area"
                                    ? "desc"
                                    : "asc"
                                );
                              }
                            }}
                            className="py-2.5 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>
                                {f.label} {f.unit ? `(${f.unit})` : ""}
                              </span>
                              {sortKey === f.id ? (
                                sortDir === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-emerald-800" strokeWidth={2} />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50" strokeWidth={1.5} />
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="py-2.5 px-3.5 whitespace-nowrap">Indicadores IA</th>
                        <th className="py-2.5 px-3.5 whitespace-nowrap">Anexo</th>
                        <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Inspeção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={fields.length + 5}
                            className="py-12 px-4 text-center text-xs text-slate-400"
                          >
                            Nenhum lançamento encontrado para os critérios de filtro selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredSubs.map((sub) => (
                          <tr
                            key={sub.id}
                            onClick={() => setSelectedSubDetail(sub)}
                            className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                          >
                            <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                              {sub.createdAt}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-semibold text-slate-900 block">
                                {sub.propertyName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {sub.producerName} • {sub.cityState}
                              </span>
                            </td>

                            {fields.map((f) => {
                              const val = sub.values[f.id];
                              const isNumeric =
                                f.type === "number" || f.type === "currency" || f.type === "area";
                              return (
                                <td
                                  key={f.id}
                                  className={`py-3 px-3.5 whitespace-nowrap ${
                                    isNumeric
                                      ? "font-mono tabular-nums text-slate-900 font-medium"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {val !== undefined && val !== "" ? (
                                    f.type === "currency" ? (
                                      <span className="text-emerald-900 font-semibold font-mono tabular-nums">
                                        R${" "}
                                        {typeof val === "number"
                                          ? val.toLocaleString("pt-BR")
                                          : !isNaN(Number(String(val).replace(",", ".")))
                                          ? Number(String(val).replace(",", ".")).toLocaleString("pt-BR")
                                          : val}
                                      </span>
                                    ) : f.type === "area" ? (
                                      <span>
                                        {val}{" "}
                                        <span className="text-[10px] font-mono text-slate-400">
                                          {f.unit || "ha"}
                                        </span>
                                      </span>
                                    ) : f.type === "photo" ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <Camera className="w-3 h-3" strokeWidth={1.5} />
                                        <span className="truncate max-w-[120px]">{String(val)}</span>
                                      </span>
                                    ) : (
                                      <>
                                        {val}{" "}
                                        {f.unit && (
                                          <span className="text-[10px] font-mono text-slate-400">
                                            {f.unit}
                                          </span>
                                        )}
                                      </>
                                    )
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-3 px-3.5 max-w-xs">
                              {sub.extractedMetrics && sub.extractedMetrics.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {sub.extractedMetrics.map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200/70 rounded font-mono text-[10px] tabular-nums"
                                    >
                                      {m.value}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {sub.attachment ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  <Paperclip className="w-3 h-3 text-slate-500" strokeWidth={1.75} />
                                  <span className="truncate max-w-[110px]">{sub.attachment.name}</span>
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubDetail(sub);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white group-hover:border-emerald-800 group-hover:text-emerald-900 text-slate-700 text-[11px] font-medium transition-colors"
                              >
                                <Eye className="w-3 h-3" strokeWidth={1.75} />
                                <span>Inspecionar</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 3: CONSTRUTOR DE COLETA COM LIVE MOBILE PREVIEW             */}
          {/* =============================================================== */}
          {activeProfTab === "CONFIGURAR" && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Coluna Esquerda (lg:col-span-7): Templates + Novo Campo + Lista */}
              <div className="lg:col-span-7 space-y-6">
                {/* Templates Rápidos em Cards Elegantes */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                        Protocolos Rápidos de Coleta (Templates)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1 Clique</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Substitua instantaneamente a estrutura de campos por um modelo agronômico validado:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESET_TEMPLATES.map((tpl) => {
                      const isPending = pendingTemplateName === tpl.name;
                      return (
                        <div
                          key={tpl.name}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isPending
                              ? "border-amber-500 bg-amber-50/40"
                              : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-emerald-800"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">
                              {tpl.name}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-1 block leading-snug">
                              {tpl.description}
                            </span>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                            {!isPending ? (
                              <button
                                type="button"
                                onClick={() => setPendingTemplateName(tpl.name)}
                                className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-800 text-slate-800 hover:text-emerald-900 text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>Aplicar Modelo</span>
                                <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                                  {tpl.fields.length} campos
                                </span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmTemplate(tpl)}
                                  className="flex-1 py-1 px-2 bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingTemplateName(null)}
                                  className="py-1 px-2 text-slate-600 text-[11px] cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulário para Adicionar Novo Campo com Catálogo Visual de Tipos */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Adicionar Nova Variável ao Protocolo
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Escolha a natureza agronômica do dado no catálogo visual abaixo para gerar automaticamente a máscara de entrada e a renderização analítica.
                  </p>

                  <form onSubmit={handleCreateField} className="space-y-4">
                    {/* Catálogo Visual de Cards de Tipos */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        1. Selecione a Natureza do Dado Agronômico *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          {
                            type: "number" as FieldType,
                            label: "Numérico Contínuo",
                            desc: "Sacas, kg, dosagens, chuva",
                            icon: BarChart3,
                            badge: "Barras SVG",
                          },
                          {
                            type: "currency" as FieldType,
                            label: "Moeda / Custo (R$)",
                            desc: "Insumos, mão de obra",
                            icon: DollarSign,
                            badge: "Financeiro",
                          },
                          {
                            type: "area" as FieldType,
                            label: "Área / Gleba (ha)",
                            desc: "Hectares trabalhados",
                            icon: Landmark,
                            badge: "Talhão",
                          },
                          {
                            type: "select" as FieldType,
                            label: "Opções / Categorias",
                            desc: "Culturas, manejos",
                            icon: Tag,
                            badge: "Donut SVG",
                          },
                          {
                            type: "text" as FieldType,
                            label: "Texto Descritivo",
                            desc: "Talhão, lote, observações",
                            icon: FileText,
                            badge: "Descritivo",
                          },
                          {
                            type: "date" as FieldType,
                            label: "Data / Safra",
                            desc: "Data da operação",
                            icon: Calendar,
                            badge: "Cronológico",
                          },
                          {
                            type: "photo" as FieldType,
                            label: "Foto / Anexo",
                            desc: "Evidência da lavoura",
                            icon: Camera,
                            badge: "Multimídia",
                          },
                        ].map((item) => {
                          const isSelected = newFieldType === item.type;
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => handleSelectFieldType(item.type)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? "border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/15 shadow-2xs"
                                  : "border-slate-200 bg-[#F8FAFC] hover:border-slate-300"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                      isSelected
                                        ? "bg-emerald-800 text-white"
                                        : "bg-white border border-slate-200 text-slate-600"
                                    }`}
                                  >
                                    <IconComp className="w-3.5 h-3.5" strokeWidth={1.75} />
                                  </div>
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                      isSelected
                                        ? "bg-emerald-800 text-white"
                                        : "bg-slate-200/60 text-slate-600"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1 block leading-tight">
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detalhes do Campo: Rótulo e Unidade */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          2. Rótulo da Variável *
                        </label>
                        <input
                          type="text"
                          placeholder={
                            newFieldType === "currency"
                              ? "Ex: Custo Operacional, Valor Adubo..."
                              : newFieldType === "area"
                              ? "Ex: Área Trabalhada, Gleba Café..."
                              : newFieldType === "photo"
                              ? "Ex: Foto da Lavoura, Laudo da Folha..."
                              : "Ex: Umidade do Grão, Altitude, Dosagem NPK..."
                          }
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:border-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Unidade Técnica
                        </label>
                        <input
                          type="text"
                          placeholder="ha, sc, R$, mm, %"
                          value={newFieldUnit}
                          onChange={(e) => setNewFieldUnit(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg font-mono focus:outline-hidden focus:border-emerald-800"
                        />
                      </div>
                    </div>

                    {/* Formato Analítico & Obrigatoriedade */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          3. Formato Analítico Sugerido
                        </label>
                        <select
                          value={newFieldChartType}
                          onChange={(e) =>
                            setNewFieldChartType(e.target.value as AnalyticalChartType)
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-hidden focus:border-emerald-800"
                        >
                          <option value="bar">Gráfico de Barras Comparativo (SVG)</option>
                          <option value="distribution">Gráfico Donut Proporcional (SVG)</option>
                          <option value="kpi">Indicador de Topo (KPI Card)</option>
                          <option value="none">Apenas Tabela de Dados</option>
                        </select>
                      </div>

                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={newFieldRequired}
                            onChange={(e) => setNewFieldRequired(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
                          />
                          <span>Preenchimento obrigatório pelo produtor</span>
                        </label>
                      </div>
                    </div>

                    {newFieldType === "select" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Lista de Opções Permitidas (separadas por vírgula) *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Catuaí Vermelho, Catuaí Amarelo, Mundo Novo, Arara"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:border-emerald-800"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Inserir Variável no Protocolo</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de Campos Ativos com Reordenação Subir / Descer */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Variáveis Ativas no Protocolo ({fields.length})
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      Suba ou desça para reordenar na hora
                    </span>
                  </div>

                  <div className="space-y-2">
                    {fields.map((f, idx) => {
                      const isConfirmingDel = pendingDeleteFieldId === f.id;
                      const isFirst = idx === 0;
                      const isLast = idx === fields.length - 1;
                      return (
                        <div
                          key={f.id}
                          className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                        >
                          {/* Controles de Subir / Descer */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveFieldUp(idx)}
                              className={`p-1 rounded transition-colors ${
                                isFirst
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                              }`}
                              title="Subir posição no formulário"
                            >
                              <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveFieldDown(idx)}
                              className={`p-1 rounded transition-colors ${
                                isLast
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                              }`}
                              title="Descer posição no formulário"
                            >
                              <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900">{f.label}</span>
                              {f.unit && (
                                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 text-slate-700 rounded">
                                  {f.unit}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded">
                                {f.type}
                              </span>
                              {f.chartType && f.chartType !== "none" && (
                                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded">
                                  {f.chartType === "bar"
                                    ? "Gráfico Barras"
                                    : f.chartType === "distribution"
                                    ? "Gráfico Donut"
                                    : f.chartType === "kpi"
                                    ? "Card KPI"
                                    : f.chartType}
                                </span>
                              )}
                              {f.required && (
                                <span className="text-[10px] font-mono text-red-600 font-medium">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            {f.options && f.options.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-1 truncate">
                                Opções: {f.options.join(" • ")}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            {!isConfirmingDel ? (
                              <button
                                type="button"
                                onClick={() => setPendingDeleteFieldId(f.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remover campo"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDeleteField(f.id, f.label)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                                >
                                  Excluir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteFieldId(null)}
                                  className="px-1.5 py-1 text-slate-500 text-[10px] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Coluna Direita (lg:col-span-5): Live Mobile Preview Interativo Aprimorado */}
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                          Live Mobile Preview
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Simulação interativa da visão do produtor rural no campo
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Ao Vivo
                    </span>
                  </div>

                  {/* Moldura de Smartphone Técnica */}
                  <div className="mx-auto max-w-[330px] bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-800">
                    {/* Notch / Speaker */}
                    <div className="w-24 h-4 bg-slate-950 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
                      <div className="w-8 h-1 rounded-full bg-slate-800" />
                    </div>

                    {/* Tela Interna do Smartphone */}
                    <div className="bg-[#F8FAFC] rounded-[22px] overflow-hidden border border-slate-800">
                      {/* Header do App Mobile */}
                      <div className="bg-[#064E3B] text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-emerald-300" strokeWidth={1.75} />
                          <div>
                            <span className="text-[11px] font-semibold block leading-none">
                              Sítio Córrego Fundo
                            </span>
                            <span className="text-[9px] font-mono text-emerald-200/80">
                              Caderno Digital • Viçosa
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 tabular-nums">
                          {fields.length} campos
                        </span>
                      </div>

                      {/* Corpo Rolável do Formulário Mobile */}
                      <div className="p-3.5 space-y-3 max-h-[420px] overflow-y-auto">
                        {fields.map((f) => (
                          <div key={f.id}>
                            <label className="block text-[11px] font-medium text-slate-700 mb-1">
                              {f.label}
                              {f.required && <span className="text-red-600 ml-0.5">*</span>}
                            </label>
                            {f.type === "select" ? (
                              <select
                                value={previewValues[f.id] || ""}
                                onChange={(e) =>
                                  setPreviewValues({ ...previewValues, [f.id]: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                              >
                                <option value="">Selecionar...</option>
                                {f.options?.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            ) : f.type === "photo" ? (
                              <label className="p-2.5 bg-white border border-dashed border-slate-300 rounded-lg text-center block cursor-pointer hover:border-emerald-700 transition-colors">
                                <div className="flex items-center justify-center gap-1.5 text-emerald-800 text-[11px] font-medium">
                                  <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
                                  <span>{previewValues[f.id] ? "Alterar foto / anexo" : "Tirar foto ou anexar"}</span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 mt-0.5 block truncate">
                                  {previewValues[f.id] ? `📷 ${previewValues[f.id]}` : "JPG, PNG ou Laudo PDF"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setPreviewValues({ ...previewValues, [f.id]: file.name });
                                    }
                                  }}
                                />
                              </label>
                            ) : (
                              <div className="relative flex items-center">
                                {f.type === "currency" && (
                                  <span className="absolute left-2.5 text-[11px] font-mono font-semibold text-emerald-800 select-none">
                                    R$
                                  </span>
                                )}
                                <input
                                  type={
                                    f.type === "number" || f.type === "currency" || f.type === "area"
                                      ? "number"
                                      : f.type === "date"
                                      ? "date"
                                      : "text"
                                  }
                                  placeholder={
                                    f.type === "currency"
                                      ? "0,00"
                                      : f.type === "area"
                                      ? "0.00"
                                      : f.type === "number"
                                      ? "0.0"
                                      : "Preencher..."
                                  }
                                  value={previewValues[f.id] || ""}
                                  onChange={(e) =>
                                    setPreviewValues({
                                      ...previewValues,
                                      [f.id]: e.target.value,
                                    })
                                  }
                                  className={`w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 ${
                                    f.type === "currency" ? "pl-8" : ""
                                  } ${
                                    (f.unit && f.type !== "currency") || f.type === "area" ? "pr-12" : ""
                                  } ${
                                    f.type === "number" || f.type === "currency" || f.type === "area"
                                      ? "font-mono tabular-nums"
                                      : ""
                                  }`}
                                />
                                {((f.unit && f.type !== "currency") || f.type === "area") && (
                                  <span className="absolute right-2 text-[9px] font-mono px-1 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {f.type === "area" ? (f.unit || "ha") : f.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Campo de Diário no Preview */}
                        <div className="pt-2 border-t border-slate-200/80">
                          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                            Diário de Campo + Anexo
                          </label>
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-400">
                            Relato livre com extração IA...
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              showToast("Live Mobile Preview: Simulação de envio com sucesso! Dados validados.");
                            }}
                            className="w-full py-2 bg-[#064E3B] hover:bg-[#065F46] text-white text-center text-[11px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Enviar Dados da Propriedade
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 4: PARECER DO ORIENTADOR (SEM ALERT NATIVO)                 */}
          {/* =============================================================== */}
          {activeProfTab === "SUGESTOES" && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Coluna Esquerda (lg:col-span-7): Formulário de Parecer Técnico */}
              <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
                <div className="pb-4 mb-5 border-b border-slate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold block">
                    Avaliação Metodológica
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                    Registrar Parecer Técnico & Diretrizes do Orientador
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione prioridades para o projeto de estágio ou copie o relatório formatado para o WhatsApp.
                  </p>
                </div>

                {feedbackSentMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={1.75} />
                    <span className="font-medium">{feedbackSentMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveFeedback} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Diretrizes Prioritárias de Evolução (Chips Selecionáveis):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Adicionar mapa georreferenciado dos talhões",
                        "Criar envio direto por áudio do WhatsApp",
                        "Exportar relatórios em PDF para impressão",
                        "Adicionar cálculo automático de custo por saca",
                        "Integrar com estação meteorológica regional",
                        "Comparativo entre safras (24/25 vs 25/26)",
                      ].map((tag) => {
                        const isSel = selectedSuggestedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => toggleSuggestedTag(tag)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                              isSel
                                ? "bg-emerald-900 text-white border-emerald-900 font-medium shadow-2xs"
                                : "bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-slate-300"
                            }`}
                          >
                            {isSel ? (
                              <Check className="w-3.5 h-3.5 text-emerald-300" strokeWidth={1.75} />
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            )}
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Parecer Descritivo / Recomendações Acadêmicas
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Descreva observações sobre o protocolo de coleta, variáveis agronômicas adicionais ou recomendações para a defesa do estágio..."
                      value={newFeedbackComment}
                      onChange={(e) => setNewFeedbackComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:border-emerald-800"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCopyWhatsAppFeedback}
                      className="inline-flex items-center justify-center gap-2 py-2 px-3.5 border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedWhatsApp ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />
                          <span className="text-emerald-800 font-semibold">
                            Copiado para a área de transferência!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                          <span>Copiar Formatado para WhatsApp</span>
                        </>
                      )}
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <MessageSquarePlus className="w-4 h-4" strokeWidth={1.75} />
                      <span>Arquivar Parecer no Projeto</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coluna Direita (lg:col-span-5): Histórico de Pareceres */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Histórico de Pareceres ({feedbacks.length})
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Registro Docente</span>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-8 bg-white border border-[#E2E8F0] rounded-xl text-center text-xs text-slate-400">
                    Nenhum parecer técnico registrado até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-semibold text-slate-900">{fb.author}</span>
                          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                            {fb.createdAt}
                          </span>
                        </div>

                        {fb.suggestedChanges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {fb.suggestedChanges.map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-emerald-50 border border-emerald-200/70 text-emerald-900 rounded font-medium text-[10px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {fb.comment && (
                          <p className="text-slate-700 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                            {fb.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SLIDE-OVER DRAWER LATERAL DIREITO PARA INSPEÇÃO DE REGISTRO */}
      {selectedSubDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop suave */}
          <div
            onClick={() => setSelectedSubDetail(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between">
              {/* Cabeçalho do Slide-over Drawer */}
              <div className="p-6 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-[#F8FAFC]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold block">
                    Inspeção de Registro #{selectedSubDetail.id.slice(-5)}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                    {selectedSubDetail.propertyName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSubDetail.producerName} • {selectedSubDetail.cityState}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubDetail(null)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              {/* Conteúdo do Drawer */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Metadados de Sincronização */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Timestamp de Coleta
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5 block">
                      {selectedSubDetail.createdAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Município / UF
                    </span>
                    <span className="font-medium text-slate-900 mt-0.5 block">
                      {selectedSubDetail.cityState}
                    </span>
                  </div>
                </div>

                {/* Grade de Variáveis Estruturadas */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2.5">
                    Variáveis Estruturadas do Protocolo
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {fields.map((f) => {
                      const val = selectedSubDetail.values[f.id];
                      return (
                        <div
                          key={f.id}
                          className="p-3 rounded-lg bg-white border border-[#E2E8F0]"
                        >
                          <span className="text-[10px] text-slate-400 block">{f.label}</span>
                          <span className="text-xs font-semibold text-slate-900 font-mono tabular-nums mt-1 block">
                            {val !== undefined && val !== "" ? (
                              f.type === "currency" ? (
                                `R$ ${typeof val === "number" ? val.toLocaleString("pt-BR") : !isNaN(Number(String(val).replace(",", "."))) ? Number(String(val).replace(",", ".")).toLocaleString("pt-BR") : val}`
                              ) : f.type === "area" ? (
                                `${val} ${f.unit || "ha"}`
                              ) : f.type === "photo" ? (
                                `📷 ${val}`
                              ) : (
                                `${val} ${f.unit || ""}`
                              )
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Relato Livre do Produtor */}
                {selectedSubDetail.rawNotes && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Diário de Manejo / Observações de Campo
                    </h4>
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 leading-relaxed">
                      {selectedSubDetail.rawNotes}
                    </div>
                  </div>
                )}

                {/* Métricas Extraídas pela IA */}
                {selectedSubDetail.extractedMetrics &&
                  selectedSubDetail.extractedMetrics.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.75} />
                        <span>Indicadores Extraídos Automaticamente (NLP/IA)</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSubDetail.extractedMetrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80"
                          >
                            <span className="text-[10px] font-mono text-emerald-800 block">
                              {m.label}
                            </span>
                            <span className="text-xs font-semibold font-mono text-emerald-950 tabular-nums mt-0.5 block">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Anexo */}
                {selectedSubDetail.attachment && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Arquivo Comprobatório Anexado
                    </h4>
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Paperclip
                          className="w-4 h-4 text-emerald-800 shrink-0"
                          strokeWidth={1.75}
                        />
                        <span className="font-mono text-xs font-medium text-slate-900 truncate">
                          {selectedSubDetail.attachment.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0 ml-2">
                        {selectedSubDetail.attachment.size}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé do Drawer */}
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <button
                  onClick={() => exportAnalysisToExcel([selectedSubDetail], fields)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
                  <span>Exportar Ficha (.xlsx)</span>
                </button>
                <button
                  onClick={() => setSelectedSubDetail(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar Inspeção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
