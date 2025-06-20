import pool from "@/adapters/postgres/postgres.adapter";

/**
 hum chaahy to pool.query shortcut ka wrapper bana ly jesa ye bana hai 
 Ye har query ko ek clean reusable pattern dega. Har controller me baar baar connect/release nahi likhna padega.
 */

export async function withDb<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect(); 

  try {
    return await callback(client);     
  } finally {
    client.release();                  
  }
}
