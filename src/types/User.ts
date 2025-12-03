export interface User {
  id: string;
  email: string;
  pseudo?: string;
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;

  isActive: boolean;
  lastActiveAt: number;
}
