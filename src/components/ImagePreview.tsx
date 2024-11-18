import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RotateCcw, Download, Pencil } from 'lucide-react';

interface ImagePreviewProps {
  imageData: ImageData;
  originalImage: string;
  onReset: () => void;
  onEdit: () => void;
}

export function ImagePreview({
  imageData,
  onReset,
  onEdit,
}: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create temporary canvas for transformations
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Put image data on temporary canvas
    tempCtx.putImageData(imageData, 0, 0);

    // Calculate center position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Save context state
    ctx.save();

    // Move to center, rotate, scale, then move back
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-imageData.width / 2, -imageData.height / 2);

    // Apply brightness
    ctx.filter = `brightness(${brightness}%)`;

    // Draw the image
    ctx.drawImage(tempCanvas, 0, 0);

    // Restore context state
    ctx.restore();
  }, [imageData, scale, rotation, brightness, backgroundColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'headfloat.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="w-[500px] h-[500px] mx-auto">
          <Card className="w-full h-full">
            <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
            </div>
          </Card>
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Adjust your image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Size</Label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Rotation</Label>
            <Slider
              min={0}
              max={360}
              value={[rotation]}
              onValueChange={([value]) => setRotation(value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Brightness</Label>
            <Slider
              min={0}
              max={200}
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-12 p-1 bg-transparent"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
