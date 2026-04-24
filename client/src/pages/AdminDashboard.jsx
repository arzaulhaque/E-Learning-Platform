import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function AdminDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchCourses() {
    setLoading(true)
    try {
      const { data } = await api.get('/courses')
      setCourses(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  async function handleApproval(courseId, isApproved) {
    try {
      await api.patch(`/courses/${courseId}/approve`, { isApproved })
      await fetchCourses()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval status.')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No courses found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Teacher</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{course.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {course.teacherId?.name || course.teacherId?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {course.isApproved ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Approved
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!course.isApproved ? (
                          <button
                            onClick={() => handleApproval(course._id, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-medium"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproval(course._id, false)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-xs font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
