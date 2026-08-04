/**
 * @file Labs.jsx
 * @description Labs Hub — a fully searchable and filterable grid of all available and upcoming lab environments.
 */
import { useState, useMemo } from "react";
import { Search, Filter, Beaker } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ALL_LABS } from "@/lib/labsData";
import { LabCard } from "@/components/LabCard";

const CATEGORIES = [
  "All",
  "Software Development",
  "Data & Analytics",
  "Infrastructure",
  "Hardware",
  "Security",
  "Emerging Tech"
];

// ─────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────

export default function Labs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredLabs = useMemo(() => {
    return ALL_LABS.filter((lab: any) => {
      const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lab.tags.some((t: any) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === "All" || lab.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="relative pt-12 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6 border border-blue-500/20">
              <Beaker className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              TaskPro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Labs</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Immersive, browser-based environments to practice coding, networking, databases, and more. Stop watching and start building.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search labs, technologies, or topics..."
                value={searchTerm}
                onChange={(event: React.SyntheticEvent<any>) => setSearchTerm((event.target as HTMLInputElement).value)}
                className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide no-scrollbar">
          <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          {CATEGORIES.map((category: any) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === category 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 border border-blue-500"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {filteredLabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLabs.map((lab: any) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex-center mx-auto mb-4 border border-slate-700/50">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No labs found</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              We couldn't find any labs matching "{searchTerm}" in the {activeCategory} category.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 border-slate-700 hover:bg-slate-800"
              onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
            >
              Clear Filters
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
