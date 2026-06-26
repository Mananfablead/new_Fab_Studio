/**
 * API Call Example: /users/{user_id}/profile
 * 
 * This file demonstrates how the API is called and what it returns
 */

import api from '@/services/api';

// Method 1: Direct API Call
export async function fetchUserProfileDirect(userId: string) {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Method 2: Using Redux Thunk (Recommended)
// See: src/store/slices/authSlice.ts -> fetchUserFullProfile

// Method 3: Using Custom Hook (Easiest)
// See: src/hooks/useFetchFullProfile.ts

/**
 * Example API Response:
 * 
 * {
 *   "success": true,
 *   "user": {
 *     "id": "12345",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+919876543210",
 *     "avatar": "https://fabphotopic.fableadtech.in/services/public/images/avatars/1714000000_abc.jpg",
 *     "role": "photographer",
 *     "facialRecognitionRegistered": false,
 *     "business": {
 *       "name": "John Doe Photography",
 *       "phone": "+919876543210",
 *       "email": "contact@johndoe.com",
 *       "website": "https://johndoe.com",
 *       "socialLinks": {
 *         "instagram": "johndoe_photo"
 *       },
 *       "showInfo": true
 *     }
 *   }
 * }
 */

// Usage in Component:
/*
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFullProfile } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    // This calls: GET /users/12345/profile
    dispatch(fetchUserFullProfile('12345'));
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <p>Email: {user?.email}</p>
      {user?.business && (
        <div>
          <h2>Business: {user.business.name}</h2>
          <p>Website: {user.business.website}</p>
        </div>
      )}
    </div>
  );
}
*/
