"use client";

import { useAgent } from "@/hooks/use-agent";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NanoBananaFeed() {
  const { generatedImages } = useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<typeof generatedImages[0] | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (generatedImages.length === 0) return;
    
    const latestImage = generatedImages[generatedImages.length - 1];
    
    // Only react to NEW images (different timestamp)
    if (currentImage?.timestamp !== latestImage.timestamp) {
      // If already open, close first then reopen with new image
      if (isOpen) {
        setIsOpen(false);
        setTimeout(() => {
          setCurrentImage(latestImage);
          setAnimationKey(prev => prev + 1);
          setIsOpen(true);
        }, 300);
      } else {
        // If closed, just open with new image
        setCurrentImage(latestImage);
        setAnimationKey(prev => prev + 1);
        setIsOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedImages]);

  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Image popup */}
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-2xl w-full bg-bg1 rounded-2xl shadow-2xl overflow-hidden border border-separator1">
              <div className="relative aspect-square bg-bg2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentImage.imageUrl} 
                  alt={currentImage.prompt}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="p-4 bg-bg1">
                <p className="text-sm text-fg2">{currentImage.prompt}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

