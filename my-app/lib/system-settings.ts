import { apiJson } from "@/lib/auth";

export interface SystemSettings {
  id: number;
  applications_enabled: boolean;
  is_application_open: boolean;
  application_open: string | null;
  application_close: string | null;
  required_documents: string[];
}

export const getSystemSettings = () =>
  apiJson<SystemSettings>("/settings", { method: "GET" });

export const getHousingSystemSettings = () =>
  apiJson<SystemSettings>("/housing/settings", { method: "GET" });

export const updateHousingSystemSettings = (
  payload: Partial<
    Pick<
      SystemSettings,
      "applications_enabled" | "application_open" | "application_close"
    > & { required_documents: string[] }
  >,
) =>
  apiJson<SystemSettings>("/housing/settings", {
    method: "PATCH",
    jsonBody: payload,
  });
