"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Building2, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or Login ID is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      alert(result.error || "Failed to sign in");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="h-screen overflow-hidden flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white p-8 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <Building2 className="w-8 h-8" />
            <span className="text-xl font-semibold">DailyFlow</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Daily HR management — simple, organized, and stress-free
          </h1>

          <p className="text-gray-400 mb-12">
            Track attendance, manage teams, and handle approvals faster —
            everything in one dashboard built for HR teams.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  Secure & Reliable
                </h3>
                <p className="text-gray-400 text-xs">
                  Enterprise-grade protection for all employee data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  Team Collaboration
                </h3>
                <p className="text-gray-400 text-xs">
                  Managers and HR working together in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Fast & Efficient</h3>
                <p className="text-gray-400 text-xs">
                  Reduce repetitive work — save hours every week.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-xs">
          © 2026 DailyFlow. All rights reserved.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            Welcome back 👋
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email or Login ID
              </label>

              <input
                type="text"
                {...register("identifier")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                placeholder="john@example.com OR ABJO20260001"
              />

              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-gray-900 hover:underline font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
