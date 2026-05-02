"use client";

import { AuditLog } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ActivityItemProps {
  data: AuditLog;
}

const generateLogMessage = (log: AuditLog) => {
  const { action, entityType, entityTitle } = log;

  switch (action) {
    case "CREATE":
      return `created ${entityType.toLowerCase()} "${entityTitle}"`;
    case "UPDATE":
      return `updated ${entityType.toLowerCase()} "${entityTitle}"`;
    case "DELETE":
      return `deleted ${entityType.toLowerCase()} "${entityTitle}"`;
    default:
      return `performed an action on ${entityType.toLowerCase()} "${entityTitle}"`;
  }
};

export const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <div className="flex items-start gap-x-3 group cursor-default">
      <Avatar className="h-8 w-8 border border-white/10">
        {data.userImage && <AvatarImage src={data.userImage} alt={data.userName} />}
        <AvatarFallback className="bg-white/5 text-[10px] text-zinc-400 font-semibold">
          {data.userName?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-y-0.5">
        <p className="text-sm text-zinc-100 font-medium">
          <span className="font-bold text-white mr-1">{data.userName || "Unknown User"}</span>
          <span className="text-zinc-400 text-xs">
            {generateLogMessage(data)}
          </span>
        </p>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
          {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};
