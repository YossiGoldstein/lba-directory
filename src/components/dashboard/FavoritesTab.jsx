import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2, Sparkles } from "lucide-react";
import BusinessResultCard from "../chat/BusinessResultCard";
import { toast } from "sonner";

export default function FavoritesTab({ user }) {
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const allFavorites = await base44.entities.Favorite.list();
      return allFavorites.filter(f => f.user_id === user.id);
    },
    enabled: !!user?.id,
  });

  // Fetch all businesses
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.filter(b => b.status === "approved");
    },
  });

  // Get favorited businesses - deduplicate by business_id
  const uniqueFavorites = favorites.reduce((acc, fav) => {
    if (!acc.find(f => f.business_id === fav.business_id)) {
      acc.push(fav);
    }
    return acc;
  }, []);
  
  const favoriteBusinesses = uniqueFavorites
    .map(fav => allBusinesses.find(b => b.id === fav.business_id))
    .filter(Boolean);

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      await base44.entities.Favorite.delete(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to remove favorite");
    },
  });

  const handleRemoveFavorite = (businessId) => {
    // Remove all matching favorites (handles legacy duplicates too)
    const matching = favorites.filter(f => f.business_id === businessId);
    matching.forEach(fav => removeFavoriteMutation.mutate(fav.id));
  };

  const handleAskAI = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading favorites...</p>
      </div>
    );
  }

  if (favoriteBusinesses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Favorites Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't added any favorites yet. Ask the AI assistant to help you find places you'll love!
          </p>
          <Button
            onClick={handleAskAI}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Ask the AI for recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {favoriteBusinesses.length} Favorite{favoriteBusinesses.length !== 1 ? 's' : ''}
        </h3>
        <Button
          onClick={handleAskAI}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Ask AI for more
        </Button>
      </div>

      {favoriteBusinesses.map((business) => (
        <div key={business.id} className="relative">
          <BusinessResultCard business={business} />
          <Button
            onClick={() => handleRemoveFavorite(business.id)}
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-pink-500 hover:text-pink-700 hover:bg-pink-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}