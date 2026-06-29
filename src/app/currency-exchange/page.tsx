"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './currency-exchange.module.css';

const CURRENCIES = [
  "THB", "USD", "EUR", "JPY", "GBP", "AUD", 
  "CAD", "CHF", "CNY", "KRW", "SGD", "NZD", 
  "INR", "BRL", "ZAR"
];

export default function CurrencyExchange() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("THB");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    if (fromCurrency === toCurrency) {
      setRate(1);
      setResult(parseFloat(amount) || 0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/latest?amount=1&from=${fromCurrency}&to=${toCurrency}`);
      if (!response.ok) throw new Error("Failed to fetch exchange rate");
      
      const data = await response.json();
      const currentRate = data.rates[toCurrency];
      setRate(currentRate);
      
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount)) {
        setResult(parsedAmount * currentRate);
      } else {
        setResult(0);
      }
    } catch (err) {
      setError("Failed to fetch rates. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRate();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchRate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Currency <span className="text-gradient">Exchange</span></h1>
        <p className={styles.subtitle}>Real-time, up-to-date foreign exchange rates.</p>
        <Link href="/" style={{ color: 'var(--accent-primary)', marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
          &larr; Back to Hub
        </Link>
      </header>

      <main className={`glass ${styles.exchangeCard}`}>
        <div className={styles.inputGroup}>
          <label>Amount & From</label>
          <div className={styles.inputRow}>
            <input 
              type="text" 
              inputMode="decimal"
              className={styles.currencyInput} 
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
            />
            <select 
              className={styles.currencySelect}
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button className={styles.swapButton} onClick={handleSwap} aria-label="Swap Currencies">
          &uarr;&darr;
        </button>

        <div className={styles.inputGroup}>
          <label>To Currency</label>
          <div className={styles.inputRow}>
            <select 
              className={styles.currencySelect}
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.result}>
          {loading ? (
            <div className={styles.loading}>Fetching latest rates...</div>
          ) : (
            <>
              <div className={styles.resultValue}>
                {result !== null ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} {toCurrency}
              </div>
              {rate && (
                <div className={styles.resultRate}>
                  1 {fromCurrency} = {rate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toCurrency}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
