import Image from "next/image";
import { Button } from "@/components/ui/button";
//import TrackingLoader from "../components/tracking";
import { TestModalButton } from "@/components/home/client-components";

export default function Home() {
  return (
    <>
      {/*<TrackingLoader />*/}
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
          <Button>
            Open alert
          </Button>
          <TestModalButton>
            <div className="h-96 w-96 bg-green-600" tabIndex={0} />
          </TestModalButton>
          <button
            className="text-white font-semibold h-10 px-4 rounded-lg"
            style={{
              backgroundColor: '#f5b31b', // Tan color
              backgroundImage: `
              radial-gradient(circle at 10% 20%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 15% 50%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 20% 80%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 30% 50%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 40% 30%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 50% 70%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 60% 40%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 70% 60%, #8B4513 3px, transparent 0),              radial-gradient(circle at 80% 20%, #8B4513 3px, transparent 0),
              radial-gradient(circle at 90% 50%, #8B4513 3px, transparent 0)
            `,
              backgroundSize: '100% 100%',
              textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
            }}
          >
            Get Started
          </button>
          <button
            className="text-white font-semibold h-10 px-4 rounded-lg ml-2"
            style={{
              backgroundColor: '#f5b31b', // Tan color
              backgroundImage: `
              radial-gradient(circle at 5% 20%, #8B4513 7px, transparent 0),
              radial-gradient(circle at 20% 80%, #8B4513 6px, transparent 0),
              radial-gradient(circle at 40% 30%, #8B4513 7px, transparent 0),
              radial-gradient(circle at 70% 60%, #8B4513 7px, transparent 0),              
              radial-gradient(circle at 50% 90%, #8B4513 5px, transparent 0),   
              radial-gradient(circle at 80% 0%, #8B4513 7px, transparent 0),
              radial-gradient(circle at 100% 50%, #8B4513 6px, transparent 0)
            `,
              backgroundSize: '100% 100%',
              textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
            }}
          >
            Get Started
          </button>
          <button
            className="text-white font-semibold h-10 px-4 rounded-lg ml-2"
            style={{
              backgroundColor: '#f5b31b', // Tan color
              backgroundImage: `
              radial-gradient(circle at 5% 20%, #8B4513 10px, transparent 0),
              radial-gradient(circle at 20% 80%, #8B4513 8px, transparent 0),
              radial-gradient(circle at 40% 30%, #8B4513 10px, transparent 0),
              radial-gradient(circle at 70% 60%, #8B4513 10px, transparent 0),              
              radial-gradient(circle at 50% 90%, #8B4513 6px, transparent 0),   
              radial-gradient(circle at 80% 0%, #8B4513 10px, transparent 0),
              radial-gradient(circle at 100% 50%, #8B4513 10px, transparent 0)
            `,
              backgroundSize: '100% 100%',
              textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
            }}
          >
            Get Started
          </button>
          <section className="w-full bg-[#ffdcad] h-screen">

          </section>
        </main>
        <footer>
        </footer>
      </div>
    </>
  );
}