/**
 * Define the interface for user
 */
export interface User {
  name?: string;
  email?: string;
  google_id?: string;
  facebook_id?: string;
  address?: string;
  avatar?: string
  thumbnail?: string;
  created_at?: Date;
  updated_at?: Date;
}
