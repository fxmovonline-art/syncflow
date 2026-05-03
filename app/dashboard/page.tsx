import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CreateBoardModal } from "@/components/create-board-modal";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Force sync Clerk data to database
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  try {
    await db.user.upsert({
      where: { clerkId: userId },
      update: { email, name, imageUrl: user.imageUrl },
      create: { clerkId: userId, email, name, imageUrl: user.imageUrl },
    });
  } catch (error) {
    console.error("Failed to upsert user:", error);
  }

  // Always show personal boards on dashboard, regardless of orgId
  // Users can navigate to organization via the org switcher or /organization/[orgId]
  const boardContext = "personal";
  const boards = await db.board.findMany({
    where: { userId, orgId: null },
    orderBy: { createdAt: "desc" },
  });

  const emailPrefix = email.split("@")[0];
  const displayName = user.firstName || emailPrefix;
  const workspaceName = "Personal workspace";
  const latestBoard = boards[0];
  const latestBoardDate = latestBoard
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(latestBoard.createdAt))
    : "No boards yet";
  const boardsThisMonth = boards.filter((board) => {
    const createdAt = new Date(board.createdAt);
    const now = new Date();
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;
  const boardsWithCovers = boards.filter((board) => Boolean(board.imageThumbUrl)).length;
  const boardsWithoutCovers = boards.length - boardsWithCovers;

  return (
    <div className="flex flex-1 flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-900 shadow-sm dark:border-emerald-300/40 dark:bg-emerald-300/15 dark:text-emerald-100">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-300" />
                Dashboard
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                  {workspaceName}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-100/85">
                  Welcome back, {displayName}. Plan clearly, move faster, and
                  keep your boards easy to navigate.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Workspace snapshot
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    <Users className="size-4 text-emerald-600" />
                    Access
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Private
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    <CalendarDays className="size-4 text-sky-600" />
                    Latest
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {latestBoardDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-300 bg-[linear-gradient(135deg,#047857,#059669_45%,#34d399)] p-4 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-emerald-50">Total Boards</p>
                <LayoutDashboard className="size-4" />
              </div>
              <p className="mt-3 text-4xl font-semibold leading-none">{boards.length}</p>
              <p className="mt-2 text-xs text-emerald-100/90">Across current workspace</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">This Month</p>
                <Clock3 className="size-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-4xl font-semibold leading-none text-zinc-900 dark:text-white">
                {boardsThisMonth}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">New boards created</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">With Cover</p>
                <FolderKanban className="size-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-4xl font-semibold leading-none text-zinc-900 dark:text-white">
                {boardsWithCovers}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Visual boards ready</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No Cover</p>
                <Target className="size-4 text-zinc-500" />
              </div>
              <p className="mt-3 text-4xl font-semibold leading-none text-zinc-900 dark:text-white">
                {boardsWithoutCovers}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Need visual cover</p>
            </div>
          </div>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid min-h-[460px] w-full place-items-center rounded-lg border border-dashed border-emerald-300 bg-white/90 p-8 text-center shadow-lg shadow-emerald-900/5 dark:border-emerald-300/30 dark:bg-white/[0.06] dark:shadow-black/30">
            <div className="max-w-md">
              <div className="mx-auto mb-6 grid size-16 place-items-center rounded-lg bg-[linear-gradient(135deg,#059669,#0284c7,#16a34a)] text-white shadow-lg shadow-sky-900/20">
                <LayoutDashboard className="size-8" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Build your first board
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Start a focused board and keep your work structured from planning
                to delivery.
              </p>
              <CreateBoardModal>
                <Button
                  size="lg"
                  className="mt-7 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Plus className="size-4" />
                  Create board
                </Button>
              </CreateBoardModal>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Your boards
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Quick access to all active workspaces.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CreateBoardModal>
              <button className="group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300 bg-cyan-50 p-6 text-center shadow-sm shadow-cyan-900/5 transition hover:-translate-y-0.5 hover:border-cyan-500 hover:bg-white hover:shadow-md dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:hover:border-cyan-200/70 dark:hover:bg-cyan-300/15">
                <div className="grid size-11 place-items-center rounded-lg bg-cyan-600 text-white transition group-hover:scale-105 dark:bg-cyan-300 dark:text-slate-950">
                  <Plus className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                  Create new board
                </h3>
                <p className="mt-1 max-w-48 text-sm text-slate-600 dark:text-slate-300">
                  Start a clean space for your next project.
                </p>
              </button>
            </CreateBoardModal>

            {boards.map((board, index) => (
              <Link
                key={board.id}
                href={`/board/${board.slug}`}
                className="group relative min-h-52 overflow-hidden rounded-lg border border-white bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-950 dark:shadow-black/40 dark:ring-white/10"
              >
                {board.imageThumbUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#be123c_0%,#0369a1_45%,#16a34a_100%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
                <div className="relative flex h-full min-h-52 flex-col justify-between p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm">
                      Board {index + 1}
                    </span>
                    <span className="grid size-8 place-items-center rounded-lg bg-white/20 backdrop-blur transition group-hover:bg-white group-hover:text-slate-950">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight">
                      {board.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/85">
                      <CalendarDays className="size-4" />
                      Created{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(board.createdAt))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
