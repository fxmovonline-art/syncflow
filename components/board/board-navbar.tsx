"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BoardNavbar() {
  return (
    <nav className="h-14 w-full bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-x-4">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-x-4">
        {/* Only show the active user's avatar in board view */}
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8",
              userButtonBox: "flex-row-reverse",
            }
          }}
        />
      </div>
    </nav>
  );
}
