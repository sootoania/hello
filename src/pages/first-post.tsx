"use client"
import React, { useState, useEffect, useRef } from 'react';

type Coordinate = {
    latitude: number;
    longitude: number;
};

type SpeedData = {
    timestamp: number;
    distance: number;
};

const MUSIC_TIMES: Record<string, number> = {
    a: 10000,
    b: 30000,
    c: 60000,
};

const App: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentMusic, setCurrentMusic] = useState<string | null>(null);
    const [lastPosition, setLastPosition] = useState<Coordinate | null>(null);
    const [speedDatas, setSpeedDatas] = useState<SpeedData[]>([]);
    const [averageSpeed, setAverageSpeed] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const calculateDistance = (pointA: Coordinate, pointB: Coordinate): number => {
      const latDiff = pointA.latitude - pointB.latitude;
      const lonDiff = pointA.longitude - pointB.longitude;
      const latAvg = (pointA.latitude + pointB.latitude) / 2.0;
      const latsMetPerDeg = 111.13209 - 0.56605 * Math.cos(2.0 * latAvg) + 0.00120 * Math.cos(4.0 * latAvg);
      const lonMetPerDeg = 111.41513 * Math.cos(latAvg) - 0.09455 * Math.cos(3.0 * latAvg) + 0.00012 * Math.cos(5.0 * latAvg);
      const distance = Math.sqrt((latDiff * latsMetPerDeg) ** 2 + (lonDiff * lonMetPerDeg) ** 2);
      return distance;
    };

    useEffect(() => {
        if (audioRef.current) {
            if (currentMusic === 'a' || currentMusic === 'b' || currentMusic === 'c') {
                audioRef.current.volume = 0.1;
            } else {
                audioRef.current.volume = volume;
            }
        }
    }, [volume, currentMusic]);

    const adjustVolume = (speed: number, playbackTime: number): number => {
      if (speed < 50) {
        return 1.0;
    } else if (speed < 150) {
        return 0.5;
    } else {
        return 0.1;
    }
    };

    useEffect(() => {
      if (currentMusic === 'c') {
          const fetchPosition = () => {
              navigator.geolocation.getCurrentPosition(position => {
                  const currentPosition: Coordinate = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                  };

                  if (lastPosition) {
                      const distance = calculateDistance(lastPosition, currentPosition);
                      const now = new Date().getTime();

                      if (speedDatas.length > 0) {
                          const deltaTime = (now - speedDatas[speedDatas.length - 1].timestamp) / (1000 * 60);
                          const speed = distance / deltaTime;

                          const newSpeedDatas = [...speedDatas, { timestamp: now, distance }];
                          setSpeedDatas(newSpeedDatas);

                          const totalDistance = newSpeedDatas.reduce((acc, curr) => acc + curr.distance, 0);
                          setAverageSpeed(totalDistance / (60 * 1000));

                          setVolume(adjustVolume(speed, audioRef.current ? audioRef.current.currentTime * 1000 : 0));
                      } else {
                          setSpeedDatas([{ timestamp: now, distance }]);
                      }
                  }
                  setLastPosition(currentPosition);
              });
          };

          const intervalId = setInterval(fetchPosition, 5000);

          return () => clearInterval(intervalId);
      }
  }, [currentMusic, lastPosition, speedDatas]);

    const handleStartStoryClick = () => {
        setIsRunning(true);
        setCurrentMusic('a');
        if (audioRef.current) {
            audioRef.current.play().catch(error => {
                console.error("Error playing audio on start:", error);
            });
        }
    };
      useEffect(() => {
        if (currentMusic && audioRef.current) {
            const audio = audioRef.current;
            
            if (audio.src !== `/${currentMusic}.mp3`) {
                audio.pause();
                audio.currentTime = 0;
                audio.src = `/${currentMusic}.mp3`;
                audio.play().catch(error => {
                    console.error("Error playing audio:", error);
                });
            }

            const nextMusicHandler = () => {
                switch (currentMusic) {
                    case 'a':
                        setCurrentMusic('b');
                        break;
                    case 'b':
                        setCurrentMusic('c');
                        break;
                    case 'c':
                        if (averageSpeed >= 250) {
                            setCurrentMusic('d');
                        } else if (averageSpeed >= 180){
                            setCurrentMusic('c');
                        } else {
                            setCurrentMusic('e');
                        }
                        break;
                }
            };

            setTimeout(nextMusicHandler, MUSIC_TIMES[currentMusic]);
        }
    }, [currentMusic, averageSpeed]);

    useEffect(() => {
        if (currentMusic === 'e') {
            const timeoutId = setTimeout(() => {
                window.location.href = '/gameover';
            }, 20000);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [currentMusic]);

    useEffect(() => {
        if (currentMusic === 'd') {
            const timeoutId = setTimeout(() => {
                window.location.href = '/gameclear';
            }, 20000);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [currentMusic]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            {!isRunning ? (
                <div onClick={handleStartStoryClick} style={{
                    border: '2px solid white',
                    padding: '20px 40px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}>
                    <h1>始まりの物語</h1>
                </div>
            ) : (
                <div style={{
                    width: '80%',
                    margin: '0 auto',
                    padding: '20px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0, 0.5)'
                  }}>
                      <audio ref={audioRef} controls style={{
                          width: '100%',
                          marginBottom: '20px'
                      }} onError={(e) => {
                          console.error('Audio playback error:', e);
                      }} />
  
                      <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '10px'
                      }}>
                          <p><strong>Current Song:</strong> {currentMusic}</p>
                          <p><strong>Average Speed:</strong> {averageSpeed.toFixed(2)} m/s</p>
                          <p><strong>Volume:</strong> {volume}</p>
                      </div>
                  </div>
              )}
          </div>
      );
  };
  
  export default App;
  
