import { redirect } from "next/navigation";

// Old /calculators URL redirects to the unified /invest page
export default function CalculatorsRedirect() {
  redirect("/invest");
}
