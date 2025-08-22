import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database query helpers
export async function getInventoryItems() {
  try {
    return await sql`
      SELECT * FROM inventory 
      ORDER BY name ASC
    `
  } catch (error) {
    // Handle case where tables don't exist yet (during build)
    console.warn("Database table 'inventory' not found, returning empty array")
    return []
  }
}

export async function getAvailableItems(startDate: string, endDate: string) {
  try {
    return await sql`
      SELECT i.* FROM inventory i
      WHERE i.is_available = true
      AND i.id NOT IN (
        SELECT r.item_id FROM rentals r
        WHERE r.status IN ('confirmed', 'active')
        AND (
          (r.start_date <= ${startDate} AND r.end_date >= ${startDate})
          OR (r.start_date <= ${endDate} AND r.end_date >= ${endDate})
          OR (r.start_date >= ${startDate} AND r.end_date <= ${endDate})
        )
      )
      ORDER BY i.name ASC
    `
  } catch (error) {
    console.warn("Database tables not found, returning empty array")
    return []
  }
}

export async function getRentals() {
  try {
    return await sql`
      SELECT r.*, i.name as item_name, i.price_per_day
      FROM rentals r
      JOIN inventory i ON r.item_id = i.id
      ORDER BY r.created_at DESC
    `
  } catch (error) {
    console.warn("Database tables not found, returning empty array")
    return []
  }
}

export async function getAdminByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM admins 
      WHERE email = ${email}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.warn("Database table 'admins' not found")
    return null
  }
}

export async function createRental(rental: {
  item_id: number
  renter_name: string
  renter_email: string
  renter_phone?: string
  start_date: string
  end_date: string
  total_price: number
  notes?: string
}) {
  return await sql`
    INSERT INTO rentals (item_id, renter_name, renter_email, renter_phone, start_date, end_date, total_price, notes)
    VALUES (${rental.item_id}, ${rental.renter_name}, ${rental.renter_email}, ${rental.renter_phone || null}, ${rental.start_date}, ${rental.end_date}, ${rental.total_price}, ${rental.notes || null})
    RETURNING *
  `
}

export async function updateRentalStatus(id: number, status: string) {
  return await sql`
    UPDATE rentals 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
}

export async function updateInventoryItem(
  id: number,
  updates: {
    name?: string
    description?: string
    price_per_day?: number
    is_available?: boolean
  },
) {
  const setClause = Object.entries(updates)
    .filter(([_, value]) => value !== undefined)
    .map(([key, _]) => `${key} = $${key}`)
    .join(", ")

  if (!setClause) return null

  return await sql`
    UPDATE inventory 
    SET ${sql.unsafe(setClause)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
}
