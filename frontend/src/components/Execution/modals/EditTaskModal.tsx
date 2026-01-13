import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
  }) => Promise<void>;
  initialTitle: string;
  initialDescription: string;
}

export function EditTaskModal({
  open,
  onClose,
  onSave,
  initialTitle,
  initialDescription,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with new task
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [open, initialTitle, initialDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Implement memory service"
            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed task instructions for the agent..."
            rows={4}
            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim()}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
