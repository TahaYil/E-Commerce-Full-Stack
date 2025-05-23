import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Divider, Typography, Alert, Card, CardContent, Box, Avatar } from '@mui/material';
import Rating from '@mui/material/Rating';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        // Ürün bilgilerini getir
        const productResponse = await fetch(`http://localhost:8080/product/${id}`);
        if (!productResponse.ok) {
          throw new Error('Ürün bilgileri alınamadı');
        }
        const productData = await productResponse.json();
        setProduct(productData);

        // Ürün yorumlarını getir
        console.log('Fetching reviews for product:', id);
        const reviewsResponse = await fetch(`http://localhost:8080/review/product/${id}`);
        console.log('Reviews Response Status:', reviewsResponse.status);
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          console.log('Received reviews:', reviewsData);
          
          if (Array.isArray(reviewsData)) {
            setReviews(reviewsData);
            
            // Ortalama puanı hesapla
            if (reviewsData.length > 0) {
              const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
              setAverageRating(totalRating / reviewsData.length);
            }
          } else {
            console.error('Reviews data is not an array:', reviewsData);
            setReviews([]);
            setAverageRating(0);
          }
        } else if (reviewsResponse.status === 204) {
          console.log('No reviews found (204)');
          setReviews([]);
          setAverageRating(0);
        } else {
          console.error('Error fetching reviews:', reviewsResponse.status);
          setReviews([]);
          setAverageRating(0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  return (
    <div>
      <Grid item xs={12}>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>
          Değerlendirmeler ({reviews.length})
        </Typography>

        {reviews.length === 0 ? (
          <Alert severity="info">
            Bu ürün için henüz değerlendirme yapılmamış.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {review.userEmail ? review.userEmail[0].toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {review.userEmail || 'Anonim Kullanıcı'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {review.date ? new Date(review.date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ProductDetail;  
