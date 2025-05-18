
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Whiteboard from '@/components/Whiteboard';
import VideoCall from '@/components/VideoCall';
import ProblemStatement from '@/components/ProblemStatement';
import InterviewNotes from '@/components/InterviewNotes';
import SessionTimer from '@/components/SessionTimer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateRoomId } from '@/utils/roomUtils';
import { toast } from 'sonner';

enum Tab {
  CODE = 'code',
  WHITEBOARD = 'whiteboard'
}

const InterviewRoom = () => {
  // Get the room ID from URL params or generate a new one
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const [roomId, setRoomId] = useState<string>(urlRoomId || generateRoomId());
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CODE);
  const [isJoiningExistingRoom, setIsJoiningExistingRoom] = useState<boolean>(!!urlRoomId);
  
  // Sync the URL with the roomId if needed
  useEffect(() => {
    if (!urlRoomId) {
      // If we're not already in a room URL, update the URL to include the roomId
      navigate(`/interview/${roomId}`, { replace: true });
    }
  }, [roomId, urlRoomId, navigate]);

  // If joining an existing room, show a notification
  useEffect(() => {
    if (urlRoomId && isJoiningExistingRoom) {
      toast.info('Joined interview room', {
        description: 'You can now collaborate with others in real-time.'
      });
      setIsJoiningExistingRoom(false);
    }
  }, [urlRoomId, isJoiningExistingRoom]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header roomId={roomId} />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <div className="mb-4">
          <ProblemStatement roomId={roomId} />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="w-full">
            <div className="flex justify-between items-center mb-2">
              <TabsList>
                <TabsTrigger value={Tab.CODE}>Code Editor</TabsTrigger>
                <TabsTrigger value={Tab.WHITEBOARD}>Whiteboard</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <SessionTimer roomId={roomId} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
            
            <TabsContent value={Tab.CODE} className="flex-1 rounded-lg shadow-lg overflow-hidden bg-white border">
              <CodeEditor roomId={roomId} />
            </TabsContent>
            
            <TabsContent value={Tab.WHITEBOARD} className="flex-1 rounded-lg shadow-lg overflow-hidden bg-white border">
              <Whiteboard roomId={roomId} />
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <InterviewNotes roomId={roomId} />
            </div>
            
            <div className="w-full">
              <VideoCall />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewRoom;
