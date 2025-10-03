import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";

export function LoginForm() {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {signIn, data, error} = useAuth();

  const login = async () => {
    await signIn(email, password)
  }

  if(data) {
    // do something
  }

  if(error) {
    // do something
  }


  return (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          onClick={login}
        >
          Login
        </Button>
      </div>
    </form>
  );
}
