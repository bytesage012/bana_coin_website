import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  id: number;
}

const CursorTrail: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    let counter = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: counter++ };
      setPoints((prev) => [...prev.slice(-15), newPoint]); // Keep last 15 points
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      <AnimatePresence>
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#F3BA2F',
              boxShadow: '0 0 10px #F3BA2F, 0 0 20px #F3BA2F',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorTrail;