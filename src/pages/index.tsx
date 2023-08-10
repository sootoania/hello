import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const App: React.FC = () => {
    return (
        <div style={{ overflowY: 'scroll', width: '100vw', height: '100vh' }}>
            <Link href="/first-post" legacyBehavior>
                <div style={{ position: 'relative', width: '100%', minHeight: '150vh' }}>
                    {/* 画像の表示 */}
                    <Image 
                        src="/top-image.png"
                        alt="Background Image"
                        layout="fill"
                        objectFit="cover"
                    />
                    {/* 画像の上に文字を表示 */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '0', 
                        transform: 'translateY(-50%)'
                    }}>
                        <div style={{ 
                            color: '#A04848',
                            fontFamily: 'Inter',
                            fontSize: '200px',
                            fontWeight: 600,
                            lineHeight: 'normal',
                            marginBottom: '10px'
                        }}>
                            Run
                        </div>
                        <div style={{ 
                            color: '#A04848',
                            fontFamily: 'Inter',
                            fontSize: '200px',
                            fontWeight: 600,
                            lineHeight: 'normal',
                            marginBottom: '10px'
                        }}>
                            For
                        </div>
                        <div style={{ 
                            color: '#A04848',
                            fontFamily: 'Inter',
                            fontSize: '200px',
                            fontWeight: 600,
                            lineHeight: 'normal'
                        }}>
                            Life
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default App;
