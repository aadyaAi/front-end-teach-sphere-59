
import React from 'react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
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
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Share Room
          </Button>
          <Button variant="default" size="sm">
            New Whiteboard
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
