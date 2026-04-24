import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchEnrollments() {
    setLoading(true)
    try {
      const { data } = await api.get('/enrollments/my')
      setEnrollments(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrollments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function handleUnenroll(courseId) {
    try {
      await api.delete(`/enrollments/${courseId}`)
      await fetchEnrollments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll.')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading enrollments...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Enrollments</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
          <Link to="/courses" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.courseId
            if (!course) return null
            return (
              <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h2>
                <p className="text-gray-600 text-sm mb-2 flex-1">{course.description}</p>
                {course.teacherId && (
                  <p className="text-xs text-gray-400 mb-4">
                    By {course.teacherId.name || course.teacherId.email}
                  </p>
                )}
                {enrollment.enrolledAt && (
                  <p className="text-xs text-gray-400 mb-4">
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 text-sm font-medium"
                  >
                    View Course
                  </Link>
                  <button
                    onClick={() => handleUnenroll(course._id)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 text-sm font-medium"
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
