import { SignIn } from "@clerk/clerk-react";

export default function AuthPage() {
    return (
        <div
            className="flex items-center justify-center h-screen bg-cover bg-center"
            style={{
                backgroundImage:
                    "url(https://assets.nflxext.com/ffe/siteui/vlv3/f8b33b35-7cb2-4958-90d5-65a57b815cd2/3b5b57c4-35a2-472a-b592-14b3a8680b93/VN-en-20240506-popsignuptwoweeks-perspective_alpha_website_medium.jpg)",
            }}
        >
            <div className="bg-black/70 p-10 rounded-lg shadow-2xl w-[350px]">
                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    Sign in to Myflix
                </h1>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            formButtonPrimary:
                                "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md",
                            formFieldInput:
                                "bg-neutral-800 border border-neutral-700 text-white",
                            footerActionLink: "text-red-500 hover:underline",
                        },
                        variables: {
                            colorText: "white",
                            colorBackground: "transparent",
                            fontFamily: "Inter, sans-serif",
                        },
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                />
            </div>
        </div>
    );
}
