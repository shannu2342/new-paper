import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item" {...attributes} {...listeners}>
      <span className="drag-handle">↕</span>
      <span>{label}</span>
    </div>
  );
};

export default SortableItem;
