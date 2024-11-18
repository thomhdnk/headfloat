import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Scissors, Trash2, Undo, ZoomIn } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface ImageEditorProps {
  initialImage: string;
  onCancel: () => void;
  onComplete: (imageData: ImageData) => void;
}

export function ImageEditor({ initialImage, onCancel, onComplete }: ImageEditorProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image with zoom
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw points and lines
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      if (points.length > 2) ctx.closePath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.stroke();

      points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === selectedPoint ? '#0ea5e9' : 
                       i === hoveredPoint ? '#7dd3fc' : '#ffffff';
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }
  }, [points, selectedPoint, hoveredPoint, zoom]);

  const calculateCanvasSize = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const MAX_SIZE = 640;
    const imgAspectRatio = img.width / img.height;
    let width, height;

    if (imgAspectRatio > 1) {
      // Landscape
      width = Math.min(img.width, MAX_SIZE);
      height = width / imgAspectRatio;
    } else {
      // Portrait
      height = Math.min(img.height, MAX_SIZE);
      width = height * imgAspectRatio;
    }

    return { width, height };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        const size = calculateCanvasSize();
        if (size) {
          canvas.width = size.width;
          canvas.height = size.height;
          setCanvasSize(size);
          requestAnimationFrame(() => {
            drawImage();
          });
        }
      }
    };

    img.src = initialImage;
  }, [initialImage, drawImage, calculateCanvasSize]);

  // Recalculate canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      const size = calculateCanvasSize();
      if (size && canvasRef.current) {
        canvasRef.current.width = size.width;
        canvasRef.current.height = size.height;
        setCanvasSize(size);
        drawImage();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCanvasSize, drawImage]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (selectedPoint !== null) {
      setSelectedPoint(null);
    } else {
      setPoints([...points, { x, y }]);
    }
  }, [points, selectedPoint]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isDragging && selectedPoint !== null) {
      const newPoints = [...points];
      newPoints[selectedPoint] = { x, y };
      setPoints(newPoints);
    } else {
      // Check if mouse is near any point
      const hovered = points.findIndex(point => 
        Math.hypot(point.x - x, point.y - y) < 8
      );
      setHoveredPoint(hovered !== -1 ? hovered : null);
    }
  }, [points, isDragging, selectedPoint]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if clicking on a point
    const pointIndex = points.findIndex(point => 
      Math.hypot(point.x - x, point.y - y) < 8
    );

    if (pointIndex !== -1) {
      setSelectedPoint(pointIndex);
      setIsDragging(true);
    }
  }, [points]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeSelectedPoint = useCallback(() => {
    if (selectedPoint !== null) {
      setPoints(points.filter((_, i) => i !== selectedPoint));
      setSelectedPoint(null);
    }
  }, [points, selectedPoint]);

  const cutImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img || points.length < 3) return;

    // Create a temporary canvas for cutting
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Clear the temporary canvas with transparent pixels
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the path and clip
    tempCtx.beginPath();
    tempCtx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => {
      tempCtx.lineTo(point.x, point.y);
    });
    tempCtx.closePath();
    tempCtx.clip();

    // Draw the image only inside the clipped area
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get the image data
    const fullImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

    // Find bounds of non-transparent pixels
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (fullImageData.data[i + 3] !== 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add padding
    const padding = 2;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    // Get the cropped image data
    const width = maxX - minX;
    const height = maxY - minY;
    const croppedData = tempCtx.getImageData(minX, minY, width, height);

    onComplete(croppedData);
  }, [points, onComplete]);

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <Slider
              className="w-[100px]"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
            />
          </div>
          {points.length > 0 && (
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
                  onClick={removeSelectedPoint}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove point
                </Button>
              )}
              {points.length > 2 && (
                <Button
                  size="sm"
                  onClick={cutImage}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Cut image
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="p-6 flex items-center justify-center bg-neutral-950/5 shadow-lg">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className={`${
            hoveredPoint !== null ? "cursor-move" : "cursor-crosshair"
          } w-full h-full object-contain`}
        />
      </Card>
    </div>
  );
}