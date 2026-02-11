// src/polyfills.ts
import { Buffer } from "buffer";

// Global Buffer polyfill
if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}