import type { Metadata } from "next";
import Flow from "../Flow";

export const metadata: Metadata = {
  title: "Try the prototype",
  description: "A 3-minute research prototype about dating in Singapore.",
};

export default function TryPage() {
  return (
    <main className="page">
      <Flow plannerEnabled={process.env.DATE_PLANNER === "on"} />
    </main>
  );
}
