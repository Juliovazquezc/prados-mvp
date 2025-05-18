import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  disabled?: boolean;
}

export const PhoneNumberInput = ({
  value,
  onChange,
  disabled = false,
}: PhoneNumberInputProps) => {
  const [error, setError] = useState<string>("");
  const [isValid, setIsValid] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    // Remove any non-numeric characters
    const numericValue = phone.replace(/\D/g, "");

    if (numericValue.length === 0) {
      setError("El número de teléfono es requerido");
      setIsValid(false);
    } else if (numericValue.length !== 10) {
      setError("El número debe contener 10 dígitos");
      setIsValid(false);
    } else {
      setError("");
      setIsValid(true);
    }

    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numeric input
    const numericValue = validatePhoneNumber(inputValue);

    // Format the phone number as user types
    const formattedValue = numericValue.replace(
      /(\d{3})(\d{3})(\d{4})/,
      "($1) $2-$3"
    );

    onChange(numericValue, numericValue.length === 10);
  };

  useEffect(() => {
    // Validate initial value if exists
    if (value) {
      validatePhoneNumber(value);
    }
  }, [value]);

  return (
    <div className="space-y-1">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Número de teléfono
      </Label>
      <Input
        id="phone"
        type="tel"
        placeholder="(123) 456-7890"
        value={value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
        onChange={handleChange}
        required
        disabled={disabled}
        className={error ? "border-red-500" : ""}
        maxLength={14} // Account for formatting characters
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
