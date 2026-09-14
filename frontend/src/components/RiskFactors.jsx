import React from "react";
import { ShieldAlert, Server, Globe2, Scale, Percent } from "lucide-react";

export default function RiskFactors({ riskFactors }) {
  if (!riskFactors) return null;

  const categories = [
    {
      title: "Operational & Supply Chain",
      icon: Server,
      color: "text-blue-400",
      border: "border-blue-500/20",
      items: riskFactors.operational_risks || [],
    },
    {
      title: "Market & Macroeconomic",
      icon: Globe2,
      color: "text-amber-400",
      border: "border-amber-500/20",
      items: riskFactors.market_macro_risks || [],
    },
    {
      title: "Regulatory & Geopolitical",
      icon: Scale,
      color: "text-purple-400",
      border: "border-purple-500/20",
      items: riskFactors.regulatory_risks || [],
    },
    {
      title: "Valuation & Multiple Risk",
      icon: Percent,
      color: "text-rose-400",
      border: "border-rose-500/20",
      items: riskFactors.valuation_risks || [],
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Key Risk Factors & Sensitivities
        </h3>
        <p className="text-xs text-slate-400">
          Identified structural and operational risks supported by available corporate data and filings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-950/60 p-4 rounded-xl border ${cat.border} flex flex-col`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Icon className={`w-4 h-4 ${cat.color}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {cat.title}
                </h4>
              </div>
              <ul className="space-y-2 flex-1">
                {cat.items.length > 0 ? (
                  cat.items.map((risk, rIdx) => (
                    <li
                      key={rIdx}
                      className="text-xs leading-relaxed text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500 italic">No specific risks highlighted.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
