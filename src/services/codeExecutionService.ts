
import { toast } from 'sonner';

// Languages supported by our code editor
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'html' | 'css';

// Result of code execution
export interface ExecutionResult {
  output: string;
  error: string | null;
  success: boolean;
}

// Code execution service for client-side execution
class CodeExecutionService {
  private pyodideInstance: any = null;
  private isLoadingPyodide = false;

  // Execute code based on language
  async executeCode(code: string, language: SupportedLanguage): Promise<ExecutionResult> {
    switch (language) {
      case 'javascript':
        return this.executeJavaScript(code);
      case 'typescript':
        return this.executeTypeScript(code);
      case 'python':
        return this.executePython(code);
      case 'html':
        return this.executeHtml(code);
      case 'css':
        // CSS execution is handled separately via style injection
        return { output: 'CSS applied to preview', error: null, success: true };
      default:
        return { 
          output: '', 
          error: `Language ${language} is not supported for execution`, 
          success: false 
        };
    }
  }

  // Execute JavaScript code in a sandboxed environment
  private executeJavaScript(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      let output = '';
      let error = null;
      
      // Override console methods to capture output
      console.log = (...args) => {
        output += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
        originalConsoleLog(...args);
      };
      
      console.error = (...args) => {
        const errorMsg = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        output += `Error: ${errorMsg}\n`;
        originalConsoleError(...args);
      };
      
      try {
        // Create a new Function to execute the code in a sandbox
        const executeFunction = new Function(code);
        executeFunction();
        
        // Restore console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        
        resolve({
          output,
          error: null,
          success: true
        });
      } catch (e: any) {
        // Restore console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        
        resolve({
          output,
          error: e.message,
          success: false
        });
      }
    });
  }
  
  // Execute TypeScript by first stripping types (simple approach)
  private async executeTypeScript(code: string): Promise<ExecutionResult> {
    // Very simple TS -> JS conversion (just strips type annotations)
    // A production app would use the TypeScript compiler
    const jsCode = code
      .replace(/:\s*[a-zA-Z<>[\]|,\s]+/g, '') // Remove type annotations
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // Remove interfaces
      .replace(/type\s+\w+\s*=\s*[^;]*/g, ''); // Remove type aliases
      
    return this.executeJavaScript(jsCode);
  }
  
  // Execute Python code using Pyodide
  private async executePython(code: string): Promise<ExecutionResult> {
    try {
      if (!this.pyodideInstance && !this.isLoadingPyodide) {
        this.isLoadingPyodide = true;
        toast.info('Loading Python environment...', {
          description: 'This may take a few seconds on first run.'
        });
        
        // Dynamically load Pyodide
        const { loadPyodide } = await import('pyodide');
        this.pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        
        this.isLoadingPyodide = false;
        toast.success('Python environment ready!');
      } else if (this.isLoadingPyodide) {
        return {
          output: 'Python environment is still loading, please wait...',
          error: null,
          success: true
        };
      }
      
      // Execute the Python code
      let output = '';
      try {
        // Redirect stdout to capture output
        this.pyodideInstance.setStdout({
          batched: (text: string) => {
            output += text + '\n';
          }
        });
        
        await this.pyodideInstance.runPythonAsync(code);
        return {
          output,
          error: null,
          success: true
        };
      } catch (e: any) {
        return {
          output,
          error: e.message,
          success: false
        };
      }
    } catch (e: any) {
      return {
        output: '',
        error: `Failed to load Python environment: ${e.message}`,
        success: false
      };
    }
  }
  
  // Execute HTML by returning it for preview
  private executeHtml(code: string): Promise<ExecutionResult> {
    return Promise.resolve({
      output: code, // The output is the HTML itself, which will be rendered in an iframe
      error: null,
      success: true
    });
  }
}

// Export singleton instance
export const codeExecutionService = new CodeExecutionService();
