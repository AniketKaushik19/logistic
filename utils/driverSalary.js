export async function fetchDriverSalary(driverId, month) {
  const params = new URLSearchParams({ driverId });
  if (month) params.append("month", month);

  const res = await fetch(`/api/driver/salary?${params.toString()}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load salary");

  return data || {};
}
