import Hero from "@/components/home/hero";
import { TestAggregationButton, CountEventTestButton } from "@/components/home/client-components";

export default function Home() {
  return (
    <main>
      <Hero />
      <TestAggregationButton />
      <CountEventTestButton />
    </main>
  );
}
