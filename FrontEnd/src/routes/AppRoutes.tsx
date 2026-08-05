import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import SidebarLayout from "@/components/SidebarLayout";
import PublicLayout from "@/components/PublicLayout";
import NotFound from "@/pages/public/NotFound";
import ComingSoon from "@/pages/public/ComingSoon";

// Public Pages
import Home from "@/pages/public/Home";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ChangePassword from "@/pages/auth/ChangePassword";
import AIImageTool from "@/pages/public/AIImageTool";
import Labs from "@/pages/practice/Labs";
import Mentors from "@/pages/community/Mentors";
import MentorDetail from "@/pages/community/MentorDetail";
import Enterprise from "@/pages/public/Enterprise";
import Universities from "@/pages/public/Universities";
import Government from "@/pages/public/Government";
import FreeResources from "@/pages/public/FreeResources";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Terms from "@/pages/public/Terms";

// Student Pages
import Dashboard from "@/pages/dashboards/Dashboard";
import CourseCatalog from "@/pages/courses/CourseCatalog";
import CourseDetail from "@/pages/courses/CourseDetail";
import LearningArena from "@/pages/learning/LearningArena";

// Mentor/Admin Pages
import MentorDashboard from "@/pages/dashboards/MentorDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import ReportsManagement from "@/pages/admin/ReportsManagement";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import CourseBuilder from "@/pages/courses/CourseBuilder";

// Coding Practice Pages
import ProblemSet from "@/pages/practice/ProblemSet";
import CodingArena from "@/pages/practice/CodingArena";

// Missing Pages
import Learning from "@/pages/learning/Learning";
import Analytics from "@/pages/learning/Analytics";
import Assignments from "@/pages/learning/Assignments";
import Settings from "@/pages/settings/Settings";
import Chat from "@/pages/community/Chat";
import Network from "@/pages/community/Network";
import AIAssistant from "@/pages/ai/AIAssistant";
import DocumentRepository from "@/pages/documents/DocumentRepository";

// const DynamicLayout = ({ children }) => {
//   const { user } = useSelector((state: any) => state.auth);
//   return user ? <SidebarLayout>{children}</SidebarLayout> : <PublicLayout>{children}</PublicLayout>;
// };

const AppRoutes = () => {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <Routes>
      {/* Auth Routes (Always use Public Layout) */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Dynamic Layout Routes (Sidebar if logged in, Header if logged out) */}
      <Route element={user ? <SidebarLayout /> : <PublicLayout />}>
        {/* Publicly accessible pages but layout depends on auth */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:uniqueId" element={<CourseDetail />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/code" element={<Labs />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/mentors/:id" element={<MentorDetail />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/enterprise/universities" element={<Universities />} />
        <Route path="/enterprise/government" element={<Government />} />
        <Route path="/resources" element={<FreeResources />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/ai-image" element={<AIImageTool />} />

        {/* Student Protected Routes (Access: Student=3, Admin=1) */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[3, 1]}><Dashboard /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><ProblemSet /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* RAG Educational AI Routes */}
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentRepository /></ProtectedRoute>} />

        {/* Mentor Protected Routes (Access: Mentor=2, Admin=1) */}
        <Route path="/mentor" element={<ProtectedRoute allowedRoles={[2, 1]}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/mentor/course/create" element={<ProtectedRoute allowedRoles={[2, 1]}><CourseBuilder /></ProtectedRoute>} />
        <Route path="/mentor/course/edit/:id" element={<ProtectedRoute allowedRoles={[2, 1]}><CourseBuilder /></ProtectedRoute>} />
        <Route path="/mentor/students" element={<ProtectedRoute allowedRoles={[2, 1]}><UserManagement /></ProtectedRoute>} />
        <Route path="/mentor/analytics" element={<ProtectedRoute allowedRoles={[2, 1]}><Analytics /></ProtectedRoute>} />

        {/* Admin Protected Routes (Access: Admin=1) */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[1]}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[1]}><ReportsManagement /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={[1]}><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={[1]}><Analytics /></ProtectedRoute>} />
      </Route>

      {/* Full screen routes (No Sidebar, No Header) */}
      <Route path="/learn/:courseId/module/:moduleId/lesson/:lessonId" element={<ProtectedRoute><LearningArena /></ProtectedRoute>} />
      <Route path="/practice/:slug" element={<ProtectedRoute><CodingArena /></ProtectedRoute>} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;


