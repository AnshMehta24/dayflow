"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, AlertCircle } from "lucide-react";

interface SalaryInfoTabProps {
  user: any;
  isOwnProfile: boolean;
  isHR: boolean;
}

export default function SalaryInfoTab({ user, isHR }: SalaryInfoTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const salaryInfo = user.salaryInfo || {};

  const [formData, setFormData] = useState({
    monthlyWage: salaryInfo.monthlyWage?.toString() || "50000",
    yearlyWage: salaryInfo.yearlyWage?.toString() || "600000",
    workingDaysPerWeek: salaryInfo.workingDaysPerWeek?.toString() || "5",
    breakTimeHours: salaryInfo.breakTimeHours?.toString() || "1",
    basicSalaryPercent: salaryInfo.basicSalaryPercent?.toString() || "50",
    hraPercent: salaryInfo.hraPercent?.toString() || "50",
    standardPercent: salaryInfo.standardPercent?.toString() || "16.67",
    performancePercent: salaryInfo.performancePercent?.toString() || "8.33",
    ltaPercent: salaryInfo.ltaPercent?.toString() || "8.33",
    employeePFPercent: salaryInfo.employeePFPercent?.toString() || "12",
    employerPFPercent: salaryInfo.employerPFPercent?.toString() || "12",
    professionalTax: salaryInfo.professionalTax?.toString() || "200",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Calculated values
  const monthlyWage = parseFloat(formData.monthlyWage) || 0;
  const yearlyWage = parseFloat(formData.yearlyWage) || 0;

  const basicSalaryPercent = parseFloat(formData.basicSalaryPercent) || 0;
  const basicSalary = (monthlyWage * basicSalaryPercent) / 100;

  const hraPercent = parseFloat(formData.hraPercent) || 0;
  const houseRentAllowance = (basicSalary * hraPercent) / 100;

  const standardPercent = parseFloat(formData.standardPercent) || 0;
  const standardAllowance = (monthlyWage * standardPercent) / 100;

  const performancePercent = parseFloat(formData.performancePercent) || 0;
  const performanceBonus = (basicSalary * performancePercent) / 100;

  const ltaPercent = parseFloat(formData.ltaPercent) || 0;
  const leaveTravelAllowance = (basicSalary * ltaPercent) / 100;

  const totalComponents =
    basicSalary +
    houseRentAllowance +
    standardAllowance +
    performanceBonus +
    leaveTravelAllowance;
  const fixedAllowance = monthlyWage - totalComponents;
  const fixedPercent =
    monthlyWage > 0 ? (fixedAllowance / monthlyWage) * 100 : 0;

  const employeePFPercent = parseFloat(formData.employeePFPercent) || 0;
  const employeePF = (basicSalary * employeePFPercent) / 100;

  const employerPFPercent = parseFloat(formData.employerPFPercent) || 0;
  const employerPF = (basicSalary * employerPFPercent) / 100;

  const professionalTax = parseFloat(formData.professionalTax) || 0;

  useEffect(() => {
    if (isEditing) {
      const monthly = parseFloat(formData.monthlyWage) || 0;
      const yearly = (monthly * 12).toString();
      if (yearly !== formData.yearlyWage) {
        setFormData((prev) => ({ ...prev, yearlyWage: yearly }));
      }
    }
  }, [formData.monthlyWage, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!isHR) return;

    const dataToSave = {
      monthlyWage: monthlyWage.toString(),
      yearlyWage: yearlyWage.toString(),
      workingDaysPerWeek: formData.workingDaysPerWeek,
      breakTimeHours: formData.breakTimeHours,
      basicSalary: basicSalary.toString(),
      basicSalaryPercent: formData.basicSalaryPercent,
      houseRentAllowance: houseRentAllowance.toString(),
      hraPercent: formData.hraPercent,
      standardAllowance: standardAllowance.toString(),
      standardPercent: formData.standardPercent,
      performanceBonus: performanceBonus.toString(),
      performancePercent: formData.performancePercent,
      leaveTravelAllowance: leaveTravelAllowance.toString(),
      ltaPercent: formData.ltaPercent,
      fixedAllowance: fixedAllowance.toString(),
      fixedPercent: fixedPercent.toString(),
      employeePF: employeePF.toString(),
      employeePFPercent: formData.employeePFPercent,
      employerPF: employerPF.toString(),
      employerPFPercent: formData.employerPFPercent,
      professionalTax: formData.professionalTax,
    };

    setIsSaving(true);
    try {
      const response = await fetch(`/api/profile/${user.id}/salary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update salary information");
      }
    } catch (error) {
      console.error("Error updating salary:", error);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = isHR;

  const SalaryField = ({
    label,
    value,
    suffix = "₹ / month",
    percent,
    percentName,
    showPercentInput = false,
  }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-gray-900 font-semibold w-32 text-right">
          ₹{value.toFixed(2)}
        </span>
        <span className="text-gray-400 text-xs w-20">{suffix}</span>
        {percent !== undefined && (
          <>
            {isEditing && canEdit && showPercentInput ? (
              <input
                type="number"
                name={percentName}
                value={formData[percentName as keyof typeof formData]}
                onChange={handleChange}
                step="0.01"
                className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-right text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            ) : (
              <span className="text-teal-600 font-semibold w-20 text-right text-sm">
                {percent.toFixed(2)}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Salary Information
            </h2>
          </div>
          <p className="text-sm text-gray-500 ml-13">
            {isHR
              ? "Edit wage and percentages - amounts are calculated automatically"
              : "Only visible to you and HR"}
          </p>
        </div>
        {canEdit &&
          (!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Edit Salary Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
            </div>
          ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Wage
                </label>
                {isEditing && canEdit ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="monthlyWage"
                      value={formData.monthlyWage}
                      onChange={handleChange}
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">₹ / Month</span>
                  </div>
                ) : (
                  <div className="text-gray-900 text-lg font-semibold py-2">
                    ₹ {monthlyWage.toLocaleString()} / Month
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yearly Wage{" "}
                  <span className="text-teal-600 text-xs">(Auto-calculated)</span>
                </label>
                <div className="text-gray-900 text-lg font-semibold py-2">
                  ₹ {yearlyWage.toLocaleString()} / Year
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days per Week
                </label>
                {isEditing && canEdit ? (
                  <input
                    type="number"
                    name="workingDaysPerWeek"
                    value={formData.workingDaysPerWeek}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold py-2">
                    {formData.workingDaysPerWeek} days
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Time
                </label>
                {isEditing && canEdit ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="breakTimeHours"
                      value={formData.breakTimeHours}
                      onChange={handleChange}
                      step="0.5"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">hours</span>
                  </div>
                ) : (
                  <div className="text-gray-900 font-semibold py-2">
                    {formData.breakTimeHours} hours
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Salary Components
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                Basic salary is calculated as a percentage of monthly wage
              </p>
              <SalaryField
                label="Basic Salary"
                value={basicSalary}
                percent={basicSalaryPercent}
                percentName="basicSalaryPercent"
                showPercentInput={true}
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                HRA is calculated as a percentage of Basic Salary (typically 50%)
              </p>
              <SalaryField
                label="House Rent Allowance"
                value={houseRentAllowance}
                percent={hraPercent}
                percentName="hraPercent"
                showPercentInput={true}
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                Standard allowance as a percentage of monthly wage
              </p>
              <SalaryField
                label="Standard Allowance"
                value={standardAllowance}
                percent={standardPercent}
                percentName="standardPercent"
                showPercentInput={true}
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                Performance bonus calculated as a percentage of basic salary
              </p>
              <SalaryField
                label="Performance Bonus"
                value={performanceBonus}
                percent={performancePercent}
                percentName="performancePercent"
                showPercentInput={true}
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                LTA calculated as a percentage of basic salary
              </p>
              <SalaryField
                label="Leave Travel Allowance"
                value={leaveTravelAllowance}
                percent={ltaPercent}
                percentName="ltaPercent"
                showPercentInput={true}
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3 bg-amber-50 p-2 rounded border-l-4 border-amber-400">
                Fixed allowance = Wage - Total of all other components (Auto-calculated)
              </p>
              <SalaryField
                label="Fixed Allowance"
                value={fixedAllowance}
                percent={fixedPercent}
                showPercentInput={false}
              />
            </div>

            {fixedAllowance < 0 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Component Overflow Warning
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Total components exceed monthly wage by ₹
                    {Math.abs(fixedAllowance).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Provident Fund (PF) Contribution
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
              PF is calculated based on the basic salary (typically 12%)
            </p>
            <SalaryField
              label="Employee PF"
              value={employeePF}
              percent={employeePFPercent}
              percentName="employeePFPercent"
              showPercentInput={true}
            />
            <SalaryField
              label="Employer PF"
              value={employerPF}
              percent={employerPFPercent}
              percentName="employerPFPercent"
              showPercentInput={true}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Tax Deductions
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600 text-sm font-medium">
                Professional Tax
              </span>
              <div className="flex items-center gap-3">
                {isEditing && canEdit ? (
                  <>
                    <input
                      type="number"
                      name="professionalTax"
                      value={formData.professionalTax}
                      onChange={handleChange}
                      className="w-32 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-right text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <span className="text-gray-400 text-xs w-20">₹ / month</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-900 font-semibold w-32 text-right">
                      ₹{professionalTax.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-xs w-20">₹ / month</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
              Professional Tax deducted from the gross salary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}