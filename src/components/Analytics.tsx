import { useEffect, useState, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { recordVisit } from "@/server/analytics";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/site";
import { Users } from "lucide-react";

export function Analytics() {
  const location = useLocation();
  const { data: settings } = useQuery(siteSettingsQuery);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const hasRecordedVisit = useRef(false);

  // 1. Record visit
  useEffect(() => {
    let sessionId = sessionStorage.getItem("joyanot_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      sessionStorage.setItem("joyanot_session_id", sessionId);
    }

    if (!hasRecordedVisit.current) {
      hasRecordedVisit.current = true;
      recordVisit({ data: { sessionId, path: location.pathname } }).catch(console.error);
    }
  }, [location.pathname]);

  // 2. Realtime presence
  useEffect(() => {
    if (settings?.show_online_counter !== "true") return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: sessionStorage.getItem("joyanot_session_id") || "anonymous",
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // The number of unique keys in the presence state is the number of online users
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [settings?.show_online_counter]);

  if (settings?.show_online_counter !== "true") {
    return null;
  }

  // Floating online counter
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-border backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </span>
      <Users className="h-4 w-4 text-muted-foreground" />
      <span>{onlineUsers} en ligne</span>
    </div>
  );
}
