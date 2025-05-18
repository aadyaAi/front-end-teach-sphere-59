
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

interface ToolbarProps {
  onSelectTool: (tool: Tool) => void;
  currentTool: Tool;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onColorChange: (color: string) => void;
  currentColor: string;
  onSave: (format: 'png' | 'jpeg') => void;
}

const colors = [
  '#2563eb', // Blue (Primary)
  '#000000', // Black
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ffffff', // White
];

const Toolbar: React.FC<ToolbarProps> = ({
  onSelectTool,
  currentTool,
  onClear,
  onUndo,
  onRedo,
  onColorChange,
  currentColor,
  onSave,
}) => {
  const handleSave = () => {
    onSave('png');
  };

  return (
    <div className="toolbar flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="tools flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'pen' ? 'default' : 'outline'}
              size="icon"
              className="w-10 h-10"
              onClick={() => onSelectTool('pen')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M15.2323 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Pen Tool</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pen Tool</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'outline'}
              size="icon"
              className="w-10 h-10"
              onClick={() => onSelectTool('eraser')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M17 14.5L9.5 7M19 16.5L14.5 21H5.5L10 16.5L19 7.5L16.5 5L7.5 14L3 18.5L8.5 24H16L21 19" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Eraser Tool</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eraser Tool</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'rectangle' ? 'default' : 'outline'}
              size="icon"
              className="w-10 h-10"
              onClick={() => onSelectTool('rectangle')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="sr-only">Rectangle Tool</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rectangle Tool</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'circle' ? 'default' : 'outline'}
              size="icon"
              className="w-10 h-10"
              onClick={() => onSelectTool('circle')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="sr-only">Circle Tool</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Circle Tool</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="separator h-10 border-r border-gray-200 mx-1"></div>

      <div className="colors flex gap-1">
        {colors.map((color) => (
          <Tooltip key={color}>
            <TooltipTrigger asChild>
              <button
                className={`w-8 h-8 rounded-full ${color === '#ffffff' ? 'border border-gray-300' : ''} ${color === currentColor ? 'ring-2 ring-offset-2 ring-teach-accent' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                aria-label={`Select ${color} color`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select {color === '#000000' ? 'Black' : color === '#ffffff' ? 'White' : color} color</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="separator h-10 border-r border-gray-200 mx-1"></div>

      <div className="actions flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10"
              onClick={onUndo}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 8H7C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14H17C18.6569 14 20 15.3431 20 17C20 18.6569 18.6569 20 17 20H12M12 8L15 5M12 8L15 11" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10"
              onClick={onRedo}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 8H17C18.6569 8 20 9.34315 20 11C20 12.6569 18.6569 14 17 14H7C5.34315 14 4 15.3431 4 17C4 18.6569 5.34315 20 7 20H12M12 8L9 5M12 8L9 11" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Redo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10"
              onClick={onClear}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Clear Canvas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear Canvas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10"
              onClick={handleSave}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H14L21 10V19C21 20.1046 20.1046 21 19 21Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M17 21V13H7V21M7 3V8H13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Save Whiteboard</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Whiteboard</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default Toolbar;
