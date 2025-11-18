import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { DollarSign, Car } from "lucide-react"

export function OverviewCards() {
  const cards = [
    {
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      label: "Receita Total",
      value: "R$ 2.450.000",
      change: "+15%",
      changeText: "aumento em relação ao mês passado",
      isPositive: true,
    },
    {
      icon: Car,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      label: "Veículos em Estoque",
      value: "47",
      suffix: "/60",
      change: "-8%",
      changeText: "redução do estoque",
      isPositive: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div className="text-xs text-gray-600 mb-1">{card.label}</div>
            <div className="text-2xl font-bold mb-2">
              {card.value}
              {card.suffix && <span className="text-sm font-normal text-gray-500"> {card.suffix}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {card.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={card.isPositive ? "text-green-600" : "text-red-600"}>{card.change}</span>
              <span className="text-gray-500">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
