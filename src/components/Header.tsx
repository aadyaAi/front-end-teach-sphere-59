
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Code } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ShareRoomDialog from './ShareRoomDialog';
import CollaborationStatus from './CollaborationStatus';

interface HeaderProps {
  roomId: string;
}

const Header: React.FC<HeaderProps> = ({ roomId }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const location = useLocation();
  
  // Determine if we're on the whiteboard or code editor page
  const isCodeEditorPage = location.pathname.includes('/code/');
  
  // Generate the appropriate navigation link
  const navLink = isCodeEditorPage 
    ? `/room/${roomId}` 
    : `/code/${roomId}`;
  
  // Text for the navigation button
  const navText = isCodeEditorPage 
    ? 'Go to Whiteboard' 
    : 'Go to Code Editor';

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
          
          <Link to={navLink}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              {navText}
            </Button>
          </Link>
          
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
