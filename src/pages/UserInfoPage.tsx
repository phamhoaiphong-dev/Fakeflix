import { UserProfile } from "@clerk/clerk-react";

export default function UserInfoPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/assets/netflix-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 bg-black/80 p-10 rounded-2xl shadow-2xl w-full max-w-[900px] backdrop-blur-sm border border-neutral-800 animate-fadeIn">
        <h1 className="text-3xl font-bold text-white text-center mb-8 drop-shadow">
          Account Settings
        </h1>

        <UserProfile
          appearance={{
            layout: {
              logoImageUrl: "",
              socialButtonsVariant: "iconButton",
            },
            elements: {
              footer: "hidden",
              navbar: "hidden",
              card: "bg-transparent border-0 shadow-none",
              formButtonPrimary:
                "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-all",
              formFieldInput:
                "bg-neutral-800 border border-neutral-700 text-white focus:border-red-600 focus:ring-0 rounded-md",
              headerTitle: "text-white text-2xl font-semibold",
              headerSubtitle: "text-gray-400",
              profileSectionTitle: "text-gray-300 font-medium",
              profileSectionPrimaryButton:
                "bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md",
            },
            variables: {
              colorText: "white",
              colorBackground: "transparent",
            },
          }}
        />
      </div>
    </div>
  );
}
