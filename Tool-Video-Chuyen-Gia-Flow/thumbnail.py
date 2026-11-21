# -*- coding: utf-8 -*-
"""Thumbnail ở 1 giây đầu video (chị yêu cầu 18/11/2026).

Kiểu giống tool edit video short của chị: ảnh chị (khung hình rõ nhất đầu cảnh 1) + 2 thanh tiêu đề
font Anton IN HOA: thanh trên nền ĐỎ chữ VÀNG, thanh dưới nền TRẮNG chữ ĐỎ, đặt dưới cằm (không che mặt).
- Đoạn mở 1 giây NỐI VÀO TRƯỚC video (chị chốt 18/11: không đè lên video, giữ nguyên phụ đề dòng đầu):
  nền đẩy nhẹ + thanh chữ bật lên, âm impact/pop/whoosh của bộ âm nhận diện -> Reels/TikTok lấy làm ảnh bìa.
- Xuất thêm <tên video>.jpg cạnh file mp4 để tải lên làm ảnh bìa.
Chữ: kb["thumbnail"] = ["dòng trên", "dòng dưới"] nếu có; không thì tự tách hook_chu làm 2 dòng.
Chữ hiển thị luôn qua man_hinh(): "ây ai" -> "AI"."""
import os, re, subprocess, tempfile, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from common import *

W, H = 1080, 1920
GIAY = 1.0
DO, VANG, TRANG = (232, 16, 15), (255, 230, 0), (255, 255, 255)
ANTON = os.path.join(FONTS, "Anton-Regular.ttf")
Y_TREN = 1120          # đỉnh thanh trên: mặt nhân vật thường kết thúc ~y 1070 (đo YuNet các video đã làm)
NO_WIN = 0x08000000 if os.name == "nt" else 0
_NOI = ("nhưng", "mà", "vẫn", "lại", "thì", "để", "nên", "vì", "chỉ", "chưa", "không", "bằng")


