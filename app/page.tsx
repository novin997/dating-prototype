import Flow from "./Flow";

export default function Home() {
  return (
    <main className="page">
      <Flow plannerEnabled={process.env.DATE_PLANNER === "on"} />
    </main>
  );
}
