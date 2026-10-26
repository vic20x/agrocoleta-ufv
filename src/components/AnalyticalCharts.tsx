"use client";

import React, { useState, useMemo } from "react";
import { CollectionField, FarmSubmission } from "@/types/producer";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Building2,
  SlidersHorizontal,
  Table,
  Award,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

export type AnalyticalViewMode = "DEEP_DIVE" | "GRID_OVERVIEW" | "BENCHMARK_PROPERTIES";

interface AnalyticalChartsProps {
  fields: CollectionField[];
  submissions: FarmSubmission[];
  activeFieldId?: string;
  onSelectField?: (fieldId: string) => void;
  viewMode?: AnalyticalViewMode;
  onViewModeChange?: (mode: AnalyticalViewMode) => void;
}

const DONUT_COLORS = [
  "#065F46", // emerald-800
  "#0F172A", // slate-900
  "#0D9488", // teal-600
  "#2563EB", // blue-600
  "#D97706", // amber-600
  "#64748B", // slate-500
  "#4F46E5", // indigo-600
  "#EC4899", // pink-600
];

function formatNum(n: number): string {
  if (Number.isInteger(n)) {
    return n.toLocaleString("pt-BR");
  }
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatAxisTick(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (n > 0 && n < 10 && !Number.isInteger(n)) return n.toFixed(1);
  return String(Math.round(n));
}

export function AnalyticalCharts({
  fields,
  submissions,
  activeFieldId: controlledActiveFieldId,
  onSelectField,
  viewMode: controlledViewMode,
  onViewModeChange,
}: AnalyticalChartsProps) {
  // Estado interno para viewMode quando não controlado
  const [internalViewMode, setInternalViewMode] = useState<AnalyticalViewMode>("DEEP_DIVE");
  const currentViewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = (mode: AnalyticalViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Identificação dos campos elegíveis para análise
  const numericFields = useMemo(() => fields.filter((f) => f.type === "number"), [fields]);
  const selectFields = useMemo(() => fields.filter((f) => f.type === "select"), [fields]);
  const allAnalyticFields = useMemo(
    () => [...numericFields, ...selectFields],
    [numericFields, selectFields]
  );

  // Variável focada no modo DEEP_DIVE
  const [internalActiveFieldId, setInternalActiveFieldId] = useState<string>(() => {
    return allAnalyticFields[0]?.id || "";
  });

  const selectedFieldId =
    controlledActiveFieldId && allAnalyticFields.some((f) => f.id === controlledActiveFieldId)
      ? controlledActiveFieldId
      : internalActiveFieldId || allAnalyticFields[0]?.id || "";

  const handleSelectField = (fieldId: string) => {
    if (onSelectField) {
      onSelectField(fieldId);
    } else {
      setInternalActiveFieldId(fieldId);
    }
  };

  // Hover state para barras
  const [hoveredBar, setHoveredBar] = useState<{
    fieldId: string;
    idx: number;
  } | null>(null);

  // Propriedades únicas
  const uniqueProperties = useMemo(() => {
    const map = new Map<string, { producerId: string; producerName: string; propertyName: string; cityState: string }>();
    submissions.forEach((s) => {
      if (!map.has(s.propertyName)) {
        map.set(s.propertyName, {
          producerId: s.producerId,
          producerName: s.producerName,
          propertyName: s.propertyName,
          cityState: s.cityState,
        });
      }
    });
    return Array.from(map.values());
  }, [submissions]);

  // Campo ativo atual
  const activeField = allAnalyticFields.find((f) => f.id === selectedFieldId) || allAnalyticFields[0];

  // =========================================================================
  // SUB-RENDERIZADOR: BAR CHART SVG
  // =========================================================================
  const renderBarChart = (
    field: CollectionField,
    isHero = false
  ) => {
    const points = submissions
      .map((s) => {
        const raw = s.values[field.id];
        const hasValue = raw !== undefined && raw !== null && String(raw).trim() !== "";
        const parsed = hasValue ? Number(raw) : NaN;
        return {
          id: s.id,
          producer: s.producerName.split(" ")[0],
          fullName: s.producerName,
          property: s.propertyName,
          city: s.cityState,
          date: s.createdAt,
          val: parsed,
        };
      })
      .filter((p) => !isNaN(p.val) && p.val >= 0);

    const count = points.length;
    const sumVal = points.reduce((acc, p) => acc + p.val, 0);
    const avgVal = count > 0 ? sumVal / count : 0;
    const minPoint = count > 0 ? points.reduce((prev, curr) => (curr.val < prev.val ? curr : prev), points[0]) : null;
    const maxPoint = count > 0 ? points.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), points[0]) : null;
    const minVal = minPoint ? minPoint.val : 0;
    const maxVal = maxPoint ? maxPoint.val : 0;

    const yMax = maxVal > 0 ? maxVal * 1.25 : 10;

    const svgWidth = isHero
      ? Math.max(760, count * 88 + 90)
      : Math.max(480, count * 64 + 70);
    const svgHeight = isHero ? 280 : 220;
    const padLeft = 56;
    const padRight = 24;
    const padTop = 32;
    const padBottom = 46;
    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const gridTicks = [0, 0.25, 0.5, 0.75, 1];
    const avgY =
      yMax > 0
        ? Math.min(padTop + plotH, Math.max(padTop, padTop + plotH - (avgVal / yMax) * plotH))
        : padTop + plotH;

    const avgLabel = `Média: ${formatNum(avgVal)}${field.unit ? ` ${field.unit}` : ""}`;
    const avgBadgeWidth = Math.max(96, avgLabel.length * 6 + 14);

    return (
      <div className="flex flex-col justify-between">
        {/* Badges de Estatísticas Rápidas */}
        <div className={`grid ${isHero ? "grid-cols-2 sm:grid-cols-4 gap-3 my-4" : "grid-cols-2 sm:grid-cols-4 gap-2 my-3"}`}>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Soma Total
            </span>
            <span className={`${isHero ? "text-sm" : "text-xs"} font-semibold text-slate-900 font-mono tabular-nums mt-0.5 block truncate`}>
              {formatNum(sumVal)}{" "}
              <span className="text-[10px] font-normal text-slate-500">
                {field.unit || ""}
              </span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] uppercase font-mono text-emerald-800 block">
              Média Regional
            </span>
            <span className={`${isHero ? "text-sm" : "text-xs"} font-semibold text-emerald-950 font-mono tabular-nums mt-0.5 block truncate`}>
              {formatNum(avgVal)}{" "}
              <span className="text-[10px] font-normal text-emerald-700">
                {field.unit || ""}
              </span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-0.5">
                <ArrowDownRight className="w-2.5 h-2.5 text-slate-400" strokeWidth={1.75} />
                Mínimo
              </span>
              {isHero && minPoint && (
                <span className="text-[9px] text-slate-400 font-sans truncate max-w-[70px]">
                  {minPoint.property}
                </span>
              )}
            </span>
            <span className={`${isHero ? "text-sm" : "text-xs"} font-semibold text-slate-800 font-mono tabular-nums mt-0.5 block truncate`}>
              {formatNum(minVal)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5 text-emerald-700" strokeWidth={1.75} />
                Máximo
              </span>
              {isHero && maxPoint && (
                <span className="text-[9px] text-emerald-700 font-sans truncate max-w-[70px]">
                  {maxPoint.property}
                </span>
              )}
            </span>
            <span className={`${isHero ? "text-sm" : "text-xs"} font-semibold text-slate-800 font-mono tabular-nums mt-0.5 block truncate`}>
              {formatNum(maxVal)}
            </span>
          </div>
        </div>

        {/* SVG Graphic */}
        {count === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
            <Activity className="w-5 h-5 mb-1.5 text-slate-300" strokeWidth={1.75} />
            <span>Sem dados numéricos registrados para {field.label}.</span>
          </div>
        ) : (
          <div className="pt-1">
            <div className="overflow-x-auto pb-1">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ minWidth: svgWidth > (isHero ? 760 : 480) ? `${svgWidth}px` : undefined }}
                className="w-full h-auto overflow-visible select-none"
                role="img"
                aria-label={`Gráfico de barras para ${field.label}`}
              >
                {/* Linhas de Grade Horizontais */}
                {gridTicks.map((t, idx) => {
                  const y = padTop + plotH - t * plotH;
                  const valAtTick = t * yMax;
                  return (
                    <g key={idx}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke={t === 0 ? "#CBD5E1" : "#E2E8F0"}
                        strokeWidth={t === 0 ? 1.2 : 1}
                        strokeDasharray={t === 0 ? undefined : "3 3"}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-slate-400 font-mono text-[9px] tabular-nums"
                      >
                        {formatAxisTick(valAtTick)}
                      </text>
                    </g>
                  );
                })}

                {/* Colunas Verticais */}
                {points.map((pt, idx) => {
                  const slotW = plotW / points.length;
                  const barW = Math.min(isHero ? 56 : 42, Math.max(isHero ? 24 : 18, slotW * 0.54));
                  const x = padLeft + idx * slotW + (slotW - barW) / 2;
                  const rawBarH = yMax > 0 ? (pt.val / yMax) * plotH : 0;
                  const barH = Math.min(plotH, Math.max(4, rawBarH));
                  const y = padTop + plotH - barH;
                  const isAboveAvg = pt.val >= avgVal;
                  const isHovered = hoveredBar?.fieldId === field.id && hoveredBar?.idx === idx;

                  const maxChars = slotW < 75 ? 9 : 14;
                  const shortProp =
                    pt.property.length > maxChars
                      ? pt.property.slice(0, maxChars - 1) + "…"
                      : pt.property;

                  return (
                    <g
                      key={pt.id + "-" + idx}
                      className="group cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ fieldId: field.id, idx })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <title>
                        {`${pt.property} (${pt.fullName}) — ${formatNum(pt.val)} ${field.unit || ""}`}
                      </title>

                      {/* Sombra no Hover */}
                      <rect
                        x={padLeft + idx * slotW + 2}
                        y={padTop}
                        width={slotW - 4}
                        height={plotH}
                        rx={6}
                        fill={isHovered ? "#F1F5F9" : "transparent"}
                        className="transition-colors"
                      />

                      {/* Barra Principal */}
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={5}
                        fill={isAboveAvg ? "#065F46" : "#334155"}
                        className="transition-opacity duration-200 group-hover:opacity-90"
                      />

                      {/* Topo de destaque na barra */}
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={Math.min(3.5, barH)}
                        rx={1.5}
                        fill={isAboveAvg ? "#10B981" : "#64748B"}
                      />

                      {/* Rótulo de Valor Numérico no Topo */}
                      <text
                        x={x + barW / 2}
                        y={y - 6}
                        textAnchor="middle"
                        className={`fill-slate-800 font-mono ${isHero ? "text-[11px]" : "text-[10px]"} font-semibold tabular-nums`}
                      >
                        {formatNum(pt.val)}
                      </text>

                      {/* Rótulo Eixo X: Nome do Produtor */}
                      <text
                        x={x + barW / 2}
                        y={padTop + plotH + 16}
                        textAnchor="middle"
                        className="fill-slate-700 font-sans text-[10px] font-medium"
                      >
                        {pt.producer}
                      </text>

                      {/* Sub-rótulo Eixo X: Propriedade */}
                      <text
                        x={x + barW / 2}
                        y={padTop + plotH + 28}
                        textAnchor="middle"
                        className="fill-slate-400 font-mono text-[8.5px]"
                      >
                        {shortProp}
                      </text>
                    </g>
                  );
                })}

                {/* Linha Tracejada de Média Regional */}
                {count > 0 && (
                  <g className="pointer-events-none">
                    <line
                      x1={padLeft}
                      y1={avgY}
                      x2={svgWidth - padRight}
                      y2={avgY}
                      stroke="#D97706"
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                    />
                    <rect
                      x={svgWidth - padRight - avgBadgeWidth}
                      y={Math.max(4, avgY - 17)}
                      width={avgBadgeWidth}
                      height={16}
                      rx={3}
                      fill="#FEF3C7"
                      stroke="#F59E0B"
                      strokeWidth={0.75}
                    />
                    <text
                      x={svgWidth - padRight - avgBadgeWidth / 2}
                      y={Math.max(15, avgY - 6)}
                      textAnchor="middle"
                      className="fill-amber-900 font-mono text-[8.5px] font-semibold tabular-nums"
                    >
                      {avgLabel}
                    </text>
                  </g>
                )}

                {/* Tooltip Vetorial */}
                {hoveredBar?.fieldId === field.id &&
                  points[hoveredBar.idx] &&
                  (() => {
                    const pt = points[hoveredBar.idx];
                    const slotW = plotW / points.length;
                    const centerX = padLeft + hoveredBar.idx * slotW + slotW / 2;
                    const ttW = isHero ? 190 : 164;
                    const ttH = isHero ? 46 : 42;
                    const ttX = Math.min(svgWidth - padRight - ttW, Math.max(padLeft, centerX - ttW / 2));
                    const ttY = 4;

                    const diffPct = avgVal > 0 ? ((pt.val - avgVal) / avgVal) * 100 : 0;
                    const diffText =
                      diffPct >= 0
                        ? `+${diffPct.toFixed(1)}% vs média`
                        : `${diffPct.toFixed(1)}% vs média`;

                    return (
                      <g className="pointer-events-none">
                        <rect
                          x={ttX}
                          y={ttY}
                          width={ttW}
                          height={ttH}
                          rx={6}
                          fill="#0F172A"
                          stroke="#334155"
                          strokeWidth={1}
                        />
                        <text
                          x={ttX + 10}
                          y={ttY + 16}
                          className="fill-white font-sans text-[10px] font-semibold"
                        >
                          {pt.property.length > 22 ? pt.property.slice(0, 21) + "…" : pt.property}
                        </text>
                        <text
                          x={ttX + 10}
                          y={ttY + 32}
                          className="fill-emerald-300 font-mono text-[9.5px] font-semibold tabular-nums"
                        >
                          {formatNum(pt.val)} {field.unit || ""} • {pt.producer}
                        </text>
                        {isHero && (
                          <text
                            x={ttX + ttW - 8}
                            y={ttY + 32}
                            textAnchor="end"
                            className={`font-mono text-[8.5px] font-semibold tabular-nums ${
                              diffPct >= 0 ? "fill-emerald-400" : "fill-amber-400"
                            }`}
                          >
                            {diffText}
                          </text>
                        )}
                      </g>
                    );
                  })()}
              </svg>
            </div>

            {/* Rodapé / Legenda */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#065F46] inline-block" />
                  <span>Acima / Igual à Média</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 inline-block" />
                  <span>Abaixo da Média</span>
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-amber-800">
                <span className="w-3 border-b-2 border-dashed border-amber-600 inline-block" />
                <span>Linha de Média Regional</span>
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-RENDERIZADOR: DONUT CHART SVG
  // =========================================================================
  const renderDonutChart = (
    field: CollectionField,
    isHero = false
  ) => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      const rawVal = s.values[field.id];
      const val =
        rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ""
          ? String(rawVal)
          : "Não especificado";
      counts[val] = (counts[val] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = submissions.length;

    const size = isHero ? 210 : 168;
    const cx = size / 2;
    const cy = size / 2;
    const radius = isHero ? 72 : 58;
    const strokeWidth = isHero ? 24 : 20;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPct = 0;

    return (
      <div className="flex flex-col justify-between">
        {total === 0 ? (
          <div className="h-44 flex items-center justify-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
            Nenhum registro para calcular distribuição.
          </div>
        ) : (
          <div className={`grid ${isHero ? "grid-cols-1 md:grid-cols-12 gap-6" : "grid-cols-1 sm:grid-cols-12 gap-4"} items-center py-2`}>
            {/* Donut SVG */}
            <div className={`${isHero ? "md:col-span-5" : "sm:col-span-5"} flex items-center justify-center`}>
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible select-none"
                role="img"
                aria-label={`Gráfico de rosca para ${field.label}`}
              >
                {/* Anel de Fundo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />

                {/* Segmentos Coloridos */}
                {entries.map(([label, count], idx) => {
                  const pct = count / total;
                  const dashLen = Math.max(0, pct * circumference - (entries.length > 1 ? 2 : 0));
                  const dashOffset = -accumulatedPct * circumference;
                  accumulatedPct += pct;
                  const color = DONUT_COLORS[idx % DONUT_COLORS.length];

                  return (
                    <circle
                      key={label}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dashLen} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      className="transition-all duration-300"
                    >
                      <title>{`${label}: ${count} reg. (${(pct * 100).toFixed(1)}%)`}</title>
                    </circle>
                  );
                })}

                {/* Valor Central no Donut */}
                <text
                  x={cx}
                  y={cy - 3}
                  textAnchor="middle"
                  className={`fill-slate-900 font-mono ${isHero ? "text-2xl" : "text-xl"} font-bold tabular-nums`}
                >
                  {total}
                </text>
                <text
                  x={cx}
                  y={cy + (isHero ? 15 : 13)}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[9px] uppercase tracking-wider"
                >
                  Registros
                </text>
              </svg>
            </div>

            {/* Legenda Lateral com Barras de Precisão */}
            <div className={`${isHero ? "md:col-span-7" : "sm:col-span-7"} space-y-2`}>
              {entries.map(([label, count], idx) => {
                const numPct = (count / total) * 100;
                const pct = numPct.toFixed(1);
                const color = DONUT_COLORS[idx % DONUT_COLORS.length];
                return (
                  <div
                    key={label}
                    className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-800 truncate">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                        <span className="text-slate-500 text-[11px]">{count} reg.</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-semibold text-[11px]">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(4, numPct)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-RENDERIZADOR: TABELA ANALÍTICA DETALHADA PARA MODO HERO (DEEP_DIVE)
  // =========================================================================
  const renderHeroTable = (field: CollectionField) => {
    if (field.type === "number") {
      const rows = submissions
        .map((s) => {
          const raw = s.values[field.id];
          const hasValue = raw !== undefined && raw !== null && String(raw).trim() !== "";
          const val = hasValue ? Number(raw) : NaN;
          return {
            id: s.id,
            property: s.propertyName,
            producer: s.producerName,
            city: s.cityState,
            date: s.createdAt,
            cultura: String(s.values["cultura"] || "—"),
            val,
          };
        })
        .filter((r) => !isNaN(r.val))
        .sort((a, b) => b.val - a.val);

      const sumVal = rows.reduce((acc, r) => acc + r.val, 0);
      const avgVal = rows.length > 0 ? sumVal / rows.length : 0;

      return (
        <div className="mt-5 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Ranking de Propriedades — {field.label}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {rows.length} lançamentos ordenados por valor decrescente
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4">Posição</th>
                  <th className="py-2.5 px-4">Propriedade Rural</th>
                  <th className="py-2.5 px-4">Produtor</th>
                  <th className="py-2.5 px-4">Cultura</th>
                  <th className="py-2.5 px-4 text-right">Valor Reportado ({field.unit || "un."})</th>
                  <th className="py-2.5 px-4 text-right">Desvio vs Média Regional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, idx) => {
                  const diffPct = avgVal > 0 ? ((r.val - avgVal) / avgVal) * 100 : 0;
                  const isTop = idx === 0;
                  const isAbove = r.val >= avgVal;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold tabular-nums text-slate-500">
                        {isTop ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                            <Award className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                            1º
                          </span>
                        ) : (
                          `${idx + 1}º`
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {r.property}
                        <span className="text-[10px] text-slate-400 block font-normal">{r.city}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{r.producer}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {r.cultura}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatNum(r.val)} {field.unit || ""}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs tabular-nums">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isAbove
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isAbove ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-slate-500" strokeWidth={2} />
                          )}
                          {diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Tabela para variáveis categóricas (select)
    const catCounts: Record<string, { count: number; farms: Set<string> }> = {};
    submissions.forEach((s) => {
      const raw = s.values[field.id];
      const val = raw ? String(raw) : "Não especificado";
      if (!catCounts[val]) {
        catCounts[val] = { count: 0, farms: new Set() };
      }
      catCounts[val].count += 1;
      catCounts[val].farms.add(s.propertyName);
    });

    const entries = Object.entries(catCounts).sort((a, b) => b[1].count - a[1].count);
    const total = submissions.length;

    return (
      <div className="mt-5 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detalhamento de Categorias — {field.label}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {entries.length} categorias identificadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Categoria / Manejo</th>
                <th className="py-2.5 px-4 text-center">Registros</th>
                <th className="py-2.5 px-4 text-center">Proporção Amostral</th>
                <th className="py-2.5 px-4">Fazendas Associadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map(([label, data], idx) => {
                const pct = total > 0 ? (data.count / total) * 100 : 0;
                const color = DONUT_COLORS[idx % DONUT_COLORS.length];
                return (
                  <tr key={label} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800 tabular-nums">
                      {data.count}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-xs tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      {Array.from(data.farms).join(", ") || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // =========================================================================
  // SUB-RENDERIZADOR: BENCHMARK POR PROPRIEDADE
  // =========================================================================
  const renderBenchmarkView = () => {
    // Calculamos médias regionais para cada campo numérico
    const averages: Record<string, number> = {};
    numericFields.forEach((f) => {
      const nums = submissions
        .map((s) => Number(s.values[f.id]))
        .filter((n) => !isNaN(n) && n >= 0);
      averages[f.id] = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    });

    return (
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <h4 className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
              Matriz de Benchmarking Regional & Diagnóstico Comparativo
            </h4>
            <p className="text-xs text-emerald-900/80 mt-0.5 leading-relaxed">
              Compara o desempenho operacional e agronômico de cada propriedade rural monitorada em relação à média geral dos registros.
              Indicadores em verde mostram desempenho produtivo superior ou eficiência de custos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {uniqueProperties.map((prop) => {
            const propSubs = submissions.filter((s) => s.propertyName === prop.propertyName);
            const totalRegs = propSubs.length;

            return (
              <div
                key={prop.propertyName}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between hover:border-emerald-700/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-800 shrink-0" strokeWidth={1.75} />
                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                          {prop.propertyName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {prop.producerName} • {prop.cityState}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 tabular-nums shrink-0">
                      {totalRegs} lançamentos
                    </span>
                  </div>

                  {/* Lista de Métricas Comparadas */}
                  <div className="py-3.5 space-y-2.5">
                    {numericFields.map((field) => {
                      const vals = propSubs
                        .map((s) => Number(s.values[field.id]))
                        .filter((v) => !isNaN(v) && v >= 0);
                      const propAvg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                      const regionalAvg = averages[field.id] || 0;

                      if (propAvg === null) {
                        return (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 text-xs"
                          >
                            <span className="text-slate-500">{field.label}</span>
                            <span className="text-slate-400 font-mono text-[11px]">Sem dados</span>
                          </div>
                        );
                      }

                      const diffPct = regionalAvg > 0 ? ((propAvg - regionalAvg) / regionalAvg) * 100 : 0;
                      const isAbove = propAvg >= regionalAvg;

                      return (
                        <div
                          key={field.id}
                          className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 truncate pr-2">
                              {field.label}
                            </span>
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {formatNum(propAvg)} {field.unit || ""}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono pt-0.5 border-t border-slate-200/60">
                            <span className="text-slate-400 text-[10px]">
                              Média Reg: {formatNum(regionalAvg)} {field.unit || ""}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 font-semibold text-[10px] ${
                                isAbove ? "text-emerald-800" : "text-amber-800"
                              }`}
                            >
                              {isAbove ? (
                                <ArrowUpRight className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 text-amber-700" strokeWidth={2} />
                              )}
                              {diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Culturas reportadas pela propriedade */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Atividades:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {Array.from(
                      new Set(
                        propSubs
                          .map((s) => String(s.values["cultura"] || ""))
                          .filter(Boolean)
                      )
                    ).map((c) => (
                      <span
                        key={c}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {uniqueProperties.length === 0 && (
          <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
            Nenhuma propriedade rural registrada com submissões no escopo atual.
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-RENDERIZADOR: GRID OVERVIEW COM AGRUPAMENTO SEMÂNTICO
  // =========================================================================
  const renderGridOverview = () => {
    // Agrupamento semântico
    const scaleFields = numericFields.filter(
      (f) => f.id === "area_ha" || f.id === "producao" || f.id === "sacas_colhidas" || f.label.toLowerCase().includes("área") || f.label.toLowerCase().includes("produção")
    );
    const financeFields = numericFields.filter(
      (f) => f.id === "custo_operacao" || f.label.toLowerCase().includes("custo") || f.label.toLowerCase().includes("preço") || f.label.toLowerCase().includes("valor")
    );
    const otherNumericFields = numericFields.filter(
      (f) => !scaleFields.includes(f) && !financeFields.includes(f)
    );

    return (
      <div className="space-y-8">
        {/* Bloco 1: Escala e Produção */}
        {scaleFields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Bloco 1: Indicadores de Escala & Produção
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {scaleFields.length} métricas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {scaleFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                          {field.label}
                        </h4>
                        {field.unit && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Comparativo por propriedade e linha de referência da média regional
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleSelectField(field.id);
                        setViewMode("DEEP_DIVE");
                      }}
                      title="Explorar variável em profundidade"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <span>Focar</span>
                      <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
                    </button>
                  </div>
                  {renderBarChart(field, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloco 2: Gestão Financeira & Custos */}
        {financeFields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Bloco 2: Gestão Financeira & Dispêndios Operacionais
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {financeFields.length} métricas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {financeFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                          {field.label}
                        </h4>
                        {field.unit && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Comparativo por propriedade e linha de referência da média regional
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleSelectField(field.id);
                        setViewMode("DEEP_DIVE");
                      }}
                      title="Explorar variável em profundidade"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <span>Focar</span>
                      <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
                    </button>
                  </div>
                  {renderBarChart(field, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demais métricas numéricas */}
        {otherNumericFields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Demais Métricas Numéricas Monitoradas
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {otherNumericFields.length} métricas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {otherNumericFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                          {field.label}
                        </h4>
                        {field.unit && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Comparativo por propriedade e linha de referência da média regional
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleSelectField(field.id);
                        setViewMode("DEEP_DIVE");
                      }}
                      title="Explorar variável em profundidade"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <span>Focar</span>
                      <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
                    </button>
                  </div>
                  {renderBarChart(field, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloco 3: Variáveis Categóricas em Rosca */}
        {selectFields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Bloco 3: Distribuição Categórica & Práticas de Manejo
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {selectFields.length} variáveis qualitativas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {selectFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                        {field.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Proporção relativa sobre os registros da amostra selecionada
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleSelectField(field.id);
                        setViewMode("DEEP_DIVE");
                      }}
                      title="Explorar variável em profundidade"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <span>Focar</span>
                      <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
                    </button>
                  </div>
                  {renderDonutChart(field, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {allAnalyticFields.length === 0 && (
          <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
            Nenhuma métrica numérica ou qualitativa cadastrada no protocolo de coleta.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* ===================================================================== */}
      {/* BARRA SUPERIOR DE MODOS ANALÍTICOS (Segmented Control)                */}
      {/* ===================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Modo de Visualização:
          </span>
        </div>

        {/* Botoes de Alternancia */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("DEEP_DIVE")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentViewMode === "DEEP_DIVE"
                ? "bg-white text-emerald-950 shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
            <span>Foco por Variável (Hero)</span>
          </button>

          <button
            onClick={() => setViewMode("GRID_OVERVIEW")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentViewMode === "GRID_OVERVIEW"
                ? "bg-white text-emerald-950 shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
            <span>Visão Panorâmica</span>
          </button>

          <button
            onClick={() => setViewMode("BENCHMARK_PROPERTIES")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentViewMode === "BENCHMARK_PROPERTIES"
                ? "bg-white text-emerald-950 shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
            <span>Benchmarking por Fazenda</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODO 1: DEEP DIVE COM SELETOR HORIZONTAL + HERO CHART + TABELA        */}
      {/* ===================================================================== */}
      {currentViewMode === "DEEP_DIVE" && (
        <div className="space-y-4">
          {/* Seletor Horizontal de Variáveis em Abas/Pílulas */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Selecione a Variável para Foco Analítico:
              </span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {allAnalyticFields.length} variáveis disponíveis
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {allAnalyticFields.map((field) => {
                const isSelected = field.id === activeField?.id;
                const isNumber = field.type === "number";

                return (
                  <button
                    key={field.id}
                    onClick={() => handleSelectField(field.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                      isSelected
                        ? "bg-emerald-900 text-white border-emerald-950 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                    }`}
                  >
                    {isNumber ? (
                      <BarChart3
                        className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-800"}`}
                        strokeWidth={1.75}
                      />
                    ) : (
                      <PieChart
                        className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-800"}`}
                        strokeWidth={1.75}
                      />
                    )}
                    <span>{field.label}</span>
                    {field.unit && (
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          isSelected
                            ? "bg-emerald-950/80 text-emerald-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {field.unit}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Hero da Variável Ativa */}
          {activeField && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {activeField.label}
                    </h3>
                    {activeField.unit && (
                      <span className="px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-800 rounded border border-slate-200">
                        Unidade: {activeField.unit}
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                      {activeField.type === "number" ? "Quantitativo Contínuo" : "Categórico Qualitativo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeField.type === "number"
                      ? "Distribuição das propriedades rurais em relação à linha média regional com detalhamento individual."
                      : "Distribuição proporcional e participação percentual sobre o total de registros coletados."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
                    n = {submissions.length} registros
                  </span>
                </div>
              </div>

              {/* Gráfico Hero */}
              <div className="mt-2">
                {activeField.type === "number"
                  ? renderBarChart(activeField, true)
                  : renderDonutChart(activeField, true)}
              </div>

              {/* Tabela de Ranking e Auditoria Relacionada */}
              {renderHeroTable(activeField)}
            </div>
          )}

          {allAnalyticFields.length === 0 && (
            <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Nenhuma variável analítica cadastrada no protocolo de coleta.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODO 2: GRID OVERVIEW COM AGRUPAMENTO SEMÂNTICO                       */}
      {/* ===================================================================== */}
      {currentViewMode === "GRID_OVERVIEW" && renderGridOverview()}

      {/* ===================================================================== */}
      {/* MODO 3: BENCHMARKING POR PROPRIEDADE RURAL                            */}
      {/* ===================================================================== */}
      {currentViewMode === "BENCHMARK_PROPERTIES" && renderBenchmarkView()}
    </div>
  );
}
