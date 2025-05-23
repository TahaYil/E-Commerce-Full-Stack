// src/pages/OAuth2RedirectPage.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuth2RedirectPage() {
  const navigate = useNavigate();
  const location = useLocation();      // sadece lint uyarısı almamak için

  useEffect(() => {
    console.log("OAuth2RedirectPage mounted");
    console.log("Current URL:", window.location.href);
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    console.log("URL params:", Object.fromEntries(params.entries()));
    console.log("Token from URL:", token);

    if (token) {
      console.log("Token received, storing in localStorage");
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split('.')[1]));

      const userId = payload.id || payload.sub;   // backend nasıl koyduysa
      localStorage.setItem("userId", userId);

      //localStorage.setItem("userId", userId);
      console.log("Token stored successfully");
      navigate("/", { replace: true });   // ← MUTLAKA yönlendir
    } else {
      console.log("No token found in URL, redirecting to login");
      navigate("/", { replace: true });
    }
  }, [navigate, location.search]);        // location.search ekle: URL değişirse effect tekrar çalışsın

  return <p>Yönlendiriliyor…</p>;
}
