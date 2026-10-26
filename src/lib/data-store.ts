import {
  AuthUser,
  CollectionField,
  FarmSubmission,
  ExtractedMetric,
  ProfessorFeedback,
} from "@/types/producer";
import { INITIAL_USERS, INITIAL_FIELDS, INITIAL_SUBMISSIONS } from "./mock-data";

const USERS_KEY = "agro_users_v3";
const FIELDS_KEY = "agro_fields_v3";
const SUBMISSIONS_KEY = "agro_submissions_v3";
const AUTH_KEY = "agro_current_user_v3";
const FEEDBACK_KEY = "agro_professor_feedback_v3";

// --- GESTÃO DE USUÁRIOS E AUTENTICAÇÃO ---

export function getUsers(): AuthUser[] {
  if (typeof window === "undefined") return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const stored: AuthUser[] = JSON.parse(raw);
    // Garantir que usuários padrão (como testeprofessor, testeprodutor, etc.) sempre existam mesmo se o localStorage tiver versão antiga
    const missing = INITIAL_USERS.filter((init) => !stored.some((s) => s.login === init.login));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch {
    return INITIAL_USERS;
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
  window.dispatchEvent(new Event("agro_auth_change"));
}

export function login(loginInput: string, passwordInput: string): { success: boolean; user?: AuthUser; message?: string } {
  const users = getUsers();
  const clean = loginInput.trim().toLowerCase();

  // 1. Busca direta por login exato (tanto PROFESSOR quanto PRODUCER)
  let found = users.find((u) => u.login.toLowerCase() === clean);

  // 2. Mapeamento de conveniência e aliases
  if (!found) {
    if (clean === "testeprofessor" || clean === "teste professor" || clean === "professor teste") {
      found = users.find((u) => u.login === "testeprofessor") || users.find((u) => u.role === "PROFESSOR");
    } else if (clean === "testeprodutor" || clean === "teste produtor" || clean === "produtor teste") {
      found = users.find((u) => u.login === "testeprodutor") || users.find((u) => u.role === "PRODUCER");
    } else if (clean === "professor" || clean === "docente" || clean === "marcelo" || clean === "orientador") {
      found = users.find((u) => u.role === "PROFESSOR");
    } else {
      // 3. Busca por aproximação de nome ou telefone
      found = users.find(
        (u) =>
          u.name.toLowerCase().includes(clean) ||
          (u.propertyName && u.propertyName.toLowerCase().includes(clean)) ||
          (u.phone && u.phone.replace(/\D/g, "") === clean.replace(/\D/g, ""))
      );
    }
  }

  if (found) {
    setCurrentUser(found);
    return { success: true, user: found };
  }

  return { success: false, message: "Usuário não encontrado. Verifique os dados ou cadastre um novo produtor." };
}

export function registerProducer(data: {
  login: string;
  name: string;
  propertyName: string;
  cityState: string;
  phone?: string;
}): AuthUser {
  const users = getUsers();
  const newUser: AuthUser = {
    id: "user-prod-" + Date.now(),
    login: data.login.trim().toLowerCase(),
    name: data.name.trim(),
    role: "PRODUCER",
    propertyName: data.propertyName.trim(),
    cityState: data.cityState.trim() || "Viçosa - MG",
    phone: data.phone?.trim() || "",
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newUser, ...users];
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  setCurrentUser(newUser);
  window.dispatchEvent(new Event("agro_data_change"));
  return newUser;
}

// --- GESTÃO DE CAMPOS CONFIGURÁVEIS PELO PROFESSOR ---

export function getFields(): CollectionField[] {
  if (typeof window === "undefined") return INITIAL_FIELDS;
  try {
    const raw = localStorage.getItem(FIELDS_KEY);
    if (!raw) {
      localStorage.setItem(FIELDS_KEY, JSON.stringify(INITIAL_FIELDS));
      return INITIAL_FIELDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FIELDS;
  }
}

export function saveFields(fields: CollectionField[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
  window.dispatchEvent(new Event("agro_fields_change"));
  window.dispatchEvent(new Event("agro_data_change"));
}

export function addField(field: Omit<CollectionField, "id">): CollectionField {
  const fields = getFields();
  const newField: CollectionField = {
    ...field,
    id: "field_" + Date.now().toString().slice(-6),
  };
  const updated = [...fields, newField];
  saveFields(updated);
  return newField;
}

export function deleteField(id: string): void {
  const fields = getFields();
  const updated = fields.filter((f) => f.id !== id);
  saveFields(updated);
}

// --- PARSER INTELIGENTE DE TEXTO LIVRE ---

export function extractMetricsFromText(text: string): { metrics: ExtractedMetric[]; tags: string[] } {
  if (!text) return { metrics: [], tags: [] };

  const metrics: ExtractedMetric[] = [];
  const tags: Set<string> = new Set();

  // Regex para números com unidades agrícolas
  const sacasRegex = /(\d+[\.,]?\d*)\s*(sacas?|scs?|sc)\b/gi;
  const haRegex = /(\d+[\.,]?\d*)\s*(hectares?|ha)\b/gi;
  const reaisRegex = /(R\$\s*|reais\s*)(\d+[\.,]?\d*)|(\d+[\.,]?\d*)\s*(reais)\b/gi;
  const kgRegex = /(\d+[\.,]?\d*)\s*(kg|quilos?|toneladas?|ton|t)\b/gi;
  const mmRegex = /(\d+[\.,]?\d*)\s*(mm|mil[ií]metros?)\b/gi;
  const litrosRegex = /(\d+[\.,]?\d*)\s*(litros?|l\/dia|l)\b/gi;

  let match;
  if ((match = sacasRegex.exec(text)) !== null) {
    metrics.push({ label: "Produção Relatada", value: `${match[1]} sacas` });
    tags.add("Produção");
  }

  if ((match = haRegex.exec(text)) !== null) {
    metrics.push({ label: "Área Mencionada", value: `${match[1]} ha` });
    tags.add("Área");
  }

  if ((match = reaisRegex.exec(text)) !== null) {
    const val = match[2] || match[3];
    metrics.push({ label: "Valor / Custo", value: `R$ ${val}` });
    tags.add("Custo Financeiro");
  }

  if ((match = kgRegex.exec(text)) !== null) {
    metrics.push({ label: "Insumo / Peso", value: `${match[1]} ${match[2]}` });
    tags.add("Insumos");
  }

  if ((match = mmRegex.exec(text)) !== null) {
    metrics.push({ label: "Pluviometria", value: `${match[1]} mm` });
    tags.add("Chuva / Clima");
  }

  if ((match = litrosRegex.exec(text)) !== null) {
    metrics.push({ label: "Volume Líquido", value: `${match[1]} L` });
  }

  // Tags contextuais
  const lower = text.toLowerCase();
  if (lower.includes("café") || lower.includes("catuaí") || lower.includes("arábica")) tags.add("Cafeicultura");
  if (lower.includes("milho") || lower.includes("silagem")) tags.add("Milho");
  if (lower.includes("leite") || lower.includes("pasto") || lower.includes("gado")) tags.add("Pecuária");
  if (lower.includes("adubo") || lower.includes("adubação") || lower.includes("npk")) tags.add("Adubação");
  if (lower.includes("colheita") || lower.includes("colhemos")) tags.add("Colheita");
  if (lower.includes("pulverização") || lower.includes("ferrugem") || lower.includes("bicho-mineiro")) tags.add("Fitossanidade");
  if (lower.includes("terreiro") || lower.includes("secador")) tags.add("Pós-Colheita");

  return { metrics, tags: Array.from(tags) };
}

// --- GESTÃO DE REGISTROS (SUBMISSIONS) ---

export function getSubmissions(): FarmSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

export function addSubmission(sub: Omit<FarmSubmission, "id" | "createdAt" | "extractedMetrics" | "tags"> & { rawNotes?: string }): FarmSubmission {
  const list = getSubmissions();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const { metrics, tags } = extractMetricsFromText(sub.rawNotes || "");

  // Extrai tags dos valores do formulário também
  const combinedTags = new Set(tags);
  Object.values(sub.values).forEach((v) => {
    if (typeof v === "string" && v.length > 2 && v.length < 25) {
      combinedTags.add(v);
    }
  });

  const newSub: FarmSubmission = {
    ...sub,
    id: "sub-" + Date.now(),
    createdAt: dateStr,
    extractedMetrics: metrics,
    tags: Array.from(combinedTags),
  };

  const updated = [newSub, ...list];
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("agro_data_change"));
  return newSub;
}

// --- GESTÃO DE SUGESTÕES / FEEDBACK DO PROFESSOR ---

export function getProfessorFeedbacks(): ProfessorFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: "fb-1",
        author: "Prof. Dr. Marcelo",
        comment: "Interface bem limpa. Seria interessante incluirmos mais tarde um mapa georreferenciado dos talhões.",
        suggestedChanges: ["Incluir mapa dos talhões", "Exportar gráfico em PNG", "Campo de lote de semente"],
        createdAt: "2026-10-25 10:00",
      }
    ];
  } catch {
    return [];
  }
}

export function saveProfessorFeedback(feedback: Omit<ProfessorFeedback, "id" | "createdAt">): ProfessorFeedback {
  const current = getProfessorFeedbacks();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const item: ProfessorFeedback = {
    ...feedback,
    id: "fb-" + Date.now(),
    createdAt: dateStr,
  };

  const updated = [item, ...current];
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("agro_feedback_change"));
  return item;
}

// --- RESTAURAR DADOS DE FÁBRICA ---

export function resetToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(FIELDS_KEY, JSON.stringify(INITIAL_FIELDS));
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
  localStorage.removeItem(FEEDBACK_KEY);
  window.dispatchEvent(new Event("agro_data_change"));
  window.dispatchEvent(new Event("agro_fields_change"));
}
