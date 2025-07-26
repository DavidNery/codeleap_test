export default interface Post {
  id: number;
  username: string;
  created_datetime: string;
  title: string;
  content: string;
  liked?: boolean;
}