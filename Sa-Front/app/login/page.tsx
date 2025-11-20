import { Suspense } from 'react'

// Render the client-only login form inside a Suspense boundary to avoid CSR bailout
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
