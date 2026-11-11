import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function BookingBar() {
  return (
    <div className="bk-top">
      <Link href="/" className="bk-brand" aria-label="GROOMS home">
        <img src="/assets/logo.jpg" alt="" className="brand-logo" />
        <span>GROOMS</span>
      </Link>
      <ThemeToggle />
    </div>
  );
}
