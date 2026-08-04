import { redirect } from 'next/navigation';

// No self-serve registration -- DBAL's OIDC has no registration grant, and
// accounts are provisioned centrally. Kept only so existing links/bookmarks
// don't 404.
export default function SignUpPage() {
  redirect('/admin/login');
}
