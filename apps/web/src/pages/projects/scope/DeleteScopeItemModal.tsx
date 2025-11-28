import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import type { ScopeItem } from '../../../types';

interface DeleteScopeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ScopeItem | null;
  isLoading?: boolean;
}

export const DeleteScopeItemModal: React.FC<DeleteScopeItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  isLoading = false,
}) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Scope Item" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-medium">"{item.title}"</span>?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
