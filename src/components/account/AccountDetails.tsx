import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Mail, Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccountUser {
  email: string;
  username: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  role: string;
  status: string;
}

const PLACEHOLDER = "—";

function displayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : PLACEHOLDER;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}

function DetailRow({ icon, label, value, isLast }: DetailRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 text-neutral-600">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            {icon}
          </span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm font-semibold text-neutral-900">{value}</div>
      </div>
      {!isLast && <Separator />}
    </div>
  );
}

export function AccountDetails({ user }: { user: AccountUser }) {
  const isActive = user.status === "Active";
  const fullName = [user.firstName, user.lastName]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");
  const displayName = fullName.length > 0 ? fullName : user.username;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr]">
        {/* Identity panel */}
        <div className="flex flex-col items-center gap-4 bg-blue-950 px-6 py-10 text-white">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/20">
            <UserIcon className="h-12 w-12 text-white/70" />
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{displayName}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-blue-200">
              {user.role} Account
            </div>
          </div>
          <Separator className="bg-white/10" />
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2",
              isActive ? "bg-emerald-500/15" : "bg-neutral-500/15"
            )}
          >
            <CheckCircle2
              className={cn(
                "h-5 w-5",
                isActive ? "text-emerald-400" : "text-neutral-400"
              )}
            />
            <div className="text-left">
              <div className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                Status
              </div>
              <div
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-emerald-400" : "text-neutral-300"
                )}
              >
                {user.status}
              </div>
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div className="px-6 py-6 sm:px-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-950 text-white">
              <UserIcon className="h-4 w-4" />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900">
              User Information
            </h2>
          </div>
          <Separator className="mb-2" />

          <DetailRow
            icon={<UserIcon className="h-4 w-4" />}
            label="User First Name"
            value={displayValue(user.firstName)}
          />
          <DetailRow
            icon={<UserIcon className="h-4 w-4" />}
            label="User Middle Name"
            value={displayValue(user.middleName)}
          />
          <DetailRow
            icon={<UserIcon className="h-4 w-4" />}
            label="User Last Name"
            value={displayValue(user.lastName)}
          />
          <DetailRow
            icon={<Mail className="h-4 w-4" />}
            label="User Email"
            value={user.email}
          />
          <DetailRow
            icon={<UserIcon className="h-4 w-4" />}
            label="Username"
            value={user.username}
          />
          <DetailRow
            icon={<Shield className="h-4 w-4" />}
            label="Role"
            value={user.role}
          />
          <DetailRow
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Status"
            value={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                {user.status}
              </span>
            }
            isLast
          />
        </div>
      </div>
    </div>
  );
}
