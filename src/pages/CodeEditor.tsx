
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import VideoCall from '@/components/VideoCall';
import { toast } from 'sonner';
import { generateRoomId } from '@/utils/roomUtils';

const CodeEditorPage = () => {
  // Get the room ID from URL params or generate a new one
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const [roomId, setRoomId] = useState<string>(urlRoomId || generateRoomId());
  const navigate = useNavigate();
  const [isJoiningExistingRoom, setIsJoiningExistingRoom] = useState<boolean>(!!urlRoomId);
  
  // Sync the URL with the roomId if needed
  useEffect(() => {
    if (!urlRoomId) {
      // If we're not already in a room URL, update the URL to include the roomId
      navigate(`/code/${roomId}`, { replace: true });
    }
  }, [roomId, urlRoomId, navigate]);

  // If joining an existing room, show a notification
  useEffect(() => {
    if (urlRoomId && isJoiningExistingRoom) {
      toast.info('Joined shared code editor room', {
        description: 'You can now collaborate with others in real-time.'
      });
      setIsJoiningExistingRoom(false);
    }
  }, [urlRoomId, isJoiningExistingRoom]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header roomId={roomId} />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <div className="flex-1 flex gap-4">
          <div className="flex-1 rounded-lg shadow-lg overflow-hidden bg-white">
            <CodeEditor roomId={roomId} />
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

export default CodeEditorPage;
