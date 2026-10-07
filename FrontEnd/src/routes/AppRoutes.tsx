import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import SidebarLayout from "@/components/SidebarLayout";
import PublicLayout from "@/components/PublicLayout";
import { loadPage } from "./loadPage";
import RouteBoundary from "@/components/RouteBoundary";
const NotFound = loadPage(() => import("@/pages/public/NotFound"));
const ComingSoon = loadPage(() => import("@/pages/public/ComingSoon"));

// Public Pages
const Home = loadPage(() => import("@/pages/public/Home"));
const Login = loadPage(() => import("@/pages/auth/Login"));
const Signup = loadPage(() => import("@/pages/auth/Signup"));
const ForgotPassword = loadPage(() => import("@/pages/auth/ForgotPassword"));
const ChangePassword = loadPage(() => import("@/pages/auth/ChangePassword"));
const AIImageTool = loadPage(() => import("@/pages/public/AIImageTool"));
const Labs = loadPage(() => import("@/pages/practice/Labs"));
const Mentors = loadPage(() => import("@/pages/community/Mentors"));
const MentorDetail = loadPage(() => import("@/pages/community/MentorDetail"));
const Enterprise = loadPage(() => import("@/pages/public/Enterprise"));
const Universities = loadPage(() => import("@/pages/public/Universities"));
const Government = loadPage(() => import("@/pages/public/Government"));
const FreeResources = loadPage(() => import("@/pages/public/FreeResources"));
const About = loadPage(() => import("@/pages/public/About"));
const Contact = loadPage(() => import("@/pages/public/Contact"));
const Terms = loadPage(() => import("@/pages/public/Terms"));

// Student Pages
const Dashboard = loadPage(() => import("@/pages/dashboards/Dashboard"));
const CourseCatalog = loadPage(() => import("@/pages/courses/CourseCatalog"));
const CourseDetail = loadPage(() => import("@/pages/courses/CourseDetail"));
const LearningArena = loadPage(() => import("@/pages/learning/LearningArena"));

// Mentor/Admin Pages
const MentorDashboard = loadPage(() => import("@/pages/dashboards/MentorDashboard"));
const MentorStudents = loadPage(() => import("@/pages/dashboards/MentorStudents"));
const AdminDashboard = loadPage(() => import("@/pages/dashboards/AdminDashboard"));
const UserManagement = loadPage(() => import("@/pages/admin/UserManagement"));
const MentorApplications = loadPage(() => import("@/pages/admin/MentorApplications"));
const ReportsManagement = loadPage(() => import("@/pages/admin/ReportsManagement"));
const AdminNotifications = loadPage(() => import("@/pages/admin/AdminNotifications"));
const AdminSettings = loadPage(() => import("@/pages/admin/AdminSettings"));
const CourseBuilder = loadPage(() => import("@/pages/courses/CourseBuilder"));

const ProblemSet = loadPage(() => import("@/pages/practice/ProblemSet"));
const CodingArena = loadPage(() => import("@/pages/practice/CodingArena"));
const CodingLab = loadPage(() => import("@/pages/practice/CodingLab"));

// Missing Pages
const Learning = loadPage(() => import("@/pages/learning/Learning"));
const Analytics = loadPage(() => import("@/pages/learning/Analytics"));
const Assignments = loadPage(() => import("@/pages/learning/Assignments"));
const Settings = loadPage(() => import("@/pages/settings/Settings"));
const Chat = loadPage(() => import("@/pages/community/Chat"));
const Network = loadPage(() => import("@/pages/community/Network"));
const AIAssistant = loadPage(() => import("@/pages/ai/AIAssistant"));
const DocumentRepository = loadPage(() => import("@/pages/documents/DocumentRepository"));

// const DynamicLayout = ({ children }) => {
//   const { user } = useSelector((state: any) => state.auth);
//   return user ? <SidebarLayout>{children}</SidebarLayout> : <PublicLayout>{children}</PublicLayout>;
// };

const AppRoutes = () => {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <RouteBoundary><Routes>
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
        <Route path="/labs/code" element={<CodingLab />} />
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
        <Route path="/mentor/students" element={<ProtectedRoute allowedRoles={[2, 1]}><MentorStudents /></ProtectedRoute>} />
        <Route path="/mentor/analytics" element={<ProtectedRoute allowedRoles={[2, 1]}><Analytics /></ProtectedRoute>} />

        {/* Admin Protected Routes (Access: Admin=1) */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[1]}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/mentor-applications" element={<ProtectedRoute allowedRoles={[1]}><MentorApplications /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[1]}><ReportsManagement /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={[1]}><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={[1]}><Analytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={[1]}><AdminSettings /></ProtectedRoute>} />
      </Route>

      {/* Full screen routes (No Sidebar, No Header) */}
      <Route path="/learn/:courseId/module/:moduleId/lesson/:lessonId" element={<ProtectedRoute><LearningArena /></ProtectedRoute>} />
      <Route path="/practice/:slug" element={<ProtectedRoute><CodingArena /></ProtectedRoute>} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes></RouteBoundary>
  );
};

export default AppRoutes;


