'use client';
import { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  RotateCw, 
  RotateCcw, 
  Crop, 
  Check, 
  X, 
  RotateCcw as ResetIcon, 
  Loader2 
} from 'lucide-react';
import { rotateImage, cropImage } from '@/utils/imageUtils';
import styles from './ImageEditorModal.module.css';

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1 Square', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: 'A4 Portrait', value: 210 / 297 },
];

export default function ImageEditorModal({ isOpen, image, onClose, onSave }) {
  const [currentSrc, setCurrentSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (image && image.preview) {
      setCurrentSrc(image.preview);
      setCrop(undefined);
      setCompletedCrop(null);
      setAspect(undefined);
    }
  }, [image]);

  if (!isOpen || !image) return null;

  const handleRotate = async (degrees) => {
    try {
      setIsProcessing(true);
      const result = await rotateImage(currentSrc, degrees);
      setCurrentSrc(result.previewUrl);
      setCrop(undefined);
      setCompletedCrop(null);
    } catch (err) {
      console.error('Rotation failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentSrc(image.preview);
    setCrop(undefined);
    setCompletedCrop(null);
    setAspect(undefined);
  };

  const handleApply = async () => {
    try {
      setIsProcessing(true);
      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        const result = await cropImage(imgRef.current, completedCrop);
        onSave({
          id: image.id,
          blob: result.blob,
          previewUrl: result.previewUrl,
        });
      } else if (currentSrc !== image.preview) {
        // Rotated without crop
        const response = await fetch(currentSrc);
        const blob = await response.blob();
        onSave({
          id: image.id,
          blob,
          previewUrl: currentSrc,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to apply image edits', err);
      alert('Could not apply edits to image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <Crop size={20} className={styles.iconAccent} />
            <h3 className={styles.title}>Edit & Crop Image</h3>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <span className={styles.groupLabel}>Rotation</span>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => handleRotate(-90)}
                disabled={isProcessing}
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw size={16} />
                <span>-90°</span>
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => handleRotate(90)}
                disabled={isProcessing}
                title="Rotate 90° Clockwise"
              >
                <RotateCw size={16} />
                <span>+90°</span>
              </button>
            </div>
          </div>

          <div className={styles.toolGroup}>
            <span className={styles.groupLabel}>Aspect Ratio</span>
            <div className={styles.buttonRow}>
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`${styles.toolBtn} ${aspect === item.value ? styles.toolBtnActive : ''}`}
                  onClick={() => {
                    setAspect(item.value);
                    setCrop(undefined);
                  }}
                  disabled={isProcessing}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolGroup}>
            <span className={styles.groupLabel}>Actions</span>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={handleReset}
              disabled={isProcessing}
              title="Reset to Original"
            >
              <ResetIcon size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Canvas / Crop Viewport */}
        <div className={styles.cropperContainer}>
          {isProcessing && (
            <div className={styles.loaderBackdrop}>
              <Loader2 size={32} className={styles.spinner} />
            </div>
          )}
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className={styles.reactCrop}
          >
            <img
              ref={imgRef}
              src={currentSrc}
              alt="Crop editor target"
              className={styles.editorImg}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.hint}>
            Drag across the image to crop, or use rotation tools above.
          </p>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
              disabled={isProcessing}
            >
              <Check size={18} />
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
