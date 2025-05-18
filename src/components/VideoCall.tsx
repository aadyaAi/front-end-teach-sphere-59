
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

const VideoCall: React.FC = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        // Turn off camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        setIsMicOn(false);
      } else {
        // Turn on camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        setIsCameraOn(true);
        setIsMicOn(true);
        setIsPermissionDenied(false);
        
        toast("Camera enabled!");
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setIsPermissionDenied(true);
      toast("Camera access denied. Please check your browser permissions.", {
        description: "This app needs camera access to function properly."
      });
    }
  };

  const toggleMic = () => {
    if (!streamRef.current) return;
    
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
      
      toast(isMicOn ? "Microphone muted" : "Microphone unmuted");
    }
  };

  useEffect(() => {
    // Clean up function to stop all tracks when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-call-container w-full h-full flex flex-col items-center bg-teach-secondary rounded-lg p-2">
      <div className="video-container w-full flex-1 bg-gray-800 rounded-lg overflow-hidden mb-2 relative flex items-center justify-center">
        {!isCameraOn && !isPermissionDenied && (
          <div className="text-white text-center">
            <p>Camera is off</p>
            <p className="text-xs opacity-70">Click the camera button to start your video</p>
          </div>
        )}
        
        {isPermissionDenied && (
          <div className="text-white text-center p-4">
            <p>Camera access denied</p>
            <p className="text-xs opacity-70 mt-2">
              Please enable camera access in your browser settings
            </p>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
        />
      </div>
      
      <div className="controls-container flex gap-2">
        <Button 
          onClick={toggleCamera} 
          variant="outline" 
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button 
          onClick={toggleMic} 
          variant="outline" 
          className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${!isCameraOn ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isCameraOn}
          aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
