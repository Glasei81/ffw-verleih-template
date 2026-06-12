import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

/** Adds columns that may not exist in older deployments. Safe to call repeatedly. */
export async function ensureRentalsSchema() {
  await sql`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS pickup_info TEXT`
  await sql`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS request_group UUID`
  await sql`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS requester_type VARCHAR(50) DEFAULT 'external'`
}

export async function getInventoryItems() {
  try {
    return await sql`SELECT * FROM inventory ORDER BY name ASC`
  } catch {
    return []
  }
}

export async function getAvailableItems() {
  try {
    return await sql`SELECT * FROM inventory WHERE is_available = true ORDER BY name ASC`
  } catch {
    return []
  }
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
  updates: { name?: string; description?: string; price_per_day?: number; is_available?: boolean; quantity?: number }
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

export async function deleteInventoryItem(id: number) {
  await sql`DELETE FROM inventory WHERE id = ${id}`
}

/** Legacy: individual rows. Used by admin overview counts. */
export async function getRentals() {
  try {
    return await sql`
      SELECT r.*, i.name as item_name, i.price_per_day
      FROM rentals r
      JOIN inventory i ON r.item_id = i.id
      ORDER BY r.created_at DESC
    `
  } catch {
    return []
  }
}

/**
 * One entry per booking request. Items are aggregated into a JSON array.
 * Uses COALESCE(request_group, id::TEXT) so old rows without a group each form their own entry.
 */
export async function getRentalRequests() {
  try {
    return await sql`
      SELECT
        MIN(r.id)                        AS id,
        COALESCE(r.request_group::TEXT, r.id::TEXT) AS group_key,
        r.renter_name,
        r.renter_email,
        r.renter_phone,
        r.start_date,
        r.end_date,
        r.status,
        MAX(r.notes)                     AS notes,
        MAX(r.requester_type)            AS requester_type,
        MAX(r.pickup_info)               AS pickup_info,
        MIN(r.created_at)                AS created_at,
        MAX(r.updated_at)                AS updated_at,
        SUM(r.total_price)::NUMERIC      AS total_price,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',            r.id,
            'item_id',       r.item_id,
            'item_name',     i.name,
            'price_per_day', i.price_per_day,
            'total_price',   r.total_price
          ) ORDER BY r.id
        ) AS items
      FROM rentals r
      JOIN inventory i ON r.item_id = i.id
      GROUP BY
        COALESCE(r.request_group::TEXT, r.id::TEXT),
        r.renter_name, r.renter_email, r.renter_phone,
        r.start_date, r.end_date, r.status
      ORDER BY MIN(r.created_at) DESC
    `
  } catch {
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
  request_group?: string | null
  requester_type?: string
}) {
  const rg = rental.request_group ?? null
  const rt = rental.requester_type ?? "external"
  if (rg) {
    return await sql`
      INSERT INTO rentals (
        item_id, renter_name, renter_email, renter_phone,
        start_date, end_date, total_price, notes,
        request_group, requester_type
      )
      VALUES (
        ${rental.item_id}, ${rental.renter_name}, ${rental.renter_email}, ${rental.renter_phone || null},
        ${rental.start_date}, ${rental.end_date}, ${rental.total_price}, ${rental.notes || null},
        ${rg}::UUID, ${rt}
      )
      RETURNING *
    `
  }
  return await sql`
    INSERT INTO rentals (
      item_id, renter_name, renter_email, renter_phone,
      start_date, end_date, total_price, notes, requester_type
    )
    VALUES (
      ${rental.item_id}, ${rental.renter_name}, ${rental.renter_email}, ${rental.renter_phone || null},
      ${rental.start_date}, ${rental.end_date}, ${rental.total_price}, ${rental.notes || null},
      ${rt}
    )
    RETURNING *
  `
}

export async function updateRentalStatus(id: number, status: string) {
  return await sql`
    UPDATE rentals SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
}

/** Updates every rental row that belongs to the same booking request. */
export async function updateRentalGroupStatus(
  groupKey: string,
  status: string,
  pickupInfo?: string | null
) {
  const pi = pickupInfo || null
  if (groupKey.includes("-")) {
    // UUID-format group key
    return await sql`
      UPDATE rentals
      SET status      = ${status},
          pickup_info = COALESCE(${pi}, pickup_info),
          updated_at  = NOW()
      WHERE request_group = ${groupKey}::UUID
      RETURNING *
    `
  }
  // Fallback: plain integer id (old rows without a group)
  return await sql`
    UPDATE rentals
    SET status      = ${status},
        pickup_info = COALESCE(${pi}, pickup_info),
        updated_at  = NOW()
    WHERE id = ${Number.parseInt(groupKey)}
    RETURNING *
  `
}
