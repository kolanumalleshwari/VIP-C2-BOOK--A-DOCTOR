import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

const initialState = {
  payments: [],
  loading: false,
  error: null,
};

export const fetchPaymentHistory = createAsyncThunk('payments/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/payments/history');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load transaction history');
  }
});

export const processPaymentCharge = createAsyncThunk(
  'payments/charge',
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/payments/charge', paymentData);
      return res.data.payment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Simulated checkout checkout failed');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Charge
      .addCase(processPaymentCharge.pending, (state) => {
        state.loading = true;
      })
      .addCase(processPaymentCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(processPaymentCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
