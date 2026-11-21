# -*- coding: utf-8 -*-
"""Motion graphics + âm thanh thông minh cho VIDEO 247 (18/11/2026).

Vẽ 1 lớp đồ hoạ trong suốt (Pillow, 30 khung/giây) đè lên video, mọi thứ bám đúng mốc chữ đang nói (can_chu.py):
  - hook pop 3D, phụ đề theo đúng lúc nói, thanh tiến trình, lower-third tên chị
  - hiệu ứng theo ý nghĩa từng cảnh (kb["canh"][i]["hieu_ung"]):
      keyword   : chữ 3D + icon nảy lên đúng chữ đang nói           (âm pop/impact/ding)
      danh_sach : các việc hiện lần lượt kèm icon (checklist)        (pop từng mục)
      so_do     : sơ đồ các bước nối mũi tên, hiện lần lượt          (whoosh)
      luoi_icon : nhiều icon (vd hàng ngàn shop) bung ra             (pop)
      dau       : con dấu cảnh báo xoay nghiêng                      (impact)
      broll     : ảnh minh hoạ toàn màn hình, zoom chậm (Ken Burns)  (whoosh vào/ra)
      cta       : riser -> chữ khoá 3D + ô bình luận gõ chữ + mũi tên + vòng tròn highlight (click)
  - kế hoạch zoom cho video gốc: đẩy chậm + punch-in giữa cảnh (giả lập đổi góc máy) mỗi ~3–4 giây
  - dòng thời gian âm thanh: bộ âm nhận diện cố định sfx.py
Cảnh chưa có "hieu_ung" -> tự_dong() tự đoán keyword (con số, câu hỏi, chữ khoá CTA)."""
import os, re, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from common import *
import can_chu

W, H, FPS = 1080, 1920, 30
EMOJI = r"C:\Windows\Fonts\seguiemj.ttf"
VUNG_Y = 1060          # tâm vùng đồ hoạ mặc định (bố cục sẽ đặt lại theo khuôn mặt thật)
PD_DAY = H - 380       # đáy phụ đề (thấp hơn bản cũ 50px để chừa chỗ dưới cằm; vẫn trên vùng chữ/nút của Reels)
PD_DINH = PD_DAY - 180  # đỉnh phụ đề 2 dòng
NO_WIN = 0x08000000 if os.name == "nt" else 0


# ---------------- tiện ích vẽ ----------------
def mau(hexs, a=255):
    h = (hexs or "#FFFFFF").lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def toi(c, k=0.55):
    return tuple(int(v * k) for v in c[:3]) + (c[3] if len(c) > 3 else 255,)


def font(dam=True, co=60):
    import ghep
    return ImageFont.truetype(ghep.tim_font(dam), co)


