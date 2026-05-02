"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { List, Card, AuditLog } from "@prisma/client";
import { toast } from "sonner";

import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";

import { ListItem } from "./list-item";
import { ListForm } from "./list-form";

interface ListContainerProps {
  data: (List & { cards: Card[] })[];
  boardId: string;
  boardLogs?: AuditLog[];
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const ListContainer = ({ data, boardId, boardLogs = [] }: ListContainerProps) => {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [orderedData, setOrderedData] = useState(data);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // User moves a list
    if (type === "list") {
      const items = reorder(
        orderedData,
        source.index,
        destination.index
      ).map((item, index) => ({ ...item, order: index }));

      setOrderedData(items);
      
      startTransition(async () => {
        const res = await updateListOrder(items, boardId, params.slug as string);
        if (res.error) {
          toast.error(res.error);
          setOrderedData(data); // Rollback on error
        }
      });
    }

    // User moves a card
    if (type === "card") {
      let newOrderedData = [...orderedData];

      // Source and destination list
      const sourceList = newOrderedData.find(list => list.id === source.droppableId);
      const destList = newOrderedData.find(list => list.id === destination.droppableId);

      if (!sourceList || !destList) {
        return;
      }

      // Check if cards exists on the sourceList
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // Check if cards exists on the destList
      if (!destList.cards) {
        destList.cards = [];
      }

      // Moving the card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);
        
        startTransition(async () => {
          const res = await updateCardOrder(reorderedCards, params.slug as string);
          if (res.error) {
            toast.error(res.error);
            setOrderedData(data);
          }
        });
      } else {
        // Moving the card to another list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // Assign the new listId to the moved card
        movedCard.listId = destination.droppableId;

        // Add card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        // Update the order for each card in the destination list
        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        setOrderedData(newOrderedData);
        
        startTransition(async () => {
          const res = await updateCardOrder(destList.cards, params.slug as string);
          if (res.error) {
            toast.error(res.error);
            setOrderedData(data);
          }
        });
      }
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`
              flex-1 overflow-x-auto p-4 flex gap-4 items-start h-full transition-colors duration-200
              ${snapshot.isDraggingOver ? "bg-zinc-100/30 dark:bg-zinc-900/10" : ""}
            `}
          >
            {orderedData.map((list, index) => (
              <ListItem 
                key={list.id} 
                index={index}
                data={list}
                boardLogs={boardLogs}
              />
            ))}
            {provided.placeholder}
            <div className="shrink-0 w-1 px-1" /> {/* Spacer to prevent flickering on last item */}
            <ListForm boardId={boardId} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
