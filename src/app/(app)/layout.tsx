import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/current-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar userName={user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </>
  );
}