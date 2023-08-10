

import React from 'react';
import Link from 'next/link';

const GameClear: React.FC = () => {

  const gameClearStyles = {
    backgroundImage: "url('/clear.jpg')",
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
      <div style={gameClearStyles}>
        <h1>あなたは逃げ切りました。</h1>
      </div>
    </Link>
  );
};

export default GameClear;
