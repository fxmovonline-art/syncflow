import { Toaster } from "@/components/ui/sonner";
import { BoardNavbar } from "@/components/board/board-navbar";
import { ErrorBoundary } from "@/components/error-boundary";

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-full flex flex-col font-sans overflow-hidden transition-colors" style={{ backgroundColor: '#0079bf' }}>
        <BoardNavbar />
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
