const API_BASE_URL = 'http://localhost:8080/api'

function parseResponseBody(text) {
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

async function request(url, options = {}) {
  const { headers = {}, ...restOptions } = options
  const isFormData = restOptions.body instanceof FormData

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      ...headers,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
  })

  const text = await response.text()
  const data = parseResponseBody(text)

  if (!response.ok) {
    throw new Error(typeof data === 'object' && data !== null ? data.message || 'Request failed' : 'Request failed')
  }

  return data
}

async function tryRequest(urls, options = {}) {
  let lastError = null

  for (const url of urls) {
    try {
      return await request(url, options)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Request failed')
}

export function registerUser(formData) {
  return request(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(formData),
  })
}

export function loginUser(formData) {
  return request(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(formData),
  })
}

export function addSubject(subjectData) {
  return request(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subjectData),
  })
}

export function getSubjects() {
  return request(`${API_BASE_URL}/subjects`)
}

export function searchSubjects(filters = {}) {
  const params = new URLSearchParams()

  if (filters.name?.trim()) {
    params.set('name', filters.name.trim())
  }

  if (filters.city?.trim()) {
    params.set('city', filters.city.trim())
  }

  if (filters.maxPrice !== '' && filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.set('maxPrice', String(filters.maxPrice))
  }

  const query = params.toString()

  return request(`${API_BASE_URL}/subjects/search${query ? `?${query}` : ''}`)
}

export function getSubjectById(subjectId) {
  return request(`${API_BASE_URL}/subjects/${subjectId}`)
}

export function getSubjectsByTeacherId(teacherId) {
  return request(`${API_BASE_URL}/subjects/teacher/${teacherId}`)
}

export function getTeachers() {
  return request(`${API_BASE_URL}/teachers`)
}

export function getTeacherById(teacherId) {
  return request(`${API_BASE_URL}/teachers/${teacherId}`, {
    cache: 'no-store',
  })
}

export function getTeacherReviews(teacherId) {
  return request(`${API_BASE_URL}/reviews/teacher/${teacherId}`)
}

export function createTeacherReview(teacherId, reviewData) {
  return request(`${API_BASE_URL}/reviews/teacher/${teacherId}`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  })
}

export function getCurrentTeacher() {
  return tryRequest(
    [
      `${API_BASE_URL}/teachers/me`,
      `${API_BASE_URL}/teacher/me`,
      `${API_BASE_URL}/auth/me`,
      `${API_BASE_URL}/profile`,
    ],
    {
      headers: getAuthHeaders(),
    },
  )
}

export function getMySubjects() {
  return request(`${API_BASE_URL}/subjects/me`, {
    headers: getAuthHeaders(),
  })
}

export function updateCurrentTeacher(teacherData) {
  return request(`${API_BASE_URL}/teachers/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: teacherData.name,
      phone: teacherData.phone,
      city: teacherData.city,
      description: teacherData.description,
    }),
  })
}

export function updateSubject(subjectId, subjectData) {
  return request(`${API_BASE_URL}/subjects/${subjectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: subjectData.name,
      availableDays: subjectData.availableDays,
      availableHours: subjectData.availableHours,
      price: Number(subjectData.price),
    }),
  })
}

export function deleteSubject(subjectId) {
  return tryRequest(
    [
      `${API_BASE_URL}/subjects/${subjectId}`,
      `${API_BASE_URL}/subject/${subjectId}`,
    ],
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  )
}

export function deleteMyAccount() {
  return tryRequest(
    [
      `${API_BASE_URL}/teachers/me`,
      `${API_BASE_URL}/teacher/me`,
      `${API_BASE_URL}/auth/me`,
      `${API_BASE_URL}/profile`,
    ],
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  )
}

export async function uploadTeacherImage(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/teachers/upload-image`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  })

  const text = await response.text()
  const data = parseResponseBody(text)

  if (!response.ok) {
    throw new Error(typeof data === 'object' && data !== null ? data.message || 'Request failed' : 'Request failed')
  }

  if (typeof data === 'string') {
    return {
      imageUrl: data,
    }
  }

  return data
}
