"use client";

import Link from "next/link";
import { SignInButton, Show } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

type BallpitConfig = {
  count?: number;
  gravity?: number;
  friction?: number;
  minSize?: number;
  maxSize?: number;
  lightIntensity?: number;
};

type InteractiveHeroProps = {
  brandName: string;
  heroTitle: string;
  heroDescription: string;
  emailPlaceholder?: string;
  ballpitConfig?: BallpitConfig;
};

export function InteractiveHero({
  brandName,
  heroTitle,
  heroDescription,
  emailPlaceholder = "Enter your email",
  ballpitConfig,
}: InteractiveHeroProps) {
  const bubbleCount = Math.max(24, Math.min(ballpitConfig?.count ?? 120, 180));

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-zinc-200 bg-zinc-100 pt-24 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.25),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.22),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.2),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.1),transparent_40%)]" />
        {Array.from({ length: bubbleCount }).map((_, i) => {
          const size = 6 + (i % 5) * 6;
          const left = (i * 37) % 100;
          const top = (i * 29) % 100;
          const delay = (i % 8) * 0.4;
          const duration = 6 + (i % 6);

          return (
            <span
              key={`bubble-${i}`}
              className="absolute rounded-full bg-emerald-500/20 blur-[1px] animate-pulse dark:bg-emerald-400/20"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center px-5 sm:px-8 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-100">
              {brandName}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
                {heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg dark:text-zinc-300">
                {heroDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                    Get started
                    <ArrowRight className="size-4" />
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Show>
              <button className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
                Learn more
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Stay in the loop
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Get product updates and workflow tips directly in your inbox.
            </p>
            <div className="mt-5 flex gap-2">
              <input
                placeholder={emailPlaceholder}
                className="h-10 flex-1 rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Join
              </button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-500/10">
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {Math.round((ballpitConfig?.friction ?? 0.99) * 100)}
                </p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Smoothness
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 p-3 text-center dark:bg-sky-500/10">
                <p className="text-2xl font-semibold text-sky-700 dark:text-sky-300">
                  {ballpitConfig?.gravity ?? 0.5}
                </p>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80">
                  Gravity
                </p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 text-center dark:bg-zinc-800">
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-200">
                  {ballpitConfig?.count ?? 120}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Particles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
