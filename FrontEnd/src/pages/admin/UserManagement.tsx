import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Trash2,
  Power,
  UserPlus,
  Pencil,
  Mail,
  Phone,
  User,
  Shield,
  GraduationCap,
  XCircle,
} from "lucide-react";
import {
  Card,
  Button,
  Avatar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpPutRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const UserManagement = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: any) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Students"); // "Students", "Mentors", "Admins", "Applications"
  
  const tabs = ["Students", "Mentors", "Admins"];
  if (currentUser?.role === "admin" || currentUser?.roleId === 1) {
    tabs.push("Applications");
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    userName: "",
    fullName: "",
    email: "",
    mobile: "",
    roleId: 2, // Default Mentor
  });

  const roleParam =
    activeTab === "Students"
      ? "student"
      : activeTab === "Mentors"
        ? "mentor"
        : "admin";

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", roleParam, search],
    queryFn: () =>
      executeHttpGetRequest(
        `${API_PATHS.ADMIN.USERS}?role=${roleParam}${search ? `&search=${search}` : ""}`,
      ),
    enabled: activeTab !== "Applications",
  });

  const { data: appsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ["adminMentorApplications"],
    queryFn: () => executeHttpGetRequest(API_PATHS.USERS.MENTOR_APPLICATIONS),
    enabled: activeTab === "Applications" && (currentUser?.role === "admin" || currentUser?.roleId === 1),
  });

  const handleApproveReject = async (appId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await executeHttpPutRequest(API_PATHS.USERS.MENTOR_APPLICATION_STATUS(appId.toString()), { status });
      toast.success(`Application ${status.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ["adminMentorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Failed to update status");
    }
  };

  const users = usersData?.data?.data || [];
  const applications = appsResponse?.data?.data || [];

  const handleCreateUser = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    setIsCreating(true);
    try {
      await executeHttpPostRequest(API_PATHS.ADMIN.USERS, newUser);
      toast.success(
        `${newUser.roleId === 1 ? "Admin" : "Mentor"} created successfully. Default password is Payilagam@123`,
      );
      setShowCreateModal(false);
      setNewUser({
        userName: "",
        fullName: "",
        email: "",
        mobile: "",
        roleId: 2,
      });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to create mentor",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const handleEditUser = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    setIsEditing(true);
    try {
      await executeHttpPutRequest(
        `${API_PATHS.ADMIN.USERS}/${selectedUser.userId}`,
        {
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          mobile: selectedUser.mobile,
          roleId: selectedUser.roleId,
        },
      );
      toast.success("User updated successfully");
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to update user",
      );
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleStatus = (user: any) => {
    setUserToToggle(user);
    setShowToggleModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      await executeHttpPutRequest(API_PATHS.ADMIN.TOGGLE_STATUS(userToToggle.userId!));
      toast.success(`User ${userToToggle.isActive ? 'deactivated' : 'activated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setShowToggleModal(false);
      setUserToToggle(null);
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to toggle status",
      );
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await executeHttpDeleteRequest(`${API_PATHS.ADMIN.USERS}/${userToDelete}`);
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to deactivate user",
      );
    }
  };

  const handleOpenCreateModal = () => {
    let defaultRoleId = 3; // Student
    if (activeTab === "Mentors") defaultRoleId = 2;
    if (activeTab === "Admins") defaultRoleId = 1;
    setNewUser({ ...newUser, roleId: defaultRoleId });
    setShowCreateModal(true);
  };

  const handleDownloadData = () => {
    if (!usersData?.data) return;
    
    // The data is currently filtered server-side based on roleParam
    const dataToExport = usersData.data;

    const headers = ["Full Name", "Username", "Email", "Mobile", "Role", "Status"];
    const rows = dataToExport.map((user: any) => [
      user.fullName || "",
      user.userName || "",
      user.email || "",
      user.mobile || "",
      user.Role?.roleName || "",
      user.isActive ? "Active" : "Inactive"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payilagam_${activeTab.toLowerCase()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-screen text-slate-300 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 mb-1 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            User Management
          </h1>
          <p className="text-slate-400">
            Manage students and mentors across all active curricula.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all font-semibold hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" /> Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-500/25 via-indigo-500/10 to-transparent rounded-[22px] blur-sm" />
              <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-blue-500/10 rounded-[22px] overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)]">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="px-6 pt-5 pb-0 flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/25">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    Add {activeTab.slice(0, -1)}
                  </h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-lg border border-slate-700/50 bg-slate-800/30 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="px-6 pb-6">
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Role</label>
                      <Select value={newUser.roleId.toString()} onValueChange={(value: any) => setNewUser({ ...newUser, roleId: parseInt(value) })}>
                        <SelectTrigger className="w-full h-10 bg-slate-800/40 border-slate-700/40 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 hover:border-slate-600 transition-all rounded-xl px-3 text-sm text-slate-200">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border-slate-700/50 shadow-[0_15px_50px_rgba(0,0,0,0.6)] text-slate-200 rounded-xl overflow-hidden">
                          <SelectItem value="1" className="focus:bg-blue-600/15 focus:text-blue-400 cursor-pointer py-2 px-3 text-sm transition-colors">Admin</SelectItem>
                          <SelectItem value="2" className="focus:bg-blue-600/15 focus:text-blue-400 cursor-pointer py-2 px-3 text-sm transition-colors">Mentor</SelectItem>
                          <SelectItem value="3" className="focus:bg-blue-600/15 focus:text-blue-400 cursor-pointer py-2 px-3 text-sm transition-colors">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <input required type="text" value={newUser.fullName} onChange={(event: React.SyntheticEvent<any>) => setNewUser({ ...newUser, fullName: (event.target as HTMLInputElement).value })} className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Username</label>
                      <input required type="text" value={newUser.userName} onChange={(event: React.SyntheticEvent<any>) => setNewUser({ ...newUser, userName: (event.target as HTMLInputElement).value })} className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label>
                      <input required type="email" value={newUser.email} onChange={(event: React.SyntheticEvent<any>) => setNewUser({ ...newUser, email: (event.target as HTMLInputElement).value })} className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mobile</label>
                      <input required type="text" value={newUser.mobile} onChange={(event: React.SyntheticEvent<any>) => setNewUser({ ...newUser, mobile: (event.target as HTMLInputElement).value })} className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-xl p-3 flex gap-2.5">
                      <UserPlus className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">Default password: <strong className="text-blue-300">Payilagam@123</strong>. User must change it on first login.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-5 pt-4 border-t border-white/[0.04]">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 h-10 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]">Cancel</button>
                    <button type="submit" disabled={isCreating} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{isCreating ? "Creating..." : "Create Account"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-500/25 via-indigo-500/10 to-transparent rounded-[22px] blur-sm" />
              <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-blue-500/10 rounded-[22px] overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)]">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="px-6 pt-5 pb-0 flex items-center gap-3 mb-5">
                  <div className="relative w-9 h-9 shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-blue-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-blue-500/15 to-indigo-600/15 border border-blue-500/25 flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white tracking-tight">Edit User</h2>
                    <p className="text-[11px] text-slate-500">Update account details</p>
                  </div>
                  <button type="button" onClick={() => setShowEditModal(false)} className="w-7 h-7 rounded-lg border border-slate-700/50 bg-slate-800/30 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
                <form onSubmit={handleEditUser} className="px-6 pb-6">
                  <div className="space-y-3.5">
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Shield className="w-3 h-3 text-slate-500" /> Role
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "1", label: "Admin", icon: Shield, color: "rose" },
                          { id: "2", label: "Mentor", icon: Users, color: "blue" },
                          { id: "3", label: "Student", icon: User, color: "emerald" },
                        ].map((role) => {
                          const isSelected = (selectedUser.roleId ?? selectedUser.role?.roleId)?.toString() === role.id;
                          const Icon = role.icon;
                          const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
                            rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/40",    text: "text-rose-400",    glow: "shadow-[0_0_10px_rgba(244,63,94,0.12)]" },
                            blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/40",    text: "text-blue-400",    glow: "shadow-[0_0_10px_rgba(59,130,246,0.12)]" },
                            emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", glow: "shadow-[0_0_10px_rgba(52,211,153,0.12)]" },
                          };
                          const c = colorMap[role.color];
                          return (
                            <button key={role.id} type="button" onClick={() => setSelectedUser({ ...selectedUser, roleId: parseInt(role.id), role: { ...selectedUser.role, roleId: parseInt(role.id) } })} className={`relative flex flex-col items-center gap-0.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer active:scale-[0.97] ${isSelected ? `${c.bg} ${c.border} ${c.glow}` : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600 hover:bg-slate-800/50"}`}>
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? c.text : "text-slate-500"} transition-colors`} />
                              <span className={`text-[10px] font-bold ${isSelected ? c.text : "text-slate-400"} transition-colors`}>{role.label}</span>
                              {isSelected && <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${c.bg} ${c.border} border flex items-center justify-center`}><CheckCircle2 className={`w-2.5 h-2.5 ${c.text}`} /></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"><User className="w-3 h-3 text-slate-500" /> Full Name</label>
                      <input type="text" required className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" value={selectedUser.fullName} onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, fullName: (event.target as HTMLInputElement).value })} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"><Mail className="w-3 h-3 text-slate-500" /> Email</label>
                      <input type="email" required className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" value={selectedUser.email} onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, email: (event.target as HTMLInputElement).value })} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"><Phone className="w-3 h-3 text-slate-500" /> Mobile</label>
                      <input type="tel" required className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" value={selectedUser.mobile} onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, mobile: (event.target as HTMLInputElement).value })} />
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-5 pt-4 border-t border-white/[0.04]">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-10 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]">Cancel</button>
                    <button type="submit" disabled={isEditing} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{isEditing ? "Saving..." : "Save Changes"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <Card className="!p-0 shadow-lg overflow-hidden flex flex-col mt-4">
        {/* Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/80">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab: any) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.15)] border border-blue-500/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(event: React.SyntheticEvent<any>) =>
                  setSearch((event.target as HTMLInputElement).value)
                }
                className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-300"
              />
            </div>
            <button className="p-2 border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={handleDownloadData} className="p-2 border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/60">
                {activeTab === "Applications" ? (
                  <>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Applicant</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Bio & Background</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Skills</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">User</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Joined Date</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                      {activeTab === "Students" ? "Enrollments" : "Courses Taught"}
                    </th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {activeTab === "Applications" ? (
                isLoadingApps ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading applications...</p>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                          <GraduationCap className="w-8 h-8 text-blue-500/30" />
                        </div>
                        <p>No mentor applications found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-all duration-300 group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={app.user?.profileUrl}
                            fallback={app.user?.fullName?.[0] || "U"}
                            size="md"
                            className="ring-2 ring-slate-800 group-hover:ring-blue-500/30 transition-all"
                          />
                          <div>
                            <div className="font-bold text-slate-200 text-sm group-hover:text-blue-300 transition-colors">
                              {app.user?.fullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {app.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-xs text-slate-300 leading-relaxed line-clamp-2" title={app.bio}>
                          {app.bio}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 italic">
                          Exp: {app.experience}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                        {app.skills}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                          app.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : app.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {app.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveReject(app.id, "APPROVED")}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveReject(app.id, "REJECTED")}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No Actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                          <Users className="w-8 h-8 text-blue-500/30" />
                        </div>
                        <p>No {activeTab.toLowerCase()} found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-slate-800/40 transition-all duration-300 group hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar
                              src={user.profileUrl}
                              fallback={
                                user.fullName
                                  ? user.fullName[0]
                                  : user.userName[0]
                              }
                              size="md"
                              className="ring-2 ring-slate-800 group-hover:ring-blue-500/30 transition-all"
                            />
                            {user.isActive && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.6)]"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 text-sm group-hover:text-blue-300 transition-colors">
                              {user.fullName || user.userName}
                            </div>
                            <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-400 group-hover:text-sky-200 transition-colors">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-slate-950 text-slate-300 text-xs font-bold px-2.5 py-1 rounded border border-slate-800 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-colors">
                          {activeTab === "Students"
                            ? user._count?.enrollments
                            : user._count?.coursesTaught}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border shadow-sm transition-all ${
                            user.isActive
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                              : "bg-slate-900 text-slate-500 border-slate-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 transition-all"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg border border-transparent transition-all shadow-sm ${user.isActive ? "text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.2)]" : "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_10px_rgba(52,211,153,0.2)]"}`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="p-2 rounded-lg text-red-400 border border-transparent hover:bg-red-500/10 hover:border-red-500/30 transition-all shadow-sm hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          title="Delete (Deactivate)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-red-500/30 via-red-500/10 to-transparent rounded-[22px] blur-sm" />
              <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-red-500/15 rounded-[22px] overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)]">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                <div className="px-6 pt-7 pb-6">
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-1 rounded-full bg-red-500/5 border border-red-500/20" />
                    <div className="absolute inset-2.5 rounded-full bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-center text-white mb-1 tracking-tight">Delete User</h3>
                  <p className="text-slate-400 text-xs text-center leading-relaxed mb-5 max-w-[260px] mx-auto">This will permanently remove the user. They won't be able to log in or access the platform.</p>
                  <div className="bg-red-500/[0.06] border border-red-500/15 rounded-xl p-3 mb-5 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Power className="w-3 h-3 text-red-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-red-300/90">Account will be removed</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">All sessions terminated, permissions revoked.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 h-10 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]">Cancel</button>
                    <button type="button" onClick={confirmDeleteUser} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)] hover:from-red-500 hover:to-rose-400 transition-all hover:-translate-y-0.5 active:scale-[0.98]">Delete User</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {showToggleModal && userToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              {/* Outer glow ring (amber for deactivate, emerald for activate) */}
              <div className={`absolute -inset-[1px] rounded-[22px] blur-sm bg-gradient-to-b ${
                userToToggle.isActive 
                  ? "from-amber-500/25 via-amber-500/5 to-transparent" 
                  : "from-emerald-500/25 via-emerald-500/5 to-transparent"
              }`} />
              
              <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border rounded-[22px] overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7)] ${
                userToToggle.isActive ? "border-amber-500/15" : "border-emerald-500/15"
              }`}>
                <div className={`h-[2px] bg-gradient-to-r from-transparent to-transparent ${
                  userToToggle.isActive ? "via-amber-500/50" : "via-emerald-500/50"
                }`} />
                
                <div className="px-6 pt-7 pb-6">
                  {/* Animated icon container */}
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full animate-ping ${userToToggle.isActive ? "bg-amber-500/10" : "bg-emerald-500/10"}`} style={{ animationDuration: '2s' }} />
                    <div className={`absolute inset-1 rounded-full border ${userToToggle.isActive ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`} />
                    <div className={`absolute inset-2.5 rounded-full border flex items-center justify-center ${
                      userToToggle.isActive 
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/30" 
                        : "bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-emerald-500/30"
                    }`}>
                      <Power className={`w-5 h-5 ${userToToggle.isActive ? "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"}`} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-center text-white mb-1 tracking-tight">
                    {userToToggle.isActive ? "Deactivate User" : "Activate User"}
                  </h3>
                  
                  <p className="text-slate-400 text-xs text-center leading-relaxed mb-5 max-w-[260px] mx-auto">
                    {userToToggle.isActive 
                      ? "Are you sure you want to deactivate this account? This will temporarily revoke access." 
                      : "Are you sure you want to activate this account? This will restore platform access."
                    }
                  </p>

                  <div className={`border rounded-xl p-3 mb-5 flex items-start gap-2.5 ${
                    userToToggle.isActive 
                      ? "bg-amber-500/[0.04] border-amber-500/10" 
                      : "bg-emerald-500/[0.04] border-emerald-500/10"
                  }`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      userToToggle.isActive ? "bg-amber-500/10" : "bg-emerald-500/10"
                    }`}>
                      <Shield className={`w-3.5 h-3.5 ${userToToggle.isActive ? "text-amber-400" : "text-emerald-400"}`} />
                    </div>
                    <div>
                      <p className={`text-[11px] font-semibold ${userToToggle.isActive ? "text-amber-300/90" : "text-emerald-300/90"}`}>
                        {userToToggle.isActive ? "Access Suspended" : "Access Restored"}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {userToToggle.isActive 
                          ? "The user will not be able to log in until reactivated." 
                          : "The user will be able to log in and access courses."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowToggleModal(false);
                        setUserToToggle(null);
                      }} 
                      className="flex-1 h-10 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={confirmToggleStatus} 
                      className={`flex-1 h-10 rounded-xl text-white text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
                        userToToggle.isActive 
                          ? "bg-gradient-to-r from-amber-600 to-yellow-500 shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)]" 
                          : "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]"
                      }`}
                    >
                      {userToToggle.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
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

export default UserManagement;
