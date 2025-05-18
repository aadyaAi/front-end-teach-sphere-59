
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Search, Plus, UserPlus } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'scheduled' | 'in-process' | 'evaluated' | 'hired' | 'rejected';
  nextInterview?: string; // Date string
}

const CandidateList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'cand-1',
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      position: 'Senior Frontend Developer',
      status: 'scheduled',
      nextInterview: '2025-05-20T15:30:00'
    },
    {
      id: 'cand-2',
      name: 'Sam Chen',
      email: 'sam.chen@example.com',
      position: 'Backend Engineer',
      status: 'in-process',
      nextInterview: '2025-05-21T10:00:00'
    },
    {
      id: 'cand-3',
      name: 'Jordan Lee',
      email: 'jordan.l@example.com',
      position: 'Full Stack Developer',
      status: 'evaluated'
    },
    {
      id: 'cand-4',
      name: 'Taylor Morgan',
      email: 't.morgan@example.com',
      position: 'Product Manager',
      status: 'hired'
    },
    {
      id: 'cand-5',
      name: 'Casey Smith',
      email: 'c.smith@example.com',
      position: 'DevOps Engineer',
      status: 'rejected'
    }
  ]);
  
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'in-process':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Process</span>;
      case 'evaluated':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Evaluated</span>;
      case 'hired':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hired</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header roomId="" />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Candidates</h1>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Candidate
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search candidates..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Interview</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => {
                    const nextInterviewDate = candidate.nextInterview 
                      ? new Date(candidate.nextInterview) 
                      : null;
                    
                    return (
                      <tr key={candidate.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(candidate.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {nextInterviewDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {nextInterviewDate.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/candidates/${candidate.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            View
                          </Link>
                          {(candidate.status === 'scheduled' || candidate.status === 'in-process') && candidate.nextInterview && (
                            <Link to={`/interview/${candidate.id}`} className="text-green-600 hover:text-green-900">
                              Start Interview
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No candidates found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateList;
