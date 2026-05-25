import ImageUploader from '@/components/ImageUploader';

export default function Home() {
  return (
    <main className="container">
      <header>
        <h1 className="title">Image to PDF</h1>
        <p className="subtitle">Convert multiple images into a single PDF document.</p>
      </header>

      <section className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <ImageUploader />
      </section>
    </main>
  );
}
