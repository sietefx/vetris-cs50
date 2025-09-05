import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserPlus, UserCheck, PawPrint } from "lucide-react";

export default function UserProfileCard({ user, profile, pets, isFollowing, onFollow, compact = false }) {
  const handleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow(user.id);
  };

  const profileUrl = `${createPageUrl("UserProfile")}?id=${user.id}`;

  if (compact) {
    return (
      <Link to={profileUrl}>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
              alt={profile?.display_name || user.full_name}
            />
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {(profile?.display_name || user.full_name)[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{profile?.display_name || user.full_name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <PawPrint className="h-3 w-3 mr-1" />
              {pets?.length || 0} {pets?.length === 1 ? 'pet' : 'pets'}
            </div>
          </div>
          <Button 
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={isFollowing ? "h-8 px-2" : "h-8 px-2 bg-purple-700 hover:bg-purple-800"}
            onClick={handleFollow}
          >
            {isFollowing ? (
              <UserCheck className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={profileUrl}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="h-20 bg-gradient-to-r from-purple-100 to-indigo-100"></div>
          <div className="px-4 pb-4 -mt-10">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage
                src={profile?.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                alt={profile?.display_name || user.full_name}
              />
              <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                {(profile?.display_name || user.full_name)[0]}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <h3 className="font-semibold">{profile?.display_name || user.full_name}</h3>
              {profile?.bio && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{profile.bio}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <PawPrint className="h-4 w-4 mr-1" />
                {pets?.length || 0} {pets?.length === 1 ? 'pet' : 'pets'}
              </div>
              
              <Button 
                className={`w-full mt-3 ${isFollowing ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50' : 'bg-purple-700 hover:bg-purple-800'}`}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Seguir
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}