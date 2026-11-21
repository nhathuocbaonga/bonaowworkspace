# -*- coding: utf-8 -*-
"""LỆNH CHUNG làm video 40s theo Notion "30 Kịch Bản ADS APP 247" (chị chốt 21/11/2026).

    python lam_video.py 1 4 7        # làm các video số 1, 4, 7 (theo thứ tự)
    python lam_video.py 4 --ghep     # chỉ ghép lại (không gọi Flow)

Mỗi số cần 1 file cấu hình video-notion/<số>.json (Claude soạn từ kịch bản Notion; mẫu: các file đã có).
Các trường: so, chu_de, ma, anh (ảnh khung đầu trong anh-nhan-vat/), mo_ta (để tạo ảnh khung đầu nếu chưa có),
ho_so (hồ sơ nhân vật nếu ảnh mới), thumb [dòng 1, dòng 2], cta (0 = ZOOM, 1 = VIDEO, hoặc câu riêng),
canh [4 câu nói, mỗi câu <= ~31 tiếng, viết "ây ai"/"pờ rom" cho Veo đọc đúng], hu (hiệu ứng 5 cảnh), broll {tên: mô tả}.
Kết quả: THANH-PHAM/<Chủ đề> xây kênh bằng AI - 40 giây - Bảo Nga AI.mp4 (+ ảnh bìa).
"""
import os, sys, time, json, traceback

APP = os.path.dirname(os.path.abspath(__file__))
os.chdir(APP); sys.path.insert(0, APP)
# ổ C hay đầy -> file tạm sang ổ D
for k in ("TEMP", "TMP"):
    os.environ[k] = r"D:\tmpwork"
os.makedirs(r"D:\tmpwork", exist_ok=True)

from common import *  # noqa
import flow, ghep, master_5c, kichban, nhan_vat, khung_dau

CFG = os.path.join(APP, "video-notion")
LOG = os.path.join(DEBUG, "lam_video.log")


def log(m):
    line = time.strftime("%H:%M:%S ") + str(m)
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def doc_cfg(so):
    p = os.path.join(CFG, f"{so}.json")
    if not os.path.exists(p):
        raise FileNotFoundError(f"Chưa có cấu hình {p} (Claude soạn từ Notion trước khi chạy)")
    v = json.load(open(p, encoding="utf-8"))
    v.setdefault("tieu_de", f"{v['chu_de']} xây kênh bằng ây ai - 40 giây - Bảo Nga ây ai")
    v.setdefault("da", f"{time.strftime('%Y-%m-%d')}_notion-{so}-{v['ma']}")
    if "da" not in json.load(open(p, encoding="utf-8")):   # ghi lại thư mục dự án để lần sau dùng đúng thư mục
        d = json.load(open(p, encoding="utf-8")); d["da"] = v["da"]
        json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return v


