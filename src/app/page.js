import ImageUploader from '@/components/ImageUploader';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-paper)' }}>
      <ImageUploader />
    </main>
  );
}
