
import React, { useRef, useEffect, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { SupportedLanguage, codeExecutionService, ExecutionResult } from '@/services/codeExecutionService';
import { CodeAction, peerService } from '@/services/peerService';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Play, Square } from 'lucide-react';
import { Badge } from './ui/badge';

interface CodeEditorProps {
  roomId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, world!");');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const isRemoteChangeRef = useRef<boolean>(false);
  
  // Sample starter code for different languages
  const starterCode: Record<SupportedLanguage, string> = {
    javascript: '// Write your JavaScript code here\nconsole.log("Hello, world!");\n\n// Define a function\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Call the function\nconst message = greet("Collaborator");\nconsole.log(message);',
    typescript: '// Write your TypeScript code here\ntype Greeting = {\n  message: string;\n};\n\nfunction greet(name: string): Greeting {\n  return {\n    message: `Hello, ${name}!`\n  };\n}\n\nconst result = greet("Collaborator");\nconsole.log(result.message);',
    python: '# Write your Python code here\nprint("Hello, world!")\n\n# Define a function\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Call the function\nmessage = greet("Collaborator")\nprint(message)',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Collaborative Editor</title>\n  <style>\n    body { font-family: Arial, sans-serif; margin: 2rem; }\n    h1 { color: #2563eb; }\n  </style>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n  <p>Edit this HTML code collaboratively.</p>\n</body>\n</html>',
    css: '/* Write your CSS here */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f0f4f8;\n}\n\nh1 {\n  color: #2563eb;\n  border-bottom: 2px solid #e2e8f0;\n  padding-bottom: 10px;\n}\n\n.container {\n  max-width: 800px;\n  margin: 0 auto;\n  background: white;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}',
  };

  // Initialize PeerJS connection for code collaboration
  useEffect(() => {
    if (!roomId) return;

    peerService.init(roomId, {
      onConnection: (peerId) => {
        console.log("Peer connected to code editor:", peerId);
        toast.success("New collaborator joined", {
          description: "Someone joined your coding session."
        });
        
        // Send current code state to the new peer
        if (editorRef.current) {
          const currentCode = editorRef.current.getValue();
          peerService.sendCodeAction({
            type: 'code-change',
            content: currentCode,
            language
          });
        }
      },
      onDisconnection: (peerId) => {
        console.log("Peer disconnected from code editor:", peerId);
        toast.info("Collaborator left", {
          description: "A collaborator has left your coding session."
        });
      },
      onDrawingAction: () => {
        // We don't need to handle drawing actions here
      },
      onCodeAction: (action, peerId) => {
        handleRemoteCodeAction(action, peerId);
      }
    });

    return () => {
      // peerService.disconnect(); // Don't disconnect as it's shared with whiteboard
    };
  }, [roomId]);

  // Handle code change from remote peers
  const handleRemoteCodeAction = (action: CodeAction, peerId: string) => {
    if (action.senderId === peerService.getUserId()) return; // Ignore our own actions
    
    isRemoteChangeRef.current = true;
    
    switch (action.type) {
      case 'code-change':
        if (action.content !== undefined && editorRef.current) {
          editorRef.current.setValue(action.content);
          setCode(action.content);
        }
        if (action.language && Object.keys(starterCode).includes(action.language)) {
          setLanguage(action.language as SupportedLanguage);
        }
        break;
        
      case 'code-selection':
        if (action.selection && editorRef.current && monacoRef.current) {
          const { startLineNumber, startColumn, endLineNumber, endColumn } = action.selection;
          const selection = new monacoRef.current.Selection(
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn
          );
          editorRef.current.setSelection(selection);
        }
        break;
        
      case 'code-cursor':
        if (action.position && editorRef.current) {
          const { lineNumber, column } = action.position;
          editorRef.current.setPosition({ lineNumber, column });
        }
        break;
        
      case 'code-language-change':
        if (action.language && Object.keys(starterCode).includes(action.language)) {
          setLanguage(action.language as SupportedLanguage);
          // If we have starter code for this language and no current code, use it
          if (!code || code === '') {
            const newStarterCode = starterCode[action.language as SupportedLanguage];
            setCode(newStarterCode);
            if (editorRef.current) {
              editorRef.current.setValue(newStarterCode);
            }
          }
        }
        break;
        
      case 'code-run':
        // We could potentially run the code when a peer runs it
        // but for now, just show a notification
        toast.info("Code execution triggered", { 
          description: "A collaborator executed the code." 
        });
        break;
    }
    
    isRemoteChangeRef.current = false;
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set initial code if empty
    if (!code || code === '') {
      setCode(starterCode[language]);
      editor.setValue(starterCode[language]);
    }
    
    // Configure editor
    monaco.editor.defineTheme('teachSphereTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#334155',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorCursor.foreground': '#2563eb',
        'editorLineNumber.foreground': '#94a3b8',
      }
    });
    
