import pandas as pd
import difflib

file_path = '[DNA] Forge Material Calculator (Shared).xlsx'

try:
    xls = pd.ExcelFile(file_path)
    sheet_names = xls.sheet_names
    print(f"All Sheet Names: {sheet_names}")
    
    target_sheet = "Reset Time (UTC+7)"
    
    # Check for exact match
    if target_sheet in sheet_names:
        print(f"\nFound exact match: {target_sheet}")
        df = pd.read_excel(xls, sheet_name=target_sheet)
        print(df.to_string())
    else:
        # Check for close matches
        print(f"\n'{target_sheet}' not found exactly.")
        close_matches = difflib.get_close_matches(target_sheet, sheet_names)
        if close_matches:
            print(f"Did you mean one of these? {close_matches}")
        
        # Also check for partial matches
        partial_matches = [s for s in sheet_names if "Reset" in s or "Time" in s]
        if partial_matches:
            print(f"Sheets containing 'Reset' or 'Time': {partial_matches}")
            for match in partial_matches:
                 print(f"\nContent of '{match}':")
                 df = pd.read_excel(xls, sheet_name=match)
                 print(df.head(20).to_string())

except Exception as e:
    print(f"Error: {e}")
