import SubmitButton from "../../../../components/SubmitButton";
import { admin } from "../../../../lib/supabase-admin";
import { deleteService, saveService } from "../../actions";

export const dynamic = "force-dynamic";

type S = { id: string; name: string; description: string | null; duration_min: number; price_cents: number | null; active: boolean; sort: number };

function Fields({ s }: { s?: S }) {
  return (
    <div className="ad-form">
      {s && <input type="hidden" name="id" value={s.id} />}
      <label>Name<input name="name" defaultValue={s?.name} required /></label>
      <label>Minutes<input name="duration_min" type="number" min={5} step={5} defaultValue={s?.duration_min ?? 30} required /></label>
      <label>Price € (optional)<input name="price" type="number" min={0} step="0.5" defaultValue={s?.price_cents != null ? s.price_cents / 100 : ""} /></label>
      <label>Order<input name="sort" type="number" defaultValue={s?.sort ?? 0} /></label>
      <label style={{ gridColumn: "1 / -1" }}>Description<input name="description" defaultValue={s?.description ?? ""} /></label>
      <label style={{ flexDirection: "row", alignItems: "center", gap: ".5rem" }}><input type="checkbox" name="active" defaultChecked={s ? s.active : true} /> Active</label>
    </div>
  );
}

export default async function Services() {
  const { data } = await admin().from("services").select("*").order("sort");
  return (
    <>
      <h2 className="ad-h">Services</h2>
      {((data ?? []) as S[]).map((s) => (
        <div className="ad-card" key={s.id}>
          <form action={saveService} className="ad-card" style={{ border: 0, padding: 0, margin: 0 }}>
            <Fields s={s} />
            <div className="ad-btns"><SubmitButton>Save</SubmitButton></div>
          </form>
          <form action={deleteService}><input type="hidden" name="id" value={s.id} /><button className="ad-btn">Delete</button></form>
        </div>
      ))}
      <h2 className="ad-h">Add service</h2>
      <form action={saveService} className="ad-card">
        <Fields />
        <div className="ad-btns"><SubmitButton pending="Adding…">Add</SubmitButton></div>
      </form>
    </>
  );
}
