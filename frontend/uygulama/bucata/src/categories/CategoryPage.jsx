import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProducts([]);
    setCategoryData(null);

    const fetchCategoryData = async () => {
      try {
        const categoryResponse = await axios.get(`http://localhost:8080/category/${categoryId}`);
        setCategoryData(categoryResponse.data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Kategori bilgileri yüklenemedi');
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsResponse = await axios.get(`http://localhost:8080/product/category/${categoryId}`);
        setProducts(productsResponse.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Ürünler yüklenemedi');
        } finally {
        setLoading(false);
      }
    };
    const loadData = async () => {
      await Promise.all([fetchCategoryData(), fetchProducts()]);
    };

    loadData();  
  }, [categoryId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-container">
        <div className="category-header">
          <h1 className="category-title">{categoryData ? categoryData.name : 'Kategori'}</h1>
          <p className="product-count">{products.length} ürün</p>
        </div>

        {products.length === 0 ? (
          <div className="empty-products">
            <p>Bu kategoride henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <div className="product-card">
                  <div className="product-image-wrapper">
                    <img
                      src={`http://localhost:8080/product/${product.id}/image`}
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
                        ₺{product.price ? product.price.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;