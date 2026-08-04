import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { executeHttpGetRequest, executeHttpPostRequest } from '@/api/commonServices';
import { API_PATHS } from '@/api/constants';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, UserMinus, MessageSquare, BookOpen, Star, Loader2, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  
  const [mentor, setMentor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchMentorDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTOR(id!));
      if (response.data.success) {
        setMentor(response.data.data);
        setIsFollowing(response.data.data.isFollowing);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load mentor profile');
      navigate('/mentors');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchMentorDetails();
  }, [fetchMentorDetails, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/mentors/${id}` } } });
      return;
    }
    
    try {
      setFollowLoading(true);
      const response = await executeHttpPostRequest('/follows/toggle', { targetId: id });
      if (response.data.success) {
        setIsFollowing(response.data.data.following);
        // Optimistically update count
        setMentor((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: response.data.data.following ? prev._count.followers + 1 : prev._count.followers - 1
          }
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/mentors/${id}` } } });
      return;
    }

    try {
      setChatLoading(true);
      // POST to /chat creates or fetches a 1-on-1 conversation
      const response = await executeHttpPostRequest(API_PATHS.CHAT.BASE!, { targetUserId: parseInt(id!) });
      if (response.data.success) {
        navigate(`/chat?conversationId=${response.data.data.conversationId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to start conversation');
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center min-h-[calc(100vh-4rem)] bg-slate-950">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!mentor) return null;

  let parsedSkills = [];
  try {
      if (mentor.skills) parsedSkills = JSON.parse(mentor.skills);
  } catch (error) {
    console.error(error);
      parsedSkills = [];
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="relative bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-center text-4xl font-bold text-blue-400 shrink-0 overflow-hidden shadow-xl shadow-blue-500/10">
              {mentor.profileUrl ? (
                <img src={mentor.profileUrl} alt={mentor.fullName} className="w-full h-full object-cover" />
              ) : (
                mentor.fullName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{mentor.fullName}</h1>
              <p className="text-lg text-blue-400 font-medium mb-4">
                @{mentor.userName} • Mentor
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-white font-bold">{mentor._count.followers}</span> Followers
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span className="text-white font-bold">{mentor._count.coursesTaught}</span> Courses
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-white font-bold">{mentor._count.enrollments}</span> Students
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <Button 
                onClick={handleToggleFollow} 
                disabled={followLoading || (user && user.userId === mentor.userId)}
                className={`w-full md:w-48 py-3 rounded-xl font-bold flex-center gap-2 transition-all shadow-lg ${
                  isFollowing 
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-0.5 shadow-blue-500/25'
                }`}
              >
                {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 isFollowing ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
              </Button>

              <Button 
                onClick={handleMessage}
                disabled={chatLoading || (user && user.userId === mentor.userId)}
                className="w-full md:w-48 py-3 rounded-xl font-bold flex-center gap-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-all shadow-lg"
              >
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4 text-slate-400" /> Message</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Skills */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
              {mentor.bio || "This mentor hasn't written a bio yet."}
            </p>
          </Card>

          {mentor.experience && (
            <Card className="bg-slate-900 border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Professional Experience</h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {mentor.experience}
              </p>
            </Card>
          )}

          <Card className="bg-slate-900 border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">Expertise</h3>
            {parsedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parsedSkills.map((skill: any, index: any) => (
                  <span key={index} className="bg-slate-950 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/20 shadow-inner shadow-blue-500/5">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No skills listed.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white mb-6">Courses by {mentor.fullName}</h2>
          
          {mentor.coursesTaught.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800 text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No published courses yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentor.coursesTaught.map((course: any) => (
                <div 
                  key={course.courseId} 
                  onClick={() => navigate(`/courses/${course.uniqueId}`)}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer group hover:border-blue-500/50 transition-colors shadow-lg"
                >
                  <div className="h-40 bg-slate-800 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.courseName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-700">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-white/10">
                      {course.level}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-800/50 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {course._count.enrollments} Students
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                        4.8
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetail;
