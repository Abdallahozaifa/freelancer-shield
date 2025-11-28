import React from 'react';
import { GripVertical, Pencil, Trash2, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ScopeItem } from '../../../types';

interface ScopeItemCardProps {
  item: ScopeItem;
  onToggleComplete: (item: ScopeItem) => void;
  onEdit: (item: ScopeItem) => void;
  onDelete: (item: ScopeItem) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const formatHours = (hours: number | null): string => {
  if (hours === null || hours === undefined) return '0';
  const num = Number(hours);
  // Remove unnecessary decimal places (8.0 -> 8, 8.5 -> 8.5)
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};

export const ScopeItemCard: React.FC<ScopeItemCardProps> = ({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
  isDragging = false,
  dragHandleProps,
}) => {
  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg',
        'transition-all duration-200',
        isDragging && 'shadow-lg border-blue-300 bg-blue-50',
        item.is_completed && 'bg-gray-50'
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className={cn(
          'flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing',
          'text-gray-400 hover:text-gray-600 transition-colors'
        )}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleComplete(item)}
        className={cn(
          'flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200',
          'flex items-center justify-center',
          item.is_completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        )}
        aria-label={item.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {item.is_completed && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-gray-900 transition-all duration-200',
            item.is_completed && 'line-through text-gray-500'
          )}
        >
          {item.title}
        </p>
        {item.description && (
          <p
            className={cn(
              'text-sm text-gray-500 mt-0.5 line-clamp-2',
              item.is_completed && 'text-gray-400'
            )}
          >
            {item.description}
          </p>
        )}
        {item.estimated_hours !== null && (
          <p
            className={cn(
              'text-xs text-gray-400 mt-1.5',
              item.is_completed && 'text-gray-400'
            )}
          >
            Est: {formatHours(item.estimated_hours)}h
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className={cn(
            'p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50',
            'transition-colors duration-150'
          )}
          aria-label="Edit scope item"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className={cn(
            'p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50',
            'transition-colors duration-150'
          )}
          aria-label="Delete scope item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
