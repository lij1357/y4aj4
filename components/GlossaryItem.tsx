
import React from 'react';

interface GlossaryItemProps {
  name: string;
  onRemove: (name: string) => void;
}

export const GlossaryItem: React.FC<GlossaryItemProps> = ({ name, onRemove }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/40 border border-indigo-500/30 rounded-full text-sm text-indigo-200 hover:bg-indigo-900/60 transition-colors group">
      <span>{name}</span>
      <button 
        onClick={() => onRemove(name)}
        className="text-indigo-400 hover:text-indigo-100 transition-colors"
      >
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
};