def icon_img(ky_tu, co=110):
    f = ImageFont.truetype(EMOJI, co)
    im = Image.new("RGBA", (int(co * 1.4), int(co * 1.4)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((co * 0.2, co * 0.1), ky_tu, font=f, embedded_color=True)
    bb = im.getbbox()
    return im.crop(bb) if bb else im


def bong(im, r=14, lech=(0, 10), a=150):
    """thêm bóng đổ mềm dưới sprite (tạo chiều sâu)."""
    pad = r * 3
    out = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, a))
    sh.putalpha(im.split()[3].point(lambda v: v * a // 255))
    out.paste(sh, (pad + lech[0], pad + lech[1]), sh)
    out = out.filter(ImageFilter.GaussianBlur(r))
    out.alpha_composite(im, (pad, pad))
    return out


def chu_3d(text, co=96, mat=(255, 255, 255, 255), than=(30, 30, 30, 255), sau=9, vien=None):
    """chữ 3D: đùn khối nhiều lớp lệch xuống-phải + mặt chữ sáng + bóng đổ."""
    f = font(True, co)
    d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
    lines = text.split("\n")
    lh = int(co * 1.18)
    wmax = max(d.textlength(l, font=f) for l in lines)
    im = Image.new("RGBA", (int(wmax + sau + 30), lh * len(lines) + sau + 30), (0, 0, 0, 0))
    g = ImageDraw.Draw(im)
    for k in range(sau, 0, -1):
        c = toi(than, 0.65 + 0.35 * (sau - k) / sau)
        for i, l in enumerate(lines):
            x = (wmax - d.textlength(l, font=f)) / 2
            g.text((10 + x + k, 6 + i * lh + k), l, font=f, fill=c)
    for i, l in enumerate(lines):
        x = (wmax - d.textlength(l, font=f)) / 2
        kw = {"stroke_width": 3, "stroke_fill": vien} if vien else {}
        g.text((10 + x, 6 + i * lh), l, font=f, fill=mat, **kw)
    return bong(im, 12, (0, 12), 120)


def the_bo(w, h, nen, r=36, vien=None):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=nen, outline=vien, width=4 if vien else 0)
    return im


def ghep_ngang(*ims, khe=18):
    w = sum(i.width for i in ims) + khe * (len(ims) - 1)
    h = max(i.height for i in ims)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = 0
    for i in ims:
        out.alpha_composite(i, (x, (h - i.height) // 2)); x += i.width + khe
    return out


def de(nen, sp, cx, cy, s=1.0, a=1.0, goc=0):
    """đặt sprite tâm (cx, cy), tỉ lệ s, độ đục a, xoay goc độ."""
    if sp is None or a <= 0.01 or s <= 0.02:
        return
    if goc:
        sp = sp.rotate(goc, resample=Image.BICUBIC, expand=True)
    if abs(s - 1) > 0.01:
        sp = sp.resize((max(1, int(sp.width * s)), max(1, int(sp.height * s))), Image.BILINEAR)
    if a < 0.99:
        sp = sp.copy(); al = sp.split()[3].point(lambda v: int(v * a)); sp.putalpha(al)
    nen.alpha_composite(sp, (int(cx - sp.width / 2), int(cy - sp.height / 2)))


def nay(t):
    """độ phóng khi nảy lên (pop): 0 -> 1.12 -> 1.0 trong 0,28s."""
    if t <= 0:
        return 0.0
    if t >= 0.28:
        return 1.0
    x = t / 0.28 - 1
    c1 = 1.9
    return 0.35 + 0.65 * (1 + (c1 + 1) * x ** 3 + c1 * x ** 2)      # easeOutBack: vượt ~1,1 rồi về 1


def mo(t, t0, t1, vao=0.18, ra=0.2):
    """độ đục: hiện dần ở t0, mờ dần trước t1."""
    if t < t0 or t > t1:
        return 0.0
    return min(1.0, (t - t0) / vao, (t1 - t) / ra)


# ---------------- phần tử đồ hoạ ----------------
class PT:
    t0 = t1 = 0.0
    lop = 5            # lớp vẽ: nhỏ vẽ trước (broll=0, phụ đề=8)
    uu_tien = "duoi"   # bố cục: "duoi" = dưới cằm, "tren" = trên đầu (không bao giờ đè lên mặt)
    y, s = 1060, 1.0

    def cao(self):
        return self.sp.height

    def ve(self, nen, t):
        pass


class Hook(PT):
    lop = 6
    uu_tien = "tren"

    def __init__(self, text, cc, t1):
        import ghep, tempfile
        p = os.path.join(tempfile.gettempdir(), "v247_hook.png")
        ghep.png_hook(text, p)
        self.sp = bong(Image.open(p).convert("RGBA"), 16, (0, 14), 140)
        self.t0, self.t1 = 0.05, t1

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.05, 0.25)
        if a:
            de(nen, self.sp, W / 2, self.y, nay(t - self.t0) * self.s, a)


class PhuDe(PT):
    lop = 8

    def __init__(self, sp, t0, t1):
        self.sp, self.t0, self.t1 = sp, t0, t1

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.08, 0.08)
        if a:
            dy = 6 * (1 - min(1, (t - self.t0) / 0.12))
            de(nen, self.sp, W / 2, PD_DAY - self.sp.height / 2 + dy, 1, a)


class TienTrinh(PT):
    lop = 9

    def __init__(self, tong, cc):
        self.t0, self.t1, self.tong, self.c = 0, tong, tong, mau(cc.get("accent", "#FFC42E"))

    def ve(self, nen, t):
        g = ImageDraw.Draw(nen)
        g.rounded_rectangle([40, 34, W - 40, 44], 5, fill=(255, 255, 255, 70))
        g.rounded_rectangle([40, 34, 40 + int((W - 80) * min(1, t / self.tong)), 44], 5, fill=self.c)


class LowerThird(PT):
    lop = 7

    def __init__(self, ten, mo_ta, cc, t0, t1):
        f1, f2 = font(True, 46), font(False, 32)
        d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
        w = int(max(d.textlength(ten, font=f1), d.textlength(mo_ta, font=f2)) + 90)
        im = Image.new("RGBA", (w, 140), (0, 0, 0, 0))
        g = ImageDraw.Draw(im)
        g.rounded_rectangle([0, 0, w - 1, 139], 22, fill=mau(cc.get("dark", "#14213D"), 225))
        g.rounded_rectangle([0, 0, 14, 139], 7, fill=mau(cc.get("accent", "#FFC42E")))
        g.text((38, 16), ten, font=f1, fill=(255, 255, 255, 255))
        g.text((38, 78), mo_ta, font=f2, fill=mau(cc.get("accent", "#FFC42E")))
        self.sp, self.t0, self.t1 = bong(im, 10, (0, 8), 110), t0, t1
        self.y = 250

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.25, 0.3)
        if a:
            k = min(1, (t - self.t0) / 0.35)
            x = 20 + self.sp.width / 2 - (self.sp.width + 40) * (1 - k) ** 3     # trượt từ mép trái vào
            de(nen, self.sp, x, self.y, 1, a)


