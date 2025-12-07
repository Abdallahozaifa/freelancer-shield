import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button, useToast } from '../../components/ui';
import { useDeleteClient } from '../../hooks/useClients';
import type { Client } from '../../types';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onDeleted?: () => void;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onDeleted,
}) => {
  const toast = useToast();
  const deleteMutation = useDeleteClient();

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteMutation.mutateAsync(client.id);
      toast.success('Client deleted successfully');
      onClose();
      onDeleted?.();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  if (!client) return null;

  const hasProjects = client.project_count > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Client" size="sm">
      <div className="space-y-4">
        {/* Content - Stack icon on mobile for very small screens */}
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">{client.name}</span>?
              This action cannot be undone.
            </p>
            {hasProjects && (
              <div className="mt-3 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs sm:text-sm text-amber-800">
                  <strong>Warning:</strong> This client has{' '}
                  <span className="font-semibold">{client.project_count}</span>{' '}
                  associated project(s). Deleting this client may affect those projects.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Stack buttons on mobile, reverse order for UX */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            Delete Client
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClientModal;
