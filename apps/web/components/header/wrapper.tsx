import { headers } from 'next/headers';
import HeaderContent from './content';
import { auth } from "@repo/database";

export default async function Header() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
  const userData = session?.user ? {
    name: session.user.name,
    image: session.user.image,
    email: session.user.email
  } : undefined;

  return (
    <HeaderContent
      userData={userData}
    />
  );
}