"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

// const email = process.env.EMAIL

interface TeacherLoginProps {
  onLogin?: (isTeacher: boolean) => void;
}

export default function TeacherLogin({ onLogin }: TeacherLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const { data: _data, error } = await supabase.auth.signInWithPassword({
      email: "maxjsl@gmail.com", 
      password,
    });

    if (error) {
      setError("Invalid password");
      return;
    }

    // If provided, notify parent; hook will set TTL and session.
    onLogin?.(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter teacher password"
      />
      <Button variant="materialFilled" onClick={handleLogin}>Login as Teacher</Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
