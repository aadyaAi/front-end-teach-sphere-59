
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, WifiOff, Code } from 'lucide-react';
import { peerService } from '@/services/peerService';
import { useLocation } from 'react-router-dom';

interface CollaborationStatusProps {
  roomId: string;
}

const CollaborationStatus: React.FC<CollaborationStatusProps> = ({ roomId }) => {
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const location = useLocation();
  const isCodeEditor = location.pathname.includes('/code/');

  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectedPeers(peerService.getConnectedPeers());
      setIsConnected(peerService.isConnected());
    };

    // Set up interval to periodically check connection status
    const intervalId = setInterval(updateConnectionStatus, 2000);
    
    return () => clearInterval(intervalId);
  }, [roomId]);

  if (connectedPeers.length === 0) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
        <WifiOff className="h-3 w-3" />
        <span>No collaborators</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
      {isCodeEditor ? <Code className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      <span>{connectedPeers.length} {connectedPeers.length === 1 ? 'collaborator' : 'collaborators'} connected</span>
    </Badge>
  );
};

export default CollaborationStatus;
