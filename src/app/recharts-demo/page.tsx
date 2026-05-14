"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { animate } from "motion";

// --- Static datasets ---

const datasets = {
  revenue: {
    label: "Monthly Revenue",
    color: "#6366f1",
    data: [
      { name: "Jan", value: 4000 },
      { name: "Feb", value: 3200 },
      { name: "Mar", value: 5800 },
      { name: "Apr", value: 4900 },
      { name: "May", value: 6200 },
      { name: "Jun", value: 5100 },
      { name: "Jul", value: 7400 },
      { name: "Aug", value: 6800 },
      { name: "Sep", value: 8200 },
      { name: "Oct", value: 7100 },
      { name: "Nov", value: 9500 },
      { name: "Dec", value: 8800 },
    ],
  },
  users: {
    label: "Active Users",
    color: "#f43f5e",
    data: [
      { name: "Jan", value: 120 },
      { name: "Feb", value: 180 },
      { name: "Mar", value: 150 },
      { name: "Apr", value: 310 },
      { name: "May", value: 280 },
      { name: "Jun", value: 450 },
      { name: "Jul", value: 390 },
      { name: "Aug", value: 520 },
      { name: "Sep", value: 480 },
      { name: "Oct", value: 610 },
      { name: "Nov", value: 570 },
      { name: "Dec", value: 720 },
    ],
  },
  temperature: {
    label: "Avg Temperature (°F)",
    color: "#f59e0b",
    data: [
      { name: "Jan", value: 32 },
      { name: "Feb", value: 35 },
      { name: "Mar", value: 45 },
      { name: "Apr", value: 58 },
      { name: "May", value: 68 },
      { name: "Jun", value: 78 },
      { name: "Jul", value: 85 },
      { name: "Aug", value: 83 },
      { name: "Sep", value: 74 },
      { name: "Oct", value: 60 },
      { name: "Nov", value: 45 },
      { name: "Dec", value: 34 },
    ],
  },
};

type DatasetKey = keyof typeof datasets;

const curveTypes = [
  "monotone",
  "linear",
  "basis",
  "natural",
  "step",
  "stepBefore",
  "stepAfter",
] as const;

type CurveType = (typeof curveTypes)[number];

// --- Hooks ---

function useAnimatedData(targetData: { name: string; value: number }[]) {
  const [displayData, setDisplayData] = useState(targetData);
  const [yDomain, setYDomain] = useState<[number, number]>([0, 0]);
  const prevDataRef = useRef(targetData);

  useEffect(() => {
    const from = prevDataRef.current;
    const to = targetData;
    prevDataRef.current = targetData;

    const allValues = [...from.map((d) => d.value), ...to.map((d) => d.value)];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    setYDomain([Math.floor(min - padding), Math.ceil(max + padding)]);

    const controls = animate(0, 1, {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (progress) => {
        setDisplayData(
          to.map((point, i) => ({
            name: point.name,
            value: Math.round(
              (from[i]?.value ?? 0) + (point.value - (from[i]?.value ?? 0)) * progress
            ),
          }))
        );
      },
    });

    return () => controls.stop();
  }, [targetData]);

  return { displayData, yDomain };
}

const MAX_POINTS = 60;

const stocks: Record<string, { label: string; base: number; volatility: number; color: string }> = {
  AAPL: { label: "AAPL", base: 189, volatility: 1.2, color: "#6366f1" },
  TSLA: { label: "TSLA", base: 245, volatility: 3.5, color: "#f43f5e" },
  NVDA: { label: "NVDA", base: 875, volatility: 8, color: "#22c55e" },
};

type StockKey = keyof typeof stocks;

function generateInitialPrices(stock: (typeof stocks)[StockKey]) {
  const points: { idx: number; value: number }[] = [];
  let price = stock.base;
  for (let i = 0; i < MAX_POINTS; i++) {
    price += (Math.random() - 0.48) * stock.volatility;
    price = Math.max(price * 0.95, Math.min(price, price * 1.05));
    points.push({ idx: i, value: parseFloat(price.toFixed(2)) });
  }
  return points;
}

