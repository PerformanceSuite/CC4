import { useState, useCallback } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (taskDescription: string) => Promise<void>;
}

export function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps) {
  const [taskDescription, setTaskDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setTaskDescription('');
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(taskDescription.trim());
      setTaskDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Describe what you want to build..."
            rows={4}
            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none resize-none text-white placeholder-gray-500"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            AI will analyze your task and suggest the best approach
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!taskDescription.trim()}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
