"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download, Copy, Check } from "lucide-react"
import { useState } from "react"

interface NotificationModalProps {
  company: {
    name: string
    cnpj?: string | null
    address?: string | null
  }
  clientName: string
  onClose: () => void
}

export function NotificationModal({ company, clientName, onClose }: NotificationModalProps) {
  const [copied, setCopied] = useState(false)

  const notificationText = `NOTIFICAÇÃO EXTRAJUDICIAL

Prezados Senhores,

Por meio da presente, venho, em nome de ${clientName}, CNPJ/CPF [INSERIR], com sede/domicílio em [INSERIR ENDEREÇO], notificá-los acerca da utilização indevida de denominação empresarial similar.

FATOS:

A empresa ${clientName} é detentora legítima do nome empresarial e/ou marca registrada, exercendo suas atividades comerciais de forma regular e consolidada no mercado.

Constatou-se que a empresa ${company.name}, CNPJ ${company.cnpj ?? '[INSERIR]'}, localizada em ${company.address ?? '[INSERIR ENDEREÇO]'}, está utilizando denominação empresarial substancialmente similar, o que pode gerar confusão no mercado e caracterizar concorrência desleal.

FUNDAMENTO LEGAL:

- Lei nº 9.279/96 (Lei de Propriedade Industrial)
- Código Civil Brasileiro (arts. 1.163 a 1.167)
- Lei nº 8.934/94 (Registro Público de Empresas Mercantis)

PEDIDO:

Diante do exposto, NOTIFICO Vossa Senhoria para que, no prazo de 30 (trinta) dias corridos a contar do recebimento desta, proceda à alteração da denominação empresarial, cessando imediatamente o uso da denominação similar.

O não atendimento desta notificação implicará na adoção das medidas judiciais cabíveis, incluindo ação de abstenção de uso e reparação por perdas e danos.

Atenciosamente,

[NOME DO ADVOGADO]
OAB/[UF] [NÚMERO]

Data: ${new Date().toLocaleDateString("pt-BR")}
`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(notificationText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([notificationText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notificacao-${company.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Notificação Extrajudicial</h2>
            <p className="text-sm text-muted-foreground mt-1">{company.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted p-4 rounded-lg">
            {notificationText}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border">
          <Button onClick={handleCopy} variant="outline" className="flex-1 bg-transparent">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </>
            )}
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Baixar Documento
          </Button>
        </div>
      </Card>
    </div>
  )
}
