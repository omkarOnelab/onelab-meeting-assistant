
import LoginForm from './LoginForm';
import './Login.css';
import MeetingPreview from './MeetingPreview';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Panel - Login Form */}
        <div className="login-form-panel">
          <LoginForm />
        </div>

        {/* Right Panel - Meeting Preview */}
        <div className="meeting-preview-panel">
          <MeetingPreview />
        </div>
      </div>
    </div>
  );
};

export default Login;