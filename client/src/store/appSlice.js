// src/store/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [
    {
      id: 'R101',
      buildingName: 'Dãy A',
      roomNumber: 'P.101',
      area: 28,
      price: 3500000,
      status: 'Đang thuê',
      tenantName: 'Nguyễn Văn An',
      oldElectric: 1200,
      oldWater: 45,
      electricPrice: 3500,
      waterPrice: 20000,
      serviceFee: 150000,
      description: 'Phòng có gác lửng, ban công thoáng mát, gần trường.',
    },
    {
      id: 'R102',
      buildingName: 'Dãy A',
      roomNumber: 'P.102',
      area: 22,
      price: 2800000,
      status: 'Trống',
      tenantName: '',
      oldElectric: 850,
      oldWater: 30,
      electricPrice: 3500,
      waterPrice: 20000,
      serviceFee: 120000,
      description: 'Phòng tiêu chuẩn, giờ giấc tự do, có chỗ để xe.',
    },
    {
      id: 'R201',
      buildingName: 'Dãy B',
      roomNumber: 'P.201',
      area: 32,
      price: 4200000,
      status: 'Đang thuê',
      tenantName: 'Trần Thị Bình',
      oldElectric: 2100,
      oldWater: 78,
      electricPrice: 3500,
      waterPrice: 20000,
      serviceFee: 150000,
      description: 'Phòng rộng có cửa sổ lớn, điều hòa, nóng lạnh đầy đủ.',
    },
  ],
  invoices: [
    {
      id: 'HD-202610-P101',
      roomId: 'R101',
      roomNumber: 'P.101',
      tenantName: 'Nguyễn Văn An',
      month: '2026-10',
      roomPrice: 3500000,
      oldElectric: 1120,
      newElectric: 1200,
      electricPrice: 3500,
      oldWater: 40,
      newWater: 45,
      waterPrice: 20000,
      serviceFee: 150000,
      totalAmount: 3500000 + 80 * 3500 + 5 * 20000 + 150000,
      status: 'Chưa thanh toán', // 'Chưa thanh toán' | 'Đã thu tiền'
    },
  ],
  repairs: [
    {
      id: 'REP-1',
      roomNumber: 'P.101',
      tenantName: 'Nguyễn Văn An',
      title: 'Rò rỉ vòi nước bồn rửa',
      status: 'Mới', // 'Mới' | 'Đang xử lý' | 'Xong'
      createdAt: '2026-11-18',
    },
  ],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addRoom: (state, action) => {
      state.rooms = [...state.rooms, action.payload];
    },
    updateRoom: (state, action) => {
      const updated = action.payload;
      state.rooms = state.rooms.map((room) =>
        room.id === updated.id ? { ...room, ...updated } : room
      );
    },
    createContractForRoom: (state, action) => {
      const { roomId, tenantName } = action.payload;
      state.rooms = state.rooms.map((room) =>
        room.id === roomId && room.status === 'Trống'
          ? { ...room, status: 'Đang thuê', tenantName }
          : room
      );
    },
    endContractForRoom: (state, action) => {
      const roomId = action.payload;
      state.rooms = state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, status: 'Trống', tenantName: '' }
          : room
      );
    },
    createMonthlyInvoices: (state, action) => {
      const { month, items } = action.payload;
      const newInvoices = [];

      const updatedRooms = state.rooms.map((room) => {
        const entry = items.find((item) => item.roomId === room.id);
        if (!entry) return room;

        const alreadyExists = state.invoices.some(
          (inv) => inv.roomId === room.id && inv.month === month
        );

        if (!alreadyExists) {
          const elecUsed = Math.max(0, Number(entry.newElectric) - room.oldElectric);
          const waterUsed = Math.max(0, Number(entry.newWater) - room.oldWater);
          const totalAmount =
            room.price +
            elecUsed * room.electricPrice +
            waterUsed * room.waterPrice +
            room.serviceFee;

          newInvoices.push({
            id: `HD-${month.replace('-', '')}-${room.roomNumber.replace('.', '')}`,
            roomId: room.id,
            roomNumber: room.roomNumber,
            tenantName: room.tenantName || 'Khách thuê',
            month,
            roomPrice: room.price,
            oldElectric: room.oldElectric,
            newElectric: Number(entry.newElectric),
            electricPrice: room.electricPrice,
            oldWater: room.oldWater,
            newWater: Number(entry.newWater),
            waterPrice: room.waterPrice,
            serviceFee: room.serviceFee,
            totalAmount,
            status: 'Chưa thanh toán',
          });
        }

        return {
          ...room,
          oldElectric: Number(entry.newElectric),
          oldWater: Number(entry.newWater),
        };
      });

      state.rooms = updatedRooms;
      if (newInvoices.length > 0) {
        state.invoices = [...newInvoices, ...state.invoices];
      }
    },
    markInvoicePaid: (state, action) => {
      const invoiceId = action.payload;
      state.invoices = state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'Đã thu tiền' } : inv
      );
    },
    addRepairRequest: (state, action) => {
      state.repairs = [action.payload, ...state.repairs];
    },
    updateRepairStatus: (state, action) => {
      const { id, status } = action.payload;
      state.repairs = state.repairs.map((item) =>
        item.id === id ? { ...item, status } : item
      );
    },
  },
});

export const {
  addRoom,
  updateRoom,
  createContractForRoom,
  endContractForRoom,
  createMonthlyInvoices,
  markInvoicePaid,
  addRepairRequest,
  updateRepairStatus,
} = appSlice.actions;

export default appSlice.reducer;
