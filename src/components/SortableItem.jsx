'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RotateCw, Crop, X, GripVertical } from 'lucide-react';
import styles from './ImageUploader.module.css';

export function SortableItem({ id, index, image, onRemove, onEdit, onQuickRotate }) {
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
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? '1.02' : '1',
  };

  const plateNumber = String(index + 1).padStart(2, '0');

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={styles.plateCard}
      {...attributes}
      {...listeners}
    >
      {/* Thumbnail with overlay badges */}
      <div className={styles.thumbnailWrapper}>
        <div className={styles.plateBadge}>
          PL. {plateNumber}
        </div>
        
        <div className={styles.dragGripBadge} title="Drag to reorder plate">
          <GripVertical size={14} />
        </div>

        <img 
          src={image.preview} 
          alt={image.name || `Plate ${plateNumber}`} 
          className={styles.plateImage} 
        />

        {image.isEdited && (
          <div className={styles.editedIndicator}>
            EDITED
          </div>
        )}
      </div>

      {/* Plate Details */}
      <div className={styles.plateInfo}>
        <div className={styles.plateTitle} title={image.name || `Plate_${plateNumber}`}>
          {image.name || `Folio_Plate_${plateNumber}.png`}
        </div>

        <div className={styles.plateMetaRow}>
          <span className={styles.plateDimensions}>
            {image.dimensions || '3200 × 2400 PX'}
          </span>
          <span className={styles.plateFileSize}>
            {image.sizeFormatted || '3.2 MB'}
          </span>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className={styles.plateActionBar}>
        <div className={styles.plateActionLeft}>
          <button
            type="button"
            className={styles.plateToolBtn}
            title="Rotate 90° Clockwise"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onQuickRotate(id);
            }}
          >
            <RotateCw size={13} />
          </button>

          <button
            type="button"
            className={styles.plateToolBtn}
            title="Crop & Compose Plate"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(image);
            }}
          >
            <Crop size={13} />
          </button>
        </div>

        <button
          type="button"
          className={`${styles.plateToolBtn} ${styles.plateRemoveBtn}`}
          title="Remove Plate"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
