
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import ShareRoomDialog from './ShareRoomDialog';
import CollaborationStatus from './CollaborationStatus';

interface HeaderProps {
  roomId: string;
}

const Header: React.FC<HeaderProps> = ({ roomId }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-teach-primary">
            TeachSphere
          </h1>
          <span className="ml-2 bg-teach-accent text-white text-xs px-2 py-0.5 rounded-full">
            Beta
          </span>
          <div className="ml-4">
            <CollaborationStatus roomId={roomId} />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShareDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Share className="h-4 w-4" /> Share Room
          </Button>
          <Button variant="default" size="sm">
            New Whiteboard
          </Button>
        </div>
      </div>
      
      <ShareRoomDialog 
        roomId={roomId}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </header>
  );
};

export default Header;
