/**
 * FilePicker - Reusable file browser component
 *
 * Displays a hierarchical file tree for selecting files from a project repository.
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import type { FileNode } from '../../api/client';

interface FilePickerProps {
  files: FileNode[];
  onSelect: (path: string) => void;
  selectedPath?: string;
  isLoading?: boolean;
}

interface TreeItemProps {
  node: FileNode;
  level: number;
  onSelect: (path: string) => void;
  selectedPath?: string;
}

function TreeItem({ node, level, onSelect, selectedPath }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded
          hover:bg-cc-border transition-colors
          ${isSelected ? 'bg-cc-accent/20 text-cc-accent' : 'text-gray-300'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'directory' ? (
          <>
            {hasChildren && (
              isExpanded ?
                <ChevronDown className="w-4 h-4 flex-shrink-0" /> :
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            {!hasChildren && <div className="w-4" />}
            <Folder className="w-4 h-4 flex-shrink-0 text-yellow-500" />
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="w-4 h-4 flex-shrink-0 text-blue-400" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.type === 'directory' && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilePicker({ files, onSelect, selectedPath, isLoading }: FilePickerProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Loading files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No files found
      </div>
    );
  }

  return (
    <div className="border border-cc-border rounded-lg bg-cc-bg max-h-96 overflow-y-auto">
      {files.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          level={0}
          onSelect={onSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
}
