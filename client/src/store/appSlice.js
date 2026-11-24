// src/store/appSlice.js
// Redux giữ bản sao dữ liệu lấy từ API. Mỗi thao tác ghi: gọi API -> tải lại dữ liệu.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getApiError, getStoredSession } from '../api/axiosClient';

const initialState = {
  rooms: [],
  invoices: [],
  repairs: [],
  accounts: [], // chỉ chủ trọ mới có dữ liệu này
  me: null, // thông tin mới nhất của người đang đăng nhập (gồm roomId)
  loaded: false,
  loadError: '',
};

// Tải dữ liệu theo vai trò đang đăng nhập (khách chỉ thấy danh sách phòng)
export const loadData = createAsyncThunk('app/loadData', async (_, { rejectWithValue }) => {
  try {
    const role = getStoredSession()?.user?.role || null;

    const [roomsRes, meRes, invoicesRes, repairsRes, accountsRes] = await Promise.all([
      api.get('/rooms'),
      role ? api.get('/auth/me') : null,
      role ? api.get('/invoices') : null,
      role ? api.get('/repairs') : null,
      role === 'landlord' ? api.get('/accounts') : null,
    ]);

    return {
      rooms: roomsRes.data.rooms,
      me: meRes?.data.user || null,
      invoices: invoicesRes?.data.invoices || [],
      repairs: repairsRes?.data.repairs || [],
      accounts: accountsRes?.data.accounts || [],
    };
  } catch (err) {
    return rejectWithValue(getApiError(err));
  }
});

// Tạo thunk cho thao tác ghi. Lỗi trả về dạng { message, errors } (dùng với .unwrap()).
const mutation = (name, request) =>
  createAsyncThunk(`app/${name}`, async (arg, { dispatch, rejectWithValue }) => {
    try {
      const res = await request(arg);
      await dispatch(loadData());
      return res.data;
    } catch (err) {
      return rejectWithValue(getApiError(err));
    }
  });

// Phòng & hợp đồng
export const saveRoom = mutation('saveRoom', ({ id, ...body }) =>
  id ? api.put(`/rooms/${id}`, body) : api.post('/rooms', body)
);
export const createContractForRoom = mutation('createContract', ({ roomId, tenantName }) =>
  api.post(`/rooms/${roomId}/contract`, { tenantName })
);
export const endContractForRoom = mutation('endContract', (roomId) =>
  api.post(`/rooms/${roomId}/end-contract`)
);

// Hóa đơn
export const createMonthlyInvoices = mutation('createMonthlyInvoices', ({ month, items }) =>
  api.post('/invoices/monthly', { month, items })
);
export const markInvoicePaid = mutation('markInvoicePaid', (id) => api.post(`/invoices/${id}/pay`));

// Sửa chữa
export const addRepairRequest = mutation('addRepair', ({ title, imageUrl }) =>
  api.post('/repairs', { title, imageUrl })
);
export const updateRepairStatus = mutation('updateRepairStatus', ({ id, status }) =>
  api.patch(`/repairs/${id}/status`, { status })
);

// Tài khoản
export const approveAccount = mutation('approveAccount', ({ id, roomId }) =>
  api.post(`/accounts/${id}/approve`, { roomId })
);
export const rejectAccount = mutation('rejectAccount', ({ id, reason }) =>
  api.post(`/accounts/${id}/reject`, { reason })
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadData.fulfilled, (state, action) => {
        Object.assign(state, action.payload, { loaded: true, loadError: '' });
      })
      .addCase(loadData.rejected, (state, action) => {
        state.loaded = true;
        state.loadError = action.payload?.message || 'Không tải được dữ liệu.';
      });
  },
});

export default appSlice.reducer;
