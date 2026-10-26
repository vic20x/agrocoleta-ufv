"use client";

import React, { useState } from "react";
import { CollectionField, FarmSubmission } from "@/types/producer";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

interface AnalyticalChartsProps {
  fields: CollectionField[];
  submissions: FarmSubmission[];
}

const DONUT_COLORS = [
  "#065F46", // emerald-800
  "#0F172A", // slate-900
  "#0D9488", // teal-600
  "#2563EB", // blue-600
  "#D97706", // amber-600
  "#64748B", // slate-500
  "#4F46E5", // indigo-600
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

export function AnalyticalCharts({ fields, submissions }: AnalyticalChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<{
    fieldId: string;
    idx: number;
  } | null>(null);

  const numericFields = fields.filter((f) => f.type === "number");
  const selectFields = fields.filter((f) => f.type === "select");

  return (
    <div className="space-y-6">
      {/* Seção 1: Gráficos de Colunas Verticais / Barras Comparativas em SVG */}
      {numericFields.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Análise Quantitativa & Comparativo Regional (SVG)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {numericFields.length} variáveis numéricas monitoradas
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {numericFields.map((field) => {
              const points = submissions
                .map((s) => {
                  const raw = s.values[field.id];
                  const hasValue =
                    raw !== undefined && raw !== null && String(raw).trim() !== "";
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
              const minVal = count > 0 ? Math.min(...points.map((p) => p.val)) : 0;
              const maxVal = count > 0 ? Math.max(...points.map((p) => p.val)) : 0;

              // Escala superior arredondada para o eixo Y
              const yMax = maxVal > 0 ? maxVal * 1.22 : 10;

              // Dimensões dinâmicas do SVG para evitar compressão quando houver > 8 lançamentos
              const svgWidth = Math.max(540, count * 66 + 72);
              const svgHeight = 236;
              const padLeft = 52;
              const padRight = 20;
              const padTop = 28;
              const padBottom = 46;
              const plotW = svgWidth - padLeft - padRight;
              const plotH = svgHeight - padTop - padBottom;

              const gridTicks = [0, 0.25, 0.5, 0.75, 1];
              const avgY =
                yMax > 0
                  ? Math.min(
                      padTop + plotH,
                      Math.max(padTop, padTop + plotH - (avgVal / yMax) * plotH)
                    )
                  : padTop + plotH;

              const avgLabel = `Média: ${formatNum(avgVal)}${field.unit ? ` ${field.unit}` : ""}`;
              const avgBadgeWidth = Math.max(96, avgLabel.length * 5.8 + 14);

              return (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  {/* Cabeçalho do Card */}
                  <div>
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

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70 tabular-nums shrink-0">
                        <TrendingUp className="w-3 h-3" strokeWidth={1.75} />
                        n = {count}
                      </span>
                    </div>

                    {/* Badges de Métricas: Soma Total, Média, Mínimo e Máximo */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
                      <div className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/70">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">
                          Soma Total
                        </span>
                        <span className="text-xs font-semibold text-slate-900 font-mono tabular-nums mt-0.5 block truncate">
                          {formatNum(sumVal)}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {field.unit || ""}
                          </span>
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/70">
                        <span className="text-[10px] uppercase font-mono text-emerald-800 block">
                          Média Reg.
                        </span>
                        <span className="text-xs font-semibold text-emerald-950 font-mono tabular-nums mt-0.5 block truncate">
                          {formatNum(avgVal)}{" "}
                          <span className="text-[10px] font-normal text-emerald-700">
                            {field.unit || ""}
                          </span>
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/70">
                        <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-0.5">
                          <ArrowDownRight className="w-2.5 h-2.5 text-slate-400" strokeWidth={1.75} />
                          Mínimo
                        </span>
                        <span className="text-xs font-semibold text-slate-800 font-mono tabular-nums mt-0.5 block truncate">
                          {formatNum(minVal)}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/70">
                        <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5 text-emerald-700" strokeWidth={1.75} />
                          Máximo
                        </span>
                        <span className="text-xs font-semibold text-slate-800 font-mono tabular-nums mt-0.5 block truncate">
                          {formatNum(maxVal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico Vetorial SVG */}
                  {count === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                      <Activity className="w-5 h-5 mb-1.5 text-slate-300" strokeWidth={1.75} />
                      <span>Sem dados numéricos registrados para {field.label}.</span>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <div className="overflow-x-auto pb-1">
                        <svg
                          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                          style={{ minWidth: svgWidth > 540 ? `${svgWidth}px` : undefined }}
                          className="w-full h-auto overflow-visible select-none"
                          role="img"
                          aria-label={`Gráfico de barras para ${field.label}`}
                        >
                          {/* Linhas de Grade Horizontais Tracejadas e Eixo Y */}
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

                          {/* Colunas Verticais Proporcionais */}
                          {points.map((pt, idx) => {
                            const slotW = plotW / points.length;
                            const barW = Math.min(44, Math.max(18, slotW * 0.56));
                            const x = padLeft + idx * slotW + (slotW - barW) / 2;
                            const rawBarH = yMax > 0 ? (pt.val / yMax) * plotH : 0;
                            const barH = Math.min(plotH, Math.max(4, rawBarH));
                            const y = padTop + plotH - barH;
                            const isAboveAvg = pt.val >= avgVal;
                            const isHovered =
                              hoveredBar?.fieldId === field.id && hoveredBar?.idx === idx;

                            const maxChars = slotW < 75 ? 9 : 13;
                            const shortProp =
                              pt.property.length > maxChars
                                ? pt.property.slice(0, maxChars - 1) + "…"
                                : pt.property;

                            return (
                              <g
                                key={pt.id + "-" + idx}
                                className="group cursor-pointer"
                                onMouseEnter={() =>
                                  setHoveredBar({ fieldId: field.id, idx })
                                }
                                onMouseLeave={() => setHoveredBar(null)}
                              >
                                <title>
                                  {`${pt.property} (${pt.fullName}) — ${formatNum(pt.val)} ${
                                    field.unit || ""
                                  }`}
                                </title>

                                {/* Sombra / Fundo do Slot no Hover */}
                                <rect
                                  x={padLeft + idx * slotW + 2}
                                  y={padTop}
                                  width={slotW - 4}
                                  height={plotH}
                                  rx={4}
                                  fill={isHovered ? "#F1F5F9" : "transparent"}
                                  className="transition-colors"
                                />

                                {/* Barra Principal */}
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={barH}
                                  rx={4}
                                  fill={isAboveAvg ? "#065F46" : "#334155"}
                                  className="transition-opacity duration-200 group-hover:opacity-90"
                                />

                                {/* Topo sutil de destaque na barra */}
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={Math.min(3, barH)}
                                  rx={1.5}
                                  fill={isAboveAvg ? "#10B981" : "#64748B"}
                                />

                                {/* Rótulo de Valor Numérico no Topo da Barra */}
                                <text
                                  x={x + barW / 2}
                                  y={y - 6}
                                  textAnchor="middle"
                                  className="fill-slate-800 font-mono text-[10px] font-semibold tabular-nums"
                                >
                                  {formatNum(pt.val)}
                                </text>

                                {/* Rótulo Eixo X: Nome do Produtor */}
                                <text
                                  x={x + barW / 2}
                                  y={padTop + plotH + 15}
                                  textAnchor="middle"
                                  className="fill-slate-700 font-sans text-[10px] font-medium"
                                >
                                  {pt.producer}
                                </text>

                                {/* Sub-rótulo Eixo X: Propriedade */}
                                <text
                                  x={x + barW / 2}
                                  y={padTop + plotH + 27}
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
                                height={15}
                                rx={3}
                                fill="#FEF3C7"
                                stroke="#F59E0B"
                                strokeWidth={0.75}
                              />
                              <text
                                x={svgWidth - padRight - avgBadgeWidth / 2}
                                y={Math.max(14, avgY - 7)}
                                textAnchor="middle"
                                className="fill-amber-900 font-mono text-[8.5px] font-semibold tabular-nums"
                              >
                                {avgLabel}
                              </text>
                            </g>
                          )}

                          {/* Tooltip Vetorial no Hover */}
                          {hoveredBar?.fieldId === field.id &&
                            points[hoveredBar.idx] &&
                            (() => {
                              const pt = points[hoveredBar.idx];
                              const slotW = plotW / points.length;
                              const centerX =
                                padLeft + hoveredBar.idx * slotW + slotW / 2;
                              const ttW = 164;
                              const ttH = 42;
                              const ttX = Math.min(
                                svgWidth - padRight - ttW,
                                Math.max(padLeft, centerX - ttW / 2)
                              );
                              const ttY = 4;

                              return (
                                <g className="pointer-events-none">
                                  <rect
                                    x={ttX}
                                    y={ttY}
                                    width={ttW}
                                    height={ttH}
                                    rx={5}
                                    fill="#0F172A"
                                    stroke="#334155"
                                    strokeWidth={1}
                                  />
                                  <text
                                    x={ttX + 8}
                                    y={ttY + 15}
                                    className="fill-white font-sans text-[9.5px] font-semibold"
                                  >
                                    {pt.property.length > 22
                                      ? pt.property.slice(0, 21) + "…"
                                      : pt.property}
                                  </text>
                                  <text
                                    x={ttX + 8}
                                    y={ttY + 30}
                                    className="fill-emerald-300 font-mono text-[9.5px] font-semibold tabular-nums"
                                  >
                                    {formatNum(pt.val)} {field.unit || ""} • {pt.producer}
                                  </text>
                                </g>
                              );
                            })()}
                        </svg>
                      </div>

                      {/* Rodapé / Legenda Técnica do Gráfico */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
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
            })}
          </div>
        </div>
      )}

      {/* Seção 2: Gráficos Donut (Rosca) em SVG para Campos Categóricos */}
      {selectFields.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Distribuição de Culturas & Operações de Manejo (Donut SVG)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {selectFields.length} variáveis categóricas
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {selectFields.map((field) => {
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

              // Geometria do Anel Donut SVG
              const size = 168;
              const cx = size / 2;
              const cy = size / 2;
              const radius = 58;
              const strokeWidth = 20;
              const circumference = 2 * Math.PI * radius;

              let accumulatedPct = 0;

              return (
                <div
                  key={field.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                        {field.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Proporção relativa sobre os registros da amostra selecionada
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 tabular-nums shrink-0">
                      {entries.length} categorias
                    </span>
                  </div>

                  {total === 0 ? (
                    <div className="h-40 flex items-center justify-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                      Nenhum registro para calcular distribuição.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Donut SVG à Esquerda */}
                      <div className="sm:col-span-5 flex items-center justify-center">
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
                            const dashLen = Math.max(
                              0,
                              pct * circumference - (entries.length > 1 ? 2 : 0)
                            );
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
                            className="fill-slate-900 font-mono text-xl font-bold tabular-nums"
                          >
                            {total}
                          </text>
                          <text
                            x={cx}
                            y={cy + 13}
                            textAnchor="middle"
                            className="fill-slate-400 font-mono text-[9px] uppercase tracking-wider"
                          >
                            Registros
                          </text>
                        </svg>
                      </div>

                      {/* Legenda Lateral Detalhada com Barras Horizontais de Precisão à Direita */}
                      <div className="sm:col-span-7 space-y-2">
                        {entries.map(([label, count], idx) => {
                          const numPct = (count / total) * 100;
                          const pct = numPct.toFixed(1);
                          const color = DONUT_COLORS[idx % DONUT_COLORS.length];
                          return (
                            <div
                              key={label}
                              className="p-2 rounded-lg bg-[#F8FAFC] border border-slate-200/70 text-xs space-y-1.5"
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
                                  <span className="text-slate-500 text-[11px]">{count} un.</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-semibold text-[11px]">
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}

