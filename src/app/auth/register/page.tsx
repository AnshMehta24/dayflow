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
  Mail,
  Phone,
  Lock,
  User,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

const signUpSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    companyLogo: z.string().min(1, "Company logo is required").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
          email: data.email,
          password: data.password,
          redirect: true,
          callbackUrl: "/dashboard",
        });
      }

      router.push("/signin");
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join us today and start managing your company efficiently
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Company Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register("companyName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter your company name"
                      />
                    </div>
                    <label className="cursor-pointer group">
                      <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg">
                        <Upload className="w-5 h-5" />
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
                    <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Image
                        height={48}
                        width={48}
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-12 w-12 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Logo uploaded successfully
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span>{" "}
                      {errors.companyName.message}
                    </p>
                  )}
                  {errors.companyLogo && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span>{" "}
                      {errors.companyLogo.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="text-xs">⚠</span>{" "}
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
