/**
 * KYC Form Component
 * Comprehensive Know Your Customer data collection for regulatory compliance
 */

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface KYCFormData {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  citizenship: string;
  employment_status: string;
  employer: string;
  annual_income_range: string;
  net_worth_range: string;
  investment_experience: string;
}

export default function KYCForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<KYCFormData>({
    full_name: "",
    phone_number: "",
    date_of_birth: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "US",
    citizenship: "US",
    employment_status: "",
    employer: "",
    annual_income_range: "",
    net_worth_range: "",
    investment_experience: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/proxy/api/profile/me");
        if (response.ok) {
          const profile = await response.json();
          setFormData({
            full_name: profile.full_name || "",
            phone_number: profile.phone_number || "",
            date_of_birth: profile.date_of_birth || "",
            address_line1: profile.address_line1 || "",
            address_line2: profile.address_line2 || "",
            city: profile.city || "",
            state: profile.state || "",
            zip_code: profile.zip_code || "",
            country: profile.country || "US",
            citizenship: profile.citizenship || "US",
            employment_status: profile.employment_status || "",
            employer: profile.employer || "",
            annual_income_range: profile.annual_income_range || "",
            net_worth_range: profile.net_worth_range || "",
            investment_experience: profile.investment_experience || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/proxy/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 500,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="(555) 123-4567"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Date of Birth *</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Citizenship</label>
            <select
              value={formData.citizenship}
              onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
              style={inputStyle}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Address</h3>

        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="123 Main St"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Apt, Suite, etc. (Optional)</label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Apt 4B"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label style={labelStyle}>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="CA"
                maxLength={2}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>ZIP Code *</label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                placeholder="90210"
                maxLength={10}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={inputStyle}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Employment & Financial Profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Employment Status</label>
            <select
              value={formData.employment_status}
              onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="employed">Employed</option>
              <option value="self_employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Employer (if applicable)</label>
            <input
              type="text"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Annual Income Range</label>
            <select
              value={formData.annual_income_range}
              onChange={(e) => setFormData({ ...formData, annual_income_range: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="<25k">&lt; $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-200k">$100,000 - $200,000</option>
              <option value="200k+">$200,000+</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Net Worth Range</label>
            <select
              value={formData.net_worth_range}
              onChange={(e) => setFormData({ ...formData, net_worth_range: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="<50k">&lt; $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-250k">$100,000 - $250,000</option>
              <option value="250k-500k">$250,000 - $500,000</option>
              <option value="500k+">$500,000+</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label style={labelStyle}>Investment Experience</label>
            <select
              value={formData.investment_experience}
              onChange={(e) => setFormData({ ...formData, investment_experience: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              <option value="none">None - I'm new to investing</option>
              <option value="limited">Limited - Less than 2 years</option>
              <option value="good">Good - 2-5 years</option>
              <option value="extensive">Extensive - 5+ years</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
          Profile updated successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Saving..." : "Save Profile"}
      </button>

      <p className="text-xs text-slate-400 text-center">
        * Required fields. Your information is encrypted and never shared with third parties.
      </p>
    </form>
  );
}
