import * as XLSX from "xlsx";
import { FarmSubmission, CollectionField } from "@/types/producer";

export function exportAnalysisToExcel(submissions: FarmSubmission[], fields: CollectionField[]): void {
  // Aba 1: Dados Brutos Estruturados
  const rawRows = submissions.map((sub, idx) => {
    const row: Record<string, any> = {
      "Nº": idx + 1,
      "Data": sub.createdAt,
      "Produtor": sub.producerName,
      "Propriedade": sub.propertyName,
      "Município / UF": sub.cityState,
    };

    // Adiciona cada campo configurado pelo professor
    fields.forEach((f) => {
      const val = sub.values[f.id];
      const header = f.unit ? `${f.label} (${f.unit})` : f.label;
      row[header] = val !== undefined && val !== null ? val : "-";
    });

    row["Anotação Livre / Relato"] = sub.rawNotes || "-";
    row["Métricas Extraídas"] = sub.extractedMetrics && sub.extractedMetrics.length > 0
      ? sub.extractedMetrics.map((m) => `${m.label}: ${m.value}`).join(" | ")
      : "-";
    row["Arquivo Anexado"] = sub.attachment ? `${sub.attachment.name} (${sub.attachment.size})` : "Nenhum";

    return row;
  });

  const wsRaw = XLSX.utils.json_to_sheet(rawRows);

  // Aba 2: Resumo Consolidado por Produtor
  const producerMap: Record<string, { name: string; property: string; city: string; count: number; areas: number[]; prods: number[]; custos: number[] }> = {};

  // Cria conjuntos de IDs baseados no tipo ou identificador do campo
  const areaFieldIds = new Set(
    fields.filter((f) => f.type === "area" || f.id.includes("area")).map((f) => f.id)
  );
  const prodFieldIds = new Set(
    fields.filter((f) => f.id.includes("producao") || f.id.includes("sacas")).map((f) => f.id)
  );
  const custoFieldIds = new Set(
    fields.filter((f) => f.type === "currency" || f.id.includes("custo")).map((f) => f.id)
  );

  submissions.forEach((s) => {
    if (!producerMap[s.producerId]) {
      producerMap[s.producerId] = {
        name: s.producerName,
        property: s.propertyName,
        city: s.cityState,
        count: 0,
        areas: [],
        prods: [],
        custos: [],
      };
    }
    const p = producerMap[s.producerId];
    p.count += 1;

    // Acha áreas, produções ou custos nos valores pelos IDs tipados ou heurística
    Object.entries(s.values).forEach(([k, v]) => {
      const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
      if (!isNaN(num)) {
        if (areaFieldIds.has(k) || k.includes("area")) p.areas.push(num);
        if (prodFieldIds.has(k) || k.includes("producao") || k.includes("sacas")) p.prods.push(num);
        if (custoFieldIds.has(k) || k.includes("custo")) p.custos.push(num);
      }
    });
  });

  const producerSummaryRows = Object.values(producerMap).map((p) => {
    const sumArea = p.areas.reduce((a, b) => a + b, 0);
    const sumProd = p.prods.reduce((a, b) => a + b, 0);
    const sumCusto = p.custos.reduce((a, b) => a + b, 0);

    return {
      "Produtor": p.name,
      "Propriedade": p.property,
      "Município": p.city,
      "Total de Registros": p.count,
      "Área Total Somada (ha)": sumArea > 0 ? sumArea : "-",
      "Produção Total Somada": sumProd > 0 ? sumProd : "-",
      "Custo Total Somado (R$)": sumCusto > 0 ? sumCusto : "-",
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(producerSummaryRows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsRaw, "Dados dos Produtores");
  XLSX.utils.book_append_sheet(workbook, wsSummary, "Resumo por Produtor");

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `coleta_dados_rurais_${today}.xlsx`);
}

export function exportAnalysisToCSV(submissions: FarmSubmission[], fields: CollectionField[]): void {
  const headers = [
    "Data",
    "Produtor",
    "Propriedade",
    "MunicipioUF",
    ...fields.map((f) => f.id),
    "AnotacaoLivre",
    "Arquivo",
  ];

  const escapeCSV = (val: any) => {
    const str = String(val !== undefined && val !== null ? val : "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = submissions.map((sub) => [
    escapeCSV(sub.createdAt),
    escapeCSV(sub.producerName),
    escapeCSV(sub.propertyName),
    escapeCSV(sub.cityState),
    ...fields.map((f) => escapeCSV(sub.values[f.id])),
    escapeCSV(sub.rawNotes),
    escapeCSV(sub.attachment?.name),
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `dados_coletados_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
