import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useEmailSignIn,
  useEmailSignUp,
  useRequestPasswordReset,
} from "@/queries/auth/use-auth";

export type EmailAuthMode = "signIn" | "signUp" | "forgotPassword";

export function EmailAuthForm({
  onBack,
  mode,
  onModeChange,
}: {
  onBack: () => void;
  mode: EmailAuthMode;
  onModeChange: (mode: EmailAuthMode) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailSignIn = useEmailSignIn();
  const emailSignUp = useEmailSignUp();
  const requestPasswordReset = useRequestPasswordReset();

  const isLoading =
    emailSignIn.isPending ||
    emailSignUp.isPending ||
    requestPasswordReset.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      if (mode === "forgotPassword") {
        await requestPasswordReset.mutateAsync({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        toast.success(
          "Sent the password reset link. Please check your inbox.",
          {
            position: "bottom-right",
            duration: 10000,
          },
        );
        return;
      }

      if (mode === "signIn") {
        await emailSignIn.mutateAsync({
          email,
          password,
          callbackURL: "/library",
        });
        return;
      } else {
        await emailSignUp.mutateAsync({
          name,
          email,
          password,
          callbackURL: "/library",
        });

        toast.success("Verification email sent. Please check your inbox.", {
          position: "bottom-right",
          duration: 10000,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleToggleMode() {
    setError(null);
    onModeChange(mode === "signIn" ? "signUp" : "signIn");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {mode === "forgotPassword" ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {requestPasswordReset.isPending
                ? "Sending reset link..."
                : "Send reset link"}
            </Button>
          </>
        ) : (
          <>
            {mode === "signUp" ? (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isLoading}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
              />
              {mode === "signUp" ? (
                <p className="text-sm text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              ) : null}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {mode === "signIn"
                ? emailSignIn.isPending
                  ? "Logging in..."
                  : "Login"
                : emailSignUp.isPending
                  ? "Creating account..."
                  : "Create Account"}
            </Button>
          </>
        )}

        <div className="flex items-center justify-between text-sm">
          <Button
            type="button"
            variant="ghost"
            className="w-fit px-0 hover:bg-transparent"
            onClick={() => {
              setError(null);

              if (mode === "forgotPassword") {
                onModeChange("signIn");
                return;
              }

              onBack();
            }}
            disabled={isLoading}
          >
            <ArrowLeft />
            Back
          </Button>

          {mode === "signIn" ? (
            <button
              type="button"
              className="inline-block text-sm cursor-pointer"
              onClick={() => {
                setError(null);
                onModeChange("forgotPassword");
              }}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          ) : null}
        </div>
      </div>

      {mode === "forgotPassword" ? null : (
        <div className="mt-4 text-center text-sm">
          {mode === "signIn" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="underline underline-offset-4 cursor-pointer"
                onClick={handleToggleMode}
                disabled={isLoading}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="underline underline-offset-4 cursor-pointer"
                onClick={handleToggleMode}
                disabled={isLoading}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
