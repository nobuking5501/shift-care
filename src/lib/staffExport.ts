'use client'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as XLSX from 'xlsx'
import { User } from '@/types'

// 勤務体制一覧表用のスタッフデータ型
export interface StaffExportData {
  name: string
  position: string
  qualifications: string
  employmentType: string
  weeklyHours: string
  nightShiftAvailable: string
}

// スタッフデータを勤務体制一覧表用に変換
export const transformStaffData = (users: User[]): StaffExportData[] => {
  return users
    .filter(user => user.role === 'staff') // スタッフのみ（管理者は除外）
    .map(user => ({
      name: user.name,
      position: user.position || '支援員',
      qualifications: user.qualifications.join(', '),
      employmentType: user.employmentType === 'fullTime' ? '常勤' : '非常勤',
      weeklyHours: user.weeklyHours ? `${user.weeklyHours}時間` : '-',
      nightShiftAvailable: user.nightShiftOK ? '可' : '否'
    }))
}

// PDF出力関数
export const exportToPDF = async (staffData: StaffExportData[]): Promise<void> => {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4サイズ
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()
    const margin = 50
    const tableTop = height - 150
    
    // タイトル
    page.drawText('勤務体制一覧表', {
      x: margin,
      y: height - 80,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // 出力日時
    const now = new Date()
    const dateStr = `出力日時: ${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`
    page.drawText(dateStr, {
      x: margin,
      y: height - 110,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })

    // テーブルヘッダー
    const headers = ['氏名', '職種', '資格', '雇用形態', '週間勤務時間', '夜勤可否']
    const columnWidths = [80, 60, 120, 70, 80, 60]
    let x = margin
    const rowHeight = 25

    // ヘッダー描画
    headers.forEach((header, index) => {
      page.drawRectangle({
        x: x,
        y: tableTop,
        width: columnWidths[index],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(0.9, 0.9, 0.9),
      })

      page.drawText(header, {
        x: x + 5,
        y: tableTop + 8,
        size: 9,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      x += columnWidths[index]
    })

    // データ行描画
    staffData.forEach((staff, rowIndex) => {
      const y = tableTop - (rowIndex + 1) * rowHeight
      x = margin

      const rowData = [
        staff.name,
        staff.position,
        staff.qualifications,
        staff.employmentType,
        staff.weeklyHours,
        staff.nightShiftAvailable
      ]

      rowData.forEach((data, colIndex) => {
        page.drawRectangle({
          x: x,
          y: y,
          width: columnWidths[colIndex],
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          color: rgb(1, 1, 1),
        })

        // テキストを複数行に分割（長い資格名対応）
        const maxWidth = columnWidths[colIndex] - 10
        let text = data
        if (colIndex === 2 && text.length > 15) { // 資格欄
          text = text.substring(0, 12) + '...'
        }

        page.drawText(text, {
          x: x + 5,
          y: y + 8,
          size: 8,
          font: font,
          color: rgb(0, 0, 0),
        })

        x += columnWidths[colIndex]
      })
    })

    // ファイルダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `staff-list-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('PDFの出力に失敗しました')
  }
}

// Excel出力関数
export const exportToExcel = (staffData: StaffExportData[]): void => {
  try {
    // ワークブック作成
    const wb = XLSX.utils.book_new()
    
    // ヘッダー行
    const headers = ['氏名', '職種', '資格', '雇用形態', '週間勤務時間', '夜勤可否']
    
    // データ配列作成
    const wsData = [
      headers,
      ...staffData.map(staff => [
        staff.name,
        staff.position,
        staff.qualifications,
        staff.employmentType,
        staff.weeklyHours,
        staff.nightShiftAvailable
      ])
    ]
    
    // ワークシート作成
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // 列幅設定
    ws['!cols'] = [
      { width: 15 }, // 氏名
      { width: 12 }, // 職種
      { width: 30 }, // 資格
      { width: 12 }, // 雇用形態
      { width: 15 }, // 週間勤務時間
      { width: 12 }  // 夜勤可否
    ]
    
    // ヘッダー行のスタイル設定
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!ws[cellAddress]) continue
      
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E6E6E6" } },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      }
    }
    
    // シートをワークブックに追加
    XLSX.utils.book_append_sheet(wb, ws, '勤務体制一覧表')
    
    // ファイルダウンロード
    const now = new Date()
    const filename = `staff-list-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.xlsx`
    
    XLSX.writeFile(wb, filename)
  } catch (error) {
    console.error('Excel export error:', error)
    throw new Error('Excelの出力に失敗しました')
  }
}

// ファイルサイズフォーマット用ユーティリティ
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}