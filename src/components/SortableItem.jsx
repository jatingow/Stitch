import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import styles from './ImageUploader.module.css';

export function SortableItem({ id, image, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? '1.05' : '1',
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.imageCard} {...attributes} {...listeners}>
      <div className={styles.dragHandleIndicator}>
        <GripVertical size={20} suppressHydrationWarning />
      </div>
      <img src={image.preview} alt="preview" className={styles.imagePreview} />
      <button 
        className={styles.removeBtn} 
        onPointerDown={(e) => {
          e.stopPropagation(); // prevent drag start
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        <Trash2 size={16} suppressHydrationWarning />
      </button>
    </div>
  );
}
