"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserPlus, Network, Users } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import Avatar from "@/components/Avatar";
import AddFamilyMemberModal from "@/components/modals/AddFamilyMemberModal";
import EditFamilyMemberModal from "@/components/modals/EditFamilyMemberModal";
import { displayName } from "@/lib/displayName";

interface FamilyMember {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  relationship?: string;
  status?: string;
  birthYear?: number;
  deathYear?: number;
  storiesCount?: number;
  generation?: number;
  parentId?: string;
  partnerId?: string;
  gender?: string;
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

interface TreeNode {
  member: FamilyMember;
  partner?: FamilyMember;
  children: TreeNode[];
}

export default function FamilyTreePage() {
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [generations, setGenerations] = useState<GenerationGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeFilter, setActiveFilter] = useState<"Everyone" | "Living" | "Remembered">("Everyone");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ profilePicture?: string } | null>(null);
  const currentUserRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUserId(parsed?._id || null);
          setCurrentUser({ profilePicture: parsed?.profilePicture });
        } catch {
          setCurrentUserId(null);
          setCurrentUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchFamilyTree();
  }, []);

  const fetchFamilyTree = async () => {
    try {
      const result = await api.get("/family/tree");
      if ((result as any).success) {
        const fam = (result as any).family as FamilyData;
        setFamily(fam);
        setGenerations((result as any).generations || (result as any).treeData);
      }
    } catch (error) {
      console.error("Failed to fetch family tree:", error);
    } finally {
      setLoading(false);
    }
  };

  const relationshipLabel = (member: FamilyMember) => {
    if (!member.relationship) return "Family member";
    const lower = member.relationship.toLowerCase();
    if (lower.includes("father") || lower.includes("mother") || lower.includes("child") || lower.includes("grand")) return member.relationship;
    if (lower.includes("you")) return "You";
    return member.relationship;
  };

  const actions = (
    <div className="flex items-center gap-3">
      <div className="flex rounded-xl border border-[#EDE3D3] overflow-hidden bg-white">
        {["Everyone", "Living", "Remembered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab as typeof activeFilter)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === activeFilter ? "bg-[#3A2E22] text-white" : "bg-white text-[#8B5E3C] hover:bg-[#F5EFE6]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <button onClick={() => setAddMemberOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
        <UserPlus className="w-4 h-4" />
        Add a family member
      </button>
    </div>
  );

  const buildTree = useMemo<TreeNode[]>(() => {
    const sourceMembers = generations
      ? [
          ...(generations.elders || []),
          ...(generations.theirChildren || []),
          ...(generations.yourGeneration || []),
          ...(generations.theLittleOnes || []),
        ]
      : (family?.familyMembers || []);

    if (sourceMembers.length === 0) return [];

    const byId = new Map<string, FamilyMember>();
    sourceMembers.forEach((m) => byId.set(m._id, m));

    const nodes = new Map<string, TreeNode>();
    sourceMembers.forEach((member) => {
      const partner = member.partnerId ? byId.get(member.partnerId) : undefined;
      nodes.set(member._id, {
        member,
        partner,
        children: [],
      });
    });

    const roots: TreeNode[] = [];
    const added = new Set<string>();

    const addNodeAndDescendants = (node: TreeNode) => {
      if (added.has(node.member._id)) return;
      added.add(node.member._id);
      if (node.partner) added.add(node.partner._id);

      const newChildren = sourceMembers
        .filter((m) => m.parentId === node.member._id)
        .map((child) => nodes.get(child._id))
        .filter((n): n is TreeNode => !!n && !node.children.some((existing) => existing.member._id === n.member._id));

      node.children = [...node.children, ...newChildren];
      newChildren.forEach((child) => addNodeAndDescendants(child));
    };

    sourceMembers.forEach((member) => {
      const node = nodes.get(member._id);
      if (!node || added.has(member._id)) return;

      if (member.parentId && nodes.has(member.parentId)) {
        const parent = nodes.get(member.parentId)!;
        if (!parent.children.some((child) => child.member._id === node.member._id)) {
          parent.children.push(node);
        }
        addNodeAndDescendants(node);
      } else {
        roots.push(node);
        addNodeAndDescendants(node);
      }
    });

    const uniqueRoots = Array.from(new Map(roots.map((node) => [node.member._id, node])).values());

    if (uniqueRoots.length === 0 && nodes.size > 0) {
      const currentUserNode = currentUserId ? nodes.get(currentUserId) : undefined;
      if (currentUserNode) {
        uniqueRoots.push(currentUserNode);
      } else {
        const first = nodes.values().next().value;
        if (first) uniqueRoots.push(first);
      }
    }

    return uniqueRoots;
  }, [generations, family, currentUserId]);

  const findCurrentUserNode = (nodes: TreeNode[]): TreeNode | null => {
    for (const node of nodes) {
      if (node.member._id === currentUserId) return node;
      if (node.partner?._id === currentUserId) return node;
      const found = findCurrentUserNode(node.children);
      if (found) return found;
    }
    return null;
  };

  const currentNode = useMemo(() => findCurrentUserNode(buildTree), [buildTree, currentUserId]);

  useEffect(() => {
    if (currentNode && currentUserRef.current) {
      currentUserRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentNode]);

  const renderCoupleRow = (node: TreeNode, isCurrentUser: boolean, onSelect: (member: FamilyMember) => void) => {
    const currentPartnerId = node.partner?._id === currentUserId ? node.partner._id : undefined;

    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center cursor-pointer" onClick={() => onSelect(node.member)}>
          <div className="relative">
            <Avatar
              src={node.member.profilePicture}
              name={node.member.fullName}
              size="lg"
              className={isCurrentUser ? "ring-4 ring-[#4A3428]" : ""}
            />
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A3428] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                ✓
              </div>
            )}
          </div>
          <p className={`text-sm font-medium text-[#3A2E22] text-center mt-2 ${isCurrentUser ? "font-bold text-[#4A3428]" : ""}`}>
            {displayName(node.member, currentUserId)}
          </p>
          <p className="text-[10px] text-[#A6987F]">{relationshipLabel(node.member)}</p>
          {node.member.status && (
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${node.member.status === "remembered" ? "bg-gray-400" : "bg-green-500"}`}></div>
              <span className="text-[10px] text-[#A6987F] capitalize">{node.member.status}</span>
            </div>
          )}
        </div>

        {node.partner && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-6 h-px bg-[#EDE3D3]" />
              <div className="w-3 h-px bg-[#EDE3D3]" />
            </div>
            <div className="flex flex-col items-center cursor-pointer" onClick={() => onSelect(node.partner!)}>
              <div className="relative">
                <Avatar
                  src={node.partner.profilePicture}
                  name={node.partner.fullName}
                  size="lg"
                  className={node.partner._id === currentUserId ? "ring-4 ring-[#4A3428]" : ""}
                />
                {node.partner._id === currentUserId && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A3428] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    ✓
                  </div>
                )}
              </div>
              <p className={`text-sm font-medium text-[#3A2E22] text-center mt-2 ${node.partner._id === currentUserId ? "font-bold text-[#4A3428]" : ""}`}>
                {displayName(node.partner, currentUserId)}
              </p>
              <p className="text-[10px] text-[#A6987F]">{relationshipLabel(node.partner)}</p>
              {node.partner.status && (
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${node.partner.status === "remembered" ? "bg-gray-400" : "bg-green-500"}`}></div>
                  <span className="text-[10px] text-[#A6987F] capitalize">{node.partner.status}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isCurrentUser = node.member._id === currentUserId;

    return (
      <div
        ref={isCurrentUser ? (currentUserRef as any) : null}
        className={`relative ${depth > 0 ? "ml-12 mt-6" : ""}`}
      >
        {depth > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-[#EDE3D3]" style={{ left: "-1.5rem", top: "-1.25rem", height: "calc(100% + 0.75rem)" }} />}

        <div className="flex flex-col items-center">
          {renderCoupleRow(node, isCurrentUser, setSelectedMember)}

          {node.children.length > 0 && (
            <div className="mt-4 w-full">
              <div className="flex justify-center mb-2">
                <div className="w-px h-6 bg-[#EDE3D3]" />
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {node.children.map((child) => (
                  <div key={child.member._id} className="flex flex-col items-center">
                    {renderTreeNode(child, depth + 1)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalMembers = useMemo(() => {
    if (!generations) return 0;
    return (generations.elders || []).length + (generations.theirChildren || []).length + (generations.yourGeneration || []).length + (generations.theLittleOnes || []).length;
  }, [generations]);

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
      title={family?.familyName || "Family Tree"}
      subtitle={family?.familyName ? "Showing your line. Open a branch to bring the rest of the family into view." : "Create or join a family to get started."}
      actions={actions}
    >
      <AddFamilyMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={fetchFamilyTree}
        familyMembers={family?.familyMembers || []}
      />
      <EditFamilyMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={fetchFamilyTree}
        member={editingMember}
        familyMembers={family?.familyMembers || []}
      />
      <div className="flex gap-8">
        {/* Tree Content */}
        <div className="flex-1">
          <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8">
            {buildTree.length > 0 ? (
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-[#8B5E3C]" />
                  <h3 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">Family Tree</h3>
                  {currentNode && (
                    <span className="ml-auto text-[10px] text-[#A6987F]">You are highlighted below</span>
                  )}
                </div>
                <div className="space-y-6">
                  {buildTree.map((node) => (
                    <div key={node.member._id}>{renderTreeNode(node)}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
                <p className="text-sm text-[#8B5E3C] mb-4">No family tree data available yet.</p>
                <p className="text-xs text-[#A6987F]">Add family members to start building your tree.</p>
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
                    src={selectedMember.profilePicture || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"}
                    alt={selectedMember.fullName}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#3A2E22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6h12h12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#3A2E22] mb-1">{displayName(selectedMember, currentUserId)}</h3>
                  <p className="text-xs text-[#A6987F] mb-3">
                    {relationshipLabel(selectedMember)}
                    {selectedMember.status === "remembered" ? " · Remembered" : ""}
                  </p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className={`w-2 h-2 rounded-full ${selectedMember.status === "remembered" ? "bg-gray-400" : "bg-green-500"}`}></div>
                    <span className={`text-xs font-medium ${selectedMember.status === "remembered" ? "text-gray-500" : "text-green-600"}`}>
                      {selectedMember.status === "remembered" ? "Remembered" : "Living"}
                    </span>
                  </div>
                  <button className="w-full py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors mb-4">
                    View profile
                  </button>
                  <button
                    onClick={() => setEditingMember(selectedMember)}
                    className="w-full py-2.5 border border-[#EDE3D3] rounded-xl text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors mb-4"
                  >
                    Edit member
                  </button>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#A6987F]">Generation</span>
                      <span className="font-medium text-[#3A2E22]">{selectedMember.generation ? `Generation ${selectedMember.generation}` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A6987F]">Email</span>
                      <span className="font-medium text-[#3A2E22]">{selectedMember.email || "—"}</span>
                    </div>
                    {selectedMember.partnerId && (
                      <div className="flex justify-between">
                        <span className="text-[#A6987F]">Partner</span>
                        <span className="font-medium text-[#3A2E22]">
                          {(family?.familyMembers || []).find((m) => m._id === selectedMember.partnerId)?.fullName || selectedMember.partnerId}
                        </span>
                      </div>
                    )}
                    {selectedMember.parentId && (
                      <div className="flex justify-between">
                        <span className="text-[#A6987F]">Parent</span>
                        <span className="font-medium text-[#3A2E22]">
                          {(family?.familyMembers || []).find((m) => m._id === selectedMember.parentId)?.fullName || selectedMember.parentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-[#A6987F]">Select a family member to view details</p>
              </div>
            )}
          </div>

          {selectedMember && (
            <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-5 mt-4">
              <h4 className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-3">HOW YOU&apos;RE RELATED</h4>
              <div className="flex items-center gap-2">
                {["You", selectedMember.fullName.split(" ")[0]].map((name, idx) => (
                  <div key={name} className="flex items-center gap-2">
                    <Avatar
                      src={idx === 0 ? (currentUser?.profilePicture || null) : selectedMember.profilePicture}
                      name={name}
                      size="md"
                      ringClassName={idx === 0 ? "ring-2 ring-[#4A3428]" : ""}
                    />
                    {idx === 0 && (
                      <svg className="w-4 h-4 text-[#A6987F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#A6987F] mt-2">You · {selectedMember.relationship || "family member"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {totalMembers > 0 && (
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
            <span className="text-xs text-[#A6987F]">{totalMembers} shown</span>
            <button className="px-4 py-2 border border-[#EDE3D3] rounded-xl text-xs font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors">
              Open every branch
            </button>
          </div>
        </div>
      )}
    </InnerLayout>
  );
}
