import pandas as pd
import pyodbc
import datetime
import logging
import os
import sys
import traceback
import io
import json
import subprocess
from pathlib import Path
import time
import shutil


SSAS_SQL_USER = "sa"
SSAS_SQL_PASSWORD = "123456"
# Fix lỗi encoding Unicode
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cấu hình logging với UTF-8
# log_dir = Path("logs")
# log_dir.mkdir(exist_ok=True)
# log_file = log_dir / f"etl_log_{datetime.datetime.now().strftime('%Y%m%d')}.log"

# handler = logging.FileHandler(log_file, encoding='utf-8')
console_handler = logging.StreamHandler(sys.stdout)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[console_handler]
)

logger = logging.getLogger(__name__)

SSAS_SERVER = "localhost"       
SSAS_DATABASE = "17_6_2026_HTTTQL"      
SSAS_CUBE_NAME = "WH For HTQL"          # Tên cube

# Thư mục chứa dữ liệu xuất ra
# OUTPUT_DIR = Path("output_data")
# OUTPUT_DIR.mkdir(exist_ok=True)



def transform_data(data_dict):
    """Biến đổi dữ liệu theo mô hình Star Schema cho kho dữ liệu"""
    if not data_dict:
        logger.warning("Không có dữ liệu để biến đổi")
        return None
    
    try:
        logger.info("Bắt đầu biến đổi dữ liệu")
        
        # 1. Product
        df_product = data_dict['products'][['id', 'name', 'class']].copy()
        df_product.columns = ['product_id', 'product_name', 'product_class']
        
        # 2. Time
        orders_dates = pd.to_datetime(data_dict['orders']['createdAt'])
        unique_dates = pd.DataFrame({
            'date': orders_dates.dt.date.unique(),
        })
        unique_dates['time_id'] = range(1, len(unique_dates) + 1)
        unique_dates['Year'] = pd.DatetimeIndex(unique_dates['date']).year.astype(str)
        # Tháng tiếng Anh
        unique_dates['Month'] = pd.DatetimeIndex(unique_dates['date']).month
        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }
        unique_dates['Month'] = unique_dates['Month'].map(month_names)
        # Quý dạng Q1, Q2, ...
        unique_dates['quarter'] = pd.DatetimeIndex(unique_dates['date']).quarter
        unique_dates['quarter'] = unique_dates['quarter'].apply(lambda x: f"Q{x}")
        df_time = unique_dates[['time_id', 'Month', 'quarter', 'Year']]
        
        # 3. Customer
        df_customer = data_dict['customers'][['id', 'name']].copy()
        df_customer.columns = ['customer_id', 'customer_name']
        
        # 4. Customer_type
        customer_types = data_dict['customers'][['id', 'channel', 'sub_channel']].copy()
        customer_types['Customer_type_id'] = customer_types.index + 1
        df_customer_type = customer_types[['Customer_type_id', 'channel', 'sub_channel']]
        df_customer_type.columns = ['Customer_type_id', 'Channel', 'sub_channel']
        
        # 5. Customer_location
        df_customer_location = data_dict['customers'][['id', 'latitude', 'longitude', 'city', 'country']].copy()
        df_customer_location.columns = ['location_id', 'Latitude', 'Longitude', 'City', 'Country']
        
        # 6. Distributor
        df_distributor = data_dict['distributors'][['id', 'name']].copy()
        df_distributor.columns = ['distributor_id', 'distributor_name']
        
        # 7. Sales_rep
        users = data_dict['users'].copy()
        teams = data_dict['teams'].copy()
        sales_reps = users.merge(teams, left_on='team_id', right_on='id', suffixes=('', '_team'))
        df_sales_rep = sales_reps[['id', 'fullname', 'manager_id', 'name']].copy()
        df_sales_rep.columns = ['sale_reps_id', 'sale_reps_name', 'manager_name', 'sale_team']
        
        # 8. Fact
        orders = data_dict['orders'].copy()
        orders['createdAt_date'] = pd.to_datetime(orders['createdAt']).dt.date
        time_id_map = dict(zip(unique_dates['date'], unique_dates['time_id']))
        orders['time_id'] = orders['createdAt_date'].map(time_id_map)
        customer_info = data_dict['customers'][['id', 'id', 'channel']].copy()
        customer_info.columns = ['customer_id', 'location_id', 'channel']
        fact = orders[['product_id', 'customer_id', 'distributor_id', 'user_id', 'quantity', 'time_id']].copy()
        fact = fact.merge(customer_info, on='customer_id', how='left')
        customer_type_map = dict(zip(customer_types['id'], customer_types['Customer_type_id']))
        fact['Customer_type_id'] = fact['customer_id'].map(customer_type_map)
        fact.rename(columns={'user_id': 'sale_reps_id'}, inplace=True)
        if 'price' in data_dict['products'].columns:
            product_prices = dict(zip(data_dict['products']['id'], data_dict['products']['price']))
            fact['sale_amount'] = fact.apply(
                lambda row: row['quantity'] * product_prices.get(row['product_id'], 0), 
                axis=1
            )
        else:
            fact['sale_amount'] = fact['quantity'] * 100
        fact = fact[['product_id', 'location_id', 'customer_id', 'Customer_type_id', 'time_id',
                     'distributor_id', 'sale_reps_id', 'quantity', 'sale_amount']]
        
        transformed_data = {
            "Product": df_product,
            "Time": df_time,
            "Customer": df_customer,
            "Customer_type": df_customer_type,
            "Customer_location": df_customer_location,
            "Distributor": df_distributor,
            "Sales_rep": df_sales_rep,
            "Fact": fact
        }
        
        logger.info("Biến đổi dữ liệu hoàn tất")
        return transformed_data
        
    except Exception as e:
        logger.error(f"Lỗi khi biến đổi dữ liệu: {str(e)}")
        logger.error(traceback.format_exc())
        return None

