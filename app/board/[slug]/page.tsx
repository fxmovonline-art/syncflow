import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { RealtimeBoardContainer } from "@/components/board/realtime-board-container";
import { BoardPresence } from "@/components/board/board-presence";
import { BoardSettings } from "@/components/board/board-settings";
import { ActivityItem } from "@/components/activity-item";
import { BoardAccessDeniedError } from "@/components/board-access-denied-error";
import { Button } from "@/components/ui/button";
import { Share2, Users, Star } from "lucide-react";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const fallbackTitle = "Board";

  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { title: fallbackTitle };
    }

    const { slug } = await params;
    const board = await db.board.findUnique({
      where: { slug },
      select: {
        title: true,
        userId: true,
        orgId: true,
      },
    });

    if (!board) {
      return { title: fallbackTitle };
    }

    const hasAccess =
      board.userId === userId || Boolean(board.orgId && board.orgId === orgId);

    return {
      title: hasAccess ? board.title : fallbackTitle,
    };
  } catch {
    return { title: fallbackTitle };
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const { slug } = await params;

  // Fetch board - user must either own it personally or belong to its organization
  const board = await db.board.findUnique({
    where: { slug },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!board) {
    notFound();
  }

  // Access Control: Check if user has permission to access this board
  // Permission is granted if:
  // 1. User is the board owner (personal board)
  // 2. Board belongs to an organization AND user is a member of that organization
  
  let hasAccess = false;

  // Check personal ownership
  if (board.userId === userId) {
    hasAccess = true;
  }
  // Check organization membership
  else if (board.orgId) {
    // User must have this orgId in their current context
    // OR we could check user's organizationMemberships if needed
    hasAccess = orgId === board.orgId;
  }

  if (!hasAccess) {
    // If board belongs to an org and user tried to access it, show helpful error
    if (board.orgId) {
      return <BoardAccessDeniedError />;
    }
    // Otherwise redirect to dashboard
    redirect("/dashboard");
  }

  // Fetch organization members for member stack display
  // Note: Active session detection now happens client-side in BoardPresence component
  // This serves as a fallback for server-side rendering
  let fallbackUsers: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email?: string;
  }> = [];

  if (user) {
    fallbackUsers = [
      {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl,
        email: user.emailAddresses?.[0]?.emailAddress || "",
      },
    ];
  }

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Background Image or Gradient */}
      {board.imageFullUrl ? (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${board.imageFullUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Overlay for content readability */}
          <div className="absolute inset-0 z-1 bg-black/50" />
        </>
      ) : (
        <>
          {/* Default Gradient Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
          </div>
        </>
      )}

      {/* Attribution Link (Unsplash) */}
      {board.imageUserName && board.imageLinkHTML && (
        <a
          href={board.imageLinkHTML}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-20 text-xs text-white/60 hover:text-white/80 transition-colors bg-black/30 px-2 py-1 rounded"
          title="Photo by Unsplash"
        >
          Photo by {board.imageUserName}
        </a>
      )}

      {/* Board Header - Glassmorphic */}
      <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 z-10 backdrop-blur-md bg-black/20 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-x-2 sm:gap-x-4 min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">{board.title}</h1>
          <Button variant="ghost" size="icon" className="hidden sm:flex text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0">
            <Star className="h-4 w-4" />
          </Button>
          <div className="h-6 w-[1px] bg-white/10 mx-2 hidden sm:block" />
          <BoardPresence 
            boardId={board.id}
            fallbackUsers={fallbackUsers.map(member => ({
              id: member.id,
              name: `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email || "You",
              imageUrl: member.imageUrl,
              email: member.email
            }))} 
          />
          <Button variant="secondary" size="sm" className="hidden md:flex ml-2 bg-white/10 text-white hover:bg-white/20 border-none h-8 flex-shrink-0">
            <Users className="h-4 w-4 mr-2" />
            Team
          </Button>
        </div>

        <div className="flex items-center gap-x-2 sm:gap-x-3 flex-shrink-0">
          <Button variant="secondary" size="sm" className="hidden sm:flex bg-indigo-600 text-white hover:bg-indigo-700 border-none h-8 px-4 font-medium">
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <BoardSettings boardId={board.id} boardTitle={board.title} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <RealtimeBoardContainer 
            initialBoard={board}
            slug={slug}
          />
        </div>

        {/* Board Sidebar - Right Side (Desktop Only for now) */}
        <aside className="hidden lg:flex w-72 h-full flex-col backdrop-blur-xl bg-black/40 border-l border-white/10 text-white p-6 shrink-0">
          <div className="flex items-center gap-x-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Live Activity</h2>
          </div>
          
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Real Activity Items */}
            <div className="space-y-6">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Recent Activity</p>
              <div className="space-y-6">
                {board.logs.map((log) => (
                  <ActivityItem key={log.id} data={log} />
                ))}
                {board.logs.length === 0 && (
                  <div className="text-xs text-zinc-600 italic py-4">No activity logged yet...</div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-zinc-500 font-medium mb-4">BOARD STATS</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-indigo-400">{board.lists.length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Lists</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-pink-400">{board.lists.flatMap(l => l.cards).length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Cards</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
