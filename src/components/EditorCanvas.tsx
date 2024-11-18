import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  isCut: boolean;
  hoveredPoint: number | null;
}

export function EditorCanvas({
  canvasRef,
  width,
  height,
  onClick,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  isCut,
  hoveredPoint,
}: EditorCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={cn(
        "border rounded-lg",
        !isCut && hoveredPoint !== null ? "cursor-move" : "cursor-crosshair"
      )}
    />
  );
}