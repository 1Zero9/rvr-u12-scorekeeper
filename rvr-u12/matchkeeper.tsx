import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, PlusCircle, Save, Users, ClipboardList, Calendar, Shield, RotateCcw, Trash2, Trophy, Edit3, ChevronDown, ChevronUp, Undo2, Play, Pause, BarChart3, Filter, Search } from "lucide-react";

// FIXED: themeVars is now a valid object
const themeVars: React.CSSProperties = {
  "--club-green": "#0d6b3f",
  "--club-green-bright": "#17a24b",
  "--club-navy": "#0b1f3b",
  "--club-tint": "#e8f5ee",
  "--win": "#16a34a",
  "--draw": "#f59e0b",
  "--loss": "#ef4444",
  "--accent": "#f97316",
  "--accent-dark": "#c2410c"
};

// FIXED: interface definitions are now outside themeVars
interface Player { id: string; name: string; shirt?: number; position?: string; status?: string }
interface Opponent { id: string; name: string }
interface Venue { id: string; name: string }
interface League { id: string; name: string }
interface GoalEvent { id: string; minute: number; scorerId: string; assistId?: string }
interface SubEvent { id: string; playerId: string; minute: number }
interface MatchRec {
  id: string;
  date: string;
  opponentId: string;
  homeAway: "Home" | "Away";
  venueId?: string;
  leagueId?: string;
  isFriendly?: boolean;
  teamSize?: 9 | 11;
  ourScore: number;
  theirScore: number;
  goals: GoalEvent[];
  subs?: SubEvent[];
  notes?: string;
}

function key(k: string) { return `rvr-u12-${k}` }
function load<T>(k: string, fallback: T): T { try { const raw = localStorage.getItem(key(k)); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback } }
function save(k: string, val: unknown) { localStorage.setItem(key(k), JSON.stringify(val)) }

const Section: React.FC<{ title: string; icon?: React.ReactNode; right?: React.ReactNode; className?: string }> = ({ title, icon, right, className, children }) => (
  <Card className={"bg-white/60 backdrop-blur-md border border-white/40 shadow-lg " + (className ?? "")}> 
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--club-navy)" }}>{title}</h2>
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </CardContent>
  </Card>
);

