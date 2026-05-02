"use client";

import { UserButton, SignInButton, Show } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingHeader = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-900/50">
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between h-16">
        {/* Left Section: Logo & Navigation */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text hover:opacity-80 transition-opacity flex-shrink-0">
            Sync-Flow
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
              Features
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
              Pricing
            </a>
            <a href="#work" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
              Work
            </a>
            <a href="#about" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
              About
            </a>
          </div>
        </div>

        {/* Right Section: Auth & Actions */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Show when="signed-out">
            <a href="#help" className="hidden sm:block text-gray-400 hover:text-white transition-colors font-medium text-sm">
              Help
            </a>
            <SignInButton mode="modal">
              <button className="hidden sm:block text-gray-400 hover:text-white transition-colors font-medium text-sm">
                Login
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="group relative px-5 py-2 font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50 text-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
                <span className="relative">Try for free</span>
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard">
              <button className="group relative px-5 py-2 font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50 text-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
                <span className="relative">Dashboard</span>
              </button>
            </Link>
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
};
