import { QueryClient } from 'react-query';
import toast from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        const message = error?.response?.data?.message || error?.message || 'Request failed';
        toast.error(message);
      },
    },
    mutations: {
      onError: (error) => {
        const message = error?.response?.data?.message || error?.message || 'Request failed';
        toast.error(message);
      },
    },
  },
});

export default queryClient;


