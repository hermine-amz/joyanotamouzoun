import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Globe, Calendar, Activity, CheckCircle, RefreshCcw } from "lucide-react";
import { getTotalUsersCount, getVisitsStats } from "@/api/analytics";
import { siteSettingsQuery } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLang } from "@/lib/lang";

export function AnalyticsDashboard() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<"day" | "month" | "year">("day");

  const { data: totalUsers = 0, isLoading: loadingUsers } = useQuery({
    queryKey: ["total_users"],
    queryFn: () => getTotalUsersCount(),
  });

  const { data: visitsStats = [], isLoading: loadingStats } = useQuery({
    queryKey: ["visits_stats", period],
    queryFn: () => getVisitsStats({ data: { period } }),
  });

  const { data: settings } = useQuery(siteSettingsQuery);

  const toggleOnlineCounter = useMutation({
    mutationFn: async (show: boolean) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "show_online_counter", value: show ? "true" : "false" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success(t({ fr: "Réglage enregistrée", en: "Setting saved" }));
    },
    onError: (err) => toast.error(err.message),
  });

  const showOnlineCounter = settings?.['show_online_counter'] === "true";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI: Utilisateurs Inscrits */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t({ fr: "Inscrits (Total)", en: "Registered Users" })}
            </span>
            <Users className="size-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loadingUsers ? (
              <div className="h-7 w-16 animate-pulse bg-slate-100 rounded" />
            ) : (
              <p className="text-2xl font-bold text-slate-800">{totalUsers}</p>
            )}
          </div>
        </div>

        {/* Compteur en ligne (Paramètre) */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px] lg:col-span-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t({ fr: "Compteur en temps réel (Site public)", en: "Real-time Counter (Public Site)" })}
            </span>
            <Activity className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-500 max-w-sm">
              {t({
                fr: "Affiche le nombre de visiteurs en ligne actuellement sur le site.",
                en: "Displays the number of visitors currently online on the site.",
              })}
            </p>
            <button
              onClick={() => toggleOnlineCounter.mutate(!showOnlineCounter)}
              disabled={toggleOnlineCounter.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showOnlineCounter ? "bg-emerald-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showOnlineCounter ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Graphique des visites */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Globe className="size-4 text-accent" />
            {t({ fr: "Visites de la plateforme", en: "Platform visits" })}
          </h3>
          
          {/* Filtres */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE6DF]">
            {(["day", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${
                  period === p
                    ? "bg-white text-slate-900 shadow-sm border border-[#EAE6DF]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t({
                  fr: p === "day" ? "Jour" : p === "month" ? "Mois" : "Année",
                  en: p === "day" ? "Day" : p === "month" ? "Month" : "Year",
                })}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          {loadingStats ? (
            <div className="w-full h-full flex items-center justify-center">
              <RefreshCcw className="size-6 text-slate-300 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6DF" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#FAF7F2' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE6DF', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar dataKey="visiteurs" name={t({ fr: "Visiteurs", en: "Visitors" })} fill="#0c2340" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
