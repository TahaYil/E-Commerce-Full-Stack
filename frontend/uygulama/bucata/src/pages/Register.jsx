import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    

    if (!gender) {
      setError('Lütfen cinsiyet seçiniz.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post('/auth/signup', {
        email,
        password,
        gender 
      });
      
      const loginResponse = await axios.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('userId', loginResponse.data.userId);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container no-scroll">
      <div className="auth-card">
        <h2>BUCATA</h2>
        <h3>Kayıt Ol</h3>
        
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Cinsiyet</label>
            <div className="modern-radio-container">
              <div 
                className={`modern-radio-option ${gender === 'MALE' ? 'selected' : ''}`}
                onClick={() => setGender('MALE')}
              >
                <span className="modern-radio-icon">
                  <i className="gender-icon male"></i>
                </span>
                <span className="modern-radio-text">Erkek</span>
              </div>
              
              <div 
                className={`modern-radio-option ${gender === 'FEMALE' ? 'selected' : ''}`}
                onClick={() => setGender('FEMALE')}
              >
                <span className="modern-radio-icon">
                  <i className="gender-icon female"></i>
                </span>
                <span className="modern-radio-text">Kadın</span>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        
        <p className="auth-redirect">
          Zaten hesabınız var mı? <Link to="/auth/login" state={{ from: location.state?.from }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;