import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/Footer'
import Home from './pages/Home';
import Cart from './pages/Cart';
import './App.css';
import SurfingText from './components/SurfingText';
import BlogPosts from './footerLinks/BlogPosts';
import SSS from "./footerLinks/SSS";
import ShippingInfo from "./footerLinks/ShippingInfo";
import DistanceSalesAgreement from "./footerLinks/DistanceSalesAgreement";
import PrivacyPolicy from "./footerLinks/PrivacyPolicy";
import UserAgreement from "./footerLinks/UserAgreement";
import './service/axiosConfig';
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from './components/PrivateRoute';
import ProductPage from './pages/ProductPage';
import Orders from './pages/Orders';
import CategoryPage from './categories/CategoryPage';
import OAuth2RedirectPage from './pages/src/pages/OAuth2RedirectPage';





function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

const AppContent = () => {
  const location = useLocation();
  const hidebar = ['/auth/login', '/auth/register'];
  const ishidebar = hidebar.includes(location.pathname);

  return (
    <>

    
      <ScrollToTop />
      <Navbar /> 
      { !ishidebar &&  <SurfingText /> }
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
          <Route path="/SSS" element={<SSS />} />
          <Route path="/kargo&iade" element={<ShippingInfo />} />
          <Route path="/uss" element={<DistanceSalesAgreement />} />
          <Route path="/gizlilik" element={<PrivacyPolicy />} />
          <Route path="/kullanici-sozlesmesi" element={<UserAgreement />} />
          <Route path='/blog' element={<BlogPosts/>} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
          
          
        


          
        </Routes>
      </div>
      { !ishidebar &&  <Footer /> }
    
    </>
  );
};

const App = () => {
  return(
  <Router>
    <AppContent/>
  </Router>
  );
  
};

export default App;
