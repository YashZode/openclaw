import { motion, useInView } from "framer-motion";
import { Coffee, Compass, Users, Radio, Sparkles, Shield, BarChart3 } from "lucide-react";
import { useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import TelegramLogin from "../components/TelegramLogin";
import { useAuth, type TelegramUser } from "../lib/auth";

/* ── animation variants ── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const float = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ── reusable section wrapper with scroll-triggered animation ── */

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ── page ── */

export default function Auth() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleTelegramAuth = useCallback(
    async (tgUser: TelegramUser) => {
      await login(tgUser);
      navigate("/home");
    },
    [login, navigate],
  );

  const botName = window.location.hostname === "3rdseat.com" ? "thirdSeatbot" : "workhangbot";

  // Already logged in — go straight to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10"
    >
      {/* ═══════════ HERO ═══════════ */}
      <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        {/* radial glow behind astronaut */}
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 lg:order-1 order-2"
          >
            <motion.h1
              variants={fadeUp}
              className="font-mono text-5xl lg:text-6xl font-bold text-white"
            >
              3rdSeat
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="font-sans text-lg text-navy-400 tracking-[2px] uppercase"
            >
              find your third seat
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="font-sans text-base text-navy-400 max-w-md leading-relaxed"
            >
              Coordinate group work sessions at the best cafes and venues nearby. AI-powered
              matching, real-time coordination, and community you can count on.
            </motion.p>
            <motion.div variants={fadeUp}>
              <TelegramLogin botName={botName} onAuth={handleTelegramAuth} />
            </motion.div>
          </motion.div>

          {/* Right — astronaut */}
          <motion.div
            variants={float}
            animate="animate"
            className="flex items-center justify-center lg:order-2 order-1"
          >
            <Logo size={280} className="text-cyan opacity-90" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHAT IS 3RDSEAT? ═══════════ */}
      <Section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
          <motion.h2
            variants={fadeUp}
            className="font-mono text-3xl lg:text-4xl font-bold text-white"
          >
            What is 3rdSeat?
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-xl text-cyan font-medium">
            Your home. Your office. Where's your third seat?
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="font-sans text-base text-navy-400 leading-relaxed max-w-2xl mx-auto"
          >
            Everyone has a home and an office — but the magic happens at the third place. 3rdSeat
            helps you find and coordinate group work sessions at cafes, libraries, and co-working
            spots with the people you actually want to work alongside.
          </motion.p>
        </div>
      </Section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Section className="py-24 px-6 bg-navy-800/20">
        <div className="max-w-6xl mx-auto flex flex-col gap-14">
          <motion.h2
            variants={fadeUp}
            className="font-mono text-3xl lg:text-4xl font-bold text-white text-center"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: "Start a Hang",
                desc: "Tell us when and where you want to work. Set your needs — WiFi, quiet, outlets.",
              },
              {
                icon: Compass,
                title: "AI Finds Spots",
                desc: "We match you with the best venues nearby based on your crew's needs.",
              },
              {
                icon: Users,
                title: "Meet & Work",
                desc: "Vote on a spot, show up, and get into flow with your crew.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-4 p-6"
              >
                <div className="w-14 h-14 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-cyan" />
                </div>
                <h3 className="font-mono text-lg font-semibold text-white">{title}</h3>
                <p className="font-sans text-sm text-navy-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ FEATURES ═══════════ */}
      <Section className="py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-14">
          <motion.h2
            variants={fadeUp}
            className="font-mono text-3xl lg:text-4xl font-bold text-white text-center"
          >
            Features
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Radio,
                title: "Real-time Coordination",
                desc: "Live status of who's arrived, who's on the way, and who's running late.",
              },
              {
                icon: Sparkles,
                title: "Smart Venue Matching",
                desc: "AI-powered matching based on noise level, WiFi speed, outlets, and vibe.",
              },
              {
                icon: Shield,
                title: "Community Standing",
                desc: "Build reputation as a reliable co-worker. Show up, contribute, get recognized.",
              },
              {
                icon: BarChart3,
                title: "Venue Owner Hub",
                desc: "Analytics dashboard for venue owners to understand traffic and optimize.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-xl card-paper shadow-paper p-6 flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-cyan" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-mono text-sm font-semibold text-white">{title}</h3>
                  <p className="font-sans text-sm text-navy-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ CTA FOOTER ═══════════ */}
      <Section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
          <motion.h2
            variants={fadeUp}
            className="font-mono text-3xl lg:text-4xl font-bold text-white"
          >
            Ready to find your third seat?
          </motion.h2>
          <motion.div variants={fadeUp}>
            <TelegramLogin botName={botName} onAuth={handleTelegramAuth} />
          </motion.div>
          <motion.p variants={fadeUp} className="text-navy-600 font-sans text-xs">
            By continuing, you agree to our Terms &amp; Privacy
          </motion.p>
        </div>
      </Section>
    </motion.div>
  );
}
