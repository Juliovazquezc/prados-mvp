import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { PhoneNumberInput } from "@/components/PhoneNumberInput";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const streets = Array.from({ length: 6 }, (_, i) => `Calle ${i + 1}`);
  const houseNumbers = Array.from({ length: 80 }, (_, i) => (i + 1).toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      setIsLoading(false);
      return;
    }

    if (!fullName || !street || !houseNumber || !phoneNumber || !isPhoneValid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete todos los campos correctamente",
      });
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, {
        full_name: fullName,
        street: street,
        house_number: houseNumber,
        phone_number: phoneNumber,
      });
      toast({
        title: "Éxito",
        description: "Tu cuenta ha sido creada y ahora estás conectado.",
      });
      navigate("/"); // Redirect to homepage after successful signup
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al registrarse",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string, isValid: boolean) => {
    setPhoneNumber(value);
    setIsPhoneValid(isValid);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>Crea una nueva cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Select value={street} onValueChange={setStreet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu calle" />
                  </SelectTrigger>
                  <SelectContent>
                    {streets.map((streetName) => (
                      <SelectItem key={streetName} value={streetName}>
                        {streetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select value={houseNumber} onValueChange={setHouseNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el número" />
                  </SelectTrigger>
                  <SelectContent>
                    {houseNumbers.map((number) => (
                      <SelectItem key={number} value={number}>
                        {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
