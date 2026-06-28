import { AdbWebUsbBackendManager, AdbWebUsbBackend } from "@yume-chan/adb-backend-webusb";
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import { Consumable, InspectStream } from "@yume-chan/stream-extra";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

let currentAdb: Adb | null = null;
let currentDevice: AdbWebUsbBackend | null = null;

export async function requestAdbDevice(): Promise<AdbWebUsbBackend | undefined> {
  const manager = AdbWebUsbBackendManager.BROWSER;
  if (!manager) {
    throw new Error("WebUSB is not supported in this browser.");
  }
  
  const device = await manager.requestDevice();
  if (!device) return undefined;
  
  return device;
}

export async function connectToAdb(device: AdbWebUsbBackend): Promise<Adb> {
  if (currentAdb) {
    await currentAdb.close();
  }

  // Ensure device is connected
  const connection = await device.connect();
  
  // Use WebCrypto and IndexedDB for persistent RSA keys
  const credentialStore = new AdbWebCredentialStore("android-web-mirror");
  
  const transport = await AdbDaemonTransport.authenticate({
    serial: device.serial,
    connection: connection as any,
    credentialStore,
    initialDelayedAckBytes: 0, // Disable delayed ack which can cause >32MB buffer requests on some Honor devices
  });
  
  const adb = new Adb(transport);
  
  currentAdb = adb;
  currentDevice = device;
  return adb;
}

export function getConnectedAdb(): Adb | null {
  return currentAdb;
}