function useStreamingStock(stockKey: StockKey, isActive: boolean, speed: number) {
  const stock = stocks[stockKey];
  const [data, setData] = useState(() => generateInitialPrices(stock));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastPriceRef = useRef(data[data.length - 1].value);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  // Morph to new stock data on stock change
  useEffect(() => {
    const fresh = generateInitialPrices(stock);
    const target = fresh;

    setIsTransitioning(true);
    animRef.current?.stop();

    setData((prev) => {
      const from = prev;
      animRef.current = animate(0, 1, {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        onUpdate: (progress) => {
          setData(
            target.map((point, i) => ({
              idx: point.idx,
              value: parseFloat(
                (
                  (from[i]?.value ?? point.value) +
                  (point.value - (from[i]?.value ?? point.value)) * progress
                ).toFixed(2)
              ),
            }))
          );
        },
        onComplete: () => {
          lastPriceRef.current = target[target.length - 1].value;
          setData(target);
          setIsTransitioning(false);
        },
      });

      return prev; // don't update yet, animation handles it
    });

    return () => animRef.current?.stop();
  }, [stockKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stream new ticks (paused during transition)
  useEffect(() => {
    if (!isActive || isTransitioning) return;

    const interval = setInterval(() => {
      setData((prev) => {
        const last = lastPriceRef.current;
        const next = parseFloat(
          (last + (Math.random() - 0.48) * stock.volatility).toFixed(2)
        );
        lastPriceRef.current = next;
        const lastIdx = prev[prev.length - 1].idx;
        const updated = [...prev.slice(1), { idx: lastIdx + 1, value: next }];
        return updated;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, isTransitioning, stock, speed]);

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.15;
  const yDomain: [number, number] = [
    parseFloat((min - padding).toFixed(2)),
    parseFloat((max + padding).toFixed(2)),
  ];

  const currentPrice = data[data.length - 1].value;
  const startPrice = data[0].value;
  const change = currentPrice - startPrice;
  const changePct = ((change / startPrice) * 100).toFixed(2);

  return { data, yDomain, currentPrice, change, changePct };
}

// --- Components ---

type Mode = "static" | "streaming";

export default function RechartsDemo() {
  const [mode, setMode] = useState<Mode>("static");
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>("revenue");
  const [curveType, setCurveType] = useState<CurveType>("monotone");
  const [selectedStock, setSelectedStock] = useState<StockKey>("AAPL");
  const [speed, setSpeed] = useState(200);

  const current = datasets[selectedDataset];
  const { displayData: animatedData, yDomain } = useAnimatedData(current.data);

  const { data: stockData, yDomain: stockYDomain, currentPrice, change, changePct } =
    useStreamingStock(selectedStock, mode === "streaming", speed);

  const stock = stocks[selectedStock];
  const isUp = change >= 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Recharts Demo</h1>

      <div className="flex gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
        <button
          onClick={() => setMode("static")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "static" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Static
        </button>
        <button
          onClick={() => setMode("streaming")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "streaming" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Live Stock
        </button>
      </div>

      {mode === "static" ? (
        <>
          <div className="flex gap-4">
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as DatasetKey)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(datasets).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={curveType}
              onChange={(e) => setCurveType(e.target.value as CurveType)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {curveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full max-w-3xl h-[400px] bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={animatedData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={current.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={current.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} domain={yDomain} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type={curveType}
                  dataKey="value"
                  stroke={current.color}
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={{ fill: current.color, r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-4 items-center">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value as StockKey)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(stocks).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={100}>Fast (100ms)</option>
              <option value={200}>Normal (200ms)</option>
              <option value={500}>Slow (500ms)</option>
              <option value={1000}>Very Slow (1s)</option>
            </select>

            <div className="flex items-baseline gap-3 ml-4">
              <span className="text-xl font-mono font-semibold">${currentPrice.toFixed(2)}</span>
              <span
                className={`text-sm font-mono ${isUp ? "text-emerald-400" : "text-red-400"}`}
              >
                {isUp ? "+" : ""}
                {change.toFixed(2)} ({isUp ? "+" : ""}
                {changePct}%)
              </span>
            </div>
          </div>

          <div className="w-full max-w-3xl h-[400px] bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isUp ? "#22c55e" : "#ef4444"}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={isUp ? "#22c55e" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="idx" hide />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  domain={stockYDomain}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, stock.label]}
                  labelFormatter={() => ""}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isUp ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fill="url(#stockGradient)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
