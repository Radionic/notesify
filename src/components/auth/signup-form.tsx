import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEmailSignUp, useGoogleSignIn } from "@/queries/auth/use-auth";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailSignUp = useEmailSignUp();
  const googleSignIn = useGoogleSignIn();

  const isLoading = emailSignUp.isPending || googleSignIn.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleBack() {
    setError(null);
    setShowEmailForm(false);
  }

  async function handleGoogleSignIn() {
    setError(null);

    try {
      await googleSignIn.mutateAsync({ callbackURL: "/library" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
        </CardHeader>
        <CardContent className="w-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {showEmailForm ? (
                <>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {emailSignUp.isPending
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-fit px-0 hover:bg-transparent"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      <ArrowLeft />
                      Back
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <FcGoogle />
                    {googleSignIn.isPending
                      ? "Continuing..."
                      : "Continue with Google"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setError(null);
                      setShowEmailForm(true);
                    }}
                    disabled={isLoading}
                  >
                    <Mail />
                    Continue with Email
                  </Button>
                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}
                </>
              )}
            </div>

            {showEmailForm ? (
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
