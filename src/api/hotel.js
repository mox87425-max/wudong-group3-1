import request from './index';

export const getHotelList = (params) => {
  return request.get('/api/hotel/list', { params });
};

export const getHotelDetail = (id) => {
  return request.get(`/api/hotel/${id}`);
};

export const createHotel = (data) => {
  return request.post('/api/hotel', data);
};

export const updateHotel = (id, data) => {
  return request.put(`/api/hotel/${id}`, data);
};

export const deleteHotel = (id) => {
  return request.delete(`/api/hotel/${id}`);
};

export const getRoomList = (params) => {
  return request.get('/api/room/list', { params });
};

export const createRoom = (data) => {
  return request.post('/api/room', data);
};

export const updateRoom = (id, data) => {
  return request.put(`/api/room/${id}`, data);
};

export const deleteRoom = (id) => {
  return request.delete(`/api/room/${id}`);
};

export const getRoomCalendar = (roomId, yearMonth) => {
  return request.get(`/api/room-calendar/${roomId}`, {
    params: { yearMonth },
  });
};

export const updateRoomCalendar = (roomId, data) => {
  return request.put(`/api/room-calendar/${roomId}`, data);
};
