# Rutas
$csv = "C:\DataDiaria\data_$(Get-Date -Format yyyy-MM-dd).csv"   # CSV del día
$plantilla = "C:\Plantillas\Plantilla.xlsx"                     # Tu plantilla
$salida = "C:\ReportesExcel\Reporte_$(Get-Date -Format yyyy-MM-dd).xlsx"

# Abrir Excel
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false

# Abrir plantilla
$wb = $excel.Workbooks.Open($plantilla)
$ws = $wb.Sheets.Item("DATA")

# Leer CSV en la hoja DATA
$ws.QueryTables.Add("TEXT;" + $csv, $ws.Range("A1"))
$qt = $ws.QueryTables.Item(1)
$qt.TextFileCommaDelimiter = $true
$qt.TextFileParseType = 1
$qt.AdjustColumnWidth = $true
$qt.Refresh()

# Guardar salida
$wb.SaveAs($salida, 51)  # 51 = Excel .xlsx

# Cerrar todo
$wb.Close($true)
$excel.Quit()