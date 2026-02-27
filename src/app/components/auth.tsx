import { useState } from "react";
import { User, Eye, EyeOff, Sparkles } from "lucide-react";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(36);
}

export function getUsers(): AppUser[] {
  try { return JSON.parse(localStorage.getItem("rz_users") || "[]"); } catch { return []; }
}
function saveUsers(users: AppUser[]) {
  localStorage.setItem("rz_users", JSON.stringify(users));
}
export function getCurrentUser(): AppUser | null {
  try { return JSON.parse(localStorage.getItem("rz_current_user") || "null"); } catch { return null; }
}
export function setCurrentUser(user: AppUser | null) {
  if (user) localStorage.setItem("rz_current_user", JSON.stringify(user));
  else localStorage.removeItem("rz_current_user");
}

interface AuthProps {
  onAuth: (user: AppUser) => void;
}

export function AuthModal({ onAuth }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    if (mode === "signup" && !name) return setError("Please enter your name.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    const users = getUsers();
    if (mode === "signup") {
      if (users.find(u => u.email === email)) return setError("Email already registered.");
      const newUser: AppUser = { id: Date.now().toString(), name, email, passwordHash: simpleHash(password) };
      saveUsers([...users, newUser]);
      setCurrentUser(newUser);
      onAuth(newUser);
    } else {
      const found = users.find(u => u.email === email);
      if (!found || found.passwordHash !== simpleHash(password)) return setError("Invalid email or password.");
      setCurrentUser(found);
      onAuth(found);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl text-slate-800" style={{ fontWeight: 700 }}>AI Resume Analyzer</h1>
          <p className="text-slate-500 mt-1 text-sm">Smart analysis tailored to your dream job</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm transition ${mode === m ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                style={{ fontWeight: 600 }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  className="w-full px-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-rose-500 text-sm">{error}</p>}
            <button
              onClick={submit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 mt-1 transition"
              style={{ fontWeight: 600 }}
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
