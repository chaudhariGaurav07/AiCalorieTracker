const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1'

export const loginUser = async ({
  email,
  password
}: {
  email: string
  password: string
}) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
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
  