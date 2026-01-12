'use client';

import { useState } from 'react';

type Result = {
  path?: string[];
  steps?: number;
  error?: string;
};

export default function Home() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [mode, setMode] = useState<'weaver' | 'weaverx'>('weaver');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Delete State
  const [deleteWord, setDeleteWord] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Validation
    if (mode === 'weaver' && start.length !== end.length) {
      setResult({ error: "In Weaver mode, words must be the same length." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, mode }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteWord) return;
    setIsDeleting(true);
    setDeleteMsg('');

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: deleteWord }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMsg(data.message);
        setDeleteWord('');
      } else {
        setDeleteMsg(data.error || data.message || 'Error deleting word');
      }
    } catch (err) {
      setDeleteMsg('Failed to delete word');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="container">
      <h1 className="title">Weaver Solver</h1>

      <div className="card">
        <form onSubmit={handleSolve}>
          {/* Mode Selector */}
          <div className="mode-selector">
            <div
              className={`mode-option ${mode === 'weaver' ? 'active' : ''}`}
              onClick={() => setMode('weaver')}
            >
              Weaver
            </div>
            <div
              className={`mode-option ${mode === 'weaverx' ? 'active' : ''}`}
              onClick={() => setMode('weaverx')}
            >
              Weaver X
            </div>
          </div>

          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Start Word</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. cat"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">End Word</label>
              <input
                className="input-field"
                type="text"
                placeholder={mode === 'weaver' ? 'e.g. dog' : 'e.g. catch'}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <span>Solving...</span>
            ) : (
              <span>Find Path</span>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease' }}>
            {result.error ? (
              <div className="error-msg">{result.error}</div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600
                }}>
                  Solution in <span style={{ color: 'var(--primary)' }}>{result.steps}</span> moves
                </div>

                <div className="ladder-container">
                  {result.path?.map((word, i) => (
                    <div key={i} className="ladder-step">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Manage Dictionary</h2>
        <form onSubmit={handleDelete} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              className="input-field"
              type="text"
              placeholder="Word to delete (exact match)"
              value={deleteWord}
              onChange={(e) => setDeleteWord(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn"
            style={{ width: 'auto', whiteSpace: 'nowrap', backgroundColor: '#ef4444', height: '48px' }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Word'}
          </button>
        </form>
        {deleteMsg && (
          <div style={{
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: deleteMsg.toLowerCase().includes('success') ? 'var(--primary)' : '#ef4444'
          }}>
            {deleteMsg}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
        <p>{mode === 'weaver' ? 'Transform words by changing one letter at a time.' : 'Transform by inserting, deleting, or substituting letters.'}</p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