class Keyword(PT):
    def __init__(self, chu, icon, cc, t0, t1, y=VUNG_Y):
        mat = (255, 255, 255, 255)
        than = mau(cc.get("accent", "#FFC42E"))
        sp = chu_3d(chu, 92, mat, than, 10, vien=mau(cc.get("dark", "#222222")))    # viền tối: đọc rõ trên nền sáng
        if icon:
            sp = ghep_ngang(bong(icon_img(icon, 120), 10, (0, 10), 120), sp, khe=4)
        if sp.width > W - 60:
            s = (W - 60) / sp.width
            sp = sp.resize((int(sp.width * s), int(sp.height * s)), Image.LANCZOS)
        self.sp, self.t0, self.t1, self.y = sp, t0, t1, y

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.06, 0.2)
        if a:
            de(nen, self.sp, W / 2, self.y, nay(t - self.t0) * self.s, a)


class Dau(PT):
    lop = 7

    def __init__(self, chu, icon, t0, t1, mau_dau="#E53935"):
        c = mau(mau_dau)
        f = font(True, 84)
        d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
        noi = (icon + " " if icon else "")
        w = int(d.textlength(chu, font=f) + (130 if icon else 0) + 80)
        im = Image.new("RGBA", (w, 150), (0, 0, 0, 0))
        g = ImageDraw.Draw(im)
        g.rounded_rectangle([4, 4, w - 5, 145], 18, outline=c, width=10, fill=(255, 255, 255, 215))
        x = 40
        if icon:
            ic = icon_img(icon, 90); im.alpha_composite(ic, (x, (150 - ic.height) // 2)); x += ic.width + 14
        g.text((x, 22), chu, font=f, fill=c)
        self.sp, self.t0, self.t1 = bong(im, 10, (0, 8), 120), t0, t1

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.04, 0.2)
        if a:
            k = t - self.t0
            s = 1.0 if k > 0.18 else 1.9 - 0.9 * (k / 0.18)     # đóng dấu: to -> đập xuống
            de(nen, self.sp, W / 2, self.y, s * self.s, a, goc=-8)


class DanhSach(PT):
    def __init__(self, muc, cc, t1):
        self.muc = []
        f = font(True, 58)
        for chu, icon, tm in muc:
            ic = icon_img(icon, 84) if icon else None
            d = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
            w = int(d.textlength(chu, font=f) + (130 if ic else 40) + 44)
            im = the_bo(w, 124, (255, 255, 255, 238), 30)
            x = 28
            if ic:
                im.alpha_composite(ic, (x, (124 - ic.height) // 2)); x += ic.width + 18
            ImageDraw.Draw(im).text((x, 26), chu, font=f, fill=mau(cc.get("dark", "#222222")))
            self.muc.append((bong(im, 8, (0, 7), 110), tm))
        self.t0, self.t1 = min(m[1] for m in self.muc), t1
        self.rong = W - 80          # bề rộng cho phép (bố cục co lại nếu cạnh mặt hẹp)
        self.y0 = 360

    def cao(self):
        return 146 * len(self.muc)

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.01, 0.25)
        if not a:
            return
        for i, (sp, tm) in enumerate(self.muc):
            if t >= tm:
                k = min(1, (t - tm) / 0.25)
                s = min(1.0, self.rong / sp.width) * self.s
                x = 40 + sp.width * s / 2 - 120 * (1 - k) ** 2
                de(nen, sp, x, self.y0 + i * 146 * self.s, nay(t - tm) * s, a * min(1, k * 2))


class SoDo(PT):
    def __init__(self, buoc, cc, t1):
        self.n = []
        f = font(True, 44)
        for chu, icon, tm in buoc:
            im = the_bo(330, 250, (255, 255, 255, 242), 34, vien=mau(cc.get("accent", "#FFC42E")))
            if icon:
                ic = icon_img(icon, 110); im.alpha_composite(ic, ((330 - ic.width) // 2, 20))
            d = ImageDraw.Draw(im)
            tw = d.textlength(chu, font=f)
            d.text(((330 - tw) / 2, 168), chu, font=f, fill=mau(cc.get("dark", "#222222")))
            self.n.append((bong(im, 10, (0, 9), 110), tm))
        self.t0, self.t1 = min(m[1] for m in self.n), t1
        self.c = mau(cc.get("accent", "#FFC42E"))

    def cao(self):
        return self.n[0][0].height * min(1, (W - 40) / (len(self.n) * 345))   # gồm cả bóng đổ

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.01, 0.25)
        if not a:
            return
        n = len(self.n); khe = (W - 60) / n
        xs = [30 + khe * (i + 0.5) for i in range(n)]
        g = ImageDraw.Draw(nen)
        for i in range(1, n):          # đường nối chạy dần (line animation)
            tm = self.n[i][1]
            if t >= tm - 0.3:
                k = min(1, (t - tm + 0.3) / 0.3)
                xa, xb = xs[i - 1] + 120, xs[i] - 120
                xe = xa + (xb - xa) * k
                y = self.y
                g.line([xa, y, xe, y], fill=self.c[:3] + (int(255 * a),), width=10)
                if k >= 1:
                    g.polygon([(xb + 6, y), (xb - 22, y - 18), (xb - 22, y + 18)], fill=self.c[:3] + (int(255 * a),))
        for i, (sp, tm) in enumerate(self.n):
            if t >= tm:
                de(nen, sp, xs[i], self.y, nay(t - tm) * min(1, (W - 40) / (n * 345)) * self.s, a)


class LuoiIcon(PT):
    def __init__(self, icon, so, chu, cc, t0, t1):
        self.ic = bong(icon_img(icon, 120), 8, (0, 8), 110)
        self.so, self.t0, self.t1 = so, t0, t1
        self.nhan = chu_3d(chu, 80, (255, 255, 255, 255), mau(cc.get("accent", "#FFC42E")), 9, vien=mau(cc.get("dark", "#222222"))) if chu else None
        self.dat_icon((380, 500, 700, 1050))

    def cao(self):
        return self.nhan.height if self.nhan else 10

    def dat_icon(self, mat):
        """icon bung ra 2 dải hai bên khuôn mặt (không che mặt), xuất hiện so le."""
        rng = np.random.default_rng(7)
        x0, y0, x1, y1 = mat
        trai = (60, max(70, x0 - 70)); phai = (min(W - 70, x1 + 70), W - 60)
        self.vt = []
        for k in range(self.so):
            lo, hi = trai if k % 2 == 0 else phai
            x = lo + rng.random() * max(1, hi - lo)
            y = max(120, y0 - 60) + (k // 2) * ((y1 - y0 + 120) / max(1, (self.so + 1) // 2)) + rng.random() * 25
            self.vt.append((x, y, k * 0.06))

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.05, 0.25)
        if not a:
            return
        for x, y, tre in self.vt:
            de(nen, self.ic, x, y, nay(t - self.t0 - tre) * 0.9, a)
        if self.nhan:
            de(nen, self.nhan, W / 2, self.y, nay(t - self.t0 - 0.2) * self.s, a)


class BRoll(PT):
    lop = 0

    def __init__(self, anh, t0, t1):
        im = Image.open(anh).convert("RGBA")
        s = max(W / im.width, H / im.height) * 1.12
        self.sp = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        self.t0, self.t1 = t0, t1

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.12, 0.12)
        if not a:
            return
        k = (t - self.t0) / max(0.1, self.t1 - self.t0)
        s = 1.0 - 0.08 * (1 - k)            # Ken Burns: thu nhỏ dần (cảm giác máy lùi)
        sp = self.sp.resize((int(self.sp.width * s), int(self.sp.height * s)), Image.BILINEAR) if abs(s - 1) > 0.005 else self.sp
        x = (W - sp.width) / 2 + 30 * (k - 0.5); y = (H - sp.height) / 2
        if a < 0.99:
            sp = sp.copy(); sp.putalpha(sp.split()[3].point(lambda v: int(v * a)))
        nen.alpha_composite(sp, (int(x), int(y)))


class Cta(PT):
    lop = 7

    def __init__(self, tu_khoa, cc, t0, t1):
        self.t0, self.t1 = t0, t1
        self.kw = chu_3d(tu_khoa, 150, (255, 255, 255, 255), mau(cc.get("accent", "#FFC42E")), 14, vien=mau(cc.get("dark", "#222222")))
        self.tk = tu_khoa
        self.f = font(True, 46); self.f2 = font(False, 34)
        self.c = mau(cc.get("accent", "#FFC42E"))
        self.tro = bong(icon_img("👈", 100), 8, (0, 8), 120)
        self.y_kw, self.y_o = 300, 1150

    def cao(self):
        return self.kw.height

    def ve(self, nen, t):
        a = mo(t, self.t0, self.t1, 0.03, 0.3)
        if not a:
            return
        k = t - self.t0
        de(nen, self.kw, W / 2, self.y_kw, nay(k) * self.s, a)
        if k < 0.5:
            return
        # ô bình luận (UI) trượt lên + gõ chữ khoá
        bw, bh, x0, y0 = 860, 110, (W - 860) // 2, int(self.y_o - 55)
        g = ImageDraw.Draw(nen)
        g.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], 60, fill=(255, 255, 255, int(240 * a)), outline=self.c[:3] + (int(255 * a),), width=5)
        g.text((x0 + 40, y0 + 14), "💬", font=ImageFont.truetype(EMOJI, 56), embedded_color=True)
        so = min(len(self.tk), int((k - 0.7) / 0.12)) if k > 0.7 else 0
        go = self.tk[:max(0, so)]
        g.text((x0 + 130, y0 + 32), (go + ("|" if int(k * 3) % 2 == 0 else "")) if go else "Viết bình luận...", font=self.f,
               fill=(30, 30, 30, int(255 * a)) if go else (150, 150, 150, int(255 * a)))
        if k > 0.7 + 0.12 * len(self.tk) + 0.2:     # vòng tròn highlight vẽ dần quanh ô + con trỏ chỉ vào
            kk = min(1, (k - 0.7 - 0.12 * len(self.tk) - 0.2) / 0.5)
            g.arc([x0 - 20, y0 - 18, x0 + bw + 20, y0 + bh + 18], -90, -90 + 360 * kk, fill=(255, 214, 0, int(255 * a)), width=8)
            bob = 14 * math.sin(k * 7)
            de(nen, self.tro, x0 + bw - 60 + bob, y0 + bh / 2, 0.8, a)      # ngón tay chỉ vào ô, nằm trong ô


