import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';

function OrderRow({ order, getStateColor, onStatusUpdate }) {
  const [open, setOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    if (!open) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8080/ordered/${order.id}`);
      setOrderDetails(response.data);
    } catch (err) {
      setError('Sipariş detayları yüklenirken bir hata oluştu.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [open]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    setError(null);
    try {
      const response = await axios.put(`http://localhost:8080/ordered/${order.id}/state`, null, {
        params: {
          state: newStatus
        }
      });
      
      if (response.status === 200) {
        onStatusUpdate(order.id, newStatus);
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      let errorMessage = 'Sipariş durumu güncellenirken bir hata oluştu.';
      
      if (err.response?.status === 400) {
        errorMessage = 'Geçersiz durum geçişi. Lütfen geçerli bir durum seçin.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Sipariş bulunamadı.';
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const getValidStateTransitions = (currentState) => {
    switch (currentState) {
      case 'PENDING':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      case 'DELIVERED':
      case 'CANCELLED':
        return [];
      default:
        return [];
    }
  };

  const validTransitions = getValidStateTransitions(order.state);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.userId}</TableCell>
        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
        <TableCell>
          <span style={{ color: getStateColor(order.state) }}>
            {order.state}
          </span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {loading ? (
                <CircularProgress />
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : orderDetails ? (
                <>
                  <Typography variant="h6" gutterBottom component="div">
                    Sipariş Detayları
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Mevcut Durum:</strong>{' '}
                      <span style={{ color: getStateColor(order.state) }}>
                        {order.state}
                      </span>
                    </Typography>
                    {validTransitions.length > 0 ? (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Durum Güncelle</InputLabel>
                        <Select
                          value=""
                          onChange={(e) => handleStatusUpdate(e.target.value)}
                          disabled={updating}
                          displayEmpty
                          label="Durum Güncelle"
                        >
                          {validTransitions.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Son Durum...
                      </Typography>
                    )}
                    {updating && <CircularProgress size={20} sx={{ ml: 2 }} />}
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Adres:</strong> {orderDetails.address}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Toplam Tutar:</strong> {orderDetails.totalPrice} TL
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün Adı</TableCell>
                        <TableCell>Beden</TableCell>
                        <TableCell>Adet</TableCell>
                        <TableCell>Birim Fiyat</TableCell>
                        <TableCell>Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetails.orderItems?.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price} TL</TableCell>
                          <TableCell>{(item.price * item.quantity).toFixed(2)} TL</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : null}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/ordered');
      setOrders(response.data);
    } catch (err) {
      setError('Siparişler yüklenirken bir hata oluştu.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'PENDING':
        return '#ffa726';
      case 'PROCESSING':
        return '#29b6f6';
      case 'SHIPPED':
        return '#66bb6a';
      case 'DELIVERED':
        return '#43a047';
      case 'CANCELLED':
        return '#e53935';
      default:
        return '#000000';
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredOrders = React.useMemo(() => {
    let result = [...orders];

    // Filtreleme
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toLocaleDateString();
      result = result.filter(order => 
        new Date(order.date).toLocaleDateString().includes(filterDate)
      );
    }
    if (stateFilter) {
      result = result.filter(order => order.state === stateFilter);
    }

    // Sıralama
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortConfig.key === 'id') {
          return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
        }
        return 0;
      });
    }

    return result;
  }, [orders, dateFilter, stateFilter, sortConfig]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, state: newStatus } : order
    ));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Tarih Filtresi"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Durum Filtresi</InputLabel>
          <Select
            value={stateFilter}
            label="Durum Filtresi"
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="PENDING">Beklemede</MenuItem>
            <MenuItem value="PROCESSING">İşleniyor</MenuItem>
            <MenuItem value="SHIPPED">Kargoda</MenuItem>
            <MenuItem value="DELIVERED">Teslim Edildi</MenuItem>
            <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                Sipariş No
                <Tooltip title="Sipariş No'ya Göre Sırala">
                  <IconButton size="small" onClick={() => handleSort('id')}>
                    {sortConfig.key === 'id' ? (
                      sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                    ) : <ArrowUpwardIcon />}
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>Kullanıcı ID</TableCell>
              <TableCell>
                Tarih
                <Tooltip title="Tarihe Göre Sırala">
                  <IconButton size="small" onClick={() => handleSort('date')}>
                    {sortConfig.key === 'date' ? (
                      sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                    ) : <ArrowUpwardIcon />}
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndFilteredOrders.map((order) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                getStateColor={getStateColor} 
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
