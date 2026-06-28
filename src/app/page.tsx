import Link from "next/link";
import styles from "./page.module.css";

export default function Hub() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/icon.svg" alt="Icon" width={32} height={32} />
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

          {/* Placeholder for future tools */}
          <div className={`glass ${styles.card} ${styles.comingSoon}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🎵</div>
              <span className={styles.statusBadge} style={{ background: '#333', color: '#888' }}>Coming Soon</span>
            </div>
            <h2>Audio Forge</h2>
            <p>Advanced browser-based audio editing and mixing utilizing WebAudio APIs.</p>
          </div>
          
          <div className={`glass ${styles.card} ${styles.comingSoon}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🔒</div>
              <span className={styles.statusBadge} style={{ background: '#333', color: '#888' }}>Coming Soon</span>
            </div>
            <h2>Secure Vault</h2>
            <p>Client-side encryption tool for safely sharing passwords and sensitive documents.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
