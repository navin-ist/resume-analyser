import { useState, useEffect } from "react";
import {
  Sparkles, LogOut, Clock, FileText, ChevronDown, ChevronUp,
  Briefcase, TrendingUp, CheckCircle, AlertCircle, Zap, Target, Award, Loader
} from "lucide-react";
import { AuthModal, getCurrentUser, setCurrentUser, type AppUser } from "./components/auth";
import { analyzeResumeWithAI, type AnalysisResult } from "./components/analyzer";
import { HistoryPanel, getUserHistory, saveToHistory, deleteFromHistory, type HistoryEntry } from "./components/history";

// ─── Score helpers ────────────────────────────────────────────────────────────
const scoreStyle = (s: number) =>
  s >= 80 ? { ring: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100", label: "Excellent", lc: "text-emerald-600" } :
  s >= 60 ? { ring: "text-amber-500",   bg: "bg-amber-50 border-amber-100",     label: "Good",      lc: "text-amber-600"   } :
            { ring: "text-rose-500",    bg: "bg-rose-50 border-rose-100",        label: "Needs Work",lc: "text-rose-600"    };

const matchBarColor = (p: number) =>
  p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500";

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ icon, title, accent, children }: {
  icon: React.ReactNode; title: string; accent: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-slate-800 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
        <span className={`w-7 h-7 ${accent} rounded-lg flex items-center justify-center`}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-3 py-1.5 rounded-lg text-sm ${color} border`} style={{ fontWeight: 500 }}>
      {label}
    </span>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────
function ResultView({ result }: { result: AnalysisResult }) {
  const sc = scoreStyle(result.score);

  return (
    <div className="flex flex-col gap-5 mt-2">
      {/* AI Method Badge */}
      {result.isAIPowered !== undefined && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-fit ${
          result.isAIPowered
            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            : 'bg-amber-50 border border-amber-200 text-amber-700'
        }`} style={{ fontWeight: 500 }}>
          <Sparkles className="w-4 h-4" />
          {result.isAIPowered ? 'AI-Powered Analysis' : 'Quick Analysis (Fallback)'}
        </div>
      )}

      {/* Score + Job Match row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Score card */}
        <div className={`rounded-2xl border shadow-sm p-6 flex flex-col items-center text-center ${sc.bg}`}>
          <p className="text-slate-500 text-sm mb-3" style={{ fontWeight: 500 }}>Resume Score</p>
          <div className="relative w-28 h-28 mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor"
                strokeWidth="3" strokeDasharray={`${result.score}, 100`} strokeLinecap="round"
                className={sc.ring} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl ${sc.ring}`} style={{ fontWeight: 700 }}>{result.score}</span>
              <span className="text-slate-400 text-xs">/100</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${sc.lc} bg-white border`} style={{ fontWeight: 600 }}>
            {sc.label}
          </span>
        </div>

        {/* Job Match card */}
        {result.jobMatch !== null ? (
          <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-6 flex flex-col justify-between">
            <p className="text-slate-500 text-sm" style={{ fontWeight: 500 }}>Job Match</p>
            <div className="flex flex-col items-center my-3">
              <span className={`text-5xl ${matchBarColor(result.jobMatch).replace("bg-", "text-")}`} style={{ fontWeight: 700 }}>
                {result.jobMatch}%
              </span>
              <span className="text-slate-500 text-sm mt-1">match for <span className="text-slate-700" style={{ fontWeight: 600 }}>{result.jobTitle}</span></span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${matchBarColor(result.jobMatch)}`}
                style={{ width: `${result.jobMatch}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-2">
              {result.jobMatch >= 75 ? "Great fit! A few tweaks could make you stand out." :
               result.jobMatch >= 50 ? "Decent match. Acquire the listed skills to boost this." :
               "Low match. Focus on the required skills below."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
            <Briefcase className="w-8 h-8 opacity-40" />
            <p className="text-sm">Enter a target job title above to see your match score</p>
          </div>
        )}
      </div>

      {/* Skills to acquire for job */}
      {result.skillsToAcquire.length > 0 && (
        <Section icon={<Target className="w-4 h-4 text-rose-600" />} title={`Skills to Acquire for "${result.jobTitle}"`} accent="bg-rose-100">
          <p className="text-slate-400 text-xs mb-3">You're missing these required skills for this role:</p>
          <div className="flex flex-wrap gap-2">
            {result.skillsToAcquire.map((s, i) => (
              <Pill key={i} label={s} color="bg-rose-50 text-rose-700 border-rose-100" />
            ))}
          </div>
        </Section>
      )}

      {/* Suited roles */}
      <Section icon={<Award className="w-4 h-4 text-purple-600" />} title="Roles You're Currently Suited For" accent="bg-purple-100">
        <p className="text-slate-400 text-xs mb-3">Based on your existing skills and experience:</p>
        <div className="flex flex-wrap gap-2">
          {result.suitedRoles.map((r, i) => (
            <Pill key={i} label={r} color="bg-purple-50 text-purple-700 border-purple-100" />
          ))}
        </div>
      </Section>

      {/* Strengths */}
      <Section icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} title="Strengths" accent="bg-emerald-100">
        <ul className="flex flex-col gap-2.5">
          {result.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 text-xs">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* Improvements */}
      <Section icon={<AlertCircle className="w-4 h-4 text-amber-600" />} title="Areas to Improve" accent="bg-amber-100">
        <ul className="flex flex-col gap-2.5">
          {result.improvements.map((imp, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 text-xs">!</span>
              {imp}
            </li>
          ))}
        </ul>
      </Section>

      {/* Current skills */}
      {result.currentSkills.length > 0 && (
        <Section icon={<TrendingUp className="w-4 h-4 text-indigo-600" />} title="Skills Detected in Your Resume" accent="bg-indigo-100">
          <div className="flex flex-wrap gap-2">
            {result.currentSkills.map((s, i) => (
              <Pill key={i} label={s} color="bg-indigo-50 text-indigo-700 border-indigo-100" />
            ))}
          </div>
        </Section>
      )}

      {/* Suggested skills */}
      {result.suggestedSkills.length > 0 && (
        <Section icon={<Zap className="w-4 h-4 text-sky-600" />} title="Suggested Additional Skills" accent="bg-sky-100">
          <p className="text-slate-400 text-xs mb-3">Nice-to-have skills that would strengthen your profile:</p>
          <div className="flex flex-wrap gap-2">
            {result.suggestedSkills.map((s, i) => (
              <Pill key={i} label={s} color="bg-sky-50 text-sky-700 border-sky-100" />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<AppUser | null>(getCurrentUser);
  const [tab, setTab] = useState<"analyze" | "history">("analyze");
  const [resume, setResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (user) setHistory(getUserHistory(user.id));
  }, [user]);

  const handleAuth = (u: AppUser) => {
    setUser(u);
    setHistory(getUserHistory(u.id));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setResult(null);
    setResume("");
    setJobTitle("");
  };

  const handleAnalyze = async () => {
    if (resume.trim().length < 50) {
      setError("Please paste a more complete resume (at least 50 characters).");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeResumeWithAI(resume, jobTitle, aiProvider);
      setResult(res);
      if (user) {
        const updated = saveToHistory(user.id, resume, res);
        setHistory(updated);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please check your API configuration.';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setResult(entry.result);
    setJobTitle(entry.result.jobTitle || "");
    setTab("analyze");
    setHistoryOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    if (!user) return;
    const updated = deleteFromHistory(user.id, id);
    setHistory(updated);
  };

  if (!user) return <AuthModal onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>AI Resume Analyzer</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setTab("analyze")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${tab === "analyze" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: 600 }}
              >
                <FileText className="w-3.5 h-3.5" /> Analyze
              </button>
              <button
                onClick={() => setTab("history")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${tab === "history" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: 600 }}
              >
                <Clock className="w-3.5 h-3.5" /> History
                {history.length > 0 && (
                  <span className="ml-0.5 bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-0.5 text-xs" style={{ fontWeight: 700 }}>
                    {history.length}
                  </span>
                )}
              </button>
            </div>
            {/* User */}
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm" style={{ fontWeight: 700 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {tab === "history" ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-800" style={{ fontWeight: 700 }}>Recent Analyses</h2>
              {history.length > 0 && (
                <span className="text-slate-400 text-sm">{history.length} saved</span>
              )}
            </div>
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl text-slate-800 mb-2" style={{ fontWeight: 700 }}>
                Hello, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-slate-500 text-sm">Paste your resume, pick your target role, and get AI-powered insights.</p>
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              {/* AI Provider Selection */}
              <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>
                AI Analysis Provider
              </label>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setAiProvider('openai')}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                    aiProvider === 'openai'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  OpenAI (GPT-4o)
                </button>
                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                    aiProvider === 'gemini'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Google Gemini
                </button>
              </div>

              {/* Job title */}
              <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>
                Target Job Title
              </label>
              <div className="relative mb-4">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Data Scientist, UX Designer…"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
                />
              </div>

              {/* Resume textarea */}
              <label className="block text-slate-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>
                Paste Your Resume
              </label>
              <textarea
                className="w-full h-52 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
                placeholder="Paste the full text of your resume here…"
                value={resume}
                onChange={e => { setResume(e.target.value); if (error) setError(""); }}
              />
              {error && <p className="mt-2 text-rose-500 text-sm">{error}</p>}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-3 transition flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing with {aiProvider === 'openai' ? 'GPT-4o' : 'Gemini'}…
                  </>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Resume</>
                )}
              </button>
            </div>

            {/* Recent history collapsed preview */}
            {history.length > 0 && !result && (
              <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
                  onClick={() => setHistoryOpen(p => !p)}
                >
                  <span className="flex items-center gap-2 text-slate-700 text-sm" style={{ fontWeight: 600 }}>
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Recent Analyses ({history.length})
                  </span>
                  {historyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {historyOpen && (
                  <div className="px-4 pb-4">
                    <HistoryPanel
                      history={history.slice(0, 3)}
                      onSelect={handleSelectHistory}
                      onDelete={handleDeleteHistory}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {result && <ResultView result={result} />}
          </>
        )}
      </main>
    </div>
  );
}
