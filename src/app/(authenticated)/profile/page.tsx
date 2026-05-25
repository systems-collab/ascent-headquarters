"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  Startup,
  Stage,
  Sector,
  TeamSize,
  MonthlyRevenue,
  AuLocation,
} from "@/types/database";
import { STAGE_LABELS, SECTOR_LABELS, LOCATION_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TEAM_SIZE_LABELS: Record<TeamSize, string> = {
  solo: "Solo",
  "2_3": "2-3",
  "4_10": "4-10",
  "11_plus": "11+",
};

const REVENUE_LABELS: Record<MonthlyRevenue, string> = {
  pre_revenue: "Pre-revenue",
  under_5k: "Under $5k",
  "5k_20k": "$5k - $20k",
  "20k_100k": "$20k - $100k",
  "100k_plus": "$100k+",
};

interface FormState {
  fullName: string;
  location: AuLocation | "";
  startupName: string;
  sector: Sector | "";
  stage: Stage | "";
  teamSize: TeamSize | "";
  description: string;
  monthlyRevenue: MonthlyRevenue | "";
}

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    location: "",
    startupName: "",
    sector: "",
    stage: "",
    teamSize: "",
    description: "",
    monthlyRevenue: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [profileRes, startupRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("startups")
          .select("*")
          .eq("founder_id", user.id)
          .maybeSingle(),
      ]);

      const profile = profileRes.data as Profile | null;
      const startup = startupRes.data as Startup | null;

      setForm({
        fullName: profile?.full_name ?? "",
        location: profile?.location ?? "",
        startupName: startup?.name ?? "",
        sector: startup?.sector ?? "",
        stage: startup?.stage ?? "",
        teamSize: startup?.team_size ?? "",
        description: startup?.description ?? "",
        monthlyRevenue: startup?.monthly_revenue ?? "",
      });

      setLoading(false);
    }

    load();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: "error", text: "Not authenticated." });
        setSaving(false);
        return;
      }

      const profileUpdate = supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          location: form.location || null,
        })
        .eq("id", user.id);

      const startupUpdate = supabase
        .from("startups")
        .update({
          name: form.startupName,
          sector: form.sector || null,
          stage: form.stage || null,
          team_size: form.teamSize || null,
          description: form.description || null,
          monthly_revenue: form.monthlyRevenue || null,
        })
        .eq("founder_id", user.id);

      const [profileRes, startupRes] = await Promise.all([
        profileUpdate,
        startupUpdate,
      ]);

      if (profileRes.error || startupRes.error) {
        const errText =
          profileRes.error?.message ??
          startupRes.error?.message ??
          "Failed to save changes.";
        setMessage({ type: "error", text: errText });
      } else {
        setMessage({ type: "success", text: "Changes saved." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your founder and startup details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <select
            id="location"
            value={form.location}
            onChange={(e) =>
              updateField("location", e.target.value as AuLocation | "")
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select location</option>
            {Object.entries(LOCATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Startup Name */}
        <div className="space-y-2">
          <Label htmlFor="startupName">Startup name</Label>
          <Input
            id="startupName"
            value={form.startupName}
            onChange={(e) => updateField("startupName", e.target.value)}
          />
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <select
            id="sector"
            value={form.sector}
            onChange={(e) =>
              updateField("sector", e.target.value as Sector | "")
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select sector</option>
            {Object.entries(SECTOR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            value={form.stage}
            onChange={(e) =>
              updateField("stage", e.target.value as Stage | "")
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select stage</option>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team size</Label>
          <select
            id="teamSize"
            value={form.teamSize}
            onChange={(e) =>
              updateField("teamSize", e.target.value as TeamSize | "")
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select team size</option>
            {Object.entries(TEAM_SIZE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => {
              if (e.target.value.length <= 140) {
                updateField("description", e.target.value);
              }
            }}
            maxLength={140}
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-xs text-gray-400">
            {form.description.length}/140 characters
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="space-y-2">
          <Label htmlFor="monthlyRevenue">Monthly revenue</Label>
          <select
            id="monthlyRevenue"
            value={form.monthlyRevenue}
            onChange={(e) =>
              updateField(
                "monthlyRevenue",
                e.target.value as MonthlyRevenue | ""
              )
            }
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select revenue range</option>
            {Object.entries(REVENUE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Link
          href="/mission-briefing"
          className="text-sm text-fishburners-600 hover:underline"
        >
          Retake assessment
        </Link>
      </div>
    </div>
  );
}
