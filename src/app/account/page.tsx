import { redirect } from "next/navigation";
import { getUser } from "@/actions";
import { AccountDetails } from "@/components/account/AccountDetails";

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          My Account
        </h1>
        <p className="text-sm text-neutral-500">
          Your account details are shown below and cannot be edited here.
        </p>
      </div>
      <AccountDetails user={user} />
    </div>
  );
}
