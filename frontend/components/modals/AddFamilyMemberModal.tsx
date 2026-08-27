"use client";

import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useUiFeedback } from "@/components/ui/UiFeedbackProvider";

interface FamilyMember {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  familyMembers?: FamilyMember[];
}

interface MemberForm {
  fullName: string;
  email: string;
  relationship: string;
  generation: string;
  status: string;
  gender: string;
  parentId: string;
  partnerId: string;
}

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Grandson",
  "Granddaughter",
  "Uncle",
  "Aunt",
  "Cousin",
  "Nephew",
  "Niece",
  "Father-in-law",
  "Mother-in-law",
  "Brother-in-law",
  "Sister-in-law",
  "Son-in-law",
  "Daughter-in-law",
  "Stepfather",
  "Stepmother",
  "Stepbrother",
  "Stepsister",
  "Half-brother",
  "Half-sister",
];

export default function AddFamilyMemberModal({ isOpen, onClose, onSuccess, familyMembers = [] }: AddFamilyMemberModalProps) {
  const { toast } = useUiFeedback();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MemberForm>({
    fullName: "",
    email: "",
    relationship: "",
    generation: "3",
    status: "living",
    gender: "",
    parentId: "",
    partnerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/family/members", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        relationship: form.relationship.trim() || undefined,
        generation: form.generation ? Number(form.generation) : undefined,
        status: form.status,
        gender: form.gender || undefined,
        parentId: form.parentId.trim() || undefined,
        partnerId: form.partnerId.trim() || undefined,
      });

      toast("Family member added successfully");
      setForm({ fullName: "", email: "", relationship: "", generation: "3", status: "living", gender: "", parentId: "", partnerId: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3]">
          <h2 className="text-lg font-semibold text-[#3A2E22]">Add family member</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8B5E3C]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Full name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              placeholder="e.g. Grace Ntwari"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              placeholder="e.g. grace@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Relationship</label>
            <select
              value={form.relationship}
              onChange={(e) => setForm((prev) => ({ ...prev, relationship: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="living">Living</option>
              <option value="remembered">Remembered</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Generation</label>
            <select
              value={form.generation}
              onChange={(e) => setForm((prev) => ({ ...prev, generation: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="1">1 - Elders</option>
              <option value="2">2 - Their children</option>
              <option value="3">3 - Your generation</option>
              <option value="4">4 - The little ones</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Partner (optional)</label>
            <select
              value={form.partnerId}
              onChange={(e) => setForm((prev) => ({ ...prev, partnerId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="">None</option>
              {familyMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#3A2E22]">Parent (optional)</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
            >
              <option value="">None</option>
              {familyMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#EDE3D3] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#EDE3D3] text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} onClick={handleSubmit as any} className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors disabled:opacity-50">
            {loading ? "Adding..." : "Add member"}
          </button>
        </div>
      </div>
    </div>
  );
}
