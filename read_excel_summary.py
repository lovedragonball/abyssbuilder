import pandas as pd
import os

file_path = '[DNA] Forge Material Calculator (Shared).xlsx'

try:
    # Load the Excel file
    xls = pd.ExcelFile(file_path)
    
    print(f"File: {file_path}")
    print(f"Sheet names: {xls.sheet_names}")
    print("-" * 30)
    
    for sheet_name in xls.sheet_names:
        print(f"\nSheet: {sheet_name}")
        # Read only a few rows to avoid huge output if the sheet is large
        df = pd.read_excel(xls, sheet_name=sheet_name, nrows=10)
        print(f"Shape (preview): {df.shape}")
        print("Columns:", df.columns.tolist())
        print("First 5 rows:")
        print(df.head().to_string())
        print("-" * 30)

except Exception as e:
    print(f"Error reading file: {e}")
