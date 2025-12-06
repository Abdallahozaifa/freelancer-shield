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
  if (hours === null || hours === undefined) return '—';
  const num = Number(hours);
  return num % 1 === 0 ? num.toFixed(0) + 'h' : num.toFixed(1) + 'h';
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
        'group grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-slate-100 items-center',
        'transition-all duration-200 hover:bg-slate-50',
        isDragging && 'shadow-lg border-blue-300 bg-blue-50',
        item.is_completed && 'bg-slate-50/50'
      )}
    >
      {/* 1. Status - col-span-1 */}
      <div className="col-span-1 flex items-center gap-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className={cn(
            'flex-shrink-0 cursor-grab active:cursor-grabbing',
            'text-slate-300 hover:text-slate-500 transition-colors'
          )}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(item)}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200',
            'flex items-center justify-center',
            item.is_completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-400'
          )}
          aria-label={item.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {item.is_completed && <Check className="w-3 h-3" strokeWidth={3} />}
        </button>
      </div>

      {/* 2. Deliverable - col-span-7 */}
      <div className="col-span-6 md:col-span-7 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-slate-900 truncate',
            item.is_completed && 'line-through text-slate-500'
          )}
        >
          {item.title}
        </p>
        {item.description && (
          <p
            className={cn(
              'text-xs text-slate-500 mt-0.5 truncate',
              item.is_completed && 'text-slate-400'
            )}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* 3. Estimate - col-span-2, right aligned */}
      <div className="col-span-3 md:col-span-2 text-right">
        <span
          className={cn(
            'text-sm font-medium text-slate-600',
            item.is_completed && 'text-slate-400'
          )}
        >
          {formatHours(item.estimated_hours)}
        </span>
      </div>

      {/* 4. Actions - col-span-2, always visible */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className={cn(
            'p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50',
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
            'p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50',
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