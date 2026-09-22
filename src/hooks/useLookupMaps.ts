import { useQuery } from '@tanstack/react-query'
import { assetsService } from '@/services/assets.service'
import { departmentsService } from '@/services/departments.service'
import { locationsService } from '@/services/locations.service'
import { usersService } from '@/services/users.service'

export function useLookupMaps() {
  const departments = useQuery({ queryKey: ['departments'], queryFn: () => departmentsService.getDepartments() })
  const buildings = useQuery({ queryKey: ['buildings'], queryFn: () => locationsService.getBuildings() })
  const floors = useQuery({ queryKey: ['floors'], queryFn: () => locationsService.getFloors() })
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => locationsService.getRooms() })
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => assetsService.getCategories() })
  const types = useQuery({ queryKey: ['assetTypes'], queryFn: () => assetsService.getTypes() })
  const users = useQuery({ queryKey: ['users'], queryFn: () => usersService.getAll() })

  const departmentMap = new Map(departments.data?.map((d) => [d.id, d.name]))
  const buildingMap = new Map(buildings.data?.map((b) => [b.id, b.name]))
  const floorMap = new Map(floors.data?.map((f) => [f.id, f.name]))
  const roomMap = new Map(rooms.data?.map((r) => [r.id, r.name]))
  const categoryMap = new Map(categories.data?.map((c) => [c.id, c.name]))
  const typeMap = new Map(types.data?.map((t) => [t.id, t.name]))
  const userMap = new Map(users.data?.map((u) => [u.id, u.name]))

  const isLoading =
    departments.isLoading ||
    buildings.isLoading ||
    floors.isLoading ||
    rooms.isLoading ||
    categories.isLoading

  return {
    departmentMap,
    buildingMap,
    floorMap,
    roomMap,
    categoryMap,
    typeMap,
    userMap,
    departments: departments.data ?? [],
    buildings: buildings.data ?? [],
    floors: floors.data ?? [],
    rooms: rooms.data ?? [],
    categories: categories.data ?? [],
    types: types.data ?? [],
    users: users.data ?? [],
    isLoading,
  }
}
