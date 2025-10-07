# Pagination Implementation Guide

## Overview
This document describes the pagination implementation for the AllBrandList component and how to extend it to other components.

## Files Modified/Created

### 1. Updated Files
- `src/helpers/queries/brandQueries.js` - Added paginated query hook
- `src/Pages/AllBrandList/AllBrandList.js` - Implemented pagination UI

### 2. New Files Created
- `src/component/ui/Pagination.js` - Reusable pagination component
- `src/helpers/hooks/usePagination.js` - Reusable pagination hook

## API Response Format

The backend should return data in this format:

```json
{
    "brandNames": [
        {
            "_id": "68dba9cff224c7d9f77cbf25",
            "name": "Samsung",
            "brandBannerImg": "http://localhost:2000/uploads/brand/samsung/samsungCover.jpg",
            "order": 2,
            "createdAt": "2025-09-30T09:58:39.151Z",
            "updatedAt": "2025-09-30T09:58:39.151Z",
            "__v": 0
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 2,
        "totalBrands": 13,
        "limit": 10,
        "hasNextPage": true,
        "hasPrevPage": false,
        "nextPage": 2,
        "prevPage": null
    },
    "search": null,
    "sort": {
        "sortBy": "order",
        "sortOrder": "desc"
    }
}
```

## API Endpoint Parameters

The pagination hook sends these query parameters:

- `page` - Current page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term (optional)
- `sortBy` - Field to sort by (default: 'order')
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'desc')

Example API call:
```
GET /brandName?page=1&limit=10&sortBy=order&sortOrder=desc&search=samsung
```

## Usage Examples

### Basic Pagination Hook Usage

```javascript
import { usePagination } from '../../helpers/hooks/usePagination';

const MyComponent = () => {
  const {
    currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSearch,
    handleSort,
  } = usePagination(1, 10, '', 'name', 'asc');

  // Use these values in your API query
  const { data } = useMyDataPaginated(
    currentPage, 
    limit, 
    search, 
    sortBy, 
    sortOrder
  );

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => handleSearch(e.target.value)} 
      />
      <Pagination 
        currentPage={data.pagination.currentPage}
        totalPages={data.pagination.totalPages}
        hasNextPage={data.pagination.hasNextPage}
        hasPrevPage={data.pagination.hasPrevPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
```

### Query Hook Implementation

```javascript
// In your queries file
export const useMyDataPaginated = (page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'desc') => {
  return useQuery(['myData', 'paginated', { page, limit, search, sortBy, sortOrder }], async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    const res = await axiosInstance.get(`/myEndpoint?${params.toString()}`);
    return res.data;
  });
};
```

## Features Implemented

### 1. Search Functionality
- Real-time search with debouncing
- Resets to page 1 when searching
- Shows "No results found" message

### 2. Pagination Controls
- Previous/Next buttons
- Page number buttons with ellipsis
- Shows current page and total pages
- Disabled states for unavailable actions

### 3. Responsive Design
- Works on mobile and desktop
- Dark mode support
- Consistent styling with existing components

### 4. Loading States
- Loading indicators during API calls
- Disabled buttons during mutations
- Error handling with retry options

## Extending to Other Components

To add pagination to other components:

1. **Create a paginated query hook** in your queries file
2. **Use the usePagination hook** for state management
3. **Add the Pagination component** to your JSX
4. **Implement search input** if needed
5. **Update your API endpoint** to support pagination parameters

## Backend Requirements

Your backend should support these query parameters:

- `page` - Page number (1-based)
- `limit` - Items per page
- `search` - Search term (optional)
- `sortBy` - Field to sort by
- `sortOrder` - 'asc' or 'desc'

And return the response format shown above.

## Styling

The pagination component uses Tailwind CSS classes and supports:
- Dark mode (`dark:` variants)
- Hover states
- Disabled states
- Responsive design
- Consistent color scheme with the rest of the app

## Performance Considerations

- Query caching with React Query
- Debounced search (can be added if needed)
- Efficient re-renders with useCallback
- Proper cleanup of event listeners
