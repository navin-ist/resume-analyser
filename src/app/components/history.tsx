import { Clock, Trash2, ChevronRight, Briefcase, Star } from "lucide-react";
import type { AnalysisResult } from "./analyzer";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  resumeSnippet: string;
  result: AnalysisResult;
}

export function getUserHistory(userId: string): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(`rz_history_${userId}`) || "[]"); } catch { return []; }
}

export function saveToHistory(userId: string, resumeText: string, result: AnalysisResult) {
  const history = getUserHistory(userId);
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    resumeSnippet: resumeText.slice(0, 120).trim() + (resumeText.length > 120 ? "…" : ""),
    result,
  };
  const updated = [entry, ...history].slice(0, 10);
  localStorage.setItem(`rz_history_${userId}`, JSON.stringify(updated));
  return updated;
}

export function deleteFromHistory(userId: string, id: string): HistoryEntry[] {
  const history = getUserHistory(userId).filter(e => e.id !== id);
  localStorage.setItem(`rz_history_${userId}`, JSON.stringify(history));
  return history;
}

const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-600 bg-emerald-50" :
  s >= 60 ? "text-amber-600 bg-amber-50" :
  "text-rose-600 bg-rose-50";

const matchColor = (s: number) =>
  s >= 75 ? "bg-emerald-500" :
  s >= 50 ? "bg-amber-500" :
  "bg-rose-500";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ history, onSelect, onDelete }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm">No analyses yet. Paste a resume and hit Analyze!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map(entry => (
        <div
          key={entry.id}
          className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer group"
          onClick={() => onSelect(entry)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {entry.result.jobTitle && (
                  <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md" style={{ fontWeight: 600 }}>
                    <Briefcase className="w-3 h-3" /> {entry.result.jobTitle}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${scoreColor(entry.result.score)}`} style={{ fontWeight: 600 }}>
                  <Star className="w-3 h-3" /> Score: {entry.result.score}
                </span>
                {entry.result.jobMatch !== null && (
                  <span className="text-xs text-slate-500">
                    Match: <span style={{ fontWeight: 600 }}>{entry.result.jobMatch}%</span>
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs truncate">{entry.resumeSnippet}</p>
              <p className="text-slate-400 text-xs mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
              {entry.result.jobMatch !== null && (
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${matchColor(entry.result.jobMatch)} transition-all`}
                    style={{ width: `${entry.result.jobMatch}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
