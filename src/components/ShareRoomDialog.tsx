
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share } from 'lucide-react';
import { toast } from 'sonner';

interface ShareRoomDialogProps {
  roomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareRoomDialog: React.FC<ShareRoomDialogProps> = ({ roomId, open, onOpenChange }) => {
  const [copying, setCopying] = useState(false);
  
  const shareUrl = `${window.location.origin}/room/${roomId}`;
  
  const copyToClipboard = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Room link copied to clipboard!', {
        description: 'Share this link with others to invite them to your whiteboard.'
      });
    } catch (err) {
      toast.error('Failed to copy link', {
        description: 'Please try selecting and copying the link manually.'
      });
    } finally {
      setCopying(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Room
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Share this link with others to collaborate on the same whiteboard:
          </p>
          
          <div className="flex items-center space-x-2">
            <Input
              className="flex-1"
              value={shareUrl}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyToClipboard} disabled={copying}>
              {copying ? 'Copying...' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRoomDialog;
