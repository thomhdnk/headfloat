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
import { RotateCcw, Download, Pencil, RotateCw } from 'lucide-react';

interface Emoji {
  id: string;
  symbol: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const EMOJI_OPTIONS = [
  { symbol: '👑', name: 'Crown' },
  { symbol: '🕶️', name: 'Sunglasses' },
  { symbol: '🎩', name: 'Top Hat' },
  { symbol: '🤠', name: 'Cowboy Hat' },
  { symbol: '😎', name: 'Cool' },
  { symbol: '🦄', name: 'Unicorn' },
  { symbol: '⭐', name: 'Star' },
  { symbol: '🎭', name: 'Theater' },
];

interface ImagePreviewProps {
  imageData: ImageData;
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
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

    // Draw emojis
    emojis.forEach((emoji) => {
      ctx.save();
      ctx.translate(emoji.x, emoji.y);
      ctx.rotate((emoji.rotation * Math.PI) / 180);
      ctx.font = `${48 * emoji.scale}px serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(emoji.symbol, 0, 0);
      
      // Draw selection box if emoji is selected
      if (selectedEmoji === emoji.id) {
        const metrics = ctx.measureText(emoji.symbol);
        const height = 48 * emoji.scale;
        const width = metrics.width;
        
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          -width / 2 - 5,
          -height / 2 - 5,
          width + 10,
          height + 10
        );
      }
      ctx.restore();
    });
  }, [imageData, scale, rotation, brightness, backgroundColor, emojis, selectedEmoji]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if clicked on an emoji
    const clickedEmoji = emojis.find((emoji) => {
      const distance = Math.hypot(emoji.x - x, emoji.y - y);
      return distance < 24 * emoji.scale;
    });

    setSelectedEmoji(clickedEmoji?.id || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedEmoji) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const emoji = emojis.find((e) => e.id === selectedEmoji);
    if (emoji) {
      setDraggingEmoji(selectedEmoji);
      setDragOffset({
        x: x - emoji.x,
        y: y - emoji.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !draggingEmoji) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setEmojis(emojis.map((emoji) =>
      emoji.id === draggingEmoji
        ? {
            ...emoji,
            x: x - dragOffset.x,
            y: y - dragOffset.y,
          }
        : emoji
    ));
  };

  const handleMouseUp = () => {
    setDraggingEmoji(null);
  };

  const addEmoji = (symbol: string) => {
    const newEmoji: Emoji = {
      id: Math.random().toString(36).substr(2, 9),
      symbol,
      x: 250,
      y: 250,
      scale: 1,
      rotation: 0,
    };
    setEmojis([...emojis, newEmoji]);
    setSelectedEmoji(newEmoji.id);
  };

  const removeSelectedEmoji = () => {
    if (selectedEmoji) {
      setEmojis(emojis.filter((emoji) => emoji.id !== selectedEmoji));
      setSelectedEmoji(null);
    }
  };

  const updateSelectedEmojiScale = (scale: number) => {
    if (selectedEmoji) {
      setEmojis(emojis.map((emoji) =>
        emoji.id === selectedEmoji
          ? { ...emoji, scale }
          : emoji
      ));
    }
  };

  const updateSelectedEmojiRotation = (rotation: number) => {
    if (selectedEmoji) {
      setEmojis(emojis.map((emoji) =>
        emoji.id === selectedEmoji
          ? { ...emoji, rotation }
          : emoji
      ));
    }
  };

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
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
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

          <div className="space-y-2">
            <Label>Add Emoji</Label>
            <div className="grid grid-cols-4 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji.symbol}
                  variant="outline"
                  className="h-10 px-0"
                  onClick={() => addEmoji(emoji.symbol)}
                >
                  {emoji.symbol}
                </Button>
              ))}
            </div>
          </div>

          {selectedEmoji && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Emoji Size</Label>
                <Slider
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={[emojis.find((e) => e.id === selectedEmoji)?.scale || 1]}
                  onValueChange={([value]) => updateSelectedEmojiScale(value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Emoji Rotation</Label>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[emojis.find((e) => e.id === selectedEmoji)?.rotation || 0]}
                  onValueChange={([value]) => updateSelectedEmojiRotation(value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => updateSelectedEmojiRotation(0)}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Reset rotation
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={removeSelectedEmoji}
              >
                Remove Emoji
              </Button>
            </div>
          )}
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
