
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  color?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color = '#ec4899' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Initialized with null to resolve "Expected 1 arguments, but got 0" error in strict environments
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars: number[] = new Array(40).fill(0).map(() => Math.random() * 50 + 10);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bars.length;
      
      bars.forEach((bar, i) => {
        if (isPlaying) {
          // Simulate reactive motion
          const noise = Math.random() * 5;
          const target = Math.random() * (canvas.height - 20) + 10;
          bars[i] = bar * 0.9 + target * 0.1 + noise;
        } else {
          bars[i] = bar * 0.95 + 5 * 0.05;
        }

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        const x = i * barWidth;
        const y = canvas.height - bars[i];
        
        // Draw rounded bar
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, bars[i], 5);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={120} 
      className="w-full h-full opacity-80"
    />
  );
};

export default Visualizer;