def auto_process_ssas(export_dir):
    logger.info("Đang tự động cập nhật SSAS database...")

    # Tạo XMLA script
    # xmla_path = create_xmla_script(export_dir)

    # Sử dụng PowerShell trực tiếp
    logger.info("Sử dụng PowerShell để process SSAS...")

    ps_script = f"""
try {{
    [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.AnalysisServices") | Out-Null
    $server = New-Object Microsoft.AnalysisServices.Server
    $server.Connect("Data Source={SSAS_SERVER}")
    $db = $server.Databases.FindByName("{SSAS_DATABASE}")
    if ($db -eq $null) {{
        Write-Output "ERROR: Database {SSAS_DATABASE} not found"
        exit 1
    }}
    $db.Process([Microsoft.AnalysisServices.ProcessType]::ProcessFull)
    Write-Output "SUCCESS: Database processed successfully"
    $server.Disconnect()
    exit 0
}}
catch {{
    Write-Output "ERROR: $_"
    exit 1
}}
"""

    # Lưu PowerShell script
    ps_path = Path("auto_process.ps1")
    with open(ps_path, "w", encoding='utf-8') as f:
        f.write(ps_script)

    # Thực thi PowerShell script
    logger.info(f"Đang thực thi PowerShell script {ps_path}...")
    try:
        result = subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_path)],
            capture_output=True,
            text=True,
            timeout=300  # 5 phút timeout
        )

        # Xóa toàn bộ folder export_dir sau khi chạy xong
        # try:
        #     if ps_path.exists():
        #         ps_path.unlink()
        # except Exception as cleanup_err:
        #     logger.warning(f"Lỗi khi xóa file tạm: {cleanup_err}")

        if "SUCCESS" in result.stdout:
            logger.info("SSAS đã được cập nhật thành công qua PowerShell!")
            return True
        else:
            logger.error(f"Lỗi khi cập nhật SSAS qua PowerShell: {result.stdout}")
            return False
    except Exception as e:
        logger.error(f"Lỗi khi thực thi PowerShell: {str(e)}")
        # Xóa folder nếu có lỗi
        try:
            if ps_path.exists():
                ps_path.unlink()
        except Exception as cleanup_err:
            logger.warning(f"Lỗi khi xóa file tạm: {cleanup_err}")
        return False

