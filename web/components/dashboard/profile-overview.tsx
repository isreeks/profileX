'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface UserProfile {
  address: string;
  username: string;
  rank: string;
  tokenBalance: number;
  avatarUrl: string;
}

interface ProfileOverviewProps {
  userProfile: UserProfile;
}

export function ProfileOverview({ userProfile }: ProfileOverviewProps) {
  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Profile Overview</CardTitle>
        <Avatar>
          <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} />
          <AvatarFallback>{userProfile.username.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-sm font-medium">Wallet Address: {userProfile.address}</p>
            <p className="text-sm font-medium">Username: {userProfile.username}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <Badge variant="secondary" className="mr-2">
              Rank: {userProfile.rank}
            </Badge>
            <Badge variant="outline">Token Balance: {userProfile.tokenBalance}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}