"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./webmirror.module.css";
import { requestAdbDevice, connectToAdb, getConnectedAdb } from "../../lib/adb";
import ScrcpyPlayer from "../../components/ScrcpyPlayer";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceModel, setDeviceModel] = useState<string | null>(null);
  const [isMirroring, setIsMirroring] = useState(false);

  const handleConnect = async () => {
    try {
      const device = await requestAdbDevice();
      if (!device) return;
      
      console.log("Device selected:", device);
      const adb = await connectToAdb(device);
      
      // Get device info
      const buildModel = await adb.getProp("ro.product.model");
      setDeviceModel(buildModel.trim());
      
      setIsConnected(true);
    } catch (err) {
      console.error("Connection failed or cancelled", err);
      alert("Connection failed. Check console for details.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>← Tools /</span>
            <span>Web<span className="text-gradient">Mirror</span></span>
          </Link>
        </div>
        <div className={styles.status}>
          {isConnected ? (
            <span style={{ color: "var(--secondary)" }}>● Connected</span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>○ Disconnected</span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {isConnected ? (
          isMirroring ? (
            <ScrcpyPlayer adb={getConnectedAdb()!} />
          ) : (
            <div className={`glass ${styles.hero}`}>
              <h2 className={styles.title} style={{ fontSize: '2rem' }}>
                Connected to <span className="text-gradient">{deviceModel || "Device"}</span>
              </h2>
              <p className={styles.description}>
                ADB connection established successfully. Ready to launch screen mirroring or access files.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => setIsMirroring(true)}>Start Screen Mirror</button>
                <button className="btn btn-secondary">File Manager</button>
              </div>
            </div>
          )
        ) : (
          <div className={`glass ${styles.hero}`}>
            <div className={styles.features}>
              <span className={styles.featureBadge}>60fps Video</span>
              <span className={styles.featureBadge}>Touch Control</span>
              <span className={styles.featureBadge}>File Manager</span>
            </div>
            
            <h1 className={styles.title}>
              Control your Android device <br />
              <span className="text-gradient">right from the browser.</span>
            </h1>
            
            <p className={styles.description}>
              No software installation required. Connect your phone via USB and start mirroring instantly with zero latency.
            </p>

            <button className="btn btn-primary" onClick={handleConnect} style={{ padding: "1rem 2rem", fontSize: "1.125rem" }}>
              Connect Device
            </button>

            <div className={styles.instructions}>
              <p>Ensure <strong>USB Debugging</strong> is enabled in your Android Developer Settings.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
