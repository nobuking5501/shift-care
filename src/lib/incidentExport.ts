'use client'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Incident } from '@/types'

export interface IncidentExportData {
  incidents: Incident[]
  facilityName?: string
  exportDate: Date
}

// 事故・ヒヤリハット報告書PDF出力関数（個別）
export const exportIncidentToPDF = async (incident: Incident): Promise<void> => {
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
    const title = incident.incidentType === 'accident' ? '事故報告書' : 'ヒヤリハット報告書'
    page.drawText(title, {
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
      ['発生日時', `${incident.incidentDate.toLocaleDateString()} ${incident.incidentDate.toLocaleTimeString()}`],
      ['事故種別', incident.incidentType === 'accident' ? '事故' : 'ヒヤリハット'],
      ['発生場所', incident.location],
      ['関係者', incident.involvedPersons.join(', ')],
      ['報告日時', `${incident.reportedAt.toLocaleDateString()} ${incident.reportedAt.toLocaleTimeString()}`],
      ['対応状況', getStatusText(incident.status)]
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

    // 詳細情報セクション
    const sections = [
      { title: '発生状況の詳細', content: incident.description },
      { title: '対応・処置の内容', content: incident.response },
      { title: '再発防止策', content: incident.preventiveMeasures }
    ]

    sections.forEach(section => {
      // セクションタイトル
      page.drawText(section.title, {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 25

      // セクション内容
      const lines = wrapText(section.content, contentWidth, font, 11)
      lines.forEach(line => {
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
    })

    // フッター
    currentY = margin + 50
    page.drawText('※ この報告書は ShiftCare システムで生成されました', {
      x: margin,
      y: currentY,
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
    link.download = `incident-report-${incident.incidentDate.toISOString().split('T')[0]}-${incident.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('PDFの出力に失敗しました')
  }
}

// 事故・ヒヤリハット一覧PDF出力関数（一括）
export const exportIncidentsToPDF = async (data: IncidentExportData): Promise<void> => {
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
    currentPage.drawText('事故・ヒヤリハット報告書一覧', {
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
    const totalIncidents = data.incidents.length
    const accidents = data.incidents.filter(i => i.incidentType === 'accident').length
    const nearMisses = data.incidents.filter(i => i.incidentType === 'nearMiss').length
    const pending = data.incidents.filter(i => i.status === 'pending').length

    const statsText = `総件数: ${totalIncidents}件 (事故: ${accidents}件, ヒヤリハット: ${nearMisses}件, 未対応: ${pending}件)`
    currentPage.drawText(statsText, {
      x: margin,
      y: currentY,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    })
    currentY -= 40

    // 各事故・ヒヤリハットの要約
    data.incidents.forEach((incident, index) => {
      // ページ終端チェック
      if (currentY < 150) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        currentY = pageHeight - margin
      }

      // 番号とタイトル
      const title = `${index + 1}. ${incident.incidentType === 'accident' ? '事故' : 'ヒヤリハット'} - ${incident.location}`
      currentPage.drawText(title, {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 20

      // 基本情報
      const info = `発生日時: ${incident.incidentDate.toLocaleDateString()} ${incident.incidentDate.toLocaleTimeString()}`
      currentPage.drawText(info, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      currentY -= 15

      const persons = `関係者: ${incident.involvedPersons.join(', ')}`
      currentPage.drawText(persons, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      currentY -= 15

      const status = `対応状況: ${getStatusText(incident.status)}`
      currentPage.drawText(status, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      })
      currentY -= 20

      // 概要
      const summaryLines = wrapText(incident.description, pageWidth - margin * 2 - 20, font, 10)
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
    link.download = `incident-reports-${data.exportDate.toISOString().split('T')[0]}.pdf`
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
    case 'completed':
      return '対応済み'
    default:
      return '不明'
  }
}

// テキスト折り返し関数
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  if (!text) return ['']
  
  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''

  for (const char of words) {
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