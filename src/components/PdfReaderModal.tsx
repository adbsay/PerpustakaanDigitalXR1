'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  ChevronLeft, ChevronRight, Moon, Sun, BookOpen, Download, RotateCw
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up pdf.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  bookTitle: string;
  author: string;
}

export default function PdfReaderModal({
  isOpen,
  onClose,
  pdfUrl,
  bookTitle,
  author,
}: PdfReaderModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [renderError, setRenderError] = useState(false);
  const [pageInput, setPageInput] = useState<string>('1');

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPageNumber(1);
      setPageInput('1');
      setRenderError(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setPageNumber(prev => (numPages ? Math.min(numPages, prev + 1) : prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setPageNumber(prev => Math.max(1, prev - 1));
      } else if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(2.5, +(prev + 0.15).toFixed(2)));
      } else if (e.key === '-') {
        setScale(prev => Math.max(0.5, +(prev - 0.15).toFixed(2)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose, numPages]);

  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  if (!isOpen) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setRenderError(false);
  };

  const onDocumentLoadError = () => {
    setRenderError(true);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlurOrSubmit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && numPages && parsed <= numPages) {
      setPageNumber(parsed);
    } else {
      setPageInput(pageNumber.toString());
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const themes = {
    light: {
      bg: '#F8FAFC',
      headerBg: '#FFFFFF',
      text: '#0F172A',
      border: '#E2E8F0',
      viewerBg: '#E2E8F0',
      canvasFilter: 'none',
    },
    dark: {
      bg: '#0F172A',
      headerBg: '#1E293B',
      text: '#F8FAFC',
      border: '#334155',
      viewerBg: '#020617',
      canvasFilter: 'invert(0.9) hue-rotate(180deg) contrast(1.1)',
    },
    sepia: {
      bg: '#F4ECD8',
      headerBg: '#EAE0C8',
      text: '#5C4033',
      border: '#D8CBB0',
      viewerBg: '#DFD5BE',
      canvasFilter: 'sepia(0.35) contrast(0.95)',
    },
  }[theme];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : '16px',
        boxSizing: 'border-box',
      }}
    >
      <div 
        style={{
          width: isFullscreen ? '100vw' : '96vw',
          maxWidth: isFullscreen ? '100vw' : '1400px',
          height: isFullscreen ? '100vh' : '94vh',
          background: themes.bg,
          borderRadius: isFullscreen ? 0 : '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
          border: isFullscreen ? 'none' : `1px solid ${themes.border}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* HEADER TOOLBAR */}
        <div 
          style={{
            padding: '10px 18px',
            background: themes.headerBg,
            borderBottom: `1px solid ${themes.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            zIndex: 10,
          }}
        >
          {/* Title and author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={17} />
            </div>
            <div>
              <h2 
                style={{ 
                  fontSize: '0.938rem', 
                  fontWeight: 800, 
                  color: themes.text, 
                  margin: 0,
                  maxWidth: '300px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {bookTitle}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                {author}
              </p>
            </div>
          </div>

          {/* Page Navigation Controls */}
          {!renderError && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: themes.bg,
                border: `1px solid ${themes.border}`,
                borderRadius: '10px',
                padding: '3px 8px',
              }}
            >
              <button
                type="button"
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                aria-label="Halaman Sebelumnya"
                title="Halaman Sebelumnya (Panah Kiri)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: pageNumber <= 1 ? '#94A3B8' : themes.text,
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.813rem', color: themes.text }}>
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlurOrSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlurOrSubmit()}
                  aria-label="Nomor halaman saat ini"
                  style={{
                    width: '36px',
                    textAlign: 'center',
                    padding: '2px 4px',
                    borderRadius: '6px',
                    border: `1px solid ${themes.border}`,
                    background: themes.headerBg,
                    color: themes.text,
                    fontWeight: 700,
                    fontSize: '0.813rem',
                  }}
                />
                <span style={{ color: '#64748B' }}>/ {numPages || '...'}</span>
              </div>

              <button
                type="button"
                onClick={() => setPageNumber(prev => (numPages ? Math.min(numPages, prev + 1) : prev + 1))}
                disabled={Boolean(numPages && pageNumber >= numPages)}
                aria-label="Halaman Berikutnya"
                title="Halaman Berikutnya (Panah Kanan)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: numPages && pageNumber >= numPages ? '#94A3B8' : themes.text,
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  cursor: numPages && pageNumber >= numPages ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Theme switcher */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                background: themes.bg,
                border: `1px solid ${themes.border}`,
                borderRadius: '10px',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Mode Terang"
                title="Mode Terang"
                style={{
                  background: theme === 'light' ? themes.headerBg : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 7px',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#2563EB' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Sun size={13} />
                <span className="hidden sm:inline">Terang</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('sepia')}
                aria-label="Mode Sepia"
                title="Mode Sepia"
                style={{
                  background: theme === 'sepia' ? '#EAE0C8' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 7px',
                  cursor: 'pointer',
                  color: theme === 'sepia' ? '#5C4033' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: theme === 'sepia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <span className="hidden sm:inline">Sepia</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Mode Gelap"
                title="Mode Gelap"
                style={{
                  background: theme === 'dark' ? '#0F172A' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 7px',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#38BDF8' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Moon size={13} />
                <span className="hidden sm:inline">Gelap</span>
              </button>
            </div>

            {/* Zoom & Rotation Controls */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: themes.bg,
                border: `1px solid ${themes.border}`,
                borderRadius: '10px',
                padding: '2px 4px',
              }}
            >
              <button
                type="button"
                onClick={() => setScale(prev => Math.max(0.5, +(prev - 0.15).toFixed(2)))}
                aria-label="Perkecil Tampilan"
                title="Zoom Out (-)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: themes.text,
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomOut size={15} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: themes.text, minWidth: '38px', textAlign: 'center' }}>
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale(prev => Math.min(2.5, +(prev + 0.15).toFixed(2)))}
                aria-label="Perbesar Tampilan"
                title="Zoom In (+)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: themes.text,
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                aria-label="Putar Halaman"
                title="Putar 90°"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: themes.text,
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RotateCw size={14} />
              </button>
            </div>

            {/* Download button */}
            <a
              href={pdfUrl}
              download={`${bookTitle}.pdf`}
              aria-label="Unduh PDF"
              title="Unduh E-Book"
              style={{
                background: themes.bg,
                border: `1px solid ${themes.border}`,
                color: themes.text,
                padding: '6px 10px',
                borderRadius: '10px',
                fontSize: '0.813rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span className="hidden md:inline">Unduh</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              style={{
                background: themes.bg,
                border: `1px solid ${themes.border}`,
                color: themes.text,
                padding: '8px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Pembaca"
              title="Tutup (Esc)"
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* PDF VIEWER CANVAS */}
        <div 
          style={{
            flex: 1,
            background: themes.viewerBg,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflow: 'auto',
            position: 'relative',
            padding: '24px 16px',
          }}
        >
          {renderError ? (
            /* Fallback to iframe/native viewer if react-pdf canvas has issues */
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                title={bookTitle}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                }}
              />
            </div>
          ) : (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                filter: themes.canvasFilter,
                transition: 'filter 0.2s ease',
              }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: themes.text }}>
                    <div className="loading-spinner" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Memuat Dokumen PDF...</span>
                  </div>
                }
              >
                <div 
                  style={{
                    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
