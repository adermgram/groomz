import AdminNav from "../../../components/AdminNav";
import { requireAdmin } from "../../../lib/supabase-server";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await requireAdmin();
  return (
    <div className="ad">
      <AdminNav />
      <div className="ad-top">
        <h1>GROOMS admin</h1>
        <form action={signOut}><button className="ad-btn" title={email}>Sign out</button></form>
      </div>
      {children}
    </div>
  );
}
