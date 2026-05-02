import Link from "next/link";
import { LayoutDashboard, Activity, Settings } from "lucide-react";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Boards",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Activity",
    icon: Activity,
    href: "/dashboard/activity",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export const Sidebar = () => {
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 w-64 shadow-sm">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-primary">SyncFlow</h1>
        </Link>
        <div className="px-3 mb-6">
          <OrganizationSwitcher 
            hidePersonal={false}
            afterCreateOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            afterSelectPersonalUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full justify-center flex",
                organizationSwitcherTrigger: "w-full border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 flex justify-between items-center bg-white dark:bg-black",
              }
            }}
          />
        </div>
        <div className="space-y-3 px-3">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant="ghost"
              className="w-full justify-start text-sm font-medium items-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
