import { useState } from "react";
import { Download, FolderDown, RotateCcw, RotateCw, Expand, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbox } from "@/components/Lightbox";
import type { CroppedImage } from "@/types";

interface ResultsGalleryProps {
  images: CroppedImage[];
  onExport: () => void;
  onExportLocal: () => void;
  onNameChange: (id: string, name: string) => void;
  onBatchRename: (baseName: string) => void;
  onRotate: (id: string, direction: "left" | "right") => void;
  isExporting: boolean;
  outputDirectory: string;
  onOutputDirectoryChange: (path: string) => void;
}

export function ResultsGallery({
  images,
  onExport,
  onExportLocal,
  onNameChange,
  onBatchRename,
  onRotate,
  isExporting,
  outputDirectory,
  onOutputDirectoryChange,
}: ResultsGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [commonName, setCommonName] = useState("");

  const downloadImage = (image: CroppedImage) => {
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${image.data}`;
    link.download = `${image.name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyCommonName = () => {
    if (commonName.trim()) {
      onBatchRename(commonName.trim());
    }
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Cropped photos will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Results ({images.length})</CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onExportLocal}
                disabled={isExporting || !outputDirectory}
                title={!outputDirectory ? "Set output directory first" : "Export to directory"}
              >
                <FolderDown className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={onExport}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-1" />
                ZIP
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <Input
              value={outputDirectory}
              onChange={(e) => onOutputDirectoryChange(e.target.value)}
              placeholder="/path/to/output"
              className="text-xs h-7"
            />
          </div>
          {/* Common name input */}
          <div className="mt-2 flex gap-1">
            <Input
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              placeholder="Common name (e.g., vacation)"
              className="text-xs h-7 flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleApplyCommonName()}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={handleApplyCommonName}
              disabled={!commonName.trim()}
              title="Apply name to all photos (adds _1, _2, etc.)"
            >
              <Type className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={image.id} className="space-y-1">
                <div
                  className="relative aspect-square bg-muted rounded overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={`data:image/jpeg;base64,${image.data}`}
                    alt={`Cropped ${image.id}`}
                    className="w-full h-full object-contain"
                  />
                  {image.rotationApplied !== 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                      {image.rotationApplied}°
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 flex-shrink-0"
                    onClick={() => onRotate(image.id, "left")}
                    title="Rotate left 90°"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 flex-shrink-0"
                    onClick={() => onRotate(image.id, "right")}
                    title="Rotate right 90°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>
                  <Input
                    value={image.name}
                    onChange={(e) => onNameChange(image.id, e.target.value)}
                    className="h-7 text-xs flex-1 min-w-0"
                    placeholder="Name"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 flex-shrink-0"
                    onClick={() => downloadImage(image)}
                    title="Download image"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onRotate={onRotate}
        />
      )}
    </>
  );
}
