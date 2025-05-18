
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, ListChecks } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { generateRoomId } from '@/utils/roomUtils';
import { toast } from 'sonner';

interface Interview {
  id: string;
  title: string;
  candidateName: string;
  position: string;
  scheduledFor: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 'int-123',
      title: 'Frontend Developer Interview',
      candidateName: 'Alex Johnson',
      position: 'Senior Frontend Developer',
      scheduledFor: '2025-05-20T15:30:00',
      status: 'upcoming'
    },
    {
      id: 'int-456',
      title: 'Backend Engineer Interview',
      candidateName: 'Sam Chen',
      position: 'Backend Engineer',
      scheduledFor: '2025-05-21T10:00:00',
      status: 'upcoming'
    },
    {
      id: 'int-789',
      title: 'Full Stack Developer Interview',
      candidateName: 'Jordan Lee',
      position: 'Full Stack Developer',
      scheduledFor: '2025-05-19T14:00:00',
      status: 'completed'
    }
  ]);

  const createNewInterview = () => {
    const newRoomId = generateRoomId();
    toast.success('New interview room created!');
    return newRoomId;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header roomId="" />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Interview Dashboard</h1>
          <Link to={`/room/${createNewInterview()}`}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Interview
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-medium">Upcoming</h2>
            </div>
            <div className="text-3xl font-bold">
              {interviews.filter(i => i.status === 'upcoming').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <ListChecks className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-medium">Completed</h2>
            </div>
            <div className="text-3xl font-bold">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-medium">Candidates</h2>
            </div>
            <div className="text-3xl font-bold">{interviews.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Interview Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.map((interview) => {
                  const date = new Date(interview.scheduledFor);
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  const formattedTime = date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  });
                  
                  return (
                    <tr key={interview.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{interview.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{interview.candidateName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{interview.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{formattedDate}</div>
                        <div className="text-gray-500 text-sm">{formattedTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${interview.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/room/${interview.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Join
                        </Link>
                        <Link to={`/candidates/${interview.id}`} className="text-blue-600 hover:text-blue-900">
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
