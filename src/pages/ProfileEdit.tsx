import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import { streets, houseNumbers } from "@/lib/userAddressConstants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ProfileEdit = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    street: "",
    house_number: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, street, house_number")
        .eq("id", user.id)
        .single();
      if (error) {
        toast.error("Error al cargar el perfil");
      } else if (data) {
        setForm(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);
    if (error) {
      toast.error("Error al guardar los cambios");
    } else {
      toast.success("Perfil actualizado");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Spinner />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSave}
          className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6"
        >
          <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Calle</Label>
            <Select
              value={form.street}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, street: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu calle" />
              </SelectTrigger>
              <SelectContent>
                {streets.map((street) => (
                  <SelectItem key={street} value={street}>
                    {street}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="house_number">Número</Label>
            <Select
              value={form.house_number}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, house_number: value }))
              }
            >
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
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Spinner className="mr-2" /> : null}
            Guardar cambios
          </Button>
        </form>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProfileEdit;
