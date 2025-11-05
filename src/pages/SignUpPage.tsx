import { SignUp } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";

export default function SignUpPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/assets/netflix-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 bg-black/80 p-10 rounded-2xl shadow-2xl w-[380px] backdrop-blur-sm border border-neutral-800 animate-fadeIn">
        <h1 className="text-3xl font-bold text-white text-center mb-8 drop-shadow">
          Create your <span className="text-red-600">MyFlix</span> account
        </h1>

        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl={`/${MAIN_PATH.browse}`}
          appearance={{
            layout: {
              socialButtonsVariant: "blockButton",
              logoImageUrl: "",
            },
            elements: {
              footer: "hidden",
              formButtonPrimary:
                "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-all",
              formFieldInput:
                "bg-neutral-800 border border-neutral-700 text-white focus:border-red-600 focus:ring-0 rounded-md",
              card: "bg-transparent shadow-none border-0",
              socialButtonsBlockButton:
                "border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold",
              formFieldLabel: "text-gray-300",
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
