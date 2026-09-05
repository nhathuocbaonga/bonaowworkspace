-- =====================================================================
-- Giai đoạn 2 — Nợ, Khoản phải thu, Mục tiêu tài chính, Giao dịch định kỳ,
-- Nhật ký chỉnh sửa. Chạy sau 001_init.sql.
-- =====================================================================

alter table transactions
  add column if not exists debt_id text,
  add column if not exists receivable_id text,
  add column if not exists recurring_rule_id text;

alter table transactions
  drop constraint if exists transactions_type_check;
alter table transactions
  add constraint transactions_type_check check (
    type in ('INCOME','EXPENSE','ACCOUNT_TRANSFER','JAR_TRANSFER','DEBT_BORROW','DEBT_PRINCIPAL','LOAN_OUT','LOAN_COLLECT')
  );

create table debts (
  id                    text primary key default gen_random_uuid()::text,
  family_id             text not null references families(id) on delete cascade,
  name                  text not null,
  lender                text not null,
  borrower_member_id    text references family_members(id) on delete set null,
  responsible_member_id text references family_members(id) on delete set null,
  principal_amount      numeric(18,2) not null,
  interest_rate         numeric(6,3),
  start_date            timestamptz not null,
  due_date              timestamptz,
  payment_schedule      text not null default 'MONTHLY' check (payment_schedule in ('MONTHLY','QUARTERLY','YEARLY','ONE_TIME')),
  installment_amount    numeric(18,2),
  next_payment_date     timestamptz,
  collateral            text,
  purpose               text,
  note                  text,
  attachment_url        text,
  status                text not null default 'ACTIVE' check (status in ('ACTIVE','PAID_OFF')),
  created_at            timestamptz not null default now()
);
create index on debts(family_id);

create table receivables (
  id               text primary key default gen_random_uuid()::text,
  family_id        text not null references families(id) on delete cascade,
  borrower_name    text not null,
  lent_by_member_id text references family_members(id) on delete set null,
  amount           numeric(18,2) not null,
  lent_date        timestamptz not null,
  due_date         timestamptz,
  interest_rate    numeric(6,3),
  note             text,
  status           text not null default 'OUTSTANDING' check (status in ('OUTSTANDING','PARTIALLY_COLLECTED','COLLECTED','WRITTEN_OFF')),
  created_at       timestamptz not null default now()
);
create index on receivables(family_id);

alter table transactions
  add constraint transactions_debt_id_fkey foreign key (debt_id) references debts(id) on delete set null,
  add constraint transactions_receivable_id_fkey foreign key (receivable_id) references receivables(id) on delete set null;

create table savings_goals (
  id                text primary key default gen_random_uuid()::text,
  family_id         text not null references families(id) on delete cascade,
  name              text not null,
  owner_member_id   text references family_members(id) on delete set null,
  target_amount     numeric(18,2) not null,
  current_amount    numeric(18,2) not null default 0,
  start_date        timestamptz not null default now(),
  target_date       timestamptz,
  is_emergency_fund boolean not null default false,
  note              text,
  status            text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','CANCELLED')),
  created_at        timestamptz not null default now()
);
create index on savings_goals(family_id);

create table goal_contributions (
  id      text primary key default gen_random_uuid()::text,
  goal_id text not null references savings_goals(id) on delete cascade,
  amount  numeric(18,2) not null,
  date    timestamptz not null default now(),
  note    text
);
create index on goal_contributions(goal_id);

create table recurring_rules (
  id              text primary key default gen_random_uuid()::text,
  family_id       text not null references families(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('INCOME','EXPENSE')),
  amount          numeric(18,2) not null,
  category_id     text references categories(id) on delete set null,
  account_id      text references accounts(id) on delete set null,
  jar_id          text references jars(id) on delete set null,
  payer_member_id text references family_members(id) on delete set null,
  is_shared       boolean not null default false,
  necessity       text,
  frequency       text not null check (frequency in ('DAILY','WEEKLY','MONTHLY','QUARTERLY','YEARLY')),
  start_date      timestamptz not null,
  end_date        timestamptz,
  next_run_date   timestamptz not null,
  last_run_date   timestamptz,
  is_active       boolean not null default true,
  note            text,
  created_at      timestamptz not null default now()
);
create index on recurring_rules(family_id);

alter table transactions
  add constraint transactions_recurring_rule_id_fkey foreign key (recurring_rule_id) references recurring_rules(id) on delete set null;

create table audit_logs (
  id          text primary key default gen_random_uuid()::text,
  family_id   text not null references families(id) on delete cascade,
  entity_type text not null,
  entity_id   text not null,
  action      text not null check (action in ('CREATE','UPDATE','DELETE','RESTORE')),
  member_id   text references family_members(id) on delete set null,
  summary     text not null,
  detail      text,
  created_at  timestamptz not null default now()
);
create index on audit_logs(family_id, created_at);
create index on audit_logs(family_id, entity_type, entity_id);

alter table debts enable row level security;
alter table receivables enable row level security;
alter table savings_goals enable row level security;
alter table goal_contributions enable row level security;
alter table recurring_rules enable row level security;
alter table audit_logs enable row level security;