def lam(v, chi_ghep=False):
    DA = os.path.join(APP, "du-an", v["da"])
    ANH = os.path.join(ANH_NV, v["anh"])
    os.makedirs(DA, exist_ok=True)
    log(f"===== Notion số {v['so']}: {v['chu_de']} =====")
    if not os.path.exists(ANH):
        khung_dau.tao_khung(ANH, v["mo_ta"], None, 3, log=log)
    p = os.path.join(ANH_NV, "nhan_vat.json")
    d = json.load(open(p, encoding="utf-8"))
    if v["anh"] not in d:
        d[v["anh"]] = dict(v["ho_so"], anh_goc="Ảnh tham chiếu các góc mặt Bảo Nga/1 chính diện.png")
        json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    hs = nhan_vat.ho_so(ANH)

    cta = v["cta"] if isinstance(v["cta"], str) else master_5c.CTA_CO_DINH[v["cta"]]
    canh = v["canh"] + [cta]
    kbp = os.path.join(DA, "kichban.json")
    if os.path.exists(kbp):
        kb = json.load(open(kbp, encoding="utf-8"))
    else:
        kb, _ = kichban.viet_kich_ban("\n".join(canh), master_5c.DANG_CO_SAN, log=log, anh=ANH, thu_muc=DA)
    kb["tieu_de"] = v["tieu_de"]
    kb["thumbnail"] = v["thumb"]
    kb["hook_chu"] = " ".join(v["thumb"])
    kb["caption"] = " ".join(canh)
    kb["nguon"] = f"Notion 30 Kịch Bản ADS APP 247 – số {v['so']} {v['chu_de']}; rút gọn cho vừa 40s; CTA cố định"
    for c, l, h, t in zip(kb["canh"], master_5c.LOAI, v["hu"], canh):
        c["loai"] = l; c["hieu_ung"] = h; c["loi_thoai"] = t
    master_5c.khoa_nhan_vat(kb, hs, ANH)
    kb["giong"] = ghep.GIONG_BAO_NGA
    kb["giong_bao_nga"] = True
    kb["nhac_nen"] = None
    kb["lower_third"] = ["Nguyễn Bảo Nga", "Dược sĩ · AI Mentor · Bảo Nga ây ai"]
    kichban.luu_kb(kb, DA)
    for c in kb["canh"]:
        log(f"Cảnh {c['stt']}: {len(c['loi_thoai'].split())} tiếng ~{c['giay_uoc']}s | {c['loi_thoai']}")

    if not chi_ghep:
        nen = ghep.ChuanBiNen(kb["giong"], log=log)
        da_them = set()
        for i in range(1, len(kb["canh"]) + 1):      # cảnh đã có từ lần chạy trước -> đổi giọng luôn
            f = os.path.join(DA, f"canh_{i:02d}.mp4")
            if os.path.exists(f) and os.path.getsize(f) > 100_000:
                da_them.add(i); nen.them(f)

        def bao(i, tt, g=""):
            log(f"[cảnh {i}] {tt} {g}")
            if tt == "xong" and i not in da_them:
                da_them.add(i); nen.them(os.path.join(DA, f"canh_{i:02d}.mp4"))
        try:
            thieu_broll = [t for t in v.get("broll", {}) if not os.path.exists(os.path.join(DA, t))]
            if len(da_them) < len(kb["canh"]) or thieu_broll:
                with flow.FlowSession(log=log, cho_nguoi=lambda m: log("CẦN CHỊ: " + m)) as fs:
                    fs.dam_bao_dang_nhap(); fs.tao_du_an(); fs.dat_cai_dat()
                    for ten in thieu_broll:
                        mt = v["broll"][ten]
                        try:
                            fs.tao_anh_tac_nhan([], mt, os.path.join(DA, ten),
                                                lenh="Tạo đúng 1 HÌNH ẢNH (không tạo video), tỷ lệ 9:16. " + mt)
                            khung_dau.xoa_dau_sao(os.path.join(DA, ten))
                        except Exception as e:
                            log(f"B-roll {ten} lỗi: {e}")
                    if len(da_them) < len(kb["canh"]):
                        fs.tao_video_song_song(kb, DA, ANH, flow.MODEL_MAC_DINH, bao=bao)
        finally:
            nen.cho_xong()
    out = ghep.ghep(DA, kb, log=log)
    log(f"HOÀN THÀNH số {v['so']} {v['chu_de']}: {out}")
    return out


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    chi_ghep = "--ghep" in sys.argv
    ket_qua = {}
    for so in args:
        try:
            ket_qua[so] = lam(doc_cfg(so), chi_ghep)
        except Exception as e:
            ket_qua[so] = None
            log(f"DỪNG số {so}: {type(e).__name__}: {e}")
            log(traceback.format_exc()[-1500:])
    log("KẾT QUẢ: " + json.dumps(ket_qua, ensure_ascii=False))
    log("XONG CẢ LOẠT")
