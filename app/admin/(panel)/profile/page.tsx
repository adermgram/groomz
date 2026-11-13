import Link from "next/link";
import ProfileForm from "../../../../components/ProfileForm";
import { requireAdmin } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

// Reached from the profile menu (top right), not from the main navigation.
export default async function Account() {
  const email = await requireAdmin();
  return (
    <>
      <Link href="/admin" className="bk-back">← Back to bookings</Link>
      <h2 className="ad-h">Account</h2>
      <div className="ad-card">
        <span className="ad-sub">Signed in as</span>
        <b>{email}</b>
      </div>
      <h2 className="ad-h">Change password</h2>
      <ProfileForm />
    </>
  );
}