def _chay(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", creationflags=NO_WIN)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout)[-600:])
    return r


def tach_dong(text):
    """Tách tiêu đề thành 2 dòng: ưu tiên dấu '/', dấu phẩy, rồi chữ nối (mà/vẫn/nhưng...) gần giữa câu."""
    t = " ".join(man_hinh(text).split())
    if "/" in t:
        a, b = t.split("/", 1)
        return a.strip(), b.strip()
    if "," in t:
        a, b = t.split(",", 1)
        if len(a.split()) >= 2 and len(b.split()) >= 2:
            return a.strip(), b.strip()
    w = t.split()
    if len(w) < 4:
        return t, ""
    giua = len(w) / 2
    ung = [i for i in range(2, len(w) - 1) if w[i].lower() in _NOI]
    i = min(ung, key=lambda k: abs(k - giua)) if ung else round(giua)
    return " ".join(w[:i]), " ".join(w[i:])


def _font_vua(chu, co, rong):
    while co > 40:
        f = ImageFont.truetype(ANTON, co)
        if f.getlength(chu) <= rong:
            return f
        co -= 4
    return ImageFont.truetype(ANTON, co)


def _thanh(chu, nen, mau_chu, co, rong_toi_da):
    f = _font_vua(chu, co, rong_toi_da - 80)
    x0, y0, x1, y1 = f.getbbox(chu)
    bw, bh = int(f.getlength(chu) + 80), int(co * 1.32)
    im = Image.new("RGBA", (bw, bh), nen + (255,))
    ImageDraw.Draw(im).text(((bw - f.getlength(chu)) / 2, (bh - (y1 + y0)) / 2), chu, font=f, fill=mau_chu)
    return im


def _cac_thanh(tren, duoi):
    """[(ảnh thanh kèm bóng, x, y)] cho 2 thanh chữ."""
    ra, y = [], Y_TREN
    duoi_ds = [d for d in (duoi or "").split("\n") if d.strip()] or [""]
    nhieu = len(duoi_ds) > 1          # 3–4 dòng: chữ nhỏ lại chút để không xuống quá thấp
    for chu, nen, mc, co, rong in [(tren, DO, VANG, 104 if nhieu else 118, W - 160)] + \
            [(d, TRANG, DO, 92 if nhieu else 104, W - 60) for d in duoi_ds]:
        if not chu:
            continue
        t = _thanh(chu.upper(), nen, mc, co, rong)
        kb = Image.new("RGBA", (t.width + 6, t.height + 8), (0, 0, 0, 0))
        kb.paste(Image.new("RGBA", t.size, (0, 0, 0, 110)), (6, 8))
        kb.alpha_composite(t, (0, 0))
        ra.append((kb, (W - t.width) // 2, y))
        y += t.height + 8
    return ra


def ve(anh_nen, tren, duoi, out):
    """anh_nen: ảnh PIL 1080x1920. Trả về đường dẫn jpg (ảnh bìa tĩnh)."""
    im = anh_nen.convert("RGBA").resize((W, H))
    for t, x, y in _cac_thanh(tren, duoi):
        im.alpha_composite(t, (x, y))
    im = im.convert("RGB")
    im.save(out, quality=94)
    return out


def _mo_mat(img_pil):
    """Độ mở mắt: tỉ lệ điểm tối (lòng đen) quanh 2 mắt (mốc mắt của YuNet). Mắt nhắm -> chỉ còn da + mi -> gần 0."""
    try:
        import cv2, do_mat
        det, _ = do_mat._mo()
        bgr = cv2.cvtColor(np.asarray(img_pil.convert("RGB")), cv2.COLOR_RGB2BGR)
        nho = cv2.resize(bgr, (540, 960))
        det.setInputSize((540, 960))
        _, f = det.detect(nho)
        if f is None or not len(f):
            return 0.0
        q = max(f, key=lambda r: r[2] * r[3]) * 2
        g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
        (rx, ry), (lx, ly) = q[4:6], q[6:8]
        kc = max(20.0, float(np.hypot(lx - rx, ly - ry)))
        x, y, w, h = [int(v) for v in q[:4]]
        da = np.median(g[y + h // 2:y + int(h * 0.8), x + w // 4:x + 3 * w // 4])     # màu da má
        diem = []
        for ex, ey in ((rx, ry), (lx, ly)):
            a, b = int(kc * 0.16), int(kc * 0.09)
            vung = g[int(ey) - b:int(ey) + b, int(ex) - a:int(ex) + a]
            if vung.size:
                diem.append(float((vung < da * 0.45).mean()))
        return min(diem) if diem else 0.0
    except Exception:
        return 0.0


def khung_ro_nhat(clip, tu=0.1, den=2.0, buoc=0.15):
    """Chọn khung đầu cảnh 1 cho thumbnail: MẮT MỞ trước (tránh khung chớp/nhắm mắt), sau đó nét nhất."""
    tmp = tempfile.mkdtemp(prefix="thumb_")
    try:
        ds = []
        t = tu
        while t <= den:
            p = os.path.join(tmp, f"{t:.2f}.png")
            _chay(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", clip, "-frames:v", "1",
                   "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}", p])
            if os.path.exists(p):
                im = Image.open(p).copy()
                g = np.asarray(im.convert("L"), dtype=np.float32)[350:1100, 250:830]
                net = np.abs(g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]).var()
                ds.append((_mo_mat(im), net, t, im))
            t += buoc
        if not ds:
            return None
        mm = max(d[0] for d in ds)
        hop = [d for d in ds if d[0] >= mm * 0.8]           # các khung mắt mở gần nhất mức mở to nhất
        return max(hop, key=lambda d: d[1])[3]
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def chu_tu_kb(kb):
    th = kb.get("thumbnail")
    if isinstance(th, (list, tuple)) and th:
        # 21/11/2026: hook Notion dài -> cho phép 3–4 dòng; các dòng từ thứ 2 nối bằng "\n" (mỗi dòng 1 thanh trắng)
        return man_hinh(th[0]), man_hinh("\n".join(th[1:]))
    return tach_dong(kb.get("hook_chu") or kb.get("tieu_de", ""))


FPS = 30
# Âm thanh đoạn mở (bộ âm nhận diện sfx.py): impact khi ảnh đập vào, pop khi từng thanh chữ bật lên,
# whoosh bắt đầu trước điểm nối -> kéo người xem vào video (cú impact của hook video gốc rơi đúng điểm nối)
AM_MO = [("impact", 0.00, -7), ("pop", 0.00, -4), ("pop", 0.14, -4), ("whoosh", 0.62, -6)]


def _de(t):        # ease-out
    return 1 - (1 - min(1.0, max(0.0, t))) ** 3


def _nay(t):       # ease-out-back: bật lên hơi quá rồi về đúng cỡ
    t = min(1.0, max(0.0, t)); c = 1.70158
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def dung_intro(anh_nen, tren, duoi, out, giay=GIAY):
    """Đoạn mở 1 giây (không tiếng): nền đẩy từ 1,10x về 1x + loé sáng nhẹ; 2 thanh chữ có từ khung đầu,
    thanh đỏ "đập" về đúng cỡ ở 0s, thanh trắng ở 0,14s (khớp tiếng pop); 0,13s cuối đẩy nhẹ vào (chuyển cảnh)."""
    nen = anh_nen.convert("RGB").resize((W, H))
    thanh = _cac_thanh(tren, duoi)
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                          "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE, creationflags=NO_WIN)
    n = int(round(giay * FPS))
    for k in range(n):
        t = k / FPS
        s = 1.10 - 0.10 * _de(t / 0.45)
        if t > giay - 0.13:
            s += 0.05 * _de((t - (giay - 0.13)) / 0.13)
        bw, bh = int(W * s), int(H * s)
        fr = nen.resize((bw, bh), Image.BILINEAR).crop(((bw - W) // 2, (bh - H) // 2, (bw - W) // 2 + W, (bh - H) // 2 + H))
        if 0 < t < 0.15:                                     # loé sáng nhẹ (khung đầu giữ sạch để làm ảnh bìa)
            fr = Image.blend(fr, Image.new("RGB", (W, H), (255, 255, 255)), 0.22 * (1 - t / 0.15))
        fr = fr.convert("RGBA")
        for j, (im, x, y) in enumerate(thanh):
            # chữ có ngay từ khung đầu (nền tảng hay lấy khung 0 làm ảnh bìa), rồi "đập" từ 1,16x về đúng cỡ
            t0 = 0.0 if j == 0 else 0.14 + 0.07 * (j - 1)   # thanh 2 khớp tiếng pop 0,14s; thanh 3–4 nối tiếp
            sc = 1 + 0.16 * (1 - _nay((t - t0) / 0.22)) if t >= t0 else 1.16
            sc = min(sc, (W - 16) / im.width) if im.width * sc > W - 16 else sc   # thanh dài không tràn mép
            iw, ih = max(1, int(im.width * sc)), max(1, int(im.height * sc))
            fr.alpha_composite(im.resize((iw, ih), Image.BILINEAR), (x + (im.width - iw) // 2, y + (im.height - ih) // 2))
        p.stdin.write(fr.convert("RGB").tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise RuntimeError("Không dựng được đoạn mở thumbnail")
    return out


def noi(intro, video, ra, giay=GIAY):
    """Nối đoạn mở thumbnail vào TRƯỚC video gốc (video gốc giữ nguyên, phụ đề không mất) + âm thanh chuyển cảnh."""
    import sfx
    sfx.tao()
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", intro, "-i", video]
    for ten, _, _ in AM_MO:
        cmd += ["-i", sfx.duong_dan(ten)]
    fm = "aformat=sample_rates=48000:channel_layouts=stereo"
    f = [f"[0:v]fps={FPS},setsar=1,format=yuv420p[v0]", f"[1:v]fps={FPS},scale={W}:{H},setsar=1,format=yuv420p[v1]",
         "[v0][v1]concat=n=2:v=1:a=0[v]"]
    mo, sau = [], []
    for i, (ten, t, db) in enumerate(AM_MO):
        nhan = f"s{i}"
        f.append(f"[{i + 2}:a]{fm},volume={db}dB,adelay={int(t * 1000)}:all=1[{nhan}]")
        (sau if ten == "whoosh" else mo).append(f"[{nhan}]")
    f.append(f"{''.join(mo)}amix=inputs={len(mo)}:normalize=0,apad,atrim=0:{giay},{fm}[ai]")
    f.append(f"[1:a]{fm}[ao]")
    f.append("[ai][ao]concat=n=2:v=0:a=1[ac]")
    f.append(f"[ac]{''.join(sau)}amix=inputs={1 + len(sau)}:normalize=0:duration=first[a]")
    cmd += ["-filter_complex", ";".join(f), "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium",
            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", ra]
    _chay(cmd)
    return ra


def lam(thu_muc, kb, video_vao, video_ra, jpg_ra, log=print):
    """Tạo thumbnail cho dự án: chọn khung cảnh 1, vẽ 2 thanh chữ, dựng đoạn mở 1 giây, nối vào ĐẦU video, xuất jpg."""
    clip = next((os.path.join(thu_muc, f) for f in ("canh_01_cat.mp4", "canh_01.mp4")
                 if os.path.exists(os.path.join(thu_muc, f))), None)
    if not clip:
        raise RuntimeError("Không thấy cảnh 1 để lấy ảnh thumbnail")
    tren, duoi = chu_tu_kb(kb)
    log(f"Thumbnail 1 giây đầu: [{tren}] / [{duoi}]")
    nen = khung_ro_nhat(clip)
    ve(nen, tren, duoi, jpg_ra)
    intro = os.path.join(tempfile.gettempdir(), f"intro_{os.getpid()}.mp4")
    try:
        dung_intro(nen, tren, duoi, intro)
        noi(intro, video_vao, video_ra)
    finally:
        if os.path.exists(intro):
            os.remove(intro)
    return video_ra, jpg_ra
