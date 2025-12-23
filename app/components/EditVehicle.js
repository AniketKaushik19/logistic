import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import toast from "react-hot-toast"

export function EditVehicle({ name, driverName, capacity }) {
  // Local state for form fields
  const [vehicleName, setVehicleName] = useState(name)
  const [driver, setDriver] = useState(driverName)
  const [vehicleCapacity, setVehicleCapacity] = useState(capacity)

  // State for feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    console.log("working")
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/vehicle", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          truckNumber: vehicleName,
          driverName: driver,
          capacity: vehicleCapacity,
        }),
      })
    toast.success("Vehicle updated successfully")
      const data = await response.json()
      console.log(data)
      if (data.message) {
        toast.success("Vehicle updated successfully")
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Vehicle update failed:", error)
      setError("Update failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          <button 
            title="Edit Vehicle"
          >
            <Pencil size={18} className="text-blue-600" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-blue-50">
          <DialogHeader>
            <DialogTitle>Edit Vehicle Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Vehicle Id</Label>
              <Input
                id="name-1"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name-2">Driver Name</Label>
              <Input
                id="name-2"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="capacity-1">Capacity</Label>
              <Input
                id="capacity-1"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-red-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="border hover:bg-green-300"
            >
              {loading ? "Updating..." : "Update changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}