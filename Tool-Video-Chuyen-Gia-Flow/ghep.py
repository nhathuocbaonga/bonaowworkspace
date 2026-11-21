# -*- coding: utf-8 -*-
"""Bước 3: ghép các cảnh -> video 9:16 1080x1920 30fps, chèn hook chữ + phụ đề tiếng Việt.

Chữ được vẽ bằng Pillow thành ảnh PNG rồi overlay theo mốc thời gian (không phụ thuộc libass/drawtext,
không lỗi đường dẫn có dấu). Mọi file trung gian nằm ở thư mục tạm không dấu.
"""
import os, sys, json, shutil, subprocess, tempfile, textwrap, glob, time
from PIL import Image, ImageDraw, ImageFont
from common import *

W, H, FPS = 1080, 1920, 30
CAT_MEM = 0.15          # cắt mềm đầu/cuối mỗi cảnh (giây) khi không đo được lời nói
DEM_CUOI = 0.25         # giữ thêm sau tiếng cuối cùng cho khỏi cụt
HOOK_GIAY = 2.5
VANG = (255, 196, 46)   # #FFC42E
NO_WIN = 0x08000000 if os.name == "nt" else 0


CONCEPT = {}   # concept chữ của ảnh nhân vật đang ghép (màu hook, nền phụ đề, font)


def _mau(hexs, alpha=255):
    h = hexs.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def tim_font(dam=True):
    import concept
    ten = list(concept.FONTS.get(CONCEPT.get("font") or "", []))
    ten += ["BeVietnamPro-ExtraBold.ttf", "BeVietnamPro-Bold.ttf"] if dam else ["BeVietnamPro-Bold.ttf"]
    ten += ["Inter-ExtraBold.ttf", "Inter-Bold.ttf"]
    for t in ten:
        for d in (FONTS, r"C:\Windows\Fonts", os.path.expanduser(r"~\AppData\Local\Microsoft\Windows\Fonts")):
            p = os.path.join(d, t)
            if os.path.exists(p):
                return p
    return r"C:\Windows\Fonts\segoeuib.ttf"


def chay(cmd, log=print):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       creationflags=NO_WIN)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg lỗi: " + (r.stderr or "")[-700:])
    return r


def thong_tin(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type",
                        "-of", "json", path], capture_output=True, text=True, encoding="utf-8", creationflags=NO_WIN)
    j = json.loads(r.stdout or "{}")
    dur = float(j.get("format", {}).get("duration", 0) or 0)
    co_tieng = any(s.get("codec_type") == "audio" for s in j.get("streams", []))
    return dur, co_tieng


def cuoi_loi_noi(path, nguong="-35dB", toi_thieu=0.35):
    """Mốc giây lời nói kết thúc (bỏ khoảng lặng cuối). None nếu không đo được."""
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-vn", "-af", f"silencedetect=n={nguong}:d={toi_thieu}", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", creationflags=NO_WIN)
    import re
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    dur, _ = thong_tin(path)
    if starts and starts[-1] > 1.0 and (len(ends) < len(starts) or ends[-1] >= dur - 0.1):   # lặng kéo tới hết file
        return starts[-1]
    return None


def moc_loi_noi(path):
    """(giây bắt đầu nói, giây nói xong) đo theo năng lượng dải giọng nói — bắt được cả đoạn cuối 8s
    nhân vật chỉ làm động tác, không nói (tiếng phòng của Veo khiến silencedetect cũ bỏ sót). None nếu không đo được."""
    import numpy as np
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", "16000",
                        "-af", "highpass=f=150,lowpass=f=4000", "-f", "s16le", "-"], capture_output=True, creationflags=NO_WIN)
    x = np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0
    fl = 800                                   # khung 50 ms
    n = x.size // fl
    if n < 20:
        return None
    e = 10 * np.log10((x[:n * fl].reshape(n, fl) ** 2).mean(1) + 1e-10)
    e = np.convolve(e, np.ones(3) / 3, mode="same")       # làm mượt ~150 ms
    # giọng Veo ~ -14..-24 dB, tiếng phòng/cử động sau khi nói ~ -30..-40 dB
    nguong = max(np.percentile(e, 95) - 15, np.percentile(e, 10) + 6)
    on = e > nguong
    chay_, i = [], 0                           # các đoạn có tiếng, bỏ tiếng sột soạt < 200 ms
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            if j - i >= 4:
                chay_.append((i, j))
            i = j
        else:
            i += 1
    if not chay_:
        return None
    return chay_[0][0] * fl / 16000, chay_[-1][1] * fl / 16000


