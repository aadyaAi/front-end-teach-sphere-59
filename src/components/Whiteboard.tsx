
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

interface Point {
  x: number;
  y: number;
}

const Whiteboard = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(3);
  const [startPosition, setStartPosition] = useState<Point | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasHistoryRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

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
    ctx.strokeStyle = color;
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
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = lineWidth;
  }, [color, lineWidth]);

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
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      
      if (currentTool === 'eraser') {
        contextRef.current.globalCompositeOperation = 'destination-out';
      } else {
        contextRef.current.globalCompositeOperation = 'source-over';
      }
    }
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

    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    }
  };

  const finishDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.closePath();
      contextRef.current.globalCompositeOperation = 'source-over';
    } else if (startPosition && contextRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { x: startX, y: startY } = startPosition;
      
      if (currentTool === 'rectangle') {
        const width = startPosition.x - startX;
        const height = startPosition.y - startY;
        contextRef.current.strokeRect(startX, startY, width, height);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(startPosition.x - startX, 2) + Math.pow(startPosition.y - startY, 2)
        );
        contextRef.current.beginPath();
        contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI);
        contextRef.current.stroke();
        contextRef.current.closePath();
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
    } else {
      toast("Nothing to redo!");
    }
  };

  useImperativeHandle(ref, () => ({
    clearCanvas,
    downloadCanvas,
    undo,
    redo,
    setColor: (newColor: string) => setColor(newColor),
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
