import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  // MoreVertical,
  // ChevronLeft,
  // ChevronRight,
  // UserCheck,
  CheckCircle2,
  Trash2,
  Power,
  UserPlus
} from "lucide-react";
import { Card, Button, Avatar, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpPutRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Students"); // "Students", "Mentors", "Admins"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const roleParam = activeTab === "Students" ? "student" : activeTab === "Mentors" ? "mentor" : "admin";

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", roleParam, search],
    queryFn: () => executeHttpGetRequest(`${API_PATHS.ADMIN.USERS}?role=${roleParam}${search ? `&search=${search}` : ""}`)
  });

  const users = usersData?.data?.data || [];
  // const meta = usersData?.data?.meta || {};

  const handleCreateUser = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    setIsCreating(true);
    try {
      await executeHttpPostRequest(API_PATHS.ADMIN.USERS, newUser);
      toast.success(
        `${newUser.roleId === 1 ? "Admin" : "Mentor"} created successfully. Default password is TaskPro@2026`,
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
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to create mentor");
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
      await executeHttpPutRequest(`${API_PATHS.ADMIN.USERS}/${selectedUser.userId}`, {
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        mobile: selectedUser.mobile,
        roleId: selectedUser.roleId,
      });
      toast.success("User updated successfully");
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to update user");
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await executeHttpPutRequest(API_PATHS.ADMIN.TOGGLE_STATUS(userId!));
      toast.success("User status toggled");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await executeHttpDeleteRequest(`${API_PATHS.ADMIN.USERS}/${userId}`);
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to delete user");
    }
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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] border-none"
        >
          <UserPlus className="w-4 h-4" /> New Staff
        </Button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-[0_0_30px_rgba(37,99,235,0.15)] rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex-between bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <UserPlus className="w-4 h-4" />
                </div>
                Create New Staff
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800"
              >
                <CheckCircle2 className="icon-md rotate-45 transform" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">
                  Role
                </label>
                <Select
                  value={newUser.roleId.toString()}
                  onValueChange={(value: any) => setNewUser({ ...newUser, roleId: parseInt(value) })}
                >
                  <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                    <SelectItem value="2" className="focus:bg-blue-600 focus:text-white cursor-pointer">Mentor</SelectItem>
                    <SelectItem value="1" className="focus:bg-blue-600 focus:text-white cursor-pointer">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newUser.fullName}
                  onChange={(event: React.SyntheticEvent<any>) =>
                    setNewUser({ ...newUser, fullName: (event.target as HTMLInputElement).value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors bg-slate-900/50 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">
                  Username
                </label>
                <input
                  required
                  type="text"
                  value={newUser.userName}
                  onChange={(event: React.SyntheticEvent<any>) =>
                    setNewUser({ ...newUser, userName: (event.target as HTMLInputElement).value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors bg-slate-900/50 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(event: React.SyntheticEvent<any>) =>
                    setNewUser({ ...newUser, email: (event.target as HTMLInputElement).value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors bg-slate-900/50 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">
                  Mobile
                </label>
                <input
                  required
                  type="text"
                  value={newUser.mobile}
                  onChange={(event: React.SyntheticEvent<any>) =>
                    setNewUser({ ...newUser, mobile: (event.target as HTMLInputElement).value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors bg-slate-900/50 text-slate-200"
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 border-l-2 border-blue-500/50 pl-3">
                The default password will be <strong className="text-slate-300">TaskPro@2026</strong>. The
                user will be forced to change it on their first login.
              </p>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1 bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="flex-1 shadow-[0_0_10px_rgba(37,99,235,0.4)] border-none">
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <Card className="bg-slate-900 border-slate-800 shadow-2xl">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Edit User</h2>
              </div>
              <form onSubmit={handleEditUser} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                  <Select
                    value={selectedUser.roleId?.toString()}
                    onValueChange={(value: any) => setSelectedUser({ ...selectedUser, roleId: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full mt-1.5 bg-slate-950 border-slate-800 text-slate-300 focus:ring-blue-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="1">Admin</SelectItem>
                      <SelectItem value="2">Mentor</SelectItem>
                      <SelectItem value="3">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    value={selectedUser.fullName}
                    onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, fullName: (event.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    value={selectedUser.email}
                    onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, email: (event.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    value={selectedUser.mobile}
                    onChange={(event: React.SyntheticEvent<any>) => setSelectedUser({ ...selectedUser, mobile: (event.target as HTMLInputElement).value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditing} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                    {isEditing ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <Card className="!p-0 shadow-lg overflow-hidden flex flex-col mt-4">
        {/* Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/80">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["Students", "Mentors", "Admins"].map((tab: any) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
                onChange={(event: React.SyntheticEvent<any>) => setSearch((event.target as HTMLInputElement).value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-300"
              />
            </div>
            <button className="p-2 border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/60">
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  {activeTab === "Students" ? "Enrollments" : "Courses Taught"}
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
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
                            fallback={user.fullName ? user.fullName[0] : user.userName[0]}
                            size="md"
                            className="ring-2 ring-slate-800 group-hover:ring-blue-500/30 transition-all"
                          />
                          {user.isActive && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.6)]"></div>}
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
                        {activeTab === "Students" ? user._count?.enrollments : user._count?.coursesTaught}
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
                        onClick={() => handleToggleStatus(user.userId)}
                        className={`p-2 rounded-lg border border-transparent transition-all shadow-sm ${user.isActive ? 'text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.2)]' : 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_10px_rgba(52,211,153,0.2)]'}`}
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
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
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


