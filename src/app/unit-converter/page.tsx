"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./unit-converter.module.css";

type Category = 'Length' | 'Volume' | 'Mass';

const CONVERSIONS: Record<Category, Record<string, number>> = {
  Length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Inch: 0.0254,
    Foot: 0.3048,
    Yard: 0.9144,
    Mile: 1609.34
  },
  Volume: {
    Liter: 1,
    Milliliter: 0.001,
    'Teaspoon (US)': 0.00492892,
    'Tablespoon (US)': 0.0147868,
    'Cup (US)': 0.236588,
    'Fluid Ounce (US)': 0.0295735,
    Gallon: 3.78541
  },
  Mass: {
    Kilogram: 1,
    Gram: 0.001,
    Milligram: 0.000001,
    Ounce: 0.0283495,
    Pound: 0.453592
  }
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('Length');
  
  const [unitA, setUnitA] = useState('Meter');
  const [unitB, setUnitB] = useState('Foot');
  
  const [valA, setValA] = useState('1');
  const [valB, setValB] = useState('');

  // Reset default units when category changes
  useEffect(() => {
    const units = Object.keys(CONVERSIONS[category]);
    setUnitA(units[0]);
    setUnitB(units[1] || units[0]);
    setValA('1');
  }, [category]);

  // Recalculate whenever inputs or units change
  useEffect(() => {
    if (valA === '') {
      setValB('');
      return;
    }
    const numA = parseFloat(valA);
    if (isNaN(numA)) return;

    const rateA = CONVERSIONS[category][unitA];
    const rateB = CONVERSIONS[category][unitB];
    
    // Convert A to base, then base to B
    const baseVal = numA * rateA;
    const finalVal = baseVal / rateB;
    
    // Round to 6 decimal places to avoid floating point weirdness
    setValB(parseFloat(finalVal.toFixed(6)).toString());
  }, [valA, unitA, unitB, category]);

  const handleValBChange = (newValB: string) => {
    setValB(newValB);
    if (newValB === '') {
      setValA('');
      return;
    }
    const numB = parseFloat(newValB);
    if (isNaN(numB)) return;

    const rateA = CONVERSIONS[category][unitA];
    const rateB = CONVERSIONS[category][unitB];
    
    const baseVal = numB * rateB;
    const finalVal = baseVal / rateA;
    
    setValA(parseFloat(finalVal.toFixed(6)).toString());
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <span>← Back to Hub</span>
        </Link>
      </header>

      <div>
        <h1 className={styles.title}>Unit Converter</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Instantly convert between length, volume, and mass measurements.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          {(Object.keys(CONVERSIONS) as Category[]).map(c => (
            <button 
              key={c}
              className={`${styles.tab} ${category === c ? styles.tabActive : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.converterGrid}>
          <div className={styles.inputGroup}>
            <select 
              className={styles.select}
              value={unitA}
              onChange={(e) => setUnitA(e.target.value)}
            >
              {Object.keys(CONVERSIONS[category]).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input 
              type="number"
              className={styles.input}
              value={valA}
              onChange={(e) => setValA(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className={styles.equals}>=</div>

          <div className={styles.inputGroup}>
            <select 
              className={styles.select}
              value={unitB}
              onChange={(e) => setUnitB(e.target.value)}
            >
              {Object.keys(CONVERSIONS[category]).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input 
              type="number"
              className={styles.input}
              value={valB}
              onChange={(e) => handleValBChange(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
