"use client";

import React, { useEffect, useState } from 'react';

const ConfettiPiece = ({ id }: { id: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const randomX = Math.random() * 100;
    const randomY = -10 - Math.random() * 20;
    const randomDelay = Math.random() * 5;
    const randomDuration = 5 + Math.random() * 5;
    const colors = ['#3F51B5', '#00BCD4', '#FFC107', '#4CAF50', '#E91E63'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = Math.random() * 360;

    setStyle({
      left: `${randomX}vw`,
      top: `${randomY}vh`,
      backgroundColor: randomColor,
      animation: `fall ${randomDuration}s linear ${randomDelay}s infinite`,
      transform: `rotate(${randomRotation}deg)`,
      width: `${8 + Math.random() * 8}px`,
      height: `${8 + Math.random() * 8}px`,
      position: 'fixed',
      zIndex: 100,
      opacity: 0,
    });
  }, []);

  return <div style={style}></div>;
};

const Confetti = () => {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }, (_, i) => i);
    setPieces(newPieces);
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fall {
        0% { transform: translateY(0vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };

  }, []);

  return <>{pieces.map(i => <ConfettiPiece key={i} id={i} />)}</>;
};

export default Confetti;
