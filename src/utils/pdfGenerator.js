import { jsPDF } from 'jspdf';
import { prepareImageForPDF } from './imageUtils';

export async function generatePDFFromImages(images, options = {}) {
  const {
    password = '',
    metadata = {},
    watermark = '',
    smartScaling = 'fit',
    margin = 10,
    quality = 'high',
    pageSize = 'a4',
    orientation = 'portrait',
    filename = 'converted-images.pdf',
    onProgress = null,
  } = options;

  if (!images || images.length === 0) {
    throw new Error('No images selected for PDF conversion');
  }

  // Page dimensions in mm
  const dimensions = {
    a4: { portrait: [210, 297], landscape: [297, 210] },
    letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
  };

  const selectedSize = dimensions[pageSize] || dimensions.a4;
  const [pageWidth, pageHeight] = selectedSize[orientation] || selectedSize.portrait;

  // jsPDF configuration with deflate compression & optional password encryption
  const pdfConfig = {
    orientation,
    unit: 'mm',
    format: pageSize === 'letter' ? 'letter' : 'a4',
    compress: true, // internal deflate compression
  };

  if (password && password.trim().length > 0) {
    const trimmedPw = password.trim();
    pdfConfig.encryption = {
      userPassword: trimmedPw,
      ownerPassword: trimmedPw,
      userPermissions: ['print', 'copy', 'modify', 'annot-forms'],
    };
  }

  const pdf = new jsPDF(pdfConfig);

  // Inject Custom Metadata
  const { title = '', author = '', subject = '' } = metadata;
  const docMetadata = {
    creator: 'Stitch - Image to PDF Converter',
  };
  if (title.trim()) docMetadata.title = title.trim();
  if (author.trim()) docMetadata.author = author.trim();
  if (subject.trim()) docMetadata.subject = subject.trim();
  pdf.setProperties(docMetadata);

  for (let i = 0; i < images.length; i++) {
    if (onProgress) {
      onProgress(i + 1, images.length);
    }

    if (i > 0) {
      pdf.addPage(pageSize === 'letter' ? 'letter' : 'a4', orientation);
    }

    const imgItem = images[i];
    const imageSrc = imgItem.preview;

    // Downscale, compress, and compute smart scaling layout
    const processed = await prepareImageForPDF({
      imageSrc,
      smartScaling,
      pageWidth,
      pageHeight,
      margin: Number(margin) || 0,
      quality,
    });

    // Add image with FAST alias (canvas already downscaled & compressed)
    pdf.addImage(
      processed.dataUrl,
      'JPEG',
      processed.x,
      processed.y,
      processed.width,
      processed.height,
      undefined,
      'FAST'
    );

    // Diagonal Watermark with low opacity across the center
    if (watermark && watermark.trim().length > 0) {
      pdf.saveGraphicsState();
      try {
        if (typeof pdf.setGState === 'function' && pdf.GState) {
          pdf.setGState(new pdf.GState({ opacity: 0.16 }));
        }
      } catch (e) {
        // Fallback gracefully if graphics state is not supported
      }
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'bold');

      // Font size proportional to page dimensions
      const fontSize = Math.max(24, Math.min(pageWidth, pageHeight) / 5.5);
      pdf.setFontSize(fontSize);

      pdf.text(watermark.trim().toUpperCase(), pageWidth / 2, pageHeight / 2, {
        align: 'center',
        baseline: 'middle',
        angle: 45,
      });
      pdf.restoreGraphicsState();
    }
  }

  const cleanFilename = filename.trim()
    ? filename.trim().endsWith('.pdf')
      ? filename.trim()
      : `${filename.trim()}.pdf`
    : 'converted-images.pdf';

  pdf.save(cleanFilename);
}
