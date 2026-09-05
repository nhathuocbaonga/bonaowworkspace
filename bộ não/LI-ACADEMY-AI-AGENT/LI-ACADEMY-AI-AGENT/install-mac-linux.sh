#!/usr/bin/env bash
# LI ACADEMY AI AGENT - Cai 800 Agent + 392 Skill cho Claude Code
# TONI LAM TIEN | LI ACADEMY

set -e

echo "============================================"
echo "  LI ACADEMY AI AGENT - 800 AGENT + 392 SKILL"
echo "  TONI LAM TIEN | LI ACADEMY"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$HOME/.claude/agents"
SKILL_DIR="$HOME/.claude/skills"

echo "Folder Agent dich: $AGENT_DIR"
echo "Folder Skill dich: $SKILL_DIR"
echo ""

mkdir -p "$AGENT_DIR" "$SKILL_DIR"

# === 1. Copy 800 AGENT ===
echo "[1/2] Dang copy 800 AGENT..."
cp -f "$SCRIPT_DIR/AGENT/"*.md "$AGENT_DIR/"

# === 2. Copy 392 SKILL ===
echo "[2/2] Dang copy 392 SKILL..."
cp -rf "$SCRIPT_DIR/SKILL/"* "$SKILL_DIR/"

AGENT_COUNT=$(ls -1 "$AGENT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
SKILL_COUNT=$(ls -1d "$SKILL_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "============================================"
echo "  LI ACADEMY AI AGENT - CAI DAT THANH CONG!"
echo "============================================"
echo ""
echo "Tong so Agent: $AGENT_COUNT"
echo "Tong so Skill: $SKILL_COUNT"
echo ""
echo "Mo Claude Code va goi LI ACADEMY AI AGENT!"
echo ""
echo "Vi du goi AGENT:"
echo '  "Goi agent Ad Creative Strategist viet 5 RSA"'
echo ""
echo "Vi du kich hoat SKILL:"
echo '  "Viet sale page khoa hoc AI"  (chay 16buocbanhang)'
echo '  "Audit anti pattern content"   (chay mkt-kane-anti-pattern)'
echo ""
echo "LI ACADEMY - TONI LAM TIEN"
echo ""
