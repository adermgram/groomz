import ProfileForm from "../../../../components/ProfileForm";
import { requireAdmin } from "../../../../lib/supabase-server";
import { signOut } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const email = await requireAdmin();
  return (
    <>
      <h2 className="ad-h">Profile</h2>
      <div className="ad-card">
        <span className="ad-sub">Signed in as</span>
        <b>{email}</b>
        <form action={signOut}><button className="ad-btn">Sign out</button></form>
      </div>
      <h2 className="ad-h">Change password</h2>
      <ProfileForm />
    </>
  );
}
