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
        const webStream = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {status && <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{status}</div>}
      <canvas 
        ref={canvasRef} 
        style={{ 
          background: '#000', 
          borderRadius: '12px', 
          maxWidth: '100%', 
          maxHeight: '75vh',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: status ? 'none' : 'block'
        }} 
      />
    </div>
  );
}
