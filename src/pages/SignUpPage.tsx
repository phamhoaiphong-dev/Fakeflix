import { SignUp } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center">
      <div className="bg-black/70 p-10 rounded-lg shadow-2xl w-[350px]">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl={`/${MAIN_PATH.browse}`}  
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md",
              formFieldInput:
                "bg-neutral-800 border border-neutral-700 text-white",
            },
          }}
        />
      </div>
    </div>
  );
}