import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import type { Persona } from '../../../api/client';

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (persona: string) => Promise<void>;
  taskTitle: string;
  personas: Persona[];
  defaultPersona?: string;
}

const DEFAULT_PERSONAS: Persona[] = [
  { name: 'backend-coder', category: 'development', description: 'Backend development' },
  { name: 'frontend-coder', category: 'development', description: 'Frontend development' },
  { name: 'fullstack-coder', category: 'development', description: 'Full-stack development' },
  { name: 'reviewer', category: 'review', description: 'Code review' },
  { name: 'challenger', category: 'review', description: 'Devils advocate' },
  { name: 'arbiter', category: 'review', description: 'Synthesize decisions' },
];

export function AddAgentModal({
  open,
  onClose,
  onAdd,
  taskTitle,
  personas,
  defaultPersona = 'backend-coder',
}: AddAgentModalProps) {
  const [persona, setPersona] = useState(defaultPersona);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayPersonas = personas.length > 0 ? personas : DEFAULT_PERSONAS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd(persona);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Agent" maxWidth="sm">
      <p className="text-gray-400 text-sm mb-4">
        Add another agent to work on "{taskTitle}"
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Persona</label>
          <div className="relative">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none appearance-none cursor-pointer"
            >
              {displayPersonas.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} - {p.description || p.category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Add Agent
          </Button>
        </div>
      </form>
    </Modal>
  );
}
