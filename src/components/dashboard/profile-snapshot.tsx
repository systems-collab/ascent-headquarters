import Link from "next/link";
import { SECTOR_LABELS, STAGE_LABELS, LOCATION_LABELS } from "@/lib/constants";
import type { Profile, Startup } from "@/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ProfileSnapshotProps {
  profile: Profile;
  startup: Startup;
}

export function ProfileSnapshot({ profile, startup }: ProfileSnapshotProps) {
  const sector = startup.sector ? SECTOR_LABELS[startup.sector] : "Not set";
  const stage = startup.stage ? STAGE_LABELS[startup.stage] : "Not set";
  const location = profile.location
    ? LOCATION_LABELS[profile.location]
    : "Not set";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Startup</dt>
            <dd className="font-medium">{startup.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sector</dt>
            <dd className="font-medium">{sector}</dd>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <dt className="text-muted-foreground">Stage</dt>
              <dd>
                <span className="inline-flex items-center rounded-full bg-fishburners-50 px-2.5 py-0.5 text-xs font-medium text-fishburners-700">
                  {stage}
                </span>
              </dd>
            </div>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-medium">{location}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Link
          href="/profile"
          className="text-sm font-medium text-fishburners-600 hover:text-fishburners-700"
        >
          Edit profile &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
