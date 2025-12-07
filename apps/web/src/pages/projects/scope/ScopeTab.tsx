import React, { useState, useCallback } from 'react';
import { Plus, ListChecks, Target, AlertCircle } from 'lucide-react';
import { Button, EmptyState, Skeleton, useToast } from '../../../components/ui';
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
  const toast = useToast();

  // Queries
  const { data: items, isLoading, error, refetch } = useScopeItems(projectId);
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
          toast.success('Deliverable updated');
        } else {
          const order = items?.length ?? 0;
          await createItem.mutateAsync({
            projectId,
            data: { ...data, order } as ScopeItemCreate,
          });
          toast.success('Deliverable added successfully');
        }
        handleCloseForm();
        refetch();
      } catch (error) {
        toast.error(editingItem ? 'Failed to update deliverable' : 'Failed to add deliverable');
      }
    },
    [projectId, editingItem, items?.length, createItem, updateItem, handleCloseForm, toast, refetch]
  );

  const handleToggleComplete = useCallback(
    async (item: ScopeItem) => {
      try {
        await updateItem.mutateAsync({
          projectId,
          itemId: item.id,
          data: { is_completed: !item.is_completed },
        });
        toast.success(item.is_completed ? 'Marked as incomplete' : 'Marked as complete');
        refetch();
      } catch (error) {
        toast.error('Failed to update deliverable status');
      }
    },
    [projectId, updateItem, toast, refetch]
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
      toast.success('Deliverable removed');
      setDeletingItem(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete deliverable');
    }
  }, [projectId, deletingItem, deleteItem, toast, refetch]);

  const handleReorder = useCallback(
    async (itemIds: string[]) => {
      try {
        await reorderItems.mutateAsync({ projectId, itemIds });
        // Silent success - UI already shows the new order
      } catch (error) {
        toast.error('Failed to reorder items. Please try again.');
      }
    },
    [projectId, reorderItems, toast]
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-4 sm:pb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            Scope Definition
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Define the specific deliverables agreed upon. Clear scope prevents creep.
          </p>
        </div>
        {hasItems && (
          <Button 
            variant="primary" 
            onClick={handleOpenCreateForm} 
            className="w-full sm:w-auto shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deliverable
          </Button>
        )}
      </div>

      {/* Progress Overview */}
      {hasItems && progress && (
        <div className="mb-6 sm:mb-8">
          <ScopeProgressCard progress={progress} />
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] sm:min-h-[400px]">
        {hasItems ? (
          <div className="p-1">
            {/* List Header - Hide on mobile, show on desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Status</div>
              <div className="col-span-7">Deliverable</div>
              <div className="col-span-2 text-right">Estimate</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {/* Mobile Header - Simple */}
            <div className="lg:hidden px-4 py-2 bg-slate-50/80 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {items.length} Deliverable{items.length !== 1 ? 's' : ''}
              </span>
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
          <div className="py-12 sm:py-16 px-4 sm:px-6">
            <EmptyState
              icon={<ListChecks className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />}
              title="No deliverables defined yet"
              description="Start by adding the first item to the project scope."
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