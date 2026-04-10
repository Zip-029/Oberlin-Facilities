import { PlusCircle, type LucideIcon } from "lucide-react"
import { NavLink, useNavigate, useLocation } from "react-router"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useWorkOrders } from "@/context/WorkOrderContext"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const { clearData } = useWorkOrders()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  const handleQuickCreate = (e: React.MouseEvent) => {
    if (location.pathname === "/dashboard") {
      e.preventDefault()
      setShowLeaveDialog(true)
    } else {
      clearData()
      navigate("/upload")
    }
  }

  const confirmLeave = () => {
    setShowLeaveDialog(false)
    clearData()
    navigate("/upload")
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink to="/upload" onClick={handleQuickCreate}>
                {({ isActive }) => (
                  <SidebarMenuButton
                    tooltip="Upload new data"
                    isActive={isActive}
                    className="min-w-8 duration-200 ease-linear"
                  >
                    <PlusCircle />
                    <span>Quick Create</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map((item) => {
              const isDisabled = item.title !== "Dashboard"
              const linkTo = item.title === "Dashboard" ? "/dashboard" : item.url
              return (
                <SidebarMenuItem key={item.title}>
                  {isDisabled ? (
                    <SidebarMenuButton
                      className="opacity-50 pointer-events-none cursor-not-allowed"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title} <span className="text-[10px] italic opacity-70 ml-1">(disabled)</span></span>
                    </SidebarMenuButton>
                  ) : (
                    <NavLink
                      to={linkTo}
                      onClick={(e) => {
                        if (location.pathname === "/upload") {
                          e.preventDefault()
                          toast("Please upload files first")
                          window.dispatchEvent(new CustomEvent('glow-upload-card'))
                        }
                      }}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Navigating to Quick Create will clear your current data. Do you really want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
