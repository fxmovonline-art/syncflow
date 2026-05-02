"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card, AuditLog } from "@prisma/client";
import { CardModal } from "./card-modal";

interface CardItemProps {
  data: Card;
  index: number;
  boardLogs?: AuditLog[];
}

export const CardItem = ({ data, index, boardLogs = [] }: CardItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={data.id} index={index}>
        {(provided, snapshot) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            onClick={() => setIsModalOpen(true)}
            className={`
              group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/5 hover:border-white/20 
              transition-all duration-200 select-none shadow-sm cursor-pointer
              ${snapshot.isDragging ? "rotate-[3deg] scale-[1.05] shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-white/20 border-white/30 z-50 cursor-grabbing ring-1 ring-white/30" : ""}
            `}
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-1.5">
                {index % 3 === 0 && (
                  <div className="h-1.5 w-8 rounded-full bg-emerald-500/50" />
                )}
                {index % 4 === 0 && (
                  <div className="h-1.5 w-8 rounded-full bg-rose-500/50" />
                )}
              </div>
              <p className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors">
                {data.title}
              </p>
              <div className="flex items-center gap-x-2 mt-1">
                <div className="h-4 w-4 rounded-full bg-white/5 flex items-center justify-center text-[8px] text-zinc-500">
                  {index + 1}
                </div>
                <div className="h-1 w-1 rounded-full bg-zinc-600" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-tight">SyncFlow</span>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <CardModal card={data} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} boardLogs={boardLogs} />
    </>
  );
};
