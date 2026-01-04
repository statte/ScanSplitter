import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { FileTabs } from "@/components/FileTabs";
import { ImageCanvas } from "@/components/ImageCanvas";
import { PageNavigator } from "@/components/PageNavigator";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ResultsGallery } from "@/components/ResultsGallery";
import { uploadFile, detectBoxes, cropImages, exportZip, getImageUrl } from "@/lib/api";
import type { UploadedFile, BoundingBox, CroppedImage, DetectionSettings } from "@/types";

function App() {
  // File state
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Results state
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);

  // Settings state
  const [settings, setSettings] = useState<DetectionSettings>({
    minArea: 2,
    maxArea: 80,
    autoRotate: true,
  });

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get active file
  const activeFile = files[activeFileIndex] ?? null;

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      const newFile: UploadedFile = {
        sessionId: result.sessionId,
        filename: result.filename,
        pageCount: result.pageCount,
        currentPage: 1,
        imageWidth: result.imageWidth,
        imageHeight: result.imageHeight,
        boxes: [],
      };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileIndex(files.length);
      setCroppedImages([]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [files.length]);

  // Handle file tab selection
  const handleSelectFile = useCallback((index: number) => {
    setActiveFileIndex(index);
    setCroppedImages([]);
  }, []);

  // Handle file tab close
  const handleCloseFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= index && activeFileIndex > 0) {
      setActiveFileIndex(activeFileIndex - 1);
    }
    setCroppedImages([]);
  }, [activeFileIndex]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((f, i) =>
        i === activeFileIndex ? { ...f, currentPage: page, boxes: [] } : f
      )
    );
    setCroppedImages([]);
  }, [activeFile, activeFileIndex]);

  // Handle boxes change
  const handleBoxesChange = useCallback((boxes: BoundingBox[]) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === activeFileIndex ? { ...f, boxes } : f))
    );
  }, [activeFileIndex]);

  // Handle detection
  const handleDetect = useCallback(async () => {
    if (!activeFile) return;
    setIsDetecting(true);
    try {
      const result = await detectBoxes(
        activeFile.sessionId,
        activeFile.currentPage,
        settings.minArea,
        settings.maxArea
      );
      handleBoxesChange(result.boxes);
    } catch (error) {
      console.error("Detection failed:", error);
      alert("Failed to detect photos");
    } finally {
      setIsDetecting(false);
    }
  }, [activeFile, settings, handleBoxesChange]);

  // Handle crop
  const handleCrop = useCallback(async () => {
    if (!activeFile || activeFile.boxes.length === 0) return;
    setIsCropping(true);
    try {
      const result = await cropImages(
        activeFile.sessionId,
        activeFile.currentPage,
        activeFile.boxes,
        settings.autoRotate
      );
      setCroppedImages(result);
    } catch (error) {
      console.error("Crop failed:", error);
      alert("Failed to crop photos");
    } finally {
      setIsCropping(false);
    }
  }, [activeFile, settings.autoRotate]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!activeFile || croppedImages.length === 0) return;
    setIsExporting(true);
    try {
      const blob = await exportZip(activeFile.sessionId, "jpeg", 85);

      // Download the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scansplitter_export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export photos");
    } finally {
      setIsExporting(false);
    }
  }, [activeFile, croppedImages.length]);

  // Get current image URL
  const imageUrl = activeFile
    ? getImageUrl(activeFile.sessionId, activeFile.filename, activeFile.currentPage)
    : null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">ScanSplitter</h1>
          <p className="text-muted-foreground">
            Detect, adjust, and extract photos from scanned images
          </p>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-4">
          {/* Left panel - Settings */}
          <div className="space-y-4">
            <FileUpload onUpload={handleUpload} disabled={isUploading} />
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onDetect={handleDetect}
              onCrop={handleCrop}
              isDetecting={isDetecting}
              isCropping={isCropping}
              hasBoxes={(activeFile?.boxes.length ?? 0) > 0}
            />
          </div>

          {/* Center panel - Canvas */}
          <div className="min-h-[600px] flex flex-col">
            <FileTabs
              files={files}
              activeIndex={activeFileIndex}
              onSelect={handleSelectFile}
              onClose={handleCloseFile}
            />
            <div className="flex-1 mt-2">
              <ImageCanvas
                imageUrl={imageUrl}
                boxes={activeFile?.boxes ?? []}
                onBoxesChange={handleBoxesChange}
              />
            </div>
            {activeFile && activeFile.pageCount > 1 && (
              <div className="mt-2">
                <PageNavigator
                  currentPage={activeFile.currentPage}
                  totalPages={activeFile.pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Right panel - Results */}
          <div>
            <ResultsGallery
              images={croppedImages}
              onExport={handleExport}
              isExporting={isExporting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
