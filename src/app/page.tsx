import Link from "next/link";
import styles from "./page.module.css";

export default function Hub() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/icon.svg" alt="Icon" width={48} height={48} />
          <span>General <span className="text-gradient">multi tools</span></span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            The ultimate toolkit for <br />
            <span className="text-gradient">everything you need.</span>
          </h1>
          <p className={styles.description}>
            A growing collection of powerful, browser-based utilities built with modern web technologies. No installation required.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgeneral-multi-tools.vercel.app&count_bg=%233b82f6&title_bg=%231e40af&title=Visits+(Today+%2F+Total)&edge_flat=false" 
              alt="Visitor Badge" 
              style={{ borderRadius: '4px', height: '24px' }}
            />
          </div>
        </div>

        <div className={styles.grid}>
          <Link href="/webmirror" className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>📱</div>
              <span className={styles.statusBadge}>Active</span>
            </div>
            <h2>WebMirror</h2>
            <p>Connect and control your Android device directly from the browser. Supports 60fps video, touch events, and file management.</p>
            <div className={styles.tags}>
              <span>WebUSB</span>
              <span>WebCodecs</span>
              <span>ADB</span>
            </div>
          </Link>

          <Link href="/color-picker" className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🎨</div>
              <span className={styles.statusBadge}>Active</span>
            </div>
            <h2>Color Picker & Extractor</h2>
            <p>Interactive color wheel and local image pixel extraction. Outputs to HEX, RGB, and HSL instantly.</p>
            <div className={styles.tags}>
              <span>Canvas API</span>
              <span>Design</span>
            </div>
          </Link>
          
          <Link href="/binary-calc" className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🔢</div>
              <span className={styles.statusBadge}>Active</span>
            </div>
            <h2>Binary Calculator</h2>
            <p>Convert between Decimal, Binary, Octal, and Hex. Perform binary arithmetic including fractional values.</p>
            <div className={styles.tags}>
              <span>Math</span>
              <span>Computer Science</span>
            </div>
          </Link>

          <Link href="/unit-converter" className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>⚖️</div>
              <span className={styles.statusBadge}>Active</span>
            </div>
            <h2>Unit Converter</h2>
            <p>Universal measurement converter for Length, Volume, and Mass. Accurate up to 6 decimal places.</p>
            <div className={styles.tags}>
              <span>Utility</span>
              <span>Daily Use</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
