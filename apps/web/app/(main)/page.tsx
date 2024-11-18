import Hero from "@/components/home/hero";
import { TestAggregateEventsButton, TestListFieldsButton, TestListCustomPropertiesButton } from "@/components/home/client-components";

export default function Home() {
  return (
    <main>
      <Hero />
      <TestAggregateEventsButton />
      <TestListFieldsButton />
      <TestListCustomPropertiesButton />
    </main>
  );
}
