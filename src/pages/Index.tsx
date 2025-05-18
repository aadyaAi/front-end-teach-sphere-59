
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Whiteboard from '@/components/Whiteboard';
import VideoCall from '@/components/VideoCall';
import Toolbar from '@/components/Toolbar';
import { toast } from 'sonner';
import { generateRoomId } from '@/utils/roomUtils';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

const Index = () => {
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#2563eb');
  const whiteboardRef = useRef<any>(null);
  
  // Get the room ID from URL params or generate a new one
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const [roomId, setRoomId] = useState<string>(urlRoomId || generateRoomId());
  const navigate = useNavigate();
  const [isJoiningExistingRoom, setIsJoiningExistingRoom] = useState<boolean>(!!urlRoomId);
  
  // Sync the URL with the roomId if needed
  useEffect(() => {
    if (!urlRoomId) {
      // If we're not already in a room URL, update the URL to include the roomId
      navigate(`/room/${roomId}`, { replace: true });
    }
  }, [roomId, urlRoomId, navigate]);

  // If joining an existing room, show a notification
  useEffect(() => {
    if (urlRoomId && isJoiningExistingRoom) {
      toast.info('Joined shared whiteboard room', {
        description: 'You can now collaborate with others in real-time.'
      });
      setIsJoiningExistingRoom(false);
    }
  }, [urlRoomId, isJoiningExistingRoom]);

  const handleSelectTool = (tool: Tool) => {
    setCurrentTool(tool);
    toast(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleClear = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.clearCanvas();
    }
  };

  const handleUndo = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.redo();
    }
  };

  const handleSave = (format: 'png' | 'jpeg') => {
    if (whiteboardRef.current) {
      whiteboardRef.current.downloadCanvas(format);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header roomId={roomId} />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <div className="mb-4">
          <Toolbar 
            onSelectTool={handleSelectTool} 
            currentTool={currentTool}
            onClear={handleClear}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onColorChange={handleColorChange}
            currentColor={currentColor}
            onSave={handleSave}
          />
        </div>
        
        <div className="flex-1 flex gap-4">
          <div className="flex-1 rounded-lg shadow-lg overflow-hidden bg-white">
            <Whiteboard ref={whiteboardRef} roomId={roomId} />
          </div>
          
          <div className="w-80 h-auto hidden md:block">
            <VideoCall />
          </div>
        </div>
      </main>
      
      <div className="block md:hidden p-4 bg-white border-t border-gray-200">
        <VideoCall />
      </div>
    </div>
  );
};

export default Index;
