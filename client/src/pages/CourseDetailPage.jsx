import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitForms, setSubmitForms] = useState({})
  const [gradeForms, setGradeForms] = useState({})

  async function fetchAll() {
    setLoading(true)
    try {
      const [courseRes, lecturesRes, assignmentsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lectures/course/${id}`),
        api.get(`/assignments/course/${id}`),
      ])
      setCourse(courseRes.data)
      setLectures(lecturesRes.data)
      setAssignments(assignmentsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  async function handleSubmitAssignment(assignmentId) {
    const fileUrl = submitForms[assignmentId] || ''
    if (!fileUrl) return alert('Please enter a file URL.')
    try {
      await api.post(`/assignments/${assignmentId}/submit`, { fileUrl })
      setSubmitForms((prev) => ({ ...prev, [assignmentId]: '' }))
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment.')
    }
  }

  async function handleGrade(assignmentId, subId) {
    const key = `${assignmentId}_${subId}`
    const { grade, feedback } = gradeForms[key] || {}
    if (grade === undefined || grade === '') return alert('Please enter a grade.')
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${subId}/grade`, { grade, feedback })
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade.')
    }
  }

  function setGradeField(assignmentId, subId, field, value) {
    const key = `${assignmentId}_${subId}`
    setGradeForms((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }))
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>
  if (!course) return null

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin'
  const isStudent = user?.role === 'student'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-3">{course.description}</p>
            {course.teacherId && (
              <p className="text-sm text-gray-400">
                Teacher: {course.teacherId.name || course.teacherId.email}
              </p>
            )}
          </div>
          {course.isApproved ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Approved</span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Pending</span>
          )}
        </div>
      </div>

      {/* Lectures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Lectures</h2>
        {lectures.length === 0 ? (
          <p className="text-gray-500">No lectures yet.</p>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture) => (
              <div key={lecture._id} className="border border-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{lecture.title}</h3>
                {lecture.description && <p className="text-sm text-gray-600 mb-2">{lecture.description}</p>}
                {lecture.videoUrl && (
                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    Watch Video →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet.</p>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="border border-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{assignment.question}</p>
                {assignment.dueDate && (
                  <p className="text-xs text-gray-400 mb-3">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                )}

                {/* Student view */}
                {isStudent && (
                  <div>
                    {assignment.submissions && assignment.submissions.length > 0 ? (
                      <div className="bg-green-50 border border-green-100 rounded-md p-3">
                        <p className="text-sm text-green-700 font-medium">Submitted</p>
                        <a
                          href={assignment.submissions[0].fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          {assignment.submissions[0].fileUrl}
                        </a>
                        {assignment.submissions[0].grade !== undefined && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Grade: {assignment.submissions[0].grade}</p>
                            {assignment.submissions[0].feedback && (
                              <p className="text-sm text-gray-600">Feedback: {assignment.submissions[0].feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Enter file URL"
                          value={submitForms[assignment._id] || ''}
                          onChange={(e) =>
                            setSubmitForms((prev) => ({ ...prev, [assignment._id]: e.target.value }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleSubmitAssignment(assignment._id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher/Admin view */}
                {isTeacherOrAdmin && assignment.submissions && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Submissions ({assignment.submissions.length})
                    </p>
                    {assignment.submissions.length === 0 ? (
                      <p className="text-sm text-gray-400">No submissions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-3 py-2 border border-gray-100">Student</th>
                              <th className="text-left px-3 py-2 border border-gray-100">File</th>
                              <th className="text-left px-3 py-2 border border-gray-100">Grade</th>
                              <th className="text-left px-3 py-2 border border-gray-100">Feedback</th>
                              <th className="text-left px-3 py-2 border border-gray-100">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignment.submissions.map((sub) => {
                              const key = `${assignment._id}_${sub._id}`
                              return (
                                <tr key={sub._id} className="border-b border-gray-100">
                                  <td className="px-3 py-2 border border-gray-100">
                                    {sub.studentId?.name || sub.studentId?.email || 'Unknown'}
                                  </td>
                                  <td className="px-3 py-2 border border-gray-100">
                                    <a
                                      href={sub.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:underline"
                                    >
                                      View
                                    </a>
                                  </td>
                                  <td className="px-3 py-2 border border-gray-100">
                                    <input
                                      type="number"
                                      placeholder={sub.grade ?? 'Grade'}
                                      defaultValue={sub.grade ?? ''}
                                      onChange={(e) => setGradeField(assignment._id, sub._id, 'grade', e.target.value)}
                                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-100">
                                    <input
                                      type="text"
                                      placeholder={sub.feedback || 'Feedback'}
                                      defaultValue={sub.feedback || ''}
                                      onChange={(e) => setGradeField(assignment._id, sub._id, 'feedback', e.target.value)}
                                      className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-100">
                                    <button
                                      onClick={() => handleGrade(assignment._id, sub._id)}
                                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-medium"
                                    >
                                      Save
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
