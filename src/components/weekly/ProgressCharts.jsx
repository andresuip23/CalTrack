import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

const RANGES = [7, 14, 30];
const fmt1 = (n) => Math.round(Number(n) * 10) / 10;

function buildDays(todayStr, count, logsByDate) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(y, m - 1, d - i);
    const key = dt.toLocaleDateString('en-CA');
    const log = logsByDate[key] || {};
    const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null);
    const pos = (v) => (num(v) != null && v > 0 ? v : null);

    days.push({
      key,
      dayNum: dt.getDate(),
      weekday: dt.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
      full: dt.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }),
      calories: pos(log.calories),
      protein: pos(log.protein),
      carbs: num(log.carbs),
      fats: num(log.fats),
      weight: pos(log.weight),
      burned: pos(log.burned),
      minutes: pos(log.exerciseMinutes),
    });
  }
  return days;
}

function StatCard({ label, value, hint, tone = 'text-slate-100' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function DayDetail({ day }) {
  if (!day) {
    return <p className="text-xs text-slate-500">Toca un día del gráfico para ver el detalle.</p>;
  }
  return (
    <div className="text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
      <p className="font-semibold text-slate-200 capitalize">{day.full}</p>
      {day.calories == null ? (
        <p className="text-slate-500">Sin comidas registradas</p>
      ) : (
        <p className="text-slate-300">
          {Math.round(day.calories)} kcal
          {day.protein != null && ` | P: ${fmt1(day.protein)}g`}
          {day.carbs != null && ` | C: ${fmt1(day.carbs)}g`}
          {day.fats != null && ` | G: ${fmt1(day.fats)}g`}
        </p>
      )}
      {day.burned != null && (
        <p className="text-slate-300">
          Ejercicio: {Math.round(day.burned)} kcal quemadas
          {day.minutes != null && ` en ${Math.round(day.minutes)} min`}
        </p>
      )}
      {day.weight != null && <p className="text-slate-300">Peso: {fmt1(day.weight)} kg</p>}
    </div>
  );
}

const W = 360;
const H = 200;
const PAD = { l: 38, r: 8, t: 10, b: 24 };
const INNER_W = W - PAD.l - PAD.r;
const INNER_H = H - PAD.t - PAD.b;

function XLabels({ days, step }) {
  const n = days.length;
  return days.map((d, i) => {
    const show = n <= 14 || (n - 1 - i) % 5 === 0;
    if (!show) return null;
    const cx = PAD.l + step * i + step / 2;
    return (
      <text key={d.key} x={cx} y={H - 8} textAnchor="middle" fontSize="9" className="fill-slate-500">
        {n <= 7 ? d.weekday : d.dayNum}
      </text>
    );
  });
}

function BarChart({ days, valueKey, goal, colorFor, selectedKey, onSelect }) {
  const n = days.length;
  const step = INNER_W / n;
  const barW = Math.min(step * 0.62, 28);
  const values = days.map((d) => d[valueKey]).filter((v) => v != null);
  const maxVal = Math.max(goal || 0, ...values, 1) * 1.15;
  const y = (v) => PAD.t + INNER_H - (v / maxVal) * INNER_H;
  const baseline = PAD.t + INNER_H;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxVal);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-slate-800" strokeWidth="1" />
          <text x={PAD.l - 5} y={y(t) + 3} textAnchor="end" fontSize="9" className="fill-slate-500">
            {Math.round(t)}
          </text>
        </g>
      ))}

      {days.map((d, i) => {
        const v = d[valueKey];
        const cx = PAD.l + step * i + step / 2;
        const dim = selectedKey && selectedKey !== d.key;
        return (
          <g key={d.key}>
            {v != null && (
              <rect
                x={cx - barW / 2}
                y={y(v)}
                width={barW}
                height={Math.max(baseline - y(v), 1)}
                rx="2"
                className={colorFor(v)}
                opacity={dim ? 0.45 : 1}
              />
            )}
            <rect
              x={PAD.l + step * i}
              y={PAD.t}
              width={step}
              height={INNER_H}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(d.key === selectedKey ? null : d.key)}
            />
          </g>
        );
      })}

      {goal > 0 && (
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={y(goal)}
          y2={y(goal)}
          className="stroke-sky-400"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      <XLabels days={days} step={step} />
    </svg>
  );
}

function WeightChart({ days, selectedKey, onSelect }) {
  const n = days.length;
  const step = INNER_W / n;
  const pts = days.map((d, i) => ({ d, i })).filter((p) => p.d.weight != null);

  if (pts.length === 0) {
    return <p className="text-center text-sm text-slate-500 py-8">Aún no hay registros de peso en este rango.</p>;
  }

  const ws = pts.map((p) => p.d.weight);
  let minW = Math.min(...ws) - 0.5;
  let maxW = Math.max(...ws) + 0.5;
  if (maxW - minW < 2) {
    minW -= 0.5;
    maxW += 0.5;
  }
  const x = (i) => PAD.l + step * i + step / 2;
  const y = (v) => PAD.t + INNER_H - ((v - minW) / (maxW - minW)) * INNER_H;
  const ticks = [minW, (minW + maxW) / 2, maxW];
  const path = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${x(p.i)},${y(p.d.weight)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-slate-800" strokeWidth="1" />
          <text x={PAD.l - 5} y={y(t) + 3} textAnchor="end" fontSize="9" className="fill-slate-500">
            {fmt1(t)}
          </text>
        </g>
      ))}

      {pts.length > 1 && (
        <path d={path} fill="none" className="stroke-emerald-400" strokeWidth="2" strokeLinejoin="round" />
      )}

      {pts.map((p) => (
        <circle
          key={p.d.key}
          cx={x(p.i)}
          cy={y(p.d.weight)}
          r={selectedKey === p.d.key ? 5 : 3.5}
          className="fill-emerald-400 stroke-slate-950"
          strokeWidth="1.5"
        />
      ))}

      {days.map((d, i) => (
        <rect
          key={d.key}
          x={PAD.l + step * i}
          y={PAD.t}
          width={step}
          height={INNER_H}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(d.key === selectedKey ? null : d.key)}
        />
      ))}

      <XLabels days={days} step={step} />
    </svg>
  );
}

