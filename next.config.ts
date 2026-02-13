import { redirect } from 'next/navigation';

export default function Home() {
  // This redirects users from "/" to "/login" automatically
  redirect('/login'); 
}