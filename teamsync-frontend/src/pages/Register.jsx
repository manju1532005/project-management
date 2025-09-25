import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'

export default function Register() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-accent/30 via-accent2/20 to-surface">
      <div className="w-[90%] max-w-md rounded-xl2 bg-panel/90 p-8 border border-gray-800 shadow-soft">
        <h1 className="text-2xl font-bold mb-6 text-center">Create your account</h1>
        <div className="space-y-3">
          <Input placeholder="Full Name" />
          <Input type="email" placeholder="Email Address" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full" onClick={() => nav('/tasks')}>Create Account</Button>
        </div>
        <p className="text-center text-sm text-gray-300 mt-4">
          Already have an account? <Link className="text-accent" to="/">Sign in</Link>
        </p>
      </div>
    </div>
  )
}