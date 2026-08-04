/**
 * @fileoverview Assignments page for Payilagam .
 * Tabbed view (Pending / Completed) with an empty-state placeholder.
 * Assignments from enrolled courses will appear here once instructors
 * create them.
 */
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui";

const Assignments = () => {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Assignments
            </h1>
            <p className="text-slate-400">
              View and manage your pending and completed assignments.
            </p>
          </div>
          
          <div className="flex p-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "pending" 
                  ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700" 
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "completed" 
                  ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700" 
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <Card className="p-16 text-center">
          <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <ClipboardList className="w-10 h-10 shrink-0 transition-transform duration-200" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
            No {activeTab} assignments
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg">
            You're all caught up! When instructors assign work for your enrolled
            courses, they will appear here.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Assignments;

