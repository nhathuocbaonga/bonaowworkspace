-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "borrowerMemberId" TEXT,
    "responsibleMemberId" TEXT,
    "principalAmount" REAL NOT NULL,
    "interestRate" REAL,
    "startDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "paymentSchedule" TEXT NOT NULL DEFAULT 'MONTHLY',
    "installmentAmount" REAL,
    "nextPaymentDate" DATETIME,
    "collateral" TEXT,
    "purpose" TEXT,
    "note" TEXT,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "debts_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "debts_borrowerMemberId_fkey" FOREIGN KEY ("borrowerMemberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "debts_responsibleMemberId_fkey" FOREIGN KEY ("responsibleMemberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "receivables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "lentByMemberId" TEXT,
    "amount" REAL NOT NULL,
    "lentDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "interestRate" REAL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OUTSTANDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receivables_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "receivables_lentByMemberId_fkey" FOREIGN KEY ("lentByMemberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerMemberId" TEXT,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" DATETIME,
    "isEmergencyFund" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "savings_goals_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "savings_goals_ownerMemberId_fkey" FOREIGN KEY ("ownerMemberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_contributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "goal_contributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "savings_goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "categoryId" TEXT,
    "accountId" TEXT,
    "jarId" TEXT,
    "payerMemberId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "necessity" TEXT,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "nextRunDate" DATETIME NOT NULL,
    "lastRunDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recurring_rules_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "memberId" TEXT,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "categoryId" TEXT,
    "accountId" TEXT,
    "jarId" TEXT,
    "toAccountId" TEXT,
    "toJarId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "payerMemberId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT NOT NULL DEFAULT 'TIEN_MAT',
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "isRecurringSeed" BOOLEAN NOT NULL DEFAULT false,
    "necessity" TEXT,
    "incomeKind" TEXT,
    "recurrenceKind" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DA_THANH_TOAN',
    "location" TEXT,
    "tags" TEXT,
    "note" TEXT,
    "attachmentUrl" TEXT,
    "debtId" TEXT,
    "receivableId" TEXT,
    "recurringRuleId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_jarId_fkey" FOREIGN KEY ("jarId") REFERENCES "jars" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_toJarId_fkey" FOREIGN KEY ("toJarId") REFERENCES "jars" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "family_members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_payerMemberId_fkey" FOREIGN KEY ("payerMemberId") REFERENCES "family_members" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "receivables" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "recurring_rules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("accountId", "amount", "attachmentUrl", "categoryId", "createdAt", "createdByMemberId", "date", "deletedAt", "familyId", "id", "incomeKind", "isDeleted", "isFixed", "isRecurringSeed", "isShared", "jarId", "location", "necessity", "note", "payerMemberId", "paymentMethod", "recurrenceKind", "status", "tags", "time", "toAccountId", "toJarId", "type", "updatedAt") SELECT "accountId", "amount", "attachmentUrl", "categoryId", "createdAt", "createdByMemberId", "date", "deletedAt", "familyId", "id", "incomeKind", "isDeleted", "isFixed", "isRecurringSeed", "isShared", "jarId", "location", "necessity", "note", "payerMemberId", "paymentMethod", "recurrenceKind", "status", "tags", "time", "toAccountId", "toJarId", "type", "updatedAt" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
CREATE INDEX "transactions_familyId_date_idx" ON "transactions"("familyId", "date");
CREATE INDEX "transactions_familyId_type_idx" ON "transactions"("familyId", "type");
CREATE INDEX "transactions_debtId_idx" ON "transactions"("debtId");
CREATE INDEX "transactions_receivableId_idx" ON "transactions"("receivableId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "debts_familyId_idx" ON "debts"("familyId");

-- CreateIndex
CREATE INDEX "receivables_familyId_idx" ON "receivables"("familyId");

-- CreateIndex
CREATE INDEX "savings_goals_familyId_idx" ON "savings_goals"("familyId");

-- CreateIndex
CREATE INDEX "goal_contributions_goalId_idx" ON "goal_contributions"("goalId");

-- CreateIndex
CREATE INDEX "recurring_rules_familyId_idx" ON "recurring_rules"("familyId");

-- CreateIndex
CREATE INDEX "audit_logs_familyId_createdAt_idx" ON "audit_logs"("familyId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_familyId_entityType_entityId_idx" ON "audit_logs"("familyId", "entityType", "entityId");
