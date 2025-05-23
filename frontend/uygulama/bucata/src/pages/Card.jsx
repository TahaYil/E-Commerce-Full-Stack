import React from 'react';
import './Card.css';


const Card = () => {
  return (
    <div>
      <h1>Card Sayfası</h1>
      <div className="product-card">
        <h2>Ürün Adı</h2>
        <p>Ürün Açıklaması</p>
        <p>Fiyat: 100₺</p>
      </div>
    </div>
  );
};

export default Card;