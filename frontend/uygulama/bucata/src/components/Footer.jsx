import Logo from "../media/bucata-logo-invert.png";
import { Link } from 'react-router-dom';

import './Footer.css';

function Footer() {
    return (  
        <footer className="footer">
            <div className="footer-features">
                <div className="feature-item">
                    <div className="feature-icon">😁</div>
                    <div className="feature-text">Uygun Fiyatlar</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">🚚</div>
                    <div className="feature-text">1500₺ üzeri kargo bedava</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">©</div>
                    <div className="feature-text">Yüksek Kalite Baskı</div>
                </div>
            </div>

            <div className="footer-navigation">
                <div className="footer-column">
                    <h3>Koleksiyonlar</h3>
                    <ul>
                    <li className="footer-content"><Link to="/categories/TheKheshig">The Kheshig</Link></li>
                    <li className="footer-content"><Link to="/categories/AnatolianPars">Anatolian Pars</Link></li>
                        <li className="footer-content"><Link to="/categories/KonfuseTheKilim">Konfuse The Kilim</Link></li>
                        <li className="footer-content"><Link to="/categories/TheKhaganate">The Khaganate</Link></li>
                        <li className="footer-content"><Link to="/categories/KonfuseTheKelaynak">Konfuse The Kelaynak</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Hesabım</h3>
                    <ul>
                        <li className="footer-content"><Link to="/auth/login">Giriş Yap</Link></li>
                        <li className="footer-content"><Link to="/auth/register">Kayıt Ol</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Hakkımızda</h3>
                    <ul>
                        <li className="footer-content"><Link to="/SSS" >S.S.S</Link></li>
                        <li className="footer-content"><Link to="/blog">Blog</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>Destek</h3>
                    <ul>
                        <li className="footer-content"><Link to= "/kargo&iade">Kargo ve İade</Link></li>
                        <li className="footer-content"><Link to="/gizlilik">Gizlilik Sözleşmesi</Link></li>
                        <li className="footer-content"><Link to="/kullanici-sozlesmesi">Kullanıcı Sözleşmesi</Link></li>
                        <li className="footer-content"><Link to= "/uss">Mesafeli Satış Sözleşmesi</Link></li>
                    </ul>
                </div>

                <div className="footer-logo">
                    <img className='logo' src={Logo} alt="Bucata Logo" width="100" height="100" />
                </div>
            </div>

            <div className="footer-bottom">
                <div className="social-icons">
                    <a href="https://www.instagram.com/sinasiyurtsever/" aria-label="Instagram">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg" alt="Instagram" className="instagram-logo" />
                    </a>
                </div>

                <div className="payment-methods">
                    <img src="https://cdn.myikas.com/sf/assets/ozy/images/Visa.svg" alt="Visa" />
                    <img src="https://cdn.myikas.com/sf/assets/ozy/images/Mastercard.svg" alt="Mastercard" />
                    <img src="https://cdn.myikas.com/sf/assets/ozy/images/Maestro.svg" alt="Maestro" />
                </div>
            </div>

            <div className="copyright">
                ©2025 Tüm Hakları Saklıdır.
            </div>
        </footer>
    );
}

export default Footer;  