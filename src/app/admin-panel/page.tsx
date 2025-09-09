import { HydrateClient } from "~/trpc/server";
import AdminPanel from "./AdminPanel";

export default function AdminPanelPage() {
  return (
    <HydrateClient>
      <AdminPanel />
    </HydrateClient>
  );
}
