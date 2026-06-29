"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Tesseract from 'tesseract.js';
import styles from './dictionary.module.css';

interface Language {
  code: string;
  name: string;
  ttsCode: string;
  tesseractCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', ttsCode: 'en-US', tesseractCode: 'eng' },
  { code: 'th', name: 'Thai', ttsCode: 'th-TH', tesseractCode: 'tha' },
  { code: 'ko', name: 'Korean', ttsCode: 'ko-KR', tesseractCode: 'kor' },
  { code: 'ja', name: 'Japanese', ttsCode: 'ja-JP', tesseractCode: 'jpn' },
  { code: 'zh', name: 'Chinese (Simplified)', ttsCode: 'zh-CN', tesseractCode: 'chi_sim' },
];

export default function DictionaryTranslator() {
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('th');
  const [sourceText, setSourceText] = useState<string>('');
  const [targetText, setTargetText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Camera OCR states
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleTranslate = async (textToTranslate = sourceText) => {
    if (!textToTranslate.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(textToTranslate)}`
      );
      if (!response.ok) throw new Error("Translation failed");
      
      const data = await response.json();
      if (data.translation) {
        setTargetText(data.translation);
      } else {
        setError(data.error || "Translation error");
      }
    } catch (err) {
      setError("Failed to fetch translation. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const playAudio = (text: string, langCode: string) => {
    if (!text || !window.speechSynthesis) return;

    const lang = LANGUAGES.find(l => l.code === langCode);
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (lang) {
      utterance.lang = lang.ttsCode;
    }
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Camera features
  const openCamera = async () => {
    setIsCameraOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
      console.error(err);
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    closeCamera();
    setOcrLoading(true);

    try {
      const lang = LANGUAGES.find(l => l.code === sourceLang);
      const tesseractLang = lang ? lang.tesseractCode : 'eng';
      
      const result = await Tesseract.recognize(
        imageDataUrl,
        tesseractLang,
        {
          logger: m => console.log(m)
        }
      );
      
      const extractedText = result.data.text.trim();
      if (extractedText) {
        setSourceText(extractedText);
        // Automatically translate
        handleTranslate(extractedText);
      } else {
        setError("No text recognized in the image.");
      }
    } catch (err) {
      setError("Failed to extract text from image.");
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Translate & <span className="text-gradient">Dictionary</span></h1>
        <p className={styles.subtitle}>Translate sentences instantly and listen to their pronunciation.</p>
        <Link href="/" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
          &larr; Back to Hub
        </Link>
      </header>

      <main className={`glass ${styles.translatorCard}`}>
        <div className={styles.languageControls}>
          <select 
            className={styles.langSelect}
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>

          <button className={styles.swapButton} onClick={handleSwap} aria-label="Swap Languages">
            &uarr;&darr;
          </button>

          <select 
            className={styles.langSelect}
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.panels}>
          <div className={styles.panel}>
            <div className={styles.textAreaContainer}>
              {ocrLoading && (
                <div className={styles.ocrLoadingOverlay}>
                  Scanning text...
                </div>
              )}
              <textarea 
                className={styles.textArea}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                disabled={ocrLoading}
              />
              <button 
                className={styles.cameraButton}
                onClick={openCamera}
                disabled={ocrLoading}
                title="Scan text with camera"
                type="button"
              >
                📸
              </button>
              <button 
                className={styles.audioButton}
                onClick={() => playAudio(sourceText, sourceLang)}
                disabled={!sourceText || ocrLoading}
                title="Listen to original text"
                type="button"
              >
                🔊
              </button>
            </div>
          </div>
          
          <div className={styles.panel}>
            <div className={styles.textAreaContainer}>
              <textarea 
                className={styles.textArea}
                value={loading ? "Translating..." : targetText}
                readOnly
                placeholder="Translation will appear here..."
              />
              <button 
                className={styles.audioButton}
                onClick={() => playAudio(targetText, targetLang)}
                disabled={!targetText || loading}
                title="Listen to translated text"
                type="button"
              >
                🔊
              </button>
            </div>
          </div>
        </div>

        <button 
          className={styles.translateButton}
          onClick={() => handleTranslate(sourceText)}
          disabled={loading || !sourceText.trim() || ocrLoading}
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </main>

      {/* Camera Modal overlay */}
      {isCameraOpen && (
        <div className={styles.cameraModal}>
          <video 
            ref={videoRef} 
            className={styles.cameraVideo}
            autoPlay 
            playsInline
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className={styles.cameraControls}>
            <button className={styles.captureButton} onClick={handleCapture}>
              Capture & Read
            </button>
            <button className={styles.closeButton} onClick={closeCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
