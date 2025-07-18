import { useAuth } from '../../context/AuthContext';

const ParentDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-4">Veli Paneli</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl">
          Merhaba <span className="font-bold text-teal-600">{user?.username}</span>, paneline hoş geldin!
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Buradan çocuğunuzun uygulama üzerindeki gelişimini ve aktivitelerini takip edebilirsiniz.
        </p>
      </div>
    </div>
  );
};
export default ParentDashboard;