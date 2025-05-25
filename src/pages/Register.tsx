import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { supabase } from "@/lib/supabase";

const RegisterForm = () => {
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    signInWithPhone,
    verifyPhoneOtp,
    setPassword: updatePassword,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const streets = Array.from({ length: 6 }, (_, i) => `Calle ${i + 1}`);
  const houseNumbers = Array.from({ length: 80 }, (_, i) => (i + 1).toString());

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = "El nombre completo es requerido";
    if (!street) newErrors.street = "Selecciona una calle";
    if (!houseNumber) newErrors.houseNumber = "Selecciona un número";
    if (!isPhoneValid) newErrors.phone = "Ingresa un número de teléfono válido";
    if (password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!acceptPrivacyPolicy)
      newErrors.privacyPolicy =
        "Debes aceptar el aviso de privacidad para continuar";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos correctamente",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Validar que el teléfono no esté registrado
      const { data: existing, error: phoneError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone_number", phoneNumber)
        .maybeSingle();
      if (phoneError) throw phoneError;
      if (existing) {
        toast({
          variant: "destructive",
          title: "Teléfono ya registrado",
          description:
            "Este número de teléfono ya está en uso. Usa otro o inicia sesión.",
        });
        setIsLoading(false);
        return;
      }
      await signInWithPhone(phoneNumber);
      setStep("otp");
      toast({
        title: "Código enviado",
        description:
          "Se ha enviado un código de verificación a tu número de teléfono",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al enviar el código de verificación",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El código de verificación debe tener 6 dígitos",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyPhoneOtp(phoneNumber, otp);
      if (response && response.user) {
        await updatePassword(password);
        // Crear el perfil del usuario
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: response.user.id,
            full_name: fullName,
            phone_number: phoneNumber,
            street: street,
            house_number: houseNumber,
          },
          { onConflict: "id" }
        );
        if (profileError) throw profileError;
        toast({
          title: "Éxito",
          description: "Tu cuenta ha sido creada y ahora estás conectado.",
        });
        navigate("/");
      } else {
        throw new Error("No se pudo verificar el número de teléfono");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al verificar el código",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              {step === "form"
                ? "Crea tu cuenta con tus datos y número de celular"
                : "Ingresa el código que recibiste por SMS"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "form" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
                <Select value={street} onValueChange={setStreet}>
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
                <Select value={houseNumber} onValueChange={setHouseNumber}>
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
                <PhoneNumberInput
                  value={phoneNumber}
                  onChange={(value, valid) => {
                    setPhoneNumber(value);
                    setIsPhoneValid(valid);
                  }}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
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
                  {isLoading ? "Enviando código..." : "Recibir código por SMS"}
                </Button>
              </form>
            )}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Código de verificación (6 dígitos)"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))
                  }
                  required
                  maxLength={6}
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verificando..." : "Verificar Código"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await signInWithPhone(phoneNumber);
                      toast({
                        title: "Código reenviado",
                        description:
                          "Se ha enviado un nuevo código a tu número",
                      });
                      //eslint-disable-next-line
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No se pudo reenviar el código",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  Reenviar código
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {step === "form" && (
              <div className="mt-4 text-center w-full">
                <p className="text-sm text-gray-500">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-marketplace-primary hover:underline"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default RegisterForm;
