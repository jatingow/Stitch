'use client';
import { useState, useRef, useEffect } from 'react';
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
import ImageEditorModal from './ImageEditorModal';
import { generatePDFFromImages } from '@/utils/pdfGenerator';
import { rotateImage } from '@/utils/imageUtils';
import {
  Upload,
  RotateCcw,
  Plus,
  FileDown,
  Check,
  CheckCircle,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import styles from './ImageUploader.module.css';

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('prism-theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('prism-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Formulation Settings
  const [settings, setSettings] = useState({
    pageSize: 'a4', // 'a4' | 'letter'
    orientation: 'portrait', // 'portrait' | 'landscape'
    margin: 15, // mm
    density: 'archival', // 'archival' (300 dpi) | 'proof' (150 dpi) | 'transmission' (72 dpi)
    quantizePercent: 88,
    smartScaling: 'fit', // 'fit' | 'fill'
    enableOcr: true,
    enableCipher: false,
    password: '',
    enableWatermark: false,
    watermark: 'CONFIDENTIAL',
    enableMetadata: false,
    title: 'Prism Document',
    author: 'Prism Studio',
    subject: 'Image Compilation',
    filename: 'Prism_Export',
  });

  const fileInputRef = useRef(null);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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

  // File Upload Handling
  const handleFiles = (files) => {
    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'));

    fileList.forEach((file) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const newPlate = {
          id: Math.random().toString(36).substring(2, 9),
          file,
          preview: objectUrl,
          name: file.name,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} PX`,
          sizeFormatted: `${sizeMb > 0 ? sizeMb : (file.size / 1024).toFixed(0)} ${sizeMb > 0 ? 'MB' : 'KB'}`,
          isEdited: false,
        };
        setImages((prev) => [...prev, newPlate]);
      };
      img.src = objectUrl;
    });
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
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearStaging = () => {
    if (window.confirm('Clear all images from the drafting board?')) {
      setImages([]);
    }
  };

  // Quick 90° Rotate
  const handleQuickRotate = async (id) => {
    const target = images.find((img) => img.id === id);
    if (!target) return;
    try {
      const result = await rotateImage(target.preview, 90);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
              ...img,
              file: result.blob,
              preview: result.previewUrl,
              dimensions: `${result.width} × ${result.height} PX`,
              isEdited: true,
            }
            : img
        )
      );
    } catch (err) {
      console.error('Rotation failed', err);
    }
  };

  // Save Edits from Modal
  const handleSaveEditedImage = ({ id, blob, previewUrl }) => {
    const img = new Image();
    img.onload = () => {
      setImages((prev) =>
        prev.map((plate) =>
          plate.id === id
            ? {
              ...plate,
              file: blob,
              preview: previewUrl,
              dimensions: `${img.naturalWidth} × ${img.naturalHeight} PX`,
              isEdited: true,
            }
            : plate
        )
      );
    };
    img.src = previewUrl;
  };

  // Generate PDF
  const handleCompilePDF = async () => {
    if (images.length === 0) {
      alert('Please add at least one image before exporting.');
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: images.length });

    let quality = 'high';
    if (settings.density === 'proof') quality = 'medium';
    if (settings.density === 'transmission') quality = 'low';

    try {
      await generatePDFFromImages(images, {
        password: settings.enableCipher ? settings.password : '',
        metadata: settings.enableMetadata
          ? {
            title: settings.title,
            author: settings.author,
            subject: settings.subject,
          }
          : {},
        watermark: settings.enableWatermark ? settings.watermark : '',
        smartScaling: settings.smartScaling,
        margin: Number(settings.margin) || 0,
        quality,
        pageSize: settings.pageSize,
        orientation: settings.orientation,
        filename: settings.filename,
        onProgress: (current, total) => setProgress({ current, total }),
      });

      setIsCompleted(true);
    } catch (error) {
      console.error('Compilation error:', error);
      alert('PDF Compilation error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const estimatedMb = (images.length * (settings.density === 'archival' ? 0.95 : settings.density === 'proof' ? 0.45 : 0.2)).toFixed(1);

  return (
    <div className={styles.atelierLayout}>
      {/* 1. TOP HEADER - CLEAN & MINIMAL */}
      <header className={styles.topNav}>
        <div className={styles.brandCluster}>
          <span className={styles.brandTitle}>Prism</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* 2. HERO TITLE */}
      <section className={styles.heroSection}>
        <h1 className={styles.mainStudioTitle}>
          Image to PDF
        </h1>
        <p className={styles.heroSubtitle}>
          Convert, order, and compile high-resolution images into optimized PDFs. Strictly client-side.
        </p>
      </section>

      {/* 3. MAIN WORKBENCH 2-COLUMN VIEW */}
      <div className={styles.workbenchContainer}>
        {/* ================= LEFT COLUMN ================= */}
        <div className={styles.draftingColumn}>
          {/* Dropzone Box */}
          <div
            className={styles.editorialDropzone}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropIconSquare}>
              <Upload size={18} />
            </div>

            <h3 className={styles.dropHeading}>
              Import images or digital scans
            </h3>

            <p className={styles.dropDescription}>
              Drag files directly onto the board. Supports high-resolution JPG, PNG, WEBP, and more.
            </p>

            <div className={styles.formatBadgesRow}>
              {['PNG', 'JPG', 'WEBP', 'TIFF', 'HEIC', '+FORMATS'].map((fmt) => (
                <span key={fmt} className={styles.formatBadge}>
                  {fmt}
                </span>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          {/* Images Grid with DnD */}
          {images.length > 0 && (
            <div className={styles.gridSectionWrap}>
              <div className={styles.gridSectionHeader}>
                <span className={styles.gridCountLabel}>
                  {images.length} {images.length === 1 ? 'Image' : 'Images'} Selected
                </span>
                <span className={styles.gridHintText}>
                  Drag to reorder
                </span>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className={styles.platesGrid}>
                    {images.map((image, index) => (
                      <SortableItem
                        key={image.id}
                        id={image.id}
                        index={index}
                        image={image}
                        onRemove={removeImage}
                        onEdit={(img) => setEditingImage(img)}
                        onQuickRotate={handleQuickRotate}
                      />
                    ))}

                    {/* Empty Insert Slot */}
                    <div
                      className={styles.insertPlateSlot}
                      onClick={() => fileInputRef.current?.click()}
                      title="Add more images"
                    >
                      <div className={styles.insertPlusSquare}>
                        <Plus size={16} />
                      </div>
                      <div className={styles.insertTitle}>Add Image</div>
                      <div className={styles.insertSlotIndex}>
                        SLOT #{String(images.length + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: PDF FORMULATION SIDEBAR ================= */}
        <aside className={styles.productionTicketColumn}>
          <div className={styles.ticketCard}>
            {/* Header */}
            <div className={styles.ticketHeaderRow}>
              <h3 className={styles.ticketMainTitle}>PDF Formulation</h3>
              <span className={styles.ticketSpecTag}>ISO-STD</span>
            </div>

            {/* Section 1: Page Geometry */}
            <div className={styles.specSection}>
              <div className={styles.sectionHeadingRow}>
                <label className={styles.sectionLabel} htmlFor="geometry-select">
                  PAGE GEOMETRY
                </label>
                <span className={styles.sectionSubtext}>ISO 216</span>
              </div>

              <select
                id="geometry-select"
                className={styles.ticketSelect}
                value={settings.pageSize}
                onChange={(e) => updateSetting('pageSize', e.target.value)}
              >
                <option value="a4">A4 210 × 297 mm • Standard</option>
                <option value="letter">US Letter 215.9 × 279.4 mm</option>
              </select>

              {/* Segmented Buttons */}
              <div className={styles.segmentedRow}>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${settings.orientation === 'portrait' ? styles.segmentBtnActive : ''}`}
                  onClick={() => updateSetting('orientation', 'portrait')}
                >
                  <span className={styles.portraitIcon}>▯</span>
                  <span>Portrait</span>
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${settings.orientation === 'landscape' ? styles.segmentBtnActive : ''}`}
                  onClick={() => updateSetting('orientation', 'landscape')}
                >
                  <span className={styles.landscapeIcon}>▭</span>
                  <span>Landscape</span>
                </button>
              </div>
            </div>

            {/* Section 2: Margin Inset */}
            <div className={styles.specSection}>
              <div className={styles.sectionHeadingRow}>
                <label className={styles.sectionLabel} htmlFor="margin-slider">
                  MARGIN INSET
                </label>
                <span className={styles.sectionSubtext}>
                  {Number(settings.margin).toFixed(1)} MM
                </span>
              </div>

              <input
                id="margin-slider"
                type="range"
                min="0"
                max="40"
                step="1"
                value={settings.margin}
                onChange={(e) => updateSetting('margin', Number(e.target.value))}
                className={styles.editorialRange}
              />

              <div className={styles.marginPresetsGrid}>
                {[
                  { label: 'None', val: 0 },
                  { label: 'Tight', val: 5 },
                  { label: '15 mm', val: 15 },
                  { label: 'Wide', val: 25 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.presetPill} ${settings.margin === item.val ? styles.presetPillActive : ''}`}
                    onClick={() => updateSetting('margin', item.val)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Density & DPI */}
            <div className={styles.specSection}>
              <div className={styles.sectionHeadingRow}>
                <span className={styles.sectionLabel}>RESOLUTION &amp; QUALITY</span>
                <span className={styles.sectionSubtext}>COMPRESSION</span>
              </div>

              <div className={styles.densityOptionsList}>
                <div
                  className={`${styles.densityOption} ${settings.density === 'archival' ? styles.densityOptionActive : ''}`}
                  onClick={() => updateSetting('density', 'archival')}
                >
                  <div className={styles.densityCheckbox}>
                    {settings.density === 'archival' && <Check size={12} />}
                  </div>
                  <div className={styles.densityDetails}>
                    <div className={styles.densityName}>Fine Art Print (High)</div>
                    <div className={styles.densitySub}>300 DPI • Uncompressed Quality</div>
                  </div>
                  <div className={styles.densityRate}>100%</div>
                </div>

                <div
                  className={`${styles.densityOption} ${settings.density === 'proof' ? styles.densityOptionActive : ''}`}
                  onClick={() => updateSetting('density', 'proof')}
                >
                  <div className={styles.densityCheckbox}>
                    {settings.density === 'proof' && <Check size={12} />}
                  </div>
                  <div className={styles.densityDetails}>
                    <div className={styles.densityName}>Standard Proof (Medium)</div>
                    <div className={styles.densitySub}>150 DPI • Balanced Size</div>
                  </div>
                  <div className={styles.densityRate}>85%</div>
                </div>

                <div
                  className={`${styles.densityOption} ${settings.density === 'transmission' ? styles.densityOptionActive : ''}`}
                  onClick={() => updateSetting('density', 'transmission')}
                >
                  <div className={styles.densityCheckbox}>
                    {settings.density === 'transmission' && <Check size={12} />}
                  </div>
                  <div className={styles.densityDetails}>
                    <div className={styles.densityName}>Digital Transmission (Low)</div>
                    <div className={styles.densitySub}>72 DPI • Fast Transfer</div>
                  </div>
                  <div className={styles.densityRate}>60%</div>
                </div>
              </div>
            </div>

            {/* Section 4: Specifications & Toggles */}
            <div className={styles.specSection}>
              <div className={styles.sectionHeadingRow}>
                <span className={styles.sectionLabel}>DOCUMENT CONTROLS</span>
              </div>

              <div className={styles.specTogglesList}>
                {/* Password Protection */}
                <div className={styles.specToggleRow}>
                  <div className={styles.toggleTextGroup}>
                    <div className={styles.togglePrimary}>Password Protection</div>
                    <div className={styles.toggleSecondary}>Encrypt exported PDF file</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switchBtn} ${settings.enableCipher ? styles.switchBtnOn : ''}`}
                    onClick={() => updateSetting('enableCipher', !settings.enableCipher)}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
                {settings.enableCipher && (
                  <div className={styles.nestedInputCard}>
                    <label className={styles.nestedLabel} htmlFor="cipher-pwd">DOCUMENT PASSWORD</label>
                    <input
                      id="cipher-pwd"
                      type="text"
                      placeholder="Enter password..."
                      value={settings.password}
                      onChange={(e) => updateSetting('password', e.target.value)}
                      className={styles.nestedInput}
                    />
                  </div>
                )}

                {/* Diagonal Watermark */}
                <div className={styles.specToggleRow}>
                  <div className={styles.toggleTextGroup}>
                    <div className={styles.togglePrimary}>Diagonal Watermark</div>
                    <div className={styles.toggleSecondary}>Subtle watermark across pages</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switchBtn} ${settings.enableWatermark ? styles.switchBtnOn : ''}`}
                    onClick={() => updateSetting('enableWatermark', !settings.enableWatermark)}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
                {settings.enableWatermark && (
                  <div className={styles.nestedInputCard}>
                    <label className={styles.nestedLabel} htmlFor="watermark-txt">WATERMARK TEXT</label>
                    <input
                      id="watermark-txt"
                      type="text"
                      placeholder="e.g. CONFIDENTIAL"
                      value={settings.watermark}
                      onChange={(e) => updateSetting('watermark', e.target.value)}
                      className={styles.nestedInput}
                    />
                  </div>
                )}

                {/* Metadata */}
                <div className={styles.specToggleRow}>
                  <div className={styles.toggleTextGroup}>
                    <div className={styles.togglePrimary}>Custom Metadata</div>
                    <div className={styles.toggleSecondary}>Define Title and Author</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switchBtn} ${settings.enableMetadata ? styles.switchBtnOn : ''}`}
                    onClick={() => updateSetting('enableMetadata', !settings.enableMetadata)}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
                {settings.enableMetadata && (
                  <div className={styles.nestedInputCard}>
                    <label className={styles.nestedLabel} htmlFor="doc-title-input">TITLE</label>
                    <input
                      id="doc-title-input"
                      type="text"
                      placeholder="Title"
                      value={settings.title}
                      onChange={(e) => updateSetting('title', e.target.value)}
                      className={styles.nestedInput}
                    />
                    <label className={styles.nestedLabel} htmlFor="doc-author-input" style={{ marginTop: '0.4rem' }}>AUTHOR</label>
                    <input
                      id="doc-author-input"
                      type="text"
                      placeholder="Author"
                      value={settings.author}
                      onChange={(e) => updateSetting('author', e.target.value)}
                      className={styles.nestedInput}
                    />
                  </div>
                )}

                {/* Scaling */}
                <div className={styles.specToggleRow}>
                  <div className={styles.toggleTextGroup}>
                    <div className={styles.togglePrimary}>Fill Page (Cover)</div>
                    <div className={styles.toggleSecondary}>Fill page edge-to-edge vs Fit with margin</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switchBtn} ${settings.smartScaling === 'fill' ? styles.switchBtnOn : ''}`}
                    onClick={() => updateSetting('smartScaling', settings.smartScaling === 'fill' ? 'fit' : 'fill')}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
              </div>
            </div>

            {/* Estimated Bound Weight */}
            <div className={styles.weightCard}>
              <div className={styles.weightLabel}>ESTIMATED OUTPUT SIZE</div>
              <div className={styles.weightRow}>
                <span className={styles.weightVal}>
                  {estimatedMb} MB • {String(images.length).padStart(2, '0')} Pages
                </span>
              </div>
            </div>

            {/* Compilation Progress Bar */}
            {isGenerating && (
              <div className={styles.compilingProgressWrap}>
                <div className={styles.compilingText}>
                  <span>Processing {progress.current} of {progress.total}...</span>
                  <span>{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                </div>
                <div className={styles.compilingTrack}>
                  <div
                    className={styles.compilingFill}
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 15}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              className={styles.compileMainBtn}
              onClick={handleCompilePDF}
              disabled={isGenerating || images.length === 0}
            >
              <FileDown size={17} />
              <span>
                {isGenerating
                  ? `COMPILING (${progress.current}/${progress.total})...`
                  : `COMPILE PDF (${images.length})`}
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* 4. FOOTER */}
      <footer className={styles.atelierFooter}>
        <div className={styles.footerLeft}>
          PRISM — CLIENT-SIDE IMAGE TO PDF CONVERTER
        </div>
      </footer>

      {/* Built-in Image Mini-Editor Modal */}
      <ImageEditorModal
        isOpen={Boolean(editingImage)}
        image={editingImage}
        onClose={() => setEditingImage(null)}
        onSave={handleSaveEditedImage}
      />
    </div>
  );
}
