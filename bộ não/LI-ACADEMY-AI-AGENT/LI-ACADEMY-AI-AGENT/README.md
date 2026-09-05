# LI ACADEMY AI AGENT — 800 Agent + 392 Skill

> 🔥 **Bộ siêu trợ lý AI hoàn chỉnh** dành cho **LI ACADEMY** — biến Claude Code thành "bộ não thứ hai" cho vận hành, marketing và kỹ thuật chuyên sâu.

---

## 📊 THỐNG KÊ

| Phần | Số lượng |
|---|---|
| **AGENT** | **800** |
| **SKILL** | **392** |
| **TỔNG** | **1.192 module** |

✅ Đã **dedup** theo tên file/folder — không có module trùng tên.

---

## 🆚 Khác biệt giữa Agent và Skill

| | **AGENT** | **SKILL** |
|---|---|---|
| **Bản chất** | Sub-agent AI — chuyên gia ảo | Workflow có sẵn — quy trình step-by-step |
| **Cách gọi** | "Gọi agent X làm Y" | Tự kích hoạt khi nhận từ khoá trigger |
| **Ví dụ** | "Gọi Ad Creative Strategist viết 5 RSA" | Gõ "viết sale page" → tự chạy `16buocbanhang` |
| **Format** | 1 file `.md` cho mỗi agent | 1 folder chứa `SKILL.md` + assets |
| **Path cài** | `~/.claude/agents/*.md` | `~/.claude/skills/<tên-skill>/` |

---

## ⚙️ YÊU CẦU TRƯỚC KHI CÀI

1. **Claude Code CLI** (nếu chưa có):
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
   Hướng dẫn: https://docs.anthropic.com/claude/docs/claude-code

2. **Đăng nhập Claude** (lệnh `claude` chạy được).

3. **OS:** macOS, Linux, Windows.

---

## 📦 CÀI ĐẶT 1-CLICK

### 🪟 Windows
1. Giải nén bộ cài
2. Vào folder `LI-ACADEMY-AI-AGENT`
3. **Double-click** `install-windows.bat`
4. Đợi 15-30 giây → cài cả **800 Agent + 392 Skill** ✅

### 🍎 macOS / 🐧 Linux
```bash
cd "LI-ACADEMY-AI-AGENT"
bash install-mac-linux.sh
```

### 🛠️ Cài thủ công (mọi OS)
```bash
# macOS/Linux
mkdir -p ~/.claude/agents ~/.claude/skills
cp "./AGENT/"*.md ~/.claude/agents/
cp -r "./SKILL/"* ~/.claude/skills/

# Windows PowerShell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
Copy-Item ".\AGENT\*.md" "$env:USERPROFILE\.claude\agents\" -Force
Copy-Item ".\SKILL\*" "$env:USERPROFILE\.claude\skills\" -Recurse -Force
```

### ✅ Kiểm tra cài thành công
```bash
# Số agent (phải >= 800)
ls ~/.claude/agents | wc -l

# Số skill (phải >= 392)
ls -d ~/.claude/skills/*/ | wc -l
```

---

## 🚀 CÁCH DÙNG

Mở Claude Code: `claude`

### Gọi Agent (800 chuyên gia)
```
"Gọi agent Ad Creative Strategist viết 5 RSA cho khóa AI giá 2tr."
"Dùng Paid Media Auditor audit Meta Ads ID 12345."
"Spawn Code Reviewer xem PR #123."
"Gọi Email Strategist build email funnel 7 ngày."
"Dùng Cloud Cost Optimizer tối ưu bill AWS."
"Gọi Playwright Expert viết E2E test cho website."
```

### Kích hoạt Skill (392 workflow)
```
"Viết sale page cho khóa AI"        → 16buocbanhang
"Tạo banner FB Ads"                  → banner-design
"Viết storytelling Reels về AI"      → storytelling-content
"Audit content có anti-pattern"      → mkt-kane-anti-pattern-auditor
"Build excel báo cáo tháng"          → xlsx
"Tạo PDF proposal"                   → pdf
"Viết landing page conversion"       → frontend-design
```

---

## 📋 ĐIỂM MẠNH BỘ AGENT

### 🎯 Marketing & Content
- **Email marketing chuyên sâu**: Email Strategist, Email Copywriter, Email Designer, Email Deliverability Expert
- **CRO chuyên sâu**: Conversion Optimizer
- **Influencer**: Influencer Partnership Expert, Affiliate Marketing Expert, Viral Marketing Expert
- **PR**: PR Strategist, Crisis Communication Expert, Corporate Communications
- **Martech**: Marketing Automation Expert, CRM Specialist, Martech Stack Architect
- **Storytelling**: 16buocbanhang, storytelling-content

