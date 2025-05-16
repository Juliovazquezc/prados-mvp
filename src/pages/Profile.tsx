
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import RequireAuth from "@/components/RequireAuth";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { User, Edit } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { userListings } = useListings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateProfile({
      name,
      phone,
      profileImage,
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };
  
  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow marketplace-container pb-20">
          <section className="py-6 max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Profile
            </h1>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-marketplace-primary to-marketplace-secondary h-32 relative"></div>
              
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
                  <Avatar className="h-24 w-24 border-4 border-white">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback>
                      <User size={40} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-gray-600">{user?.neighborhood}</p>
                  </div>
                  
                  <div className="ml-auto mt-4 sm:mt-0">
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit size={16} className="mr-2" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Edit Profile</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Neighborhood</Label>
                        <Input
                          id="neighborhood"
                          value={user?.neighborhood}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">Neighborhood is fixed</p>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setName(user?.name || "");
                            setPhone(user?.phone || "");
                            setProfileImage(user?.profileImage || "");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Spinner /> : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Tabs defaultValue="listings">
                    <TabsList className="mb-6">
                      <TabsTrigger value="listings">My Listings</TabsTrigger>
                      <TabsTrigger value="info">Account Info</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="listings">
                      {userListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {userListings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
                          <Button asChild>
                            <Link to="/create">Create a Listing</Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="info">
                      <Card className="p-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Name</h3>
                          <p className="text-gray-900">{user?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                          <p className="text-gray-900">{user?.phone}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Neighborhood</h3>
                          <p className="text-gray-900">{user?.neighborhood}</p>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </section>
        </main>
        
        <BottomNavigation />
      </div>
    </RequireAuth>
  );
};

export default Profile;
