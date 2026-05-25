import { createClient } from "@/lib/supabase/client";
import { loadQuestionnaireData, clearQuestionnaireData, hasQuestionnaireData } from "./questionnaire-storage";

export async function persistQuestionnaireIfNeeded(): Promise<boolean> {
  if (!hasQuestionnaireData()) return false;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const formData = loadQuestionnaireData();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.full_name,
      location: formData.location || null,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;

  const { error: startupError } = await supabase
    .from("startups")
    .upsert({
      founder_id: user.id,
      name: formData.startup_name,
      sector: formData.sector || null,
      description: formData.description || null,
      stage: formData.stage || null,
      team_size: formData.team_size || null,
      has_cofounder: formData.has_cofounder,
      monthly_revenue: formData.monthly_revenue || null,
    }, { onConflict: "founder_id" });

  if (startupError) throw startupError;

  const { error: questionnaireError } = await supabase
    .from("questionnaire_responses")
    .upsert({
      founder_id: user.id,
      raised_before: formData.raised_before,
      amount_raised: formData.amount_raised || null,
      funding_types: formData.funding_types,
      has_pitch_deck: formData.has_pitch_deck || null,
      has_financial_model: formData.has_financial_model || null,
      understands_cap_tables: formData.understands_cap_tables || null,
      identified_investors: formData.identified_investors || null,
      au_landscape_rating: formData.au_landscape_rating || null,
      target_pathways: formData.target_pathways,
      biggest_challenge: formData.biggest_challenge || null,
      target_raise: formData.target_raise || null,
    }, { onConflict: "founder_id" });

  if (questionnaireError) throw questionnaireError;

  const { error: rpcError } = await supabase
    .rpc("compute_readiness_score", { p_founder_id: user.id });

  if (rpcError) throw rpcError;

  clearQuestionnaireData();
  return true;
}
