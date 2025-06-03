'use client'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Complaint } from '@/types'

export interface ComplaintExportData {
  complaints: Complaint[]
  facilityName?: string
  exportDate: Date
}

// 苦情・要望報告書PDF出力関数（個別）
export const exportComplaintToPDF = async (complaint: Complaint): Promise<void> => {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // ページサイズとマージン設定
    const pageWidth = 595 // A4横幅
    const pageHeight = 842 // A4縦幅
    const margin = 40
    const contentWidth = pageWidth - margin * 2

    const page = pdfDoc.addPage([pageWidth, pageHeight])
    let currentY = pageHeight - margin

    // タイトル
    page.drawText('苦情・要望対応報告書', {
      x: margin,
      y: currentY,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 40

    // 出力日
    const dateStr = `出力日: ${new Date().getFullYear()}年${(new Date().getMonth() + 1).toString().padStart(2, '0')}月${new Date().getDate().toString().padStart(2, '0')}日`
    page.drawText(dateStr, {
      x: margin,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })
    currentY -= 30

    // 基本情報テーブル
    const basicInfo = [
      ['受付日時', complaint.submittedAt.toLocaleString()],
      ['発生・受付日', complaint.complaintDate.toLocaleDateString()],
      ['申し出人種別', getComplainantTypeText(complaint.complainantType)],
      ['申し出人氏名', complaint.complainantName || '匿名'],
      ['対応状況', getStatusText(complaint.status)],
      ['解決日', complaint.resolvedAt ? complaint.resolvedAt.toLocaleDateString() : '未解決']
    ]

    // 基本情報の描画
    const rowHeight = 25
    const labelWidth = 120
    const valueWidth = contentWidth - labelWidth

    basicInfo.forEach(([label, value], index) => {
      const y = currentY - (index * rowHeight)
      
      // ラベル背景
      page.drawRectangle({
        x: margin,
        y: y - 15,
        width: labelWidth,
        height: rowHeight,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })
      
      // 値背景
      page.drawRectangle({
        x: margin + labelWidth,
        y: y - 15,
        width: valueWidth,
        height: rowHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })
      
      // ラベルテキスト
      page.drawText(label, {
        x: margin + 5,
        y: y - 5,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      // 値テキスト
      page.drawText(value, {
        x: margin + labelWidth + 5,
        y: y - 5,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
    })

    currentY -= (basicInfo.length * rowHeight) + 30

    // 苦情・要望内容
    page.drawText('苦情・要望内容', {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 25

    const contentLines = wrapText(complaint.content, contentWidth, font, 11)
    contentLines.forEach(line => {
      page.drawText(line, {
        x: margin + 10,
        y: currentY,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      currentY -= 15
    })
    currentY -= 20

    // 対応履歴
    if (complaint.responseRecords.length > 0) {
      page.drawText('対応履歴', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 25

      complaint.responseRecords.forEach((record, index) => {
        // ページ終端チェック
        if (currentY < 100) {
          const newPage = pdfDoc.addPage([pageWidth, pageHeight])
          currentY = pageHeight - margin
          page.drawText = newPage.drawText.bind(newPage)
        }

        // 対応記録ヘッダー
        page.drawText(`【対応記録 ${index + 1}】`, {
          x: margin + 10,
          y: currentY,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        currentY -= 18

        // 対応日時
        page.drawText(`対応日時: ${record.respondedAt.toLocaleString()}`, {
          x: margin + 15,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        })
        currentY -= 15

        // 対応者
        page.drawText(`対応者: ${record.respondedBy}`, {
          x: margin + 15,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        })
        currentY -= 20

        // 対応内容
        const responseLines = wrapText(record.content, contentWidth - 30, font, 10)
        responseLines.forEach(line => {
          page.drawText(line, {
            x: margin + 20,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          })
          currentY -= 12
        })
        currentY -= 15
      })
    } else {
      page.drawText('対応履歴', {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 25

      page.drawText('まだ対応記録はありません', {
        x: margin + 10,
        y: currentY,
        size: 11,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      })
      currentY -= 30
    }

    // フッター
    page.drawText('※ この報告書は ShiftCare システムで生成されました', {
      x: margin,
      y: 50,
      size: 9,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    })

    // ファイルダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `complaint-report-${complaint.complaintDate.toISOString().split('T')[0]}-${complaint.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('PDFの出力に失敗しました')
  }
}

// 苦情・要望一覧PDF出力関数（一括）
export const exportComplaintsToPDF = async (data: ComplaintExportData): Promise<void> => {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // ページサイズとマージン設定
    const pageWidth = 595
    const pageHeight = 842
    const margin = 40

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let currentY = pageHeight - margin

    // タイトル
    currentPage.drawText('苦情・要望対応報告書一覧', {
      x: margin,
      y: currentY,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 40

    // 施設名
    if (data.facilityName) {
      currentPage.drawText(`施設名: ${data.facilityName}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })
      currentY -= 25
    }

    // 出力日
    const dateStr = `出力日: ${data.exportDate.getFullYear()}年${(data.exportDate.getMonth() + 1).toString().padStart(2, '0')}月${data.exportDate.getDate().toString().padStart(2, '0')}日`
    currentPage.drawText(dateStr, {
      x: margin,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })
    currentY -= 30

    // 統計情報
    const totalComplaints = data.complaints.length
    const pending = data.complaints.filter(c => c.status === 'pending').length
    const inProgress = data.complaints.filter(c => c.status === 'in_progress').length
    const resolved = data.complaints.filter(c => c.status === 'resolved').length

    const statsText = `総件数: ${totalComplaints}件 (未対応: ${pending}件, 対応中: ${inProgress}件, 解決済み: ${resolved}件)`
    currentPage.drawText(statsText, {
      x: margin,
      y: currentY,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    })
    currentY -= 40

    // 各苦情・要望の要約
    data.complaints.forEach((complaint, index) => {
      // ページ終端チェック
      if (currentY < 150) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        currentY = pageHeight - margin
      }

      // 番号とタイトル
      const title = `${index + 1}. ${getComplainantTypeText(complaint.complainantType)} - ${getStatusText(complaint.status)}`
      currentPage.drawText(title, {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 20

      // 基本情報
      const info = `受付日: ${complaint.submittedAt.toLocaleDateString()} | 申し出人: ${complaint.complainantName || '匿名'}`
      currentPage.drawText(info, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      currentY -= 15

      const responseCount = `対応記録: ${complaint.responseRecords.length}件`
      currentPage.drawText(responseCount, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      currentY -= 20

      // 概要
      const summaryLines = wrapText(complaint.content, pageWidth - margin * 2 - 20, font, 10)
      summaryLines.slice(0, 2).forEach(line => { // 最初の2行のみ
        currentPage.drawText(line, {
          x: margin + 10,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        })
        currentY -= 12
      })
      
      if (summaryLines.length > 2) {
        currentPage.drawText('...', {
          x: margin + 10,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        })
        currentY -= 12
      }

      currentY -= 15

      // 区切り線
      currentPage.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })
      currentY -= 20
    })

    // ファイルダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `complaint-reports-${data.exportDate.toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('PDFの出力に失敗しました')
  }
}

// ステータステキスト取得
function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '未対応'
    case 'in_progress':
      return '対応中'
    case 'resolved':
      return '解決済み'
    default:
      return '不明'
  }
}

// 申し出人種別テキスト取得
function getComplainantTypeText(type: string): string {
  switch (type) {
    case 'user':
      return '利用者'
    case 'family':
      return '家族'
    case 'other':
      return 'その他'
    default:
      return '不明'
  }
}

// テキスト折り返し関数
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return ['']
  
  const chars = text.split('')
  const lines: string[] = []
  let currentLine = ''

  for (const char of chars) {
    const testLine = currentLine + char
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)
    
    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = char
      } else {
        lines.push(char)
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines.length > 0 ? lines : ['']
}