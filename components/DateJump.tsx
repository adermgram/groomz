"use client";
import { useRouter } from "next/navigation";

/** "Go to date" picker: jump straight to any day, week or month. */
export default function DateJump({ value, hrefBase }: { value: string; hrefBase: string }) {
  const router = useRouter();
  return (
    <label className="cal-jump">
      <span>Go to date</span>
      <input
        type="date"
        value={value}
        onChange={(e) => e.target.value && router.push(`${hrefBase}&date=${e.target.value}`)}
      />
    </label>
  );
}