const PlayerSelect: React.FC<{ players: Player[]; value?: string; onChange: (v: string) => void; placeholder?: string }> = ({ players, value, onChange, placeholder }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={placeholder ?? "Select player"} />
    </SelectTrigger>
    <SelectContent>
      {players.map(p => (
        <SelectItem key={p.id} value={p.id}>{p.shirt ? `#${p.shirt} `: ""}{p.name}{p.position ? ` · ${p.position}` : ""}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const Segmented: React.FC<{ options: { label: string; value: string }[]; value?: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
    {options.map(opt => (
      <button key={opt.value} onClick={() => onChange(opt.value)} className={(value === opt.value ? "bg-[var(--accent)] text-white shadow" : "bg-transparent text-slate-700") + " flex-1 rounded-lg py-2 text-sm font-medium"}>{opt.label}</button>
    ))}
  </div>
);

const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={(active ? "bg-[var(--accent)] text-white shadow" : "bg-slate-100 text-slate-700") + " rounded-lg px-3 py-2 text-xs font-medium border border-slate-200"}>{children}</button>
);

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() => load("players", [] as Player[]));
  const [opponents, setOpponents] = useState<Opponent[]>(() => load("opponents", [] as Opponent[]));
  const [venues, setVenues] = useState<Venue[]>(() => load("venues", [] as Venue[]));
  const [leagues, setLeagues] = useState<League[]>(() => load("leagues", [] as League[]));
  const [matches, setMatches] = useState<MatchRec[]>(() => load("matches", [] as MatchRec[]));

  useEffect(() => { if (players.length === 0 && opponents.length === 0 && matches.length === 0) { const demo = generateDemoSeason(); setPlayers(demo.players); setOpponents(demo.opponents); setVenues(demo.venues); setLeagues(demo.leagues); setMatches(demo.matches); } }, []);

  useEffect(() => { save("players", players) }, [players]);
  useEffect(() => { save("opponents", opponents) }, [opponents]);
  useEffect(() => { save("venues", venues) }, [venues]);
  useEffect(() => { save("leagues", leagues) }, [leagues]);
  useEffect(() => { save("matches", matches) }, [matches]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashExpanded, setDashExpanded] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches ? true : false);

  useEffect(() => {
    const isField = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      const role = el.getAttribute("role");
      return tag === "INPUT" || tag === "TEXTAREA" || role === "combobox" || !!el.closest("input,textarea,[role='combobox']");
    };
    const onFocusIn = (e: Event) => {
      if (isField(e.target)) {
        setKbOpen(true);
        setTimeout(() => { try { (e.target as HTMLElement)?.scrollIntoView({ block: "center", behavior: "smooth" }); } catch {} }, 50);
      }
    };
    const onFocusOut = () => { setTimeout(() => setKbOpen(false), 100); };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    let base = window.innerHeight;
    const onResize = () => { setKbOpen(window.innerHeight < base - 120); };
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const setVh = () => {
      const vh = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.visualViewport?.addEventListener('resize', setVh);
    window.addEventListener('resize', setVh);
    return () => {
      window.visualViewport?.removeEventListener('resize', setVh);
      window.removeEventListener('resize', setVh);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = () => setIsDesktop(mq.matches);
    handler();
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any); };
  }, []);

  useEffect(() => {
    const onVVResize = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      const base = screen.height;
      setKbOpen(h < base - 120);
    };
    window.visualViewport?.addEventListener('resize', onVVResize);
    return () => window.visualViewport?.removeEventListener('resize', onVVResize);
  }, []);

  const hasBottomBar = isDesktop && (activeTab === 'add' || activeTab === 'team' || activeTab === 'settings') && !kbOpen;
  const rootPad = kbOpen ? 'pb-4' : (hasBottomBar ? 'pb-36' : 'pb-4');

  const totals = useMemo(() => {
    const played = matches.length;
    const goalsFor = matches.reduce((s, m) => s + m.ourScore, 0);
    const goalsAgainst = matches.reduce((s, m) => s + m.theirScore, 0);
    const wins = matches.filter(m => m.ourScore > m.theirScore).length;
    const draws = matches.filter(m => m.ourScore === m.theirScore).length;
    const losses = played - wins - draws;
    const winRate = played ? Ma
    const goalsAgainst = matches
    const goalsAgainst = matches.reduce((s, m) => s + m.theirScore, 0);
    const wins = matches.filter(m => m.ourScore > m.theirScore).length;
    const draws = matches.filter(m => m.ourScore === m.theirScore).length;
    const losses = played - wins - draws;
    const winRate = played ? Math.round((wins / played) * 100) : 0;
    const cleanSheets = matches.filter(m => m.theirScore === 0).length;
    const gd = goalsFor - goalsAgainst;
    const points = wins * 3 + draws;
    const avgGF = avgSafe(goalsFor, played);
    const avgGA = avgSafe(goalsAgainst, played);
    return { played, goalsFor, goalsAgainst, wins, draws, losses, winRate, cleanSheets, gd, points, avgGF, avgGA };
  }, [matches]);rScore).length;
    const draws = matches.filter(m => m.ourScore === m.theirScore).length;
    const losses = played - wins - draws;
    const winRate = played ? Math.round((wins / played) * 100) : 0;
    const cleanSheets = matches.filter(m => m.theirScore === 0).length;
    const gd = goalsFor - goalsAgainst;
    return { played, goalsFor, goalsAgainst, wins, draws, losses, winRate, cleanSheets, gd };
  }, [matches]);

  const goalLeaders = useMemo(() => {
    const map = new Map<string, number>();
    matches.forEach(m => m.goals?.forEach(g => { map.set(g.scorerId, (map.get(g.scorerId) || 0) + 1); }));
    const arr = Array.from(map.entries()).map(([id, count]) => ({ id, name: players.find(p => p.id === id)?.name ?? "—", count }));
    arr.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
    return arr.slice(0, 5);
  }, [matches, players]);

  const assistLeaders = useMemo(() => {
    const map = new Map<string, number>();
    matches.forEach(m => m.goals?.forEach(g => { if (g.assistId) map.set(g.assistId, (map.get(g.assistId) || 0) + 1); }));
    const arr = Array.from(map.entries()).map(([id, count]) => ({ id, name: players.find(p => p.id === id)?.name ?? "—", count }));
    arr.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
    return arr.slice(0, 5);
  }, [matches, players]);

  const [form, setForm] = useState<Partial<MatchRec>>({ date: new Date().toISOString().slice(0,10), homeAway: "Home", isFriendly: false, teamSize: 11, ourScore: 0, theirScore: 0, goals: [], subs: [] });
  const [goalRows, setGoalRows] = useState<GoalEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [quickGoalOpen, setQuickGoalOpen] = useState(false);
  const [quickGoalMatchId, setQuickGoalMatchId] = useState<string | null>(null);
  const [quickGoalDraft, setQuickGoalDraft] = useState<{ minute: number; scorerId: string; assistId?: string }>({ minute: 0, scorerId: "", assistId: undefined });

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  useEffect(() => { if (!timerRunning) return; const id = setInterval(() => setTimerSeconds(s => s + 1), 1000); return () => clearInterval(id); }, [timerRunning]);
  const timerMinute = Math.floor(timerSeconds / 60);

  const addGoalRow = () => setGoalRows(prev => [...prev, { id: uid(), minute: timerMinute, scorerId: "", assistId: undefined }]);
  const removeGoalRow = (id: string) => setGoalRows(prev => prev.filter(g => g.id !== id));

  const resetForm = () => { setForm({ date: new Date().toISOString().slice(0,10), homeAway: "Home", isFriendly: false, teamSize: 11, ourScore: 0, theirScore: 0, goals: [], subs: [] }); setGoalRows([]); setEditingId(null); setTimerSeconds(0); setTimerRunning(false) };

  const saveMatch = () => {
    if (!form.date || !form.opponentId) return alert("Please select a date and opponent");
    const record: MatchRec = {
      id: editingId ?? uid(),
      date: form.date!,
      opponentId: form.opponentId!,
      homeAway: form.homeAway ?? "Home",
      venueId: form.venueId,
      leagueId: form.leagueId,
      isFriendly: !!form.isFriendly,
      teamSize: (form.teamSize as 9 | 11) ?? 11,
      ourScore: form.ourScore ?? 0,
      theirScore: form.theirScore ?? 0,
      goals: sanitizeGoals(goalRows),
      subs: form.subs ?? [],
      notes: form.notes ?? "",
    };
    setMatches(prev => editingId ? prev.map(m => m.id === editingId ? record : m) : [record, ...prev]);
    resetForm();
    setActiveTab("matches");
  };

  const deleteMatch = (id: string) => setMatches(prev => prev.filter(m => m.id !== id));

  const startEdit = (m: MatchRec) => { setEditingId(m.id); setForm({ ...m }); setGoalRows(m.goals?.map(g => ({ ...g })) ?? []); setActiveTab("add"); };

  const openQuickGoal = (matchId?: string) => {
    const prevMin = matchId ? Math.max(0, ((((matches.find(x => x.id === matchId)?.goals) ?? []).slice(-1)[0]?.minute) ?? -1) + 1) : Math.max(0, ((goalRows.slice(-1)[0]?.minute) ?? -1) + 1);
    const m = Math.max(prevMin, timerMinute);
    setQuickGoalDraft({ minute: m, scorerId: "", assistId: undefined });
    setQuickGoalMatchId(matchId ?? null);
    setQuickGoalOpen(true);
  };

  const confirmQuickGoal = () => {
    if (!quickGoalDraft.scorerId || quickGoalDraft.minute < 0 || !Number.isFinite(quickGoalDraft.minute)) return alert("Please select a scorer and valid minute");
    if (quickGoalMatchId) {
      setMatches(prev => prev.map(m => {
        if (m.id !== quickGoalMatchId) return m;
        const newGoal: GoalEvent = { id: uid(), minute: quickGoalDraft.minute, scorerId: quickGoalDraft.scorerId, assistId: quickGoalDraft.assistId };
        return { ...m, goals: [...(m.goals ?? []), newGoal], ourScore: (m.ourScore ?? 0) + 1 };
      }));
    } else {
      const newGoal: GoalEvent = { id: uid(), minute: quickGoalDraft.minute, scorerId: quickGoalDraft.scorerId, assistId: quickGoalDraft.assistId };
      setGoalRows(rs => [...rs, newGoal]);
      setForm(f => ({ ...f, ourScore: (f.ourScore ?? 0) + 1 }));
    }
    setQuickGoalOpen(false);
    setQuickGoalMatchId(null);
  };

  const undoLastGoal = () => { if (quickGoalMatchId) return; setGoalRows(rs => { if (rs.length === 0) return rs; const copy = [...rs]; copy.pop(); setForm(f => ({ ...f, ourScore: Math.max(0, (f.ourScore ?? 0) - 1) })); return copy; }); };

  const nameById = {
    player: (id?: string) => players.find(p => p.id === id)?.name ?? "—",
    opponent: (id?: string) => opponents.find(o => o.id === id)?.name ?? "—",
    venue: (id?: string) => venues.find(v => v.id === id)?.name ?? "—",
    league: (id?: string) => leagues.find(l => l.id === id)?.name ?? "—",
  };

  type TestResult = { name: string; ok: boolean; msg?: string };
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  function runSelfTests() {
    const results: TestResult[] = [];
    const expect = (name: string, cond: boolean, msg?: string) => results.push({ name, ok: !!cond, msg });
    expect("num parses integers", num("42") === 42);
    expect("num blank => 0", num("") === 0);
    expect("num negative works", num("-3") === -3);
    expect("num non-numeric => 0", num("abc") === 0);
    const arr = [{ x: 1 }, { x: 2 }];
    const r = mut(arr, 1, { x: 5 }) as any[];
    expect("mut updates only targeted index", r[1].x === 5 && r[0].x === 1);
    expect("mut does not mutate original", arr[1].x === 2);
    const nd = niceDate("2025-01-31");
    expect("niceDate returns a non-empty string", typeof nd === "string" && nd.length > 0);
    const gs = [
      { id: "1", minute: 0, scorerId: "a" },
      { id: "2", minute: Number.NaN as any, scorerId: "" },
      { id: "3", minute: 12, scorerId: "b", assistId: "a" },
      { id: "4", minute: -1, scorerId: "c" },
    ] as GoalEvent[];
    const clean = sanitizeGoals(gs);
    expect("sanitizeGoals keeps only valid rows", clean.length === 2 && clean[0].id === "1" && clean[1].id === "3");
    expect("outcome W", outcome({ ourScore: 2, theirScore: 1 } as MatchRec) === "W");
    expect("outcome D", outcome({ ourScore: 1, theirScore: 1 } as MatchRec) === "D");
    expect("outcome L", outcome({ ourScore: 0, theirScore: 3 } as MatchRec) === "L");
    expect("avgSafe zero denom => 0", avgSafe(5, 0) === 0);
    expect("avgSafe typical", avgSafe(5, 2) === 2.5);
    const uu = [uid(), uid()];
    expect("uid generates unique strings", uu[0] !== uu[1] && typeof uu[0] === "string" && uu[0].length > 0 && typeof uu[1] === "string" && uu[1].length > 0);
    expect("nameById fallback dash", nameById.player("nope") === "—");
    expect("formatTime 0", formatTime(0) === "00:00");
    expect("formatTime 125", formatTime(125) === "02:05");
    const demo = generateDemoSeason();
    expect("demo has players", demo.players.length > 10);
    expect("demo matches have consistent goal counts", demo.matches.every(m => m.goals.length === m.ourScore));
    setTestResults(results);
  }

  const [matchSearch, setMatchSearch] = useState("");
  const [fltType, setFltType] = useState("all");
  const [fltSide, setFltSide] = useState("all");
  const [fltSize, setFltSize] = useState("all");

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (matchSearch && !nameById.opponent(m.opponentId).toLowerCase().includes(matchSearch.toLowerCase())) return false;
      if (fltType !== 'all' && (fltType === 'friendly') !== !!m.isFriendly) return false;
      if (fltSide !== 'all' && m.homeAway.toLowerCase() !== fltSide) return false;
      if (fltSize !== 'all' && String(m.teamSize ?? 11) !== fltSize) return false;
      return true;
    });
  }, [matches, matchSearch, fltType, fltSide, fltSize]);

  const last5 = filteredMatches.slice(0, 5);

  return (
    <div className={"min-h-[100dvh] " + rootPad} style={{ background: "linear-gradient(180deg, var(--club-tint), white)", minHeight: "calc(var(--vh, 1vh) * 100)", scrollPaddingBottom: kbOpen ? 80 : 0, ...themeVars }}>
      <header className="sticky top-0 z-10 border-b backdrop-blur-md bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--club-green)" }}>
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold" style={{ color: "var(--club-navy)" }}>RVR U12 Matchday</h1>
            <p className="text-xs text-slate-600">Team setup · Fixtures · Results · Scorers · Assists</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="rounded-full" style={{ background: "var(--club-green)", color: "white" }}>Prototype</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full gap-2 overflow-x-auto bg-slate-100 whitespace-nowrap px-2 py-1 rounded-xl">
            <TabsTri<TabsList className="flex w-full gap-2 overflow-x-auto bg-slate-100 whitespace-nowrap px-2 py-1 rounded-xl">
            <TabsTrigger className="flex-shrink-0" value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger className="flex-shrink-0" value="team">Team<  <BubbleStat label="Played" value={totals.played} />
              <BubbleStat label="W‑D‑L" value={`${totals.wins}-${totals.draws}-${totals.losses}`} />
              <BubbleStat label="GF/GA" value={`${totals.goalsFor}/${totals.goalsAgainst}`} />
              <BubbleStat label="Win %" value={`${totals.winRate}`} />
              <BubbleStat label="Clean sheets" value={totals.cleanSheets} />
              <BubbleStat label="GD" value={totals.gd} />
            </div>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setActiveTab('add')} className="h-11 px-4" style={{ background: "var(--accent)", color: "white" }}><PlusCircle className="h-5 w-5 mr-2"/>Record Match</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Section title="Season Gauges" icon={<Shield className="h-5 w-5" style={{ color: "var(--club-green)" }} />} right={<div className="text-sm text-slate-500">U12s</div>}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Gauge label="Win Rate" value={totals.winRate} suffix="%" />
                  <Gauge label="Goals / Match" value={avgSafe(totals.goalsFor, totals.played)} />
                  <Gauge label="GA / Match" value={avgSafe(totals.goalsAgainst, totals.played)} />
                </div>
              </Section>

              <Section title="Next Steps" icon={<ClipboardList className="h-5 w-5" style={{ color: "var(--club-green)" }} />}>
                <ul className="list-disc pl-5 text-slate-700 text-sm">
                  <li>Add fixtures and record your first result.</li>
                  <li>Finish the Team set‑up (shirts, positions, player status).</li>
                  <li>Share the app link with coaches/parents later (when database added).</li>
                </ul>
              </Section>

              <Section title="Tips" icon={<Shield className="h-5 w-5" style={{ color: "var(--club-green)" }} />}>
                <p className="text-sm text-slate-600">Use <strong>Team</strong> to add players, set availability, opponents, venues and leagues. Quick Add lives there so everything is together.</p>
              </Section>
            </div>

            <div className="mt-6">
              <Section title="Recent Matches" icon={<Calendar className="h-5 w-5" style={{ color: "var(--club-green)" }} />}>
                {matches.length === 0 ? (
                  <Empty title="No matches yet" hint="Record your first match to see summaries here." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matches.slice(0,6).map(m => (
                      <MatchCard key={m.id} m={m} nameById={nameById} onDelete={() => deleteMatch(m.id)} onEdit={() => startEdit(m)} onQuickGoal={() => openQuickGoal(m.id)} />
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <Section title="Team Set‑up" icon={<Users className="h-5 w-5" style={{ color: "var(--club-green)" }} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Players</h3>
                  <div className="space-y-2">
                    {players.map((p, idx) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-2 bg-slate-50 rounded-xl p-2">
                        <Input className="w-14" type="number" value={p.shirt ?? ""} placeholder="#" onChange={e => updatePlayer(idx, { shirt: num(e.target.value) })} />
                        <Input className="flex-1 min-w-0" value={p.name} onChange={e => updatePlayer(idx, { name: e.target.value })} />
                        <Input className="w-28" placeholder="Pos" value={p.position ?? ""} onChange={e => updatePlayer(idx, { position: e.target.value })} />
                        <div className="w-full sm:w-auto grid grid-cols-3 gap-1">
                          <Chip active={(p.status ?? 'available') === 'available'} onClick={() => updatePlayer(idx, { status: 'available' })}>Available</Chip>
                          <Chip active={p.status === 'injured'} onClick={() => updatePlayer(idx, { status: 'injured' })}>Injured</Chip>
                          <Chip active={p.status === 'unavailable'} onClick={() => updatePlayer(idx, { status: 'unavailable' })}>Unavailable</Chip>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => delPlayer(idx)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button onClick={() => setPlayers(v => [...v, { id: uid(), name: "New Player", status: 'available' }])}><Plus className="h-4 w-4 mr-2"/>Add Player</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Section title="Mini Leaderboards" icon={<Trophy className="h-4 w-4" style={{ color: "var(--club-green)" }} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <LeaderList title="Top Scorers" data={goalLeaders} />
                      <LeaderList title="Top Assists" data={assistLeaders} />
                    </div>
                  </Section>
                  <Section title="Quick Add (Team)" icon={<Plus className="h-4 w-4" style={{ color: "var(--club-green)" }} />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <QuickAdd label="Opponent" onAdd={(name) => setOpponents(v => [{ id: uid(), name }, ...v])} />
                      <QuickAdd label="Venue" onAdd={(name) => setVenues(v => [{ id: uid(), name }, ...v])} />
                      <QuickAdd label="League" onAdd={(name) => setLeagues(v => [{ id: uid(), name }, ...v])} />
                      <QuickAdd label="Player" onAdd={(name) => setPlayers(v => [...v, { id: uid(), name, status: 'available' }])} />
                    </div>
                  </Section>
                  <div>
                    <h3 className="font-medium mb-2">Opponents</h3>
                    <CrudList items={opponents} onAdd={(name) => setOpponents(v => [{ id: uid(), name }, ...v])} onDel={(id) => setOpponents(v => v.filter(x => x.id !== id))} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Venues</h3>
                    <CrudList items={venues} onAdd={(name) => setVenues(v => [{ id: uid(), name }, ...v])} onDel={(id) => setVenues(v => v.filter(x => x.id !== id))} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Leagues</h3>
                    <CrudList items={leagues} onAdd={(name) => setLeagues(v => [{ id: uid(), name }, ...v])} onDel={(id) => setLeagues(v => v.filter(x => x.id !== id))} />
                  </div>
                </div>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <BubbleStat label="Played" value={totals.played} />
              <BubbleStat label="Record" value={`${totals.wins}-${totals.draws}-${totals.losses}`} />
              <BubbleStat label="Win %" value={`${totals.winRate}`} />
              <BubbleStat label="GF/GA" value={`${totals.goalsFor}/${totals.goalsAgainst}`} />
              <BubbleStat label="GD" value={totals.gd} />
            </div>
            <Section title="Matches Dashboard" icon={<BarChart3 className="h-5 w-5" style={{ color: "var(--club-green)" }} />} right={
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white rounded-xl border px-2 py-1">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input className="outline-none text-sm" placeholder="Search opponent" value={matchSearch} onChange={e => setMatchSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Filters</span>
                  <Filter className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Segmented value={fltType} onChange={setFltType} options={[{label:'All',value:'all'},{label:'League',value:'league'},{label:'Friendly',value:'friendly'}]} />
                    <Segmented value={fltSide} onChange={setFltSide} options={[{label:'All',value:'all'},{label:'Home',value:'home'},{label:'Away',value:'away'}]} />
                    <Segmented value={fltSize} onChange={setFltSize} options={[{label:'All',value:'all'},{label:'9‑a‑side',value:'9'},{label:'11‑a‑side',value:'11'}]} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <Stat label="Record" value={`${totals.wins}-${totals.draws}-${totals.losses}`} />
                    <Stat label="Goal Difference" value={totals.gd} />
                    <Stat label="Last 5" value={last5.map(m => outcome(m)).join(' ')} />
                  </div>

                  {filteredMatches.length === 0 ? (
                    <Empty title="No matches for filters" hint="Adjust the filters above." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredMatches.map(m => (
                        <MatchCard key={m.id} m={m} nameById={nameById} onDelete={() => deleteMatch(m.id)} onEdit={() => startEdit(m)} onQuickGoal={() => openQuickGoal(m.id)} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Section title="Top Scorers" icon={<Trophy className="h-4 w-4" style={{ color: "var(--club-green)" }} />}>
                    <LeaderList title=" " data={goalLeaders} />
                  </Section>
                  <Section title="Top Assists" icon={<Trophy className="h-4 w-4" style={{ color: "var(--club-green)" }} />}>
                    <LeaderList title=" " data={assistLeaders} />
                  </Section>
                </div>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Section title={editingId ? "Edit Match" : "Record Match"} icon={<Save className="h-5 w-5" style={{ color: "var(--club-green)" }} />} right={<div className="hidden sm:flex gap-2"><Button variant="outline" onClick={resetForm}><Undo2 className="h-4 w-4 mr-2"/>{editingId ? "Cancel Edit" : "Reset"}</Button><Button style={{ background: "var(--club-green)", color: "white" }} onClick={saveMatch}><Save className="h-4 w-4 mr-2"/>{editingId ? "Update Match" : "Save Result"}</Button></div>}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-slate-700">Date</label>
                    <Input type="date" value={form.date ?? ""} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Home/Away</label>
                    <Segmented value={form.homeAway} onChange={(v) => setForm({ ...form, homeAway: v as "Home" | "Away" })} options={[{ label: 'Home', value: 'Home' }, { label: 'Away', value: 'Away' }]} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Match Type</label>
                    <Segmented value={form.isFriendly ? 'Friendly' : 'League'} onChange={(v) => setForm({ ...form, isFriendly: v === 'Friendly' })} options={[{ label: 'League', value: 'League' }, { label: 'Friendly', value: 'Friendly' }]} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-slate-700">Team Size</label>
                    <Segmented value={String(form.teamSize ?? 11)} onChange={(v) => setForm({ ...form, teamSize: Number(v) as 9 | 11 })} options={[{ label: '9‑a‑side', value: '9' }, { label: '11‑a‑side', value: '11' }]} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Opponent</label>
                    <Select value={form.opponentId} onValueChange={(v) => setForm({ ...form, opponentId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select opponent" /></SelectTrigger>
                      <SelectContent>
                        {opponents.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">League</label>
                    <Select value={form.leagueId} onValueChange={(v) => setForm({ ...form, leagueId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select league" /></SelectTrigger>
                      <SelectContent>
                        {leagues.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-700">Venue</label>
                  <Select value={form.venueId} onValueChange={(v) => setForm({ ...form, venueId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                    <SelectContent>
                      {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Stepper label="Our Score" value={form.ourScore ?? 0} onDec={() => setForm(f => ({ ...f, ourScore: Math.max(0, (f.ourScore ?? 0) - 1) }))} onInc={() => setForm(f => ({ ...f, ourScore: (f.ourScore ?? 0) + 1 }))} />
                  <Stepper label="Their Score" value={form.theirScore ?? 0} onDec={() => setForm(f => ({ ...f, theirScore: Math.max(0, (f.theirScore ?? 0) - 1) }))} onInc={() => setForm(f => ({ ...f, theirScore: (f.theirScore ?? 0) + 1 }))} />
                </div>

                <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #eef2f7" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-600">Timer</div>
                      <div className="text-3xl font-bold" style={{ color: "var(--club-navy)" }}>{formatTime(timerSeconds)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="h-12" onClick={() => setTimerRunning(r => !r)}>{timerRunning ? <><Pause className="h-4 w-4 mr-2"/>Pause</> : <><Play className="h-4 w-4 mr-2"/>Start</>}</Button>
                      <Button className="h-12" variant="outline" onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}><RotateCcw className="h-4 w-4 mr-2"/>Reset</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-700">Notes (optional)</label>
                  <Textarea value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Weather, injuries, special moments, etc." />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Goals & Assists</h3>
                    <Button onClick={addGoalRow}><Plus className="h-4 w-4 mr-2"/>Add Goal</Button>
                  </div>
                  {goalRows.length === 0 && (
                    <p className="text-sm text-slate-500">Add each goal with scorer, optional assist, and minute.</p>
                  )}
                  <div className="space-y-2">
                    {goalRows.map((g, idx) => (
                      <div key={g.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 rounded-xl p-2 items-center">
                        <div className="sm:col-span-2">
                          <Input type="number" value={g.minute} onChange={e => setGoalRows(rs => mut(rs, idx, { minute: num(e.target.value) }))} placeholder="min" />
                        </div>
                        <div className="sm:col-span-4">
                          <PlayerSelect players={players} value={g.scorerId} onChange={(v) => setGoalRows(rs => mut(rs, idx, { scorerId: v }))} placeholder="Scorer" />
                        </div>
                        <div className="sm:col-span-4">
                          <PlayerSelect players={players} value={g.assistId} onChange={(v) => setGoalRows(rs => mut(rs, idx, { assistId: v }))} placeholder="Assist (opt)" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => removeGoalRow(g.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sm:hidden sticky bottom-2 z-10">
                  <div className="flex gap-2">
                    <Button className="flex-1 h-12" onClick={() => openQuickGoal()}><PlusCircle className="h-5 w-5 mr-2"/>Goal</Button>
                    <Button className="h-12" variant="outline" onClick={undoLastGoal}><RotateCcw className="h-5 w-5 mr-2"/>Undo</Button>
                    <Button className="h-12" style={{ background: "var(--club-green)", color: "white" }} onClick={saveMatch}><Save className="h-5 w-5 mr-2"/>Save</Button>
                  </div>
                </div>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Section title="Theme & Data" icon={<Shield className="h-5 w-5" style={{ color: "var(--club-green)" }} />}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Colours</h3>
                  <p className="text-sm text-slate-600">Primary green and navy can be adjusted later to match exact club colours.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Swatch label="#0d6b3f" style={{ background: "#0d6b3f" }} />
                    <Swatch label="#17a24b" style={{ background: "#17a24b" }} />
                    <Swatch label="#0b1f3b" style={{ background: "#0b1f3b" }} />
                    <Swatch label="#e8f5ee" style={{ background: "#e8f5ee", border: "1px solid #d1d5db" }} />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Data Reset</h3>
                  <p className="text-sm text-slate-600">This prototype stores data in your browser. You can clear it if needed.</p>
                  <Button variant="destructive" onClick={() => { localStorage.clear(); location.reload(); }}>Clear Local Data</Button>
                </div>
              </div>
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
