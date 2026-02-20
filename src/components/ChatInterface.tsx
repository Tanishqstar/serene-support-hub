import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

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

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Request failed (${resp.status})`);
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;

      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  onDone();
}

const ChatInterface = ({ onNewMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Welcome to your safe space. I'm here to listen and support you. How are you feeling today?",
      role: "assistant",
      sentimentScore: 0.7,
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: text,
      role: "user",
      sentimentScore: 0.5,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    onNewMessage?.(userMsg);
    setInput("");
    setIsStreaming(true);

    const history = messages
      .filter((m) => m.id !== "welcome" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: text });

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    await streamChat({
      messages: history,
      onDelta: (chunk) => {
        assistantContent += chunk;
        const snapshot = assistantContent;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m));
          }
          return [
            ...prev,
            {
              id: assistantId,
              content: snapshot,
              role: "assistant" as const,
              sentimentScore: 0.7,
              createdAt: new Date(),
            },
          ];
        });
      },
      onDone: () => {
        setIsStreaming(false);
        const finalMsg: Message = {
          id: assistantId,
          content: assistantContent || "I'm here for you. Could you tell me more?",
          role: "assistant",
          sentimentScore: 0.7,
          createdAt: new Date(),
        };
        onNewMessage?.(finalMsg);
      },
      onError: (err) => {
        setIsStreaming(false);
        toast({ title: "Connection issue", description: err, variant: "destructive" });
      },
    });
  }, [input, isStreaming, messages, onNewMessage, toast]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-serif text-lg text-foreground">Chat Session</h2>
        <p className="text-xs text-muted-foreground">AI-powered • Private and secure</p>
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
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
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
