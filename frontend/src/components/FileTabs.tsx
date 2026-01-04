import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/types";

interface FileTabsProps {
  files: UploadedFile[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: (index: number) => void;
}

export function FileTabs({ files, activeIndex, onSelect, onClose }: FileTabsProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 border-b">
      {files.map((file, index) => (
        <div
          key={`${file.sessionId}-${file.filename}`}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-t-md text-sm cursor-pointer transition-colors",
            index === activeIndex
              ? "bg-background border border-b-0"
              : "bg-muted/50 hover:bg-muted"
          )}
          onClick={() => onSelect(index)}
        >
          <span className="truncate max-w-32">{file.filename}</span>
          {file.pageCount > 1 && (
            <span className="text-xs text-muted-foreground">
              ({file.pageCount} pages)
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(index);
            }}
            className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
