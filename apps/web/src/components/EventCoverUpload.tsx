'use client';

import { useRef, useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase-client';
import { updateEventCover } from '@/actions/event-actions';

interface Props {
  eventId: string;
  currentUrl: string | null;
}

export default function EventCoverUpload({ eventId, currentUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const coverRef = storageRef(storage, `events/${eventId}/cover`);
      await uploadBytes(coverRef, file);
      const url = await getDownloadURL(coverRef);
      await updateEventCover(eventId, url);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Cover upload failed:', err);
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
};
