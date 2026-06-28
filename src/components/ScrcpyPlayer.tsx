"use client";

import { useEffect, useRef, useState } from "react";
import { Adb } from "@yume-chan/adb";
import { AdbScrcpyClient, AdbScrcpyOptions2_4 } from "@yume-chan/adb-scrcpy";
import { ScrcpyVideoCodecId } from "@yume-chan/scrcpy";
import { ReadableStream } from "@yume-chan/stream-extra";

interface ScrcpyPlayerProps {
  adb: Adb;
}

export default function ScrcpyPlayer({ adb }: ScrcpyPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Pushing Scrcpy Server...");
  const clientRef = useRef<AdbScrcpyClient<AdbScrcpyOptions2_4<true>> | null>(null);

  useEffect(() => {
    let active = true;

    async function startScrcpy() {
      try {
        if (!canvasRef.current) return;

        // 1. Fetch server binary from Next.js public folder
        const response = await fetch("/scrcpy-server.jar");
        if (!response.body) throw new Error("Could not fetch scrcpy-server.jar");

        // Convert DOM ReadableStream to YumeChan ReadableStream
        const webStream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = response.body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value as Uint8Array);
            }
            controller.close();
          }
        });

        const serverPath = "/data/local/tmp/scrcpy-server.jar";
        await AdbScrcpyClient.pushServer(adb, webStream, serverPath);

        setStatus("Starting Scrcpy Server...");

        const options = new AdbScrcpyOptions2_4({
          logLevel: "debug",
          scid: Math.floor(Math.random() * 0x7FFFFFFF).toString(16).padStart(8, '0'), // Prevent Address already in use
          tunnelForward: true, // essential for WebUSB
          audio: false, // disabled for simplicity
          video: true,
          maxSize: 1024, // reduce size to ensure smooth performance initially
          videoBitRate: 2000000, // 2Mbps
        });

        const client = await AdbScrcpyClient.start(adb, serverPath, options);
        clientRef.current = client;

        if (!active) {
          client.close();
          return;
        }

        setStatus("Decoding Video Stream...");

        const videoStream = await client.videoStream;
        if (!videoStream) throw new Error("No video stream");

        const { WebGLVideoFrameRenderer, WebCodecsVideoDecoder } = await import("@yume-chan/scrcpy-decoder-webcodecs");

        // Setup rendering canvas renderer
        const renderer = new WebGLVideoFrameRenderer(canvasRef.current);
        const decoder = new WebCodecsVideoDecoder({
          codec: ScrcpyVideoCodecId.H264,
          renderer
        });

        // The decoder handles resizing the canvas automatically via renderer
        videoStream.stream.pipeTo(decoder.writable).catch(console.error);
        
        setStatus(""); // Clear status when playing

      } catch (err: any) {
        let errorMsg = err.message;
        if (err.output && Array.isArray(err.output)) {
          errorMsg += "\nServer Logs:\n" + err.output.join("\n");
        }
        if (active) setStatus(`Error: ${errorMsg}`);
        console.error("Scrcpy Error:", err, err.output);
      }
    }

    startScrcpy();

    return () => {
      active = false;
      if (clientRef.current) {
        clientRef.current.close().catch(console.error);
      }
    };
  }, [adb]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {status && <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{status}</div>}
      
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          display: status ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          background: '#000',
          borderRadius: isFullscreen ? '0' : '12px',
          boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            objectFit: 'contain'
          }} 
        />
        
        {!status && (
          <button 
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'opacity 0.2s',
              opacity: isFullscreen ? 0.3 : 1
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = isFullscreen ? '0.3' : '1')}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                <span>Fullscreen</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
