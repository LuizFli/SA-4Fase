import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export function TodayTasks() {
  const tasks = [
    {
      text: "Create a user flow of social application design",
      status: "Approved",
      statusColor: "bg-green-100 text-green-700",
      checked: true,
    },
    {
      text: "Create a user flow of social application design",
      status: "In review",
      statusColor: "bg-orange-100 text-orange-700",
      checked: true,
    },
    {
      text: "Landing page design for Fintech project of singapore",
      status: "In review",
      statusColor: "bg-orange-100 text-orange-700",
      checked: true,
    },
    {
      text: "Interactive prototype for app screens of delamine project",
      status: "On going",
      statusColor: "bg-orange-100 text-orange-700",
      checked: false,
    },
    {
      text: "Interactive prototype for app screens of delamine project",
      status: "Approved",
      statusColor: "bg-green-100 text-green-700",
      checked: true,
    },
  ]

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Today task</CardTitle>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-normal">
            All <span className="ml-1 bg-blue-200 px-1 rounded">15</span>
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            Important
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            Notes <span className="ml-1 bg-gray-200 px-1 rounded">10</span>
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            Links <span className="ml-1 bg-gray-200 px-1 rounded">12</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Checkbox checked={task.checked} className="rounded-full" />
                <span className="text-sm">{task.text}</span>
              </div>
              <Badge className={`${task.statusColor} border-none text-xs font-normal ml-4`}>{task.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
