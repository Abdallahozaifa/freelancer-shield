import React, { useState, useCallback } from 'react';
import { Plus, ListChecks } from 'lucide-react';
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
          // Set order to be at the end of the list
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

  // Loading state
  if (isLoading) {
    return <ScopeTabSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load scope items.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  const hasItems = items && items.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Scope Items</h2>
        <Button variant="primary" size="sm" onClick={handleOpenCreateForm}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {/* Progress card - only show when there are items */}
      {hasItems && progress && <ScopeProgressCard progress={progress} />}

      {/* Items list or empty state */}
      {hasItems ? (
        <ScopeDragDrop
          items={items}
          onReorder={handleReorder}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEditForm}
          onDelete={handleDeleteClick}
        />
      ) : (
        <Card padding="none">
          <EmptyState
            icon={<ListChecks className="w-6 h-6" />}
            title="No scope items yet"
            description="Define your project scope by adding items that outline what's included in this project."
            action={{
              label: 'Add First Item',
              onClick: handleOpenCreateForm,
            }}
          />
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <ScopeItemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        item={editingItem}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      {/* Delete Confirmation Modal */}
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

// Loading skeleton
const ScopeTabSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-9 w-28" />
    </div>
    <Skeleton className="h-24 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);
