import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface MoodDataPoint {
  time: string;
  sentiment: number;
}

interface MoodTrackerProps {
  data?: MoodDataPoint[];
}

const DEFAULT_DATA: MoodDataPoint[] = [
  { time: "9:00", sentiment: 0.4 },
  { time: "9:15", sentiment: 0.45 },
  { time: "9:30", sentiment: 0.38 },
  { time: "9:45", sentiment: 0.55 },
  { time: "10:00", sentiment: 0.6 },
  { time: "10:15", sentiment: 0.52 },
  { time: "10:30", sentiment: 0.65 },
  { time: "10:45", sentiment: 0.7 },
  { time: "11:00", sentiment: 0.68 },
  { time: "11:15", sentiment: 0.75 },
];

const MoodTracker = ({ data }: MoodTrackerProps) => {
  const chartData = data ?? DEFAULT_DATA;

  const moodLabel = useMemo(() => {
    const latest = chartData[chartData.length - 1]?.sentiment ?? 0.5;
    if (latest >= 0.7) return { label: "Positive", color: "text-mood-positive" };
    if (latest >= 0.4) return { label: "Neutral", color: "text-mood-neutral" };
    return { label: "Low", color: "text-mood-negative" };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="zen-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base text-foreground">Mood Tracker</h3>
          <p className="text-xs text-muted-foreground">Sentiment over session</p>
        </div>
        <span className={`text-sm font-medium ${moodLabel.color}`}>
          {moodLabel.label}
        </span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 35%, 42%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(174, 35%, 42%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 12%, 90%)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(200, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(180, 12%, 90%)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 10, fill: "hsl(200, 10%, 50%)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(180, 12%, 99%)",
                border: "1px solid hsl(180, 12%, 90%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Sentiment"]}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="hsl(174, 35%, 42%)"
              strokeWidth={2}
              fill="url(#sentimentGradient)"
              dot={{ r: 3, fill: "hsl(174, 35%, 42%)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "hsl(174, 35%, 42%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MoodTracker;
