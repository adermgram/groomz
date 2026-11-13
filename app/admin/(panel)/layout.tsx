import AdminNav from "../../../components/AdminNav";
import ProfileMenu from "../../../components/ProfileMenu";
import { requireAdmin } from "../../../lib/supabase-server";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await requireAdmin();
  return (
    <div className="ad">
      <AdminNav />
      <div className="ad-top">
        <h1>GROOMS admin</h1>
        <ProfileMenu email={email} />
      </div>
      {children}
    </div>
  );
}
