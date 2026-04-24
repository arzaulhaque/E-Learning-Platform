import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleBadgeColor = {
    student: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/courses" className="text-2xl font-bold text-indigo-600">
            ELearn
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleBadgeColor[user.role] || 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </span>

                {user.role === 'student' && (
                  <Link to="/my-enrollments" className="text-gray-600 hover:text-indigo-600 font-medium">
                    My Enrollments
                  </Link>
                )}
                {user.role === 'teacher' && (
                  <Link to="/teacher" className="text-gray-600 hover:text-indigo-600 font-medium">
                    Teacher Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium">
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
