/**
 * @fileoverview Account Settings page for Payilagam .
 * Side-nav with Profile, Security, Notifications, and Privacy tabs.
 * Currently implements profile editing (name, email, avatar) and
 * an email notification toggle with mock save behaviour.
 */
import { useState, useRef, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  executeHttpGetRequest, 
  executeHttpPutRequest, 
  executeHttpPostRequest, 
  executeHttpDeleteRequest 
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { fetchProfile } from "@/store/authSlice";
import { Avatar, Dialog, DialogContent } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

const Settings = () => {
  const user: any = useSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // Cropper and Modals state
  const [cropImageSrc, setCropImageSrc] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: (user as any)?.bio || "",
    experience: (user as any)?.experience || "",
    skills: (user as any)?.skills ? JSON.parse((user as any)?.skills).join(", ") : "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mentor Application state
  const [mentorApp, setMentorApp] = useState<any>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [appForm, setAppForm] = useState({
    bio: "",
    skills: "",
    experience: "",
  });

  const fetchMyApplication = async () => {
    setIsLoadingApp(true);
    try {
      const response = await executeHttpGetRequest(API_PATHS.USERS.MY_MENTOR_APPLICATION);
      if (response.data.success) {
        setMentorApp(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load application status", err);
    } finally {
      setIsLoadingApp(false);
    }
  };

  useEffect(() => {
    if (activeTab === "MentorApplication") {
      fetchMyApplication();
    }
  }, [activeTab]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.bio.trim() || !appForm.skills.trim() || !appForm.experience.trim()) {
      return toast.error("Please fill in all details");
    }
    setIsSaving(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.USERS.APPLY_MENTOR, appForm);
      if (response.data.success) {
        toast.success("Mentor application submitted successfully!");
        setMentorApp(response.data.data);
      }
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        fullName: profileData.fullName,
        email: profileData.email,
      };

      if (user?.role === "mentor") {
        payload.bio = profileData.bio;
        payload.experience = profileData.experience;
        // Convert comma separated string to JSON array
        const skillsArray = profileData.skills
          ? profileData.skills.split(",").map((s: any) => s.trim()).filter((s: any) => s)
          : [];
        payload.skills = JSON.stringify(skillsArray);
      }

      const response = await executeHttpPutRequest(API_PATHS.AUTH.PROFILE, payload);
      if (response.data.success) {
        toast.success("Profile settings saved successfully");
        dispatch(fetchProfile()); // Refresh user data in redux
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (event: React.SyntheticEvent<any>) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setIsCropModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarUpload = async (croppedBlob: any) => {
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

    setIsUploadingAvatar(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.AUTH.AVATAR, formData, true);
      if (response.data.success) {
        toast.success("Avatar updated successfully");
        dispatch(fetchProfile());
        setIsCropModalOpen(false);
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to update avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
      }
      setCropImageSrc(null);
    }
  };

  const handleAvatarDelete = async () => {
    setIsUploadingAvatar(true);
    try {
      const response = await executeHttpDeleteRequest(API_PATHS.AUTH.AVATAR);
      if (response.data.success) {
        toast.success("Avatar removed successfully");
        dispatch(fetchProfile());
        setIsDeleteConfirmOpen(false);
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to remove avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsSaving(true);
    try {
      const response = await executeHttpPutRequest(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (response.data.success) {
        toast.success("Password changed successfully");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "Profile", icon: User, label: "Profile" },
    { id: "Security", icon: Lock, label: "Security" },
    { id: "Notifications", icon: Bell, label: "Notifications" },
    { id: "Privacy", icon: Shield, label: "Privacy" },
  ];

  if (user?.role === "student" || (user && user.roleId === 3)) {
    tabs.push({ id: "MentorApplication", icon: GraduationCap, label: "Become a Mentor" });
  }

  return (
    <div className="p-4 lg:p-6 mx-auto h-full w-full flex flex-col bg-slate-950 overflow-hidden">
      <div className="mb-4 max-w-6xl w-full mx-auto shrink-0">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1 flex items-center gap-3">
          Account Settings
        </h1>
        <p className="text-slate-400 text-xs">
          Manage your profile, preferences, and account security.
        </p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-6xl w-full mx-auto min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 shrink-0 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800/80 h-fit space-y-1">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 group relative overflow-hidden",
                activeTab === tab.id
                  ? "bg-blue-600/10 text-blue-400 shadow-sm ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
              )}
            >
              {activeTab === tab.id && (
                <div className="absolute left-0 inset-y-2 w-1 bg-blue-500 rounded-r-full" />
              )}
              <tab.icon
                className={cn(
                  "icon-sm transition-transform duration-300",
                  activeTab === tab.id
                    ? "scale-110 text-blue-400"
                    : "group-hover:text-slate-300",
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <Card className="!p-0 shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden bg-slate-900/50 backdrop-blur-3xl border-slate-700/50 flex-1 flex flex-col min-h-0">
            {/* PROFILE TAB */}
            {activeTab === "Profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-slate-800/40 to-transparent shrink-0">
                  <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                    Profile Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your photo and personal details here.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                  {/* Avatar Section */}
                  <div
                    className={`flex flex-col sm:flex-row gap-6 p-5 rounded-2xl border items-start sm:items-center transition-all duration-300 shadow-inner shadow-black/20 ${dragActive ? "border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "bg-slate-900/40 border-slate-700/50 hover:border-slate-600/50"}`}
                    onDragOver={(event: React.SyntheticEvent<any>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragLeave={(event: React.SyntheticEvent<any>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragActive(false);
                    }}
                    onDrop={(event: React.SyntheticEvent<any>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragActive(false);
                      if ((event as React.DragEvent).dataTransfer.files && (event as React.DragEvent).dataTransfer.files[0]) {
                        handleFileSelect({
                          target: { files: (event as React.DragEvent).dataTransfer.files }
                        } as any);
                      }
                    }}
                  >
                    <div className="relative group shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <Avatar
                        src={user?.profileUrl}
                        fallback={
                          user?.fullName?.[0] || user?.userName?.[0] || "U"
                        }
                        className="w-20 h-20 text-3xl font-bold shadow-2xl ring-4 ring-slate-800/80 group-hover:ring-blue-500/30 transition-all duration-300 relative z-10"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.8)] transition-all transform hover:scale-110 z-20"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/png, image/jpeg, image/gif"
                        className="hidden"
                      />
                      <h3 className="text-sm font-bold text-slate-100 mb-0.5 tracking-wide">
                        Profile Picture
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 max-w-sm leading-relaxed">
                        Upload a new avatar (Max 5MB).
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="shadow-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs h-9"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 mr-1.5" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                          )}
                          {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                        </Button>
                        {user?.profileUrl && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => setIsPreviewModalOpen(true)}
                              className="shadow-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs h-9"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                              Preview
                            </Button>
                            <button
                              onClick={() => setIsDeleteConfirmOpen(true)}
                              disabled={isUploadingAvatar}
                              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors shadow-sm inline-flex items-center gap-1.5 h-9"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Input
                        id="fullName"
                        type="text"
                        value={profileData.fullName}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setProfileData({
                            ...profileData,
                            fullName: (event.target as HTMLInputElement).value,
                          })
                        }
                        className="peer pt-5 pb-1 placeholder-transparent bg-slate-900/40 border-slate-700/50 rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 h-12 px-3 text-slate-100 text-sm"
                        placeholder="Full Name"
                      />
                      <label 
                        htmlFor="fullName" 
                        className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                      >
                        Full Name
                      </label>
                    </div>

                    <div className="relative group opacity-70">
                      <Input
                        id="username"
                        type="text"
                        defaultValue={user?.userName}
                        disabled
                        className="peer pt-5 pb-1 cursor-not-allowed placeholder-transparent bg-slate-900/20 border-slate-800/50 rounded-xl shadow-inner shadow-black/10 h-12 px-3 text-slate-300 text-sm"
                        placeholder="Username"
                      />
                      <label 
                        htmlFor="username" 
                        className="absolute left-3 top-1.5 text-[10px] font-medium text-slate-500"
                      >
                        Username (cannot be changed)
                      </label>
                    </div>

                    <div className="relative group md:col-span-2">
                      <Input
                        id="emailProfile"
                        type="email"
                        value={profileData.email}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setProfileData({
                            ...profileData,
                            email: (event.target as HTMLInputElement).value,
                          })
                        }
                        className="peer pt-5 pb-1 placeholder-transparent bg-slate-900/40 border-slate-700/50 rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 h-12 px-3 text-slate-100 text-sm"
                        placeholder="Email Address"
                      />
                      <label 
                        htmlFor="emailProfile" 
                        className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                      >
                        Email Address
                      </label>
                    </div>
                  </div>

                  {user?.role === "mentor" && (
                    <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mentor Details</h4>
                      
                      <div className="relative group">
                        <textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(event: React.SyntheticEvent<any>) => setProfileData({...profileData, bio: (event.target as HTMLInputElement).value})}
                          className="peer w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-100 placeholder-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 resize-none pt-6 text-sm"
                          placeholder="About / Bio"
                          rows={2}
                        />
                        <label 
                          htmlFor="bio" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          About / Bio
                        </label>
                      </div>
                      
                      <div className="relative group">
                        <textarea
                          id="experience"
                          value={profileData.experience}
                          onChange={(event: React.SyntheticEvent<any>) => setProfileData({...profileData, experience: (event.target as HTMLInputElement).value})}
                          className="peer w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-100 placeholder-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 resize-none pt-6 text-sm"
                          placeholder="Professional Experience"
                          rows={2}
                        />
                        <label 
                          htmlFor="experience" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          Professional Experience
                        </label>
                      </div>

                      <div className="relative group">
                        <Input
                          id="skills"
                          type="text"
                          value={profileData.skills}
                          onChange={(event: React.SyntheticEvent<any>) => setProfileData({...profileData, skills: (event.target as HTMLInputElement).value})}
                          className="peer pt-5 pb-1 placeholder-transparent bg-slate-900/40 border-slate-700/50 rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 h-12 px-3 text-slate-100 text-sm"
                          placeholder="Expertise & Skills (Comma Separated)"
                        />
                        <label 
                          htmlFor="skills" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          Expertise & Skills (e.g. React, Node.js, Python)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Notifications Switch */}
                  <div className="flex items-center justify-between bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                        Email Notifications
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Receive daily summaries and course updates
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEmailNotifs(!emailNotifs);
                        toast.success(
                          emailNotifs
                            ? "Email notifications disabled"
                            : "Email notifications enabled",
                        );
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
                        emailNotifs ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-slate-700/80 shadow-inner",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
                          emailNotifs ? "translate-x-5.5" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-slate-900/60 backdrop-blur-md border-t border-white/5 flex justify-end items-center shrink-0">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="min-w-[140px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg transition-all font-semibold hover:-translate-y-0.5 border-0 h-10 text-xs"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "Security" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30 shrink-0">
                  <h2 className="text-lg font-bold text-slate-100">
                    Security Settings
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage your password and secure your account.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                  <div className="flex items-start gap-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shadow-sm">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        Change Password
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                        Ensure your account is using a long, random password to
                        stay secure. We recommend using a password manager.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePasswordChange}
                    className="max-w-md space-y-4"
                  >
                    <div className="relative group">
                      <Input
                        id="currentPasswordSettings"
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={passwords.currentPassword}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setPasswords({
                            ...passwords,
                            currentPassword: (event.target as HTMLInputElement).value,
                          })
                        }
                        className="peer pt-5 pb-1 placeholder-transparent pr-12 h-12 text-sm bg-slate-900/40 border-slate-700/50 rounded-xl"
                        placeholder="Current Password"
                      />
                      <label 
                        htmlFor="currentPasswordSettings" 
                        className="absolute left-3 top-1.5 text-[10px] text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                      >
                        Current Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-3 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="relative group">
                      <Input
                        id="newPasswordSettings"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={passwords.newPassword}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setPasswords({
                            ...passwords,
                            newPassword: (event.target as HTMLInputElement).value,
                          })
                        }
                        className="peer pt-5 pb-1 placeholder-transparent pr-12 h-12 text-sm bg-slate-900/40 border-slate-700/50 rounded-xl"
                        placeholder="New Password"
                      />
                      <label 
                        htmlFor="newPasswordSettings" 
                        className="absolute left-3 top-1.5 text-[10px] text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                      >
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="relative group">
                      <Input
                        id="confirmPasswordSettings"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={passwords.confirmPassword}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setPasswords({
                            ...passwords,
                            confirmPassword: (event.target as HTMLInputElement).value,
                          })
                        }
                        className="peer pt-5 pb-1 placeholder-transparent pr-12 h-12 text-sm bg-slate-900/40 border-slate-700/50 rounded-xl"
                        placeholder="Confirm New Password"
                      />
                      <label 
                        htmlFor="confirmPasswordSettings" 
                        className="absolute left-3 top-1.5 text-[10px] text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                      >
                        Confirm New Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="min-w-[140px] h-10 text-xs rounded-xl"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : null}
                        {isSaving ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {(activeTab === "Notifications" || activeTab === "Privacy") && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 border border-slate-800 shadow-lg">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">
                  {activeTab} settings coming soon
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  We are actively building these features to give you more
                  control over your account.
                </p>
              </div>
            )}
            {/* MENTOR APPLICATION TAB */}
            {activeTab === "MentorApplication" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30 shrink-0">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    Become a Mentor
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Share your expert knowledge and help students learn.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                  {isLoadingApp ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <p className="text-xs text-slate-400 mt-2">Loading application details...</p>
                    </div>
                  ) : mentorApp ? (
                    <div className="space-y-6">
                      {mentorApp.status === "PENDING" && (
                        <div className="bg-amber-500/[0.04] border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-amber-300/90">Application Under Review</h3>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                              Your application to become a platform mentor is currently being evaluated.
                              We review submissions within 2-3 business days.
                            </p>
                          </div>
                        </div>
                      )}

                      {mentorApp.status === "APPROVED" && (
                        <div className="bg-emerald-500/[0.04] border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h3 className="text-sm font-semibold text-emerald-300/90">Application Approved!</h3>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                              Congratulations! You are now an official Mentor on Payilagam. Refresh your session or click the button below to view your Dashboard.
                            </p>
                            <Button 
                              onClick={() => {
                                dispatch(fetchProfile());
                                window.location.href = "/mentor";
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs px-3.5 py-1.5 h-8 mt-1 border-none"
                            >
                              Go to Mentor Dashboard
                            </Button>
                          </div>
                        </div>
                      )}

                      {mentorApp.status === "REJECTED" && (
                        <div className="bg-rose-500/[0.04] border border-rose-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-rose-400" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h3 className="text-sm font-semibold text-rose-300/90">Application Not Approved</h3>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                              Unfortunately, your application was not approved by our quality control team at this time.
                              Feel free to expand on your profile details and try again.
                            </p>
                            <Button 
                              onClick={() => setMentorApp(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs px-3.5 py-1.5 h-8 mt-1 border border-slate-700"
                            >
                              Re-apply Now
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Display Submitted Details Summary */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Submitted Details</h4>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Biography</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">{mentorApp.bio}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Skills / Expertise</span>
                          <p className="text-xs text-slate-300 bg-slate-950/20 p-3 rounded-lg border border-slate-900">{mentorApp.skills}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Experience Details</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">{mentorApp.experience}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-5 max-w-xl">
                      <div className="bg-blue-500/[0.03] border border-blue-500/10 p-4 rounded-xl text-xs text-blue-300/80 leading-relaxed">
                        To maintain high education quality, our admin team verifies all mentor credentials. Please describe your expertise, experience, and why you would like to teach.
                      </div>

                      <div className="relative group">
                        <textarea
                          id="appBio"
                          value={appForm.bio}
                          onChange={(e: React.SyntheticEvent<any>) => setAppForm({...appForm, bio: (e.target as HTMLTextAreaElement).value})}
                          className="peer w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-100 placeholder-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 resize-none pt-6 text-sm"
                          placeholder="Your Bio / Introduction"
                          rows={3}
                          required
                        />
                        <label 
                          htmlFor="appBio" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          Introduce Yourself (Bio)
                        </label>
                      </div>

                      <div className="relative group">
                        <Input
                          id="appSkills"
                          type="text"
                          value={appForm.skills}
                          onChange={(e: React.SyntheticEvent<any>) => setAppForm({...appForm, skills: (e.target as HTMLInputElement).value})}
                          className="peer pt-5 pb-1 placeholder-transparent h-12 text-sm bg-slate-900/40 border-slate-700/50 rounded-xl"
                          placeholder="Skills & Topics of Expertise"
                          required
                        />
                        <label 
                          htmlFor="appSkills" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          Skills (e.g. React, Python, UI/UX)
                        </label>
                      </div>

                      <div className="relative group">
                        <textarea
                          id="appExp"
                          value={appForm.experience}
                          onChange={(e: React.SyntheticEvent<any>) => setAppForm({...appForm, experience: (e.target as HTMLTextAreaElement).value})}
                          className="peer w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-100 placeholder-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20 resize-none pt-6 text-sm"
                          placeholder="Teaching & Professional Experience"
                          rows={3}
                          required
                        />
                        <label 
                          htmlFor="appExp" 
                          className="absolute left-3 top-1.5 text-[10px] text-slate-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400"
                        >
                          Teaching & Professional Experience
                        </label>
                      </div>

                      <div className="pt-3">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="min-w-[140px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg transition-all font-semibold border-none h-10 text-xs"
                        >
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                          Submit Application
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ImageCropper
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
          setCropImageSrc(null);
        }}
        imageSrc={cropImageSrc}
        onCropCompleteAction={handleAvatarUpload}
        isLoading={isUploadingAvatar}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleAvatarDelete}
        title="Remove Profile Picture"
        description="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        isDanger={true}
        isLoading={isUploadingAvatar}
      />

      {/* Avatar Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none overflow-hidden flex items-center justify-center">
          <div className="relative group rounded-full overflow-hidden w-64 h-64 border-4 border-white/20 shadow-2xl backdrop-blur-sm">
            <img 
              src={user?.profileUrl ? (user.profileUrl.startsWith('http') ? user.profileUrl : `http://localhost:5000${user.profileUrl}`) : ''} 
              alt="Profile Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;


