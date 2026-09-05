import "server-only";
import { prisma } from "./prisma";

export function getFamilyMembers(familyId: string) {
  return prisma.familyMember.findMany({
    where: { familyId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getAccounts(familyId: string) {
  return prisma.account.findMany({
    where: { familyId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getCategories(familyId: string, type?: "INCOME" | "EXPENSE") {
  return prisma.category.findMany({
    where: { familyId, isActive: true, ...(type ? { type } : {}) },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getJars(familyId: string) {
  return prisma.jar.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } });
}
