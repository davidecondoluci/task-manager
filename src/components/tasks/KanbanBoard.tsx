"use client";

import { useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task, TaskStatus, STATUS_CONFIG } from "@/types";
import { TaskCard } from "./TaskCard";

/**
 * Column configuration for the Kanban board.
 * Order matches the visual layout: To Do → In Progress → Done
 */
const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onReorder: (status: TaskStatus, orderedIds: number[]) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * Kanban board with three columns for task management.
 *
 * Features:
 * - Drag tasks within a column to reorder
 * - Drag tasks across columns to change status
 * - Visual feedback during drag operations
 * - Empty state for columns with no tasks
 *
 * Design decisions:
 * - Each column is a separate droppable
 * - Status updates are immediate and optimistic
 * - Order is tracked per-column using sort_order field
 */
export function KanbanBoard({
  tasks,
  onStatusChange,
  onReorder,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  /**
   * Group tasks by status for rendering in columns.
   * Maintains sort_order within each column.
   */
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    // Group tasks by status
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    // Sort each column by sort_order (null values at the end)
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => {
        if (a.sort_order === null && b.sort_order === null) return 0;
        if (a.sort_order === null) return 1;
        if (b.sort_order === null) return -1;
        return a.sort_order - b.sort_order;
      });
    });

    return grouped;
  }, [tasks]);

  /**
   * Handle drag end - updates status or reorders within column.
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // Dropped outside any droppable
      if (!destination) return;

      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;
      const taskId = parseInt(draggableId, 10);

      // Same position in same column - no change
      if (sourceStatus === destStatus && source.index === destination.index) {
        return;
      }

      // Moving to different column - update status
      if (sourceStatus !== destStatus) {
        onStatusChange(taskId, destStatus);
        return;
      }

      // Reordering within the same column
      const columnTasks = [...tasksByStatus[sourceStatus]];
      const [moved] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, moved);

      const orderedIds = columnTasks.map((t) => t.id);
      onReorder(sourceStatus, orderedIds);
    },
    [tasksByStatus, onStatusChange, onReorder]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col">
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {column.title}
              </h2>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  STATUS_CONFIG[column.id].color
                }`}
              >
                {tasksByStatus[column.id].length}
              </span>
            </div>

            {/* Droppable column */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {/* Empty state */}
                  {tasksByStatus[column.id].length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Drop tasks here
                    </div>
                  )}

                  {/* Task cards */}
                  <div className="space-y-3">
                    {tasksByStatus[column.id].map((task, index) => (
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
                                ? "shadow-lg ring-2 ring-blue-400 rotate-2"
                                : ""
                            }`}
                          >
                            <TaskCard
                              task={task}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
