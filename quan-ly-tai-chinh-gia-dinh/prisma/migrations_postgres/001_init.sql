-- =====================================================================
-- Quản lý Thu-Chi Gia Đình — SQL Migration cho PostgreSQL / Supabase
-- Tương đương với prisma/schema.prisma (Giai đoạn 1).
-- Chạy trong Supabase SQL Editor, hoặc: psql "$DATABASE_URL" -f 001_init.sql
-- =====================================================================

create extension if not exists "pgcrypto";

create table families (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  currency   text not null default 'VND',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id            text primary key default gen_random_uuid()::text,
  email         text not null unique,
  password_hash text not null,
  name          text not null,
  family_id     text not null references families(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table family_members (
  id           text primary key default gen_random_uuid()::text,
  family_id    text not null references families(id) on delete cascade,
  user_id      text unique references users(id) on delete set null,
  name         text not null,
  role         text not null default 'MEMBER' check (role in ('ADMIN','MEMBER','CHILD')),
  avatar_color text not null default '#6366f1',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index on family_members(family_id);

create table accounts (
  id              text primary key default gen_random_uuid()::text,
  family_id       text not null references families(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('CASH','BANK','EWALLET','CREDIT_CARD','SAVINGS','INVESTMENT','GOLD')),
  owner_member_id text references family_members(id) on delete set null,
  opening_balance numeric(18,2) not null default 0,
  credit_limit    numeric(18,2),
  statement_date  int,
  due_date        int,
  note            text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index on accounts(family_id);

create table categories (
  id            text primary key default gen_random_uuid()::text,
  family_id     text not null references families(id) on delete cascade,
  type          text not null check (type in ('INCOME','EXPENSE')),
  name          text not null,
  "group"       text not null,
  parent_id     text references categories(id) on delete set null,
  default_jar   text check (default_jar in ('NEC','FFA','LTSS','EDU','PLAY','GIVE')),
  default_necessity text check (default_necessity in ('BAT_BUOC','CAN_THIET','CO_THE_CAT_GIAM','KHONG_CAN_THIET')),
  icon          text not null default 'Wallet',
  is_active     boolean not null default true,
  sort_order    int not null default 0
);
create index on categories(family_id, type);

create table jars (
  id         text primary key default gen_random_uuid()::text,
  family_id  text not null references families(id) on delete cascade,
  code       text not null check (code in ('NEC','FFA','LTSS','EDU','PLAY','GIVE')),
  name       text not null,
  percentage numeric(5,2) not null,
  color      text not null,
  icon       text not null,
  created_at timestamptz not null default now(),
  unique(family_id, code)
);

create table transactions (
  id                 text primary key default gen_random_uuid()::text,
  family_id          text not null references families(id) on delete cascade,
  type               text not null check (type in ('INCOME','EXPENSE','ACCOUNT_TRANSFER','JAR_TRANSFER')),
  amount             numeric(18,2) not null check (amount > 0),
  date               timestamptz not null,
  time               text,
  category_id        text references categories(id) on delete set null,
  account_id         text references accounts(id) on delete set null,
  jar_id             text references jars(id) on delete set null,
  to_account_id      text references accounts(id) on delete set null,
  to_jar_id          text references jars(id) on delete set null,
  created_by_member_id text not null references family_members(id),
  payer_member_id    text references family_members(id) on delete set null,
  is_shared          boolean not null default false,
  payment_method     text not null default 'TIEN_MAT',
  is_fixed           boolean not null default false,
  is_recurring_seed  boolean not null default false,
  necessity          text check (necessity in ('BAT_BUOC','CAN_THIET','CO_THE_CAT_GIAM','KHONG_CAN_THIET')),
  income_kind        text check (income_kind in ('FIXED','VARIABLE')),
  recurrence_kind    text check (recurrence_kind in ('ONE_TIME','RECURRING')),
  status             text not null default 'DA_THANH_TOAN',
  location           text,
  tags               text,
  note               text,
  attachment_url     text,
  is_deleted         boolean not null default false,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on transactions(family_id, date);
create index on transactions(family_id, type);

create table transaction_splits (
  id             text primary key default gen_random_uuid()::text,
  transaction_id text not null references transactions(id) on delete cascade,
  category_id    text references categories(id) on delete set null,
  jar_id         text references jars(id) on delete set null,
  amount         numeric(18,2) not null,
  note           text
);
create index on transaction_splits(transaction_id);

create table transaction_beneficiaries (
  id             text primary key default gen_random_uuid()::text,
  transaction_id text not null references transactions(id) on delete cascade,
  member_id      text not null references family_members(id) on delete cascade,
  unique(transaction_id, member_id)
);

create table jar_allocations (
  id             text primary key default gen_random_uuid()::text,
  transaction_id text not null references transactions(id) on delete cascade,
  jar_id         text not null references jars(id) on delete cascade,
  amount         numeric(18,2) not null,
  percentage     numeric(5,2) not null
);
create index on jar_allocations(transaction_id);

create table budgets (
  id          text primary key default gen_random_uuid()::text,
  family_id   text not null references families(id) on delete cascade,
  month       int not null check (month between 1 and 12),
  year        int not null,
  scope       text not null check (scope in ('CATEGORY','MEMBER','JAR')),
  category_id text references categories(id) on delete cascade,
  member_id   text references family_members(id) on delete cascade,
  jar_id      text references jars(id) on delete cascade,
  amount      numeric(18,2) not null,
  created_at  timestamptz not null default now()
);
create index on budgets(family_id, year, month);

create table settings (
  id         text primary key default gen_random_uuid()::text,
  family_id  text not null unique references families(id) on delete cascade,
  currency   text not null default 'VND',
  date_format text not null default 'dd/MM/yyyy',
  timezone   text not null default 'Asia/Ho_Chi_Minh',
  jar_mode   text not null default 'AUTO_ADJUSTABLE'
);

-- =====================================================================
-- Row Level Security — mỗi gia đình chỉ thấy dữ liệu của mình.
-- Bật khi dùng Supabase Auth (thay cho NextAuth) ở production.
-- =====================================================================
alter table families enable row level security;
alter table family_members enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table jars enable row level security;
alter table transactions enable row level security;
alter table transaction_splits enable row level security;
alter table transaction_beneficiaries enable row level security;
alter table jar_allocations enable row level security;
alter table budgets enable row level security;
alter table settings enable row level security;

-- Ví dụ policy (điều chỉnh theo cách bạn map auth.uid() -> family_id):
-- create policy "family_isolation" on transactions
--   using (family_id = (select family_id from users where id = auth.uid()::text));
