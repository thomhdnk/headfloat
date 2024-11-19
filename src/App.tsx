import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { EditorModal } from '@/components/EditorModal';
import { Carousel } from '@/components/Carousel';
import { ScissorsLineDashed } from 'lucide-react';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        <div className="relative px-6 py-24 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Your avatar,<br /> your first impression
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stand out from the crowd with a bold, custom avatar that captures attention, builds trust, and turns visitors into customers. Your profile deserves more than a basic headshot.
            </p>
          </div>

          <div className="max-w-7xl mx-auto mb-24">
            {!uploadedImage && !imageData ? (
              <div className="max-w-xl mx-auto text-center">
                <ImageUpload 
                  onImageUpload={(image) => {
                    setUploadedImage(image);
                    setIsEditing(true);
                  }} 
                />
                <small className="text-slate-500">Your image is processed locally and never saved. Privacy guaranteed.</small>
              </div>
            ) : imageData ? (
              <ImagePreview
                imageData={imageData}
                originalImage={uploadedImage!}
                onReset={() => {
                  setUploadedImage(null);
                  setImageData(null);
                }}
                onEdit={() => setIsEditing(true)}
              />
            ) : null}
          </div>

          <div className="relative py-12">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
            <Carousel />
          </div>
        </div>
      </div>

      <EditorModal
        image={uploadedImage}
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          if (!imageData) {
            setUploadedImage(null);
          }
        }}
        onComplete={(data) => {
          setImageData(data);
          setIsEditing(false);
        }}
      />
    </div>
  );
}

export default App;
