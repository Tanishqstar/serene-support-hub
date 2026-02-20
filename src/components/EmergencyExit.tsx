import { Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const INDIAN_HELPLINES = [
  { name: "iCall", number: "9152987821", description: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "18602662345", description: "24/7, multilingual" },
  { name: "AASRA", number: "9820466726", description: "24/7 crisis support" },
  { name: "Snehi", number: "04424640050", description: "24/7, Chennai-based" },
  { name: "NIMHANS", number: "08046110007", description: "Mon–Sat, 9:30am–4:30pm" },
];

const EmergencyExit = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-crisis-border bg-crisis-bg px-4 py-2 text-sm font-medium text-destructive shadow-md transition-all hover:shadow-lg hover:scale-105"
        aria-label="Emergency exit — access Indian crisis helplines"
      >
        <Phone className="h-4 w-4" />
        <span>Crisis Helpline</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-lg"
          >
            <p className="text-xs text-muted-foreground mb-3 px-1">
              Indian mental health helplines — tap to call
            </p>
            <ul className="space-y-1">
              {INDIAN_HELPLINES.map((h) => (
                <li key={h.number}>
                  <a
                    href={`tel:${h.number}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
                  >
                    <div>
                      <span className="font-medium text-foreground">{h.name}</span>
                      <p className="text-xs text-muted-foreground">{h.description}</p>
                    </div>
                    <span className="text-xs font-mono text-primary group-hover:underline">
                      {h.number}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyExit;
