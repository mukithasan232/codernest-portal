import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export function useDemoRestriction() {
  const { appUser } = useAuth();
  
  const handleDemoRestrictedAction = <T extends (...args: any[]) => any>(callback: T) => {
    return ((...args: Parameters<T>) => {
      if (appUser?.role === "DEMO_VIEWER") {
        toast.error("🔒 Action Disabled: You are viewing the Read-Only Demo. In the live version, this action instantly executes.", {
          duration: 5000,
          style: {
            border: '1px solid #3b82f6',
            padding: '16px',
            color: '#1e293b',
            background: '#eff6ff',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        });
        return;
      }
      return callback(...args);
    }) as T;
  };
  
  const isDemoUser = appUser?.role === "DEMO_VIEWER";

  return { handleDemoRestrictedAction, isDemoUser };
}
