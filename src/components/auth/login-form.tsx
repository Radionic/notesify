import { useNavigate, useSearch } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { EmailAuthForm } from "@/components/auth/email-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGoogleSignIn } from "@/queries/auth/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate({ from: "/auth/login/" });
  const search = useSearch({ from: "/auth/login/" });
  const { mutateAsync: signInWithGoogle, isPending: isLoading } =
    useGoogleSignIn();
  const [error, setError] = useState<string | null>(null);

  const showEmailForm = Boolean(search.mode);

  async function handleGoogleSignIn() {
    try {
      setError(null);
      await signInWithGoogle({ callbackURL: "/viewer" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {showEmailForm
              ? search.mode === "signUp"
                ? "Create Account"
                : search.mode === "forgotPassword"
                  ? "Reset Password"
                  : "Welcome to Notesify AI"
              : "Welcome to Notesify AI"}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-sm">
          {showEmailForm ? (
            <EmailAuthForm
              onBack={() => {
                setError(null);
                navigate({
                  search: { mode: undefined },
                  replace: true,
                });
              }}
              mode={search.mode ?? "signIn"}
              onModeChange={(mode) => {
                navigate({
                  search: { mode },
                  replace: true,
                });
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle />
                {isLoading ? "Continuing..." : "Continue with Google"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setError(null);
                  navigate({
                    search: { mode: "signIn" },
                    replace: true,
                  });
                }}
                disabled={isLoading}
              >
                <Mail />
                Continue with Email
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
