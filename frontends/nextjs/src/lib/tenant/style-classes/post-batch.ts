/**
 * POST a batch, retrying once the rate limiter lets go.
 *
 * The data layer allows 50 mutations a minute per caller. A stylesheet is
 * naturally many small rows -- eighteen classes came to 148 of them -- so
 * writing one row per request meant a real sheet could not be published at
 * all: two thirds of it came back 429 and the tab reported nothing useful.
 * These go through _bulk/create, which makes a whole sheet three requests.
 */
export async function postBatch(
  url: string,
  rows: unknown[],
  attempt = 0
): Promise<boolean> {
  if (rows.length === 0) return true
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  })
  if (res.ok) return true
  // 429 carries no Retry-After here, and the window is a minute; back off
  // rather than fail a publish the user cannot otherwise complete.
  if (res.status === 429 && attempt < 3) {
    await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 20_000))
    return postBatch(url, rows, attempt + 1)
  }
  return false
}
