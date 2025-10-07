import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '../../helpers/axios';

export const brandKeys = {
  all: ['brandData'],
  paginated: (page, limit, search, sortBy, sortOrder) => ['brandData', 'paginated', { page, limit, search, sortBy, sortOrder }],
};

export const useBrands = () => {
  return useQuery(brandKeys.all, async () => {
    const res = await axiosInstance.get('/brandName');
    return res.data.brandNames;
  });
};

export const useBrandsPaginated = (page = 1, limit = 10, search = '', sortBy = 'order', sortOrder = 'desc') => {
  return useQuery(brandKeys.paginated(page, limit, search, sortBy, sortOrder), async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    const res = await axiosInstance.get(`/brandName?${params.toString()}`);
    return res.data;
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation(async (id) => {
    await axiosInstance.delete(`/brandName/${id}`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(brandKeys.all);
      queryClient.invalidateQueries(['brandData', 'paginated']);
    },
  });
};


