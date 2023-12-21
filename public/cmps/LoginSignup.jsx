import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'
import { LoginForm } from './LoginForm.jsx'

const { useState } = React

export function LoginSignup({ onSetUser }) {
  const [isSignup, setIsSignup] = useState(false)

  function onLogin(credentials) {
    isSignup ? signup(credentials) : login(credentials)
  }

  function login(credentials) {
    userService
      .login(credentials)
      .then(() => {
        showSuccessMsg('Logged in successfully')
      })
      .catch((err) => {
        showErrorMsg('Oops try again')
      })
  }

  function signup(credentials) {
    userService
      .signup(credentials)
      .then(onSetUser)
      .then(() => {
        showSuccessMsg('Signed in successfully')
      })
      .catch((err) => {
        showErrorMsg('Oops try again')
      })
  }

  return (
    <div className="login-page">
      <LoginForm onLogin={onLogin} isSignup={isSignup} />
      <div className="btns">
        <a href="#" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already a member? Login' : 'New user? Signup here'}
        </a>
      </div>
    </div>
  )
}