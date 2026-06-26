// Example usage of the fetchUserFullProfile API

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFullProfile } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

/**
 * Example component showing how to use the new /users/:id/profile API
 * 
 * The API returns:
 * {
 *   "success": true,
 *   "user": {
 *     "id": "12345",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john@example.com",
 *     "phone": "+919876543210",
 *     "avatar": "https://...",
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

export function useFetchFullProfile(userId: string) {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserFullProfile(userId));
    }
  }, [dispatch, userId]);

  return { user, loading, error };
}

// Example usage in a component:
/*
import { useFetchFullProfile } from '@/hooks/useFetchFullProfile';

function ProfilePage() {
  const { user, loading, error } = useFetchFullProfile('12345');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      
      {user.business && (
        <div>
          <h2>Business Information</h2>
          <p>Business Name: {user.business.name}</p>
          <p>Business Email: {user.business.email}</p>
          <p>Website: {user.business.website}</p>
          {user.business.socialLinks?.instagram && (
            <p>Instagram: {user.business.socialLinks.instagram}</p>
          )}
        </div>
      )}
    </div>
  );
}
*/
