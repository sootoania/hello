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
    a: 10000, // 10 seconds
    b: 30000, // 30 seconds
    c: 60000, // 60 seconds
};

const RunningApp: React.FC = () => {
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
        // 仮定: 速度が50/min未満の場合は音量を最大(1)に設定
        // 速度が50m/min以上で150m/min未満の場合は音量を0.5に設定
        // 速度が150m/min以上の場合は音量を最小(0.1)に設定
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
            // ... (そのまま)
            const watchId = navigator.geolocation.watchPosition(position => {
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

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [currentMusic, lastPosition, speedDatas]);

    const handleStartButtonClick = () => {
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
            
            if (audio.src !== `${currentMusic}.mp3`) {
                audio.pause();
                audio.currentTime = 0;
                audio.src = `${currentMusic}.mp3`;
            }

            audio.play().catch(error => {
                console.error("Error playing audio:", error);
            });

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
                        } else if (averageSpeed >= 180) {
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

    return (
        <div>
            <button onClick={handleStartButtonClick}>Start</button>
            <audio ref={audioRef} controls onError={(e) => {
                console.error('Audio playback error:', e);
            }} />
            <p>Current Song: {currentMusic}</p>
            <p>Average Speed: {averageSpeed}</p>
            <p>Volume: {volume}</p>
        </div>
    );
};

export default RunningApp;
