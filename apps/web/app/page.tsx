import Image from "next/image";
import { Button } from "../ui/button";
import TrackingLoader from "../components/tracking";

export default function Home() {
  return (
    <>
    <TrackingLoader/>
    <div>
      <main>
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>
        <Button appName="web">
          Open alert
        </Button>
        <button
          className="h-[30px] px-4 rounded"
          style={{
            backgroundColor: '#ffdcad', // Tan color
            backgroundImage: `
              radial-gradient(circle at 10% 20%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 20% 80%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 30% 50%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 40% 30%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 50% 70%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 60% 40%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 70% 60%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 80% 20%, #8B4513 2px, transparent 0),
              radial-gradient(circle at 90% 50%, #8B4513 2px, transparent 0)
            `,
            backgroundSize: '100% 100%',
          }}
        >
          Open alert
        </button>
      </main>
      <footer>
      </footer>
    </div>
    </>
  );
}
