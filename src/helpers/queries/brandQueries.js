import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '../../helpers/axios';

export const brandKeys = {
  all: ['brandData'],
};

export const useBrands = () => {
  return useQuery(brandKeys.all, async () => {
    const res = await axiosInstance.get('/brandName');
    return res.data.brandNames;
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation(async (id) => {
    await axiosInstance.delete(`/brandName/${id}`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(brandKeys.all);
    },
  });
};


