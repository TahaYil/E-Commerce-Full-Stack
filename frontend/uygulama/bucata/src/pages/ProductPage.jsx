import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductPage.css';
import axios from '../service/axiosConfig';
import { Rating } from '@mui/material';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];
  
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        // Ürün bilgilerini getir
        const response = await fetch(`http://localhost:8080/product/${id}`);
        if (!response.ok) {
          throw new Error(`Ürün bulunamadı (Status: ${response.status})`);
        }
        const data = await response.json();
        setProduct(data);

        // Yorumları getir
        try {
          const reviewsResponse = await fetch(`http://localhost:8080/review/product/${id}`);
          
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setComments(reviewsData);
            
            // Ortalama puanı hesapla
            if (reviewsData.length > 0) {
              const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
              setAverageRating(totalRating / reviewsData.length);
            } else {
              setComments([]);
              setAverageRating(0);
            }
          } else if (reviewsResponse.status === 204) {
            setComments([]);
            setAverageRating(0);
          }
        } catch (reviewError) {
          console.error('Yorumlar alınırken hata oluştu:', reviewError);
          setComments([]);
          setAverageRating(0);
        }

        if (sizes.length > 0) {
          setSelectedSize(sizes[2]);
        }
      } catch (err) {
        console.error('Ürün verisi alınırken hata:', err);
        setError(`Ürün verisi alınamadı: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Lütfen beden seçiniz');
      return;
    }
    const stock = getSelectedSizeStock();
    if (quantity > stock) {
      alert(`Seçili beden için en fazla ${stock} adet ekleyebilirsiniz.`);
      return;
    }

    if (!product || !product.id || !product.name || !product.price) {
      alert('Ürün bilgileri eksik veya hatalı');
      return;
    }

    const existingCartJSON = localStorage.getItem('cartItems');
    const existingCart = existingCartJSON ? JSON.parse(existingCartJSON) : [];

    const existingItemIndex = existingCart.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity: quantity,
        image: product.imageUrl || getProductImageUrl(product),
        sizeStock: product.sizeStocks ? product.sizeStocks[selectedSize] : undefined
      };
      existingCart.push(cartItem);
    }

    localStorage.setItem('cartItems', JSON.stringify(existingCart));
    alert(`${product.name} sepete eklendi!\nBeden: ${selectedSize}, Miktar: ${quantity}`);
  };
  
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Lütfen beden seçiniz');
      return;
    }
    handleAddToCart();
    navigate('/cart');
  };

  const increaseQuantity = () => {
    const stock = getSelectedSizeStock();
    setQuantity(prev => (prev < stock ? prev + 1 : prev));
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getProductImageUrl = (product) => {
    let productImageUrl = '/api/placeholder/600/600';

    if (product.image) {
      try {
        if (typeof product.image === 'string') {
          productImageUrl = `data:image/jpeg;base64,${product.image}`;
        } else if (Array.isArray(product.image) || (product.image instanceof Uint8Array)) {
          const bytes = Array.isArray(product.image) ? new Uint8Array(product.image) : product.image;
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          productImageUrl = `data:image/jpeg;base64,${btoa(binary)}`;
        } else if (typeof product.image === 'object' && product.image !== null) {
          const imageData = product.image.data || product.image;
          let binary = '';
          const bytes = new Uint8Array(imageData);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          productImageUrl = `data:image/jpeg;base64,${btoa(binary)}`;
        }
      } catch (e) {
        productImageUrl = `/api/placeholder/600/600`;
      }
    }

    return productImageUrl;
  };

  const getSelectedSizeStock = () => {
    if (!product || !product.sizeStocks) return 0;
    return product.sizeStocks[selectedSize] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Tarih formatı hatası:', e);
      return 'Tarih belirtilmemiş';
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Hata</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return <div className="error">Ürün bulunamadı</div>;
  }

  const productImageUrl = getProductImageUrl(product);

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-gallery">
          <div className="gallery-main">
            <img src={productImageUrl} alt={product.name} />
          </div>
        </div>
        
        <div className="product-info">
          <div className="product-brand">Bucata</div>
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">₺{product.price.toFixed(2)}</div>

          <div className="product-options">
            <div className="option-group">
              <h3>Beden</h3>
              <div className="size-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {sizes.map((size) => {
                  const isOutOfStock = !product.sizeStocks || !product.sizeStocks[size] || product.sizeStocks[size] <= 0;
                  return (
                    <div 
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      style={{ 
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.5 : 1
                      }}
                    >
                      {size}
                    </div>
                  );
                })}
              </div>
  
            </div>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={decreaseQuantity}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity}>+</button>
            </div>
            <button className="add-to-cart" onClick={handleAddToCart}>SEPETE EKLE</button>
            <button className="buy-now" onClick={handleBuyNow}>HEMEN AL</button>
          </div>

          <div className="product-info-additional">
            <div className="shipping-info">
              <span className="icon">🚚</span>
              <span>1500₺ üzeri kargo bedava</span>
            </div>
            <div className="brand-info">
              <span className="icon">Ⓒ</span>
              <span>Bucata Özel Tasarımı</span>
            </div>
          </div>

        </div>
      </div>

      <div className="product-details">
        <div className="details-tabs">
          <button 
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Ürün Açıklaması
          </button>
          <button 
            className={activeTab === 'comments' ? 'active' : ''}
            onClick={() => setActiveTab('comments')}
          >
            Yorumlar ({comments.length})
          </button>
          <button 
            className={activeTab === 'shipping' ? 'active' : ''}
            onClick={() => setActiveTab('shipping')}
          >
            Kargo ve İade
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h2>{product.name}</h2>
              <p>{product.description || "Ürün açıklaması mevcut değil."}</p>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-content">
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="commenter-name">{comment.userEmail || 'Anonim Kullanıcı'}</div>
                        <div className="comment-date">
                          {formatDate(comment.date)}
                        </div>
                      </div>
                      <div className="comment-rating">
                        <Rating 
                          value={comment.rating} 
                          readOnly 
                          precision={0.5}
                          sx={{ color: '#00bcd4' }}
                        />
                      </div>
                      <div className="comment-text">{comment.comment}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">Henüz yorum bulunmuyor.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="shipping-content">
              <h3>Kargo Bilgileri</h3>
              <p>Siparişleriniz 1-3 iş günü içerisinde kargoya verilir.</p>
              <p>1500₺ üzeri siparişlerde kargo ücretsizdir.</p>
              <h3>İade Politikası</h3>
              <p>Ürünlerinizi teslim aldıktan sonra 14 gün içerisinde iade edebilirsiniz.</p>
              <p>İade etmek istediğiniz ürünlerin kullanılmamış ve orijinal ambalajında olması gerekmektedir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
