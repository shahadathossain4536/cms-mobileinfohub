import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../helpers/axios';

export const deviceKeys = {
  all: ['devicesData'],
};

export const useDevices = (params = {}) => {
  const { page = 1, limit = 10, brand } = params;
  return useQuery([...deviceKeys.all, page, limit, brand], async () => {
    const search = new URLSearchParams({
      includeHidden: 'true',
      page: String(page),
      limit: String(limit),
      ...(brand ? { brand } : {})
    }).toString();
    const res = await axiosInstance.get(`/devicesData?${search}`);
    return res.data; // { data, pagination }
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation(async (id) => {
    await axiosInstance.delete(`/devicesData/${id}`);
  }, {
    onSuccess: () => queryClient.invalidateQueries(deviceKeys.all),
  });
};


