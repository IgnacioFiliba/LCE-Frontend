export async function verifyAccount(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify/${token}`, {
    method: "GET",
    credentials: "include",
  })

  return res.json()
}