def export_to_sqlserver(transformed_data):
    """
    Đẩy dữ liệu từ các DataFrame vào SQL Server mà KHÔNG xóa dữ liệu cũ.
    Nếu trùng khóa chính thì UPDATE, chưa có thì INSERT (UPSERT).
    Đảm bảo tất cả các cột id được insert dưới dạng chuỗi.
    """
    conn_str = (
        "DRIVER={SQL Server};"
        "SERVER=DESKTOP-98K7VN1;"
        "DATABASE=WH_for_HTQL;"
        f"UID={SSAS_SQL_USER};PWD={SSAS_SQL_PASSWORD}"
    )
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        logger.info("Kết nối SQL Server thành công.")

        # Định nghĩa mapping giữa DataFrame, bảng SQL, cột, và khóa chính
        table_map = {
            "Product": ("Product", ["product_id", "product_name", "product_class"], ["product_id"]),
            "Time": ("Time", ["time_id", "Month", "quarter", "Year"], ["time_id"]),
            "Customer": ("Customer", ["customer_id", "customer_name"], ["customer_id"]),
            "Customer_type": ("Customer_type", ["Customer_type_id", "Channel", "sub_channel"], ["Customer_type_id"]),
            "Customer_location": ("Customer_location", ["location_id", "Latitude", "Longitude", "City", "Country"], ["location_id"]),
            "Distributor": ("distributor", ["distributor_id", "distributor_name"], ["distributor_id"]),
            "Sales_rep": ("Sales_rep", ["sale_reps_id", "sale_reps_name", "manager_name", "sale_team"], ["sale_reps_id"]),
            "Fact": ("Fact", [
                "product_id", "location_id", "customer_id", "Customer_type_id", "time_id",
                "distributor_id", "sale_reps_id", "quantity", "sale_amount"
            ], [
                "product_id", "location_id", "customer_id", "Customer_type_id", "time_id",
                "distributor_id", "sale_reps_id"
            ]),
        }

        for key, (table, columns, pk_cols) in table_map.items():
            df = transformed_data[key]
            logger.info(f"Đang upsert {len(df)} dòng vào bảng {table}...")
            for row in df.itertuples(index=False, name=None):
                # Đảm bảo tất cả các cột id là chuỗi
                row_as_list = list(row)
                for idx, col in enumerate(columns):
                    if 'id' in col.lower():
                        row_as_list[idx] = str(row_as_list[idx])
                row = tuple(row_as_list)

                # Tạo điều kiện WHERE cho khóa chính
                where_clause = " AND ".join([f"{col}=?" for col in pk_cols])
                set_clause = ", ".join([f"{col}=?" for col in columns if col not in pk_cols])
                pk_values = [row[columns.index(col)] for col in pk_cols]
                set_values = [row[columns.index(col)] for col in columns if col not in pk_cols]
                if set_clause:
                    update_sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
                    cursor.execute(update_sql, *(set_values + pk_values))
                    if cursor.rowcount == 0:
                        insert_sql = f"INSERT INTO {table} ({','.join(columns)}) VALUES ({','.join(['?']*len(columns))})"
                        cursor.execute(insert_sql, *row)
                else:
                    select_sql = f"SELECT 1 FROM {table} WHERE {where_clause}"
                    cursor.execute(select_sql, *pk_values)
                    if cursor.fetchone() is None:
                        insert_sql = f"INSERT INTO {table} ({','.join(columns)}) VALUES ({','.join(['?']*len(columns))})"
                        cursor.execute(insert_sql, *row)
            conn.commit()
            logger.info(f"Đã upsert xong bảng {table}")

        cursor.close()
        conn.close()
        logger.info("Đẩy dữ liệu vào SQL Server thành công (không xóa dữ liệu cũ).")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi đẩy dữ liệu vào SQL Server: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def extract_data_from_db():
    logger.info("Đang trích xuất dữ liệu từ database nguồn HTQL...")
    conn_str = (
        "DRIVER={SQL Server};"
        "SERVER=localhost;"
        "DATABASE=HTQL;"
        "UID=sa;"
        "PWD=123456"
    )
    try:
        conn = pyodbc.connect(conn_str)
        # Đọc dữ liệu từ các bảng nguồn
        products = pd.read_sql("SELECT * FROM products", conn)
        customers = pd.read_sql("SELECT * FROM customers", conn)
        distributors = pd.read_sql("SELECT * FROM distributors", conn)
        teams = pd.read_sql("SELECT * FROM teams", conn)
        users = pd.read_sql("SELECT * FROM users", conn)
        orders = pd.read_sql("SELECT * FROM orders", conn)
        conn.close()
        logger.info(
            f"Đã lấy dữ liệu: {len(products)} sản phẩm, {len(customers)} khách hàng, "
            f"{len(orders)} đơn hàng, {len(distributors)} nhà phân phối"
        )
        return {
            "products": products,
            "customers": customers,
            "distributors": distributors,
            "teams": teams,
            "users": users,
            "orders": orders
        }
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất dữ liệu từ DB nguồn: {str(e)}")
        logger.error(traceback.format_exc())
        return None

def etl_process():
    """Thực hiện toàn bộ quy trình ETL tự động vào SQL Server và SSAS"""
    start_time = datetime.datetime.now()
    logger.info("=== BẮT ĐẦU QUY TRÌNH ETL TỰ ĐỘNG VÀO SQL SERVER VÀ SSAS ===")
    
    # Extract & Transform - Lấy dữ liệu từ DB nguồn thay vì dữ liệu mẫu
    logger.info("Trích xuất dữ liệu từ DB nguồn để ETL vào SQL Server và SSAS...")
    raw_data = extract_data_from_db()
    
    # Transform - Biến đổi dữ liệu
    transformed_data = transform_data(raw_data)
    if not transformed_data:
        logger.error("Không thể biến đổi dữ liệu, dừng quy trình ETL")
        return False

    # Đẩy dữ liệu vào SQL Server
    logger.info("Bắt đầu đẩy dữ liệu vào SQL Server...")
    if not export_to_sqlserver(transformed_data):
        logger.error("Không thể đẩy dữ liệu vào SQL Server, dừng quy trình ETL")
        return False

    # Tự động cập nhật SSAS
    logger.info("Bắt đầu quá trình tự động cập nhật SSAS...")
    success = auto_process_ssas(Path.cwd())  # Truyền thư mục hiện tại hoặc một thư mục tạm bất kỳ
    
    end_time = datetime.datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    logger.info(f"=== KẾT THÚC QUY TRÌNH ETL === (Thời gian xử lý: {duration} giây)")
    
    if success:
        logger.info("✓ SSAS đã được cập nhật thành công! Có thể làm mới Power BI để xem dữ liệu mới.")
    else:
        logger.warning("⚠ Không thể tự động cập nhật SSAS. Vui lòng xem file HUONG_DAN_THU_CONG.txt.")
    
    return success

if __name__ == "__main__":
    try:
        print("Bắt đầu quy trình ETL tự động vào SSAS...")
        # Thực hiện ETL
        etl_process()
        
    except Exception as e:
        logger.critical(f"Lỗi không mong đợi: {str(e)}")
        logger.critical(traceback.format_exc())