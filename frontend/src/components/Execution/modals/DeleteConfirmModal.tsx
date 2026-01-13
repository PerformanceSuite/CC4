import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cc-surface rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <p className="text-gray-400 mb-6">
          Are you sure you want to delete "{itemName}"? This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