def khoang_giu(path, dur):
    """(ss, tt) phần cảnh cần giữ: bỏ hình thừa trước khi nói và sau khi nói xong."""
    ss, het = CAT_MEM, dur - CAT_MEM
    m = moc_loi_noi(path)
    if m:
        a, b = m
        ss = max(0.05, a - 0.2)
        het = min(dur - 0.05, b + DEM_CUOI)
    tt = max(1.5, het - ss)
    return ss, tt


def chia_trang(text, rong=32, dong_moi_trang=2):
    """Chia lời thoại thành các 'trang' phụ đề: mỗi dòng <= rong ký tự, mỗi trang <= 2 dòng."""
    dong = textwrap.wrap(dinh_ay_ai(" ".join(text.split())), width=rong, break_long_words=False) or [""]
    return ["\n".join(dong[i:i + dong_moi_trang]) for i in range(0, len(dong), dong_moi_trang)]


def png_phu_de(text, out):
    text = man_hinh(text)            # chữ trên màn hình: "Bảo Nga AI" (lời đọc vẫn là "ây ai")
    f = ImageFont.truetype(tim_font(False), 50)
    d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
    lines = text.split("\n")
    lh = 70
    wmax = max(d.textlength(l, font=f) for l in lines)
    padx, pady = 36, 22
    bw, bh = int(wmax + 2 * padx), int(lh * len(lines) + 2 * pady - 8)
    img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    g = ImageDraw.Draw(img)
    nen = _mau(CONCEPT["dark"], 205) if CONCEPT.get("dark") else (0, 0, 0, 165)
    chu = _mau(CONCEPT.get("sub_text", "#FFFFFF"))
    g.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=22, fill=nen)
    for i, l in enumerate(lines):
        w = d.textlength(l, font=f)
        g.text(((bw - w) / 2, pady - 6 + i * lh), l, font=f, fill=chu)
    img.save(out)
    return bw, bh


def png_hook(text, out):
    text = man_hinh(text)
    d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
    # 21/11/2026: hook Notion dài -> nhỏ chữ, dòng dài hơn để đủ nguyên câu trong 4 dòng (trước bị cắt cụt)
    for co, rong in ((84, 16), (72, 19), (62, 23), (54, 27), (48, 31)):
        lines = textwrap.wrap(" ".join(text.split()).upper(), width=rong, break_long_words=False) or [""]
        if len(lines) <= 4:
            break
    f = ImageFont.truetype(tim_font(True), co)
    lh = int(co * 1.33)
    wmax = max(d.textlength(l, font=f) for l in lines)
    padx, pady = 50, 36
    bw, bh = int(min(wmax + 2 * padx, W - 60)), int(lh * len(lines) + 2 * pady)
    img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    g = ImageDraw.Draw(img)
    if CONCEPT.get("accent"):   # màu theo concept ảnh: hộp màu nhấn, chữ tương phản, không viền
        g.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=34, fill=_mau(CONCEPT["accent"], 240))
        kw = dict(fill=_mau(CONCEPT.get("accent_text", "#FFFFFF")))
    else:
        g.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=34, fill=VANG + (235,))
        kw = dict(fill=(255, 255, 255, 255), stroke_width=6, stroke_fill=(0, 0, 0, 255))
    for i, l in enumerate(lines):
        w = d.textlength(l, font=f)
        g.text(((bw - w) / 2, pady - 4 + i * lh), l, font=f, **kw)
    img.save(out)
    return bw, bh


