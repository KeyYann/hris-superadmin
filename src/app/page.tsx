import { redirect } from 'next/navigation';

export default function Home() {
  // This triggers a redirect to the /login route
  redirect('/login');
}