import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export async function getInventoryItems() {
  try {
    return await sql`
      SELECT * FROM inventory
      ORDER BY name ASC
    `
  } catch {
    console.warn("Database table 'inventory' not found, returning empty array")
    return []
  }
}

export async function getAvailableItems() {
  try {
    return await sql`
      SELECT * FROM inventory
      WHERE is_available = true
      ORDER BY name ASC
    `
  } catch {
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
  } catch {
    console.warn("Database tables not found, returning empty array")
    return []
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

export async function getInventoryById(id: number) {
  try {
    const result = await sql`SELECT * FROM inventory WHERE id = ${id} LIMIT 1`
    return result[0] || null
  } catch {
    return null
  }
}

export async function updateInventoryItem(
  id: number,
  updates: {
    name?: string
    description?: string
    price_per_day?: number
    is_available?: boolean
    quantity?: number
  },
) {
  const current = await getInventoryById(id)
  if (!current) return null

  const name = updates.name ?? current.name
  const description = updates.description !== undefined ? updates.description : current.description
  const price_per_day = updates.price_per_day ?? current.price_per_day
  const is_available = updates.is_available !== undefined ? updates.is_available : current.is_available
  const quantity = updates.quantity !== undefined ? updates.quantity : (current.quantity ?? 1)

  const result = await sql`
    UPDATE inventory
    SET name = ${name}, description = ${description}, price_per_day = ${price_per_day},
        is_available = ${is_available}, quantity = ${quantity}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] || null
}