def tim_clip(thu_muc):
    import re
    cl = sorted(p for p in glob.glob(os.path.join(thu_muc, "canh_*.mp4"))
                if re.fullmatch(r"canh_\d{2}\.mp4", os.path.basename(p)))   # bỏ bản cũ *.bak.mp4
    if not cl:
        raise RuntimeError(f"Không có canh_XX.mp4 trong {thu_muc}")
    return cl


PHIEN_CAT = 1794834800   # đổi số này (epoch) khi đổi cách cắt cảnh -> làm lại các file *_cat.mp4 cũ


def cat_canh(c, log=print, nhan=""):
    """canh_XX.mp4 -> canh_XX_cat.mp4: bỏ hình thừa trước khi nói và sau khi nói xong (nhân vật chỉ làm động tác),
    chuẩn hoá 1080x1920 30fps, tiếng 48 kHz stereo. Có sẵn và còn mới thì dùng lại."""
    cat = c[:-4] + "_cat.mp4"
    if os.path.exists(cat) and os.path.getmtime(cat) >= max(os.path.getmtime(c), PHIEN_CAT):
        return cat
    dur, co_tieng = thong_tin(c)
    ss, tt = khoang_giu(c, dur) if co_tieng else (0.0, dur)
    log(f"Cắt cảnh {nhan or os.path.basename(c)}: giữ {ss:.2f}–{ss + tt:.2f}s / {dur:.1f}s")
    work = tempfile.mkdtemp(prefix="cat_")
    try:
        src = os.path.join(work, "s.mp4"); tmp = os.path.join(work, "c.mp4")
        shutil.copyfile(c, src)
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS},format=yuv420p"
        cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{ss:.3f}", "-t", f"{tt:.3f}", "-i", src]
        if not co_tieng:
            cmd += ["-f", "lavfi", "-t", f"{tt:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
        cmd += ["-map", "0:v:0", "-map", "0:a:0" if co_tieng else "1:a:0", "-vf", vf,
                "-af", "aresample=48000,aformat=channel_layouts=stereo,afade=t=out:st=%.3f:d=0.12" % max(0, tt - 0.12),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-r", str(FPS),
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest", tmp]
        chay(cmd)
        shutil.copyfile(tmp, cat)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    return cat


GIONG_BAO_NGA = "bao_nga"         # đổi sang giọng thật Bảo Nga (Seed-VC, mẫu bao-nga-mau.wav)
GIONG_VEO_DONG_NHAT = "veo_dong_nhat"   # giữ giọng Veo nữ miền Bắc, đổi cảnh 2..5 về đúng giọng cảnh 1 cho đồng nhất
GIONG_VEO = "veo"                 # giọng Veo gốc từng cảnh, không đổi


def che_do_giong(kb):
    g = kb.get("giong")
    if g in (GIONG_BAO_NGA, GIONG_VEO_DONG_NHAT, GIONG_VEO):
        return g
    return GIONG_BAO_NGA if kb.get("giong_bao_nga", True) else GIONG_VEO


def _gc(cat, che_do=GIONG_BAO_NGA):
    return cat[:-4] + ("_dongnhat.mp4" if che_do == GIONG_VEO_DONG_NHAT else "_giong.mp4")


def giong_canh(cats, log=print, che_do=GIONG_BAO_NGA):
    """Đổi giọng các cảnh đã cắt (cache *_cat_giong.mp4 / *_cat_dongnhat.mp4). Lỗi -> giữ giọng Veo gốc.
    Chế độ Veo đồng nhất: giọng mẫu = tiếng cảnh 1 (canh_01_cat.mp4 cùng thư mục); mọi cảnh (kể cả cảnh 1)
    đi qua cùng 1 mô hình + hậu kỳ nên âm sắc, độ to, độ sáng giọng giống hệt nhau."""
    import giong
    if che_do == GIONG_VEO:
        return cats
    if not giong.san_sang():
        log("Chưa cài bộ đổi giọng -> giữ giọng Veo gốc")
        return cats
    mau, moc = None, giong.PHIEN
    if che_do == GIONG_BAO_NGA:
        moc = max(moc, os.path.getmtime(giong.MAU))   # thay giọng mẫu -> tự làm lại các cảnh đã đổi bằng mẫu cũ
    if che_do == GIONG_VEO_DONG_NHAT:
        c1 = os.path.join(os.path.dirname(cats[0]), "canh_01_cat.mp4")
        if not os.path.exists(c1):
            log("Chưa có cảnh 1 để làm giọng mẫu -> để bước ghép làm")
            return cats
        moc = max(moc, os.path.getmtime(c1))
        mau = os.path.join(tempfile.gettempdir(), f"mau_c1_{int(time.time() * 1000)}.wav")
        giong.mau_tu_clip(c1, mau)
    can = [(c, _gc(c, che_do)) for c in cats
           if not os.path.exists(_gc(c, che_do)) or os.path.getmtime(_gc(c, che_do)) < max(os.path.getmtime(c), moc)]
    try:
        if can:
            giong.doi_giong_nhieu(can, log=log, mau=mau)
    except Exception as e:
        log(f"  đổi giọng lỗi, giữ giọng Veo gốc: {str(e)[-200:]}")
    finally:
        if mau and os.path.exists(mau):
            os.remove(mau)
    return [_gc(c, che_do) if os.path.exists(_gc(c, che_do)) else c for c in cats]


class ChuanBiNen:
    """Làm trước trong lúc Flow còn đang tạo cảnh sau: cảnh nào xong thì cắt + đổi giọng ngay (luồng nền),
    nên khi Flow xong hết, bước ghép chỉ còn chèn chữ + nhạc. Dùng: nen.them(duong_dan_canh) ... nen.cho_xong()."""

    def __init__(self, giong_bao_nga=True, log=print):
        """giong_bao_nga: True/False (kiểu cũ) hoặc chế độ giọng GIONG_BAO_NGA / GIONG_VEO_DONG_NHAT / GIONG_VEO."""
        import queue, threading
        if giong_bao_nga is True:
            giong_bao_nga = GIONG_BAO_NGA
        elif not giong_bao_nga:
            giong_bao_nga = GIONG_VEO
        self.q, self.giong, self.log = queue.Queue(), giong_bao_nga, log
        self.t = threading.Thread(target=self._chay, daemon=True)
        self.t.start()

    def them(self, clip):
        self.q.put(clip)

    def _chay(self):
        import queue
        L = lambda m: self.log("[làm trước] " + m)
        het = False
        while not het:
            lo = [self.q.get()]
            # 20/11/2026: Flow chạy song song trả nhiều cảnh gần cùng lúc -> gom các cảnh đang chờ,
            # đổi giọng 1 lượt (nạp mô hình Seed-VC 1 lần) thay vì từng cảnh một
            while True:
                try:
                    lo.append(self.q.get_nowait())
                except queue.Empty:
                    break
            if None in lo:
                het = True
                lo = [c for c in lo if c is not None]
            cats = []
            for c in lo:
                try:
                    cats.append(cat_canh(c, L))
                except Exception as e:
                    L(f"{os.path.basename(c)} lỗi cắt, để bước ghép làm lại: {str(e)[-150:]}")
            if cats and self.giong != GIONG_VEO:
                try:
                    giong_canh(cats, L, self.giong)
                except Exception as e:
                    L(f"đổi giọng lỗi, để bước ghép làm lại: {str(e)[-150:]}")

    def cho_xong(self):
        self.q.put(None)
        self.t.join()

def _xuat_tinh(kb, mocs, tong, base, work, log, final):
    """Kiểu cũ: hook + phụ đề tĩnh (PNG) + nhạc nền."""
    canh = kb["canh"]
    # 2. ảnh chữ: hook + phụ đề
    overlays = []  # (png, x, y, t_bat_dau, t_ket_thuc)
    hp = os.path.join(work, "hook.png")
    bw, bh = png_hook(kb.get("hook_chu") or kb.get("tieu_de", ""), hp)
    # ~60% chiều cao: dưới mặt nhân vật, trên phụ đề
    overlays.append((hp, (W - bw) // 2, min(int(H * 0.6) - bh // 2, H - 650 - bh), 0.0, min(HOOK_GIAY, tong)))   # luôn chừa chỗ cho phụ đề
    for i, (a, d) in enumerate(mocs):
        loi = (canh[i]["loi_thoai"] if i < len(canh) else "") or ""
        trang = chia_trang(loi)
        if not loi.strip():
            continue
        lo, hi = a + 0.25, a + max(0.5, d - 0.35)   # lời thoại thường bắt đầu sát đầu, hết trước cuối cảnh
        tong_ky_tu = sum(len(t.replace("\n", " ")) for t in trang) or 1
        cur = lo
        for j, t in enumerate(trang):
            seg = (hi - lo) * len(t.replace("\n", " ")) / tong_ky_tu
            p = os.path.join(work, f"p{i:02d}_{j}.png")
            pw, ph = png_phu_de(t, p)
            overlays.append((p, (W - pw) // 2, H - 430 - ph, cur, cur + seg))
            cur += seg

    # 3. overlay tất cả trong 1 lần encode
    log(f"Chèn hook + {len(overlays) - 1} đoạn phụ đề...")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", base]
    for p, *_ in overlays:
        # ảnh chữ lặp suốt video (ảnh 1 khung hình dễ bị overlay bỏ qua sau vài giây)
        cmd += ["-loop", "1", "-t", f"{tong:.3f}", "-i", p]
    fc, prev = [], "0:v"
    for k, (p, x, y, a, b) in enumerate(overlays, 1):
        nxt = f"v{k}"
        fc.append(f"[{prev}][{k}:v]overlay={x}:{y}:enable='between(t,{a:.3f},{b:.3f})'[{nxt}]")
        prev = nxt
    # nhạc nền: nhỏ dưới giọng nói, tự hạ thêm khi đang nói (sidechain), mở/kết mờ dần
    import nhac
    lc = kb.get("nhac_nen")
    bai = nhac.chon(nhac.theo_mood(kb) if lc in (None, "", nhac.THEO_MOOD) else lc)
    amap = "0:a"
    if bai:
        log(f"Nhạc nền: {os.path.basename(bai)}")
        mp = os.path.join(work, "nhac" + os.path.splitext(bai)[1])
        shutil.copyfile(bai, mp)
        k = len(overlays) + 1
        cmd += ["-stream_loop", "-1", "-i", mp]
        muc = float(kb.get("nhac_lufs", -27))
        fc.append(f"[{k}:a]loudnorm=I={muc}:TP=-6:LRA=7,aresample=48000,aformat=channel_layouts=stereo,"
                  f"afade=t=in:d=0.6,afade=t=out:st={max(0, tong - 1.6):.3f}:d=1.6[nh]")
        fc.append("[0:a]asplit=2[gn][sc]")
        fc.append("[nh][sc]sidechaincompress=threshold=0.04:ratio=4:attack=30:release=350[nhd]")
        fc.append("[gn][nhd]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]")
        amap = "[aout]"
    script = os.path.join(work, "fc.txt")
    open(script, "w", encoding="utf-8").write(";\n".join(fc))
    cmd += ["-filter_complex_script", script, "-map", f"[{prev}]", "-map", amap,
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS)]
    cmd += ["-c:a", "copy"] if amap == "0:a" else ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    cmd += ["-t", f"{tong:.3f}", "-movflags", "+faststart", final]   # -t: không để lớp chữ/nhạc kéo dài video
    try:
        chay(cmd)
    except RuntimeError:
        # ffmpeg 9 đổi cờ: thử cú pháp -/filter_complex
        cmd[cmd.index("-filter_complex_script")] = "-/filter_complex"
        chay(cmd)



def ghep(thu_muc, kb=None, log=print, thu_muc_ra=None):
    kb = kb or json.load(open(os.path.join(thu_muc, "kichban.json"), encoding="utf-8"))
    CONCEPT.clear(); CONCEPT.update(kb.get("concept") or {})
    if CONCEPT:
        log(f"Concept chữ theo ảnh: hook {CONCEPT.get('accent')}, phụ đề {CONCEPT.get('dark')}, font {CONCEPT.get('font')}")
    clips = tim_clip(thu_muc)
    if len(clips) < len(kb["canh"]):
        raise RuntimeError(f"Mới có {len(clips)}/{len(kb['canh'])} cảnh — chưa ghép được")
    canh = kb["canh"]
    work = tempfile.mkdtemp(prefix="ghep_")
    try:
        # 1. cắt từng cảnh (bỏ hình thừa đầu/cuối) + đổi giọng Bảo Nga — dùng lại kết quả đã làm sẵn lúc Flow đang tạo cảnh
        cats = [cat_canh(c, log, f"{i + 1}/{len(clips)}") for i, c in enumerate(clips)]
        cats0 = list(cats)          # tiếng Veo gốc đã cắt: rõ chữ hơn -> dùng để căn mốc chữ
        cd = che_do_giong(kb)
        if cd != GIONG_VEO:
            cats = giong_canh(cats, log, cd)
        norm, mocs = [], []
        t0 = 0.0
        for i, c in enumerate(cats):
            out = os.path.join(work, f"n{i:02d}.mp4")
            shutil.copyfile(c, out)
            d2, _ = thong_tin(out)
            norm.append(out)
            mocs.append((t0, d2))
            t0 += d2
        lst = os.path.join(work, "list.txt")
        with open(lst, "w", encoding="utf-8") as f:
            f.write("".join(f"file '{os.path.basename(p)}'\n" for p in norm))
        base = os.path.join(work, "base.mp4")
        chay(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "copy",
              "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", base])
        tong = t0

        final = os.path.join(work, "final.mp4")
        if kb.get("dong_hoa", True):
            import dong_hoa_xuat
            dong_hoa_xuat.xuat(kb, cats0, mocs, tong, base, work, final, thu_muc, log)
        else:
            _xuat_tinh(kb, mocs, tong, base, work, log, final)

        ra = thu_muc_ra or THANH_PHAM
        os.makedirs(ra, exist_ok=True)
        ten = ten_file_an_toan(man_hinh(kb.get("tieu_de") or os.path.basename(thu_muc)))
        dich = os.path.join(ra, ten + ".mp4")
        if kb.get("thumbnail_1s", True):       # thumbnail ở 1 giây đầu + file .jpg ảnh bìa (18/11/2026)
            try:
                import thumbnail
                co_thumb = os.path.join(work, "final_thumb.mp4")
                thumbnail.lam(thu_muc, kb, final, co_thumb, os.path.join(ra, ten + ".jpg"), log)
                final = co_thumb
            except Exception as e:
                log(f"  thumbnail lỗi, xuất video không thumbnail: {str(e)[-200:]}")
        shutil.copyfile(final, dich)
        with open(os.path.join(ra, ten + ".txt"), "w", encoding="utf-8") as f:
            f.write(man_hinh(kb.get("caption") or "").strip() + "\n")
        log(f"XONG: {dich}")
        return dich
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Dùng: python ghep.py <thư mục dự án có canh_XX.mp4 + kichban.json>")
        sys.exit(1)
    ghep(sys.argv[1])
