# Image to PDF Converter Webapp

A modern, fast, and 100% private web application built with **Next.js** that allows users to upload multiple images, reorder them, and convert them into a single, beautifully formatted A4 PDF document.

## 🔒 Privacy First

This application is designed with **zero-knowledge architecture**. All image processing and PDF generation occur entirely **client-side** (locally in the user's browser). 
- **No data leaves your device:** Images are never uploaded to a backend server.
- **No cloud storage:** The resulting PDF is generated on-the-fly in your browser's memory and downloaded directly to your local machine.

## ✨ Features

- **Drag & Drop Upload:** Seamlessly drag and drop multiple images at once.
- **Interactive Reordering:** Drag images to reorder them before PDF conversion.
- **Smart Scaling:** Automatically calculates image aspect ratios to optimally fit and center them on standard A4-sized PDF pages.
- **Premium UI:** A sleek, glassmorphic dark-mode interface with micro-animations.
- **Instant Generation:** Click to convert and instantly download the generated PDF.

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router) 
- **Library:** [React 18](https://react.dev/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
- **Drag & Drop functionality:** [@dnd-kit/core](https://dndkit.com/)
- **Icons:** [lucide-react](https://lucide.dev/)
- **Styling:** Custom Vanilla CSS with CSS Modules

## 🏗️ Architecture & Program Flow

The application is structured as a Single Page Application (SPA) driven by Next.js. 

### 1. The Presentation Layer (`src/app/page.js`)
The main entry point handles the overall layout and layout metadata. It wraps the core interactive component.

### 2. The Core Component (`src/components/ImageUploader.jsx`)
This component holds the entirety of the state and logic for the application:
- **State Management:** Manages the list of selected `images`, the `isGenerating` loading state, and the `isCompleted` success state.
- **File Ingestion:** Listens to `onDrop` and `<input type="file">` events. It uses the browser's `URL.createObjectURL()` to instantly generate local preview URLs for the images without uploading them anywhere.
- **Drag & Drop Context:** Utilizes `@dnd-kit`'s `DndContext` and `SortableContext` to render a sortable grid of images (`SortableItem.jsx`).
- **PDF Generation:** The `generatePDF` function initializes a new `jsPDF` instance. It iterates through the selected images, waits for them to load as HTML `Image` objects in memory, calculates the dimensions to fit them inside an A4 canvas (210x297mm), and draws them sequentially.

### 3. Execution Flow
1. **User loads the app:** The React app is hydrated in the browser.
2. **User selects images:** The `handleFiles` function filters for image formats and creates blob URLs for local previews.
3. **User reorders (Optional):** The `handleDragEnd` function updates the state array index based on the drag interaction.
4. **User clicks "Convert":** The app iterates over the images, calculates A4 dimensions, adds them to a `jsPDF` instance, and triggers the browser's native download dialog for the generated PDF.
5. **Success State:** The UI transitions to a success screen, offering a button to reset the state and start over.

## 🚀 Getting Started Locally

First, clone the repository and install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