# ---------------- khuôn mặt + bố cục né mặt ----------------
def mat_canh(cat):
    """Hộp khuôn mặt (x0, y0, x1, y1) trong khung 1080x1920 của cảnh đã cắt — gộp nhiều khung hình,
    nới rộng lên trán/tóc và xuống cằm. Cache canh_XX_cat_mat.json."""
    import json
    cache = cat[:-4] + "_mat.json"
    if os.path.exists(cache) and os.path.getmtime(cache) >= os.path.getmtime(cat):
        return tuple(json.load(open(cache))["mat"])
    import cv2, do_mat
    det, _ = do_mat._mo()
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", cat],
                       capture_output=True, text=True, creationflags=NO_WIN)
    dur = float(r.stdout.strip() or 6)
    hop = []
    for k in range(7):
        t = 0.2 + (dur - 0.4) * k / 6
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", cat, "-frames:v", "1", "-vf", "scale=540:960",
                              "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, creationflags=NO_WIN).stdout
        if len(raw) < 540 * 960 * 3:
            continue
        img = np.frombuffer(raw[:540 * 960 * 3], np.uint8).reshape(960, 540, 3)
        det.setInputSize((540, 960))
        _, f = det.detect(img)
        if f is not None and len(f):
            x, y, w, h = max(f, key=lambda q: q[2] * q[3])[:4] * 2
            hop.append((x - 0.08 * w, y - 0.08 * h, x + w * 1.08, y + h * 1.05))   # hộp YuNet đã từ trán tới cằm; nới nhẹ
    if not hop:
        m = (300, 420, 780, 1080)       # không thấy mặt: giả định mặt giữa khung
    else:
        m = tuple(float(v) for v in (min(b[0] for b in hop), min(b[1] for b in hop), max(b[2] for b in hop), max(b[3] for b in hop)))
    json.dump({"mat": m}, open(cache, "w"))
    return m


