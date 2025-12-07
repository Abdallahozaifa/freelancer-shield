import React, { useState, useCallback, useRef } from 'react';
import { ScopeItemCard } from './ScopeItemCard';
import { cn } from '../../../utils/cn';
import type { ScopeItem } from '../../../types';

interface ScopeDragDropProps {
  items: ScopeItem[];
  onReorder: (itemIds: string[]) => void;
  onToggleComplete: (item: ScopeItem) => void;
  onEdit: (item: ScopeItem) => void;
  onDelete: (item: ScopeItem) => void;
}

export const ScopeDragDrop: React.FC<ScopeDragDropProps> = ({
  items,
  onReorder,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      setDraggedId(itemId);
      dragNodeRef.current = e.currentTarget;

      // Set drag data (with null check for test environment)
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
      }

      // Add visual feedback after a small delay
      setTimeout(() => {
        if (dragNodeRef.current) {
          dragNodeRef.current.style.opacity = '0.5';
        }
      }, 0);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
    setDraggedId(null);
    setDragOverId(null);
    dragNodeRef.current = null;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      e.preventDefault();
      
      // Set drop effect (with null check for test environment)
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      if (draggedId && draggedId !== itemId) {
        setDragOverId(itemId);
      }
    },
    [draggedId]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();

      if (!draggedId || draggedId === targetId) {
        handleDragEnd();
        return;
      }

      // Calculate new order
      const currentItems = [...items];
      const draggedIndex = currentItems.findIndex((item) => item.id === draggedId);
      const targetIndex = currentItems.findIndex((item) => item.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        handleDragEnd();
        return;
      }

      // Remove dragged item and insert at target position
      const [removed] = currentItems.splice(draggedIndex, 1);
      currentItems.splice(targetIndex, 0, removed);

      // Call reorder with new order
      const newOrder = currentItems.map((item) => item.id);
      onReorder(newOrder);

      handleDragEnd();
    },
    [draggedId, items, onReorder, handleDragEnd]
  );

  return (
    <div className="space-y-0 lg:space-y-0">
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          className={cn(
            dragOverId === item.id && draggedId !== item.id
              ? 'border-t-2 border-blue-400'
              : ''
          )}
        >
          <ScopeItemCard
            item={item}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            isDragging={draggedId === item.id}
            dragHandleProps={{
              onMouseDown: (e) => e.stopPropagation(),
            }}
          />
        </div>
      ))}
    </div>
  );
};
