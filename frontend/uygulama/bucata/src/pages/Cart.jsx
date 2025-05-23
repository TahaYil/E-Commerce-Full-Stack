import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import { ShoppingBag, Truck, CreditCard, Check, ArrowRight, Trash2 } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCartItems = () => {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          calculateSubtotal(parsedCart);
        } catch (error) {
          console.error('Cart parsing error:', error);
          localStorage.removeItem('cartItems');
          setCartItems([]);
        }
      }
    };
    
    loadCartItems();
  }, []);

  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(total);
  };

  const updateQuantity = (id, size, change) => {
    setCartItems(prevCart => {
      return prevCart.map(item => {
        if (item.id === id && item.size === size) {
          const maxStock = item.sizeStock || 99;
          const newQuantity = Math.max(1, Math.min(item.quantity + change, maxStock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeItem = (id, size) => {
    const updatedCart = cartItems.filter(item => !(item.id === id && item.size === size));
    setCartItems(updatedCart);
    calculateSubtotal(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    setSubtotal(0);
    localStorage.removeItem('cartItems');
  };

  const validateAddress = () => {
    if (!address.trim()) {
      setAddressError('Adres boş olamaz.');
      return false;
    }
    
    if (address.length > 255) {
      setAddressError('Adres en fazla 255 karakter olabilir.');
      return false;
    }
    
    setAddressError('');
    return true;
  };


  const getUserIdFromLocalStorage = () => {
    const userId = localStorage.getItem('userId');
  };

  const completeOrder = async () => {
  
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Lütfen önce giriş yapınız');
      return;
    }

    if (cartItems.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

 
    if (!validateAddress()) {
      return;
    }

    setIsSubmitting(true);

    try {
   
      const userId = getUserIdFromLocalStorage();
      console.log(`Kullanıcı ID: ${userId} için sipariş oluşturuluyor`);

 
      const orderData = {
        address: address,
        totalPrice: subtotal,
        userId: userId,
        productIds: [...new Set(cartItems.map(item => Number(item.id)))],
        active: true,
        orderItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        }))
      };

      console.log('Sipariş verileri:', orderData);

      const orderResponse = await fetch('http://localhost:8080/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error(`Sipariş oluşturma hatası: ${orderResponse.status}`);
      }

      const orderResult = await orderResponse.json();
      console.log('Sipariş başarıyla oluşturuldu:', orderResult);
      

      const orderedData = {
        orderId: orderResult.id,  
        userId: userId,
        date: new Date().toISOString().split('T')[0],  
        state: 'PENDING'  
      };

      const orderedResponse = await fetch('http://localhost:8080/ordered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderedData)
      });



      setOrderSuccess(true);
      clearCart();
      

      setTimeout(() => {
        navigate('/orders'); 
      }, 3000);
      
    } catch (error) {
      console.error('Sipariş hatası:', error);
      alert(`Hata: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-inner">
        <h1 className="cart-title">
          <ShoppingBag size={28} style={{ marginRight: '10px' }} />
          Sepetim ({cartItems.length})
        </h1>
        
        {orderSuccess && (
          <div className="order-success-message">
            <Check size={24} style={{ marginRight: '10px' }} />
            Siparişiniz başarıyla oluşturuldu! Teşekkür ederiz. Siparişlerim sayfasına yönlendiriliyorsunuz...
          </div>
        )}
        
        <div className="cart-layout">

          <div className="cart-items-container">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image || '/placeholder/100/100'} alt={item.name} />
                  </div>
                  
                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{item.name}</h3>
                    <div className="cart-item-details">
                      <p>Fiyat: ₺ {item.price.toFixed(2)}</p>
                      {item.color && <p>Renk: {item.color}</p>}
                      <p>Beden: {item.size}</p>
                    </div>
                    
                    <div className="cart-item-quantity">
                      <span className="quantity-label">Adet</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, -1)} 
                        className="quantity-btn"
                        disabled={isSubmitting}
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, 1)} 
                        className="quantity-btn"
                        disabled={isSubmitting || (item.sizeStock !== undefined && item.quantity >= item.sizeStock)}
                      >
                        +
                      </button>
                      <span className="stock-info" style={{marginLeft:8, fontSize:12, color:'#888'}}>
                        {item.sizeStock !== undefined ? `Stok: ${item.sizeStock}` : ''}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id, item.size)} 
                        className="remove-btn"
                        disabled={isSubmitting}
                      >
                        <Trash2 size={14} style={{ marginRight: '5px' }} />
                        Sil
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-price">
                    ₺ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart">
                <p className="empty-cart-message">Sepetinizde ürün bulunmamaktadır.</p>
                <Link to="/" className="shop-now-btn">
                  Alışverişe Başla
                </Link>
              </div>
            )}
            
            {cartItems.length > 0 && (
              <button 
                onClick={clearCart} 
                className="clear-cart-btn"
                disabled={isSubmitting}
              >
                <Trash2 size={16} style={{ marginRight: '8px' }} />
                Sepeti Boşalt
              </button>
            )}
          </div>
          
      
          {cartItems.length > 0 && (
            <div className="cart-summary-container">
              <div className="cart-summary">
                <h2 className="summary-title">Sipariş Özeti</h2>
                
                <div className="summary-row">
                  <span>Ara Toplam</span>
                  <span>₺ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-total">
                  <span>Toplam</span>
                  <span>₺ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="address-input-container">
                  <label htmlFor="address">Teslimat Adresi</label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Teslimat adresinizi giriniz"
                    rows={3}
                    className={`address-input ${addressError ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {addressError && <span className="error-message">{addressError}</span>}
                </div>
                
                <p className="shipping-note">
                  Kargo sonraki adımda hesaplanacaktır.
                </p>
                
                <button 
                  onClick={completeOrder}
                  className="checkout-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'İŞLENİYOR...' : 'ALIŞVERİŞİ TAMAMLA'}
                  {!isSubmitting && <ArrowRight size={20} />}
                </button>
                
                <div className="security-features">
                  <div className="security-item">
                    <Truck size={20} />
                    <span className="security-text">1500 TL üzeri ücretsiz kargo</span>
                  </div>
                  <div className="security-item">
                    <CreditCard size={20} />
                    <span className="security-text">Güvenli ödeme sistemi</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;