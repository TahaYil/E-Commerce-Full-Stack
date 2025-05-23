import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

  
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId); 


      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="auth-container no-scroll">
      <div className="auth-card">
        <h2>BUCATA</h2>
        <h3>Giriş Yap</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="divider">
          <span>veya</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-auth-button"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="google-icon"
          />
          Google ile Giriş Yap
        </button>
        
        <p className="auth-redirect">
          Hesabınız yok mu? <Link to="/auth/register" state={{ from: location.state?.from }}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