def mat_sau_zoom(m, doan):
    """hộp mặt trên khung xuất sau khi zoom/punch-in (gộp mọi mức zoom trong cảnh)."""
    x0, y0, x1, y1 = m
    ra = []
    for _, _, z0, z1, dx in doan:
        for z in (z0, z1):
            ox, oy = (1080 * z - 1080) / 2 + dx, (1920 * z - 1920) * 0.35
            ra.append((x0 * z - ox, y0 * z - oy, x1 * z - ox, y1 * z - oy))
    return (min(r[0] for r in ra), min(r[1] for r in ra), max(r[2] for r in ra), max(r[3] for r in ra))


def bo_cuc(pts, mat_tg, log=print):
    """Đặt mọi thành phần phụ vào khoảng trống TRÊN ĐẦU hoặc DƯỚI CẰM (trên phụ đề), co nhỏ nếu thiếu chỗ.
    mat_tg(t) -> hộp mặt tại giây t (None nếu đang có B-roll che mặt)."""
    for p in pts:
        if isinstance(p, (PhuDe, TienTrinh, BRoll)):
            continue
        m = mat_tg((p.t0 + p.t1) / 2) or mat_tg(p.t0)
        if m is None:
            continue          # B-roll che kín: đặt đâu cũng không che mặt
        fx0, fy0, fx1, fy1 = m
        tren = (70, fy0 - 18)
        duoi = (fy1 + 18, PD_DINH - 14)

        def dat(h, uu):
            cho = {"tren": tren, "duoi": duoi}
            for b in (uu, "duoi" if uu == "tren" else "tren"):
                lo, hi = cho[b]
                if hi - lo >= h:
                    return (lo + hi) / 2, 1.0
            b = max(cho, key=lambda k: cho[k][1] - cho[k][0])
            lo, hi = cho[b]
            return (lo + hi) / 2, max(0.45, (hi - lo) / h)
        if isinstance(p, LowerThird):
            p.y = 125 if fy0 < 340 else 250
        elif isinstance(p, Cta):
            # chữ khoá LUÔN trên đầu (co nhỏ nếu thiếu chỗ), ô bình luận dưới cằm -> không bao giờ chồng lên nhau
            # (18/11/2026 video spa: dải trên đầu hơi hẹp, chữ VIDEO bị đẩy xuống dưới và nằm sau ô bình luận)
            if tren[1] - tren[0] >= 90:
                p.y_kw = (tren[0] + tren[1]) / 2
                p.s = min(1.0, (tren[1] - tren[0]) / p.kw.height)
            else:
                p.y_kw, p.s = dat(p.kw.height, "tren")
            p.y_o = (duoi[0] + duoi[1]) / 2
            if abs(p.y_o - p.y_kw) < 150:
                p.y_o = max(p.y_o, p.y_kw + p.kw.height * p.s / 2 + 80)
        elif isinstance(p, DanhSach):
            if not getattr(p, "tren_broll", False):
                p.rong = max(240, fx0 - 60)            # cột bên trái mặt
                p.y0 = max(140, fy0 - 40)
                p.s = min(1.0, (PD_DINH - 20 - p.y0) / max(1, p.cao()))
        else:
            if isinstance(p, LuoiIcon):
                p.dat_icon(m)
            h = p.cao() + (60 if isinstance(p, Dau) else 0)     # con dấu xoay nghiêng cao hơn
            p.y, p.s = dat(h, p.uu_tien)


