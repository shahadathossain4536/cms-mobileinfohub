import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../helpers/axios';

export const deviceKeys = {
  all: ['devicesData'],
};

export const useDevices = () => {
  return useQuery(deviceKeys.all, async () => {
    const res = await axiosInstance.get('/devicesData');
    return res.data;
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


