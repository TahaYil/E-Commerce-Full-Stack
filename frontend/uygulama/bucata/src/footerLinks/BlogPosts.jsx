import React from 'react';
import './footerLinks.css';


function BlogPosts() {
  return (
    <div className="page blog-page">
      <div className="blog-grid">
        <div className="blog-card">
          <div className="blog-image">
            <img src="" alt="" />
          </div>
          <h3>Bucata İlgili Tüm Sorular ve Cevapları</h3>
          <div className="blog-author">
            <span className="author-icon">👤</span> Buğrahan Karaca
          </div>
          <p></p>
          <a href="#" className="read-more">DEVAMINI OKU</a>
        </div>
        
        <div className="blog-card">
          <div className="blog-image">
            <img src="" alt="" />
          </div>
          <h3>Bucata Ürünleri Nerede Üretilir?</h3>
          <div className="blog-author">
            <span className="author-icon">👤</span> Canberk Duran
          </div>
          <p>Bucata giyim ürünlerinin özellikleri nelerdir? Türkiye'de mi üretilir? Ne tür kumaş ve baskı türleri kullanılır?</p>
          <a href="#" className="read-more">DEVAMINI OKU</a>
        </div>
        
        <div className="blog-card">
          <div className="blog-image">
            <img src="" alt="" />
          </div>
          <h3>Oversize Nedir</h3>
          <div className="blog-author">
            <span className="author-icon">👤</span> Taha Yıldırım
          </div>
          <p>Bucata markamızın sunduğu oversize giyim tarzını keşfedin. Bu rehberde, oversize giyimin ne olduğunu, kimler için uygun olduğunu ve...</p>
          <a href="#" className="read-more">DEVAMINI OKU</a>
        </div>
      </div>
    </div>
  );
}

export default BlogPosts;