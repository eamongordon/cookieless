import HeaderContent from './header-content';
import { auth } from "@/lib/auth";
import { ModalProvider } from './modal/provider';

export default async function Header() {
  const session = await auth();
  const userData = session?.user ? {
    name: session.user.name,
    image: session.user.image,
    email: session.user.email
  } : undefined;

  return (
    <ModalProvider>
      <HeaderContent
        userData={userData}
      />
    </ModalProvider>
  );
}