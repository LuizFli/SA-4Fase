"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function OverallProgress() {
  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Overall Progress</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
            All
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Circular gauge */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e5e5" strokeWidth="16" />
            {/* Green progress (0-50%) */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#22c55e"
              strokeWidth="16"
              strokeDasharray={`${Math.PI * 80 * 0.5} ${Math.PI * 160}`}
              strokeLinecap="round"
            />
            {/* Yellow progress (50-65%) */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#eab308"
              strokeWidth="16"
              strokeDasharray={`${Math.PI * 80 * 0.15} ${Math.PI * 160}`}
              strokeDashoffset={`${-Math.PI * 80 * 0.5}`}
              strokeLinecap="round"
            />
            {/* Orange progress (65-72%) */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#f97316"
              strokeWidth="16"
              strokeDasharray={`${Math.PI * 80 * 0.07} ${Math.PI * 160}`}
              strokeDashoffset={`${-Math.PI * 80 * 0.65}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">72%</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">95</div>
            <div className="text-xs text-gray-500">Total projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">26</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">35</div>
            <div className="text-xs text-gray-500">Delayed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">35</div>
            <div className="text-xs text-gray-500">On going</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
