import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ImageEditor } from './ImageEditor';

interface EditorModalProps {
  image: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (imageData: ImageData) => void;
}

export function EditorModal({ image, isOpen, onClose, onComplete }: EditorModalProps) {
  if (!image) return null;

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent 
        className="max-w-[95vw] md:max-w-[40vw] p-6 border-none bg-background" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Image Editor</DialogTitle>
        <ImageEditor
          key={image}
          initialImage={image}
          onCancel={onClose}
          onComplete={onComplete}
        />
      </DialogContent>
    </Dialog>
  );
}