import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Loader2,
  ArrowLeft,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

interface JournalEntry {
  id: string;
  content: string;
  mood_label: string | null;
  sentiment_score: number | null;
  created_at: string;
}

interface EntryScore {
  index: number;
  sentiment: number;
  emotion: string;
}

interface DriftAnalysis {
  entry_scores: EntryScore[];
  drift_direction: "improving" | "declining" | "stable" | "volatile";
  summary: string;
}

const DRIFT_META: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  improving: { icon: TrendingUp, color: "text-mood-positive", label: "Improving" },
  declining: { icon: TrendingDown, color: "text-mood-negative", label: "Declining" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
  volatile: { icon: Activity, color: "text-mood-neutral", label: "Volatile" },
};

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-journal`;

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DriftAnalysis | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user and load entries
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (data) setEntries(data);
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    const text = newEntry.trim();
    if (!text || !userId) {
      if (!userId) toast({ title: "Please sign in", description: "You need to be logged in to save journal entries.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ content: text, user_id: userId })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else if (data) {
      setEntries((prev) => [...prev, data]);
      setNewEntry("");
      setAnalysis(null); // clear stale analysis
      toast({ title: "Entry saved" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (entries.length < 2) {
      toast({ title: "Need more entries", description: "Write at least 2 journal entries to analyze drift.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          entries: entries.map((e) => ({ content: e.content, created_at: e.created_at })),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Failed (${resp.status})`);
      }
      const data: DriftAnalysis = await resp.json();
      setAnalysis(data);

      // Update sentiment scores in DB
      for (const score of data.entry_scores) {
        const entry = entries[score.index - 1];
        if (entry) {
          await supabase
            .from("journal_entries")
            .update({ sentiment_score: score.sentiment, mood_label: score.emotion })
            .eq("id", entry.id);
        }
      }

      // Update local state
      setEntries((prev) =>
        prev.map((e, i) => {
          const score = data.entry_scores.find((s) => s.index === i + 1);
          return score ? { ...e, sentiment_score: score.sentiment, mood_label: score.emotion } : e;
        })
      );
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = analysis
    ? analysis.entry_scores.map((s) => ({
        entry: `#${s.index}`,
        sentiment: s.sentiment,
        emotion: s.emotion,
      }))
    : [];

  const drift = analysis ? DRIFT_META[analysis.drift_direction] : null;
  const DriftIcon = drift?.icon ?? Minus;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border px-6 py-4 lg:px-10"
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-foreground leading-tight">Emotional Drift Journal</h1>
            <p className="text-xs text-muted-foreground">Track patterns in your emotional tone over time</p>
          </div>
        </div>
      </motion.header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* New Entry */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="zen-card p-6">
          <h2 className="font-serif text-lg text-foreground mb-3">New Journal Entry</h2>
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="How are you feeling right now? What's on your mind..."
            className="min-h-[120px] resize-none text-sm"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{newEntry.length}/2000</span>
            <Button onClick={handleSave} disabled={!newEntry.trim() || saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Entry
            </Button>
          </div>
        </motion.div>

        {/* Analysis Section */}
        {entries.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="zen-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg text-foreground">Drift Analysis</h2>
                <p className="text-xs text-muted-foreground">{entries.length} entries available</p>
              </div>
              <Button onClick={handleAnalyze} disabled={analyzing} variant="outline" className="gap-2">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Drift
              </Button>
            </div>

            <AnimatePresence>
              {analysis && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                  {/* Drift Direction Badge */}
                  <div className="flex items-center gap-2">
                    <DriftIcon className={`h-5 w-5 ${drift?.color}`} />
                    <span className={`text-sm font-medium ${drift?.color}`}>{drift?.label} trend</span>
                  </div>

                  {/* Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="driftGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(174, 35%, 42%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(174, 35%, 42%)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 12%, 90%)" />
                        <XAxis dataKey="entry" tick={{ fontSize: 10, fill: "hsl(200, 10%, 50%)" }} axisLine={{ stroke: "hsl(180, 12%, 90%)" }} tickLine={false} />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(200, 10%, 50%)" }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(180, 12%, 99%)",
                            border: "1px solid hsl(180, 12%, 90%)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, _name: string, props: any) => [
                            `${(value * 100).toFixed(0)}% — ${props.payload.emotion}`,
                            "Sentiment",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="sentiment"
                          stroke="hsl(174, 35%, 42%)"
                          strokeWidth={2}
                          fill="url(#driftGradient)"
                          dot={{ r: 4, fill: "hsl(174, 35%, 42%)", strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: "hsl(174, 35%, 42%)" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* AI Summary */}
                  <div className="rounded-lg bg-accent/50 border border-accent p-4">
                    <h3 className="font-serif text-sm text-foreground mb-1">AI Insight</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Entries List */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <h2 className="font-serif text-lg text-foreground">Past Entries</h2>
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground">No entries yet. Write your first journal entry above.</p>
          )}
          <AnimatePresence>
            {[...entries].reverse().map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="zen-card p-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {entry.mood_label && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                          {entry.mood_label}
                        </span>
                      )}
                      {entry.sentiment_score != null && (
                        <span className="text-xs text-muted-foreground">
                          {(entry.sentiment_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{entry.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Journal;
