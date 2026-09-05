@echo off
chcp 65001 > nul
echo ============================================
echo   LI ACADEMY AI AGENT - 800 AGENT + 392 SKILL
echo   TONI LAM TIEN ^| LI ACADEMY
echo ============================================
echo.

set AGENT_DIR=%USERPROFILE%\.claude\agents
set SKILL_DIR=%USERPROFILE%\.claude\skills
set SCRIPT_DIR=%~dp0

echo Folder Agent dich: %AGENT_DIR%
echo Folder Skill dich: %SKILL_DIR%
echo.

REM Tao folder neu chua co
if not exist "%AGENT_DIR%" mkdir "%AGENT_DIR%"
if not exist "%SKILL_DIR%" mkdir "%SKILL_DIR%"

REM === 1. Copy 800 AGENT ===
echo [1/2] Dang copy 800 AGENT...
copy /Y "%SCRIPT_DIR%AGENT\*.md" "%AGENT_DIR%\" > nul
if %errorlevel% neq 0 (
    echo LOI: Khong copy duoc agent. Kiem tra folder "AGENT/"
    pause
    exit /b 1
)

REM === 2. Copy 392 SKILL ===
echo [2/2] Dang copy 392 SKILL...
xcopy /E /Y /I "%SCRIPT_DIR%SKILL\*" "%SKILL_DIR%\" > nul
if %errorlevel% neq 0 (
    echo LOI: Khong copy duoc skill. Kiem tra folder "SKILL/"
    pause
    exit /b 1
)

echo.
echo ============================================
echo   LI ACADEMY AI AGENT - CAI DAT THANH CONG!
echo ============================================
echo.
echo Tong so Agent:
dir /b /a-d "%AGENT_DIR%\*.md" | find /c /v ""
echo.
echo Tong so Skill:
dir /b /ad "%SKILL_DIR%" | find /c /v ""
echo.
echo Mo Claude Code va goi LI ACADEMY AI AGENT!
echo.
echo Vi du goi AGENT:
echo   "Goi agent Ad Creative Strategist viet 5 RSA"
echo.
echo Vi du kich hoat SKILL:
echo   "Viet sale page khoa hoc AI"  (chay 16buocbanhang)
echo   "Audit anti pattern content"   (chay mkt-kane-anti-pattern)
echo.
echo LI ACADEMY - TONI LAM TIEN
echo.
pause
