import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  RotateCw,
  Trash2,
  Download,
  Undo,
  Scissors,
  ArrowLeft,
} from 'lucide-react';

interface EditorControlsProps {
  points: { x: number; y: number }[];
  setPoints: (points: { x: number; y: number }[]) => void;
  selectedPoint: number | null;
  isCut: boolean;
  onReset: () => void;
  onRemovePoint: () => void;
  onCut: () => void;
}

export function EditorControls({
  points,
  setPoints,
  selectedPoint,
  isCut,
  onReset,
  onRemovePoint,
  onCut,
}: EditorControlsProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="text-white hover:text-white/90"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Choose different photo
      </Button>
      {points.length > 0 && !isCut && (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPoints(points.slice(0, -1))}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo point
          </Button>
          {selectedPoint !== null && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemovePoint}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove point
            </Button>
          )}
          {points.length > 2 && (
            <Button
              size="sm"
              onClick={onCut}
            >
              <Scissors className="w-4 h-4 mr-2" />
              Cut image
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface AdjustmentsProps {
  scale: number;
  rotation: number;
  brightness: number;
  backgroundColor: string;
  onScaleChange: (value: number) => void;
  onRotationChange: (value: number) => void;
  onBrightnessChange: (value: number) => void;
  onBackgroundColorChange: (value: string) => void;
}

EditorControls.Adjustments = function EditorAdjustments({
  scale,
  rotation,
  brightness,
  backgroundColor,
  onScaleChange,
  onRotationChange,
  onBrightnessChange,
  onBackgroundColorChange,
}: AdjustmentsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Size</Label>
        <Slider
          value={[scale]}
          onValueChange={([value]) => onScaleChange(value)}
          min={50}
          max={150}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Rotation</Label>
        <Slider
          value={[rotation]}
          onValueChange={([value]) => onRotationChange(value)}
          min={-180}
          max={180}
          step={1}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onRotationChange(0)}
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Reset rotation
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Brightness</Label>
        <Slider
          value={[brightness]}
          onValueChange={([value]) => onBrightnessChange(value)}
          min={0}
          max={200}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Background color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-12 h-12 p-1"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </>
  );
};

interface ActionsProps {
  onDownload: () => void;
  onAdjustTracing: () => void;
}

EditorControls.Actions = function EditorActions({
  onDownload,
  onAdjustTracing,
}: ActionsProps) {
  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={onDownload}
      >
        <Download className="w-4 h-4 mr-2" />
        Download PNG
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={onAdjustTracing}
      >
        Adjust tracing
      </Button>
    </div>
  );
};