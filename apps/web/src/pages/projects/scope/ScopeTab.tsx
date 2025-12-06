import React, { useState, useCallback } from 'react';
import { Plus, ListChecks, CheckCircle2, Target, AlertCircle } from 'lucide-react';
import { Button, Card, EmptyState, Skeleton } from '../../../components/ui';
import { ScopeProgressCard } from './ScopeProgressCard';
import { ScopeDragDrop } from './ScopeDragDrop';
import { ScopeItemForm } from './ScopeItemForm';
import { DeleteScopeItemModal } from './DeleteScopeItemModal';
import {
  useScopeItems,
  useScopeProgress,
  useCreateScopeItem,
  useUpdateScopeItem,
  useDeleteScopeItem,
  useReorderScopeItems,
} from '../../../hooks/useScope';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate } from '../../../types';

interface ScopeTabProps {
  projectId: string;
}

export const ScopeTab: React.FC<ScopeTabProps> = ({ projectId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScopeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ScopeItem | null>(null);

  // Queries
  const { data: items, isLoading, error } = useScopeItems(projectId);
  const { data: progress } = useScopeProgress(projectId);

  // Mutations
  const createItem = useCreateScopeItem();
  const updateItem = useUpdateScopeItem();
  const deleteItem = useDeleteScopeItem();
  const reorderItems = useReorderScopeItems();

  // Handlers
  const handleOpenCreateForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((item: ScopeItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleSubmitForm = useCallback(
    async (data: ScopeItemCreate | ScopeItemUpdate) => {
      try {
        if (editingItem) {
          await updateItem.mutateAsync({
            projectId,
            itemId: editingItem.id,
            data,
          });
        } else {
          const order = items?.length ?? 0;
          await createItem.mutateAsync({
            projectId,
            data: { ...data, order } as ScopeItemCreate,
          });
        }
        handleCloseForm();
      } catch (error) {
        console.error('Failed to save scope item:', error);
      }
    },
    [projectId, editingItem, items?.length, createItem, updateItem, handleCloseForm]
  );

  const handleToggleComplete = useCallback(
    async (item: ScopeItem) => {
      try {
        await updateItem.mutateAsync({
          projectId,
          itemId: item.id,
          data: { is_completed: !item.is_completed },
        });
      } catch (error) {
        console.error('Failed to toggle completion:', error);
      }
    },
    [projectId, updateItem]
  );

  const handleDeleteClick = useCallback((item: ScopeItem) => {
    setDeletingItem(item);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteItem.mutateAsync({
        projectId,
        itemId: deletingItem.id,
      });
      setDeletingItem(null);
    } catch (error) {
      console.error('Failed to delete scope item:', error);
    }
  }, [projectId, deletingItem, deleteItem]);

  const handleReorder = useCallback(
    async (itemIds: string[]) => {
      try {
        await reorderItems.mutateAsync({ projectId, itemIds });
      } catch (error) {
        console.error('Failed to reorder items:', error);
      }
    },
    [projectId, reorderItems]
  );

  if (isLoading) {
    return <ScopeTabSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-900 font-medium mb-4">Unable to load scope items.</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="bg-white">
          Retry Connection
        </Button>
      </div>
    );
  }

  const hasItems = items && items.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Scope Definition
          </h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Define the specific deliverables agreed upon. Clear scope prevents creep.
          </p>
        </div>
        {hasItems && (
           <Button variant="primary" onClick={handleOpenCreateForm} className="shadow-lg shadow-indigo-500/20">
             <Plus className="w-4 h-4 mr-2" />
             Add Deliverable
           </Button>
        )}
      </div>

      {/* Progress Overview */}
      {hasItems && progress && (
        <div className="mb-8">
          <ScopeProgressCard progress={progress} />
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {hasItems ? (
          <div className="p-1">
             {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Status</div>
              <div className="col-span-6 md:col-span-7">Deliverable</div>
              <div className="col-span-3 md:col-span-2 text-right">Estimate</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {/* Draggable List */}
            <div className="bg-white">
              <ScopeDragDrop
                items={items}
                onReorder={handleReorder}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        ) : (
          <div className="py-16 px-6">
            <EmptyState
              icon={<ListChecks className="w-12 h-12 text-slate-300" />}
              title="No deliverables defined yet"
              description="Start by adding the first item to the project scope. This will serve as the baseline for detecting scope creep."
              action={{
                label: 'Add First Item',
                onClick: handleOpenCreateForm,
              }}
            />
          </div>
        )}
      </div>

      <ScopeItemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        item={editingItem}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      <DeleteScopeItemModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        item={deletingItem}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
};

const ScopeTabSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="space-y-3">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  </div>
);