export type UserRole = "PROFESSOR" | "PRODUCER";

export interface AuthUser {
  id: string;
  login: string;
  name: string;
  role: UserRole;
  propertyName?: string;
  cityState?: string;
  phone?: string;
  createdAt: string;
}

export type FieldType =
  | "number"
  | "currency"
  | "area"
  | "select"
  | "text"
  | "date"
  | "photo";

export type AnalyticalChartType = "bar" | "distribution" | "kpi" | "table" | "none";

export interface CollectionField {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  options?: string[];
  required?: boolean;
  chartType: AnalyticalChartType;
}

export interface ExtractedMetric {
  label: string;
  value: string;
}

export interface FarmSubmission {
  id: string;
  producerId: string;
  producerName: string;
  propertyName: string;
  cityState: string;
  createdAt: string;
  values: Record<string, string | number>;
  rawNotes?: string;
  extractedMetrics?: ExtractedMetric[];
  tags: string[];
  attachment?: {
    name: string;
    size: string;
    type: "PHOTO" | "FILE";
  };
}

export interface ProfessorFeedback {
  id: string;
  author: string;
  comment: string;
  suggestedChanges: string[];
  createdAt: string;
}
