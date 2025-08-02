import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import ParentLayout from './layouts/ParentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Spinner from './components/common/Spinner';
import StudentActivitiesPage from './pages/student/StudentActivitiesPage';
import ActivityPage from './pages/student/ActivityPage';
import DifficultWordsPage from './pages/student/DifficultWordsPage';
import StudentReportPage from './pages/student/StudentReportPage';
import HelpBotPage from './pages/student/HelpBotPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import CreateActivityPage from './pages/teacher/CreateActivityPage';
import ClassStatusPage from './pages/teacher/ClassStatusPage';
import SearchActivitiesPage from './pages/teacher/SearchActivitiesPage';
import StudentReportPageForTeacher from './pages/teacher/StudentReportPage';
import ParentChildrenPage from './pages/parent/ParentChildrenPage';
import ChildReportPage from './pages/parent/ChildReportPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"><Spinner /></div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Navigate to="/login" />} />

      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="activities" element={<StudentActivitiesPage />} />
              <Route path="activity/:activityId" element={<ActivityPage />} />
              <Route path="difficult-words" element={<DifficultWordsPage />} />
              <Route path="report" element={<StudentReportPage />} />
              <Route path="help-bot" element={<HelpBotPage />} />
            </Routes>
          </StudentLayout>
        </ProtectedRoute>
      }/>

      {/* Teacher Routes */}
      <Route path="/teacher/*" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherLayout>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="students" element={<TeacherStudentsPage />} />
              <Route path="create-activity" element={<CreateActivityPage />} />
              <Route path="class-status" element={<ClassStatusPage />} />
              <Route path="student-report/:studentId" element={<StudentReportPageForTeacher />} />
              <Route path="search-activities" element={<SearchActivitiesPage />} />
            </Routes>
          </TeacherLayout>
        </ProtectedRoute>
      }/>
      
      {/* Parent Routes */}
      <Route path="/parent/*" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <ParentLayout>
            <Routes>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="children" element={<ParentChildrenPage />} />
              <Route path="child-report/:childId" element={<ChildReportPage />} />
            </Routes>
          </ParentLayout>
        </ProtectedRoute>
      }/>

      <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
    </Routes>
  );
}

export default App;