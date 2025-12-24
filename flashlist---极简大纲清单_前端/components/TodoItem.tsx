
import React, { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Circle, CheckCircle2, ChevronRight } from 'lucide-react';
import { FlashListItem } from '../types';
import { INDENT_WIDTH } from '../constants';

interface TodoItemProps {
  item: FlashListItem;
  onUpdate?: (updates: Partial<FlashListItem>) => void;
  onEnter?: (type: 'task' | 'header') => void;
  onDelete?: () => void;
  onIndent?: (direction: 'in' | 'out') => void;
  onToggleComplete?: () => void;
  isFocused?: boolean;
  onFocus?: () => void;
  isOverlay?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  item, 
  onUpdate, 
  onEnter, 
  onDelete, 
  onIndent,
  onToggleComplete,
  isFocused,
  onFocus,
  isOverlay 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: isOverlay ? '1rem' : `${item.level * INDENT_WIDTH}px`,
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Slash commands support
      if (item.text.trim() === '/h') {
          onUpdate?.({ text: '', type: 'header' });
          return;
      }
      if (item.text.startsWith('/h ')) {
          onUpdate?.({ text: item.text.replace('/h ', ''), type: 'header' });
          return;
      }
      onEnter?.(item.type);
    } else if (e.key === 'Backspace' && item.text === '') {
      e.preventDefault();
      onDelete?.();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onIndent?.(e.shiftKey ? 'out' : 'in');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate?.({ text: e.target.value });
  };

  const isHeader = item.type === 'header';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center py-1 transition-all duration-200 ${isDragging ? 'opacity-0' : 'opacity-100'} ${isOverlay ? 'bg-white shadow-lg' : ''}`}
    >
      {/* Drag Handle */}
      {!isOverlay && (
        <div 
          {...listeners} 
          {...attributes} 
          className="mr-2 cursor-grab active:cursor-grabbing text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Checkbox / Bullet */}
      <div className="flex items-center mr-3">
        {isHeader ? (
          <div className="w-5 h-5 flex items-center justify-center text-blue-500">
            <ChevronRight size={18} className="rotate-90" strokeWidth={3} />
          </div>
        ) : (
          <button 
            onClick={() => {
                onUpdate?.({ completed: !item.completed });
                if (!item.completed) {
                   setTimeout(() => onToggleComplete?.(), 300);
                }
            }}
            className={`transition-colors duration-300 ${item.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-400'}`}
          >
            {item.completed ? <CheckCircle2 size={20} fill="currentColor" stroke="white" /> : <Circle size={20} />}
          </button>
        )}
      </div>

      {/* Text Input */}
      <input
        ref={inputRef}
        type="text"
        value={item.text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={isHeader ? "分类标题..." : "输入任务..."}
        className={`flex-1 bg-transparent border-none outline-none transition-all duration-300 py-1
          ${isHeader ? 'text-xl font-bold text-gray-800' : 'text-base text-gray-600 font-medium'}
          ${item.completed ? 'line-through text-gray-400 decoration-2' : ''}
        `}
      />

      {/* Quick Type Badge */}
      {isHeader && (
          <span className="ml-2 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 uppercase tracking-widest font-bold">Header</span>
      )}
    </div>
  );
};
