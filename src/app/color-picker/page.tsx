"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./color-picker.module.css";

// Utility to convert HEX to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Utility to convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
};

export default function ColorPicker() {
  const [colorHex, setColorHex] = useState("#3B82F6");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const rgb = hexToRgb(colorHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorHex(e.target.value.toUpperCase());
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas to fit container width while maintaining aspect ratio
    const containerWidth = canvas.parentElement?.clientWidth || 500;
    const ratio = img.height / img.width;
    canvas.width = containerWidth;
    canvas.height = containerWidth * ratio;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const handleResize = () => {
      if (imageFile) drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageFile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setColorHex(hex);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <span>← Back to Hub</span>
        </Link>
      </header>

      <div>
        <h1 className={styles.title}>Color Picker & Extractor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Pick a color manually or extract exact pixel colors from an image.</p>
      </div>

      <div className={styles.content}>
        {/* Left Column: Standard Picker */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Color Palette</h2>
          
          <div className={styles.colorPreview} style={{ backgroundColor: colorHex }}>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              pointerEvents: 'none'
            }}>
              Click to choose
            </span>
            <input 
              type="color" 
              value={colorHex} 
              onChange={handleColorChange}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.formats}>
            <div className={styles.formatGroup}>
              <span className={styles.formatLabel}>HEX</span>
              <span className={styles.formatValue}>{colorHex}</span>
              <button className={styles.copyBtn} onClick={() => copyToClipboard(colorHex)} title="Copy HEX">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
            
            <div className={styles.formatGroup}>
              <span className={styles.formatLabel}>RGB</span>
              <span className={styles.formatValue}>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
              <button className={styles.copyBtn} onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} title="Copy RGB">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>

            <div className={styles.formatGroup}>
              <span className={styles.formatLabel}>HSL</span>
              <span className={styles.formatValue}>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
              <button className={styles.copyBtn} onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} title="Copy HSL">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Image Extractor */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Image Color Extractor</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Upload an image and click anywhere on it to extract the exact pixel color. Processed securely in your browser.
          </p>

          {!imageFile ? (
            <div 
              className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>Drag & drop an image here</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>or click to browse</p>
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className={styles.canvasContainer}>
              <canvas 
                ref={canvasRef} 
                className={styles.imageCanvas}
                onClick={handleCanvasClick}
                onMouseMove={(e) => {
                  // Optional: Could add hover color preview here
                }}
              />
              <button 
                className={`btn btn-secondary ${styles.removeBtn}`}
                onClick={() => setImageFile(null)}
              >
                Choose Different Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
