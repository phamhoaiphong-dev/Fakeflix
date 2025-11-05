import { SignIn } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";

export default function AuthPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/netflix-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Center Form */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="bg-black/80 p-10 rounded-2xl shadow-2xl w-full max-w-[380px] backdrop-blur-sm border border-neutral-800 animate-fadeIn">
          <h1 className="text-3xl font-bold text-white text-center mb-8 drop-shadow">
            Welcome back to <span className="text-red-600">MyFlix</span>
          </h1>

          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl={`/${MAIN_PATH.browse}`}
            appearance={{
              layout: {
                socialButtonsVariant: "blockButton",
                logoImageUrl: "",
              },
              elements: {
                // Ẩn toàn bộ footer (kể cả container)
                footer: "hidden !important",
                footerAction: "hidden !important",
                footerPages: "hidden !important",
                footerLegal: "hidden !important",
                rootBox: "flex justify-center [&_.cl-footer]:hidden [&_.cl-footer]:m-0 [&_.cl-footer]:p-0",

                // Layout
                card: "w-full max-w-[340px] bg-transparent shadow-none border-0 mx-auto",
                form: "flex flex-col gap-4 p-0",
                formFieldInput:
                  "bg-neutral-800 border border-neutral-700 text-white focus:border-red-600 focus:ring-0 rounded-md py-2",
                formButtonPrimary:
                  "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-all w-full",
                socialButtonsBlockButton:
                  "border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-md py-2",
                formFieldLabel: "text-gray-300 text-sm",
                headerTitle: "text-white text-lg font-semibold mb-2 text-center",
                headerSubtitle: "text-gray-400 text-sm text-center mb-4",
              },
              variables: {
                colorText: "white",
                colorBackground: "transparent",
              },
            }}

          />
        </div>
      </div>
    </div>
  );
}
