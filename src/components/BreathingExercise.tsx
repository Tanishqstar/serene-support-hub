import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PHASES = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Exhale", duration: 6 },
  { label: "Hold", duration: 2 },
] as const;

const TOTAL = PHASES.reduce((s, p) => s + p.duration, 0); // 16s

const BreathingExercise = () => {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(PHASES[0].duration);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length;
            setCountdown(PHASES[next].duration);
            return next;
          });
          return 0; // will be overwritten by setCountdown above
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const phase = PHASES[phaseIndex];
  const isExpanding = phase.label === "Inhale";
  const isContracting = phase.label === "Exhale";

  const getScale = () => {
    if (!active) return 1;
    if (isExpanding) return 1.6;
    if (isContracting) return 1;
    return undefined; // hold — keep current
  };

  const handleToggle = () => {
    if (!active) {
      setPhaseIndex(0);
      setCountdown(PHASES[0].duration);
    }
    setActive((v) => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="zen-card p-6"
    >
      <h3 className="font-serif text-base text-foreground mb-3">Breathing Exercise</h3>

      <div className="flex items-center justify-center py-8">
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <motion.div
            animate={{
              scale: active ? getScale() : 1,
              opacity: active ? 0.25 : 0.15,
            }}
            transition={{ duration: phase.duration, ease: "easeInOut" }}
            className="absolute h-32 w-32 rounded-full bg-primary/20"
          />

          {/* Main circle */}
          <motion.button
            onClick={handleToggle}
            animate={{
              scale: active ? getScale() : 1,
            }}
            transition={{ duration: phase.duration, ease: "easeInOut" }}
            className="relative z-10 h-24 w-24 rounded-full border-2 border-primary/40 bg-primary/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <span className="text-sm font-medium text-primary">
              {active ? phase.label : "Start"}
            </span>
            {active && (
              <span className="text-lg font-serif text-foreground">{countdown}</span>
            )}
          </motion.button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {active
          ? "Follow the circle — tap to stop"
          : "Tap the circle to begin a 4-4-6-2 breathing cycle"}
      </p>
    </motion.div>
  );
};

export default BreathingExercise;
