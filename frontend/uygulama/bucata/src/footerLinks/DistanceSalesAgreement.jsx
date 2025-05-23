import React from 'react';
import './footerLinks.css';


function DistanceSalesAgreement() {
  return (
    <div className="page sales-agreement-page">
      <h1>MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
      
      <div className="agreement-section">
        <h2>1. Sözleşmenin Tarafları:</h2>
        
        <p><strong>SATICI:</strong></p>
        <p>Unvanı: "Bucata"</p>
        <p>Vergi Dairesi: Malatya  Kurumlar</p>
        <p>Vergi Numarası: 4848484848</p>
        
        <p><strong>ALICI:</strong></p>
        <p>Adı/Soyadı: Varsa Ünvanı:</p>
        <p>Adres:</p>
        <p>Telefon:</p>
        <p>E-posta:</p>
      </div>
      
      <div className="agreement-section">
        <h2>2. Sözleşmenin Konusu:</h2>
        
        <p>İş bu sözleşmenin konusu, Alıcının Satıcıya ait: <a href=""></a> web sitesinden elektronik ortamda sipariş verdiği, sözleşmede bahsi geçen nitelikleri haiz ve yine sözleşmede satış fiyatı belirtilen mal/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Uygulama Esası ve Usulleri Hakkında Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır. Alıcı, satışa konu mal/hizmetlerin temel niteliklerini, satış fiyatı, ödeme şekli, teslimat koşulları ve satışa konu mal/hizmet ile ilgili tüm ön bilgiler ve cayma hakkı konusunda bilgi sahibi olduğunu, bu ön bilgileri elektronik ortamda teyit ettiğini ve sonrasında mal/hizmeti sipariş verdiğini iş bu sözleşme hükümlerince kabul ve beyan eder.</p>
      </div>
      
      <div className="agreement-section">
        <h2>3. Sözleşme Tarihi:</h2>
        
        <p>İşbu Sözleşme, Alıcı tarafından ilgili internet sitesi üzerinden elektronik ortamda onaylandığı tarihte kurulmuş sayılacaktır.</p>
      </div>
      
      <div className="agreement-section">
        <h2>4. Sözleşme Konusu Ürün ve Teslimata İlişkin Bilgiler</h2>
        
        <p>Malın türü, miktarı, marka/modeli, adedi, satış bedeli, ödeme şekli, aşağıda belirtildiği gibidir:</p>
        
        <p>Ürün Kodu</p>
        <p>Adet</p>
        <p>Birim Fiyat</p>
        <p>Toplam Satış Tutarı</p>
        <p>KDV Dahil Toplam</p>
      </div>
    </div>
  );
}

export default DistanceSalesAgreement;