import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';
import { peerService, DrawingAction } from '@/services/peerService';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

interface Point {
  x: number;
  y: number;
}

interface WhiteboardProps {
  roomId: string;
  tool?: Tool;
  color?: string;
}

const Whiteboard = forwardRef(({ roomId, tool = 'pen', color = '#2563eb' }: WhiteboardProps, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>(tool);
  const [currentColor, setCurrentColor] = useState(color);
  const [lineWidth, setLineWidth] = useState(3);
  const [startPosition, setStartPosition] = useState<Point | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasHistoryRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const isRemoteActionRef = useRef<boolean>(false);

  // Update internal state when props change
  useEffect(() => {
    if (tool !== currentTool) {
      setCurrentTool(tool);
    }
  }, [tool]);

  useEffect(() => {
    if (color !== currentColor) {
      setCurrentColor(color);
    }
  }, [color]);

  // Initialize WebRTC peer connection
  useEffect(() => {
    if (!roomId) return;

    const userId = peerService.init(roomId, {
      onConnection: (peerId) => {
        console.log("Peer connected:", peerId);
        setConnectedUsers(prev => [...prev, peerId]);
        toast.success("New collaborator joined", {
          description: "Someone joined your whiteboard session."
        });
      },
      onDisconnection: (peerId) => {
        console.log("Peer disconnected:", peerId);
        setConnectedUsers(prev => prev.filter(id => id !== peerId));
        toast.info("Collaborator left", {
          description: "A collaborator has left your whiteboard session."
        });
      },
      onDrawingAction: (action, peerId) => {
        handleRemoteDrawingAction(action);
      }
    });

    return () => {
      peerService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    // Get context and set its properties
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = ctx;

    // Save initial state
    saveCanvasState();

    // Handle resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;
      ctx.scale(2, 2);
      ctx.putImageData(imageData, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = currentColor;
    contextRef.current.lineWidth = lineWidth;
  }, [currentColor, lineWidth]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    // Remove future states if we're in the middle of history
    if (historyIndexRef.current < canvasHistoryRef.current.length - 1) {
      canvasHistoryRef.current = canvasHistoryRef.current.slice(0, historyIndexRef.current + 1);
    }
    
    const imageData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    canvasHistoryRef.current.push(imageData);
    historyIndexRef.current = canvasHistoryRef.current.length - 1;
  };

  const handleRemoteDrawingAction = (action: DrawingAction) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    isRemoteActionRef.current = true;
    
    const ctx = contextRef.current;
    
    switch (action.type) {
      case 'start':
        if (action.startPosition) {
          ctx.beginPath();
          if (action.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }
          if (action.color) ctx.strokeStyle = action.color;
          if (action.lineWidth) ctx.lineWidth = action.lineWidth;
          ctx.moveTo(action.startPosition.x, action.startPosition.y);
        }
        break;
        
      case 'draw':
        if (action.currentPosition) {
          ctx.lineTo(action.currentPosition.x, action.currentPosition.y);
          ctx.stroke();
        }
        break;
        
      case 'end':
        if (action.tool === 'rectangle' && action.startPosition && action.currentPosition) {
          const width = action.currentPosition.x - action.startPosition.x;
          const height = action.currentPosition.y - action.startPosition.y;
          ctx.strokeRect(action.startPosition.x, action.startPosition.y, width, height);
        } else if (action.tool === 'circle' && action.startPosition && action.currentPosition) {
          const radius = Math.sqrt(
            Math.pow(action.currentPosition.x - action.startPosition.x, 2) + 
            Math.pow(action.currentPosition.y - action.startPosition.y, 2)
          );
          ctx.beginPath();
          ctx.arc(action.startPosition.x, action.startPosition.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.closePath();
        }
        
        ctx.closePath();
        ctx.globalCompositeOperation = 'source-over';
        saveCanvasState();
        break;
        
      case 'clear':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        saveCanvasState();
        break;
        
      case 'undo':
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          ctx.putImageData(canvasHistoryRef.current[historyIndexRef.current], 0, 0);
        }
        break;
        
      case 'redo':
        if (historyIndexRef.current < canvasHistoryRef.current.length - 1) {
          historyIndexRef.current++;
          ctx.putImageData(canvasHistoryRef.current[historyIndexRef.current], 0, 0);
        }
        break;
    }
    
    isRemoteActionRef.current = false;
  };

  const broadcastDrawingAction = (action: DrawingAction) => {
    if (isRemoteActionRef.current) return; // Don't broadcast actions that came from remote peers
    peerService.sendDrawingAction(action);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setStartPosition({ x, y });
    
    // All tools now begin with a path setup, but different tool types will finalize differently
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    
    if (currentTool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
    }
    
    // Broadcast drawing action to peers
    broadcastDrawingAction({
      type: 'start',
      tool: currentTool,
      color: currentColor,
      lineWidth: lineWidth,
      startPosition: { x, y }
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // For pen and eraser, draw continuously. For shapes, we'll handle drawing in finishDrawing
    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      
      // Broadcast drawing action to peers
      broadcastDrawingAction({
        type: 'draw',
        currentPosition: { x, y }
      });
    }
  };

  const finishDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    
    // Get the current position for shape drawing
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // For touch events, use the changedTouches for the end position
      if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = rect.left;
        clientY = rect.top;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const currentPosition = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.closePath();
      contextRef.current.globalCompositeOperation = 'source-over';
      
      // Broadcast drawing action to peers
      broadcastDrawingAction({
        type: 'end',
        tool: currentTool
      });
    } else if (startPosition && contextRef.current) {
      // Draw shape at the end
      if (currentTool === 'rectangle') {
        const width = currentPosition.x - startPosition.x;
        const height = currentPosition.y - startPosition.y;
        
        // Clear any path that might have been drawn during mouse movement
        contextRef.current.beginPath();
        contextRef.current.strokeRect(startPosition.x, startPosition.y, width, height);
        
        // Broadcast drawing action to peers
        broadcastDrawingAction({
          type: 'end',
          tool: 'rectangle',
          startPosition,
          currentPosition
        });
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(currentPosition.x - startPosition.x, 2) + 
          Math.pow(currentPosition.y - startPosition.y, 2)
        );
        
        // Clear any path that might have been drawn during mouse movement
        contextRef.current.beginPath();
        contextRef.current.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
        contextRef.current.stroke();
        
        // Broadcast drawing action to peers
        broadcastDrawingAction({
          type: 'end',
          tool: 'circle',
          startPosition,
          currentPosition
        });
      }
    }

    setIsDrawing(false);
    setStartPosition(null);
    saveCanvasState();
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasState();
    
    // Broadcast clear action to peers
    broadcastDrawingAction({ type: 'clear' });
    
    toast("Canvas cleared!");
  };

  const downloadCanvas = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataURL = canvasRef.current.toDataURL(mimeType);
    
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    
    toast(`Whiteboard saved as ${format.toUpperCase()}`);
  };

  const undo = () => {
    if (historyIndexRef.current > 0 && canvasRef.current && contextRef.current) {
      historyIndexRef.current--;
      contextRef.current.putImageData(
        canvasHistoryRef.current[historyIndexRef.current], 
        0, 
        0
      );
      
      // Broadcast undo action to peers
      broadcastDrawingAction({ type: 'undo' });
    } else {
      toast("Nothing to undo!");
    }
  };

  const redo = () => {
    if (
      historyIndexRef.current < canvasHistoryRef.current.length - 1 &&
      canvasRef.current &&
      contextRef.current
    ) {
      historyIndexRef.current++;
      contextRef.current.putImageData(
        canvasHistoryRef.current[historyIndexRef.current], 
        0, 
        0
      );
      
      // Broadcast redo action to peers
      broadcastDrawingAction({ type: 'redo' });
    } else {
      toast("Nothing to redo!");
    }
  };

  useImperativeHandle(ref, () => ({
    clearCanvas,
    downloadCanvas,
    undo,
    redo,
    setColor: (newColor: string) => setCurrentColor(newColor),
    setLineWidth: (width: number) => setLineWidth(width),
    setTool: (tool: Tool) => setCurrentTool(tool)
  }));

  return (
    <div className="whiteboard-container w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-300 rounded-lg bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={finishDrawing}
      />
    </div>
  );
});

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