### 🛠️ Engineering
- **Languages**: Python/TypeScript/Go/Rust/Java/Ruby/Swift/Kotlin/Elixir/PHP/Scala/C# Expert (12 ngôn ngữ)
- **Frameworks**: React/Vue/Angular/Django/Rails/Spring/NextJS/FastAPI/NestJS/Svelte/Remix/Astro/Qwik
- **Database**: PostgreSQL/MongoDB/Redis/Elasticsearch/Neo4j/Cassandra Expert
- **Cloud**: AWS/Azure/GCP Infrastructure Expert + Cloud Cost Optimizer
- **DevOps**: Kubernetes/Terraform/Docker/Ansible/GitOps Expert
- **QA**: E2E/Load/Contract/Chaos Testing + Playwright/Cypress/Jest Expert
- **AI/ML**: Data Scientist, ML Engineer, AI Engineer, NLP Engineer, MLOps Engineer, Prompt Engineer

### 💰 Finance & Sales
- Financial Analyst, FP&A, Bookkeeper, Tax Strategist, Accounts Payable
- Deal Strategist, Sales Coach, Sales Engineer, Pipeline Analyst, Proposal Strategist
- Banking API Expert, Trading Platform Expert, Financial Compliance Expert

### 🎮 Game Dev
- Unity (Architect/Multiplayer/Shader Graph/Editor Tool)
- Unreal (Systems/Multiplayer/Technical Artist/World Builder)
- Godot (Gameplay/Multiplayer/Shader)
- Roblox (Avatar/Experience/Systems)
- Blender Add-on Engineer

### 🥽 XR / AR / VR
- visionOS Spatial Engineer, macOS Metal Engineer
- WebXR, AR/VR Developer, XR Interface, XR Cockpit

### 🤖 AI Systems
- Agents Orchestrator, Multi-Agent Coordinator
- Workflow Orchestrator, Context Manager, Task Distributor
- Agent Installer, Agent Organizer

### 🏛️ Compliance & Legal
- SOC 2 / ISO 27001 / HIPAA / PCI-DSS Compliance Auditor
- Blockchain Security Auditor, Penetration Tester
- HIPAA Expert, FHIR Expert, HL7 Expert

### 🌐 Specialized
- Healthcare (FHIR, HL7, HIPAA, Medical Imaging, Telemedicine, Clinical Trials)
- Government (GovTech), Education (EdTech)
- Web3 (IPFS, DAO, NFT, Layer2, Trading Platform)
- Quantum Computing, Compiler Engineer, Embedded Systems

### ☁️ Google Cloud (skill)
- AlloyDB, BigQuery, Cloud Run, Cloud SQL, Firebase, GKE
- Networking Observability, Auth, WAF Cost/Reliability/Security

---

## 🔧 TRỤC TRẶC

### ❓ Claude không thấy Agent/Skill
- Path đúng chưa: `~/.claude/agents/*.md` và `~/.claude/skills/<name>/SKILL.md`
- Restart Claude Code

### ❓ Lỗi Permission denied
```bash
chmod -R u+rw ~/.claude/agents/ ~/.claude/skills/
```

### ❓ Muốn gỡ module
- Agent: xóa `.md` trong `~/.claude/agents/`
- Skill: xóa folder trong `~/.claude/skills/`

### ❓ Skill không tự kích hoạt
- Đọc `description` trong `SKILL.md` để biết từ khoá trigger
- Gõ trực tiếp: `/<tên-skill>` (vd: `/16buocbanhang`)

---

## 📎 CẤU TRÚC FOLDER

```
LI-ACADEMY-AI-AGENT/
├── README.md
├── install-windows.bat
├── install-mac-linux.sh
├── DANH-MUC-AGENT.txt        # danh sách 800 agent
├── DANH-MUC-SKILL.txt        # danh sách 392 skill
│
├── AGENT/                    # 800 file .md
│   └── ...
│
└── SKILL/                    # 392 folder
    └── ...
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

- 🔒 Đây là tài sản của **NINA ACADEMY** — vui lòng tôn trọng bản quyền.
- ✅ Dùng cho học viên / khách hàng của NINA ACADEMY.

---

## 🆘 LIÊN HỆ

**NINA ACADEMY**
👤 NGUYEN BAO NGA

---

**© 2026 NINA ACADEMY AI AGENT — BAO NGA | Powered by Claude Code**
