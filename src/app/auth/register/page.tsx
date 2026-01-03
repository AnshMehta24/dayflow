"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  Upload,
  Building2,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { signUpSchema } from "@/utils/zodSchema";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("companyLogo", { message: "File size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setValue("companyLogo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to sign up");
      }

      if (response.ok) {
        await signIn("credentials", {
          identifier: data.email,
          password: data.password,
          redirect: true,
          callbackUrl: "/dashboard",
        });
      }

      router.push("/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex">
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
            From onboarding to attendance, payroll, performance reviews, and
            approvals — everything your HR team needs in one clean dashboard.
            Spend less time on admin and more time supporting your people.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" color="black" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm">
                  Secure employee records
                </h3>
                <p className="text-gray-400 text-xs">
                  Store documents, contracts, and sensitive data safely — with
                  permissions and role-based access control.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" color="black" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm">
                  Smooth daily workflows
                </h3>
                <p className="text-gray-400 text-xs">
                  Handle attendance, leave requests, onboarding, and approvals —
                  all in one place, fully tracked and auditable.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5" color="black" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm">
                  Faster decision making
                </h3>
                <p className="text-gray-400 text-xs">
                  Real-time insights help HR and managers take action quickly on
                  staffing, performance, and compliance tasks.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-gray-400 text-xs">
          © 2026 YourCompany. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Company Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  {...register("companyName")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                  placeholder="Enter company name"
                />
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-md">
                    <Upload className="w-4 h-4" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {logoPreview && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    height={32}
                    width={32}
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-8 w-8 object-cover rounded"
                  />
                  <span className="text-xs text-gray-500">Logo uploaded</span>
                </div>
              )}
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.companyName.message}
                </p>
              )}
              {errors.companyLogo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.companyLogo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
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

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-gray-900 hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
