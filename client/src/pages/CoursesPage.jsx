import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchData() {
    setLoading(true)
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        api.get('/courses'),
        user?.role === 'student' ? api.get('/enrollments/my') : Promise.resolve({ data: { data: [] } }),
      ])
      setCourses(coursesRes.data.data)
      setEnrollments(enrollRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleEnroll(courseId) {
    try {
      await api.post('/enrollments', { courseId })
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll.')
    }
  }

  async function handleUnenroll(courseId) {
    try {
      await api.delete(`/enrollments/${courseId}`)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll.')
    }
  }

  function isEnrolled(courseId) {
    return enrollments.some((e) => {
      const id = e.courseId?._id || e.courseId
      return id === courseId
    })
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading courses...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        {user?.role === 'teacher' && (
          <button
            onClick={() => navigate('/teacher')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
          >
            Go to Dashboard
          </button>
        )}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium"
          >
            Go to Admin Panel
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{course.title}</h2>
                {course.isApproved ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium ml-2 shrink-0">
                    Approved
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium ml-2 shrink-0">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3 flex-1">{course.description}</p>
              {course.teacherId && (
                <p className="text-xs text-gray-400 mb-4">
                  By {course.teacherId.name || course.teacherId.email || 'Unknown'}
                </p>
              )}
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/courses/${course._id}`}
                  className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 text-sm font-medium"
                >
                  View Details
                </Link>
                {user?.role === 'student' && (
                  isEnrolled(course._id) ? (
                    <button
                      onClick={() => handleUnenroll(course._id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 text-sm font-medium"
                    >
                      Unenroll
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                    >
                      Enroll
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
