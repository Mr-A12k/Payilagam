import { useState, useEffect, useCallback } from "react";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpPutRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { UserPlus, Users, Clock, Check, X, Search, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui";
import toast from "react-hot-toast";

const Network = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTargetId, setSearchTargetId] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "pending") {
        const response = await executeHttpGetRequest(API_PATHS.NETWORK.PENDING_REQUESTS);
        if (response.data.success) setPendingRequests(response.data.data);
      } else if (activeTab === "followers") {
        const response = await executeHttpGetRequest(API_PATHS.NETWORK.FOLLOWERS);
        if (response.data.success) setFollowers(response.data.data);
      } else if (activeTab === "following") {
        const response = await executeHttpGetRequest(API_PATHS.NETWORK.FOLLOWING);
        if (response.data.success) setFollowing(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch network data", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendRequest = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (!searchTargetId) return;
    try {
      const response = await executeHttpPostRequest(API_PATHS.NETWORK.REQUEST, {
        targetId: searchTargetId,
      });
      if (response.data.success) {
        toast.success("Follow request sent!");
        setSearchTargetId("");
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to send request");
    }
  };

  const handleRespond = async (requestId: string, status: any) => {
    try {
      const response = await executeHttpPutRequest(API_PATHS.NETWORK.REQUEST_ID(requestId!), {
        status,
      });
      if (response.data.success) {
        toast.success(`Request ${status}`);
        setPendingRequests((prev: any) => prev.filter((r: any) => r.id !== requestId));
      }
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: "pending", label: "Pending", icon: Clock, count: pendingRequests.length },
      { id: "followers", label: "Followers", icon: Users, count: followers.length },
      { id: "following", label: "Following", icon: UserPlus, count: following.length },
    ];

    return (
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap
                ${isActive 
                  ? "bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]" 
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/50"}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
              {tab.label}
              {!isLoading && activeTab === tab.id && (
                <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderBentoCard = (userObj: any, isPending: any, reqId: string) => {
    return (
      <div key={userObj.id || reqId} className="bg-slate-900 border border-slate-800 rounded-[32px] p-4 flex flex-col gap-4 group hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50">
        <div className="flex gap-4">
          <div className="shrink-0">
             <Avatar
               src={userObj.profileUrl}
               fallback={userObj.fullName?.[0]}
               size="xl"
               className="w-24 h-24 rounded-[24px] border border-slate-700/50 object-cover"
             />
          </div>
          <div className="flex-1 bg-slate-950/50 rounded-[24px] p-5 flex flex-col justify-center border border-slate-800/50">
            <h4 className="font-bold text-slate-100 text-lg leading-tight mb-1 line-clamp-1">{userObj.fullName}</h4>
            <p className="text-sky-400/80 text-[13px] font-medium leading-snug line-clamp-1">
              {userObj.role?.roleName || userObj.bio || "Platform Member"}
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => handleRespond(reqId, "approved")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[15px] py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] active:scale-[0.98]"
            >
              <Check className="w-5 h-5" />
              Approve
            </button>
            <button
              onClick={() => handleRespond(reqId, "rejected")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[15px] py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <X className="w-5 h-5" />
              Decline
            </button>
          </div>
        ) : (
          <button className="mt-2 w-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-200 font-bold text-[15px] py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            View Profile
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight mb-2">
              Network
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your connections and discover new peers.
            </p>
          </div>

          <form onSubmit={handleSendRequest} className="flex gap-2 relative bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={searchTargetId}
                onChange={(event: React.SyntheticEvent<any>) => setSearchTargetId((event.target as HTMLInputElement).value)}
                placeholder="User ID to connect..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]"
            >
              Connect
            </button>
          </form>
        </div>

        {renderTabs()}

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="font-medium">Loading connections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* PENDING TAB */}
              {activeTab === "pending" && pendingRequests.map((request: any) => renderBentoCard(request.requester, true, request.id))}
              {activeTab === "pending" && pendingRequests.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-[32px] border border-slate-800/50 dashed">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Pending Requests</h3>
                  <p>You're all caught up on connection requests.</p>
                </div>
              )}

              {/* FOLLOWERS TAB */}
              {activeTab === "followers" && followers.map((f: any) => renderBentoCard(f.follower, false, f.id))}
              {activeTab === "followers" && followers.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-[32px] border border-slate-800/50 dashed">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Followers Yet</h3>
                  <p>Start interacting in the community to build your network.</p>
                </div>
              )}

              {/* FOLLOWING TAB */}
              {activeTab === "following" && following.map((f: any) => renderBentoCard(f.following, false, f.id))}
              {activeTab === "following" && following.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-[32px] border border-slate-800/50 dashed">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <UserPlus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">Not Following Anyone</h3>
                  <p>Discover interesting people and connect with them.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;


