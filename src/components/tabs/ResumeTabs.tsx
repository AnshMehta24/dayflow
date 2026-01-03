"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResumeTabProps {
  user: any;
  isOwnProfile: boolean;
}

export default function ResumeTab({ user, isOwnProfile }: ResumeTabProps) {
  const router = useRouter();
  const [skills, setSkills] = useState(user.skills || []);
  const [certifications, setCertifications] = useState(
    user.certifications || []
  );
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);

  const [aboutText, setAboutText] = useState(user.about || "");
  const [jobLoveText, setJobLoveText] = useState(user.jobLove || "");
  const [interestsText, setInterestsText] = useState(user.interests || "");

  const addSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const response = await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newSkill }),
      });

      if (response.ok) {
        const skill = await response.json();
        setSkills([...skills, skill.data]);
        setNewSkill("");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/profile/skills/${skillId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSkills(skills.filter((s: any) => s.id !== skillId));
      }
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const addCertification = async () => {
    if (!newCert.trim()) return;

    try {
      const response = await fetch("/api/profile/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newCert }),
      });

      if (response.ok) {
        const cert = await response.json();
        setCertifications([...certifications, cert.data]);
        setNewCert("");
      }
    } catch (error) {
      console.error("Error adding certification:", error);
    }
  };

  const removeCertification = async (certId: string) => {
    try {
      const response = await fetch(`/api/profile/certifications/${certId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCertifications(certifications.filter((c: any) => c.id !== certId));
      }
    } catch (error) {
      console.error("Error removing certification:", error);
    }
  };

  const saveAbout = async () => {
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: aboutText }),
      });

      if (response.ok) {
        setIsEditingAbout(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving about:", error);
    }
  };

  const saveJobLove = async () => {
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobLove: jobLoveText }),
      });

      if (response.ok) {
        setIsEditingJob(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving job love:", error);
    }
  };

  const saveInterests = async () => {
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: interestsText }),
      });

      if (response.ok) {
        setIsEditingInterests(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* About Section */}
        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">About</h3>
          {isOwnProfile && isEditingAbout ? (
            <div>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveAbout}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setAboutText(user.about || "");
                    setIsEditingAbout(false);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => isOwnProfile && setIsEditingAbout(true)}
              className={`${
                isOwnProfile ? "cursor-pointer hover:bg-gray-50" : ""
              } p-2 rounded transition-colors`}
            >
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.about || "Not Specified"}
              </p>
            </div>
          )}
        </div>

        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            What I love about my job
          </h3>
          {isOwnProfile && isEditingJob ? (
            <div>
              <textarea
                value={jobLoveText}
                onChange={(e) => setJobLoveText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                placeholder="What do you love about your job..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveJobLove}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setJobLoveText(user.jobLove || "");
                    setIsEditingJob(false);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => isOwnProfile && setIsEditingJob(true)}
              className={`${
                isOwnProfile ? "cursor-pointer hover:bg-gray-50" : ""
              } p-2 rounded transition-colors`}
            >
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.jobLove || "Not Specified"}
              </p>
            </div>
          )}
        </div>

        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            My interests and hobbies
          </h3>
          {isOwnProfile && isEditingInterests ? (
            <div>
              <textarea
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                placeholder="Tell us about your interests..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveInterests}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setInterestsText(user.interests || "");
                    setIsEditingInterests(false);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => isOwnProfile && setIsEditingInterests(true)}
              className={`${
                isOwnProfile ? "cursor-pointer hover:bg-gray-50" : ""
              } p-2 rounded transition-colors`}
            >
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.interests || "Not Specified"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Skills & Certifications */}
      <div className="space-y-8">
        {/* Skills */}
        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Skills</h3>
          <div className="min-h-[200px] mb-4">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{skill.name}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No skills added yet</div>
            )}
          </div>
          {isOwnProfile && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Certifications
          </h3>
          <div className="min-h-[200px] mb-4">
            {certifications.length > 0 ? (
              <div className="space-y-2">
                {certifications.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{cert.name}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => removeCertification(cert.id)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                No certifications added yet
              </div>
            )}
          </div>
          {isOwnProfile && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCertification()}
                placeholder="Add a certification..."
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
