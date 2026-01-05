import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function estimateBase64FileSize(base64: string): number {
  // Base64 encodes 3 bytes into 4 characters
  // Remove any data URL prefix if present
  const pureBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  return Math.floor(pureBase64.length * 0.75);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}
