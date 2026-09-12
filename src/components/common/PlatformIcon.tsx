import { Github, Linkedin, Twitter, Youtube, Facebook, Globe, MessageSquare } from "lucide-react";
import { PlatformType } from "@prisma/client";

export default function PlatformIcon({ platform, className = "w-5 h-5 transition-colors duration-200" }: { platform: PlatformType; className?: string }) {
  switch (platform) {
    case "GITHUB":
      return <Github className={className} />;
    case "LINKEDIN":
      return <Linkedin className={className} />;
    case "TWITTER_X":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
    case "YOUTUBE":
      return <Youtube className={className} />;
    case "FACEBOOK":
      return <Facebook className={className} />;
    case "DISCORD":
      return <MessageSquare className={className} />;
    case "UPWORK":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M17.82 7.76a4.26 4.26 0 0 0-3 1.25 5.56 5.56 0 0 0-1.28 2.62l-1.37-3.83h-2.15v5.8a2.53 2.53 0 0 1-5 0v-5.8H2.76v5.8a4.67 4.67 0 0 0 9.34 0v-1.12l.86 2.37h2.15l.89-2.27c.39 1.48 1.48 2.65 3.01 2.65 1.7 0 3.08-1.4 3.08-3.13s-1.38-3.14-3.08-3.14zm0 4.67a1.44 1.44 0 0 1-1.42-1.47 1.44 1.44 0 0 1 1.42-1.47 1.44 1.44 0 0 1 1.42 1.47 1.44 1.44 0 0 1-1.42 1.47z" />
        </svg>
      );
    case "FIVERR":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M19.7 7h-2.6V4.4h-2.6V7H12v2.6h2.5v5c0 2 1.2 2.8 3 2.8h2.3v-2.6h-1.5c-.7 0-1.1-.3-1.1-1.1v-4.1h2.5V7zm-11 5.3c0-1.8-1.3-2.9-3.2-2.9-1.9 0-3.3 1.2-3.3 3.1 0 1.9 1.3 3 3.2 3 1 0 1.9-.3 2.5-.8V12c-.5.4-1.2.6-1.9.6-.9 0-1.5-.4-1.5-1.2h4.2c.1-.4.1-.8.1-1.1zm-4.1-.7c0-.6.4-1 1-1 .5 0 .9.3.9 1h-1.9zm13.1-6c.9 0 1.6-.7 1.6-1.6 0-.9-.7-1.6-1.6-1.6-.9 0-1.6.7-1.6 1.6 0 .9.7 1.6 1.6 1.6z"/>
        </svg>
      );
    case "CUSTOM":
    default:
      return <Globe className={className} />;
  }
}