    monaco.editor.setTheme('teachSphereTheme');
    
    // Add change listener
    editor.onDidChangeModelContent((event: any) => {
      if (isRemoteChangeRef.current) return;
      
      const value = editor.getValue();
      setCode(value);
      
      // Send to peers
      peerService.sendCodeAction({
        type: 'code-change',
        content: value
      });
    });
    
    // Add cursor position listener
    editor.onDidChangeCursorPosition((event: any) => {
      if (isRemoteChangeRef.current) return;
      
      const position = event.position;
      
      // Send to peers
      peerService.sendCodeAction({
        type: 'code-cursor',
        position: {
          lineNumber: position.lineNumber,
          column: position.column
        }
      });
    });
    
    // Add selection listener
    editor.onDidChangeCursorSelection((event: any) => {
      if (isRemoteChangeRef.current) return;
      
      const selection = event.selection;
      
      // Send to peers
      peerService.sendCodeAction({
        type: 'code-selection',
        selection: {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn
        }
      });
    });
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    
    // If editor is empty, populate with starter code
    if ((!code || code === '' || code === starterCode[language]) && editorRef.current) {
      setCode(starterCode[newLanguage]);
      editorRef.current.setValue(starterCode[newLanguage]);
    }
    
    // Send language change to peers
    peerService.sendCodeAction({
      type: 'code-language-change',
      language: newLanguage
    });
  };

  // Execute the current code
  const handleExecuteCode = async () => {
    if (!code || isExecuting) return;
    
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const result = await codeExecutionService.executeCode(code, language);
      setExecutionResult(result);
      
      if (result.error) {
        toast.error("Code execution error", {
          description: result.error.length > 50 ? `${result.error.substring(0, 50)}...` : result.error
        });
      } else if (result.success) {
        toast.success("Code executed successfully");
      }
      
      // Send execution event to peers
      peerService.sendCodeAction({ type: 'code-run' });
    } catch (error: any) {
      setExecutionResult({
        output: '',
        error: `Execution failed: ${error.message}`,
        success: false
      });
      
      toast.error("Execution failed", {
        description: error.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Render code output or preview
  const renderOutput = () => {
    if (!executionResult) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-center p-4">
          <div>
            <p>Run your code to see output here</p>
            <p className="text-xs mt-2">Output will appear after execution</p>
          </div>
        </div>
      );
    }
    
    if (language === 'html') {
      // For HTML, render in an iframe
      return (
        <iframe
          title="HTML Preview"
          srcDoc={executionResult.output}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      );
    }
    
    // For other languages, show text output
    return (
      <div className="w-full h-full overflow-auto p-4 font-mono text-sm bg-gray-800 text-gray-200 whitespace-pre-wrap">
        {executionResult.output || 'No output'}
        {executionResult.error && (
          <div className="text-red-400 mt-2 border-t border-gray-700 pt-2">
            {executionResult.error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Language selector and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex space-x-2">
          {(['javascript', 'typescript', 'python', 'html', 'css'] as SupportedLanguage[]).map((lang) => (
            <Badge
              key={lang}
              variant={language === lang ? 'default' : 'outline'}
              className={`cursor-pointer ${
                language === lang ? 'bg-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleLanguageChange(lang)}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </Badge>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleExecuteCode}
            disabled={isExecuting}
            className="flex items-center gap-1"
          >
            {isExecuting ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>
      
      {/* Editor and output split view */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Code editor */}
        <div className="w-full md:w-1/2 h-64 md:h-auto border-r">
          <Editor
            height="100%"
            language={language === 'typescript' ? 'typescript' : language}
            value={code}
            theme="teachSphereTheme"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
            onMount={handleEditorDidMount}
          />
        </div>
        
        {/* Output console */}
        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          {renderOutput()}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
