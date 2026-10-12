import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  deleteMyAccount,
  deleteSubject,
  getCurrentTeacher,
  updateCurrentTeacher,
  updateSubject,
  uploadTeacherImage,
} from '../services/api'
import anonymousTeacherImage from '../assets/anonimus.png'

const IMAGE_BASE_URL = 'http://localhost:8080'

function normalizeTeacher(data) {
  if (!data || typeof data !== 'object') {
    return null
  }

  return {
    id: data.id || data.teacherId || null,
    name: data.name || data.teacherName || '',
    email: data.email || '',
    phone: data.phone || '',
    city: data.city || '',
    description: data.description || '',
    imageUrl: data.imageUrl || '',
  }
}

function getTeacherImageSrc(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  return imageUrl.startsWith('http') ? imageUrl : `${IMAGE_BASE_URL}${imageUrl}`
}

function normalizeSubject(subject) {
  return {
    id: subject.id || subject.subjectId || subject._id || null,
    name: subject.name || '',
    availableDays: subject.availableDays || '',
    availableHours: subject.availableHours || '',
    price: subject.price ?? 0,
  }
}

function extractSubjects(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.subjects)) {
    return payload.subjects
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.content)) {
    return payload.content
  }

  return []
}

async function fetchMySubjects(token) {
  if (!token) {
    throw new Error('Missing authentication token.')
  }

  const response = await fetch('http://localhost:8080/api/subjects/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : []

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load your subjects.')
  }

  return extractSubjects(data).map(normalizeSubject)
}

