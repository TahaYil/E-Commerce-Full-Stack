import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

function ReviewRow({ review, products, onDelete }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/users/${review.userId}`);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{review.id}</TableCell>
        <TableCell>
          <Typography
            sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
            onClick={handleUserClick}
          >
            {review.userId}
          </Typography>
        </TableCell>
        <TableCell>{review.userEmail || 'Email bilgisi yok'}</TableCell>
        <TableCell>{review.rating}</TableCell>
        <TableCell>{products[review.productId]?.name || `Ürün #${review.productId}`}</TableCell>
        <TableCell>
          <IconButton 
            color="error" 
            onClick={() => onDelete(review.id)}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Yorum
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {review.comment || 'Yorum bulunmuyor'}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [products, setProducts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [reviewsResponse, productsResponse] = await Promise.all([
          api.get('/review'),
          api.get('/product/all')
        ]);
        
        if (reviewsResponse.status === 200) {
          setReviews(reviewsResponse.data);
          setFilteredReviews(reviewsResponse.data);
        }
        
        if (productsResponse.status === 200) {
          const productsMap = {};
          productsResponse.data.forEach(product => {
            productsMap[product.id] = product;
          });
          setProducts(productsMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          // Kullanıcıyı login sayfasına yönlendir
          navigate('/login');
        } else if (error.response?.status === 403) {
          setError('Bu sayfaya erişim yetkiniz bulunmuyor.');
        } else {
          setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (ratingFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(review => review.rating === parseFloat(ratingFilter));
      setFilteredReviews(filtered);
    }
  }, [ratingFilter, reviews]);

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/review/${reviewId}`);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
      } else {
        setError('Yorum silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Değerlendirmeler
      </Typography>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Puan Filtresi</InputLabel>
        <Select
          value={ratingFilter}
          label="Puan Filtresi"
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <MenuItem value="all">Tüm Puanlar</MenuItem>
          <MenuItem value="1">1 Yıldız</MenuItem>
          <MenuItem value="2">2 Yıldız</MenuItem>
          <MenuItem value="3">3 Yıldız</MenuItem>
          <MenuItem value="4">4 Yıldız</MenuItem>
          <MenuItem value="5">5 Yıldız</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Kullanıcı ID</TableCell>
              <TableCell>Kullanıcı Email</TableCell>
              <TableCell>Puan</TableCell>
              <TableCell>Ürün</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Henüz değerlendirme bulunmuyor.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <ReviewRow 
                  key={review.id} 
                  review={review} 
                  products={products}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 