import { useState } from 'react';
import { seedDummyData } from './seedDummyData.js';

function SeedButton() {
  const [loading, setLoading] = useState(false);

  if (import.meta.env.PROD) {
    return null;
  }

  async function handleSeed() {
    const confirmed = window.confirm(
      'Seed dummy data ke Firestore? Data lama tidak akan dihapus, tetapi dokumen dengan ID yang sama akan ditimpa.',
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const result = await seedDummyData();
      alert(`Seed dummy data berhasil. Total dokumen: ${result.totalDocuments}`);
    } catch (error) {
      alert(`Seed dummy data gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="seed-button" onClick={handleSeed} disabled={loading}>
      {loading ? 'Seeding...' : 'Seed Dummy Data'}
    </button>
  );
}

export default SeedButton;
