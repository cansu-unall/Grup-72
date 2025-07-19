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

function App() {
  const { user, loading } = useAuth();

  // Auth durumu kontrol edilirken yüklenme ekranı gösterilir
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Giriş yapıldıysa login sayfasına gitmeyi engelle */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Navigate to="/login" />} />

      {/* Protected Student Routes */}
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                {/* Diğer öğrenci sayfaları buraya eklenecek: /student/exercises, /student/profile vb. */}
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Teacher Routes */}
      <Route 
        path="/teacher/*" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                {/* Diğer öğretmen sayfaları buraya eklenecek */}
              </Routes>
            </TeacherLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Parent Routes */}
      <Route 
        path="/parent/*" 
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentLayout>
              <Routes>
                <Route path="dashboard" element={<ParentDashboard />} />
                {/* Diğer veli sayfaları buraya eklenecek */}
              </Routes>
            </ParentLayout>
          </ProtectedRoute>
        } 
      />

      {/* Not Found Route */}
      <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
    </Routes>
  );
}

export default App;