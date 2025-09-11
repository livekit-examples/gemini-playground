'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function MeetAcaiSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">Meet ACAI</h2>
        <p className="text-xl text-muted-foreground">Your personal AI cooking assistant</p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
        <motion.div 
          className="relative w-64 h-64 md:w-80 md:h-80"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="/acai_female.png"
            alt="ACAI Female Assistant"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 256px, 320px"
          />
        </motion.div>
        
        <motion.div 
          className="relative w-64 h-64 md:w-80 md:h-80"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Image
            src="/acai_male.png"
            alt="ACAI Male Assistant"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 256px, 320px"
          />
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-lg text-muted-foreground">
          Choose your preferred ACAI assistant and start your culinary journey together
        </p>
      </motion.div>
    </section>
  );
}