def kiem_tra_che_mat(pts, mat_tg):
    """Rà soát: liệt kê thành phần còn đè lên khuôn mặt (để báo, không im lặng)."""
    loi = []
    for p in pts:
        if isinstance(p, (PhuDe, TienTrinh, BRoll, LuoiIcon, DanhSach)):
            continue
        t = (p.t0 + p.t1) / 2
        m = mat_tg(t)
        if m is None:
            continue
        hs = [(p.y, p.cao() * p.s)] if not isinstance(p, Cta) else [(p.y_kw, p.kw.height * p.s), (p.y_o, 130)]
        if isinstance(p, LowerThird):
            hs = [(p.y, 140)]
        for y, h in hs:
            a, b = y - h / 2, y + h / 2
            chong = min(b, m[3]) - max(a, m[1])
            if chong > 12:
                loi.append(f"{type(p).__name__} @{p.t0:.1f}s đè mặt {chong:.0f}px")
    return loi


# ---------------- lập kế hoạch từ kịch bản ----------------
def tu_dong(c, la_cuoi):
    """Đoán hiệu ứng khi kịch bản chưa có: CTA (ZOOM/VIDEO) ở cảnh cuối, số liệu -> keyword."""
    loi = c.get("loi_thoai", "")
    ra = []
    m = re.search(r"\b(ZOOM|VIDEO)\b", loi)
    if la_cuoi and m:
        ra.append({"loai": "cta", "tu": m.group(1), "tu_khoa": m.group(1)})
    for m in re.finditer(r"(\d+[\d.,]*\s*\w+)", loi):
        ra.append({"loai": "keyword", "tu": m.group(1), "chu": m.group(1).upper(), "am": "impact"})
        break
    return ra


