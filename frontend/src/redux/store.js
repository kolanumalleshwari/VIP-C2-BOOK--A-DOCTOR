import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import doctorReducer from './slices/doctorSlice.js';
import appointmentReducer from './slices/appointmentSlice.js';
import paymentReducer from './slices/paymentSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer,
    appointments: appointmentReducer,
    payments: paymentReducer,
  },
});

export default store;
