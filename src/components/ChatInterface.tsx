import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  sentimentScore?: number;
  isCrisis?: boolean;
  createdAt: Date;
}

interface ChatInterfaceProps {
  onNewMessage?: (message: Message) => void;
}

const ChatInterface = ({ onNewMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Welcome to your safe space. How are you feeling today?",
      role: "assistant",
      sentimentScore: 0.7,
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: input.trim(),
      role: "user",
      sentimentScore: Math.random() * 0.6 + 0.2, // placeholder
      isCrisis: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    onNewMessage?.(userMsg);
    setInput("");
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        content: getTherapeuticResponse(userMsg.content),
        role: "assistant",
        sentimentScore: 0.8,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      onNewMessage?.(assistantMsg);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-serif text-lg text-foreground">Chat Session</h2>
        <p className="text-xs text-muted-foreground">Your conversation is private and secure</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-chat-user text-foreground rounded-br-md"
                    : "bg-chat-assistant text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1 rounded-2xl bg-chat-assistant px-4 py-3 rounded-bl-md">
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-soft" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-soft [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-soft [animation-delay:300ms]" />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

function getTherapeuticResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("stress"))
    return "I hear that you're feeling anxious. That takes courage to share. Let's try a grounding exercise — can you name 5 things you can see right now?";
  if (lower.includes("sad") || lower.includes("down") || lower.includes("depress"))
    return "Thank you for sharing that with me. Your feelings are valid. Would you like to explore what's contributing to this feeling?";
  if (lower.includes("angry") || lower.includes("frustrated"))
    return "It sounds like you're dealing with some strong emotions. Take a deep breath with me. What happened that brought these feelings up?";
  if (lower.includes("good") || lower.includes("great") || lower.includes("happy"))
    return "That's wonderful to hear! What's been going well for you? Recognizing positive moments is an important part of wellbeing.";
  return "Thank you for sharing. I'm here to listen without judgment. Could you tell me more about how that makes you feel?";
}

export default ChatInterface;
