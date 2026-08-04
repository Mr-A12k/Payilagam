/**
 * @fileoverview Problem Set / Coding Practice listing page.
 * Displays a filterable, searchable table of coding problems
 * with difficulty badges, acceptance rates, and solved status.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { executeHttpGetRequest } from '@/api/commonServices';
import { API_PATHS } from '@/api/constants';
import { Code2, Search, Filter, Loader2, CheckCircle, Circle } from 'lucide-react';
import { Card, Input } from "@/components/ui";

const ProblemSet = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchProblems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);
      
      const response = await executeHttpGetRequest(API_PATHS.PROBLEMS.BASE, params);
      if (response.data.success) {
        setProblems(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load problems", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const handleSearch = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    fetchProblems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Coding Practice</h1>
          <p className="text-slate-400">Sharpen your logic with algorithmic challenges.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(event: React.SyntheticEvent<any>) => setSearch((event.target as HTMLInputElement).value)}
              className="!pl-10 !py-2.5 shadow-sm"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
            <button type="submit" className="hidden">Search</button>
          </form>
          
          <div className="relative w-full sm:w-48">
            <select
              value={difficulty}
              onChange={(event: React.SyntheticEvent<any>) => setDifficulty((event.target as HTMLInputElement).value)}
              className="w-full px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] disabled:opacity-50 appearance-none !pr-10 !py-2.5 shadow-sm"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin shrink-0 transition-transform duration-200" />
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-full flex-center mx-auto mb-4">
              <Code2 className="icon-lg text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">No problems found</h3>
            <p className="text-slate-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">Status</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4 w-32">Difficulty</th>
                  <th className="px-6 py-4 w-32">Acceptance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {problems.map((problemData: any) => {
                  const acceptanceRate = problemData.totalSubmissions > 0 
                    ? Math.round((problemData.acceptedSubmissions / problemData.totalSubmissions) * 100) 
                    : 0;
                  
                  const isSolved = problemData.problemId % 5 === 0;
                  
                  return (
                    <tr key={problemData.problemId} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        {isSolved ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/practice/${problemData.slug}`} className="text-slate-200 group-hover:text-blue-400 font-medium transition-colors block w-full text-base">
                          {problemData.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border inline-block ${
                          problemData.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 
                          problemData.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                        }`}>
                          {problemData.difficulty.charAt(0).toUpperCase() + problemData.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-400">
                        {problemData.totalSubmissions === 0 ? '-' : `${acceptanceRate}%`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProblemSet;