def lap(kb, cats_goc, mocs, tong, dir_du_an, log=print):
    """-> (danh sách phần tử, sự kiện âm thanh [(tên, giây, mức dB)], các đoạn zoom [(t0, t1, z0, z1, dx)])."""
    import ghep
    cc = kb.get("concept") or {}
    pts, am, zoom = [], [], []
    hook = kb.get("hook_chu") or kb.get("tieu_de", "")
    if hook:
        pts.append(Hook(hook, cc, min(2.6, tong)))
        am += [("whoosh", 0.0, -8), ("impact", 0.08, -6)]
    pts.append(TienTrinh(tong, cc))
    ten = kb.get("lower_third") or ("Nguyễn Bảo Nga", "Dược sĩ · AI Mentor · Bảo Nga AI")
    ten = (man_hinh(ten[0]), man_hinh(ten[1]))      # chữ trên màn hình luôn "AI", không hiện "ây ai"
    if tong > 8:
        pts.append(LowerThird(ten[0], ten[1], cc, 2.8, 6.4)); am.append(("click", 2.85, -10))
    n = len(kb["canh"])
    mat_canh_ra = []
    for i, ((a, d), c, cat) in enumerate(zip(mocs, kb["canh"], cats_goc)):
        loi = c.get("loi_thoai") or ""
        moc = [(float(s) + a, float(e) + a) for s, e in can_chu.can(loi, cat, d)] if loi.strip() else []
        het = a + d

        def luc(cum, sau=a):
            r = can_chu.tim(loi, cum, [(s - a, e - a) for s, e in moc], sau - a) if moc and cum else None
            return (r[0] + a, r[1] + a) if r else None
        # phụ đề theo đúng mốc chữ: mỗi trang hiện khi nói tiếng đầu, tắt khi sang trang sau
        toks = can_chu.chuan(loi)
        trang = ghep.chia_trang(loi)
        k = 0; ds = []
        for tr in trang:
            nt = len(can_chu.chuan(tr))
            if moc and k < len(moc):
                ds.append([moc[k][0], moc[min(len(moc) - 1, k + nt - 1)][1] + 0.25])
            k += nt
        for j, (tr, (t0, t1)) in enumerate(zip(trang, ds)):
            t1 = min(t1 if j == len(ds) - 1 else ds[j + 1][0], het)
            p = os.path.join(dir_du_an, f"_pd_{i}_{j}.png")
            ghep.png_phu_de(tr, p)
            pts.append(PhuDe(Image.open(p).convert("RGBA"), max(a, t0 - 0.05), max(t1, t0 + 0.4)))
            os.remove(p)
        # zoom: đẩy chậm, rồi punch-in đổi "góc máy" ở giữa cảnh
        giua = a + d * 0.48
        doan = [(a, giua, 1.0, 1.03, 0), (giua, het, 1.08, 1.10, 30 if i % 2 else -30)]   # punch-in nhẹ: mặt không to quá
        zoom += doan
        mc = mat_canh(cat)
        mat_canh_ra += [(d0, d1, mat_sau_zoom(mc, [dd])) for dd in doan for d0, d1 in [(dd[0], dd[1])]]   # theo từng mức zoom
        if i > 0:
            am.append(("whoosh", a - 0.12, -14))
        hu = c.get("hieu_ung")
        if hu is None:
            hu = tu_dong(c, i == n - 1)
        tiep = [luc(h.get("tu", "")) for h in hu]
        for q, h in enumerate(hu):
            r = luc(h.get("tu", "")) if h.get("tu") not in (None, "", "*") else None
            if not r and h.get("loai") in ("danh_sach", "so_do") and h.get("muc") and not h["muc"][0].get("tu"):
                r = (a, a)
            if not r and h.get("loai") != "broll":
                log(f"  (cảnh {i + 1}: không thấy chữ '{h.get('tu')}' -> bỏ hiệu ứng)")
                continue
            t0 = r[0] if r else a
            loai = h.get("loai")
            # 21/11/2026: hiệu ứng chữ ở cảnh 1 không được hiện cùng lúc khung HOOK (0–2,6s) -> lùi tới khi hook tắt
            if hook and i == 0 and loai in ("keyword", "dau", "luoi_icon") and t0 < 2.65:
                t0 = 2.65
            sau = [x[0] for x in tiep[q + 1:] if x and x[0] > t0]
            t1 = min(sau[0] - 0.05 if sau else het, het, t0 + float(h.get("giu", 2.4)))
            if t1 - t0 < 0.8:
                if loai in ("keyword", "dau", "luoi_icon") and t0 == 2.65:
                    continue      # không còn chỗ hiện sau hook -> bỏ (hook đã nói ý này)

            if loai == "keyword":
                pts.append(Keyword(man_hinh(h.get("chu") or h["tu"].upper()), h.get("icon"), cc, t0, t1))
                am.append((h.get("am", "pop"), t0, -6 if h.get("am") == "impact" else -9))
            elif loai == "dau":
                pts.append(Dau(man_hinh(h.get("chu") or h["tu"].upper()), h.get("icon"), t0, min(het, t0 + 1.8)))
                am.append(("impact", t0, -5))
            elif loai == "luoi_icon":
                pts.append(LuoiIcon(h.get("icon", "⭐"), int(h.get("so", 10)), man_hinh(h.get("chu", "")), cc, t0, t1))
                am += [("pop", t0, -9), ("pop", t0 + 0.25, -12), ("pop", t0 + 0.45, -12)]
            elif loai in ("danh_sach", "so_do"):
                muc = []
                for k, m in enumerate(h.get("muc", [])):
                    # tu rỗng = hiện ngay từ đầu cảnh (nối tiếp cảnh trước); sơ đồ thì so le 0,35s cho có nhịp
                    dk = a + (0.35 * k if loai == "so_do" else 0)
                    rm = (dk, dk) if not m.get("tu") else luc(m["tu"], a)
                    if rm and hook and i == 0 and rm[0] < 2.65:      # không hiện cùng lúc khung HOOK
                        rm = (2.65 + 0.12 * len(muc), rm[1])
                    if rm:
                        muc.append((man_hinh(m.get("chu") or m["tu"]), m.get("icon"), rm[0]))
                        am.append(("pop" if loai == "danh_sach" else "whoosh", rm[0], -9 if loai == "danh_sach" else -12))
                if muc:
                    kt = luc(h["den"])[0] if h.get("den") and luc(h["den"]) else het
                    pts.append((DanhSach if loai == "danh_sach" else SoDo)(muc, cc, min(het, kt + float(h.get("giu_them", 0.6)))))
                    if h.get("ding"):
                        am.append(("ding", muc[-1][2] + 0.35, -10))
            elif loai == "broll":
                anh = os.path.join(dir_du_an, h["anh"])
                if os.path.exists(anh):
                    rb = luc(h["tu"]) if h.get("tu") not in (None, "", "*") else None
                    rk = luc(h["den"]) if h.get("den") not in (None, "", "*") else None
                    b0 = rb[0] - 0.1 if rb else a                       # "*" = từ đầu cảnh
                    b1 = rk[1] + 0.1 if rk else (het if h.get("den") == "*" else min(het, b0 + 2.2))   # "*" = tới hết cảnh
                    pts.append(BRoll(anh, b0, b1))
                    am += [("whoosh", b0 - 0.1, -12), ("whoosh", b1 - 0.15, -16)]
            elif loai == "cta":
                pts.append(Cta(man_hinh(h.get("tu_khoa", h["tu"])).upper(), cc, t0, min(tong, het + 0.6)))
                am += [("riser", t0 - 1.25, -10), ("impact", t0, -4)]
                am += [("click", t0 + 0.7 + 0.12 * k2, -12) for k2 in range(len(h.get("tu_khoa", h["tu"])))]
                am.append(("ding", t0 + 0.7 + 0.12 * len(h.get("tu_khoa", h["tu"])) + 0.2, -9))
    # bố cục né mặt: hộp mặt theo từng cảnh (None khi B-roll che kín khung)
    brs = [(q.t0, q.t1) for q in pts if isinstance(q, BRoll)]

    def mat_tg(t):
        if any(b0 + 0.15 <= t <= b1 - 0.15 for b0, b1 in brs):
            return None
        for a0, a1, m in mat_canh_ra:
            if a0 <= t <= a1:
                return m
        return mat_canh_ra[-1][2] if mat_canh_ra else None
    for q in pts:
        if isinstance(q, DanhSach):
            q.tren_broll = any(b0 <= q.t0 + 0.2 and b1 >= q.t1 - 0.6 for b0, b1 in brs)
    bo_cuc(pts, mat_tg, log)
    for a0, a1, m in mat_canh_ra:
        log(f"  mặt cảnh {a0:.1f}–{a1:.1f}s: y {m[1]:.0f}–{m[3]:.0f}, x {m[0]:.0f}–{m[2]:.0f}")
    che = kiem_tra_che_mat(pts, mat_tg)
    log("  rà soát che mặt: " + ("; ".join(che) if che else "không thành phần nào đè lên mặt"))
    pts.sort(key=lambda p: p.lop)
    return pts, am, zoom


