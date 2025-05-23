import React, { useState } from 'react';
import './footerLinks.css';

function SSS() {

  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {

    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="page faq-page">
      <h1>Sıkça Sorulan Sorular</h1>
      
      <div className="faq-accordion">
        <div className="faq-item">
          <div className="faq-question" onClick={() => handleClick(0)}>
            <span className="arrow">{activeIndex === 0 ? '▼' : '▶'}</span>
            Kargo Takip Numaramı Nereden Bulabilirim?
          </div>
          {activeIndex === 0 && (
            <div className="faq-answer">
              <p>Siparişlerim sayfasında kargodaki siparişlerinizin sipariş numaralarını bulabilisiniz.
                Kargo firması siparişinize henüz takip numarası vermedi ise birkaç saat içerisinde
                tekrar denemenizi öneririz.
              </p>
            </div>
          )}
        </div>
        
        <div className="faq-item">
          <div className="faq-question" onClick={() => handleClick(1)}>
            <span className="arrow">{activeIndex === 1 ? '▼' : '▶'}</span>
            Hangi Ödeme Yöntemlerini Kullanabilirim?
          </div>
          {activeIndex === 1 && (
            <div className="faq-answer">
              <p>Site üzerinde kredi kartı, banka kartı ile öedenem yapabilirsiniz.
                Maalesef kapıda ödeme seçeneğimiz bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
        
        <div className="faq-item">
          <div className="faq-question" onClick={() => handleClick(2)}>
            <span className="arrow">{activeIndex === 2 ? '▼' : '▶'}</span>
            Ürün tasarımlarında neye dikkat ediyorsunuz?
          </div>
          {activeIndex === 2 && (
            <div className="faq-answer">
              <p>Genellikle türk motifleri ve soyu tükenen hayvanlar üzerinde çalışıyoruz.</p>
            </div>
          )}
        </div>
        
        <div className="faq-item">
          <div className="faq-question" onClick={() => handleClick(3)}>
            <span className="arrow">{activeIndex === 3 ? '▼' : '▶'}</span>
            Beğendiğim Koleksiyonun Ürünlerini Tek Tek Almak Mümkün Müdür?
          </div>
          {activeIndex === 3 && (
            <div className="faq-answer">
              <p>Evet, koleksiyon ürünleri adet olarak satılır. İstediğiniz ürünü alabilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SSS;


