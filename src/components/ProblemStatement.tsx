
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { peerService } from '@/services/peerService';
import { toast } from 'sonner';

interface ProblemStatementProps {
  roomId: string;
}

interface ProblemData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
}

const sampleProblems: ProblemData[] = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ]
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
    examples: [
      {
        input: 's = "()"',
        output: "true"
      },
      {
        input: 's = "()[]{}"',
        output: "true"
      },
      {
        input: 's = "(]"',
        output: "false"
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ]
  }
];

const ProblemStatement: React.FC<ProblemStatementProps> = ({ roomId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  
  const currentProblem = sampleProblems[currentProblemIndex];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const changeProblem = (index: number) => {
    if (index >= 0 && index < sampleProblems.length) {
      setCurrentProblemIndex(index);
      
      // Sync with peers
      peerService.sendTimerAction({
        type: 'timer-reset'
      });
      
      toast.info(`Changed problem to: ${sampleProblems[index].title}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-lg">Problem Statement</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {sampleProblems.map((problem, index) => (
              <Button 
                key={problem.title}
                variant={index === currentProblemIndex ? "default" : "outline"} 
                size="sm"
                onClick={() => changeProblem(index)}
              >
                Problem {index + 1}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleExpanded}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{currentProblem.title}</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentProblem.difficulty}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 whitespace-pre-line">{currentProblem.description}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Examples:</h3>
            {currentProblem.examples.map((example, i) => (
              <div key={i} className="mb-3 pl-4 border-l-2 border-gray-200">
                <div className="mb-1"><span className="font-medium">Input:</span> {example.input}</div>
                <div className="mb-1"><span className="font-medium">Output:</span> {example.output}</div>
                {example.explanation && (
                  <div className="mb-1"><span className="font-medium">Explanation:</span> {example.explanation}</div>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Constraints:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {currentProblem.constraints.map((constraint, i) => (
                <li key={i} className="text-gray-700">{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemStatement;
