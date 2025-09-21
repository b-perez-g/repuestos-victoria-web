//app/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import Banner from "@/components/Banner";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);

  
  return (
    <div>
      {/*
      <button className="btn" onClick={handleClick}>
        Crear usuario
      </button>
      */}
    <Banner />


   
    </div>
  );
}
