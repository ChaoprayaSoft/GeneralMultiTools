"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./binary-calc.module.css";

const parseFractional = (str: string, base: number): number => {
  if (!str) return 0;
  let isNegative = str.startsWith('-');
  if (isNegative) str = str.substring(1);
  const parts = str.split('.');
  const intPart = parseInt(parts[0] || '0', base);
  if (isNaN(intPart)) return NaN;
  let fracPart = 0;
  if (parts[1]) {
    fracPart = parts[1].split('').reduce((acc, char, i) => {
      const val = parseInt(char, base);
      return acc + (isNaN(val) ? 0 : val * Math.pow(base, -(i + 1)));
    }, 0);
  }
  return isNegative ? -(intPart + fracPart) : (intPart + fracPart);
};

export default function BinaryCalculator() {
  // Base Converter State
  const [baseValues, setBaseValues] = useState({ dec: '', bin: '', oct: '', hex: '' });

  const handleBaseChange = (value: string, base: number) => {
    if (value === '') {
      setBaseValues({ dec: '', bin: '', oct: '', hex: '' });
      return;
    }
    const num = parseFractional(value, base);
    if (isNaN(num)) return;
    
    setBaseValues({
      dec: base === 10 ? value : num.toString(10),
      bin: base === 2 ? value : num.toString(2),
      oct: base === 8 ? value : num.toString(8),
      hex: base === 16 ? value : num.toString(16).toUpperCase(),
    });
  };

  // Binary Math State
  const [mathOp, setMathOp] = useState('+');
  const [binA, setBinA] = useState('');
  const [binB, setBinB] = useState('');

  const calcMath = () => {
    const numA = parseFractional(binA, 2);
    const numB = parseFractional(binB, 2);
    if (isNaN(numA) || isNaN(numB)) return { bin: 'Invalid', dec: 'Invalid' };

    let res = 0;
    if (mathOp === '+') res = numA + numB;
    if (mathOp === '-') res = numA - numB;
    if (mathOp === '*') res = numA * numB;
    if (mathOp === '/') res = numB === 0 ? NaN : numA / numB;

    if (isNaN(res)) return { bin: 'Error', dec: 'Error' };
    return { bin: res.toString(2), dec: res.toString(10) };
  };

  const mathResult = calcMath();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <span>← Back to Hub</span>
        </Link>
      </header>

      <div>
        <h1 className={styles.title}>Binary & Base Calculator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Convert between bases and perform binary arithmetic (fractional supported).</p>
      </div>

      <div className={styles.content}>
        {/* Base Converter */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Base Converter</h2>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Decimal (Base 10)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={baseValues.dec}
              onChange={(e) => handleBaseChange(e.target.value, 10)}
              placeholder="e.g. 25.5"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Binary (Base 2)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={baseValues.bin}
              onChange={(e) => handleBaseChange(e.target.value, 2)}
              placeholder="e.g. 11001.1"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Octal (Base 8)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={baseValues.oct}
              onChange={(e) => handleBaseChange(e.target.value, 8)}
              placeholder="e.g. 31.4"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Hexadecimal (Base 16)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={baseValues.hex}
              onChange={(e) => handleBaseChange(e.target.value, 16)}
              placeholder="e.g. 19.8"
            />
          </div>
        </div>

        {/* Binary Calculator */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Binary Math</h2>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Binary Value A</label>
            <input 
              type="text" 
              className={styles.input} 
              value={binA}
              onChange={(e) => setBinA(e.target.value)}
              placeholder="1010.11"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Operation</label>
            <select className={styles.select} value={mathOp} onChange={(e) => setMathOp(e.target.value)}>
              <option value="+">Addition (+)</option>
              <option value="-">Subtraction (-)</option>
              <option value="*">Multiplication (×)</option>
              <option value="/">Division (÷)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Binary Value B</label>
            <input 
              type="text" 
              className={styles.input} 
              value={binB}
              onChange={(e) => setBinB(e.target.value)}
              placeholder="11.01"
            />
          </div>

          <div className={styles.resultBox} style={{ marginTop: '1rem' }}>
            <span className={styles.resultTitle}>Binary Result</span>
            <span className={styles.resultValue}>{mathResult.bin}</span>
            <span className={styles.resultDec}>Decimal: {mathResult.dec}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
