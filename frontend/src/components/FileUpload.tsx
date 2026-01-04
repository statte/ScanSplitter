import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFile = files.find(
        (f) =>
          f.type.startsWith("image/") ||
          f.type === "application/pdf"
      );

      if (validFile) {
        onUpload(validFile);
      }
    },
    [onUpload, disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={cn(
          "flex flex-col items-center gap-2 cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Drop files here or click to upload
        </span>
        <span className="text-xs text-muted-foreground/75">
          Images or PDFs
        </span>
      </label>
    </div>
  );
}
