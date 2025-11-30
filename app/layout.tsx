import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { NavigationOrchestratorProvider } from "../components/NavigationOrchestrator";

export const metadata: Metadata = {
  title: "Robotics Learning OS",
  description:
    "An AI-guided robotics learning workspace with personalized paths, quizzes, and simulations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <NavigationOrchestratorProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border/40 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/70 px-6 py-4 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-glow-cyan" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-indigo-200/80">
                      Robotics Learning OS
                    </p>
                    <p className="font-semibold text-lg text-gradient">AI Navigator</p>
                  </div>
                </div>
                <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                  <span>Adaptive learning</span>
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  <span>Personalized routes</span>
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  <span>Simulator-ready</span>
                </div>
              </div>
            </header>
            <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              {children}
            </main>
            <footer className="border-t border-border/40 bg-slate-950/80 py-6 text-center text-sm text-muted-foreground">
              Built for curious robotics learners. Guided by AI.
            </footer>
          </div>
        </NavigationOrchestratorProvider>
      </body>
    </html>
  );
}
