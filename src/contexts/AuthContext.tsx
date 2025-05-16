
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updatedUser: Partial<User>) => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password",
    phone: "555-123-4567",
    neighborhood: "Sunset Estates",
    profileImage: "/placeholder.svg"
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Create a copy without the password
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        toast({
          title: "Welcome back!",
          description: `Logged in as ${foundUser.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "Email already in use",
        });
        return;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        neighborhood: "Sunset Estates", // Fixed neighborhood for MVP
        profileImage: "/placeholder.svg"
      };
      
      // Add to mock users (this would be a database call in a real app)
      MOCK_USERS.push({...newUser, password});
      
      // Log user in
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Registration successful!",
        description: "Welcome to Neighborhood Marketplace",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateProfile = (updatedUser: Partial<User>) => {
    if (user) {
      const newUserData = { ...user, ...updatedUser };
      setUser(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));
      
      // Update in mock data (this would be a database call in a real app)
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex >= 0) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updatedUser };
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
