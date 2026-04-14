"use client";

import { useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";

interface DraggableTaskListProps {
  tasks: Task[];
  onReorder: (orderedIds: number[]) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * Draggable task list with drag-and-drop reordering.
 *
 * Uses @hello-pangea/dnd (maintained fork of react-beautiful-dnd).
 *
 * Design decisions:
 * - Single droppable list (no columns/swim lanes)
 * - Persists order immediately on drop
 * - Visual feedback during drag
 */
export function DraggableTaskList({
  tasks,
  onReorder,
  onEdit,
  onDelete,
}: DraggableTaskListProps) {
  /**
   * Handle drag end - reorder tasks and persist.
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      // Dropped outside the list
      if (!result.destination) return;

      // Same position
      if (result.destination.index === result.source.index) return;

      // Reorder the array
      const reordered = Array.from(tasks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);

      // Extract IDs and call parent handler
      const orderedIds = reordered.map((task) => task.id);
      onReorder(orderedIds);
    },
    [tasks, onReorder]
  );

  if (tasks.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50 rounded-lg p-2 -m-2" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={String(task.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-shadow ${
                      snapshot.isDragging
                        ? "shadow-lg ring-2 ring-blue-400"
                        : ""
                    }`}
                  >
                    <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
