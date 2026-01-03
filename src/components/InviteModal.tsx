import { Eye, EyeOff, Mail, Phone, User, X } from "lucide-react";
import { useState, FormEvent, ChangeEvent } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: "EMPLOYEE" | "HR";
}

interface InviteResult {
  success: boolean;
  loginId?: string;
  password?: string;
  email?: string;
  error?: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
}

export function InviteModal({
  isOpen,
  onClose,
  companyId,
  companyName,
}: InviteModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const generatedPassword =
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);

      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: generatedPassword,
          confirmPassword: generatedPassword,
          role: formData.role,
          companyId: companyId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          loginId: data.loginId,
          password: generatedPassword,
          email: formData.email,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to invite employee",
        });
      }
    } catch {
      setResult({
        success: false,
        error: "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", role: "EMPLOYEE" });
    setResult(null);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              Invite New Employee
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {result ? (
            <div
              className={`p-4 rounded-lg mb-4 ${
                result.success
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-red-900/30 border border-red-700"
              }`}
            >
              {result.success ? (
                <div>
                  <h3 className="font-semibold text-green-300 mb-3">
                    Employee Invited Successfully!
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-900 p-3 rounded border border-green-700/50">
                      <p className="text-gray-400 mb-1">Login ID:</p>
                      <p className="font-mono font-semibold text-gray-100">
                        {result.loginId}
                      </p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-green-700/50">
                      <p className="text-gray-400 mb-1">Email:</p>
                      <p className="font-mono font-semibold text-gray-100">
                        {result.email}
                      </p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-green-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gray-400">Temporary Password:</p>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-pink-400 hover:text-pink-300 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="font-mono font-semibold text-gray-100">
                        {showPassword ? result.password : "••••••••••••"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Please share these credentials with the employee securely.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-red-300 mb-2">Error</h3>
                  <p className="text-red-400 text-sm">{result.error}</p>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-3 text-sm text-pink-300">
                A temporary password will be generated automatically and
                displayed after invitation.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Inviting..." : "Send Invitation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
