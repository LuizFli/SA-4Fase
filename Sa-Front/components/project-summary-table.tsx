import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react"

export function ProjectSummaryTable() {
  const projects = [
    {
      name: "Noba web development",
      manager: "Om prakash sao",
      dueDate: "May 25, 2023",
      status: "Complete",
      statusColor: "bg-green-100 text-green-700",
      progress: "complete",
    },
    {
      name: "Datasafe AI app",
      manager: "Neelam mando",
      dueDate: "Jun 20, 2023",
      status: "In progress",
      statusColor: "bg-orange-100 text-orange-700",
      progress: "trending",
    },
    {
      name: "Media channel branding",
      manager: "Tiruvelly priya",
      dueDate: "July 13, 2023",
      status: "At risk",
      statusColor: "bg-red-100 text-red-700",
      progress: "down",
    },
    {
      name: "Cortex OS app development",
      manager: "Matte hannery",
      dueDate: "Dec 20, 2023",
      status: "Complete",
      statusColor: "bg-green-100 text-green-700",
      progress: "complete",
    },
    {
      name: "Website builder development",
      manager: "Sukunnar rao",
      dueDate: "Mar 15, 2024",
      status: "On going",
      statusColor: "bg-orange-100 text-orange-700",
      progress: "trending",
    },
  ]

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Project summary</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
              Project
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
              Project manager
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
              Status
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 pb-2 border-b">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Project manager</div>
            <div className="col-span-2">Due date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Progress</div>
          </div>

          {/* Table rows */}
          {projects.map((project, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center text-xs py-2">
              <div className="col-span-4 font-medium">{project.name}</div>
              <div className="col-span-3 text-gray-600">{project.manager}</div>
              <div className="col-span-2 text-gray-600">{project.dueDate}</div>
              <div className="col-span-2">
                <Badge className={`${project.statusColor} border-none text-xs font-normal`}>{project.status}</Badge>
              </div>
              <div className="col-span-1 flex justify-center">
                {project.progress === "complete" && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                )}
                {project.progress === "trending" && (
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                )}
                {project.progress === "down" && (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