function TeacherProfile({ token, onAccountDeleted }) {
  const location = useLocation()
  const navigate = useNavigate()
  const mySubjectsRef = useRef(null)
  const handledReturnStateRef = useRef(false)
  const [teacher, setTeacher] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [editingSubjectId, setEditingSubjectId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    city: '',
    description: '',
  })
  const [editForm, setEditForm] = useState({
    name: '',
    availableDays: '',
    availableHours: '',
    price: 0,
  })

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setError('')

      const storedProfile = localStorage.getItem('teacherProfile')

      if (storedProfile) {
        try {
          setTeacher(JSON.parse(storedProfile))
        } catch {
          localStorage.removeItem('teacherProfile')
        }
      }

      try {
        const [teacherResult, subjectsResult] = await Promise.allSettled([getCurrentTeacher(), fetchMySubjects(token)])

        const teacherData = teacherResult.status === 'fulfilled' ? teacherResult.value : null
        const normalizedSubjects = subjectsResult.status === 'fulfilled' ? subjectsResult.value : []

        const normalizedTeacher = normalizeTeacher(teacherData)

        if (normalizedTeacher) {
          setTeacher(normalizedTeacher)
          setProfileForm({
            name: normalizedTeacher.name || '',
            phone: normalizedTeacher.phone || '',
            city: normalizedTeacher.city || '',
            description: normalizedTeacher.description || '',
          })
          localStorage.setItem('teacherProfile', JSON.stringify(normalizedTeacher))
          if (normalizedTeacher.name) {
            localStorage.setItem('teacherName', normalizedTeacher.name)
          }
        }

        setSubjects(normalizedSubjects)

        if (subjectsResult.status === 'rejected') {
          setError(subjectsResult.reason?.message || 'Failed to load your subjects.')
        }
      } catch {
        setError('Unable to load your personal area right now.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  useEffect(() => {
    const shouldShowStatus = Boolean(location.state?.statusMessage)
    const shouldScrollToSubjects = Boolean(location.state?.scrollToSubjects)

    if (!shouldShowStatus && !shouldScrollToSubjects) {
      return
    }

    if (shouldShowStatus) {
      setStatusMessage(location.state.statusMessage)
    }

    if (loading || handledReturnStateRef.current) {
      return
    }

    if (shouldScrollToSubjects && mySubjectsRef.current) {
      mySubjectsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

    handledReturnStateRef.current = true
    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [loading, location.pathname, location.state, navigate])

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl)
      }
    }
  }, [previewImageUrl])

  function beginEdit(subject) {
    setEditingSubjectId(subject.id)
    setEditForm({
      name: subject.name || '',
      availableDays: subject.availableDays || '',
      availableHours: subject.availableHours || '',
      price: Number(subject.price) || 0,
    })
    setStatusMessage('')
    setError('')
  }

  function beginProfileEdit() {
    setProfileForm({
      name: teacher?.name || '',
      phone: teacher?.phone || '',
      city: teacher?.city || '',
      description: teacher?.description || '',
    })
    setIsEditingProfile(true)
    setStatusMessage('')
    setError('')
  }

  function cancelProfileEdit() {
    setProfileForm({
      name: teacher?.name || '',
      phone: teacher?.phone || '',
      city: teacher?.city || '',
      description: teacher?.description || '',
    })
    setIsEditingProfile(false)
  }

  function cancelEdit() {
    setEditingSubjectId(null)
    setEditForm({
      name: '',
      availableDays: '',
      availableHours: '',
      price: 0,
    })
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((current) => ({
      ...current,
      [name]: name === 'price' ? Number(value) : value,
    }))
  }

  function handleProfileChange(event) {
    const { name, value } = event.target

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleProfileUpdate() {
    setError('')
    setStatusMessage('')

    try {
      setIsSavingProfile(true)

      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        description: profileForm.description.trim(),
      }

      const response = await updateCurrentTeacher(payload)
      const normalizedTeacher = normalizeTeacher(response) || {
        ...(teacher || {}),
        ...payload,
      }

      setTeacher(normalizedTeacher)
      setProfileForm({
        name: normalizedTeacher.name || '',
        phone: normalizedTeacher.phone || '',
        city: normalizedTeacher.city || '',
        description: normalizedTeacher.description || '',
      })
      localStorage.setItem('teacherProfile', JSON.stringify(normalizedTeacher))
      localStorage.setItem('teacherName', normalizedTeacher.name || '')
      localStorage.setItem('name', normalizedTeacher.name || '')
      setStatusMessage('Profile updated successfully.')
      setIsEditingProfile(false)
    } catch (updateError) {
      setError(updateError.message || 'Failed to update your profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSubjectUpdate(subjectId) {
    setError('')
    setStatusMessage('')

    try {
      const updatedSubject = {
        name: editForm.name.trim(),
        availableDays: editForm.availableDays.trim(),
        availableHours: editForm.availableHours.trim(),
        price: Number(editForm.price) || 0,
      }

      await updateSubject(subjectId, updatedSubject)

      setSubjects((current) =>
        current.map((subject) => (subject.id === subjectId ? { ...subject, ...updatedSubject } : subject)),
      )
      setStatusMessage('Subject updated successfully.')
      cancelEdit()
    } catch {
      setError('Failed to update this subject.')
    }
  }

  async function handleSubjectDelete(subjectId) {
    const confirmed = window.confirm('Delete this subject?')

    if (!confirmed) {
      return
    }

    setError('')
    setStatusMessage('')

    try {
      await deleteSubject(subjectId)
      setSubjects((current) => current.filter((subject) => subject.id !== subjectId))
      setStatusMessage('Subject deleted successfully.')
    } catch {
      setError('Failed to delete this subject.')
    }
  }

  async function handleAccountDelete() {
    const confirmed = window.confirm('Delete your account permanently?')

    if (!confirmed) {
      return
    }

    setError('')
    setStatusMessage('')

    try {
      await deleteMyAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('teacherName')
      localStorage.removeItem('teacherProfile')

      if (onAccountDeleted) {
        onAccountDeleted()
      }
    } catch {
      setError('Failed to delete your account.')
    }
  }

  function handleImageSelection(event) {
    const file = event.target.files?.[0]

    setError('')
    setStatusMessage('')

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
    }

    if (!file) {
      setSelectedImage(null)
      setPreviewImageUrl('')
      return
    }

    setSelectedImage(file)
    setPreviewImageUrl(URL.createObjectURL(file))
  }

  async function handleImageUpload() {
    if (!selectedImage) {
      setError('Please choose an image before uploading.')
      return
    }

    setIsUploadingImage(true)
    setError('')
    setStatusMessage('')

    try {
      const response = await uploadTeacherImage(selectedImage, token)
      const nextImageUrl = response?.imageUrl || response?.data?.imageUrl || response?.teacher?.imageUrl || ''

      if (!nextImageUrl) {
        throw new Error('Upload succeeded, but no image URL was returned.')
      }

      setTeacher((current) => {
        const updatedTeacher = {
          ...(current || {}),
          imageUrl: nextImageUrl,
        }

        localStorage.setItem('teacherProfile', JSON.stringify(updatedTeacher))
        return updatedTeacher
      })

      setSelectedImage(null)
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl)
      }
      setPreviewImageUrl('')
      setStatusMessage('Profile image updated successfully.')
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload profile image.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const profileImageSrc = previewImageUrl || getTeacherImageSrc(teacher?.imageUrl)
  const isProfileStatusMessage =
    statusMessage === 'Profile updated successfully.'
    || statusMessage === 'Profile image updated successfully.'

  return (
    <section className="page-card teacher-profile-page">
      <h1 className="section-title">My Personal Area</h1>
      <p className="section-text">See your teacher details, manage the subjects you created, and update your account.</p>

      {loading && <p className="teacher-loading">Loading your profile...</p>}

      {!loading && (
        <>
          <section className="profile-panel">
            <div className="profile-panel__header">
              <h2 className="profile-panel__title">My Details</h2>
            </div>

            <div className="profile-image-section">
              <img
                className="profile-image"
                src={profileImageSrc || anonymousTeacherImage}
                alt={`${teacher?.name || 'Teacher'} profile`}
              />

              <div className="profile-image-upload">
                <label className="field-label" htmlFor="teacher-image-upload">
                  Profile image
                </label>
                <input
                  id="teacher-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  disabled={isUploadingImage}
                />
                <button
                  type="button"
                  className="nav-button nav-button--add"
                  onClick={handleImageUpload}
                  disabled={!selectedImage || isUploadingImage}
                >
                  {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="form-layout">
                <div className="profile-details">
                  <div className="field-group">
                    <label className="field-label" htmlFor="profile-name">
                      Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="profile-detail">
                    <span className="teacher-label">Email</span>
                    <span>{teacher?.email || '-'}</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="profile-phone">
                      Phone
                    </label>
                    <input
                      id="profile-phone"
                      type="text"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="profile-city">
                      City
                    </label>
                    <input
                      id="profile-city"
                      type="text"
                      name="city"
                      value={profileForm.city}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="field-group profile-detail--full">
                    <label className="field-label" htmlFor="profile-description">
                      Description
                    </label>
                    <textarea
                      id="profile-description"
                      name="description"
                      rows="4"
                      value={profileForm.description}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="subject-card__actions">
                  <button
                    type="button"
                    className="nav-button nav-button--add"
                    onClick={handleProfileUpdate}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Details'}
                  </button>
                  <button
                    type="button"
                    className="nav-button nav-button--ghost"
                    onClick={cancelProfileEdit}
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-details">
                  <div className="profile-detail">
                    <span className="teacher-label">Name</span>
                    <strong>{teacher?.name || localStorage.getItem('teacherName') || '-'}</strong>
                  </div>
                  <div className="profile-detail">
                    <span className="teacher-label">Email</span>
                    <span>{teacher?.email || '-'}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="teacher-label">Phone</span>
                    <span>{teacher?.phone || '-'}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="teacher-label">City</span>
                    <span>{teacher?.city || '-'}</span>
                  </div>
                  <div className="profile-detail profile-detail--full">
                    <span className="teacher-label">Description</span>
                    <span>{teacher?.description || '-'}</span>
                  </div>
                </div>

                <div className="subject-card__actions profile-panel__actions">
                  <button type="button" className="nav-button nav-button--ghost" onClick={beginProfileEdit}>
                    Edit Details
                  </button>
                </div>
              </>
            )}
          </section>

          {isProfileStatusMessage && <p className="message success">{statusMessage}</p>}

          <section ref={mySubjectsRef} className="profile-panel">
            <div className="profile-panel__header">
              <h2 className="profile-panel__title">My Subjects</h2>
            </div>

            {subjects.length === 0 ? (
              <p className="teacher-empty">No subjects found for this teacher yet.</p>
            ) : (
              <div className="subject-stack">
                {subjects.map((subject, index) => {
                  const isEditing = editingSubjectId === subject.id

                  return (
                    <article
                      key={subject.id || `${subject.name}-${index}`}
                      className={`subject-card ${isEditing ? 'is-editing' : ''}`}
                    >
                      {isEditing ? (
                        <div className="form-layout">
                          <input
                            type="text"
                            name="name"
                            placeholder="Subject name"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                          <input
                            type="text"
                            name="availableDays"
                            placeholder="Available days"
                            value={editForm.availableDays}
                            onChange={handleEditChange}
                          />
                          <input
                            type="text"
                            name="availableHours"
                            placeholder="Available hours"
                            value={editForm.availableHours}
                            onChange={handleEditChange}
                          />
                          <input
                            type="number"
                            name="price"
                            min="0"
                            step="1"
                            placeholder="Price"
                            value={editForm.price}
                            onChange={handleEditChange}
                          />
                          <div className="subject-card__actions">
                            <button
                              type="button"
                              className="nav-button nav-button--add"
                              onClick={() => handleSubjectUpdate(subject.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="nav-button nav-button--ghost"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="subject-card__content">
                            <div className="profile-detail">
                              <span className="teacher-label">Subject</span>
                              <strong>{subject.name || '-'}</strong>
                            </div>
                            <div className="profile-detail">
                              <span className="teacher-label">Days</span>
                              <span>{subject.availableDays || '-'}</span>
                            </div>
                            <div className="profile-detail">
                              <span className="teacher-label">Hours</span>
                              <span>{subject.availableHours || '-'}</span>
                            </div>
                            <div className="profile-detail">
                              <span className="teacher-label">Price</span>
                              <span>
                                {Number(subject.price) || 0}
                                {' '}
                                {'\u20AA'}
                              </span>
                            </div>
                          </div>

                          <div className="subject-card__actions">
                            <button
                              type="button"
                              className="nav-button nav-button--ghost"
                              onClick={() => beginEdit(subject)}
                              disabled={!subject.id}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="nav-button nav-button--logout"
                              onClick={() => handleSubjectDelete(subject.id)}
                              disabled={!subject.id}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  )
                })}
              </div>
            )}

            <Link className="profile-add-subject-button" to="/add">
              Add Subject
            </Link>
          </section>

          {!isProfileStatusMessage && statusMessage && <p className="message success">{statusMessage}</p>}

          <section className="profile-panel profile-panel--danger">
            <div className="profile-panel__header">
              <h2 className="profile-panel__title">Danger Zone</h2>
            </div>
            <p className="section-text profile-panel__text">
              Delete your account permanently. This action cannot be undone.
            </p>
            <button type="button" className="nav-button nav-button--logout profile-delete-account" onClick={handleAccountDelete}>
              Delete Account
            </button>
          </section>

          {error && <p className="message error">{error}</p>}
        </>
      )}
    </section>
  )
}

export default TeacherProfile
