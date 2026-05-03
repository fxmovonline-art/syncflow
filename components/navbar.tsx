"use client";

import { UserButton } from "@clerk/nextjs";
import { OrgSwitcherWrapper } from "@/components/org-switcher-wrapper";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const Navbar = () => {
  return (
    <div className="flex items-center p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm h-16 w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Logo on Mobile */}
      <Link href="/dashboard" className="md:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-4">
        Sync-Flow
      </Link>
      
      <div className="flex w-full justify-end items-center gap-x-3 md:gap-x-4">
        {/* Organization Switcher - Only show in dashboard view, not in board */}
        <OrgSwitcherWrapper
          hidePersonal={false}
          afterCreateOrganizationUrl="/dashboard?workspace=organization"
          afterLeaveOrganizationUrl="/dashboard?workspace=personal"
          afterSelectOrganizationUrl="/dashboard?workspace=organization"
          afterSelectPersonalUrl="/dashboard?workspace=personal"
          appearance={{
            elements: {
              rootBox: "flex justify-center items-center",
              organizationSwitcherTrigger: "py-1.5 px-2 md:px-3 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-black text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
            }
          }}
        />
        {/* Active User Avatar */}
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8",
            }
          }}
        />
      </div>
    </div>
  );
};
