import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Drill, Infection } from '@/types'

// 防災訓練記録のPDF出力
export async function exportDrillToPDF(drill: Drill): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4サイズ
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    let yPosition = 800
    const pageWidth = 595
    const margin = 50

    // ヘッダー
    page.drawText('防災訓練記録', {
      x: margin,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 40

    // 基本情報
    const basicInfo = [
      ['実施日', drill.conductedAt.toLocaleDateString('ja-JP')],
      ['訓練種別', getDrillTypeText(drill.drillType)],
      ['参加人数', `${drill.participantsCount}名`],
      ['記録作成日', new Date().toLocaleDateString('ja-JP')]
    ]

    basicInfo.forEach(([label, value]) => {
      page.drawText(`${label}: ${value}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 25
    })

    yPosition -= 20

    // 訓練内容・評価・課題
    page.drawText('訓練内容・評価・課題:', {
      x: margin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })
    yPosition -= 25

    // テキストエリアの内容を複数行に分割
    const detailsLines = wrapText(drill.details, 65)
    detailsLines.forEach(line => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 15
    })

    yPosition -= 20

    // 改善策・今後の対応
    page.drawText('改善策・今後の対応:', {
      x: margin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })
    yPosition -= 25

    const improvementsLines = wrapText(drill.improvements, 65)
    improvementsLines.forEach(line => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 15
    })

    // フッター
    yPosition = 50
    page.drawText(`出力日: ${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}`, {
      x: margin,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })

    page.drawText('ShiftCare - 防災・感染症記録管理システム', {
      x: pageWidth - 200,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })

    // PDFをダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `drill-record-${drill.conductedAt.toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('防災訓練記録PDF出力エラー:', error)
    throw new Error('防災訓練記録のPDF出力に失敗しました')
  }
}

// 感染症対応記録のPDF出力
export async function exportInfectionToPDF(infection: Infection): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4サイズ
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    let yPosition = 800
    const pageWidth = 595
    const margin = 50

    // ヘッダー
    page.drawText('感染症対応記録', {
      x: margin,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 40

    // 基本情報
    const basicInfo = [
      ['発生日', infection.reportedAt.toLocaleDateString('ja-JP')],
      ['感染症種別', getInfectionTypeText(infection.infectionType)],
      ['発症者数', `${infection.affectedCount}名`],
      ['記録作成日', new Date().toLocaleDateString('ja-JP')]
    ]

    basicInfo.forEach(([label, value]) => {
      page.drawText(`${label}: ${value}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 25
    })

    yPosition -= 20

    // 対応内容
    page.drawText('対応内容:', {
      x: margin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })
    yPosition -= 25

    // テキストエリアの内容を複数行に分割
    const measuresLines = wrapText(infection.responseMeasures, 65)
    measuresLines.forEach(line => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 15
    })

    yPosition -= 20

    // 収束状況・教訓
    page.drawText('収束状況・教訓:', {
      x: margin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0)
    })
    yPosition -= 25

    const outcomeLines = wrapText(infection.outcome, 65)
    outcomeLines.forEach(line => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 15
    })

    // フッター
    yPosition = 50
    page.drawText(`出力日: ${new Date().toLocaleDateString('ja-JP')} ${new Date().toLocaleTimeString('ja-JP')}`, {
      x: margin,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })

    page.drawText('ShiftCare - 防災・感染症記録管理システム', {
      x: pageWidth - 200,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })

    // PDFをダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `infection-record-${infection.reportedAt.toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('感染症対応記録PDF出力エラー:', error)
    throw new Error('感染症対応記録のPDF出力に失敗しました')
  }
}

// ヘルパー関数: 防災訓練種別の表示テキスト
function getDrillTypeText(type: string): string {
  switch (type) {
    case 'fire':
      return '火災避難訓練'
    case 'earthquake':
      return '地震避難訓練'
    case 'evacuation':
      return '避難誘導訓練'
    case 'firefighting':
      return '消火訓練'
    case 'other':
      return 'その他'
    default:
      return '不明'
  }
}

// ヘルパー関数: 感染症種別の表示テキスト
function getInfectionTypeText(type: string): string {
  switch (type) {
    case 'influenza':
      return 'インフルエンザ'
    case 'covid19':
      return 'COVID-19'
    case 'norovirus':
      return 'ノロウイルス'
    case 'other':
      return 'その他'
    default:
      return '不明'
  }
}

// ヘルパー関数: テキストの行折り返し
function wrapText(text: string, maxLength: number): string[] {
  const lines: string[] = []
  const paragraphs = text.split('\n')
  
  paragraphs.forEach(paragraph => {
    if (paragraph.length <= maxLength) {
      lines.push(paragraph)
    } else {
      let currentLine = ''
      const words = paragraph.split('')
      
      for (const char of words) {
        if ((currentLine + char).length <= maxLength) {
          currentLine += char
        } else {
          if (currentLine) {
            lines.push(currentLine)
          }
          currentLine = char
        }
      }
      
      if (currentLine) {
        lines.push(currentLine)
      }
    }
  })
  
  return lines
}