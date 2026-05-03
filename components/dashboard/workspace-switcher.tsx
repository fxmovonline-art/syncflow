"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Users } from "lucide-react";

export const WorkspaceSwitcher = () => {
  const { user } = useUser();

  const memberships = user?.organizationMemberships || [];

  if (!memberships || memberships.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Workspaces</h3>
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/dashboard?workspace=personal"
          className="px-3 py-1 rounded-md bg-white/90 dark:bg-zinc-900 text-sm font-medium border border-zinc-200 dark:border-zinc-800"
        >
          Personal
        </Link>
        {memberships.map((m) => (
          <Link
            key={m.organization.id}
            href={`/dashboard?workspace=organization&orgId=${m.organization.id}`}
            className="px-3 py-1 rounded-md bg-white/90 dark:bg-zinc-900 text-sm font-medium border border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>{m.organization.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
