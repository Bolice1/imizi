"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, Network } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";

interface FamilyMember {
  _id: string;
  fullName: string;
  email: string;
}

interface FamilyData {
  _id: string;
  familyName: string;
  familyMembers: FamilyMember[];
  treeData?: any;
}

interface GenerationGroup {
  elders: FamilyMember[];
  theirChildren: FamilyMember[];
  yourGeneration: FamilyMember[];
  theLittleOnes: FamilyMember[];
}

export default function FamilyTreePage() {
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [generations, setGenerations] = useState<GenerationGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    fetchFamilyTree();
  }, []);

  const fetchFamilyTree = async () => {
    try {
      const result = await api.get("/family/tree");
      if ((result as any).success) {
        setFamily((result as any).family);
        setGenerations((result as any).generations || (result as any).treeData);
      }
    } catch (error) {
      console.error("Failed to fetch family tree:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-[#8B5E3C]",
      "bg-[#A67C52]",
      "bg-[#6B8E23]",
      "bg-[#CD853F]",
      "bg-[#8B7355]",
      "bg-[#4A3428]",
    ];
    return colors[index % colors.length];
  };

  const actions = (
    <div className="flex items-center gap-3">
      <div className="flex rounded-xl border border-[#EDE3D3] overflow-hidden bg-white">
        {["Everyone", "Living", "Remembered"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "Everyone"
                ? "bg-[#3A2E22] text-white"
                : "bg-white text-[#8B5E3C] hover:bg-[#F5EFE6]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
        <UserPlus className="w-4 h-4" />
        Add a family member
      </button>
    </div>
  );

  if (loading) {
    return (
      <InnerLayout title="Family Tree" subtitle="Loading..." actions={actions}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout
      title={family?.familyName || "The Ntwari family"}
      subtitle="Showing your line. Open a branch to bring the rest of the family into view."
      actions={actions}
    >
      <div className="flex gap-8">
        {/* Tree Content */}
        <div className="flex-1">
          <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8">
            {generations ? (
              <div className="space-y-10">
                {/* The Elders */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                      THE ELDERS
                    </h3>
                    <p className="text-[10px] text-[#A6987F] mt-0.5">born 1928-1949</p>
                  </div>
                  <div className="flex gap-10">
                    {generations.elders?.length > 0 ? (
                      generations.elders.map((member, idx) => (
                        <div
                          key={member._id || idx}
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => setSelectedMember(member)}
                        >
                          <div className="relative">
                            <div
                              className={`w-20 h-20 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-lg font-medium`}
                            >
                              {getInitials(member.fullName)}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-[#3A2E22] text-center mt-2">
                            {member.fullName}
                          </p>
                          <p className="text-[10px] text-[#A6987F]">Grandmother</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-green-600 font-medium">Online</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-10">
                        {["Mkhulu Themba", "Gogo Nomsa"].map((name, idx) => (
                          <div key={name} className="flex flex-col items-center">
                            <div className="relative">
                              <div
                                className={`w-20 h-20 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-lg font-medium`}
                              >
                                {getInitials(name)}
                              </div>
                              {idx === 1 && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#3A2E22] text-center mt-2">
                              {name}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "1928 - 2011" : "Grandmother"}
                            </p>
                            {idx === 0 && (
                              <p className="text-[10px] text-[#A6987F]">12 stories</p>
                            )}
                            {idx === 1 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-green-600 font-medium">Online</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Their Children */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                      THEIR CHILDREN
                    </h3>
                    <p className="text-[10px] text-[#A6987F] mt-0.5">born 1953-1972</p>
                  </div>
                  <div className="flex gap-6">
                    {generations.theirChildren?.length > 0
                      ? generations.theirChildren.map((member, idx) => (
                          <div key={member._id || idx} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(member.fullName)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {member.fullName}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "Father" : idx === 1 ? "Mother" : idx === 2 ? "Aunt" : "Uncle"}
                            </p>
                          </div>
                        ))
                      : ["Sipho", "Ayanda", "Lindiwe", "Themba"].map((name, idx) => (
                          <div key={name} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(name)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {name}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "Father" : idx === 1 ? "Mother" : idx === 2 ? "Aunt" : "Uncle"}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>

                {/* Your Generation */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                      YOUR GENERATION
                    </h3>
                    <p className="text-[10px] text-[#A6987F] mt-0.5">born 1984-2003</p>
                  </div>
                  <div className="flex gap-6">
                    {generations.yourGeneration?.length > 0
                      ? generations.yourGeneration.map((member, idx) => (
                          <div key={member._id || idx} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(member.fullName)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {member.fullName}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "You" : idx === 1 ? "Sister" : "Cousin"}
                            </p>
                          </div>
                        ))
                      : ["Ntwari", "Zola", "Bongi"].map((name, idx) => (
                          <div key={name} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(name)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {name}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "You" : idx === 1 ? "Sister" : "Cousin"}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>

                {/* The Little Ones */}
                <div>
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                      THE LITTLE ONES
                    </h3>
                    <p className="text-[10px] text-[#A6987F] mt-0.5">born 2014-2023</p>
                  </div>
                  <div className="flex gap-6">
                    {generations.theLittleOnes?.length > 0
                      ? generations.theLittleOnes.map((member, idx) => (
                          <div key={member._id || idx} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(member.fullName)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {member.fullName}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "Niece · 6" : "Nephew · 3"}
                            </p>
                          </div>
                        ))
                      : ["Amara", "Kabelo"].map((name, idx) => (
                          <div key={name} className="flex flex-col items-center">
                            <div
                              className={`w-16 h-16 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-base font-medium`}
                            >
                              {getInitials(name)}
                            </div>
                            <p className="text-xs font-medium text-[#3A2E22] text-center mt-2">
                              {name}
                            </p>
                            <p className="text-[10px] text-[#A6987F]">
                              {idx === 0 ? "Niece · 6" : "Nephew · 3"}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
                <p className="text-sm text-[#8B5E3C] mb-4">
                  No family tree data available yet.
                </p>
                <p className="text-xs text-[#A6987F]">
                  Add family members to start building your tree.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Selected Member */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] overflow-hidden sticky top-24">
            {selectedMember ? (
              <>
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"
                    alt={selectedMember.fullName}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#3A2E22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#3A2E22] mb-1">
                    {selectedMember.fullName}
                  </h3>
                  <p className="text-xs text-[#A6987F] mb-3">
                    Grandmother · turns 78 tomorrow
                  </p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <button className="w-full py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors mb-4">
                    Call
                  </button>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#A6987F]">In the archive</span>
                      <span className="font-medium text-[#3A2E22]">214 photos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A6987F]">Told by her</span>
                      <span className="font-medium text-[#3A2E22]">9 stories · 4 voice notes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A6987F]">Answered</span>
                      <span className="font-medium text-[#3A2E22]">31 family questions</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-[#A6987F]">Select a family member to view details</p>
              </div>
            )}
          </div>

          {/* How you're related */}
          {selectedMember && (
            <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-5 mt-4">
              <h4 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-3">
                HOW YOU'RE RELATED
              </h4>
              <div className="flex items-center gap-2">
                {["You", "Nomsa", "Sipho", selectedMember.fullName.split(" ")[0]].map((name, idx) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-[10px] font-medium`}>
                      {getInitials(name)}
                    </div>
                    {idx < 3 && (
                      <svg className="w-4 h-4 text-[#A6987F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#A6987F] mt-2">
                Nomsa · her son Sipho · you
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-[#8B5E3C]">Around right now</span>
          </div>
          <span className="text-xs text-[#A6987F]">Remembered</span>
          <span className="text-xs text-[#8B5E3C] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Branch to open
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A6987F]">14 of 38 shown</span>
          <button className="px-4 py-2 border border-[#EDE3D3] rounded-xl text-xs font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors">
            Open every branch
          </button>
        </div>
      </div>
    </InnerLayout>
  );
}
