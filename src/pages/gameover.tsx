// GameOver.tsx

import React from 'react';
import Link from 'next/link';

const GameOver: React.FC = () => {

  const gameOverStyles = {
    backgroundImage: "url('/over.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    cursor: 'pointer',
  };

  return (
    <Link href="/">
      <div style={gameOverStyles}>
        <h1>あなたは死んでしまいました。</h1>
      </div>
    </Link>
  );
};

export default GameOver;
