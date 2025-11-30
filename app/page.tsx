import Link from "next/link";

const featureBullets = [
  {
    title: "AI Navigator",
    description:
      "Tells you exactly what to open next—articles, quizzes, or the simulator—so you never wonder where to click.",
  },
  {
    title: "Adaptive Learning Path",
    description:
      "Starts with your goals and level, then reshapes the entire layout as you progress.",
  },
  {
    title: "Hands-on Simulator",
    description: "Test line-following logic with sensor readouts and tunable speed/thresholds.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:py-24">
      <div className="glass-panel rounded-3xl p-10 shadow-2xl md:p-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-14">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">
              Robotics Learning OS
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-gradient">An AI guide for every robotics learner.</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Meet the AI Navigator that curates your lessons, quizzes, and simulator sessions. Tell it your
              goal—building a line follower, leveling up sensors, or tackling projects—and it dynamically
              routes you through the site.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-glow-cyan transition hover:scale-105 hover:bg-indigo-400"
              >
                Start with AI Navigator
              </Link>
              <Link
                href="/learn/intro_robotics"
                className="rounded-full border border-indigo-300/40 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-200/10"
              >
                Preview an article
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-100">Adaptive path</span>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-100">Chat-first UX</span>
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-100">Simulator ready</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="glass-panel relative overflow-hidden rounded-2xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-400/10" />
              <div className="relative space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Navigator preview</p>
                <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-slate-900/60 p-4 text-sm text-indigo-50 shadow-card-hover">
                  <p className="font-semibold">Navigator: I designed a path for you</p>
                  <ul className="list-inside list-disc space-y-2 text-indigo-100/90">
                    <li>Read: Intro to Robotics</li>
                    <li>Quiz: Motors & movement check-in</li>
                    <li>Simulate: Follow a line with two sensors</li>
                  </ul>
                  <p className="text-indigo-200/80">Want me to adjust the pace or dive deeper?</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-4 text-sm text-muted-foreground">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-glow-cyan" />
                  <div>
                    <p className="text-indigo-100">Your layout, re-arranged</p>
                    <p className="text-xs text-muted-foreground">
                      Navigator routes you to the next article/quiz and updates your dashboard instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        {featureBullets.map((item) => (
          <div
            key={item.title}
            className="glass-panel rounded-2xl border border-border/40 p-6 shadow-card-hover transition hover:-translate-y-1"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">{item.title}</p>
            <p className="mt-3 text-base text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="grid items-center gap-10 rounded-3xl bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-cyan-500/25 p-10 shadow-inner">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Built for classrooms & clubs</p>
          <h2 className="text-3xl font-bold text-gradient">Everything in one learning OS.</h2>
          <p className="max-w-3xl text-muted-foreground">
            The dashboard shows the exact next article, quiz, or simulator tweak for each learner. Chat with the
            AI Navigator to change pace, request easier examples, or jump into projects. No more guessing where
            to go.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="rounded-full bg-slate-900/70 px-4 py-2">Articles with quizzes attached</span>
          <span className="rounded-full bg-slate-900/70 px-4 py-2">Adaptive recommendations</span>
          <span className="rounded-full bg-slate-900/70 px-4 py-2">Project + simulator workspace</span>
        </div>
      </section>
    </div>
  );
}
