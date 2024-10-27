export interface User {
  name: string;
  email: string;
  password: string;
}

export interface Post {
  title: string;
  content: string;
  user_id: number
}

export interface Review {
  comment: string;
  user_id: number;
  post_id: number;
}