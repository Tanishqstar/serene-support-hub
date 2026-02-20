import { motion } from "framer-motion";
import { Heart, Shield, Brain, MessageCircle, Activity, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageCircle,
    title: "AI-Powered Chat",
    description: "Compassionate conversations with an AI trained in evidence-based therapeutic techniques.",
  },
  {
    icon: Activity,
    title: "Mood Tracking",
    description: "Real-time sentiment analysis visualized over your session to help you see patterns.",
  },
  {
    icon: Box,
    title: "Grounding Zone",
    description: "Interactive 3D visuals designed to calm your mind through gentle, meditative interaction.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "End-to-end encryption ensures your conversations stay between you and your screen.",
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl lg:text-5xl text-foreground leading-tight mb-6"
          >
            A quieter space for <br />
            <span className="text-primary">your mental wellbeing</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto mb-10"
          >
            Serenity is an enterprise-grade mental health support dashboard that combines AI-driven conversations, 
            real-time mood insights, and calming interactive experiences — all in one private, secure space.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button
              onClick={() => navigate("/")}
              className="rounded-xl bg-primary text-primary-foreground px-8 py-6 text-base hover:bg-primary/90"
            >
              Open Dashboard
            </Button>
          </motion.div>
        </div>

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-2xl text-foreground mb-3">Built with care</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Every feature is designed to support, never overwhelm.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="zen-card p-6 group hover:zen-glow transition-shadow duration-500"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent mb-4 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-5 w-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-base text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-border px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Brain className="h-5 w-5 text-muted-foreground mx-auto mb-3" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Serenity is a supportive tool and is <strong className="text-foreground">not a substitute</strong> for 
            professional mental health care. If you are in crisis, please use the Crisis Helpline button or 
            contact your local emergency services immediately.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
