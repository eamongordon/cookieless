import Hero from "@/components/home/hero";
import { TestAggregateEventsButton, TestListFieldsButton, TestListCustomFieldsButton } from "@/components/home/client-components";

export default function Home() {
  return (
    <main>
      <Hero />
      <TestAggregateEventsButton />
      <TestListFieldsButton />
      <TestListCustomFieldsButton />
    </main>
  );
}
