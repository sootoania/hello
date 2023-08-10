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
    const [currentMusic, setCurrentMusic] = useState<string | null>('a');
    const [lastPosition, setLastPosition] = useState<Coordinate | null>(null);
    const [speedDatas, setSpeedDatas] = useState<SpeedData[]>([]);
    const [averageSpeed, setAverageSpeed] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const adjustVolume = (speed: number, playbackTime: number): number => {
        if (playbackTime > 5000 && speed === 0) return 1;
        if (speed >= 250) return 0;
        if (speed >= 200) return 0.05;
        if (speed >= 150) return 0.1;
        if (speed >= 100) return 0.15;
        if (speed >= 60) return 0.2;
        if (speed >= 20) return 0.85;
        if (speed >= 10) return 1;
        return 0.05;
    };

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
            audioRef.current.volume = volume;
        }
    }, [volume, currentMusic]);

    useEffect(() => {
        if (currentMusic === 'c') {

            const watchOptions = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

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
            }, undefined, watchOptions);

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [currentMusic, lastPosition, speedDatas]);

    useEffect(() => {
        if (currentMusic && audioRef.current) {
            const audio = audioRef.current;

            if (audio.src !== `${currentMusic}.mp3`) {
                audio.pause();
                audio.currentTime = 0;
                audio.src = `${currentMusic}.mp3`;

                if (currentMusic === 'c') {
                    setVolume(0.025);
                }

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

    const handleStartButtonClick = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(error => {
                console.error("Error playing audio on start:", error);
            });
        }
    };

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
