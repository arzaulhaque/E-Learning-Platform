import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function LectureSection({ courseId }) {
  const [lectures, setLectures] = useState([])
  const [form, setForm] = useState({ title: '', videoUrl: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  async function fetchLectures() {
    try {
      const { data } = await api.get(`/lectures/course/${courseId}`)
      setLectures(data.data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => { fetchLectures() }, [courseId])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/lectures', { courseId, ...form })
      setForm({ title: '', videoUrl: '', description: '' })
      setShowForm(false)
      await fetchLectures()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture.')
    }
  }

  async function handleDelete(lectureId) {
    if (!confirm('Delete this lecture?')) return
    try {
      await api.delete(`/lectures/${lectureId}`)
      await fetchLectures()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lecture.')
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-700">Lectures</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100"
        >
          {showForm ? 'Cancel' : '+ Add Lecture'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <input
            type="text" placeholder="Title" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            type="text" placeholder="Video URL" value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <textarea
            placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm" rows={2}
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700">
            Add
          </button>
        </form>
      )}

      {lectures.length === 0 ? (
        <p className="text-xs text-gray-400">No lectures added yet.</p>
      ) : (
        <ul className="space-y-1">
          {lectures.map((l) => (
            <li key={l._id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
              <span className="font-medium text-gray-700">{l.title}</span>
              <button onClick={() => handleDelete(l._id)} className="text-red-400 hover:text-red-600 text-xs ml-2">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AssignmentSection({ courseId }) {
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState({ title: '', question: '', dueDate: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [gradeForms, setGradeForms] = useState({})

  async function fetchAssignments() {
    try {
      const { data } = await api.get(`/assignments/course/${courseId}`)
      setAssignments(data.data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => { fetchAssignments() }, [courseId])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { courseId, title: form.title, question: form.question }
      if (form.dueDate) payload.dueDate = form.dueDate
      await api.post('/assignments', payload)
      setForm({ title: '', question: '', dueDate: '' })
      setShowForm(false)
      await fetchAssignments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add assignment.')
    }
  }

  async function handleDelete(assignmentId) {
    if (!confirm('Delete this assignment?')) return
    try {
      await api.delete(`/assignments/${assignmentId}`)
      await fetchAssignments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment.')
    }
  }

  function setGradeField(assignmentId, subId, field, value) {
    const key = `${assignmentId}_${subId}`
    setGradeForms((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }))
  }

  async function handleGrade(assignmentId, subId) {
    const key = `${assignmentId}_${subId}`
    const { grade, feedback } = gradeForms[key] || {}
    if (grade === undefined || grade === '') return alert('Enter a grade.')
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${subId}/grade`, { grade, feedback })
      await fetchAssignments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade.')
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-700">Assignments</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100"
        >
          {showForm ? 'Cancel' : '+ Add Assignment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <input
            type="text" placeholder="Title" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <textarea
            placeholder="Question" required value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm" rows={2}
          />
          <input
            type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">
            Add
          </button>
        </form>
      )}

      {assignments.length === 0 ? (
        <p className="text-xs text-gray-400">No assignments added yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a._id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-700 text-sm">{a.title}</span>
                <button onClick={() => handleDelete(a._id)} className="text-red-400 hover:text-red-600 text-xs">
                  Delete
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">{a.question}</p>

              {a.submissions && a.submissions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Submissions ({a.submissions.length})</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-white">
                          <th className="text-left px-2 py-1 border border-gray-100">Student</th>
                          <th className="text-left px-2 py-1 border border-gray-100">File</th>
                          <th className="text-left px-2 py-1 border border-gray-100">Grade</th>
                          <th className="text-left px-2 py-1 border border-gray-100">Feedback</th>
                          <th className="text-left px-2 py-1 border border-gray-100"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.submissions.map((sub) => {
                          const key = `${a._id}_${sub._id}`
                          return (
                            <tr key={sub._id}>
                              <td className="px-2 py-1 border border-gray-100">
                                {sub.studentId?.name || sub.studentId?.email || 'Unknown'}
                              </td>
                              <td className="px-2 py-1 border border-gray-100">
                                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View</a>
                              </td>
                              <td className="px-2 py-1 border border-gray-100">
                                <input
                                  type="number"
                                  defaultValue={sub.grade ?? ''}
                                  placeholder="Grade"
                                  onChange={(e) => setGradeField(a._id, sub._id, 'grade', e.target.value)}
                                  className="w-16 border border-gray-200 rounded px-1 py-0.5"
                                />
                              </td>
                              <td className="px-2 py-1 border border-gray-100">
                                <input
                                  type="text"
                                  defaultValue={sub.feedback || ''}
                                  placeholder="Feedback"
                                  onChange={(e) => setGradeField(a._id, sub._id, 'feedback', e.target.value)}
                                  className="w-24 border border-gray-200 rounded px-1 py-0.5"
                                />
                              </td>
                              <td className="px-2 py-1 border border-gray-100">
                                <button
                                  onClick={() => handleGrade(a._id, sub._id)}
                                  className="bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EnrolledStudents({ courseId }) {
  const [students, setStudents] = useState([])

  useEffect(() => {
    api.get(`/enrollments/course/${courseId}`)
      .then(({ data }) => setStudents(data.data))
      .catch(() => {})
  }, [courseId])

  if (students.length === 0) return <p className="text-xs text-gray-400 mt-2">No students enrolled.</p>

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-gray-700 mb-2">Enrolled Students ({students.length})</h4>
      <ul className="space-y-1">
        {students.map((e, i) => (
          <li key={i} className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-1">
            {e.studentId?.name || 'Unknown'} — {e.studentId?.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [createForm, setCreateForm] = useState({ title: '', description: '' })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState('')

  async function fetchCourses() {
    setLoading(true)
    try {
      const { data } = await api.get('/courses')
      const myCourses = data.data.filter((c) => {
        const teacherId = c.teacherId?._id || c.teacherId
        return teacherId === user?._id
      })
      setCourses(myCourses)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    try {
      await api.post('/courses', createForm)
      setCreateForm({ title: '', description: '' })
      setShowCreateForm(false)
      await fetchCourses()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create course.')
    }
  }

  async function handleEdit(courseId) {
    try {
      await api.put(`/courses/${courseId}`, editForm)
      setEditingCourse(null)
      await fetchCourses()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course.')
    }
  }

  async function handleDelete(courseId) {
    if (!confirm('Delete this course? This cannot be undone.')) return
    try {
      await api.delete(`/courses/${courseId}`)
      await fetchCourses()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course.')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Course</h2>
          {createError && <p className="text-red-500 text-sm mb-3">{createError}</p>}
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text" placeholder="Course title" required value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Course description" value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3}
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium">
              Create Course
            </button>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">You have not created any courses yet.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {editingCourse === course._id ? (
                <div className="space-y-3 mb-4">
                  <input
                    type="text" value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(course._id)} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm">
                      Save
                    </button>
                    <button onClick={() => setEditingCourse(null)} className="bg-gray-100 text-gray-700 px-4 py-1 rounded hover:bg-gray-200 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{course.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${course.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {course.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => { setEditingCourse(course._id); setEditForm({ title: course.title, description: course.description }) }}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(course._id)} className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 text-sm">
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                      className="bg-gray-50 text-gray-600 px-3 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      {expandedCourse === course._id ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
              )}

              {expandedCourse === course._id && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <LectureSection courseId={course._id} />
                  <div className="border-t border-gray-100 pt-4">
                    <AssignmentSection courseId={course._id} />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <EnrolledStudents courseId={course._id} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
