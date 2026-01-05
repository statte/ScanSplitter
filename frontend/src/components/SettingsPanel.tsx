import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { DetectionSettings } from "@/types";

interface SettingsPanelProps {
  settings: DetectionSettings;
  onSettingsChange: (settings: DetectionSettings) => void;
  onDetect: () => void;
  onCrop: () => void;
  isDetecting: boolean;
  isCropping: boolean;
  hasBoxes: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onDetect,
  onCrop,
  isDetecting,
  isCropping,
  hasBoxes,
}: SettingsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Min Area</span>
            <span className="text-muted-foreground">{settings.minArea}%</span>
          </div>
          <Slider
            value={settings.minArea}
            onChange={(value) =>
              onSettingsChange({ ...settings, minArea: value })
            }
            min={1}
            max={50}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Max Area</span>
            <span className="text-muted-foreground">{settings.maxArea}%</span>
          </div>
          <Slider
            value={settings.maxArea}
            onChange={(value) =>
              onSettingsChange({ ...settings, maxArea: value })
            }
            min={50}
            max={100}
            step={1}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-rotate"
            checked={settings.autoRotate}
            onChange={(e) =>
              onSettingsChange({ ...settings, autoRotate: e.target.checked })
            }
            className="rounded"
          />
          <label htmlFor="auto-rotate" className="text-sm">
            Auto-rotate photos
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-detect"
            checked={settings.autoDetect}
            onChange={(e) =>
              onSettingsChange({ ...settings, autoDetect: e.target.checked })
            }
            className="rounded"
          />
          <label htmlFor="auto-detect" className="text-sm">
            Auto-detect on upload
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="detection-mode" className="text-sm">
            Detection Mode
          </label>
          <select
            id="detection-mode"
            value={settings.detectionMode}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                detectionMode: e.target.value as "classic" | "u2net",
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="classic">Classic (Fast)</option>
            <option value="u2net">U2-Net (AI, Accurate)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            {settings.detectionMode === "u2net"
              ? "Deep learning model - better for difficult scans"
              : "Traditional contour detection - fast and reliable"}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={onDetect}
            disabled={isDetecting}
            className="w-full"
          >
            {isDetecting ? "Detecting..." : "Detect Photos"}
          </Button>
          <Button
            onClick={onCrop}
            disabled={isCropping || !hasBoxes}
            variant="secondary"
            className="w-full"
          >
            {isCropping ? "Cropping..." : "Crop Selected"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
