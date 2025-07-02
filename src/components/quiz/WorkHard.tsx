"use client";

import { BrainCircuit } from 'lucide-react';
import { useEffect } from 'react';

const WorkHard = () => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes pulse-glow {
        0%, 100% {
          transform: scale(1);
          filter: drop-shadow(0 0 2px hsl(var(--primary)));
        }
        50% {
          transform: scale(1.1);
          filter: drop-shadow(0 0 5px hsl(var(--primary)));
        }
      }
      .animate-pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="flex justify-center items-center my-4">
      <BrainCircuit className="h-16 w-16 text-primary animate-pulse-glow" />
    </div>
  );
};

export default WorkHard;
