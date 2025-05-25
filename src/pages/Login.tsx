import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";

const LoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPhonePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneChange = (value: string, isValid: boolean) => {
    setPhoneNumber(value);
    setIsPhoneValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Número de teléfono o contraseña inválidos",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPhonePassword(phoneNumber, password);
      toast({
        title: "Éxito",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 -mt-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede con tu número de celular y contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PhoneNumberInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isPhoneValid}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="mt-4 text-center w-full">
              <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-marketplace-primary hover:underline"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
