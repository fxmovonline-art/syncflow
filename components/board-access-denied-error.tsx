"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function BoardAccessDeniedError() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-zinc-400">
            This board belongs to an organization. You need to be a member of that organization to access it.
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left space-y-3">
          <h3 className="font-semibold text-blue-300 text-sm">How to fix this:</h3>
          <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
            <li>Go to your Dashboard</li>
            <li>Click the workspace selector at the top</li>
            <li>Choose the correct organization</li>
            <li>You should now see all shared boards</li>
          </ol>
        </div>

        <Link href="/dashboard">
          <Button className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
