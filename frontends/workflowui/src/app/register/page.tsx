/**
 * Register Page - no self-serve registration under DBAL SSO; redirects to
 * the one real sign-in page.
 */

import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/login');
}
