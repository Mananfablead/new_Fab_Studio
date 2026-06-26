// Types for user profile API responses

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface BusinessInfo {
  name: string;
  phone: string;
  email: string;
  website: string;
  socialLinks: SocialLinks;
  showInfo: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: 'admin' | 'photographer' | 'user';
    facialRecognitionRegistered: boolean;
    business: BusinessInfo;
  };
}
