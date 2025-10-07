'use client';

import { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useSession } from 'next-auth/react';

interface VideoPlayerProps {
  videoId: string;
  youtubeId: string;
  title: string;
  onProgressUpdate?: (progressSeconds: number) => void;
  onVideoEnd?: () => void;
}

export function VideoPlayer({ 
  youtubeId, 
  onProgressUpdate, 
  onVideoEnd 
}: VideoPlayerProps) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Track progress every 5 seconds while playing
  useEffect(() => {
    if (!player || !isPlaying || !session) return;

    const interval = setInterval(() => {
      const current = player.getCurrentTime();
      setCurrentTime(current);
      
      // Only update progress if user is signed in and video has progressed
      if (onProgressUpdate && current > 0) {
        onProgressUpdate(Math.floor(current));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [player, isPlaying, session, onProgressUpdate]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const onPlay: YouTubeProps['onPlay'] = () => {
    setIsPlaying(true);
  };

  const onPause: YouTubeProps['onPause'] = () => {
    setIsPlaying(false);
  };

  const onEnd: YouTubeProps['onEnd'] = () => {
    setIsPlaying(false);
    if (onVideoEnd) {
      onVideoEnd();
    }
    // Mark as completed when video ends
    if (onProgressUpdate && duration > 0) {
      onProgressUpdate(Math.floor(duration));
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = () => {
    // Update current time when state changes
    if (player) {
      setCurrentTime(player.getCurrentTime());
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 1,
      disablekb: 0,
      enablejsapi: 1,
      fs: 1,
      playsinline: 1,
    },
  };

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <YouTube
          videoId={youtubeId}
          opts={opts}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onEnd}
          onStateChange={onStateChange}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
      
      {/* Progress indicator for signed-in users */}
      {session && duration > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60)}:
              {Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentTime / duration) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {!session && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Sign in to track your progress</span> and pick up where you left off.
          </p>
        </div>
      )}
    </div>
  );
}