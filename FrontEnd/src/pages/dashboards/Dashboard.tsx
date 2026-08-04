/**
 * @fileoverview Student Dashboard page for Payilagam.
 * Midnight Blue Dark Theme with Progressive Disclosure and Activity Heatmap.
 */
import { useSelector } from "react-redux";
import { useMyEnrollments, useUserActivity } from "@/hooks";
import { format, subDays } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

import {
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  PlayCircle,
  Calendar,
  Award,
  MoreHorizontal
} from "lucide-react";
import { Avatar, Card, Button } from "@/components/ui";

const Dashboard = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { data: myCoursesData } = useMyEnrollments();
  const myCourses = myCoursesData?.data || [];
  const navigate = useNavigate();

  const handleResumeLesson = () => {
    if (myCourses.length > 0) {
      navigate(`/courses/${myCourses[0].courseId}`);
    } else {
      navigate("/courses");
    }
  };

  const currentCourse = myCourses.length > 0 ? myCourses[0] : null;

  const { data: activityDataObj } = useUserActivity(90);
  const activityData = activityDataObj?.data || {};

  // Generate heatmap grid for the last 12 weeks (84 days)
  const totalDays = 84;
  const heatmapGrid = [];
  
  // Calculate starting date to align perfectly with today
  const today = new Date();
  
  // We want to generate columns. GitHub goes top-to-bottom (Sun-Sat), then left-to-right.
  // We'll generate an array of columns, each containing 7 days.
  for (let col = 0; col < 12; col++) {
    const column = [];
    for (let row = 0; row < 7; row++) {
      const daysAgo = totalDays - 1 - (col * 7 + row);
      const date = subDays(today, daysAgo);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = activityData[dateStr] || 0;
      
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count >= 3) level = 3;

      column.push({ date, dateStr, count, level });
    }
    heatmapGrid.push(column);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0] || user?.userName || "Student"} 
            <span className="text-3xl animate-pulse">👋</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Ready to conquer your next learning milestone?
          </p>
        </div>
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-full py-1.5 px-2 pr-4 shadow-lg shadow-blue-900/20 backdrop-blur-md">
          <Avatar
            src={user?.profileUrl}
            fallback={user?.fullName?.[0] || "A"}
            size="sm"
          />
          <div className="ml-3 mr-5">
            <div className="text-sm font-bold text-slate-100 leading-tight">
              {user?.fullName || "Alex Johnson"}
            </div>
            <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
              Premium Learner
            </div>
          </div>
          <div className="relative cursor-pointer p-1 rounded-full hover:bg-slate-800 transition-colors">
            <Flame className="icon-md text-blue-400" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-sky-400 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
          </div>
        </div>
      </div>

      {/* Primary Continue Learning Card */}
      <Card className="!rounded-3xl !p-8 shadow-xl shadow-blue-900/20 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-semibold mb-4 border border-blue-800/50">
              <PlayCircle className="w-3.5 h-3.5" /> Continue Learning
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              {currentCourse?.course?.courseName || "Start Your Journey"}
            </h2>
            <p className="text-slate-400 mb-6 max-w-xl text-sm md:text-base">
              {currentCourse 
                ? "You're on a roll! Pick up exactly where you left off and keep the momentum going." 
                : "Explore our catalog of premium courses and start mastering new skills today."}
            </p>
            
            {currentCourse && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 max-w-md bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    style={{ width: `${currentCourse.progressPercentage || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-sky-300">
                  {currentCourse.progressPercentage || 0}%
                </span>
              </div>
            )}
            
            <Button
              onClick={handleResumeLesson}
              className="px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 group/button"
            >
              {currentCourse ? "Resume Lesson" : "Browse Courses"}
              <ArrowRight className="icon-base group-hover/button:translate-x-1 transition-transform" />
            </Button>
          </div>

          {currentCourse && (
            <div className="hidden md:flex w-48 h-48 rounded-2xl bg-slate-950 border border-slate-800 items-center justify-center shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
               <Award className="w-20 h-20 text-blue-400/50" strokeWidth={1} />
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Heatmap & Stats */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="!rounded-3xl !p-8 shadow-lg shadow-blue-900/10">
            <div className="flex-between mb-6">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="icon-md text-blue-400" /> Learning Activity
              </h3>
              <select className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
            
            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1.5 min-w-[600px]">
                {heatmapGrid.map((column: any, colIndex: any) => (
                  <div key={colIndex} className="flex flex-col gap-1.5">
                    {column.map((cell: any, rowIndex: any) => (
                      <div
                        key={rowIndex}
                        className={`w-4 h-4 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-slate-400 ${
                          cell.level === 0 ? "bg-slate-800/50" :
                          cell.level === 1 ? "bg-blue-900/60" :
                          cell.level === 2 ? "bg-blue-600/80" :
                          "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        }`}
                        title={`${cell.count} lessons on ${format(cell.date, "MMM d, yyyy")}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-800/50"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-900/60"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-600/80"></div>
                <div className="w-3 h-3 rounded-sm bg-sky-400"></div>
                <span>More</span>
              </div>
            </div>
          </Card>

          {/* Other In Progress Courses */}
          {myCourses.length > 1 && (
            <div>
              <div className="flex-between mb-6 px-2">
                <h3 className="text-xl font-bold text-slate-100">Other Courses</h3>
                <Link to="/courses" className="text-blue-400 text-sm font-semibold hover:text-sky-300 transition-colors">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCourses.slice(1, 3).map((course: any, index: any) => (
                  <Card
                    key={course.courseId || index}
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                    className="!p-0 overflow-hidden shadow-sm hover:shadow-blue-900/20 hover:border-slate-700 transition-all group cursor-pointer"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-bold text-sky-400 uppercase tracking-wide border border-slate-800">
                          {course.course?.level || "Active"}
                        </div>
                        <MoreHorizontal className="icon-md text-slate-500 group-hover:text-slate-300 transition-colors" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-100 leading-tight mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {course.course?.courseName || "Course"}
                      </h4>
                      <div className="flex justify-between text-xs font-medium text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {course.course?.duration || 0}h
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" /> {course.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 border border-slate-800">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${course.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Quick Stats */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card className="!rounded-3xl !p-6 shadow-lg shadow-blue-900/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Your Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex-center border border-blue-800/50">
                  <Flame className="icon-lg text-sky-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">14 <span className="text-sm font-normal text-slate-400">Day Streak</span></div>
                  <div className="text-xs text-sky-300">Top 5% of learners</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex-center border border-slate-700">
                  <Award className="icon-lg text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">3 <span className="text-sm font-normal text-slate-400">Certificates</span></div>
                  <div className="text-xs text-slate-400">Keep earning!</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Section */}
          <Card className="!rounded-3xl !p-6 shadow-lg shadow-blue-900/10">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center justify-between">
              Upcoming
              <button className="text-xs text-blue-400 hover:underline">Manage</button>
            </h3>
            
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-start gap-4">
               <div className="flex-center flex-col min-w-[48px] h-[48px] bg-blue-900/20 text-blue-400 rounded-lg shrink-0 border border-blue-800/50">
                  <span className="text-[10px] font-bold uppercase">Jul</span>
                  <span className="text-lg font-bold leading-none">12</span>
               </div>
               <div>
                  <h4 className="font-medium text-slate-100 text-sm">System Design Assessment</h4>
                  <p className="text-xs text-slate-400 mt-1">Cloud Systems Architecture</p>
               </div>
            </div>
            
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-start gap-4 mt-3 opacity-60">
               <div className="flex-center flex-col min-w-[48px] h-[48px] bg-slate-800/50 text-slate-400 rounded-lg shrink-0 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase">Jul</span>
                  <span className="text-lg font-bold leading-none">18</span>
               </div>
               <div>
                  <h4 className="font-medium text-slate-100 text-sm">Peer Review Due</h4>
                  <p className="text-xs text-slate-400 mt-1">UX Research Module</p>
               </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;


