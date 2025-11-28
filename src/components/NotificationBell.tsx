// src/components/NotificationBell.tsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react"; // 🔥 THÊM
import supabase from "src/utils/supabase"; // 🔥 Dùng supabase client có sẵn

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  movie_slug?: string;
  created_at: string;
  read: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  
  // 🔥 DÙNG CLERK
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    // 🔥 CHECK CLERK USER
    if (!isSignedIn || !user) return;

    const init = async () => {
      // Lấy thông báo ban đầu
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id) // 🔥 Dùng Clerk user.id
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }

      // Realtime: có thông báo mới → tự động cập nhật + confetti
      const channel = supabase
        .channel(`notifications-${user.id}`) // 🔥 Unique channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNoti = payload.new as Notification;
            setNotifications((prev) => [newNoti, ...prev]);
            setUnreadCount((prev) => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    init();
  }, [isSignedIn, user?.id]); // 🔥 Dependencies

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    
    // 🔥 Update UI ngay
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-white hover:text-gray-300 transition-colors p-2"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 bg-black border border-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-800 sticky top-0 bg-black">
            <h3 className="text-lg font-bold text-white">Thông báo</h3>
          </div>

          {notifications.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Chưa có thông báo nào</p>
          ) : (
            notifications.map((noti) => (
              <div
                key={noti.id}
                onClick={() => {
                  if (!noti.read) markAsRead(noti.id);
                  
                  // Navigate nếu có movie_slug
                  if (noti.movie_slug) {
                    navigate(`/watch/${noti.movie_slug}`);
                  }
                  
                  setShowDropdown(false);
                }}
                className={`p-4 border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition ${
                  !noti.read ? "bg-gray-900/70" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{noti.title}</p>
                    <p className="text-sm text-gray-300 mt-1">{noti.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(noti.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!noti.read && <div className="w-3 h-3 bg-red-600 rounded-full flex-shrink-0" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}