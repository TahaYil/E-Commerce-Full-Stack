import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

export default function OrderDuzen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    state: "",
    address: "",
    totalPrice: 0,
    orderItems: []
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/order/${id}`);
        setFormData(response.data);
      } catch (error) {
        setError("Sipariş bilgileri yüklenirken bir hata oluştu");
        console.error("Error fetching order:", error);
      }
    };

    fetchOrder();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/order/${id}`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      setError("Sipariş güncellenirken bir hata oluştu");
      console.error("Error updating order:", error);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'PENDING':
        return 'warning.main';
      case 'PROCESSING':
        return 'info.main';
      case 'SHIPPED':
        return 'primary.main';
      case 'DELIVERED':
        return 'success.main';
      case 'CANCELLED':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sipariş Düzenle
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Sipariş başarıyla güncellendi!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  label="Durum"
                  onChange={handleChange}
                >
                  <MenuItem value="PENDING">Bekliyor</MenuItem>
                  <MenuItem value="PROCESSING">İşleniyor</MenuItem>
                  <MenuItem value="SHIPPED">Gönderildi</MenuItem>
                  <MenuItem value="DELIVERED">Teslim Edildi</MenuItem>
                  <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="totalPrice"
                label="Toplam Tutar"
                type="number"
                value={formData.totalPrice}
                onChange={handleChange}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Teslimat Adresi"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            {formData.orderItems && formData.orderItems.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Sipariş Edilen Ürünler
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün ID</TableCell>
                        <TableCell>Beden</TableCell>
                        <TableCell>Adet</TableCell>
                        <TableCell>Birim Fiyat</TableCell>
                        <TableCell>Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productId}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₺{item.price.toFixed(2)}</TableCell>
                          <TableCell>₺{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2, mr: 2 }}
              >
                Değişiklikleri Kaydet
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                sx={{ mt: 2 }}
                onClick={() => navigate("/orders")}
              >
                İptal
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
