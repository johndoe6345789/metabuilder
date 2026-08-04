import { redirect } from 'next/navigation';

// Sign-in now happens through DBAL SSO on the single /admin/login page --
// this route is kept only so existing links/bookmarks don't 404.
export default function SignInPage() {
  redirect('/admin/login');
}