def ve_lop(pts, tong, out, log=print):
    """vẽ lớp đồ hoạ trong suốt -> .mkv (ffv1, có kênh alpha)."""
    n = int(math.ceil(tong * FPS))
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "ffv1", "-level", "3", "-slices", "4", "-pix_fmt", "bgra", out]   # lossless có alpha, nhẹ hơn qtrle nhiều
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, creationflags=NO_WIN)
    trong = Image.new("RGBA", (W, H), (0, 0, 0, 0)).tobytes()
    for f in range(n):
        t = f / FPS
        song = [q for q in pts if q.t0 - 0.05 <= t <= q.t1 + 0.05]
        if not song:
            p.stdin.write(trong); continue
        nen = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for q in song:
            q.ve(nen, t)
        p.stdin.write(nen.tobytes())
        if f % 150 == 0:
            log(f"  vẽ đồ hoạ {f}/{n} khung")
    p.stdin.close()
    if p.wait() != 0:
        raise RuntimeError("ffmpeg vẽ lớp đồ hoạ lỗi")
    return out


def bieu_thuc_zoom(zoom):
    """biểu thức hệ số zoom theo t cho filter scale (eval=frame)."""
    e = "1"
    for t0, t1, z0, z1, _ in reversed(zoom):
        e = f"if(between(t,{t0:.3f},{t1:.3f}),{z0}+({z1}-{z0})*(t-{t0:.3f})/{max(0.01, t1 - t0):.3f},{e})"
    return e


def bieu_thuc_lech(zoom):
    e = "0"
    for t0, t1, _, _, dx in reversed(zoom):
        e = f"if(between(t,{t0:.3f},{t1:.3f}),{dx},{e})"
    return e


def tron_am(am, tong, out):
    """trộn các tiếng hiệu ứng vào 1 track wav (48 kHz stereo)."""
    import wave, sfx
    sfx.tao()
    buf = np.zeros((int(tong * 48000) + 48000, 2))
    for ten, t, db in am:
        with wave.open(sfx.duong_dan(ten)) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2) / 32768
        i = int(max(0, t) * 48000)
        if t < 0:
            x = x[int(-t * 48000):]
        j = min(len(buf), i + len(x))
        buf[i:j] += x[:j - i] * 10 ** (db / 20)
    buf = buf[:int(tong * 48000)]
    buf = np.clip(buf, -0.98, 0.98)
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())
    return out