export function ProgressCharts() {
  const { weeklyLogs, loadingSummaries, goals, todayStr } = useApp();
  const [range, setRange] = useState(7);
  const [selectedKey, setSelectedKey] = useState(null);

  const days = useMemo(() => {
    const byDate = {};
    weeklyLogs.forEach((log) => {
      byDate[log.id] = log;
    });
    return buildDays(todayStr, range, byDate);
  }, [weeklyLogs, todayStr, range]);

  if (loadingSummaries) {
    return <p className="text-center text-xs text-slate-500 py-4">Cargando progreso...</p>;
  }

  const selectedDay = days.find((d) => d.key === selectedKey) || null;

  const calDays = days.filter((d) => d.calories != null);
  const avgCal = calDays.length
    ? calDays.reduce((sum, d) => sum + d.calories, 0) / calDays.length
    : null;
  const diff = avgCal != null && goals.calories ? avgCal - goals.calories : null;

  const weights = days.filter((d) => d.weight != null);
  const weightChange =
    weights.length >= 2 ? weights[weights.length - 1].weight - weights[0].weight : null;

  const hasProtein = days.some((d) => d.protein != null);

  const trainedDays = days.filter((d) => d.burned != null);
  const totalBurned = trainedDays.reduce((sum, d) => sum + d.burned, 0);

  const calColor = (v) =>
    v > goals.calories * 1.05 ? 'fill-amber-400' : 'fill-emerald-500';
  const protColor = (v) =>
    v >= goals.protein * 0.9 ? 'fill-emerald-500' : 'fill-slate-500';
  const burnColor = () => 'fill-violet-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Tu progreso</h2>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={
                'px-3 py-1 rounded-full text-xs font-medium transition-colors ' +
                (range === r ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200')
              }
            >
              {r} días
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Promedio diario"
          value={avgCal != null ? `${Math.round(avgCal)} kcal` : '—'}
          hint={goals.calories ? `Meta base: ${goals.calories} kcal` : undefined}
        />
        <StatCard
          label="Frente a tu meta base"
          value={diff != null ? `${diff > 0 ? '+' : ''}${Math.round(diff)} kcal` : '—'}
          hint="Promedio menos meta"
          tone={diff == null ? 'text-slate-100' : diff > goals.calories * 0.05 ? 'text-amber-400' : 'text-emerald-400'}
        />
        <StatCard label="Días registrados" value={`${calDays.length}/${range}`} />
        <StatCard
          label="Cambio de peso"
          value={weightChange != null ? `${weightChange > 0 ? '+' : ''}${fmt1(weightChange)} kg` : '—'}
          hint={weights.length < 2 ? 'Faltan registros' : undefined}
        />
        <StatCard label="Días entrenados" value={`${trainedDays.length}/${range}`} />
        <StatCard
          label="Kcal quemadas"
          value={totalBurned > 0 ? `${Math.round(totalBurned)}` : '—'}
          hint="Total en el rango"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100">Calorías por día</h3>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed border-sky-400" /> Meta base
          </span>
        </div>
        {calDays.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            Aún no hay comidas registradas en este rango.
          </p>
        ) : (
          <BarChart
            days={days}
            valueKey="calories"
            goal={goals.calories}
            colorFor={calColor}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        )}
        <p className="text-xs text-slate-500">
          Verde: dentro de tu meta base. Ámbar: más de 5% por encima. Los días que entrenas, tu meta real es más alta.
        </p>
        <DayDetail day={selectedDay} />
      </div>

      {trainedDays.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-slate-100">Calorías quemadas por ejercicio</h3>
          <BarChart
            days={days}
            valueKey="burned"
            goal={0}
            colorFor={burnColor}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          <DayDetail day={selectedDay} />
        </div>
      )}

      {hasProtein && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100">Proteína por día (g)</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-4 border-t-2 border-dashed border-sky-400" /> Meta
            </span>
          </div>
          <BarChart
            days={days}
            valueKey="protein"
            goal={goals.protein}
            colorFor={protColor}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          <p className="text-xs text-slate-500">Verde: llegaste al 90% de tu meta o más.</p>
          <DayDetail day={selectedDay} />
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-slate-100">Evolución del peso (kg)</h3>
        <WeightChart days={days} selectedKey={selectedKey} onSelect={setSelectedKey} />
        <DayDetail day={selectedDay} />
      </div>
    </div>
  );
}