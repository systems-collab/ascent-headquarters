import { PipelineOverview } from "@/components/admin/pipeline-overview";
import { StageChart } from "@/components/admin/stage-chart";
import { SectorChart } from "@/components/admin/sector-chart";
import { GeoChart } from "@/components/admin/geo-chart";
import { ReadinessHeatmap } from "@/components/admin/readiness-heatmap";
import { FundingGoalsChart } from "@/components/admin/funding-goals-chart";
import { ChallengesChart } from "@/components/admin/challenges-chart";
import { RecentSignupsTable } from "@/components/admin/recent-signups-table";

export default function AdminWarRoomPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">War Room</h1>
      <p className="mb-8 text-gray-600">Ascent cohort analytics</p>
      <div className="space-y-6">
        <PipelineOverview />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StageChart />
          <SectorChart />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GeoChart />
          <ReadinessHeatmap />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FundingGoalsChart />
          <ChallengesChart />
        </div>
        <RecentSignupsTable />
      </div>
    </div>
  );
}
