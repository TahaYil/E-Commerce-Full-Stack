import React, { useRef, useState, useEffect } from 'react';
import './Home.css';
import homepageImage from '../media/homepage.png';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const featuredRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollToFeatured = () => {
    featuredRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Önce tüm ürünleri çekelim
        const response = await axios.get('http://localhost:8080/product/all');
        const allProducts = response.data;
        
        // İlk 3 ürünü alalım (veya daha az varsa hepsini)
        const productsToShow = allProducts.slice(0, 3);
        setFeaturedProducts(productsToShow);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Öne çıkan ürünler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const renderFeaturedProducts = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>{error}</p>
        </div>
      );
    }

    if (featuredProducts.length === 0) {
      return (
        <div className="error-container">
          <p>Henüz ürün bulunmamaktadır.</p>
        </div>
      );
    }

    return (
      <div className="product-grid">
        {featuredProducts.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
            <div className="product-card">
              <div className="product-image-wrapper">
                <img
                  src={product.image ? `data:image/jpeg;base64,${product.image}` : `http://localhost:8080/product/${product.id}/image`}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="product-info">
                <p className="product-brand">Bucata</p>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price-container">
                  <span className="product-price">
                    {typeof product.price === 'number' ? `₺${product.price.toFixed(2)}` : product.price}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="home-container">
      <div className="hero-section"
        style={{ backgroundImage: `url(${homepageImage})` }}
      >
        <div className="hero-content">
          <h1 className="hero-title">BUCATA</h1>
          <p className="hero-subtitle">Yeni Koleksiyon</p>
          <button className="shop-button" onClick={scrollToFeatured}>Alışverişe Başla</button>
        </div>
      </div>

      <div className="featured-products" ref={featuredRef}>
        <h2 className="section-title">Öne Çıkan Ürünler</h2>
        {renderFeaturedProducts()}
      </div>

      <div className="text-view-main">
        <h1>BUCATA: SAVAŞÇININ YOLU</h1>
        <p>
          Tarih boyunca farklı uygarlıkların farklı savaşçıları belirli kural, düstur ve yaşam kodlarıyla hayatlarını sürdürmüşlerdir.
        </p>
        <p>
          Bucata, japon savaşçısı samuraiların hayatları boyunca uyması gereken yaşam tarzı kurallarıdır. Onur, sadelik, sadakat ve savaş alanında cesaret gibi erdemler savaşçının yolu; Bucata'yı oluşturuyordu.
        </p>
        <p>
          Biz de Bucata olarak tarihin farklı uygarlıklarının savaşçılarının ruhlarını, özgürlüklerini ve cesaretlerini ürünlerimizle sizlere sunuyoruz...
        </p>
      </div>
    </div>
  );
};

export default Home;