import React from 'react';
import './footerLinks.css';


function ShippingInfo() {
  return (
    <div className="page shipping-info-page">
      <h1>Kargo & Teslimat</h1>
      
      <section className="shipping-section">
        <p className="highlighted">Türkiye sınırları içinde her yere teslimat yapılır.</p>
        
        <p>Siparişleriniz 1-5 iş günü içerisinde kargolanır. Siparişleriniz size bildirileceк kargo firmasıyla gönderilir ve takip numarası email yoluyla sistem üzerinden sizinle paylaşılır.</p>
        
        
      </section>
      
      <section className="returns-section">
        <h2>İade</h2>
        
        <p>Ürününüzü teslim alırken kargoyu ve paketi kontrol ettіkten sonra herhangi bir hasar tespitinde kurye ile tutanak tutmanız gerekmektedir.</p>
        
        <p>Ayıplı ya da hasarlı mal teslim alındıktan sonraki 14 gün içerisinde iade edilebilmektedir. Ürünün iadesinin yapılabilmesi için, sisteme üye girişi yapıldıktan sonra "Siparişlerim" kısmından iade talebi oluşturabilirsiniz</p>
        
        <p>Ayıplı ya da hasarlı mal dışında iade <span className="highlight">kabul edilmemektedir</span>.</p>
        
        
        
        <p>Ayrıca ürün herhangi bir şekilde kullandıysa, yıkandıysa ya da zarar gördüyse iade ya da değişiminiz gerçekleşmez. Evinizde evciil hayvanınız var ise deneme amaçlı bile olmuş olsa olası sağlık ve alerjik sebeplerden dolayı ürünün değişimi ya da iadesi kabul edilmez.</p>
        
        <p>Ürün bedeli iadesi yalnızca ödeme yapılan karta yapılmaktadır. Ürünü satın alırken kullandığınız kart/banka hesabına 1-3 gün içerisinde iadesi yapılır.</p>
        
        <p>Hesabınıza geçmesi bankanıza bağlı olarak 5-10 gün sürebilir.</p>
      </section>
    </div>
  );
}

export default ShippingInfo;