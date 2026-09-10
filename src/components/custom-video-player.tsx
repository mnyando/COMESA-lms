'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  initialPositionSeconds?: number;
  onTimeUpdate?: (positionSeconds: number) => void;
  onEnded?: () => void;
}

export function CustomVideoPlayer({
  src,
  poster,
  initialPositionSeconds = 0,
  onTimeUpdate,
  onEnded,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (videoRef.current && initialPositionSeconds > 0) {
      videoRef.current.currentTime = initialPositionSeconds;
    }
  }, [initialPositionSeconds]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl max-w-4xl mx-auto">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={togglePlay}
        className="w-full h-auto aspect-video object-cover cursor-pointer"
      />

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#4168DD]/90 hover:bg-[#4168DD] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <Play className="w-8 h-8 fill-current ml-1" />
        </button>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700/80 accent-[#4168DD] rounded-lg cursor-pointer hover:h-2 transition-all"
        />

        <div className="flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-1 hover:text-[#4168DD] transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="p-1 hover:text-[#4168DD] transition-colors">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 accent-[#4168DD] rounded cursor-pointer"
              />
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg px-2 py-0.5 border border-slate-700">
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1 text-[10px] font-medium rounded ${
                    playbackSpeed === s ? 'text-[#4168DD] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button onClick={toggleFullscreen} className="p-1 hover:text-[#4168DD] transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
