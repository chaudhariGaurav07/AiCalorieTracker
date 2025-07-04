const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1'

export const loginUser = async ({
  identifier,
  password
}: {
  identifier: string
  password: string
}) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: identifier, // backend accepts either email or username
      username: identifier,
      password
    })
  })

  return await res.json()
}


export const registerUser = async ({
    username,
    email,
    password
  }: {
    username: string
    email: string
    password: string
  }) => {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })
  
    return await res.json()
  }
  

export const addMealEntry = async (mealText: string, token: string) => {
    const res = await fetch(`${BASE_URL}/ai/parse-food`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mealText })
    })
  
    return await res.json()
  }
  
  export const forgotPasswordRequest = async (email: string) => {
  const res = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return await res.json()
}
