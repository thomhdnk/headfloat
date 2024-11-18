import { useEffect, useRef } from 'react';

const ROW_1_IMAGES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
];

const ROW_2_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&h=200&fit=crop',
];

export function Carousel() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!row1 || !row2) return;

    // Clone images for seamless loop
    const cloneImages = () => {
      row1.innerHTML += row1.innerHTML;
      row2.innerHTML += row2.innerHTML;
    };
    cloneImages();

    let row1Position = 0;
    let row2Position = 0;
    const speed = 0.5;

    const animate = () => {
      if (!row1 || !row2) return;

      row1Position -= speed;
      row2Position += speed;

      // Reset position when first set of images is complete
      if (row1Position <= -row1.children[0].clientWidth * (ROW_1_IMAGES.length)) {
        row1Position = 0;
      }
      if (row2Position >= 0) {
        row2Position = -row2.children[0].clientWidth * (ROW_2_IMAGES.length);
      }

      row1.style.transform = `translateX(${row1Position}px)`;
      row2.style.transform = `translateX(${row2Position}px)`;

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden">
        <div 
          ref={row1Ref}
          className="flex gap-8 py-4"
          style={{ width: 'fit-content' }}
        >
          {ROW_1_IMAGES.map((src, i) => (
            <div
              key={i}
              className="relative w-48 h-48 rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={src}
                alt={`Example ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden">
        <div 
          ref={row2Ref}
          className="flex gap-8 py-4"
          style={{ width: 'fit-content' }}
        >
          {ROW_2_IMAGES.map((src, i) => (
            <div
              key={i}
              className="relative w-48 h-48 rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={src}
                alt={`Example ${i + 7}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}