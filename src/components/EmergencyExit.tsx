import { Phone } from "lucide-react";
import { motion } from "framer-motion";

const CRISIS_HOTLINES_URL = "https://findahelpline.com/";

const EmergencyExit = () => {
  const handleExit = () => {
    window.open(CRISIS_HOTLINES_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleExit}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-crisis-border bg-crisis-bg px-4 py-2 text-sm font-medium text-destructive shadow-md transition-all hover:shadow-lg hover:scale-105"
      aria-label="Emergency exit — access crisis hotlines"
    >
      <Phone className="h-4 w-4" />
      <span>Crisis Helpline</span>
    </motion.button>
  );
};

export default EmergencyExit;
