'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Upload, FileDown, CheckCircle } from 'lucide-react';
import styles from './ImageUploader.module.css';

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFiles = (files) => {
    const newImages = Array.from(files).filter(file => file.type.startsWith('image/')).map(file => {
      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      };
    });
    setImages(prev => [...prev, ...newImages]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const a4Width = 210;
      const a4Height = 297;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        const imageObj = new Image();
        imageObj.src = img.preview;
        await new Promise((resolve, reject) => {
          imageObj.onload = resolve;
          imageObj.onerror = reject;
        });

        const imgRatio = imageObj.width / imageObj.height;
        const pageRatio = a4Width / a4Height;
        
        let finalWidth, finalHeight;
        
        if (imgRatio > pageRatio) {
          finalWidth = a4Width;
          finalHeight = a4Width / imgRatio;
        } else {
          finalHeight = a4Height;
          finalWidth = a4Height * imgRatio;
        }
        
        const x = (a4Width - finalWidth) / 2;
        const y = (a4Height - finalHeight) / 2;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        let format = img.file.type.split('/')[1].toUpperCase();
        if (format === 'JPEG') format = 'JPEG';
        else if (format === 'PNG') format = 'PNG';
        else if (format === 'WEBP') format = 'WEBP';
        else format = 'JPEG'; // fallback
        
        pdf.addImage(imageObj, format, x, y, finalWidth, finalHeight);
      }
      
      pdf.save('converted-images.pdf');
      setIsCompleted(true);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.uploaderContainer}>
      {isCompleted ? (
        <div className={styles.successSection}>
          <CheckCircle size={64} className={styles.successIcon} suppressHydrationWarning />
          <h2 className={styles.previewTitle}>PDF Generated Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
            Your images have been converted and downloaded.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setImages([]);
              setIsCompleted(false);
            }}
          >
            Convert More Images
          </button>
        </div>
      ) : (
        <>
          <div 
            className={styles.dropZone}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload size={48} className={styles.uploadIcon} suppressHydrationWarning />
            <p>Drag & drop images here or click to browse</p>
            <input 
              id="file-input" 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={(e) => handleFiles(e.target.files)} 
              style={{ display: 'none' }} 
            />
          </div>

          {images.length > 0 && (
            <div className={styles.previewSection}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>Selected Images ({images.length}) - Drag to reorder</h3>
                <button 
                  className="btn btn-primary" 
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  <FileDown size={20} suppressHydrationWarning />
                  {isGenerating ? 'Generating PDF...' : 'Convert to PDF'}
                </button>
              </div>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={images.map(img => img.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className={styles.grid}>
                    {images.map(image => (
                      <SortableItem key={image.id} id={image.id} image={image} onRemove={removeImage} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              <div className={styles.actions}>
                <button 
                  className="btn btn-primary" 
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  <FileDown size={20} suppressHydrationWarning />
                  {isGenerating ? 'Generating PDF...' : 'Convert to PDF'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
