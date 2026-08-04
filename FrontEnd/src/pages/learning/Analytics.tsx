/**
 * @fileoverview Analytics page for Payilagam .
 * Shows learning statistics (hours, courses completed, streak,
 * average score) in stat cards and an empty-state chart placeholder
 * that appears once the user has enough data.
 */
import { BarChart2, TrendingUp, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Analytics</h1>
          <p className="text-slate-400">
            View your learning statistics and performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Hours",
              value: "0",
              icon: Clock,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
            },
            {
              label: "Courses Completed",
              value: "0",
              icon: Target,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
            },
            {
              label: "Current Streak",
              value: "0 days",
              icon: TrendingUp,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
            },
            {
              label: "Average Score",
              value: "0%",
              icon: BarChart2,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
            },
          ].map((stat: any, i: any) => (
              <Card
              key={i}
              className="flex items-center gap-5 hover:bg-slate-800/50 transition-colors"
            >
              <div
                className={`w-14 h-14 rounded-xl ${stat.bg} ${stat.color} flex-center shrink-0`}
              >
                <stat.icon className="w-7 h-7 shrink-0 transition-transform duration-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-100 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-16 text-center">
          <div className="w-20 h-20 bg-slate-950 border border-slate-800 text-slate-500 rounded-2xl flex-center mx-auto mb-6">
            <BarChart2 className="w-10 h-10 shrink-0 transition-transform duration-200" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
            Not enough data
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg">
            Complete some lessons and assessments to see your learning trends and
            detailed analytics here.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

