import { describe, it, expect, vi } from 'vitest';

// Test the error message detection logic directly
describe('User Not Found Detection Logic', () => {
  it('should detect exact "User not found" message', () => {
    const errorData = {
      success: false,
      message: 'User not found'
    };
    
    const errorMessage = errorData.message || errorData.error || '';
    const shouldLogout = errorMessage === 'User not found' || errorMessage.includes('User not found');
    
    expect(shouldLogout).toBe(true);
  });

  it('should detect "User not found" within longer message', () => {
    const errorData = {
      success: false,
      error: 'Authentication failed: User not found in database'
    };
    
    const errorMessage = errorData.message || errorData.error || '';
    const shouldLogout = errorMessage === 'User not found' || errorMessage.includes('User not found');
    
    expect(shouldLogout).toBe(true);
  });

  it('should not logout for other error messages', () => {
    const errorData = {
      success: false,
      message: 'Invalid credentials'
    };
    
    const errorMessage = errorData.message || errorData.error || '';
    const shouldLogout = errorMessage === 'User not found' || errorMessage.includes('User not found');
    
    expect(shouldLogout).toBe(false);
  });

  it('should handle missing error data gracefully', () => {
    const errorData = null;
    
    const errorMessage = errorData?.message || errorData?.error || '';
    const shouldLogout = errorMessage === 'User not found' || errorMessage.includes('User not found');
    
    expect(shouldLogout).toBe(false);
  });

  it('should handle empty error data', () => {
    const errorData = {};
    
    const errorMessage = errorData.message || errorData.error || '';
    const shouldLogout = errorMessage === 'User not found' || errorMessage.includes('User not found');
    
    expect(shouldLogout).toBe(false);
  });
});
