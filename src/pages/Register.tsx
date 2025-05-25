import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";

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
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const streets = Array.from({ length: 6 }, (_, i) => `Calle ${i + 1}`);
  const houseNumbers = Array.from({ length: 80 }, (_, i) => (i + 1).toString());

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName) newErrors.fullName = "El nombre completo es requerido";
    if (!email) newErrors.email = "El correo electrónico es requerido";
    if (!password) newErrors.password = "La contraseña es requerida";
    else if (password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (!confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (!street) newErrors.street = "Selecciona una calle";
    if (!houseNumber) newErrors.houseNumber = "Selecciona un número";
    if (!phoneNumber || !isPhoneValid)
      newErrors.phone = "Ingresa un número de teléfono válido";
    if (!acceptPrivacyPolicy)
      newErrors.privacyPolicy =
        "Debes aceptar el aviso de privacidad para continuar";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete todos los campos correctamente",
      });
      return;
    }

    setIsLoading(true);

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
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleStreetChange = (value: string) => {
    setStreet(value);
    if (errors.street) {
      setErrors((prev) => ({ ...prev, street: "" }));
    }
  };

  const handleHouseNumberChange = (value: string) => {
    setHouseNumber(value);
    if (errors.houseNumber) {
      setErrors((prev) => ({ ...prev, houseNumber: "" }));
    }
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
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) {
                      setErrors((prev) => ({ ...prev, fullName: "" }));
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Select value={street} onValueChange={handleStreetChange}>
                  <SelectTrigger
                    className={errors.street ? "border-red-500" : ""}
                  >
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
                {errors.street && (
                  <p className="text-sm text-red-500">{errors.street}</p>
                )}
              </div>
              <div className="space-y-2">
                <Select
                  value={houseNumber}
                  onValueChange={handleHouseNumberChange}
                >
                  <SelectTrigger
                    className={errors.houseNumber ? "border-red-500" : ""}
                  >
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
                {errors.houseNumber && (
                  <p className="text-sm text-red-500">{errors.houseNumber}</p>
                )}
              </div>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy-policy"
                  checked={acceptPrivacyPolicy}
                  onCheckedChange={(checked) =>
                    setAcceptPrivacyPolicy(checked === true)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="privacy-policy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Al registrarme acepto el{" "}
                  <Link
                    to="/disclaimer"
                    className="text-marketplace-primary hover:underline"
                  >
                    aviso de privacidad
                  </Link>
                </label>
              </div>
              {errors.privacyPolicy && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.privacyPolicy}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !acceptPrivacyPolicy}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
