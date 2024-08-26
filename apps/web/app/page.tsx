import Image from "next/image";
import { Button } from "../ui/button";
import styles from "./page.module.css";
import TrackingLoader from "../components/tracking";


export default function Home() {
  return (
    <>
    <TrackingLoader/>
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
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

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>
        <button
          className="text-white py-2 h-[30px] px-4 rounded"
          style={{
            backgroundColor: '#D2B48C', // Tan color
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
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file-text.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
    </>
  );
}
