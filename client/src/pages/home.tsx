import { useEffect } from "react";
import { useLocation } from "wouter";

// Redirect to new landing page structure
export default function Home() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}
