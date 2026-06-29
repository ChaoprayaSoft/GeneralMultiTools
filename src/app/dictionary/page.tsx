"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './dictionary.module.css';

interface Language {
  code: string;
  name: string;
  ttsCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', ttsCode: 'en-US' },
  { code: 'th', name: 'Thai', ttsCode: 'th-TH' },
  { code: 'ko', name: 'Korean', ttsCode: 'ko-KR' },
  { code: 'ja', name: 'Japanese', ttsCode: 'ja-JP' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', ttsCode: 'zh-CN' },
];

export default function DictionaryTranslator() {
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('th');
  const [sourceText, setSourceText] = useState<string>('');
  const [targetText, setTargetText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
      );
      if (!response.ok) throw new Error("Translation failed");
      
      const data = await response.json();
      if (data.responseStatus === 200) {
        setTargetText(data.responseData.translatedText);
      } else {
        setError(data.responseDetails || "Translation error");
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
    
    window.speechSynthesis.cancel(); // Stop any currently playing audio
    window.speechSynthesis.speak(utterance);
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
              <textarea 
                className={styles.textArea}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
              />
              <button 
                className={styles.audioButton}
                onClick={() => playAudio(sourceText, sourceLang)}
                disabled={!sourceText}
                title="Listen to original text"
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
              >
                🔊
              </button>
            </div>
          </div>
        </div>

        <button 
          className={styles.translateButton}
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </main>
    </div>
  );
}
