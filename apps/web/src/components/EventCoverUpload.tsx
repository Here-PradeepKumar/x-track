'use client';

import { useRef, useState } from 'react';

interface Props {
  eventId: string;
  currentUrl: string | null;
}

export default function EventCoverUpload({ eventId, currentUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/events/${eventId}/cover`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }

      const { url } = await res.json();
      setPreviewUrl(url);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div style={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div style={styles.previewWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Event cover" style={styles.preview} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={styles.changeBtn}
          >
            {uploading ? 'UPLOADING…' : 'CHANGE PHOTO'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={styles.uploadBtn}
        >
          <span style={styles.uploadIcon}>↑</span>
          {uploading ? 'UPLOADING…' : 'UPLOAD COVER PHOTO'}
        </button>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { marginBottom: '24px' },
  previewWrapper: { position: 'relative', display: 'inline-block', width: '100%' },
  preview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '2px',
    display: 'block',
  },
  changeBtn: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.7)',
    color: '#cafd00',
    border: '1px solid #cafd00',
    borderRadius: '2px',
    padding: '6px 14px',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '2px',
    cursor: 'pointer',
  },
  uploadBtn: {
    width: '100%',
    height: '120px',
    background: '#131313',
    border: '1px dashed #494847',
    borderRadius: '2px',
    color: '#adaaaa',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  uploadIcon: { fontSize: '24px', color: '#494847' },
  errorText: { fontSize: '12px', color: '#ff4444', marginTop: '8px' },
};
