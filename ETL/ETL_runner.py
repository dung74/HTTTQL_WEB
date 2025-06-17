import time
import subprocess
import sys
import os

if __name__ == "__main__":
    while True:
        print("Đang chạy ETL.py ...")
        # Gọi ETL.py bằng Python cùng phiên bản đang chạy
        result = subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "ETL.py")])
        if result.returncode == 0:
            print("ETL.py chạy thành công.")
        else:
            print("ETL.py gặp lỗi.")
        print("Chờ 30 giây để chạy lại...")
        time.sleep(30)