export function displayName(member: { _id?: string; fullName?: string } | null | undefined, currentUserId?: string | null): string {
  if (!member || !member.fullName) return "User";
  if (currentUserId && member._id && member._id === currentUserId) return "You";
  return member.fullName;
}
