import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import supabase from "src/utils/supabase";

export default function useTrackLogin() {
  const { user, isSignedIn } = useUser();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || hasTracked.current) return;

    const trackLogin = async () => {
      try {
        // 1. Lấy IP và location
        let ipData = { ip: "", location: "" };
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          ipData = {
            ip: data.ip || "",
            location: `${data.city}, ${data.country_name}` || "",
          };
        } catch (err) {
          console.warn("IP fetch failed:", err);
        }

        // 2. Insert login log
        const { error: insertError } = await supabase
          .from("login_logs")
          .insert({
            user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            device: navigator.userAgent,
            ip_address: ipData.ip,
            location: ipData.location,
            logged_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Insert login log failed:", insertError);
          return;
        }

        // 🔥 3. GỌI EDGE FUNCTION để check suspicious
        const { data: checkResult, error: fnError } = await supabase.functions.invoke(
          "check-suspicious-login",
          {
            body: { user_id: user.id },
          }
        );

        if (fnError) {
          console.error("Edge function error:", fnError);
        } else if (checkResult?.suspicious) {
          console.log("⚠️ Suspicious login detected - notification sent");
        }

        hasTracked.current = true;
      } catch (error) {
        console.error("Login tracking failed:", error);
      }
    };

    trackLogin();
  }, [isSignedIn, user?.id]);
}
