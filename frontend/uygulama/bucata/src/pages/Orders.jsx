import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Orders.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState({});
  const [reviewData, setReviewData] = useState({
    productId: null,
    comment: '',
    rating: 5
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState({});
  const [orderStates, setOrderStates] = useState({});
  const [orderDates, setOrderDates] = useState({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Oturum açmanız gerekiyor');
          setLoading(false);
          return;
        }
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Kullanıcı bilgisi bulunamadı');
          setLoading(false);
          return;
        }
                
        const ordersResponse = await fetch(`http://localhost:8080/ordered/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!ordersResponse.ok) {
          if (ordersResponse.status === 401) {
            throw new Error('Oturum süreniz dolmuş olabilir, lütfen tekrar giriş yapın');
          } else if (ordersResponse.status === 404 || ordersResponse.status === 204) {
            console.log('Sipariş bulunamadı');
            setOrders([]); 
            setLoading(false);
            return;
          } else {
            throw new Error(`HTTP error! Status: ${ordersResponse.status}`);
          }
        }
        
        const ordersData = await ordersResponse.json();
        console.log('Siparişler verileri:', ordersData);
        
        const ordersArray = Array.isArray(ordersData) ? ordersData : [ordersData];
        setOrders(ordersArray);
        
        // Her sipariş için durum ve tarih bilgilerini al
        for (const order of ordersArray) {
          setOrderStates(prev => ({
            ...prev,
            [order.id]: order.state
          }));
          
          setOrderDates(prev => ({
            ...prev,
            [order.id]: order.date
          }));

          // Ürün bilgilerini direkt olarak set et
          if (order.products) {
            setOrderProducts(prev => ({
              ...prev,
              [order.id]: order.products
            }));
          }
        }
        
        await fetchReviewedProducts();
        
        setLoading(false);
      } catch (err) {
        console.error("Sipariş getirme hatası:", err);
        setError(err.message || 'Siparişler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const fetchOrderStateAndDate = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token bulunamadı');

      const response = await fetch(`http://localhost:8080/ordered/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Sipariş bilgileri alınamadı');

      const orderData = await response.json();
      
      setOrderStates(prev => ({
        ...prev,
        [orderId]: orderData.state
      }));
      
      setOrderDates(prev => ({
        ...prev,
        [orderId]: orderData.date
      }));

    } catch (error) {
      console.error(`Order ${orderId} bilgileri alınamadı:`, error);
    }
  };

  const fetchReviewedProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) return;
      
      const reviewsResponse = await fetch(`http://localhost:8080/review/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!reviewsResponse.ok) {
        if (reviewsResponse.status !== 204 && reviewsResponse.status !== 404) {
          console.error('Kullanıcının yorumları alınamadı:', reviewsResponse.status);
        }
        setReviewedProducts({});
        return;
      }
      
      const reviewsData = await reviewsResponse.json();
      const reviewedProductsMap = {};
      
      if (Array.isArray(reviewsData)) {
        reviewsData.forEach(review => {
          if (review && review.productId) {
            reviewedProductsMap[review.productId] = true;
          }
        });
      }
      
      setReviewedProducts(reviewedProductsMap);
    } catch (err) {
      console.error('Yorumları getirme hatası:', err);
      setReviewedProducts({});
    }
  };

  const handleReviewClick = async (product, order) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setReviewError('Oturum açmanız gerekiyor');
        return;
      }

      // Kullanıcının yorum yapabilme durumunu kontrol et
      const eligibilityResponse = await fetch(
        `http://localhost:8080/review/check-eligibility?userId=${userId}&productId=${product.id}&orderedId=${order.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!eligibilityResponse.ok) {
        throw new Error('Yorum yapma durumu kontrol edilemedi');
      }

      const canReview = await eligibilityResponse.json();
      
      if (!canReview) {
        setReviewError('Bu ürüne yorum yapamazsınız. Sipariş teslim edilmemiş olabilir veya daha önce yorum yapmış olabilirsiniz.');
        return;
      }

      setSelectedProduct(product);
      setSelectedOrder(order);
      setReviewDialogOpen(true);
    } catch (err) {
      console.error('Yorum kontrolü hatası:', err);
      setReviewError('Yorum yapma durumu kontrol edilirken bir hata oluştu');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId || !selectedProduct || !selectedOrder) {
        setReviewError('Gerekli bilgiler eksik');
        return;
      }

      const reviewData = {
        userId: parseInt(userId),
        productId: selectedProduct.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };

      const response = await fetch(`http://localhost:8080/review/order/${selectedOrder.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yorum gönderilemedi');
      }

      setReviewSuccess(true);
      setReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      setSelectedProduct(null);
      setSelectedOrder(null);
      
      // Yorumları yeniden yükle
      await fetchReviewedProducts();
    } catch (err) {
      console.error('Yorum gönderme hatası:', err);
      setReviewError(err.message || 'Yorum gönderilirken bir hata oluştu');
    }
  };

  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    setReviewForm({ rating: 5, comment: '' });
    setSelectedProduct(null);
    setSelectedOrder(null);
    setReviewError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', options);
    } catch (e) {
      console.error('Tarih biçimlendirme hatası:', e);
      return dateString;
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Bilinmiyor';
    
    switch(status.toUpperCase()) {
      case 'PENDING': return 'Bekliyor';
      case 'COMPLETED': return 'Tamamlandı';
      case 'PROCESSING': return 'İşleniyor';
      case 'SHIPPED': return 'Gönderildi';
      case 'CANCELLED': return 'İptal Edildi';
      case 'DELIVERING': return 'Teslim Ediliyor';
      case 'DELIVERED': return 'Teslim Edildi';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    
    switch(status.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'COMPLETED': return 'status-completed';
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPED': return 'status-shipped';
      case 'CANCELLED': return 'status-cancelled';
      case 'DELIVERING': return 'status-delivering';
      case 'DELIVERED': return 'status-delivered';
      default: return 'status-default';
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(prevOrderId => prevOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return <div className="loading-container">Yükleniyor...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/login" className="login-btn">Giriş Yap</Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-inner">
        <h1 className="orders-title">Siparişlerim</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p className="no-orders-message">Hiç siparişiniz yok</p>
            <Link to="/products" className="shop-now-btn">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-header-item">
                    <p className="order-label">Sipariş No</p>
                    <p className="order-value">#{order.id}</p>
                  </div>
                  <div className="order-header-item">
                    <p className="order-label">Tarih</p>
                    <p className="order-value">{formatDate(order.date)}</p>
                  </div>
                  <div className="order-header-item">
                    <p className="order-label">Durum</p>
                    <span className={`status-badge ${getStatusClass(order.state)}`}>
                      {getStatusText(order.state)}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-detail-item">
                    <p className="order-label">Teslimat Adresi:</p>
                    <p className="order-value">{order.address || 'Adres belirtilmedi'}</p>
                  </div>
                  
                  <div className="order-detail-item">
                    <p className="order-label">Toplam Tutar:</p>
                    <p className="order-price">₺{(order.totalPrice || 0).toFixed(2)}</p>
                  </div>
                  
                  {order.products && order.products.length > 0 && (
                    <div className="order-detail-item">
                      <p className="order-label">Ürün Sayısı:</p>
                      <p className="order-value">{order.products.length}</p>
                    </div>
                  )}
                </div>
                
                <div className="order-footer">
                  <button 
                    className="view-details-btn"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    {expandedOrder === order.id ? 'Detayları Gizle' : 'Detayları Göster'}
                  </button>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="order-expanded-details">
                    <h3>Sipariş Ürünleri</h3>
                    
                    {!order.products || order.products.length === 0 ? (
                      <p>Bu siparişte ürün bulunmuyor.</p>
                    ) : (
                      <div className="order-products-list">
                        {order.products.map(product => (
                          <div key={product.id} className="order-product-item">
                            <div className="product-info">
                              <h4>{product.name || `Ürün #${product.id}`}</h4>
                              <p className="product-price">₺{(product.price || 0).toFixed(2)}</p>
                              {product.description && <p className="product-description">{product.description}</p>}
                            </div>
                            
                            {order.state === 'DELIVERED' && (
                              <div className="product-review-section">
                                <button 
                                  className={`write-review-btn ${reviewedProducts[product.id] ? 'reviewed' : ''}`}
                                  onClick={() => handleReviewClick(product, order)}
                                  disabled={reviewedProducts[product.id]}
                                >
                                  {reviewedProducts[product.id] ? 'Değerlendirildi' : 'Değerlendirme Yaz'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yorum Formu Dialog'u */}
      <Dialog open={reviewDialogOpen} onClose={handleReviewDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? `${selectedProduct.name} Ürününü Değerlendir` : 'Ürün Değerlendirme'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Puanınız</Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(event, newValue) => {
                setReviewForm(prev => ({ ...prev, rating: newValue }));
              }}
              precision={0.5}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Yorumunuz"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reviewForm.comment}
            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewDialogClose}>İptal</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hata ve Başarı Mesajları */}
      <Snackbar 
        open={!!reviewError} 
        autoHideDuration={6000} 
        onClose={() => setReviewError(null)}
      >
        <Alert severity="error" onClose={() => setReviewError(null)}>
          {reviewError}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={reviewSuccess} 
        autoHideDuration={6000} 
        onClose={() => setReviewSuccess(false)}
      >
        <Alert severity="success" onClose={() => setReviewSuccess(false)}>
          Yorumunuz başarıyla gönderildi
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;