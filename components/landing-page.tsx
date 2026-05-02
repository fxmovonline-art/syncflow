"use client";

import { SignInButton, Show } from "@clerk/nextjs";
import Link from "next/link";
import { CheckCircle2, Zap, Users, BarChart3 } from "lucide-react";
import { InteractiveHero } from "@/components/ui/interactive-hero-backgrounds";

export const LandingPage = () => {
  return (
    <div className="bg-black font-sans">
      {/* Hero Section */}
      <InteractiveHero
        brandName="21st"
        heroTitle="Interactive Hero Backgrounds"
        heroDescription="Engage users with dynamic, physics-inspired motion that feels alive and responsive while staying fast and clean."
        emailPlaceholder="Enter your email"
        ballpitConfig={{
          count: 150,
          gravity: 0.5,
          friction: 0.99,
          minSize: 0.4,
          maxSize: 0.9,
          lightIntensity: 4,
        }}
      />

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-black border-t border-gray-900">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-black opacity-30" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Why choose Sync-Flow?</h2>
            <p className="text-xl text-gray-400">Everything you need to manage projects effortlessly</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-3 rounded-lg w-fit mb-4 group-hover:from-pink-500/30 group-hover:to-purple-600/30 transition-all">
                <Zap className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Lightning Fast</h3>
              <p className="text-gray-400">Real-time updates and instant sync across all devices.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
              <div className="bg-gradient-to-br from-purple-500/20 to-cyan-600/20 p-3 rounded-lg w-fit mb-4 group-hover:from-purple-500/30 group-hover:to-cyan-600/30 transition-all">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Team Collaboration</h3>
              <p className="text-gray-400">Work together seamlessly from anywhere in the world.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-lg w-fit mb-4 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                <BarChart3 className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Analytics</h3>
              <p className="text-gray-400">Track progress with powerful insights and reports.</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
              <div className="bg-gradient-to-br from-pink-500/20 to-red-600/20 p-3 rounded-lg w-fit mb-4 group-hover:from-pink-500/30 group-hover:to-red-600/30 transition-all">
                <CheckCircle2 className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Stay Organized</h3>
              <p className="text-gray-400">Manage tasks and priorities with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-purple-950/20 opacity-30" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-950/40 to-pink-950/40 rounded-2xl p-12 border border-purple-500/30 backdrop-blur-xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">Start organizing today</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join teams that are already transforming how they work.
          </p>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="group relative px-8 py-4 font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-red-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
                <span className="relative">Try Sync-Flow Free</span>
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <button className="group relative px-8 py-4 font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-red-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
                <span className="relative">Go to Dashboard</span>
              </button>
            </Link>
          </Show>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-900 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-8">
            <Link href="/" className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">
              Sync-Flow
            </Link>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-gray-600 border-t border-gray-900 pt-8">
            <p>&copy; 2026 Sync-Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
