import ImageUploader from '@/components/ImageUploader';
import DarkVeil from '@/components/DarkVeil'; // Ensure the path is correct

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <DarkVeil
          hueShift={45}
          speed={0.3}
          scanlineFrequency={0.5}
          warpAmount={0.5}
          noiseIntensity={0}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <header>
          <h1 className="title">Image to PDF</h1>
          <p className="subtitle">Convert multiple images into a single PDF document.</p>
        </header>

        <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
          <ImageUploader />
        </section>
      </div>

    </main>
  );
}
