/**
 * @fileoverview Admin Dashboard page for Payilagam .
 * Provides a system overview with revenue, user, and completion
 * stats, real user acquisition charts, real course popularity bars,
 * and recent user/enrollment logs.
 */
import { useEffect, useState } from "react";
import { executeHttpGetRequest } from '@/api/commonServices';
import { API_PATHS } from '@/api/constants';
import {
  DollarSign,
  Users,
  CheckCircle,
  Activity,
  UserPlus,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    overview: {
      totalRevenue: 0,
      newUsers: 0,
      completionRate: 0,
      systemHealth: { serverLoad: 0, status: "Loading..." }
    },
    recentUsers: [],
    recentEnrollments: []
  });
  
  const [courseAnalytics, setCourseAnalytics] = useState<any[]>([]);
  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
        executeHttpGetRequest(API_PATHS.ADMIN.STATS),
        executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.COURSES),
        executeHttpGetRequest(API_PATHS.ADMIN.ANALYTICS.ENROLLMENTS)
      ]);
      
      if (statsResponse.data?.success && statsResponse.data?.data) {
        setStats(statsResponse.data.data);
      }
      if (coursesResponse.data?.success && coursesResponse.data?.data) {
        setCourseAnalytics(coursesResponse.data.data);
      }
      if (enrollmentsResponse.data?.success && enrollmentsResponse.data?.data) {
        setEnrollmentAnalytics(enrollmentsResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to load admin stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Helper for generating the SVG line chart
  const getLinePath = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return "M 0,100 L 100,100 Z";
    
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    if (dates.length === 0) return "M 0,100 L 100,100 Z";

    const counts = dates.map((dateKey: any) => enrollmentAnalytics.dailyBreakdown[dateKey]);
    const maxCount = Math.max(...counts, 1);
    const stepX = 100 / Math.max(counts.length - 1, 1);
    
    const points = counts.map((count: any, index: any) => {
      const x = index * stepX;
      const y = 90 - ((count / maxCount) * 80); // padding at top
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M 0,100 L 0,${points[0].split(',')[1]} L ${points.join(' L ')} L 100,100 Z`;
  };

  const getLineStroke = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return "M 0,100 L 100,100";
    
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    if (dates.length === 0) return "M 0,100 L 100,100";

    const counts = dates.map((dateKey: any) => enrollmentAnalytics.dailyBreakdown[dateKey]);
    const maxCount = Math.max(...counts, 1);
    const stepX = 100 / Math.max(counts.length - 1, 1);
    
    const points = counts.map((count: any, index: any) => {
      const x = index * stepX;
      const y = 90 - ((count / maxCount) * 80);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M 0,${points[0].split(',')[1]} L ${points.join(' L ')}`;
  };

  const getXAxisLabels = () => {
    if (!enrollmentAnalytics?.dailyBreakdown) return [];
    const dates = Object.keys(enrollmentAnalytics.dailyBreakdown).sort();
    if (dates.length === 0) return [];
    
    // Pick ~6 evenly spaced dates to show
    const step = Math.max(1, Math.floor(dates.length / 5));
    const selected = [];
    for (let i = 0; i < dates.length; i += step) {
      selected.push(dates[i]);
    }
    return selected.map((dateKey: any) => {
      const dateObj = new Date(dateKey);
      return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-screen text-slate-300 font-sans">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 mb-1 tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-400 text-sm">Real-time statistics & activity</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg relative group hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-3 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              ₹ {stats.overview?.totalRevenue?.toLocaleString() || 0}
            </h3>
          </div>
        </Card>

        <Card className="shadow-lg relative group hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center mb-3 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Total Users
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              {stats.overview?.newUsers?.toLocaleString() || 0}
            </h3>
          </div>
        </Card>

        <Card className="shadow-lg relative group hover:border-blue-400/50 hover:shadow-blue-400/10 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-400/20 text-blue-400 rounded-xl flex items-center justify-center mb-3 border border-blue-400/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Completion Rate
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              {stats.overview?.completionRate || 0}%
            </h3>
          </div>
        </Card>

        <Card className="shadow-lg relative group hover:border-sky-400/50 hover:shadow-sky-400/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm leading-tight">
                System Health
              </h3>
              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                {stats.overview?.systemHealth?.status || "Operational"}
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Server Load</span>
              <span className="font-bold text-sky-300">{stats.overview?.systemHealth?.serverLoad || 0}%</span>
            </div>
            <div className="w-full bg-slate-950/50 border border-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(56,189,248,0.6)]" style={{ width: `${stats.overview?.systemHealth?.serverLoad || 0}%` }}></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* User Acquisition Chart (Enrollments) */}
        <Card className="lg:col-span-3 !p-6 shadow-lg group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Enrollment Activity
              </h2>
              <p className="text-xs text-slate-400">
                {enrollmentAnalytics?.period || "Last 30 days"}
              </p>
            </div>
            <div className="flex bg-slate-950/50 rounded-lg p-1 border border-slate-800/60 shadow-inner">
              <span className="px-3 py-1 text-xs font-bold text-white bg-blue-600/80 backdrop-blur-sm rounded-md shadow-[0_0_10px_rgba(37,99,235,0.4)] border border-blue-500/50">
                Daily Enrollments
              </span>
            </div>
          </div>

          <div className="h-48 relative w-full flex items-end justify-between px-2">
            {isLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : (
              <>
                <svg
                  className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getLinePath()}
                    fill="url(#chartGradient)"
                  />
                  <path
                    d={getLineStroke()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]"
                  />
                </svg>

                {/* X-Axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 transform translate-y-6">
                  {getXAxisLabels().map((label: string, index: any) => (
                    <span
                      key={index}
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Course Popularity */}
        <Card className="lg:col-span-2 !p-6 shadow-lg flex flex-col group hover:border-sky-500/30 transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              Top Courses
            </h2>
            <p className="text-xs text-slate-400">By total enrollments</p>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-10">
                 <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : courseAnalytics.length > 0 ? (
              courseAnalytics.slice(0, 5).map((course: any, index: any) => {
                const maxEnrollments = Math.max(...courseAnalytics.map((courseItem: any) => courseItem._count.enrollments), 1);
                const widthPercent = (course._count.enrollments / maxEnrollments) * 100;
                
                return (
                  <div key={course.courseId} className="group/item">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-300 truncate mr-2 group-hover/item:text-sky-200 transition-colors">
                        {course.courseName}
                      </span>
                      <span className="font-bold text-sky-400 shrink-0">
                        {course._count.enrollments}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950/50 border border-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_5px_rgba(56,189,248,0.5)] group-hover/item:shadow-[0_0_10px_rgba(56,189,248,0.8)]" 
                        style={{ width: `${Math.max(widthPercent, 5)}%`, opacity: 1 - (index * 0.15) }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center mt-10">No course data available.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Two-column layout for Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Enrollments */}
        <Card className="!p-0 shadow-lg overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all duration-300">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/80 flex-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Recent Enrollments
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {stats.recentEnrollments?.length > 0 ? (
              <ul className="divide-y divide-slate-800/50">
                {stats.recentEnrollments.map((enrollment: any) => (
                  <li key={enrollment.enrollmentId} className="p-3 hover:bg-slate-800/50 rounded-xl transition-all duration-200 flex justify-between items-center group/row hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover/row:text-blue-300 transition-colors">{enrollment.student?.fullName || enrollment.student?.userName}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{enrollment.course?.courseName}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_5px_rgba(59,130,246,0.2)]">
                        {enrollment.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center p-8">No recent enrollments.</p>
            )}
          </div>
        </Card>

        {/* Recent Users */}
        <Card className="!p-0 shadow-lg overflow-hidden flex flex-col group hover:border-sky-500/30 transition-all duration-300">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/80 flex-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 group-hover:text-sky-300 transition-colors">
              <UserPlus className="w-4 h-4 text-sky-400" />
              New Users
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {stats.recentUsers?.length > 0 ? (
              <ul className="divide-y divide-slate-800/50">
                {stats.recentUsers.map((userItem: any) => (
                  <li key={userItem.userId} className="p-3 hover:bg-slate-800/50 rounded-xl transition-all duration-200 flex justify-between items-center group/row hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover/row:text-sky-300 transition-colors">{userItem.fullName}</p>
                      <p className="text-xs text-slate-500">{userItem.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border shadow-[0_0_5px_rgba(56,189,248,0.2)] ${
                        userItem.role?.roleName === 'mentor' 
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          : userItem.role?.roleName === 'admin'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {userItem.role?.roleName || 'User'}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Joined {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center p-8">No recent users.</p>
            )}
          </div>
        </Card>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;


