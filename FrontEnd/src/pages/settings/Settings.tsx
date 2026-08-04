/**
 * @fileoverview Account Settings page for Payilagam .
 * Side-nav with Profile, Security, Notifications, and Privacy tabs.
 * Currently implements profile editing (name, email, avatar) and
 * an email notification toggle with mock save behaviour.
 */
import { useState, useRef } from "react";
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
} from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { executeHttpPutRequest, executeHttpPostRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { fetchProfile } from "@/store/authSlice";
import { Avatar, Dialog, DialogContent, } from "@/components/ui";
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

  return (
    <div className="p-4 lg:p-8 mx-auto min-h-[calc(100vh-80px)] bg-slate-950">
      <div className="mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-2 flex items-center gap-3">
          Account Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Manage your profile, preferences, and account security.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80 h-fit space-y-1">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
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
                  "icon-md transition-transform duration-300",
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
        <div className="flex-1 min-w-0">
          <Card className="!p-0 shadow-2xl overflow-hidden">
            {/* PROFILE TAB */}
            {activeTab === "Profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/30">
                  <h2 className="text-xl font-bold text-slate-100">
                    Profile Information
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Update your photo and personal details here.
                  </p>
                </div>

                <div className="p-8 space-y-8">
                  {/* Avatar Section */}
                  <div
                    className={`flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border items-start sm:items-center transition-colors ${dragActive ? "border-blue-400 bg-blue-500/10" : "bg-slate-950/50 border-slate-800"}`}
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
                      <Avatar
                        src={user?.profileUrl}
                        fallback={
                          user?.fullName?.[0] || user?.userName?.[0] || "U"
                        }
                        className="w-24 h-24 text-4xl font-bold shadow-lg ring-4 ring-slate-800"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-colors transform hover:scale-105"
                      >
                        <Upload className="icon-base" />
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
                      <h3 className="text-sm font-semibold text-slate-100 mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-slate-400 mb-4 max-w-sm">
                        Upload a new avatar. Larger images will be resized
                        automatically. Maximum upload size is 5MB.
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="shadow-sm"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="icon-base animate-spin text-blue-400" />
                          ) : (
                            <Upload className="icon-base text-slate-400" />
                          )}
                          {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                        </Button>
                        {user?.profileUrl && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => setIsPreviewModalOpen(true)}
                              className="shadow-sm"
                            >
                              <Eye className="icon-base text-slate-400" />
                              Preview
                            </Button>
                            <button
                              onClick={() => setIsDeleteConfirmOpen(true)}
                              disabled={isUploadingAvatar}
                              className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors shadow-sm inline-flex items-center gap-2"
                            >
                              <Trash2 className="icon-base" />
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="peer pt-6 pb-2 placeholder-transparent"
                        placeholder="Full Name"
                      />
                      <label 
                        htmlFor="fullName" 
                        className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
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
                        className="peer pt-6 pb-2 cursor-not-allowed placeholder-transparent opacity-70"
                        placeholder="Username"
                      />
                      <label 
                        htmlFor="username" 
                        className="absolute left-4 top-2 text-xs text-slate-500"
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
                        className="peer pt-6 pb-2 placeholder-transparent"
                        placeholder="Email Address"
                      />
                      <label 
                        htmlFor="emailProfile" 
                        className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                      >
                        Email Address
                      </label>
                    </div>
                  </div>

                  {user?.role === "mentor" && (
                    <div className="pt-6 mt-6 border-t border-slate-800 space-y-6">
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-blue-400">Mentor Details</h4>
                      
                      <div className="relative group">
                        <textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(event: React.SyntheticEvent<any>) => setProfileData({...profileData, bio: (event.target as HTMLInputElement).value})}
                          className="peer w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors resize-none"
                          placeholder="About / Bio"
                          rows={3}
                        />
                        <label 
                          htmlFor="bio" 
                          className="absolute left-4 top-3 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-[-10px] peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-400"
                        >
                          About / Bio
                        </label>
                      </div>
                      
                      <div className="relative group">
                        <textarea
                          id="experience"
                          value={profileData.experience}
                          onChange={(event: React.SyntheticEvent<any>) => setProfileData({...profileData, experience: (event.target as HTMLInputElement).value})}
                          className="peer w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors resize-none"
                          placeholder="Professional Experience"
                          rows={3}
                        />
                        <label 
                          htmlFor="experience" 
                          className="absolute left-4 top-3 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-[-10px] peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-400"
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
                          className="peer pt-6 pb-2 placeholder-transparent"
                          placeholder="Expertise & Skills (Comma Separated)"
                        />
                        <label 
                          htmlFor="skills" 
                          className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                        >
                          Expertise & Skills (e.g. React, Node.js, Python)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Notifications Switch */}
                  <Card className="flex-between bg-slate-950/50">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 mb-1">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-slate-400">
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
                        emailNotifs ? "bg-blue-600" : "bg-slate-700",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                          emailNotifs ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </Card>
                </div>

                {/* Footer Action */}
                <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 flex justify-end items-center">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="min-w-[140px]"
                  >
                    {isSaving ? (
                      <Loader2 className="icon-md animate-spin mr-2" />
                    ) : null}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "Security" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/30">
                  <h2 className="text-xl font-bold text-slate-100">
                    Security Settings
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage your password and secure your account.
                  </p>
                </div>

                <div className="p-8">
                  <div className="flex items-start gap-4 mb-8 bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shadow-sm">
                      <KeyRound className="icon-md" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-lg">
                        Ensure your account is using a long, random password to
                        stay secure. We recommend using a password manager.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePasswordChange}
                    className="max-w-md space-y-5"
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
                        className="peer pt-6 pb-2 placeholder-transparent pr-12"
                        placeholder="Current Password"
                      />
                      <label 
                        htmlFor="currentPasswordSettings" 
                        className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                      >
                        Current Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="icon-base" />
                        ) : (
                          <Eye className="icon-base" />
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
                        className="peer pt-6 pb-2 placeholder-transparent pr-12"
                        placeholder="New Password"
                      />
                      <label 
                        htmlFor="newPasswordSettings" 
                        className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                      >
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="icon-base" />
                        ) : (
                          <Eye className="icon-base" />
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
                        className="peer pt-6 pb-2 placeholder-transparent pr-12"
                        placeholder="Confirm New Password"
                      />
                      <label 
                        htmlFor="confirmPasswordSettings" 
                        className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                      >
                        Confirm New Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 p-1 rounded-md transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="icon-base" />
                        ) : (
                          <Eye className="icon-base" />
                        )}
                      </button>
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="min-w-[160px]"
                      >
                        {isSaving ? (
                          <Loader2 className="icon-md animate-spin mr-2" />
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
              <div className="p-16 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-lg shadow-slate-900/50">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">
                  {activeTab} settings coming soon
                </h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                  We are actively building these features to give you more
                  control over your account.
                </p>
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


