import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Admin functions
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

export async function createAdmin(admin: {
  name: string
  email: string
  password_hash: string
}) {
  try {
    const result = await sql`
      INSERT INTO admins (name, email, password_hash)
      VALUES (${admin.name}, ${admin.email}, ${admin.password_hash})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating admin:", error)
    throw error
  }
}

export async function getAllAdmins() {
  try {
    return await sql`
      SELECT id, name, email, created_at FROM admins 
      ORDER BY name ASC
    `
  } catch (error) {
    console.warn("Database table 'admins' not found, returning empty array")
    return []
  }
}

// Inventory functions (inventar table)
export async function getAvailableInventory() {
  try {
    return await sql`
      SELECT * FROM inventar 
      WHERE menge > 0
      ORDER BY name ASC
    `
  } catch (error) {
    console.warn("Database table 'inventar' not found, returning empty array")
    return []
  }
}

export async function getAllInventory() {
  try {
    return await sql`
      SELECT * FROM inventar 
      ORDER BY name ASC
    `
  } catch (error) {
    console.warn("Database table 'inventar' not found, returning empty array")
    return []
  }
}

export async function getInventoryById(id: number) {
  try {
    const result = await sql`
      SELECT * FROM inventar 
      WHERE id = ${id}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.warn("Database table 'inventar' not found")
    return null
  }
}

export async function createInventoryItem(item: {
  name: string
  menge: number
  preis: number
  verliehen_bis?: string | null
}) {
  try {
    const result = await sql`
      INSERT INTO inventar (name, menge, preis, verliehen_bis)
      VALUES (${item.name}, ${item.menge}, ${item.preis}, ${item.verliehen_bis || null})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating inventory item:", error)
    throw error
  }
}

export async function updateInventoryItem(
  id: number,
  updates: {
    name?: string
    menge?: number
    preis?: number
    verliehen_bis?: string | null
  },
) {
  try {
    const setClause = []
    const values = []

    if (updates.name !== undefined) {
      setClause.push(`name = $${setClause.length + 1}`)
      values.push(updates.name)
    }
    if (updates.menge !== undefined) {
      setClause.push(`menge = $${setClause.length + 1}`)
      values.push(updates.menge)
    }
    if (updates.preis !== undefined) {
      setClause.push(`preis = $${setClause.length + 1}`)
      values.push(updates.preis)
    }
    if (updates.verliehen_bis !== undefined) {
      setClause.push(`verliehen_bis = $${setClause.length + 1}`)
      values.push(updates.verliehen_bis)
    }

    if (setClause.length === 0) return null

    const result = await sql`
      UPDATE inventar 
      SET ${sql.unsafe(setClause.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating inventory item:", error)
    throw error
  }
}

export async function deleteInventoryItem(id: number) {
  try {
    const result = await sql`
      DELETE FROM inventar 
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    throw error
  }
}

// Rental functions (ausleihen table)
export async function getAllRentals() {
  try {
    return await sql`
      SELECT a.*, i.name as gegenstand_name, i.preis
      FROM ausleihen a
      JOIN inventar i ON a.gegenstand_id = i.id
      ORDER BY a.created_at DESC
    `
  } catch (error) {
    console.warn("Database tables not found, returning empty array")
    return []
  }
}

export async function getRentalById(id: number) {
  try {
    const result = await sql`
      SELECT a.*, i.name as gegenstand_name, i.preis
      FROM ausleihen a
      JOIN inventar i ON a.gegenstand_id = i.id
      WHERE a.id = ${id}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.warn("Database tables not found")
    return null
  }
}

export async function createRental(rental: {
  gegenstand_id: number
  person: string
  email: string
  ausleihe_datum: string
  rueckgabe_datum: string
  status?: string
}) {
  try {
    const result = await sql`
      INSERT INTO ausleihen (gegenstand_id, person, email, ausleihe_datum, rueckgabe_datum, status)
      VALUES (${rental.gegenstand_id}, ${rental.person}, ${rental.email}, ${rental.ausleihe_datum}, ${rental.rueckgabe_datum}, ${rental.status || "pending"})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating rental:", error)
    throw error
  }
}

export async function updateRentalStatus(id: number, status: string) {
  try {
    const result = await sql`
      UPDATE ausleihen 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating rental status:", error)
    throw error
  }
}

export async function deleteRental(id: number) {
  try {
    const result = await sql`
      DELETE FROM ausleihen 
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error deleting rental:", error)
    throw error
  }
}

// Statistics functions
export async function getDashboardStats() {
  try {
    const [inventoryCount, activeRentals, pendingRentals, totalRevenue] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM inventar`,
      sql`SELECT COUNT(*) as count FROM ausleihen WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM ausleihen WHERE status = 'pending'`,
      sql`SELECT SUM(i.preis) as total FROM ausleihen a JOIN inventar i ON a.gegenstand_id = i.id WHERE a.status = 'completed'`,
    ])

    return {
      totalItems: inventoryCount[0]?.count || 0,
      activeRentals: activeRentals[0]?.count || 0,
      pendingRentals: pendingRentals[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
    }
  } catch (error) {
    console.warn("Error fetching dashboard stats, returning defaults")
    return {
      totalItems: 0,
      activeRentals: 0,
      pendingRentals: 0,
      totalRevenue: 0,
    }
  }
}

// CSV Import function
export async function bulkCreateInventory(
  items: Array<{
    name: string
    menge: number
    preis: number
    verliehen_bis?: string | null
  }>,
) {
  try {
    const results = []
    for (const item of items) {
      const result = await createInventoryItem(item)
      results.push(result)
    }
    return results
  } catch (error) {
    console.error("Error bulk creating inventory:", error)
    throw error
  }
}
