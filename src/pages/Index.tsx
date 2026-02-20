import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import EmergencyExit from "@/components/EmergencyExit";
import ChatInterface from "@/components/ChatInterface";
import GroundingZone from "@/components/GroundingZone";
import MoodTracker from "@/components/MoodTracker";
import { Heart, Shield } from "lucide-react";

interface MoodPoint {
  time: string;
  sentiment: number;
}

const Index = () => {
  const [moodData, setMoodData] = useState<MoodPoint[]>([
    { time: "Start", sentiment: 0.5 },
  ]);

  const handleNewMessage = useCallback((msg: { sentimentScore?: number; createdAt: Date }) => {
    if (msg.sentimentScore != null) {
      setMoodData((prev) => [
        ...prev,
        {
          time: msg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sentiment: msg.sentimentScore!,
        },
      ]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <EmergencyExit />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border px-6 py-4 lg:px-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-foreground leading-tight">Serenity</h1>
            <p className="text-xs text-muted-foreground">Mental Health Support Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </motion.header>

      {/* Main grid */}
      <div className="grid h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Chat - left/center */}
        <div className="lg:col-span-5 xl:col-span-4 border-r border-border">
          <ChatInterface onNewMessage={handleNewMessage} />
        </div>

        {/* Center column: Mood + info */}
        <div className="hidden lg:flex lg:col-span-3 xl:col-span-4 flex-col gap-6 p-6 overflow-y-auto">
          <MoodTracker data={moodData} />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="zen-card p-6"
          >
            <h3 className="font-serif text-base text-foreground mb-3">Breathing Exercise</h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-2 border-primary/30 animate-breathe flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Breathe</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Follow the circle — inhale as it expands, exhale as it contracts
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="zen-card p-6"
          >
            <h3 className="font-serif text-base text-foreground mb-2">Session Notes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This session is private and not shared with anyone. Your wellbeing matters.
              Remember to take breaks and practice self-compassion.
            </p>
          </motion.div>
        </div>

        {/* Grounding Zone - right */}
        <div className="hidden lg:block lg:col-span-4 border-l border-border">
          <GroundingZone />
        </div>
      </div>
    </div>
  );
};

export default Index;
