'use client'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { EvaluationResponse, EvaluationQuestion } from '@/types'
import { evaluationQuestions, scoreDescriptions } from './evaluation-data'

export interface EvaluationExportData {
  year: number
  responses: EvaluationResponse[]
  facilityName?: string
  exportDate: Date
}

// 自己評価表PDF出力関数
export const exportEvaluationToPDF = async (data: EvaluationExportData): Promise<void> => {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // ページサイズとマージン設定
    const pageWidth = 595 // A4横幅
    const pageHeight = 842 // A4縦幅
    const margin = 40
    const contentWidth = pageWidth - margin * 2

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let currentY = pageHeight - margin

    // タイトル
    currentPage.drawText(`${data.year}年度 自己点検・自己評価表`, {
      x: margin,
      y: currentY,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 40

    // 施設名（オプション）
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

    // 作成日
    const dateStr = `作成日: ${data.exportDate.getFullYear()}年${(data.exportDate.getMonth() + 1).toString().padStart(2, '0')}月${data.exportDate.getDate().toString().padStart(2, '0')}日`
    currentPage.drawText(dateStr, {
      x: margin,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })
    currentY -= 40

    // 評価スコア説明
    currentPage.drawText('評価基準:', {
      x: margin,
      y: currentY,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 20

    Object.entries(scoreDescriptions).forEach(([score, description]) => {
      currentPage.drawText(`${score}: ${description}`, {
        x: margin + 20,
        y: currentY,
        size: 9,
        font: font,
        color: rgb(0, 0, 0),
      })
      currentY -= 15
    })
    currentY -= 20

    // 質問と回答の表示
    for (const question of evaluationQuestions) {
      const response = data.responses.find(r => r.questionId === question.id)
      
      // ページ終端チェック
      if (currentY < 150) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        currentY = pageHeight - margin
      }

      // 質問番号とタイトル
      const questionText = `問${question.number}. ${question.title}`
      currentPage.drawText(questionText, {
        x: margin,
        y: currentY,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      currentY -= 20

      // 質問説明（があれば）
      if (question.description) {
        const descLines = wrapText(question.description, contentWidth - 40, font, 9)
        for (const line of descLines) {
          currentPage.drawText(line, {
            x: margin + 10,
            y: currentY,
            size: 9,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          })
          currentY -= 12
        }
      }
      currentY -= 5

      // 回答スコア
      const scoreText = response?.score > 0 
        ? `評価: ${response.score} (${scoreDescriptions[response.score as keyof typeof scoreDescriptions]})`
        : '評価: 未回答'
      
      currentPage.drawText(scoreText, {
        x: margin + 10,
        y: currentY,
        size: 10,
        font: font,
        color: response?.score > 0 ? rgb(0, 0.5, 0) : rgb(0.7, 0, 0),
      })
      currentY -= 20

      // コメント
      if (response?.comment) {
        currentPage.drawText('コメント:', {
          x: margin + 10,
          y: currentY,
          size: 9,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        currentY -= 15

        const commentLines = wrapText(response.comment, contentWidth - 40, font, 9)
        for (const line of commentLines) {
          currentPage.drawText(line, {
            x: margin + 20,
            y: currentY,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          })
          currentY -= 12
        }
      }
      currentY -= 20

      // 区切り線
      currentPage.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })
      currentY -= 15
    }

    // 最終ページにサマリー追加
    currentY -= 20
    const totalQuestions = evaluationQuestions.length
    const answeredQuestions = data.responses.filter(r => r.score > 0).length
    const averageScore = data.responses
      .filter(r => r.score > 0)
      .reduce((sum, r) => sum + r.score, 0) / answeredQuestions || 0

    currentPage.drawText('評価サマリー', {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    currentY -= 25

    const summaryItems = [
      `総項目数: ${totalQuestions}`,
      `回答済み項目数: ${answeredQuestions}`,
      `回答率: ${Math.round((answeredQuestions / totalQuestions) * 100)}%`,
      `平均スコア: ${averageScore.toFixed(1)}`
    ]

    summaryItems.forEach(item => {
      currentPage.drawText(item, {
        x: margin + 20,
        y: currentY,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      currentY -= 18
    })

    // ファイルダウンロード
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `self-evaluation-${data.year}年度.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('PDFの出力に失敗しました')
  }
}

// テキスト折り返し関数
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)
    
    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        lines.push(word)
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}