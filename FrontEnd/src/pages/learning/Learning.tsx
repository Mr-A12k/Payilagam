/**
 * @fileoverview My Learning Dashboard for Payilagam.
 * Displays enrolled courses or an empty-state card.
 */
import { BookMarked, PlayCircle, Clock } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Learning = () => {
  const { user } = useSelector((state: any) => state.auth);
  const enrollments = user?.enrollments || [];
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">My Learning</h1>
        <p className="text-slate-400">
          Track your progress and continue where you left off.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="p-12 text-center shadow-lg shadow-blue-900/10">
          <div className="w-16 h-16 bg-blue-900/30 border border-blue-800/50 text-blue-400 rounded-full flex-center mx-auto mb-4">
            <BookMarked className="icon-lg w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            No active courses
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Explore our catalog to start
            learning.
          </p>
          <Button asChild className="px-6 py-2 rounded-xl">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment: any) => (
            <Card
              key={enrollment.courseId}
              onClick={() => navigate(`/courses/${enrollment.courseId}`)}
              className="!p-0 overflow-hidden shadow-md hover:shadow-blue-900/20 hover:border-slate-700 transition-all group cursor-pointer flex flex-col h-full"
            >
              {enrollment.course?.thumbnail && (
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={enrollment.course.thumbnail} 
                    alt={enrollment.course.courseName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-bold text-sky-400 uppercase tracking-wide border border-slate-800 self-start mb-3">
                  {enrollment.course?.courseCode || "COURSE"}
                </div>
                <h3 className="text-lg font-bold text-slate-100 leading-tight mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                  {enrollment.course?.courseName || "Untitled Course"}
                </h3>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> In Progress
                    </span>
                    <span className="text-slate-300">
                      {enrollment.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-sky-400 h-2 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800/50">
                  <Button variant="ghost" className="w-full justify-center gap-2 hover:bg-blue-900/20 hover:text-blue-400 text-slate-300">
                    <PlayCircle className="w-4 h-4" /> Continue Learning
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Learning;
