import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

const initialState = {
  appointments: [],
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/appointments');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load appointments calendar');
  }
});

export const bookNewAppointment = createAsyncThunk(
  'appointments/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/appointments', bookingData);
      return res.data.appointment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Booking slot conflict or failure');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/appointments/${id}`, { status });
      return res.data.appointment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update appointment status');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create booking
      .addCase(bookNewAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(bookNewAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookNewAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((appt) => appt._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });
  },
});

export default appointmentSlice.reducer;
