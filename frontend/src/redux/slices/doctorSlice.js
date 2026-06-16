import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

const initialState = {
  doctors: [],
  selectedDoctor: null,
  reviews: [],
  loading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/doctors', { params: filters });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load doctor directory');
  }
});

export const fetchDoctorById = createAsyncThunk('doctors/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/doctors/${id}`);
    return res.data; // contains { doctor, reviews }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load doctor details');
  }
});

export const approveDoctorAccount = createAsyncThunk(
  'doctors/approve',
  async ({ id, approved }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/doctors/${id}/approve`, { approved });
      return { id, approved: res.data.doctor.approved };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Approval update failed');
    }
  }
);

export const addDoctorReview = createAsyncThunk(
  'doctors/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/reviews', reviewData);
      return res.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add feedback review');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctor = action.payload.doctor;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Account
      .addCase(approveDoctorAccount.fulfilled, (state, action) => {
        const doc = state.doctors.find((d) => d._id === action.payload.id);
        if (doc) {
          doc.approved = action.payload.approved;
        }
        if (state.selectedDoctor && state.selectedDoctor._id === action.payload.id) {
          state.selectedDoctor.approved = action.payload.approved;
        }
      })
      // Add Review
      .addCase(addDoctorReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      });
  },
});

export const { clearSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
