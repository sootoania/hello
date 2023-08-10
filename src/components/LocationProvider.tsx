"use client"
import React, { useState, useEffect } from 'react';

type LocationContextType = {
  latitude: number;
  longitude: number;
  speed: number; // 分速 (m/min)
};

type Props = {
    children: React.ReactNode;
  };

export const LocationContext = React.createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<Props> = ({ children }) => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [prevLocation, setPrevLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [prevTime, setPrevTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        // 前回の位置情報と時間が存在する場合、速度を計算
        if (prevLocation && prevTime) {
          const distance = Math.sqrt(
            Math.pow(lat - prevLocation.lat, 2) +
            Math.pow(lon - prevLocation.lon, 2)
          ) * 111000; // 大体の距離(m)に変換 (1度の緯度は約111km)
          const timeDiff = (new Date().getTime() - prevTime.getTime()) / 1000 / 60; // 分に変換
          const calculatedSpeed = distance / timeDiff;
          setSpeed(calculatedSpeed);
        }

        setPrevLocation({ lat, lon });
        setPrevTime(new Date());
      });
    };

    // 5秒ごとに位置情報を更新
    const intervalId = setInterval(updateLocation, 5000);

    return () => clearInterval(intervalId);
  }, [prevLocation, prevTime]);

  return (
    <LocationContext.Provider value={{ latitude, longitude, speed }}>
      {children}
    </LocationContext.Provider>
  );
};
