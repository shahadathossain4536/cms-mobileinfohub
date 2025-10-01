# Frontend Advertisement System Setup Instructions

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd deviceinfohub-server
npm start
```
The backend server will run on `http://localhost:2000`

### 2. Start the Frontend
```bash
cd mobile_project_backend
npm start
```
The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Environment Setup
The frontend automatically detects the environment and connects to:
- **Development**: `http://localhost:2000/api` (local backend)
- **Production**: `https://deviceinfohub-server.vercel.app/api` (production backend)

### API Configuration
The system uses the following API endpoints:
- File Upload: `/api/uploads/*`
- Advertisements: `/api/advertisements/*`
- Advertisement Slots: `/api/advertisement-slots/*`
- User Advertisements: `/api/user/advertisements/*`

## 📁 File Structure

```
src/Pages/Advertisement/
├── Advertisement.js (Enhanced main component)
├── components/
│   ├── MediaUploader.js (File upload with progress)
│   ├── CostCalculator.js (Real-time cost calculation)
│   ├── RunningAdsCounter.js (Live counter with analytics)
│   ├── AdvertisementTypeSelector.js (Type selection)
│   ├── AdvertisementPreview.js (Media preview)
│   └── BackendStatus.js (Backend connection status)
├── types/
│   ├── PhotoAdvertisement.js (Photo ad creation)
│   ├── VideoAdvertisement.js (Video ad creation)
│   └── MixedMediaSlider.js (Mixed media slider)
└── utils/
    ├── advertisementUtils.js (Core utilities)
    └── fileUploadUtils.js (File upload utilities)
```

## 🎯 Features Implemented

### ✅ Phase 1: Enhanced Advertisement Creation
- **Photo Advertisement**: Single image upload with local storage
- **Video Advertisement**: Single video upload with requirements guide
- **Mixed Media Slider**: Images + videos in same slider (up to 10 files)
- **Real-time Cost Calculator**: Dynamic pricing with slot availability
- **Live Running Counter**: Shows currently active advertisements
- **Modern UI/UX**: Responsive design with dark mode support

### 🔄 File Upload System
- **Local Storage**: Files uploaded to your server (no external dependencies)
- **Progress Tracking**: Real-time upload progress with visual feedback
- **File Validation**: Comprehensive validation for size, type, and format
- **Mixed Media Support**: Images and videos in same upload
- **Preview System**: Instant preview of uploaded media

### 💰 Cost Management
- **Dynamic Pricing**: Real-time cost calculation based on duration and type
- **Slot Availability**: Check if advertisement slots are free
- **Rate Display**: Show base rates, discounts, and total costs
- **Currency Formatting**: Professional currency display

## 🛠️ Troubleshooting

### Backend Not Available Error
If you see "Backend Server Not Available":

1. **Check if backend is running**:
   ```bash
   cd deviceinfohub-server
   npm start
   ```

2. **Verify backend is accessible**:
   Visit `http://localhost:2000/api/advertisements/public/running-count`

3. **Check console for errors**:
   Open browser dev tools and check for network errors

### File Upload Issues
If file uploads fail:

1. **Check backend file upload routes**:
   Ensure `/api/uploads/*` routes are properly configured

2. **Verify file permissions**:
   Ensure the backend can write to the uploads directory

3. **Check file size limits**:
   Default limit is 50MB per file

### API Connection Issues
If API calls fail:

1. **Check CORS settings**:
   Ensure backend allows requests from frontend origin

2. **Verify authentication**:
   Check if user is properly authenticated

3. **Check network connectivity**:
   Ensure both frontend and backend are accessible

## 🎨 UI/UX Features

### Modern Design
- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Dark Mode Ready**: Following user preference for dark mode
- **Professional Styling**: Clean, modern interface with proper spacing
- **Interactive Elements**: Hover effects, transitions, and smooth animations

### User Experience
- **Real-time Feedback**: Toast notifications for success/error messages
- **Form Validation**: Real-time validation with helpful error messages
- **Progress Indicators**: Upload progress and loading states
- **Preview System**: See exactly how advertisements will appear

## 🔮 Next Steps

### Phase 2: User Request System
- Advertisement request submission
- User dashboard with statistics
- Request status tracking
- Admin approval workflow

### Phase 3: Admin Dashboard
- Advertisement management
- Request approval/rejection
- Analytics and reporting
- Revenue tracking

### Phase 4: Polish & Optimization
- Error handling improvements
- Performance optimization
- Testing and bug fixes
- Additional features

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify both frontend and backend are running
3. Check the network tab for failed API requests
4. Ensure all dependencies are installed correctly

The system is designed to gracefully handle backend unavailability and provide clear feedback to users about the connection status.
