
import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface InterviewNotesProps {
  roomId: string;
}

const InterviewNotes: React.FC<InterviewNotesProps> = ({ roomId }) => {
  const [notes, setNotes] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`interview-notes-${roomId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [roomId]);
  
  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(`interview-notes-${roomId}`, notes);
  }, [notes, roomId]);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const clearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      setNotes('');
      toast.info('Notes cleared');
    }
  };
  
  const downloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([notes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    
    // Format date for filename
    const date = new Date().toISOString().split('T')[0];
    element.download = `interview-notes-${roomId}-${date}.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Notes downloaded!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div 
        className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-lg">Interview Notes</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
          {isExpanded ? 'Minimize' : 'Expand'}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <Textarea 
            className="min-h-[200px] mb-4"
            placeholder="Add your interview notes here. Notes are private and automatically saved in your browser."
            value={notes}
            onChange={handleNotesChange}
          />
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={clearNotes}
            >
              <Trash className="w-4 h-4" />
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={downloadNotes}
              disabled={!notes.trim()}
            >
              <Download className="w-4 h-4" />
              Download Notes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewNotes;
