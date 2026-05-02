import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-full flex bg-zinc-50 dark:bg-black overflow-hidden font-sans">
        <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
          <Sidebar />
        </div>
        <main className="md:pl-64 flex flex-col flex-1 w-full h-full">
          <Navbar />
          <div className="flex-1 overflow-y-auto w-full">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
